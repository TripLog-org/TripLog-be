const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authenticate } = require('../middlewares/auth');

/**
 * @swagger
 * /api/settings:
 *   get:
 *     summary: 설정 조회
 *     description: 사용자 설정 조회
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 설정 정보
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Settings'
 */
router.get('/', authenticate, settingsController.getSettings);

/**
 * @swagger
 * /api/settings:
 *   put:
 *     summary: 설정 수정
 *     description: 알림, 테마 등 설정 수정
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Settings'
 *     responses:
 *       200:
 *         description: 수정된 설정
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Settings'
 */
router.put('/', authenticate, settingsController.updateSettings);

module.exports = router;
