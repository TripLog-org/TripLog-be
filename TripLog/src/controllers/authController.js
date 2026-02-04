const jwt = require('jsonwebtoken');
const { User } = require('../models');
const config = require('../config');

// JWT 토큰 생성 헬퍼
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
  const refreshToken = jwt.sign({ userId }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
  return { accessToken, refreshToken };
};

// 애플 로그인
exports.appleLogin = async (req, res, next) => {
  try {
    const { idToken, authorizationCode } = req.body;

    // TODO: 애플 ID 토큰 검증 로직 구현
    // const appleUser = await verifyAppleToken(idToken);

    // 임시 mock 응답
    res.json({
      message: '애플 로그인 API (구현 예정)',
      accessToken: 'mock_access_token',
      refreshToken: 'mock_refresh_token',
      user: {
        id: 'user_123',
        email: 'user@example.com',
        name: '사용자',
        provider: 'apple',
      },
      isNewUser: false,
    });
  } catch (error) {
    next(error);
  }
};

// 구글 로그인
exports.googleLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    // TODO: 구글 ID 토큰 검증 로직 구현
    // const googleUser = await verifyGoogleToken(idToken);

    // 임시 mock 응답
    res.json({
      message: '구글 로그인 API (구현 예정)',
      accessToken: 'mock_access_token',
      refreshToken: 'mock_refresh_token',
      user: {
        id: 'user_123',
        email: 'user@example.com',
        name: '사용자',
        provider: 'google',
      },
      isNewUser: false,
    });
  } catch (error) {
    next(error);
  }
};

// 로그아웃
exports.logout = async (req, res, next) => {
  try {
    const { userId } = req.user;

    await User.findByIdAndUpdate(userId, { refreshToken: null });

    res.json({ message: '로그아웃 되었습니다.' });
  } catch (error) {
    next(error);
  }
};

// 토큰 갱신
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: '리프레시 토큰이 필요합니다.' });
    }

    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: '유효하지 않은 리프레시 토큰입니다.' });
    }

    const tokens = generateTokens(user._id);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.json(tokens);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: '리프레시 토큰이 만료되었습니다.' });
    }
    next(error);
  }
};

// 회원 탈퇴
exports.withdraw = async (req, res, next) => {
  try {
    const { userId } = req.user;

    await User.findByIdAndDelete(userId);

    // TODO: 관련 데이터 삭제 (여행, 장소, 사진 등)

    res.json({ message: '회원 탈퇴가 완료되었습니다.' });
  } catch (error) {
    next(error);
  }
};
