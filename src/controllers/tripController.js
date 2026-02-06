const { Trip } = require('../models');

// 여행 목록 조회 (Public)
exports.getTrips = async (req, res, next) => {
  try {
    const trips = await Trip.find()
      .populate('user', 'name profileImage')
      .sort({ createdAt: -1 });

    res.json(trips);
  } catch (error) {
    next(error);
  }
};

// 여행 상세 조회 (Public)
exports.getTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.tripId)
      .populate('user', 'name profileImage');

    if (!trip) {
      return res.status(404).json({ message: '여행을 찾을 수 없습니다.' });
    }

    res.json(trip);
  } catch (error) {
    next(error);
  }
};

// 여행 생성
exports.createTrip = async (req, res, next) => {
  try {
    const { title, description, startDate, endDate, coverImage } = req.body;

    const trip = await Trip.create({
      user: req.user.userId,
      title,
      description,
      startDate,
      endDate,
      coverImage,
    });

    res.status(201).json(trip);
  } catch (error) {
    next(error);
  }
};

// 여행 수정
exports.updateTrip = async (req, res, next) => {
  try {
    const { title, description, startDate, endDate } = req.body;

    const trip = await Trip.findOneAndUpdate(
      { _id: req.params.tripId, user: req.user.userId },
      { title, description, startDate, endDate },
      { new: true, runValidators: true }
    );

    if (!trip) {
      return res.status(404).json({ message: '여행을 찾을 수 없습니다.' });
    }

    res.json(trip);
  } catch (error) {
    next(error);
  }
};

// 여행 삭제
exports.deleteTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findOneAndDelete({
      _id: req.params.tripId,
      user: req.user.userId,
    });

    if (!trip) {
      return res.status(404).json({ message: '여행을 찾을 수 없습니다.' });
    }

    // TODO: 연관된 장소, 사진도 삭제

    res.json({ message: '여행이 삭제되었습니다.' });
  } catch (error) {
    next(error);
  }
};

// 대표 이미지 설정
exports.setCoverImage = async (req, res, next) => {
  try {
    const { coverImage } = req.body;

    const trip = await Trip.findOneAndUpdate(
      { _id: req.params.tripId, user: req.user.userId },
      { coverImage },
      { new: true }
    );

    if (!trip) {
      return res.status(404).json({ message: '여행을 찾을 수 없습니다.' });
    }

    res.json(trip);
  } catch (error) {
    next(error);
  }
};
