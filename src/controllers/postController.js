const { Post, User } = require('../models');
const { uploadImageToR2, deleteImages } = require('../utils/imageUtils');
const multer = require('multer');

/**
 * 게시물 응답 변환 헬퍼
 * - likes 배열 제거, isLiked boolean 추가
 * - bookmarks 배열 제거, isBookmarked boolean 추가
 */
const transformPost = (post, userId) => {
  const obj = post.toObject ? post.toObject() : { ...post };
  const uid = userId ? String(userId) : null;
  obj.isLiked = uid ? (obj.likes || []).some(id => String(id) === uid) : false;
  obj.isBookmarked = uid ? (obj.bookmarks || []).some(id => String(id) === uid) : false;
  delete obj.likes;
  delete obj.bookmarks;
  return obj;
};

/**
 * @description zoom level에 따른 반경(km) 계산
 * zoom level이 낮을수록 더 넓은 반경
 */
const getRadiusFromZoomLevel = (zoomLevel) => {
  // zoom level에 따른 대략적인 반경 (km)
  const zoomToRadius = {
    1: 10000,  // 전 세계
    2: 5000,
    3: 2500,
    4: 1250,
    5: 625,
    6: 312,
    7: 156,
    8: 78,
    9: 39,
    10: 20,
    11: 10,
    12: 5,
    13: 2.5,
    14: 1.25,
    15: 0.625,
    16: 0.312,
    17: 0.156,
    18: 0.078,
    19: 0.039,
    20: 0.020,
  };
  
  return zoomToRadius[zoomLevel] || 10; // 기본값 10km
};

/**
 * @description 게시물 생성
 */
exports.createPost = async (req, res) => {
  try {
    const { content, location, tags, visibility, relatedTrip, relatedPlace } = req.body;
    const userId = req.user.userId;

    // 이미지 처리
    const images = [];
    if (req.files && req.files.length > 0) {
      // req.body에서 이미지 메타데이터 파싱
      // imageMeta는 JSON 배열 문자열: [{"latitude": 37.123, "longitude": 127.456, ...}, ...]
      let imageMetadata = [];
      if (req.body.imageMeta) {
        try {
          imageMetadata = typeof req.body.imageMeta === 'string' 
            ? JSON.parse(req.body.imageMeta) 
            : req.body.imageMeta;
        } catch (e) {
          console.error('이미지 메타데이터 파싱 오류:', e);
          imageMetadata = [];
        }
      }

      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];

        // R2에 이미지 업로드 (원본 + 썸네일)
        const { imageUrl, thumbnailUrl } = await uploadImageToR2(
          file.buffer,
          file.originalname,
          file.mimetype
        );

        // 해당 이미지의 메타데이터 가져오기
        const meta = imageMetadata[i] || {};

        const imageObject = {
          url: imageUrl,
          thumbnail: thumbnailUrl || imageUrl,
          order: i,
        };

        // 이미지별 위치 정보 추가
        if (meta.latitude && meta.longitude) {
          imageObject.location = {
            coordinates: {
              latitude: parseFloat(meta.latitude),
              longitude: parseFloat(meta.longitude),
            },
          };
          
          // 위치 이름과 주소가 있으면 추가
          if (meta.locationName) {
            imageObject.location.name = meta.locationName;
          }
          if (meta.address) {
            imageObject.location.address = meta.address;
          }
        }

        // 촬영 시간 추가
        if (meta.capturedAt) {
          imageObject.capturedAt = new Date(meta.capturedAt);
        }

        // 이미지 설명 추가
        if (meta.description) {
          imageObject.description = meta.description;
        }

        images.push(imageObject);
      }
    }

    // 태그 처리 - 문자열 배열 또는 JSON 문자열 모두 지원
    let parsedTags = [];
    if (tags) {
      if (typeof tags === 'string') {
        // JSON 문자열인 경우
        try {
          parsedTags = JSON.parse(tags);
        } catch (e) {
          // 쉼표로 구분된 문자열인 경우
          parsedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        }
      } else if (Array.isArray(tags)) {
        parsedTags = tags;
      }
    }

    // 위치 처리 - JSON 문자열 또는 객체 지원
    let parsedLocation = undefined;
    if (location && location !== '') {
      if (typeof location === 'string') {
        try {
          parsedLocation = JSON.parse(location);
        } catch (e) {
          console.error('위치 파싱 오류:', e);
        }
      } else if (typeof location === 'object') {
        parsedLocation = location;
      }
    }

    // 게시물 생성
    const postData = {
      author: userId,
      content,
      images,
      location: parsedLocation,
      tags: parsedTags,
      visibility: visibility || 'public',
      isPublished: true,
    };

    // relatedTrip과 relatedPlace는 빈 문자열이 아닐 때만 추가
    if (relatedTrip && relatedTrip !== '') {
      postData.relatedTrip = relatedTrip;
    }
    if (relatedPlace && relatedPlace !== '') {
      postData.relatedPlace = relatedPlace;
    }

    const post = new Post(postData);
    await post.save();
    await post.populate('author', 'username email profileImage');

    res.status(201).json({
      success: true,
      data: post,
    });
  } catch (error) {
    // Multer 에러 처리
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: '파일 크기는 10MB를 초과할 수 없습니다.',
        });
      }
      if (error.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          message: '최대 10개의 파일만 업로드 가능합니다.',
        });
      }
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error('게시물 생성 오류:', error);
    res.status(500).json({
      success: false,
      message: '게시물 생성에 실패했습니다.',
      error: error.message,
    });
  }
};

