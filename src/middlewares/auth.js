const jwt = require('jsonwebtoken');
const config = require('../config');

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: '인증 토큰이 필요합니다.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret);
    
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: '토큰이 만료되었습니다.' });
    }
    return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
  }
};

/**
 * 선택적 인증 미들웨어
 * 토큰이 있으면 검증해서 req.user에 넣고, 없거나 유효하지 않으면 무시하고 다음으로 넘어감
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
  } catch (error) {
    // 토큰이 유효하지 않아도 그냥 넘어감
  }
  next();
};

module.exports = { authenticate, optionalAuth };
