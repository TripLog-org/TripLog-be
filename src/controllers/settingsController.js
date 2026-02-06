const { Settings } = require('../models');

// 설정 조회
exports.getSettings = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    let settings = await Settings.findOne({ user: userId });

    if (!settings) {
      settings = await Settings.create({ user: userId });
    }

    res.json(settings);
  } catch (error) {
    next(error);
  }
};

// 설정 수정
exports.updateSettings = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { notifications, theme, language } = req.body;

    const settings = await Settings.findOneAndUpdate(
      { user: userId },
      { notifications, theme, language },
      { new: true, upsert: true, runValidators: true }
    );

    res.json(settings);
  } catch (error) {
    next(error);
  }
};
