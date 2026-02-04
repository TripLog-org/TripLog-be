const mongoose = require('mongoose');
require('dotenv').config();
const { Recommendation } = require('../models');

async function seedRecommendations() {
  try {
    // MongoDB 연결
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    // 기존 데이터 삭제
    await Recommendation.deleteMany({});
    console.log('Deleted existing recommendations');

    // 샘플 데이터
    const seedData = [
      {
        title: '제주 한라산 등산',
        description: '제주의 가장 높은 산 한라산은 제주도의 상징입니다. 계절별 다양한 등산코스가 있으며, 정상에서의 일출과 일몰은 정말 아름답습니다.',
        category: '산',
        region: '제주',
        tags: ['등산', '자연', '경기'],
        coverImage: 'https://via.placeholder.com/400x300?text=Hallasan',
        isPublished: true,
      },
      {
        title: '강릉 정동진 해변 일출',
        description: '정동진은 한반도에서 가장 동쪽에 있는 해변마을로, 드라마의 촬영지로 유명합니다. 새벽에 일출을 감상하면 평생 잊지 못할 추억이 될 것입니다.',
        category: '바다',
        region: '강원',
        tags: ['해변', '일출', '사진명소'],
        coverImage: 'https://via.placeholder.com/400x300?text=Jeongdongjin',
        isPublished: true,
      },
      {
        title: '지리산 천왕봉 트레킹',
        description: '남한의 가장 큰 산 지리산은 다양한 코스와 웅장한 자연 경관이 특징입니다. 천왕봉에 오르면 한반도의 전체 산맥을 볼 수 있습니다.',
        category: '산',
        region: '경남',
        tags: ['등산', '트레킹', '자연'],
        coverImage: 'https://via.placeholder.com/400x300?text=Jirisan',
        isPublished: true,
      },
      {
        title: '서울 남산 야경',
        description: '서울의 중심인 남산에서는 서울 전체의 야경을 한 눈에 볼 수 있습니다. 야간에 올라가는 것을 추천합니다.',
        category: '도시',
        region: '서울',
        tags: ['야경', '산책', '도시'],
        coverImage: 'https://via.placeholder.com/400x300?text=Namsan',
        isPublished: true,
      },
      {
        title: '부산 광안리 해수욕장',
        description: '부산의 대표적인 해수욕장 광안리는 넓은 백사장과 맑은 바다가 특징입니다. 여름 휴가 시즌에 많은 관광객들이 방문합니다.',
        category: '바다',
        region: '부산',
        tags: ['해변', '휴가', '물놀이'],
        coverImage: 'https://via.placeholder.com/400x300?text=Gwangalli',
        isPublished: true,
      },
    ];

    // 데이터 삽입
    await Recommendation.insertMany(seedData);
    console.log(`${seedData.length} recommendations seeded successfully`);

    // 삽입된 데이터 확인
    const count = await Recommendation.countDocuments();
    console.log(`Total recommendations in database: ${count}`);

    mongoose.connection.close();
  } catch (error) {
    console.error('Seeding error:', error);
    mongoose.connection.close();
    process.exit(1);
  }
}

seedRecommendations();
