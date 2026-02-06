const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const placeController = require('../controllers/placeController');
const { authenticate } = require('../middlewares/auth');

/**
 * @swagger
 * /api/trips:
 *   get:
 *     summary: 여행 목록 조회
 *     description: 전체 여행 목록 조회 (Public)
 *     tags: [Trips]
 *     responses:
 *       200:
 *         description: 여행 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Trip'
 */
router.get('/', tripController.getTrips);

/**
 * @swagger
 * /api/trips/{tripId}:
 *   get:
 *     summary: 여행 상세 조회
 *     description: 특정 여행 상세 정보 조회 (Public)
 *     tags: [Trips]
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *         description: 여행 ID
 *     responses:
 *       200:
 *         description: 여행 상세 정보
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Trip'
 *       404:
 *         description: 여행 없음
 */
router.get('/:tripId', tripController.getTrip);

/**
 * @swagger
 * /api/trips:
 *   post:
 *     summary: 여행 생성
 *     description: 새 여행 추가
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: 제주도 여행
 *               description:
 *                 type: string
 *                 example: 가족과 함께한 제주도 여행
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: '2026-01-01'
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: '2026-01-05'
 *               coverImage:
 *                 type: string
 *                 example: https://example.com/cover.jpg
 *     responses:
 *       201:
 *         description: 생성된 여행
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Trip'
 */
router.post('/', authenticate, tripController.createTrip);

/**
 * @swagger
 * /api/trips/{tripId}:
 *   put:
 *     summary: 여행 수정
 *     description: 여행 정보 수정
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: 수정된 여행
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Trip'
 *       404:
 *         description: 여행 없음
 */
router.put('/:tripId', authenticate, tripController.updateTrip);

/**
 * @swagger
 * /api/trips/{tripId}:
 *   delete:
 *     summary: 여행 삭제
 *     description: 여행 및 관련 데이터 삭제
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 삭제 완료
 *       404:
 *         description: 여행 없음
 */
router.delete('/:tripId', authenticate, tripController.deleteTrip);

/**
 * @swagger
 * /api/trips/{tripId}/cover:
 *   put:
 *     summary: 대표 이미지 설정
 *     description: 여행 대표 이미지 지정
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
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
 *               - coverImage
 *             properties:
 *               coverImage:
 *                 type: string
 *                 example: https://example.com/cover.jpg
 *     responses:
 *       200:
 *         description: 수정된 여행
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Trip'
 */
router.put('/:tripId/cover', authenticate, tripController.setCoverImage);

/**
 * @swagger
 * /api/trips/{tripId}/places:
 *   get:
 *     summary: 여행 내 장소 목록
 *     description: 특정 여행의 모든 장소 조회 (Public)
 *     tags: [Places]
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 장소 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Place'
 */
router.get('/:tripId/places', placeController.getPlacesByTrip);

/**
 * @swagger
 * /api/trips/{tripId}/places:
 *   post:
 *     summary: 장소 추가
 *     description: 여행에 새 장소 추가
 *     tags: [Places]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
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
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: 성산일출봉
 *               description:
 *                 type: string
 *                 example: 일출 명소
 *               address:
 *                 type: string
 *                 example: 제주특별자치도 서귀포시 성산읍
 *               location:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     example: Point
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: number
 *                     example: [126.9423, 33.4580]
 *               visitedAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: 생성된 장소
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Place'
 */
router.post('/:tripId/places', authenticate, placeController.createPlace);

module.exports = router;
