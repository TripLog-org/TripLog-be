const tourApiService = require('../services/tourApiService');

const AREA_CODE_MAP = {
  '서울': 1, '인천': 2, '대전': 3, '대구': 4, '광주': 5,
  '부산': 6, '울산': 7, '세종': 8, '경기': 31, '강원': 32,
  '충북': 33, '충남': 34, '전북': 35, '전남': 36,
  '경북': 37, '경남': 38, '제주': 39,
};

const CONTENT_TYPE_MAP = {
  '관광지': 12, '문화시설': 14, '축제공연행사': 15,
  '여행코스': 25, '레포츠': 28, '숙박': 32, '쇼핑': 38,
};

// A/C/D: 전체 항목 | O/Q/R: 대표이미지 있는 항목만 (각각 A/C/D에 대응)
const VALID_ARRANGE_CODES = ['A', 'C', 'D', 'O', 'Q', 'R'];

exports.getRecommendations = async (req, res, next) => {
  try {
    const { category, region, page = '1', pageSize = '20', arrange } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const numOfRows = Math.max(1, Math.min(100, parseInt(pageSize) || 20));

    const arrangeCode = arrange && VALID_ARRANGE_CODES.includes(arrange.toUpperCase())
      ? arrange.toUpperCase()
      : undefined;

    const areaCode = region ? AREA_CODE_MAP[region] : undefined;
    if (region && !areaCode) {
      return res.status(400).json({ message: '지원하지 않는 지역입니다.' });
    }

    const apiResponse = await tourApiService.getAreaBasedList(areaCode, {
      numOfRows,
      pageNum,
      arrange: arrangeCode,
      contentTypeId: CONTENT_TYPE_MAP[category],
    });

    if (!apiResponse.response?.body?.items?.item) {
      return res.json({
        region: region || null,
        category: category || null,
        arrange: arrangeCode || null,
        pagination: { page: pageNum, pageSize: numOfRows, total: 0, totalPages: 0 },
        count: 0,
        data: [],
      });
    }

    const items = Array.isArray(apiResponse.response.body.items.item)
      ? apiResponse.response.body.items.item
      : [apiResponse.response.body.items.item];

    const data = items.map((item) => ({
      id: item.contentid,
      title: item.title || '',
      region: region || getRegionFromAddress(item.addr1),
      category: getCategoryFromContentTypeId(item.contenttypeid),
      coverImage: item.firstimage || '',
      address: item.addr1 || '',
      telephone: item.tel || '',
    }));

    const totalCount = apiResponse.response?.body?.totalCount || data.length;
    const totalPages = Math.ceil(totalCount / numOfRows);

    res.json({
      region: region || null,
      category: category || null,
      arrange: arrangeCode || null,
      pagination: { page: pageNum, pageSize: numOfRows, total: totalCount, totalPages },
      count: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
};

exports.getRecommendation = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [detailCommon, detailImage] = await Promise.all([
      tourApiService.getDetailCommon(id),
      tourApiService.getDetailImage(id),
    ]);

    let commonInfo = detailCommon.response?.body?.items?.item;
    const images = detailImage.response?.body?.items?.item || [];

    if (Array.isArray(commonInfo)) {
      commonInfo = commonInfo[0];
    }

    if (!commonInfo) {
      return res.status(404).json({ message: '관광정보를 찾을 수 없습니다.' });
    }

    const imageArray = Array.isArray(images) ? images : images ? [images] : [];

    res.json({
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
    });
  } catch (error) {
    next(error);
  }
};

exports.searchRecommendations = async (req, res, next) => {
  try {
    const { keyword, page = '1', pageSize = '20', arrange } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const numOfRows = Math.max(1, Math.min(100, parseInt(pageSize) || 20));

    const arrangeCode = arrange && VALID_ARRANGE_CODES.includes(arrange.toUpperCase())
      ? arrange.toUpperCase()
      : undefined;

    if (!keyword || keyword.trim().length === 0) {
      return res.status(400).json({ message: '검색 키워드를 입력해주세요.' });
    }

    const apiResponse = await tourApiService.searchKeyword(keyword, {
      numOfRows,
      pageNum,
      arrange: arrangeCode,
    });

    if (!apiResponse.response?.body?.items?.item) {
      return res.json({
        keyword,
        arrange: arrangeCode || null,
        pagination: { page: pageNum, pageSize: numOfRows, total: 0, totalPages: 0 },
        count: 0,
        data: [],
      });
    }

    const items = Array.isArray(apiResponse.response.body.items.item)
      ? apiResponse.response.body.items.item
      : [apiResponse.response.body.items.item];

    const data = items.map((item) => ({
      id: item.contentid,
      title: item.title || '',
      category: getCategoryFromContentTypeId(item.contenttypeid),
      region: getRegionFromAddress(item.addr1),
      coverImage: item.firstimage || '',
      address: item.addr1 || '',
      telephone: item.tel || '',
    }));

    const totalCount = apiResponse.response?.body?.totalCount || data.length;
    const totalPages = Math.ceil(totalCount / numOfRows);

    res.json({
      keyword,
      arrange: arrangeCode || null,
      pagination: { page: pageNum, pageSize: numOfRows, total: totalCount, totalPages },
      count: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
};

function getCategoryFromContentTypeId(contentTypeId) {
  const categoryMap = {
    12: '관광지', 14: '문화시설', 15: '축제공연행사',
    25: '여행코스', 28: '레포츠', 32: '숙박', 38: '쇼핑',
  };
  return categoryMap[contentTypeId] || '기타';
}

function getRegionFromAddress(address) {
  if (!address) return '기타';
  const regions = Object.keys(AREA_CODE_MAP);
  for (const region of regions) {
    if (address.includes(region)) return region;
  }
  return '기타';
}
