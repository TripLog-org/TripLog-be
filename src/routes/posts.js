const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');
const { authenticate } = require('../middlewares/auth');
const { upload } = require('../middlewares/upload');

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: 게시물 관리 API
 */

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: 게시물 생성
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: 게시물 내용
 *                 example: 부산 여행 너무 좋았어요!
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: 이미지 파일들 (최대 10개, 각 10MB 이하)
 *               imageMeta:
 *                 type: string
 *                 description: 각 이미지의 메타데이터 (JSON 배열 문자열)
 *                 example: '[{"latitude":37.27652,"longitude":127.00852,"locationName":"부산 해운대","capturedAt":"2026-02-05T12:00:00Z"},{"latitude":37.27700,"longitude":127.00900}]'
 *               tags:
 *                 type: string
 *                 description: 태그 (쉼표로 구분 또는 JSON 배열)
 *                 example: 부산,여행,맛집
 *               location:
 *                 type: string
 *                 description: 게시물 위치 정보 (JSON 형식, 선택)
 *               visibility:
 *                 type: string
 *                 enum: [public, friends, private]
 *                 description: 공개 범위
 *                 example: public
 *               relatedTrip:
 *                 type: string
 *                 description: 관련 여행 ID (선택)
 *               relatedPlace:
 *                 type: string
 *                 description: 관련 장소 ID (선택)
 *     responses:
 *       201:
 *         description: 게시물 생성 성공
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */
router.post('/', authenticate, upload.array('images', 10), postController.createPost);

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: 피드 조회 (그리드형 UI용)
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 페이지당 게시물 수
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: -createdAt
 *         description: 정렬 기준
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: 태그 필터
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 검색어
 *     responses:
 *       200:
 *         description: 피드 조회 성공
 *       500:
 *         description: 서버 오류
 */
router.get('/', postController.getPosts);

/**
 * @swagger
 * /api/posts/my:
 *   get:
 *     summary: 내 게시물 조회
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 페이지당 게시물 수
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: -createdAt
 *         description: 정렬 기준
 *     responses:
 *       200:
 *         description: 내 게시물 조회 성공
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */
router.get('/my', authenticate, postController.getMyPosts);

/**
 * @swagger
 * /api/posts/map:
 *   get:
 *     summary: 지도용 게시물 조회 (사진 기반)
 *     description: 게시물의 각 사진을 개별 항목으로 반환. 게시물 1개에 사진 3개면 3개 항목 반환.
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *         description: 현재 위치 위도 (필수)
 *         example: 37.5665
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *         description: 현재 위치 경도 (필수)
 *         example: 126.9780
 *       - in: query
 *         name: zoomLevel
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 20
 *         description: 지도 줌 레벨 (필수, 1=전세계 12=5km 20=0.02km)
 *         example: 12
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: 태그 필터 (선택)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: 최대 항목 수
 *     responses:
 *       200:
 *         description: 지도용 피드 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       postId:
 *                         type: string
 *                         example: 507f1f77bcf86cd799439011
 *                       photo:
 *                         type: object
 *                         properties:
 *                           url:
 *                             type: string
 *                           thumbnail:
 *                             type: string
 *                           location:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                               coordinates:
 *                                 type: object
 *                                 properties:
 *                                   latitude:
 *                                     type: number
 *                                   longitude:
 *                                     type: number
 *                               address:
 *                                 type: string
 *                           capturedAt:
 *                             type: string
 *                             format: date-time
 *                           description:
 *                             type: string
 *                       author:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           username:
 *                             type: string
 *                           profileImage:
 *                             type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                 total:
 *                   type: integer
 *       400:
 *         description: 위치 정보 누락
 *       500:
 *         description: 서버 오류
 */
router.get('/map', postController.getPostsForMap);

/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     summary: 특정 게시물 조회
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 게시물 ID
 *     responses:
 *       200:
 *         description: 게시물 조회 성공
 *       404:
 *         description: 게시물을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.get('/:id', postController.getPost);

/**
 * @swagger
 * /api/posts/{id}:
 *   put:
 *     summary: 게시물 수정
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 게시물 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               location:
 *                 type: string
 *               tags:
 *                 type: string
 *               visibility:
 *                 type: string
 *     responses:
 *       200:
 *         description: 게시물 수정 성공
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 게시물을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.put('/:id', authenticate, postController.updatePost);

/**
 * @swagger
 * /api/posts/{id}:
 *   delete:
 *     summary: 게시물 삭제
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 게시물 ID
 *     responses:
 *       200:
 *         description: 게시물 삭제 성공
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 게시물을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.delete('/:id', authenticate, postController.deletePost);

/**
 * @swagger
 * /api/posts/{id}/like:
 *   post:
 *     summary: 게시물 좋아요
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 게시물 ID
 *     responses:
 *       200:
 *         description: 좋아요 성공
 *       400:
 *         description: 이미 좋아요한 게시물
 *       401:
 *         description: 인증 실패
 *       404:
 *         description: 게시물을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.post('/:id/like', authenticate, postController.likePost);

/**
 * @swagger
 * /api/posts/{id}/unlike:
 *   delete:
 *     summary: 게시물 좋아요 취소
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 게시물 ID
 *     responses:
 *       200:
 *         description: 좋아요 취소 성공
 *       400:
 *         description: 좋아요하지 않은 게시물
 *       401:
 *         description: 인증 실패
 *       404:
 *         description: 게시물을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.delete('/:id/unlike', authenticate, postController.unlikePost);

// 댓글 관련 라우트
/**
 * @swagger
 * /api/posts/{postId}/comments:
 *   post:
 *     summary: 댓글 생성
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: 게시물 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: 댓글 내용
 *               parentComment:
 *                 type: string
 *                 description: 부모 댓글 ID (대댓글인 경우)
 *     responses:
 *       201:
 *         description: 댓글 생성 성공
 */
router.post('/:postId/comments', authenticate, commentController.createComment);

/**
 * @swagger
 * /api/posts/{postId}/comments:
 *   get:
 *     summary: 댓글 목록 조회
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: 게시물 ID
 *     responses:
 *       200:
 *         description: 댓글 목록 조회 성공
 */
router.get('/:postId/comments', commentController.getComments);

module.exports = router;
