const express = require('express');
const router = express.Router();
const bookmarkController = require('../controllers/bookmarkController');
const { authenticate } = require('../middlewares/auth');

/**
 * @swagger
 * /api/bookmarks/check/{recommendationId}:
 *   get:
 *     summary: 북마크 상태 확인
 *     description: 특정 추천 여행지의 북마크 상태를 확인합니다
 *     tags: [Bookmarks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: recommendationId
 *         required: true
 *         schema:
 *           type: string
 *         description: 추천 여행지 ID (DB ObjectId 또는 공공 API ID)
 *         example: "2850913"
 *     responses:
 *       200:
 *         description: 북마크 상태 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 recommendationId:
 *                   type: string
 *                   example: "2850913"
 *                 isBookmarked:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */
router.get('/check/:recommendationId', authenticate, bookmarkController.checkBookmark);

/**
 * @swagger
 * /api/bookmarks/toggle:
 *   post:
 *     summary: 북마크 토글 (추가/제거)
 *     description: 추천 여행지를 북마크에 추가하거나 제거합니다. 이미 북마크되어 있으면 제거하고, 없으면 추가합니다.
 *     tags: [Bookmarks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recommendationId
 *             properties:
 *               recommendationId:
 *                 type: string
 *                 description: 추천 여행지 ID (DB ObjectId 또는 공공 API ID)
 *                 example: "2850913"
 *     responses:
 *       201:
 *         description: 북마크 추가 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "북마크가 추가되었습니다"
 *                 isBookmarked:
 *                   type: boolean
 *                   example: true
 *                 bookmarkCount:
 *                   type: integer
 *                   example: 5
 *       200:
 *         description: 북마크 제거 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "북마크가 제거되었습니다"
 *                 isBookmarked:
 *                   type: boolean
 *                   example: false
 *                 bookmarkCount:
 *                   type: integer
 *                   example: 4
 *       400:
 *         description: 필수 파라미터 누락
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */
router.post('/toggle', authenticate, bookmarkController.toggleBookmark);

/**
 * @swagger
 * /api/bookmarks:
 *   get:
 *     summary: 내 북마크 목록 조회
 *     description: 로그인한 사용자의 북마크 목록을 조회합니다 (페이징 지원)
 *     tags: [Bookmarks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: 페이지당 항목 수
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: ["-createdAt", "createdAt", "title", "-title"]
 *           default: "-createdAt"
 *         description: 정렬 기준 (- 접두사는 내림차순)
 *     responses:
 *       200:
 *         description: 북마크 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
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
 *                       example: 5
 *                     totalPages:
 *                       type: integer
 *                       example: 1
 *                 count:
 *                   type: integer
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["2850913", "2850914", "69833ce1819d809ddb3a869b"]
 *       401:
 *         description: 인증 실패
 *       404:
 *         description: 사용자를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 *   delete:
 *     summary: 모든 북마크 삭제
 *     description: 로그인한 사용자의 모든 북마크를 일괄 삭제합니다
 *     tags: [Bookmarks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 모든 북마크 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "모든 북마크가 삭제되었습니다"
 *                 bookmarkCount:
 *                   type: integer
 *                   example: 0
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */
router.get('/', authenticate, bookmarkController.getMyBookmarks);
router.delete('/', authenticate, bookmarkController.clearAllBookmarks);

module.exports = router;
