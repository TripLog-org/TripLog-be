const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');

/**
 * @swagger
 * /api/recommendations:
 *   get:
 *     summary: 추천 여행 목록
 *     description: |
 *       추천 여행지 목록 조회 (Public)
 *       - usePublicApi=true 시 한국관광공사 공공 API 사용
 *       - usePublicApi가 없으면 DB의 추천 데이터 반환
 *     tags: [Recommendations]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum:
 *             - "관광지"
 *             - "문화시설"
 *             - "축제공연행사"
 *             - "여행코스"
 *             - "레포츠"
 *             - "숙박"
 *             - "쇼핑"
 *             - "산"
 *             - "바다"
 *             - "도시"
 *         description: "카테고리 필터 (공공 API: 관광지,문화시설 등 / DB: 산,바다,도시)"
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *           enum:
 *             - "서울"
 *             - "인천"
 *             - "대전"
 *             - "대구"
 *             - "광주"
 *             - "부산"
 *             - "울산"
 *             - "세종"
 *             - "경기"
 *             - "강원"
 *             - "충북"
 *             - "충남"
 *             - "전북"
 *             - "전남"
 *             - "경북"
 *             - "경남"
 *             - "제주"
 *         description: "지역 (공공 API 사용 시 필수)"
 *       - in: query
 *         name: usePublicApi
 *         schema:
 *           type: string
 *           enum:
 *             - "true"
 *             - "false"
 *         description: "한국관광공사 공공 API 사용 여부"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: "페이지 번호 (기본값: 1)"
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: "한 페이지에 표시할 항목 수 (기본값: 20, 최대: 100)"
 *     responses:
 *       200:
 *         description: 추천 여행 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 source:
 *                   type: string
 *                   example: "public_api 또는 database"
 *                 region:
 *                   type: string
 *                 category:
 *                   type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     pageSize:
 *                       type: integer
 *                       example: 20
 *                     total:
 *                       type: integer
 *                       description: "전체 항목 수"
 *                     totalPages:
 *                       type: integer
 *                       description: "전체 페이지 수"
 *                 count:
 *                   type: number
 *                   description: "현재 페이지의 항목 수"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get('/', recommendationController.getRecommendations);

/**
 * @swagger
 * /api/recommendations/search:
 *   get:
 *     summary: 관광정보 키워드 검색
 *     description: 한국관광공사 공공 API를 이용한 관광정보 키워드 검색 (Public)
 *     tags: [Recommendations]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         required: true
 *         schema:
 *           type: string
 *         description: "검색 키워드 (예: 서울, 제주 관광지)"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: "페이지 번호 (기본값: 1)"
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: "한 페이지에 표시할 항목 수 (기본값: 20, 최대: 100)"
 *     responses:
 *       200:
 *         description: 검색 결과
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 keyword:
 *                   type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     pageSize:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                 count:
 *                   type: number
 *                 data:
 *                   type: array
 *       400:
 *         description: 키워드 입력 필요
 */
router.get('/search', recommendationController.searchRecommendations);

/**
 * @swagger
 * /api/recommendations/{id}:
 *   get:
 *     summary: 추천 여행 상세
 *     description: |
 *       추천 여행 상세 정보 조회 (Public)
 *       - usePublicApi=true 시 공공 API에서 상세 정보 조회
 *       - 없으면 DB 추천 데이터 반환
 *     tags: [Recommendations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: "추천 여행 ID 또는 공공 API contentId"
 *       - in: query
 *         name: usePublicApi
 *         schema:
 *           type: boolean
 *         description: "한국관광공사 공공 API 사용 여부"
 *     responses:
 *       200:
 *         description: 추천 여행 상세
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: 추천 여행 없음
 */
router.get('/:id', recommendationController.getRecommendation);

module.exports = router;
