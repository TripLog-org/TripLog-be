const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema(
  {
    place: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Place',
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
    },
    caption: {
      type: String,
      trim: true,
    },
    takenAt: {
      type: Date,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

photoSchema.index({ place: 1, order: 1 });

module.exports = mongoose.model('Photo', photoSchema);
