const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { thumbnailsDir } = require('../middlewares/upload');

/**
 * 이미지 리사이징 및 최적화
 */
const resizeImage = async (inputPath, outputPath, width, height, quality = 80) => {
  try {
    // PNG로 저장하도록 변경 (JPEG 문제 가능성 제거)
    await sharp(inputPath)
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .png({ progressive: true })
      .toFile(outputPath);
    
    return outputPath;
  } catch (error) {
    console.error('이미지 리사이징 오류:', error);
    throw error;
  }
};

/**
 * 썸네일 생성
 */
const createThumbnail = async (originalPath, filename) => {
  try {
    // 현재는 원본 이미지를 그대로 썸네일로 사용
    // Sharp가 문제를 일으키고 있으므로 나중에 개선
    return `/uploads/posts/${filename}`;
  } catch (error) {
    console.error('썸네일 생성 오류:', error);
    return null;
  }
};

/**
 * 이미지 삭제
 */
const deleteImage = async (imagePath) => {
  try {
    const fullPath = path.join(__dirname, '../..', imagePath);
    await fs.unlink(fullPath);
    return true;
  } catch (error) {
    console.error('이미지 삭제 오류:', error);
    return false;
  }
};

/**
 * 여러 이미지 삭제
 */
const deleteImages = async (imagePaths) => {
  try {
    const deletePromises = imagePaths.map((imagePath) => deleteImage(imagePath));
    await Promise.all(deletePromises);
    return true;
  } catch (error) {
    console.error('이미지들 삭제 오류:', error);
    return false;
  }
};

module.exports = {
  resizeImage,
  createThumbnail,
  deleteImage,
  deleteImages,
};