/**
 * @description 피드 조회 (페이지네이션)
 */
exports.getPosts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sort = '-createdAt', 
      tag, 
      search
    } = req.query;
    const userId = req.user?.userId;

    const query = { isPublished: true };

    // 공개 게시물만 또는 본인 게시물 포함
    if (userId) {
      query.$or = [
        { visibility: 'public' },
        { author: userId },
      ];
    } else {
      query.visibility = 'public';
    }

    // 태그 필터
    if (tag) {
      query.tags = tag.toLowerCase();
    }

    // 검색
    if (search) {
      query.content = { $regex: search, $options: 'i' };
    }

    const posts = await Post.find(query)
      .populate('author', 'username email profileImage nickname')
      .populate('relatedTrip', 'title startDate endDate')
      .populate('relatedPlace', 'name location')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Post.countDocuments(query);

    const transformedPosts = posts.map(post => transformPost(post, userId));

    res.json({
      success: true,
      data: transformedPosts,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    console.error('피드 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '피드 조회에 실패했습니다.',
      error: error.message,
    });
  }
};

/**
 * @description 지도용 게시물 조회 (사진 기반)
 * 게시물의 각 사진을 개별 항목으로 펼쳐서 반환
 */
exports.getPostsForMap = async (req, res) => {
  try {
    const { 
      latitude,
      longitude,
      zoomLevel,
      tag,
      limit = 100, // 지도에서는 많은 항목을 한번에 가져옴
    } = req.query;
    const userId = req.user?.userId;

    const query = { isPublished: true };

    // 공개 게시물만 또는 본인 게시물 포함
    if (userId) {
      query.$or = [
        { visibility: 'public' },
        { author: userId },
      ];
    } else {
      query.visibility = 'public';
    }

    // 태그 필터
    if (tag) {
      query.tags = tag.toLowerCase();
    }

    // 위치 정보가 있는 이미지만 포함된 게시물
    query['images.location.coordinates'] = { $exists: true };

    // 위치 기반 필터링 (필수)
    if (latitude && longitude && zoomLevel) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      const zoom = parseInt(zoomLevel);
      
      if (!isNaN(lat) && !isNaN(lng) && !isNaN(zoom)) {
        // zoom level에 따른 반경 계산 (km)
        const radiusKm = getRadiusFromZoomLevel(zoom);

        query.$and = query.$and || [];
        query.$and.push({
          $or: [
            {
              'images.location.coordinates.latitude': {
                $gte: lat - (radiusKm / 111),
                $lte: lat + (radiusKm / 111)
              },
              'images.location.coordinates.longitude': {
                $gte: lng - (radiusKm / (111 * Math.cos(lat * Math.PI / 180))),
                $lte: lng + (radiusKm / (111 * Math.cos(lat * Math.PI / 180)))
              }
            }
          ]
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: '위치 정보(latitude, longitude, zoomLevel)가 필요합니다.',
      });
    }

    const posts = await Post.find(query)
      .select('_id images author createdAt')
      .populate('author', 'username profileImage')
      .limit(limit * 1)
      .sort('-createdAt')
      .exec();

    // 게시물의 각 사진을 개별 항목으로 펼치기
    const photoItems = [];
    
    for (const post of posts) {
      // author가 없는 경우 건너뛰기 (삭제된 사용자 등)
      if (!post.author) {
        continue;
      }

      // 위치 정보가 있는 이미지만 필터링
      const photosWithLocation = post.images.filter(
        img => img.location && img.location.coordinates && 
               img.location.coordinates.latitude && 
               img.location.coordinates.longitude
      );

      for (const image of photosWithLocation) {
        photoItems.push({
          postId: post._id,
          photo: {
            url: image.url,
            thumbnail: image.thumbnail || image.url,
            location: {
              name: image.location.name,
              coordinates: {
                latitude: image.location.coordinates.latitude,
                longitude: image.location.coordinates.longitude,
              },
              address: image.location.address,
            },
            capturedAt: image.capturedAt,
            description: image.description,
          },
          author: {
            _id: post.author._id,
            username: post.author.username,
            profileImage: post.author.profileImage,
          },
          createdAt: post.createdAt,
        });
      }
    }

    res.json({
      success: true,
      data: photoItems,
      total: photoItems.length,
    });
  } catch (error) {
    console.error('지도용 피드 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '지도용 피드 조회에 실패했습니다.',
      error: error.message,
    });
  }
};

