const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');

/**
 * @swagger
 * /api/recommendations:
 *   get:
 *     summary: 추천 여행 목록
 *     description: |
 *       한국관광공사 공공 API 기반 관광정보 목록 조회 (Public)
 *       - region 미입력 시 전국 데이터 반환
 *       - category 입력 시 해당 관광타입만 필터링하여 조회
 *     tags: [Recommendations]
 *     parameters:
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
 *         description: "지역 필터 (미입력 시 전국 조회)"
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
 *         description: "관광타입 필터"
 *       - in: query
 *         name: arrange
 *         schema:
 *           type: string
 *           enum:
 *             - "A"
 *             - "C"
 *             - "D"
 *             - "O"
 *             - "Q"
 *             - "R"
 *         description: |
 *           정렬 기준 (기본값: C)
 *           - A: 제목순
 *           - C: 수정일순 (기본값)
 *           - D: 등록일순
 *           - O: 제목순 (대표이미지 있는 항목만)
 *           - Q: 수정일순 (대표이미지 있는 항목만)
 *           - R: 등록일순 (대표이미지 있는 항목만)
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
 *                 region:
 *                   type: string
 *                   nullable: true
 *                   example: "제주"
 *                 category:
 *                   type: string
 *                   nullable: true
 *                   example: "관광지"
 *                 arrange:
 *                   type: string
 *                   nullable: true
 *                   example: "Q"
 *                   description: "적용된 정렬 기준 (null이면 공공 API 기본값 적용)"
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
 *                   type: integer
 *                   description: "현재 페이지의 항목 수"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "2850913"
 *                       title:
 *                         type: string
 *                       region:
 *                         type: string
 *                       category:
 *                         type: string
 *                       coverImage:
 *                         type: string
 *                       address:
 *                         type: string
 *                       telephone:
 *                         type: string
 *       400:
 *         description: 지원하지 않는 지역
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
 *         name: arrange
 *         schema:
 *           type: string
 *           enum:
 *             - "A"
 *             - "C"
 *             - "D"
 *             - "O"
 *             - "Q"
 *             - "R"
 *         description: |
 *           정렬 기준 (기본값: C)
 *           - A: 제목순
 *           - C: 수정일순 (기본값)
 *           - D: 등록일순
 *           - O: 제목순 (대표이미지 있는 항목만)
 *           - Q: 수정일순 (대표이미지 있는 항목만)
 *           - R: 등록일순 (대표이미지 있는 항목만)
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
 *                 arrange:
 *                   type: string
 *                   nullable: true
 *                   example: "A"
 *                   description: "적용된 정렬 기준 (null이면 공공 API 기본값 적용)"
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
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       category:
 *                         type: string
 *                       region:
 *                         type: string
 *                       coverImage:
 *                         type: string
 *                       address:
 *                         type: string
 *                       telephone:
 *                         type: string
 *       400:
 *         description: 키워드 입력 필요
 */
router.get('/search', recommendationController.searchRecommendations);

/**
 * @swagger
 * /api/recommendations/{id}:
 *   get:
 *     summary: 추천 여행 상세
 *     description: 한국관광공사 공공 API 기반 관광정보 상세 조회 (Public)
 *     tags: [Recommendations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: "공공 API contentId (예: 2850913)"
 *     responses:
 *       200:
 *         description: 관광정보 상세
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 address:
 *                   type: string
 *                 telephone:
 *                   type: string
 *                 mapx:
 *                   type: string
 *                 mapy:
 *                   type: string
 *                 coverImage:
 *                   type: string
 *                 images:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       url:
 *                         type: string
 *                       thumbnail:
 *                         type: string
 *       404:
 *         description: 관광정보 없음
 */
router.get('/:id', recommendationController.getRecommendation);

module.exports = router;
