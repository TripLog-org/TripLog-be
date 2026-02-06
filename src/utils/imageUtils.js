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
    const ext = path.extname(filename);
    const nameWithoutExt = path.basename(filename, ext);
    const thumbnailFilename = `${nameWithoutExt}_thumb.jpg`; // 항상 JPG로 저장
    const thumbnailPath = path.join(thumbnailsDir, thumbnailFilename);

    // 400x400 JPG 썸네일 생성 (더 작은 파일 크기)
    await sharp(originalPath)
      .resize(400, 400, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ progressive: true, quality: 75 })
      .toFile(thumbnailPath);

    console.log('✓ 썸네일 생성 완료:', thumbnailFilename);
    return `/uploads/thumbnails/${thumbnailFilename}`;
  } catch (error) {
    console.error('썸네일 생성 오류:', error);
    // 썸네일 생성 실패 시 원본 URL 반환
    return `/uploads/posts/${filename}`;
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
