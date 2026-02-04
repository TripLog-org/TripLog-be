const { Place, Trip } = require('../models');

// 여행 내 장소 목록 조회 (Public)
exports.getPlacesByTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.tripId);

    if (!trip) {
      return res.status(404).json({ message: '여행을 찾을 수 없습니다.' });
    }

    const places = await Place.find({ trip: req.params.tripId })
      .sort({ order: 1 });

    res.json(places);
  } catch (error) {
    next(error);
  }
};

// 장소 상세 조회 (Public)
exports.getPlace = async (req, res, next) => {
  try {
    const place = await Place.findById(req.params.placeId).populate('trip');

    if (!place) {
      return res.status(404).json({ message: '장소를 찾을 수 없습니다.' });
    }

    res.json(place);
  } catch (error) {
    next(error);
  }
};

// 장소 추가
exports.createPlace = async (req, res, next) => {
  try {
    const { name, description, address, location, visitedAt } = req.body;

    // 여행 소유권 확인
    const trip = await Trip.findOne({
      _id: req.params.tripId,
      user: req.user.userId,
    });

    if (!trip) {
      return res.status(404).json({ message: '여행을 찾을 수 없습니다.' });
    }

    // 순서 계산
    const lastPlace = await Place.findOne({ trip: req.params.tripId })
      .sort({ order: -1 });
    const order = lastPlace ? lastPlace.order + 1 : 0;

    const place = await Place.create({
      trip: req.params.tripId,
      name,
      description,
      address,
      location,
      visitedAt,
      order,
    });

    res.status(201).json(place);
  } catch (error) {
    next(error);
  }
};

// 장소 수정
exports.updatePlace = async (req, res, next) => {
  try {
    const { name, description, address, location, visitedAt, order } = req.body;

    const place = await Place.findById(req.params.placeId).populate('trip');

    if (!place) {
      return res.status(404).json({ message: '장소를 찾을 수 없습니다.' });
    }

    if (place.trip.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: '접근 권한이 없습니다.' });
    }

    Object.assign(place, { name, description, address, location, visitedAt, order });
    await place.save();

    res.json(place);
  } catch (error) {
    next(error);
  }
};

// 장소 삭제
exports.deletePlace = async (req, res, next) => {
  try {
    const place = await Place.findById(req.params.placeId).populate('trip');

    if (!place) {
      return res.status(404).json({ message: '장소를 찾을 수 없습니다.' });
    }

    if (place.trip.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: '접근 권한이 없습니다.' });
    }

    await place.deleteOne();

    // TODO: 연관된 사진도 삭제

    res.json({ message: '장소가 삭제되었습니다.' });
  } catch (error) {
    next(error);
  }
};

// 장소 검색
exports.searchPlaces = async (req, res, next) => {
  try {
    const { query, lat, lng, radius } = req.query;

    // TODO: 외부 지도 API 연동 (Google Places, Kakao 등)

    res.json({
      message: '장소 검색 API (구현 예정)',
      query,
      results: [],
    });
  } catch (error) {
    next(error);
  }
};
