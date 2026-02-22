const { Comment, Post } = require('../models');

/**
 * @description 댓글 생성
 */
exports.createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, parentComment } = req.body;
    const userId = req.user.userId;

    // 게시물 존재 확인
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: '게시물을 찾을 수 없습니다.',
      });
    }

    // 부모 댓글 존재 확인 (대댓글인 경우)
    if (parentComment) {
      const parent = await Comment.findById(parentComment);
      if (!parent || parent.post.toString() !== postId) {
        return res.status(404).json({
          success: false,
          message: '부모 댓글을 찾을 수 없습니다.',
        });
      }
    }

    // 댓글 생성
    const comment = new Comment({
      post: postId,
      author: userId,
      content,
      parentComment: parentComment || null,
    });

    await comment.save();
    await comment.populate('author', 'username email profileImage');

    res.status(201).json({
      success: true,
      data: comment,
    });
  } catch (error) {
    console.error('댓글 생성 오류:', error);
    res.status(500).json({
      success: false,
      message: '댓글 생성에 실패했습니다.',
      error: error.message,
    });
  }
};

/**
 * @description 댓글 목록 조회
 */
exports.getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 20, sort = 'createdAt' } = req.query;

    // 게시물 존재 확인
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: '게시물을 찾을 수 없습니다.',
      });
    }

    // 최상위 댓글만 조회 (대댓글은 제외)
    const query = {
      post: postId,
      parentComment: null,
      isDeleted: false,
    };

    const comments = await Comment.find(query)
      .populate('author', 'username email profileImage')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // 각 댓글의 대댓글 조회
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({
          parentComment: comment._id,
          isDeleted: false,
        })
          .populate('author', 'username email profileImage')
          .sort('createdAt')
          .exec();

        return {
          ...comment.toObject(),
          replies,
        };
      })
    );

    const count = await Comment.countDocuments(query);

    res.json({
      success: true,
      data: commentsWithReplies,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    console.error('댓글 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '댓글 조회에 실패했습니다.',
      error: error.message,
    });
  }
};

/**
 * @description 댓글 수정
 */
exports.updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: '댓글을 찾을 수 없습니다.',
      });
    }

    // 권한 체크
    if (comment.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: '댓글을 수정할 권한이 없습니다.',
      });
    }

    // 삭제된 댓글은 수정 불가
    if (comment.isDeleted) {
      return res.status(400).json({
        success: false,
        message: '삭제된 댓글은 수정할 수 없습니다.',
      });
    }

    comment.content = content;
    await comment.save();
    await comment.populate('author', 'username email profileImage');

    res.json({
      success: true,
      data: comment,
    });
  } catch (error) {
    console.error('댓글 수정 오류:', error);
    res.status(500).json({
      success: false,
      message: '댓글 수정에 실패했습니다.',
      error: error.message,
    });
  }
};

/**
 * @description 댓글 삭제 (소프트 삭제)
 */
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: '댓글을 찾을 수 없습니다.',
      });
    }

    // 권한 체크
    if (comment.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: '댓글을 삭제할 권한이 없습니다.',
      });
    }

    // 이미 삭제된 댓글
    if (comment.isDeleted) {
      return res.status(400).json({
        success: false,
        message: '이미 삭제된 댓글입니다.',
      });
    }

    // 소프트 삭제
    comment.isDeleted = true;
    comment.content = '삭제된 댓글입니다.';
    await comment.save();

    res.json({
      success: true,
      message: '댓글이 삭제되었습니다.',
    });
  } catch (error) {
    console.error('댓글 삭제 오류:', error);
    res.status(500).json({
      success: false,
      message: '댓글 삭제에 실패했습니다.',
      error: error.message,
    });
  }
};

/**
 * @description 댓글 좋아요
 */
exports.likeComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: '댓글을 찾을 수 없습니다.',
      });
    }

    // 삭제된 댓글은 좋아요 불가
    if (comment.isDeleted) {
      return res.status(400).json({
        success: false,
        message: '삭제된 댓글에는 좋아요를 할 수 없습니다.',
      });
    }

    // 이미 좋아요한 경우
    if (comment.likes.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: '이미 좋아요한 댓글입니다.',
      });
    }

    comment.likes.push(userId);
    comment.likeCount += 1;
    await comment.save();

    res.json({
      success: true,
      data: {
        likeCount: comment.likeCount,
      },
    });
  } catch (error) {
    console.error('댓글 좋아요 오류:', error);
    res.status(500).json({
      success: false,
      message: '댓글 좋아요에 실패했습니다.',
      error: error.message,
    });
  }
};

/**
 * @description 댓글 좋아요 취소
 */
exports.unlikeComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: '댓글을 찾을 수 없습니다.',
      });
    }

    // 좋아요하지 않은 경우
    if (!comment.likes.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: '좋아요하지 않은 댓글입니다.',
      });
    }

    comment.likes = comment.likes.filter((id) => id.toString() !== userId);
    comment.likeCount = Math.max(0, comment.likeCount - 1);
    await comment.save();

    res.json({
      success: true,
      data: {
        likeCount: comment.likeCount,
      },
    });
  } catch (error) {
    console.error('댓글 좋아요 취소 오류:', error);
    res.status(500).json({
      success: false,
      message: '댓글 좋아요 취소에 실패했습니다.',
      error: error.message,
    });
  }
};
