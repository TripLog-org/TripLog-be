const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middlewares/auth');

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: 내 정보 조회
 *     description: 현재 로그인한 사용자 정보 조회
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 사용자 정보
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: 인증 필요
 *       404:
 *         description: 사용자 없음
 */
router.get('/me', authenticate, userController.getMe);

/**
 * @swagger
 * /api/users/me:
 *   put:
 *     summary: 내 정보 수정
 *     description: 프로필 정보 수정
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: 홍길동
 *               profileImage:
 *                 type: string
 *                 example: https://example.com/image.jpg
 *     responses:
 *       200:
 *         description: 수정된 사용자 정보
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: 인증 필요
 */
router.put('/me', authenticate, userController.updateMe);

/**
 * @swagger
 * /api/users/nickname:
 *   patch:
 *     summary: 닉네임 수정
 *     description: 현재 로그인한 사용자의 닉네임 수정
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nickname
 *             properties:
 *               nickname:
 *                 type: string
 *                 maxLength: 30
 *                 example: 행복한여행자123
 *     responses:
 *       200:
 *         description: 닉네임 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 필요
 *       404:
 *         description: 사용자 없음
 */
router.patch('/nickname', authenticate, userController.updateNickname);

module.exports = router;
