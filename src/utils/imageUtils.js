const sharp = require('sharp');
const path = require('path');
const { randomUUID } = require('crypto');
const { uploadToR2, deleteMultipleFromR2 } = require('./r2Storage');

/**
 * 버퍼에서 이미지 리사이징 및 최적화 (R2 업로드용)
 * @param {Buffer} buffer - 원본 이미지 버퍼
 * @param {number} width
 * @param {number} height
 * @param {number} quality
 * @returns {Buffer} 리사이징된 이미지 버퍼
 */
const resizeImageBuffer = async (buffer, width, height, quality = 80) => {
  try {
    return await sharp(buffer)
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .png({ progressive: true })
      .toBuffer();
  } catch (error) {
    console.error('이미지 리사이징 오류:', error);
    throw error;
  }
};

/**
 * 이미지를 R2에 업로드하고 URL 반환
 * @param {Buffer} buffer - 이미지 버퍼
 * @param {string} originalname - 원본 파일명
 * @param {string} mimetype - MIME 타입
 * @returns {{ imageKey: string, thumbnailKey: string }} R2 객체 키
 */
const uploadImageToR2 = async (buffer, originalname, mimetype) => {
  const ext = path.extname(originalname);
  const uniqueId = randomUUID();
  const imageKey = `posts/${uniqueId}${ext}`;
  const thumbnailKey = `thumbnails/${uniqueId}_thumb.jpg`;

  // 원본 업로드와 썸네일 생성/업로드를 병렬 처리
  let finalThumbnailKey = imageKey;

  const thumbnailTask = (async () => {
    try {
      const thumbBuffer = await sharp(buffer)
        .resize(400, 400, {
          fit: 'cover',
          position: 'center',
        })
        .jpeg({ progressive: true, quality: 75 })
        .toBuffer();

      await uploadToR2(thumbBuffer, thumbnailKey, 'image/jpeg');
      console.log('✓ 썸네일 생성 및 R2 업로드 완료:', thumbnailKey);
      return thumbnailKey;
    } catch (error) {
      console.error('썸네일 생성 오류:', error);
      return null;
    }
  })();

  const [, thumbResult] = await Promise.all([
    uploadToR2(buffer, imageKey, mimetype),
    thumbnailTask,
  ]);

  if (thumbResult) finalThumbnailKey = thumbResult;

  return { imageKey, thumbnailKey: finalThumbnailKey };
};

/**
 * 원본 이미지만 R2에 빠르게 업로드 (썸네일 생성 없이)
 * @param {Buffer} buffer - 이미지 버퍼
 * @param {string} originalname - 원본 파일명
 * @param {string} mimetype - MIME 타입
 * @returns {{ imageKey: string, uniqueId: string }}
 */
const uploadOriginalToR2 = async (buffer, originalname, mimetype) => {
  const ext = path.extname(originalname);
  const uniqueId = randomUUID();
  const imageKey = `posts/${uniqueId}${ext}`;

  await uploadToR2(buffer, imageKey, mimetype);

  return { imageKey, uniqueId };
};

/**
 * 썸네일을 백그라운드에서 생성 및 업로드
 * @param {Buffer} buffer - 원본 이미지 버퍼
 * @param {string} uniqueId - 이미지 고유 ID
 * @returns {string|null} 썸네일 키 또는 null
 */
const generateAndUploadThumbnail = async (buffer, uniqueId) => {
  const thumbnailKey = `thumbnails/${uniqueId}_thumb.jpg`;

  try {
    const thumbBuffer = await sharp(buffer)
      .resize(400, 400, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ progressive: true, quality: 75 })
      .toBuffer();

    await uploadToR2(thumbBuffer, thumbnailKey, 'image/jpeg');
    console.log('✓ 백그라운드 썸네일 생성 완료:', thumbnailKey);
    return thumbnailKey;
  } catch (error) {
    console.error('백그라운드 썸네일 생성 오류:', error);
    return null;
  }
};

/**
 * R2에서 이미지 삭제
 * @param {string[]} imageUrls - R2 공개 URL 배열
 */
const deleteImages = async (imageUrls) => {
  try {
    await deleteMultipleFromR2(imageUrls);
    return true;
  } catch (error) {
    console.error('이미지 삭제 오류:', error);
    return false;
  }
};

module.exports = {
  resizeImageBuffer,
  uploadImageToR2,
  uploadOriginalToR2,
  generateAndUploadThumbnail,
  deleteImages,
};
