const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        thumbnail: {
          type: String,
        },
        order: {
          type: Number,
          default: 0,
        },
      },
    ],
    location: {
      name: String,
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
      address: String,
    },
    relatedTrip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
    },
    relatedPlace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Place',
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    visibility: {
      type: String,
      enum: ['public', 'friends', 'private'],
      default: 'public',
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
    commentCount: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    publishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// 인덱스 설정
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ 'location.coordinates.latitude': 1, 'location.coordinates.longitude': 1 });
postSchema.index({ likeCount: -1, createdAt: -1 }); // 인기순 정렬용

// 가상 필드: 좋아요 여부 확인용
postSchema.virtual('isLiked').get(function () {
  return this._isLiked;
});

postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });

// 게시물 발행 시 publishedAt 자동 설정
postSchema.pre('save', function () {
  if (this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
});

module.exports = mongoose.model('Post', postSchema);
