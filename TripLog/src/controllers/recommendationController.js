// 추천 여행 목록 조회
exports.getRecommendations = async (req, res, next) => {
  try {
    const { category } = req.query;

    // TODO: 추천 로직 구현 (외부 API 또는 자체 DB)

    res.json({
      message: '추천 여행 목록 API (구현 예정)',
      category,
      recommendations: [],
    });
  } catch (error) {
    next(error);
  }
};

// 추천 여행 상세 조회
exports.getRecommendation = async (req, res, next) => {
  try {
    const { id } = req.params;

    // TODO: 추천 상세 조회 로직 구현

    res.json({
      message: '추천 여행 상세 API (구현 예정)',
      id,
    });
  } catch (error) {
    next(error);
  }
};
