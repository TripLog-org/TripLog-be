const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const config = require('../config');

// Cloudflare R2 S3 호환 클라이언트
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${config.r2.accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: config.r2.accessKeyId,
    secretAccessKey: config.r2.secretAccessKey,
  },
});

const BUCKET_NAME = config.r2.bucketName;
const PUBLIC_URL = config.r2.publicUrl;

/**
 * R2에 파일 업로드
 * @param {Buffer} buffer - 파일 버퍼
 * @param {string} key - R2 객체 키 (예: posts/uuid.jpg)
 * @param {string} contentType - MIME 타입
 * @returns {string} 업로드된 파일의 공개 URL
 */
const uploadToR2 = async (buffer, key, contentType) => {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await s3Client.send(command);
  return `${PUBLIC_URL}/${key}`;
};

/**
 * R2에서 파일 삭제
 * @param {string} key - R2 객체 키
 */
const deleteFromR2 = async (key) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    await s3Client.send(command);
    console.log(`✓ R2 파일 삭제 완료: ${key}`);
    return true;
  } catch (error) {
    console.error(`R2 파일 삭제 오류 (${key}):`, error);
    return false;
  }
};

/**
 * URL에서 R2 객체 키 추출
 * @param {string} url - R2 공개 URL
 * @returns {string|null} 객체 키
 */
const getKeyFromUrl = (url) => {
  if (!url || !PUBLIC_URL) return null;
  if (url.startsWith(PUBLIC_URL)) {
    return url.substring(PUBLIC_URL.length + 1); // +1 for the '/'
  }
  // /uploads/ 로 시작하는 레거시 로컬 경로는 무시
  if (url.startsWith('/uploads/')) {
    return null;
  }
  return null;
};

/**
 * 여러 파일을 R2에서 삭제
 * @param {string[]} urls - R2 공개 URL 배열
 */
const deleteMultipleFromR2 = async (urls) => {
  const deletePromises = urls.map((url) => {
    const key = getKeyFromUrl(url);
    if (key) {
      return deleteFromR2(key);
    }
    return Promise.resolve(false);
  });
  await Promise.all(deletePromises);
};

module.exports = {
  s3Client,
  uploadToR2,
  deleteFromR2,
  getKeyFromUrl,
  deleteMultipleFromR2,
};