/**
 * @description 특정 게시물 조회
 */
exports.getPost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const post = await Post.findById(id)
      .populate('author', 'username email profileImage nickname')
      .populate('relatedTrip', 'title startDate endDate')
      .populate('relatedPlace', 'name location');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: '게시물을 찾을 수 없습니다.',
      });
    }

    // 권한 체크
    if (post.visibility === 'private' && post.author._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: '이 게시물을 볼 권한이 없습니다.',
      });
    }

    // 조회수 증가
    post.viewCount += 1;
    await post.save();

    res.json({
      success: true,
      data: transformPost(post, userId),
    });
  } catch (error) {
    console.error('게시물 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '게시물 조회에 실패했습니다.',
      error: error.message,
    });
  }
};

/**
 * @description 내 게시물 조회
 */
exports.getMyPosts = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const posts = await Post.find({ author: userId, isPublished: true })
      .populate('relatedTrip', 'title startDate endDate')
      .populate('relatedPlace', 'name location')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Post.countDocuments({ author: userId, isPublished: true });

    const transformedPosts = posts.map(post => transformPost(post, userId));

    res.json({
      success: true,
      data: transformedPosts,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    console.error('내 게시물 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '게시물 조회에 실패했습니다.',
      error: error.message,
    });
  }
};

/**
 * @description 게시물 수정
 */
exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { content, location, tags, visibility } = req.body;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: '게시물을 찾을 수 없습니다.',
      });
    }

    // 권한 체크
    if (post.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: '게시물을 수정할 권한이 없습니다.',
      });
    }

    // 업데이트
    if (content !== undefined) post.content = content;
    if (location !== undefined) post.location = JSON.parse(location);
    if (tags !== undefined) post.tags = JSON.parse(tags);
    if (visibility !== undefined) post.visibility = visibility;

    await post.save();
    await post.populate('author', 'username email profileImage');

    res.json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error('게시물 수정 오류:', error);
    res.status(500).json({
      success: false,
      message: '게시물 수정에 실패했습니다.',
      error: error.message,
    });
  }
};

