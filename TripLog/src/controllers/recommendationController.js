const { Recommendation } = require('../models');
const tourApiService = require('../services/tourApiService');

// 한국관광공사 공공 API - 지역코드 맵핑
const AREA_CODE_MAP = {
  '서울': 1,
  '인천': 2,
  '대전': 3,
  '대구': 4,
  '광주': 5,
  '부산': 6,
  '울산': 7,
  '세종': 8,
  '경기': 31,
  '강원': 32,
  '충북': 33,
  '충남': 34,
  '전북': 35,
  '전남': 36,
  '경북': 37,
  '경남': 38,
  '제주': 39,
};

// 추천 여행 목록 조회 (공공 API + DB 통합)
exports.getRecommendations = async (req, res, next) => {
  try {
    const { category, region, usePublicApi, page = '1', pageSize = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const numOfRows = Math.max(1, Math.min(100, parseInt(pageSize) || 20)); // 최대 100

    // 공공 API 사용 여부 결정
    const shouldUsePublicApi = usePublicApi === 'true';

    if (shouldUsePublicApi && region) {
      // 공공 API에서 지역기반 관광정보 조회
      const areaCode = AREA_CODE_MAP[region];
      if (!areaCode) {
        return res.status(400).json({ message: '지원하지 않는 지역입니다.' });
      }

      const apiResponse = await tourApiService.getAreaBasedList(areaCode, {
        numOfRows,
        pageNum,
      });

      if (!apiResponse.response?.body?.items?.item) {
        return res.json({
          source: 'public_api',
          region,
          category: category || null,
          pagination: {
            page: pageNum,
            pageSize: numOfRows,
            total: 0,
            totalPages: 0,
          },
          data: [],
        });
      }

      const items = Array.isArray(apiResponse.response.body.items.item)
        ? apiResponse.response.body.items.item
        : [apiResponse.response.body.items.item];

      // 공공 API 데이터를 추천 포맷으로 변환
      const recommendations = items.map((item) => ({
        id: item.contentid,
        title: item.title || '',
        description: item.overview || '',
        region: region,
        category: getCategoryFromPublicApi(item.contenttypeid),
        coverImage: item.firstimage || '',
        tags: [
          item.contenttypeid ? `타입:${item.contenttypeid}` : null,
          item.addr1 ? item.addr1.split(' ')[0] : null,
        ].filter(Boolean),
        address: item.addr1 || '',
        telephone: item.tel || '',
        source: 'public_api',
      }));

      // 카테고리 필터링 적용
      const filtered = category
        ? recommendations.filter(item => item.category === category)
        : recommendations;

      const totalCount = apiResponse.response?.body?.totalCount || filtered.length;
      const totalPages = Math.ceil(totalCount / numOfRows);

      return res.json({
        source: 'public_api',
        region,
        category: category || null,
        pagination: {
          page: pageNum,
          pageSize: numOfRows,
          total: totalCount,
          totalPages,
        },
        count: filtered.length,
        data: filtered,
      });
    }

    // DB 추천 데이터 조회
    const filter = { isPublished: true };
    if (category) {
      filter.category = category;
    }

    const skip = (pageNum - 1) * numOfRows;
    const total = await Recommendation.countDocuments(filter);
    const recommendations = await Recommendation.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(numOfRows);

    const totalPages = Math.ceil(total / numOfRows);

    res.json({
      source: 'database',
      category: category || null,
      pagination: {
        page: pageNum,
        pageSize: numOfRows,
        total,
        totalPages,
      },
      count: recommendations.length,
      data: recommendations,
    });
  } catch (error) {
    next(error);
  }
};

// 추천 여행 상세 조회
exports.getRecommendation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { usePublicApi } = req.query;

    if (usePublicApi === 'true') {
      // 공공 API에서 상세 정보 조회
      const detailCommon = await tourApiService.getDetailCommon(id);
      const detailImage = await tourApiService.getDetailImage(id);

      const commonInfo = detailCommon.response?.body?.items?.item;
      const images = detailImage.response?.body?.items?.item || [];

      if (!commonInfo) {
        return res.status(404).json({ message: '관광정보를 찾을 수 없습니다.' });
      }

      const imageArray = Array.isArray(images) ? images : images ? [images] : [];

      return res.json({
        id: commonInfo.contentid,
        title: commonInfo.title || '',
        description: commonInfo.overview || '',
        address: commonInfo.addr1 || '',
        telephone: commonInfo.tel || '',
        mapx: commonInfo.mapx || '',
        mapy: commonInfo.mapy || '',
        coverImage: commonInfo.firstimage || '',
        images: imageArray.map((img) => ({
          url: img.originimgurl || '',
          thumbnail: img.smallimgurl || '',
        })),
        source: 'public_api',
      });
    }

    // DB에서 추천 정보 조회
    const recommendation = await Recommendation.findOne({
      _id: id,
      isPublished: true,
    });

    if (!recommendation) {
      return res.status(404).json({ message: '추천 여행을 찾을 수 없습니다.' });
    }

    res.json({
      ...recommendation.toObject(),
      source: 'database',
    });
  } catch (error) {
    next(error);
  }
};

// 키워드로 관광정보 검색 (공공 API)
exports.searchRecommendations = async (req, res, next) => {
  try {
    const { keyword, page = '1', pageSize = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const numOfRows = Math.max(1, Math.min(100, parseInt(pageSize) || 20));

    if (!keyword || keyword.trim().length === 0) {
      return res
        .status(400)
        .json({ message: '검색 키워드를 입력해주세요.' });
    }

    const apiResponse = await tourApiService.searchKeyword(keyword, {
      numOfRows,
      pageNum,
    });

    if (!apiResponse.response?.body?.items?.item) {
      return res.json({
        keyword,
        pagination: {
          page: pageNum,
          pageSize: numOfRows,
          total: 0,
          totalPages: 0,
        },
        data: [],
      });
    }

    const items = Array.isArray(apiResponse.response.body.items.item)
      ? apiResponse.response.body.items.item
      : [apiResponse.response.body.items.item];

    const recommendations = items.map((item) => ({
      id: item.contentid,
      title: item.title || '',
      description: item.overview || '',
      category: getCategoryFromPublicApi(item.contenttypeid),
      region: getRegionFromAddress(item.addr1),
      coverImage: item.firstimage || '',
      address: item.addr1 || '',
      telephone: item.tel || '',
      source: 'public_api',
    }));

    const totalCount = apiResponse.response?.body?.totalCount || recommendations.length;
    const totalPages = Math.ceil(totalCount / numOfRows);

    res.json({
      keyword,
      pagination: {
        page: pageNum,
        pageSize: numOfRows,
        total: totalCount,
        totalPages,
      },
      count: recommendations.length,
      data: recommendations,
    });
  } catch (error) {
    next(error);
  }
};

// 공공 API 카테고리 코드를 우리 카테고리로 변환
function getCategoryFromPublicApi(contentTypeId) {
  const categoryMap = {
    12: '관광지',
    14: '문화시설',
    15: '축제공연행사',
    25: '여행코스',
    28: '레포츠',
    32: '숙박',
    38: '쇼핑',
  };
  return categoryMap[contentTypeId] || '기타';
}

// 주소에서 지역 추출
function getRegionFromAddress(address) {
  if (!address) return '기타';

  const regions = Object.keys(AREA_CODE_MAP);
  for (const region of regions) {
    if (address.includes(region)) {
      return region;
    }
  }

  return '기타';
}
