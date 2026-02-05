const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    likeCount: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// 인덱스 설정
commentSchema.index({ post: 1, createdAt: 1 });
commentSchema.index({ parentComment: 1 });

// 댓글 작성 시 게시물의 댓글 수 증가
commentSchema.post('save', async function () {
  const Post = mongoose.model('Post');
  await Post.findByIdAndUpdate(this.post, { $inc: { commentCount: 1 } });
});

// 댓글 삭제 시 게시물의 댓글 수 감소
commentSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    const Post = mongoose.model('Post');
    await Post.findByIdAndUpdate(doc.post, { $inc: { commentCount: -1 } });
  }
});

module.exports = mongoose.model('Comment', commentSchema);
