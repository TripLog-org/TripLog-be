const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');

/**
 * @swagger
 * /api/recommendations:
 *   get:
 *     summary: 추천 여행 목록
 *     description: 추천 여행지 목록 조회 (Public)
 *     tags: [Recommendations]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: "카테고리 필터"
 *     responses:
 *       200:
 *         description: 추천 여행 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 category:
 *                   type: string
 *                 recommendations:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get('/', recommendationController.getRecommendations);

/**
 * @swagger
 * /api/recommendations/{id}:
 *   get:
 *     summary: 추천 여행 상세
 *     description: 추천 여행 상세 정보 조회 (Public)
 *     tags: [Recommendations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
