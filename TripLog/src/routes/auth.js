const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');

/**
 * @swagger
 * /api/auth/apple:
 *   post:
 *     summary: 애플 로그인
 *     description: 애플 ID 토큰을 검증하고 로그인/회원가입 처리
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idToken
 *             properties:
 *               idToken:
 *                 type: string
 *                 description: 애플에서 받은 ID 토큰
 *               authorizationCode:
 *                 type: string
 *                 description: 인가 코드 (선택)
 *     responses:
 *       200:
 *         description: 로그인 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: 인증 실패
 */
router.post('/apple', authController.appleLogin);

/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     summary: 구글 로그인
 *     description: 구글 ID 토큰을 검증하고 로그인/회원가입 처리
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idToken
 *             properties:
 *               idToken:
 *                 type: string
 *                 description: 구글에서 받은 ID 토큰
 *     responses:
 *       200:
 *         description: 로그인 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: 인증 실패
 */
router.post('/google', authController.googleLogin);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: 로그아웃
 *     description: 현재 사용자 로그아웃 처리
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 로그아웃 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 로그아웃 되었습니다.
 *       401:
 *         description: 인증 필요
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: 토큰 갱신
 *     description: 리프레시 토큰으로 새로운 액세스 토큰 발급
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: 리프레시 토큰
 *     responses:
 *       200:
 *         description: 토큰 갱신 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       401:
 *         description: 유효하지 않은 토큰
 */
router.post('/refresh', authController.refreshToken);

/**
 * @swagger
 * /api/auth/withdraw:
 *   delete:
 *     summary: 회원 탈퇴
 *     description: 계정 삭제 및 SNS 연동 해제
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 탈퇴 완료
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 회원 탈퇴가 완료되었습니다.
 *       401:
 *         description: 인증 필요
 */
router.delete('/withdraw', authenticate, authController.withdraw);

module.exports = router;
