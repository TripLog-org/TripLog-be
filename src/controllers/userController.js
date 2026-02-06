const { User } = require('../models');

// 내 정보 조회
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select('-refreshToken');
    
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

// 내 정보 수정
exports.updateMe = async (req, res, next) => {
  try {
    const { name, profileImage } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { name, profileImage },
      { new: true, runValidators: true }
    ).select('-refreshToken');

    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};
