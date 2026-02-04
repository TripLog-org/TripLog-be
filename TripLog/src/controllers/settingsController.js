// 설정 조회
exports.getSettings = async (req, res, next) => {
  try {
    // TODO: 사용자 설정 모델 및 조회 로직 구현

    res.json({
      notifications: {
        push: true,
        email: false,
      },
      theme: 'light',
      language: 'ko',
    });
  } catch (error) {
    next(error);
  }
};

// 설정 수정
exports.updateSettings = async (req, res, next) => {
  try {
    const { notifications, theme, language } = req.body;

    // TODO: 사용자 설정 저장 로직 구현

    res.json({
      notifications,
      theme,
      language,
    });
  } catch (error) {
    next(error);
  }
};
