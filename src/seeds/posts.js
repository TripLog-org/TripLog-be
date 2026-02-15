require('dotenv').config();
const mongoose = require('mongoose');
const { Post, User } = require('../models');
const config = require('../config');

const samplePosts = [
  {
    content: '서울 여행 - 경복궁, 남산타워, 홍대 투어 🏯🗼',
    images: [
      {
        url: '/uploads/posts/sample-gyeongbok.jpg',
        thumbnail: '/uploads/posts/sample-gyeongbok-thumb.jpg',
        order: 0,
        location: {
          name: '경복궁',
          coordinates: {
            latitude: 37.5796,
            longitude: 126.9770,
          },
          address: '서울특별시 종로구 사직로 161',
        },
        capturedAt: new Date('2026-02-10T10:30:00Z'),
        description: '경복궁의 아름다운 전경',
      },
      {
        url: '/uploads/posts/sample-namsan.jpg',
        thumbnail: '/uploads/posts/sample-namsan-thumb.jpg',
        order: 1,
        location: {
          name: '남산서울타워',
          coordinates: {
            latitude: 37.5512,
            longitude: 126.9882,
          },
          address: '서울특별시 용산구 남산공원길 105',
        },
        capturedAt: new Date('2026-02-10T14:00:00Z'),
        description: '남산타워에서 본 서울 전경',
      },
      {
        url: '/uploads/posts/sample-hongdae.jpg',
        thumbnail: '/uploads/posts/sample-hongdae-thumb.jpg',
        order: 2,
        location: {
          name: '홍대 거리',
          coordinates: {
            latitude: 37.5563,
            longitude: 126.9236,
          },
          address: '서울특별시 마포구 홍익로',
        },
        capturedAt: new Date('2026-02-10T19:00:00Z'),
        description: '홍대 거리 야경',
      },
    ],
    tags: ['서울', '여행', '관광'],
    visibility: 'public',
    isPublished: true,
    publishedAt: new Date('2026-02-10T20:00:00Z'),
    likeCount: 15,
    commentCount: 3,
    viewCount: 120,
  },
  {
    content: '부산 바다 여행 🌊 해운대와 광안리 해변',
    images: [
      {
        url: '/uploads/posts/sample-haeundae.jpg',
        thumbnail: '/uploads/posts/sample-haeundae-thumb.jpg',
        order: 0,
        location: {
          name: '해운대 해수욕장',
          coordinates: {
            latitude: 35.1587,
            longitude: 129.1603,
          },
          address: '부산광역시 해운대구 우동',
        },
        capturedAt: new Date('2026-02-12T11:00:00Z'),
        description: '해운대의 맑은 바다',
      },
      {
        url: '/uploads/posts/sample-gwangalli.jpg',
        thumbnail: '/uploads/posts/sample-gwangalli-thumb.jpg',
        order: 1,
        location: {
          name: '광안리 해수욕장',
          coordinates: {
            latitude: 35.1532,
            longitude: 129.1189,
          },
          address: '부산광역시 수영구 광안동',
        },
        capturedAt: new Date('2026-02-12T18:30:00Z'),
        description: '광안대교 야경',
      },
      {
        url: '/uploads/posts/sample-gamcheon.jpg',
        thumbnail: '/uploads/posts/sample-gamcheon-thumb.jpg',
        order: 2,
        location: {
          name: '감천문화마을',
          coordinates: {
            latitude: 35.0976,
            longitude: 129.0104,
          },
          address: '부산광역시 사하구 감내2로 203',
        },
        capturedAt: new Date('2026-02-13T10:00:00Z'),
        description: '알록달록한 감천문화마을',
      },
    ],
    tags: ['부산', '바다', '여행', '해변'],
    visibility: 'public',
    isPublished: true,
    publishedAt: new Date('2026-02-13T21:00:00Z'),
    likeCount: 28,
    commentCount: 7,
    viewCount: 230,
  },
  {
    content: '제주도 완전 정복 🌴 성산일출봉, 한라산, 협재해수욕장',
    images: [
      {
        url: '/uploads/posts/sample-seongsan.jpg',
        thumbnail: '/uploads/posts/sample-seongsan-thumb.jpg',
        order: 0,
        location: {
          name: '성산일출봉',
          coordinates: {
            latitude: 33.4585,
            longitude: 126.9423,
          },
          address: '제주특별자치도 서귀포시 성산읍',
        },
        capturedAt: new Date('2026-02-14T06:30:00Z'),
        description: '성산일출봉에서 본 일출',
      },
      {
        url: '/uploads/posts/sample-hallasan.jpg',
        thumbnail: '/uploads/posts/sample-hallasan-thumb.jpg',
        order: 1,
        location: {
          name: '한라산',
          coordinates: {
            latitude: 33.3617,
            longitude: 126.5292,
          },
          address: '제주특별자치도 제주시',
        },
        capturedAt: new Date('2026-02-14T11:00:00Z'),
        description: '한라산 백록담',
      },
      {
        url: '/uploads/posts/sample-hyeopjae.jpg',
        thumbnail: '/uploads/posts/sample-hyeopjae-thumb.jpg',
        order: 2,
        location: {
          name: '협재해수욕장',
          coordinates: {
            latitude: 33.3941,
            longitude: 126.2396,
          },
          address: '제주특별자치도 제주시 한림읍',
        },
        capturedAt: new Date('2026-02-14T15:30:00Z'),
        description: '에메랄드빛 협재해변',
      },
      {
        url: '/uploads/posts/sample-udo.jpg',
        thumbnail: '/uploads/posts/sample-udo-thumb.jpg',
        order: 3,
        location: {
          name: '우도',
          coordinates: {
            latitude: 33.5009,
            longitude: 126.9542,
          },
          address: '제주특별자치도 제주시 우도면',
        },
        capturedAt: new Date('2026-02-14T17:00:00Z'),
        description: '우도 해안 절경',
      },
    ],
    tags: ['제주도', '여행', '자연', '해변'],
    visibility: 'public',
    isPublished: true,
    publishedAt: new Date('2026-02-14T22:00:00Z'),
    likeCount: 42,
    commentCount: 12,
    viewCount: 350,
  },
  {
    content: '경주 역사 여행 📚 불국사와 석굴암, 첨성대',
    images: [
      {
        url: '/uploads/posts/sample-bulguksa.jpg',
        thumbnail: '/uploads/posts/sample-bulguksa-thumb.jpg',
        order: 0,
        location: {
          name: '불국사',
          coordinates: {
            latitude: 35.7898,
            longitude: 129.3320,
          },
          address: '경상북도 경주시 불국로 385',
        },
        capturedAt: new Date('2026-02-11T09:30:00Z'),
        description: '불국사의 웅장한 모습',
      },
      {
        url: '/uploads/posts/sample-cheomseongdae.jpg',
        thumbnail: '/uploads/posts/sample-cheomseongdae-thumb.jpg',
        order: 1,
        location: {
          name: '첨성대',
          coordinates: {
            latitude: 35.8347,
            longitude: 129.2193,
          },
          address: '경상북도 경주시 인왕동',
        },
        capturedAt: new Date('2026-02-11T14:00:00Z'),
        description: '신라시대 천문대 첨성대',
      },
    ],
    tags: ['경주', '역사', '문화유산'],
    visibility: 'public',
    isPublished: true,
    publishedAt: new Date('2026-02-11T20:00:00Z'),
    likeCount: 18,
    commentCount: 5,
    viewCount: 145,
  },
  {
    content: '강릉 여행 ☕ 커피 거리와 정동진',
    images: [
      {
        url: '/uploads/posts/sample-gangneung-coffee.jpg',
        thumbnail: '/uploads/posts/sample-gangneung-coffee-thumb.jpg',
        order: 0,
        location: {
          name: '안목해변 커피거리',
          coordinates: {
            latitude: 37.7717,
            longitude: 128.9481,
          },
          address: '강원특별자치도 강릉시 창해로',
        },
        capturedAt: new Date('2026-02-09T10:00:00Z'),
        description: '안목해변의 유명한 커피거리',
      },
      {
        url: '/uploads/posts/sample-jeongdongjin.jpg',
        thumbnail: '/uploads/posts/sample-jeongdongjin-thumb.jpg',
        order: 1,
        location: {
          name: '정동진 해변',
          coordinates: {
            latitude: 37.6903,
            longitude: 129.0342,
          },
          address: '강원특별자치도 강릉시 강동면',
        },
        capturedAt: new Date('2026-02-09T06:00:00Z'),
        description: '정동진 일출',
      },
    ],
    tags: ['강릉', '커피', '해변', '일출'],
    visibility: 'public',
    isPublished: true,
    publishedAt: new Date('2026-02-09T21:00:00Z'),
    likeCount: 22,
    commentCount: 6,
    viewCount: 180,
  },
];

