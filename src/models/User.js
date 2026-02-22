const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    nickname: {
      type: String,
      trim: true,
      maxlength: 30,
    },
    profileImage: {
      type: String,
    },
    provider: {
      type: String,
      enum: ['apple', 'google'],
      required: true,
    },
    providerId: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
    },
    bookmarks: [
      {
        type: String,
        description: 'Bookmark ID (can be MongoDB ObjectId from DB or string from public API)',
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.index({ provider: 1, providerId: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);
