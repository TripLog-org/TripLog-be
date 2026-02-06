const express = require('express');
const router = express.Router();
const placeController = require('../controllers/placeController');
const photoController = require('../controllers/photoController');
const { authenticate } = require('../middlewares/auth');

/**
 * @swagger
 * /api/places/search:
 *   get:
 *     summary: 장소 검색
 *     description: 지도 기반 장소 검색 (Public)
 *     tags: [Places]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: 검색어
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *         description: 위도
 *       - in: query
 *         name: lng
 *         schema:
 *           type: number
 *         description: 경도
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *         description: 검색 반경 (미터)
 *     responses:
 *       200:
 *         description: 검색 결과
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 query:
 *                   type: string
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get('/search', placeController.searchPlaces);

/**
 * @swagger
 * /api/places/{placeId}:
 *   get:
 *     summary: 장소 상세 조회
 *     description: 특정 장소 상세 정보 조회 (Public)
 *     tags: [Places]
 *     parameters:
 *       - in: path
 *         name: placeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 장소 상세 정보
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Place'
 *       404:
 *         description: 장소 없음
 */
router.get('/:placeId', placeController.getPlace);

/**
 * @swagger
 * /api/places/{placeId}:
 *   put:
 *     summary: 장소 수정
 *     description: 장소 정보 수정
 *     tags: [Places]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: placeId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               address:
 *                 type: string
 *               location:
 *                 type: object
 *               visitedAt:
 *                 type: string
 *                 format: date-time
 *               order:
 *                 type: integer
 *     responses:
 *       200:
 *         description: 수정된 장소
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Place'
 */
router.put('/:placeId', authenticate, placeController.updatePlace);

/**
 * @swagger
 * /api/places/{placeId}:
 *   delete:
 *     summary: 장소 삭제
 *     description: 장소 및 관련 사진 삭제
 *     tags: [Places]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: placeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 삭제 완료
 *       404:
 *         description: 장소 없음
 */
router.delete('/:placeId', authenticate, placeController.deletePlace);

/**
 * @swagger
 * /api/places/{placeId}/photos:
 *   get:
 *     summary: 장소별 사진 목록
 *     description: 특정 장소의 모든 사진 조회 (Public)
 *     tags: [Photos]
 *     parameters:
 *       - in: path
 *         name: placeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 사진 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Photo'
 */
router.get('/:placeId/photos', photoController.getPhotosByPlace);

/**
 * @swagger
 * /api/places/{placeId}/photos:
 *   post:
 *     summary: 사진 업로드
 *     description: 장소에 새 사진 추가
 *     tags: [Photos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: placeId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *                 example: https://example.com/photo.jpg
 *               thumbnailUrl:
 *                 type: string
 *                 example: https://example.com/thumb.jpg
 *               caption:
 *                 type: string
 *                 example: 멋진 풍경
 *               takenAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: 생성된 사진
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Photo'
 */
router.post('/:placeId/photos', authenticate, photoController.createPhoto);

module.exports = router;