async function seedPosts() {
  try {
    // MongoDB 연결
    await mongoose.connect(config.mongoUri);
    console.log('✓ MongoDB 연결 성공');

    // 첫 번째 사용자 찾기 (없으면 생성)
    let user = await User.findOne();
    
    if (!user) {
      console.log('사용자가 없습니다. 테스트 사용자를 먼저 생성하세요.');
      process.exit(1);
    }

    console.log(`✓ 사용자 찾음: ${user.email || user.name}`);

    // 기존 샘플 게시물 삭제 (선택사항)
    const existingCount = await Post.countDocuments({
      content: { $regex: '서울 여행|부산 바다|제주도 완전|경주 역사|강릉 여행' }
    });
    
    if (existingCount > 0) {
      console.log(`기존 샘플 게시물 ${existingCount}개 삭제 중...`);
      await Post.deleteMany({
        content: { $regex: '서울 여행|부산 바다|제주도 완전|경주 역사|강릉 여행' }
      });
    }

    // 새 게시물 삽입
    console.log(`\n${samplePosts.length}개의 샘플 게시물 삽입 중...`);
    
    for (const postData of samplePosts) {
      const post = await Post.create({
        ...postData,
        author: user._id,
      });
      
      console.log(`✓ 생성됨: ${post.content.substring(0, 30)}... (${post.images.length}장의 사진)`);
      
      // 각 이미지 위치 출력
      post.images.forEach((img, idx) => {
        if (img.location && img.location.coordinates) {
          console.log(`  📍 사진 ${idx + 1}: ${img.location.name} (${img.location.coordinates.latitude}, ${img.location.coordinates.longitude})`);
        }
      });
    }

    console.log(`\n✅ 총 ${samplePosts.length}개의 게시물이 성공적으로 삽입되었습니다!`);
    console.log('\n테스트 예시:');
    console.log('- 서울 근처: /api/posts?latitude=37.5665&longitude=126.9780&zoomLevel=11');
    console.log('- 부산 근처: /api/posts?latitude=35.1796&longitude=129.0756&zoomLevel=11');
    console.log('- 제주 근처: /api/posts?latitude=33.4996&longitude=126.5312&zoomLevel=10');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    process.exit(1);
  }
}

// 스크립트 실행
seedPosts();
