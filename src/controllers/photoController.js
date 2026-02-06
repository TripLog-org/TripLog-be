const { Photo, Place } = require('../models');

// 장소별 사진 목록 조회 (Public)
exports.getPhotosByPlace = async (req, res, next) => {
  try {
    const place = await Place.findById(req.params.placeId);

    if (!place) {
      return res.status(404).json({ message: '장소를 찾을 수 없습니다.' });
    }

    const photos = await Photo.find({ place: req.params.placeId })
      .sort({ order: 1 });

    res.json(photos);
  } catch (error) {
    next(error);
  }
};

// 사진 상세 조회 (Public)
exports.getPhoto = async (req, res, next) => {
  try {
    const photo = await Photo.findById(req.params.photoId)
      .populate({
        path: 'place',
        populate: { path: 'trip' },
      });

    if (!photo) {
      return res.status(404).json({ message: '사진을 찾을 수 없습니다.' });
    }

    res.json(photo);
  } catch (error) {
    next(error);
  }
};

// 사진 업로드
exports.createPhoto = async (req, res, next) => {
  try {
    const { url, thumbnailUrl, caption, takenAt } = req.body;

    const place = await Place.findById(req.params.placeId).populate('trip');

    if (!place) {
      return res.status(404).json({ message: '장소를 찾을 수 없습니다.' });
    }

    if (place.trip.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: '접근 권한이 없습니다.' });
    }

    // 순서 계산
    const lastPhoto = await Photo.findOne({ place: req.params.placeId })
      .sort({ order: -1 });
    const order = lastPhoto ? lastPhoto.order + 1 : 0;

    const photo = await Photo.create({
      place: req.params.placeId,
      url,
      thumbnailUrl,
      caption,
      takenAt,
      order,
    });

    res.status(201).json(photo);
  } catch (error) {
    next(error);
  }
};

// 사진 삭제
exports.deletePhoto = async (req, res, next) => {
  try {
    const photo = await Photo.findById(req.params.photoId)
      .populate({
        path: 'place',
        populate: { path: 'trip' },
      });

    if (!photo) {
      return res.status(404).json({ message: '사진을 찾을 수 없습니다.' });
    }

    if (photo.place.trip.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: '접근 권한이 없습니다.' });
    }

    await photo.deleteOne();

    // TODO: 실제 파일 삭제 (S3 등)

    res.json({ message: '사진이 삭제되었습니다.' });
  } catch (error) {
    next(error);
  }
};
