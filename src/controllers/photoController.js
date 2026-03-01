const { Photo, Place } = require('../models');
const { deleteImages } = require('../utils/imageUtils');
const { getPresignedUrl, getKeyFromUrl } = require('../utils/r2Storage');

// 장소별 사진 목록 조회 (Public)
exports.getPhotosByPlace = async (req, res, next) => {
  try {
    const place = await Place.findById(req.params.placeId);

    if (!place) {
      return res.status(404).json({ message: '장소를 찾을 수 없습니다.' });
    }

    const photos = await Photo.find({ place: req.params.placeId })
      .sort({ order: 1 });

    const signedPhotos = [];
    for (const photo of photos) {
      const obj = photo.toObject ? photo.toObject() : { ...photo };
      const urlKey = getKeyFromUrl(obj.url);
      const thumbKey = getKeyFromUrl(obj.thumbnailUrl || obj.url);

      if (urlKey) obj.url = await getPresignedUrl(urlKey);
      if (thumbKey) obj.thumbnailUrl = await getPresignedUrl(thumbKey);

      signedPhotos.push(obj);
    }

    res.json(signedPhotos);
  } catch (error) {
    next(error);
  }
};

// 사진 상세 조회 (Public)
exports.getPhoto = async (req, res, next) => {
  try {
    const photo = await Photo.findById(req.params.photoId)
      .populate({
        path: 'place',
        populate: { path: 'trip' },
      });

    if (!photo) {
      return res.status(404).json({ message: '사진을 찾을 수 없습니다.' });
    }

    const obj = photo.toObject ? photo.toObject() : { ...photo };
    const urlKey = getKeyFromUrl(obj.url);
    const thumbKey = getKeyFromUrl(obj.thumbnailUrl || obj.url);

    if (urlKey) obj.url = await getPresignedUrl(urlKey);
    if (thumbKey) obj.thumbnailUrl = await getPresignedUrl(thumbKey);

    res.json(obj);
  } catch (error) {
    next(error);
  }
};

// 사진 업로드
exports.createPhoto = async (req, res, next) => {
  try {
    const { url, thumbnailUrl, caption, takenAt } = req.body;

    const place = await Place.findById(req.params.placeId).populate('trip');

    if (!place) {
      return res.status(404).json({ message: '장소를 찾을 수 없습니다.' });
    }

    if (place.trip.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: '접근 권한이 없습니다.' });
    }

    // 순서 계산
    const lastPhoto = await Photo.findOne({ place: req.params.placeId })
      .sort({ order: -1 });
    const order = lastPhoto ? lastPhoto.order + 1 : 0;

    const photo = await Photo.create({
      place: req.params.placeId,
      url,
      thumbnailUrl,
      caption,
      takenAt,
      order,
    });

    res.status(201).json(photo);
  } catch (error) {
    next(error);
  }
};

// 사진 삭제
exports.deletePhoto = async (req, res, next) => {
  try {
    const photo = await Photo.findById(req.params.photoId)
      .populate({
        path: 'place',
        populate: { path: 'trip' },
      });

    if (!photo) {
      return res.status(404).json({ message: '사진을 찾을 수 없습니다.' });
    }

    if (photo.place.trip.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: '접근 권한이 없습니다.' });
    }

    await photo.deleteOne();

    // R2에서 파일 삭제
    const urlsToDelete = [photo.url];
    if (photo.thumbnailUrl) {
      urlsToDelete.push(photo.thumbnailUrl);
    }
    await deleteImages(urlsToDelete);

    res.json({ message: '사진이 삭제되었습니다.' });
  } catch (error) {
    next(error);
  }
};
