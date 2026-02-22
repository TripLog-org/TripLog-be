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

// 닉네임 수정
exports.updateNickname = async (req, res, next) => {
  try {
    const { nickname } = req.body;

    if (!nickname || typeof nickname !== 'string' || nickname.trim().length === 0) {
      return res.status(400).json({ message: '닉네임을 입력해주세요.' });
    }

    const trimmed = nickname.trim();
    if (trimmed.length > 30) {
      return res.status(400).json({ message: '닉네임은 30자 이내로 입력해주세요.' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { nickname: trimmed },
      { new: true, runValidators: true }
    ).select('-refreshToken');

    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
