const express = require('express');
const router = express.Router();
const photoController = require('../controllers/photoController');
const { authenticate } = require('../middlewares/auth');

/**
 * @swagger
 * /api/photos/{photoId}:
 *   get:
 *     summary: 사진 상세 조회
 *     description: 특정 사진 상세 정보 조회 (Public)
 *     tags: [Photos]
 *     parameters:
 *       - in: path
 *         name: photoId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 사진 상세 정보
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Photo'
 *       404:
 *         description: 사진 없음
 */
router.get('/:photoId', photoController.getPhoto);

/**
 * @swagger
 * /api/photos/{photoId}:
 *   delete:
 *     summary: 사진 삭제
 *     description: 사진 삭제
 *     tags: [Photos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: photoId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 삭제 완료
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 사진이 삭제되었습니다.
 *       404:
 *         description: 사진 없음
 */
router.delete('/:photoId', authenticate, photoController.deletePhoto);

module.exports = router;