/**
 * @description 게시물 삭제
 */
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: '게시물을 찾을 수 없습니다.',
      });
    }

    // 권한 체크
    if (post.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: '게시물을 삭제할 권한이 없습니다.',
      });
    }

    // 이미지 삭제
    if (post.images && post.images.length > 0) {
      const imagePaths = [];
      post.images.forEach((img) => {
        imagePaths.push(img.url);
        if (img.thumbnail && img.thumbnail !== img.url) {
          imagePaths.push(img.thumbnail);
        }
      });
      await deleteImages(imagePaths);
    }

    await post.deleteOne();

    res.json({
      success: true,
      message: '게시물이 삭제되었습니다.',
    });
  } catch (error) {
    console.error('게시물 삭제 오류:', error);
    res.status(500).json({
      success: false,
      message: '게시물 삭제에 실패했습니다.',
      error: error.message,
    });
  }
};

/**
 * @description 게시물 좋아요
 */
exports.likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: '게시물을 찾을 수 없습니다.',
      });
    }

    // 이미 좋아요한 경우
    if (post.likes.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: '이미 좋아요한 게시물입니다.',
      });
    }

    post.likes.push(userId);
    post.likeCount += 1;
    await post.save();

    res.json({
      success: true,
      data: {
        likeCount: post.likeCount,
      },
    });
  } catch (error) {
    console.error('좋아요 오류:', error);
    res.status(500).json({
      success: false,
      message: '좋아요에 실패했습니다.',
      error: error.message,
    });
  }
};

/**
 * @description 게시물 좋아요 취소
 */
exports.unlikePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: '게시물을 찾을 수 없습니다.',
      });
    }

    // 좋아요하지 않은 경우
    if (!post.likes.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: '좋아요하지 않은 게시물입니다.',
      });
    }

    post.likes = post.likes.filter((id) => id.toString() !== userId);
    post.likeCount = Math.max(0, post.likeCount - 1);
    await post.save();

    res.json({
      success: true,
      data: {
        likeCount: post.likeCount,
      },
    });
  } catch (error) {
    console.error('좋아요 취소 오류:', error);
    res.status(500).json({
      success: false,
      message: '좋아요 취소에 실패했습니다.',
      error: error.message,
    });
  }
};

/**
 * @description 게시물 북마크
 */
exports.bookmarkPost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: '게시물을 찾을 수 없습니다.',
      });
    }

    // 이미 북마크한 경우
    if (post.bookmarks.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: '이미 북마크한 게시물입니다.',
      });
    }

    post.bookmarks.push(userId);
    post.bookmarkCount += 1;
    await post.save();

    res.json({
      success: true,
      data: {
        bookmarkCount: post.bookmarkCount,
        isBookmarked: true,
      },
    });
  } catch (error) {
    console.error('북마크 오류:', error);
    res.status(500).json({
      success: false,
      message: '북마크에 실패했습니다.',
      error: error.message,
    });
  }
};

/**
 * @description 게시물 북마크 취소
 */
exports.unbookmarkPost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: '게시물을 찾을 수 없습니다.',
      });
    }

    // 북마크하지 않은 경우
    if (!post.bookmarks.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: '북마크하지 않은 게시물입니다.',
      });
    }

    post.bookmarks = post.bookmarks.filter((id) => id.toString() !== userId);
    post.bookmarkCount = Math.max(0, post.bookmarkCount - 1);
    await post.save();

    res.json({
      success: true,
      data: {
        bookmarkCount: post.bookmarkCount,
        isBookmarked: false,
      },
    });
  } catch (error) {
    console.error('북마크 취소 오류:', error);
    res.status(500).json({
      success: false,
      message: '북마크 취소에 실패했습니다.',
      error: error.message,
    });
  }
};
