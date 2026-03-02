const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const appleSignin = require('apple-signin-auth');
const { User } = require('../models');
const config = require('../config');

// 랜덤 닉네임 생성 헬퍼
const generateRandomNickname = () => {
  const adjectives = [
    '행복한', '즐거운', '신나는', '활발한', '여유로운',
    '자유로운', '설레는', '용감한', '따뜻한', '빛나는',
    '씩씩한', '산뜻한', '기분좋은', '상쾌한', '느긋한',
  ];
  const nouns = [
    '여행자', '탐험가', '모험가', '나그네', '방랑자',
    '길손', '순례자', '배낭족', '트래블러', '보행자',
    '산책자', '발걸음', '나들이꾼', '로드트리퍼', '항해사',
  ];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 10000);
  return `${adj}${noun}${num}`;
};

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

const decodeJwtPayload = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    return payload;
  } catch (e) {
    return null;
  }
};

const getGoogleAudiences = () => {
  const audiences = new Set();

  if (config.google.clientId) {
    config.google.clientId
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean)
      .forEach((id) => audiences.add(id));
  }

  if (config.google.iosClientId) {
    audiences.add(config.google.iosClientId.trim());
  }

  return Array.from(audiences);
};

const googleClientId = (() => {
  const audiences = getGoogleAudiences();
  return audiences[0];
})();

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

    const nickname = generateRandomNickname();

    user = await User.create({
      provider,
      providerId,
      email,
      name,
      nickname,
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

// iOS Native 구글 로그인 (ID 토큰 검증만)
exports.googleLoginNative = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: 'idToken이 필요합니다.' });
    }

    if (!config.google.clientId) {
      return res.status(500).json({ message: 'Google Client ID가 설정되지 않았습니다.' });
    }

    // 모든 가능한 클라이언트 ID 검증 (web, iOS, Android 등)
    const audience = getGoogleAudiences();

    let ticket;
    try {
      ticket = await googleClient.verifyIdToken({
        idToken,
        audience,
      });
    } catch (verifyError) {
      const decoded = decodeJwtPayload(idToken);
      console.error('Google Native verifyIdToken 실패', {
        allowedAudiences: audience,
        tokenAud: decoded?.aud,
        tokenAzp: decoded?.azp,
        tokenIss: decoded?.iss,
      });

      if (verifyError?.message?.includes('Wrong recipient')) {
        return res.status(401).json({
          message: 'Google 토큰 audience가 서버 설정과 일치하지 않습니다.',
          details: {
            tokenAud: decoded?.aud,
            tokenAzp: decoded?.azp,
            allowedAudiences: audience,
          },
        });
      }

      throw verifyError;
    }
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

// 구글 로그인 (웹)
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

    const audience = getGoogleAudiences();

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
