const axios = require('axios');

const TOUR_API_BASE_URL = 'https://apis.data.go.kr/B551011/KorService2';
// API 키를 디코드된 형태로 저장 (axios가 인코딩 처리)
let TOUR_API_KEY = decodeURIComponent(process.env.TOUR_API_KEY || '');

console.log('[Tour API Service] API Key loaded:', TOUR_API_KEY ? 'YES (decoded)' : 'NO');

/**
 * 공공 API - 지역기반 관광정보 조회
 * @param {number} areaCode - 지역코드 (1-39)
 * @param {number} sigunguCode - 시군구코드 (선택사항)
 * @param {number} pageNum - 페이지 번호 (기본값: 1)
 * @param {number} numOfRows - 한 페이지에 출력되는 데이터 개수 (기본값: 10, 최대: 100)
 * @param {string} contentTypeId - 관광타입 코드 (예: 12=관광지, 14=문화시설, 15=축제공연행사, 25=여행코스, 28=레포츠, 32=숙박, 38=쇼핑)
 * @returns {Promise<Object>} API 응답 데이터
 */
exports.getAreaBasedList = async (areaCode, options = {}) => {
  try {
    const params = {
      serviceKey: TOUR_API_KEY,
      numOfRows: options.numOfRows || 20,
      pageNo: options.pageNum || 1,
      MobileOS: 'ETC',
      MobileApp: 'TripLogApp',
      _type: 'json',
    };

    if (areaCode) {
      params.areaCode = areaCode;
    }

    if (options.sigunguCode) {
      params.sigunguCode = options.sigunguCode;
    }

    if (options.contentTypeId) {
      params.contentTypeId = options.contentTypeId;
    }

    console.log('[Tour API] Requesting areaBasedList with params:', params);
    
    const response = await axios.get(
      `${TOUR_API_BASE_URL}/areaBasedList2`,
      { params }
    );

    console.log('[Tour API] Response status:', response.status);
    return response.data;
  } catch (error) {
    console.error('Tour API Error:', error.message);
    console.error('Error status:', error.response?.status);
    console.error('Error data:', error.response?.data);
    console.error('Full URL:', error.config?.url);
    console.error('Request params:', error.config?.params);
    throw new Error(`공공 API 요청 실패: ${error.message}`);
  }
};

/**
 * 공공 API - 키워드 검색
 * @param {string} keyword - 검색 키워드
 * @param {Object} options - 추가 옵션
 * @returns {Promise<Object>} API 응답 데이터
 */
exports.searchKeyword = async (keyword, options = {}) => {
  try {
    const params = {
      serviceKey: TOUR_API_KEY,
      keyword,
      numOfRows: options.numOfRows || 20,
      pageNo: options.pageNum || 1,
      MobileOS: 'ETC',
      MobileApp: 'TripLogApp',
      _type: 'json',
    };

    if (options.contentTypeId) {
      params.contentTypeId = options.contentTypeId;
    }

    const response = await axios.get(
      `${TOUR_API_BASE_URL}/searchKeyword2`,
      { params }
    );

    return response.data;
  } catch (error) {
    console.error('Tour API Error:', error.message);
    console.error('Error details:', error.response?.data || error.response?.status);
    throw new Error(`키워드 검색 실패: ${error.message}`);
  }
};

/**
 * 공공 API - 상세 정보 조회 (공통정보)
 * @param {string} contentId - 관광정보의 고유ID
 * @returns {Promise<Object>} API 응답 데이터
 */
exports.getDetailCommon = async (contentId) => {
  try {
    const params = {
      serviceKey: TOUR_API_KEY,
      contentId,
      MobileOS: 'ETC',
      MobileApp: 'TripLogApp',
      _type: 'json',
    };

    console.log('[Tour API] Requesting detailCommon with params:', params);

    const response = await axios.get(
      `${TOUR_API_BASE_URL}/detailCommon2`,
      { params }
    );

    console.log('[Tour API] detailCommon response:', JSON.stringify(response.data).substring(0, 500));
    return response.data;
  } catch (error) {
    console.error('Tour API Error:', error.message);
    console.error('Error details:', error.response?.data || error.response?.status);
    throw new Error(`상세 정보 조회 실패: ${error.message}`);
  }
};

/**
 * 공공 API - 이미지 정보 조회
 * @param {string} contentId - 관광정보의 고유ID
 * @returns {Promise<Object>} API 응답 데이터
 */
exports.getDetailImage = async (contentId) => {
  try {
    const params = {
      serviceKey: TOUR_API_KEY,
      contentId,
      imageYN: 'Y',
      MobileOS: 'ETC',
      MobileApp: 'TripLogApp',
      _type: 'json',
    };

    const response = await axios.get(
      `${TOUR_API_BASE_URL}/detailImage2`,
      { params }
    );

    return response.data;
  } catch (error) {
    console.error('Tour API Error:', error.message);
    console.error('Error details:', error.response?.data || error.response?.status);
    throw new Error(`이미지 조회 실패: ${error.message}`);
  }
};

/**
 * 공공 API - 지역코드 조회
 * @returns {Promise<Object>} API 응답 데이터
 */
exports.getAreaCode = async () => {
  try {
    const params = {
      serviceKey: TOUR_API_KEY,
      numOfRows: 1000,
      MobileOS: 'ETC',
      MobileApp: 'TripLogApp',
      _type: 'json',
    };

    const response = await axios.get(
      `${TOUR_API_BASE_URL}/areaCode2`,
      { params }
    );

    return response.data;
  } catch (error) {
    console.error('Tour API Error:', error.message);
    console.error('Error details:', error.response?.data || error.response?.status);
    throw new Error(`지역코드 조회 실패: ${error.message}`);
  }
};

/**
 * 공공 API - 서비스분류코드 조회
 * @returns {Promise<Object>} API 응답 데이터
 */
exports.getCategoryCode = async () => {
  try {
    const params = {
      serviceKey: TOUR_API_KEY,
      numOfRows: 1000,
      MobileOS: 'ETC',
      MobileApp: 'TripLogApp',
      _type: 'json',
    };

    const response = await axios.get(
      `${TOUR_API_BASE_URL}/categoryCode2`,
      { params }
    );

    return response.data;
  } catch (error) {
    console.error('Tour API Error:', error.message);
    console.error('Error details:', error.response?.data || error.response?.status);
    throw new Error(`카테고리코드 조회 실패: ${error.message}`);
  }
};
