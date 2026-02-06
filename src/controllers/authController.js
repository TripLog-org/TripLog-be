const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const appleSignin = require('apple-signin-auth');
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

const googleClientId = config.google.clientId
  ? config.google.clientId.split(',')[0].trim()
  : undefined;

const googleClient = new OAuth2Client(
  googleClientId,
  config.google.clientSecret,
  config.google.redirectUri
);

const upsertSocialUser = async ({ provider, providerId, email, name, profileImage }) => {
  let user = await User.findOne({ provider, providerId });
  let isNewUser = false;

  if (!user) {
    if (!email) {
      const error = new Error('이메일 정보가 필요합니다.');
      error.statusCode = 400;
      throw error;
    }

    user = await User.create({
      provider,
      providerId,
      email,
      name,
      profileImage,
    });
    isNewUser = true;
  } else {
    const updates = {};
    if (email && !user.email) updates.email = email;
    if (name && !user.name) updates.name = name;
    if (profileImage && !user.profileImage) updates.profileImage = profileImage;
    if (Object.keys(updates).length > 0) {
      Object.assign(user, updates);
      await user.save();
    }
  }

  const tokens = generateTokens(user._id);
  user.refreshToken = tokens.refreshToken;
  await user.save();

  const userResponse = user.toObject();
  delete userResponse.refreshToken;

  return { tokens, user: userResponse, isNewUser };
};

// 애플 로그인
exports.appleLogin = async (req, res, next) => {
  try {
    const { idToken, authorizationCode } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: 'idToken이 필요합니다.' });
    }

    if (!config.apple.clientId) {
      return res.status(500).json({ message: 'Apple Client ID가 설정되지 않았습니다.' });
    }

    const appleUser = await appleSignin.verifyIdToken(idToken, {
      audience: config.apple.clientId,
      ignoreExpiration: false,
    });

    const email = appleUser.email || req.body.email;
    const providerId = appleUser.sub;
    const name = req.body.name;

    const { tokens, user, isNewUser } = await upsertSocialUser({
      provider: 'apple',
      providerId,
      email,
      name,
    });

    res.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user,
      isNewUser,
    });
  } catch (error) {
    next(error);
  }
};

// 구글 로그인
exports.googleLogin = async (req, res, next) => {
  try {
    const { idToken, authorizationCode } = req.body;

    if (!idToken && !authorizationCode) {
      return res.status(400).json({ message: 'idToken 또는 authorizationCode가 필요합니다.' });
    }

    if (!config.google.clientId) {
      return res.status(500).json({ message: 'Google Client ID가 설정되지 않았습니다.' });
    }

    let resolvedIdToken = idToken;

    if (!resolvedIdToken && authorizationCode) {
      if (!config.google.clientSecret || !config.google.redirectUri) {
        return res.status(500).json({ message: 'Google Client Secret 또는 Redirect URI가 설정되지 않았습니다.' });
      }

      const { tokens } = await googleClient.getToken(authorizationCode);
      resolvedIdToken = tokens.id_token;

      if (!resolvedIdToken) {
        return res.status(401).json({ message: '유효하지 않은 구글 인증 코드입니다.' });
      }
    }

    const audience = config.google.clientId
      ? config.google.clientId.split(',').map((id) => id.trim())
      : undefined;

    const ticket = await googleClient.verifyIdToken({
      idToken: resolvedIdToken,
      audience,
    });
    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(401).json({ message: '유효하지 않은 구글 토큰입니다.' });
    }

    const { sub: providerId, email, name, picture } = payload;

    const { tokens, user, isNewUser } = await upsertSocialUser({
      provider: 'google',
      providerId,
      email,
      name,
      profileImage: picture,
    });

    res.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user,
      isNewUser,
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

// Google OAuth 콜백 (Authorization Code 흐름)
exports.googleCallback = async (req, res, next) => {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).send('Authorization code not found');
    }

    // Authorization Code를 ID Token으로 교환
    const { tokens } = await googleClient.getToken({
      code,
      redirect_uri: config.google.redirectUri
    });
    const idToken = tokens.id_token;

    if (!idToken) {
      return res.status(400).send('Failed to obtain ID token');
    }

    // ID Token 검증
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: config.google.clientId,
    });

    const payload = ticket.getPayload();
    const providerId = payload.sub;
    const email = payload.email;
    const name = payload.name;
    const profileImage = payload.picture;

    // 사용자 생성 또는 조회
    const result = await upsertSocialUser({
      provider: 'google',
      providerId,
      email,
      name,
      profileImage,
    });

    // upsertSocialUser에서 반환된 tokens와 user 사용
    const redirectUrl = `/test-google-login?accessToken=${result.tokens.accessToken}&refreshToken=${result.tokens.refreshToken}&email=${email}&isNewUser=${result.isNewUser}`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect(`/test-google-login?error=${encodeURIComponent(error.message)}`);
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
