const User = require('../models/User');
const Recommendation = require('../models/Recommendation');

/**
 * 북마크 토글 (추가/제거)
 * POST /api/bookmarks/toggle
 */
exports.toggleBookmark = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { recommendationId } = req.body;

    console.log('[Bookmark] Toggle request - userId:', userId, 'recommendationId:', recommendationId);

    if (!recommendationId) {
      return res.status(400).json({ error: '추천 여행지 ID가 필요합니다' });
    }

    const user = await User.findById(userId);
    console.log('[Bookmark] User found:', user ? 'yes' : 'no');

    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다' });
    }

    // 북마크 추가/제거
    const bookmarkIndex = user.bookmarks.indexOf(recommendationId);
    
    if (bookmarkIndex === -1) {
      // 북마크 추가
      user.bookmarks.push(recommendationId);
      await user.save();
      res.status(201).json({
        message: '북마크가 추가되었습니다',
        isBookmarked: true,
        bookmarkCount: user.bookmarks.length,
      });
    } else {
      // 북마크 제거
      user.bookmarks.splice(bookmarkIndex, 1);
      await user.save();
      res.status(200).json({
        message: '북마크가 제거되었습니다',
        isBookmarked: false,
        bookmarkCount: user.bookmarks.length,
      });
    }
  } catch (error) {
    console.error('[Bookmark] Toggle error:', error.message);
    res.status(500).json({ error: '북마크 처리 중 오류가 발생했습니다' });
  }
};

/**
 * 특정 추천 여행지 북마크 상태 조회
 * GET /api/bookmarks/check/:recommendationId
 */
exports.checkBookmark = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { recommendationId } = req.params;

    const user = await User.findById(userId);
    const isBookmarked = user.bookmarks.includes(recommendationId);

    res.status(200).json({
      recommendationId,
      isBookmarked,
    });
  } catch (error) {
    console.error('북마크 확인 오류:', error);
    res.status(500).json({ error: '북마크 조회 중 오류가 발생했습니다' });
  }
};

/**
 * 내 북마크 목록 조회
 * GET /api/bookmarks
 */
exports.getMyBookmarks = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, pageSize = 20, sortBy = '-createdAt' } = req.query;

    // 페이지 유효성 검사
    const pageNum = Math.max(1, parseInt(page) || 1);
    const pageSizeNum = Math.min(100, Math.max(1, parseInt(pageSize) || 20));
    const skip = (pageNum - 1) * pageSizeNum;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다' });
    }

    const total = user.bookmarks.length;

    const userWithBookmarks = await User.findById(userId).populate({
      path: 'bookmarks',
      options: {
        skip,
        limit: pageSizeNum,
        sort: sortBy,
      },
    });

    res.status(200).json({
      pagination: {
        page: pageNum,
        pageSize: pageSizeNum,
        total,
        totalPages: Math.ceil(total / pageSizeNum),
      },
      count: userWithBookmarks.bookmarks.length,
      data: userWithBookmarks.bookmarks,
    });
  } catch (error) {
    console.error('북마크 목록 조회 오류:', error);
    res.status(500).json({ error: '북마크 목록 조회 중 오류가 발생했습니다' });
  }
};

/**
 * 북마크 일괄 삭제
 * DELETE /api/bookmarks
 */
exports.clearAllBookmarks = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findByIdAndUpdate(
      userId,
      { bookmarks: [] },
      { new: true }
    );

    res.status(200).json({
      message: '모든 북마크가 삭제되었습니다',
      bookmarkCount: 0,
    });
  } catch (error) {
    console.error('북마크 일괄 삭제 오류:', error);
    res.status(500).json({ error: '북마크 삭제 중 오류가 발생했습니다' });
  }
};
