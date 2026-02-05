const express = require('express');
const router = express.Router();
const bookmarkController = require('../controllers/bookmarkController');
const { authenticate } = require('../middlewares/auth');

// 북마크 상태 확인
router.get('/check/:recommendationId', authenticate, bookmarkController.checkBookmark);

// 북마크 토글 (추가/제거)
router.post('/toggle', authenticate, bookmarkController.toggleBookmark);

// 내 북마크 목록 조회
router.get('/', authenticate, bookmarkController.getMyBookmarks);

// 모든 북마크 삭제
router.delete('/', authenticate, bookmarkController.clearAllBookmarks);

module.exports = router;
