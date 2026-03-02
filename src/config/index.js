require('dotenv').config();

const normalizeGoogleClientIdFromScheme = (scheme) => {
  if (!scheme || typeof scheme !== 'string') return undefined;
  const prefix = 'com.googleusercontent.apps.';
  if (!scheme.startsWith(prefix)) return undefined;
  const raw = scheme.slice(prefix.length).trim();
  if (!raw) return undefined;
  return `${raw}.apps.googleusercontent.com`;
};

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  apple: {
    clientId: process.env.APPLE_CLIENT_ID,
    teamId: process.env.APPLE_TEAM_ID,
    keyId: process.env.APPLE_KEY_ID,
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI,
    iosScheme: process.env.GOOGLE_IOS_SCHEME,
    iosClientId: process.env.GOOGLE_IOS_CLIENT_ID || normalizeGoogleClientIdFromScheme(process.env.GOOGLE_IOS_SCHEME),
  },
  r2: {
    accountId: process.env.R2_ACCOUNT_ID,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    bucketName: process.env.R2_BUCKET_NAME || 'triplog',
    publicUrl: process.env.R2_PUBLIC_URL,
  },
};
