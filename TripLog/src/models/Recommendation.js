const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    coverImage: {
      type: String,
    },
    region: {
      type: String,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

recommendationSchema.index({ category: 1, createdAt: -1 });

module.exports = mongoose.model('Recommendation', recommendationSchema);
