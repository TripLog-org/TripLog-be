# TripLog API Server

트립로그(TripLog) 앱을 위한 REST API 서버입니다.

## 실행 방법

1. 의존성 설치:
   ```bash
   npm install
   ```
2. 서버 실행:
   ```bash
   npm start
   ```
3. 브라우저에서 http://localhost:3000 접속

---

## API 목록

### 🔐 인증 (Auth) - SNS 로그인 전용

| API | Method | Endpoint | 설명 |
|-----|--------|----------|------|
| 애플 로그인 | POST | `/api/auth/apple` | 애플 ID 토큰 검증 및 로그인/회원가입 |
| 구글 로그인 | POST | `/api/auth/google` | 구글 ID 토큰 검증 및 로그인/회원가입 |
| 로그아웃 | POST | `/api/auth/logout` | 로그아웃 및 토큰 무효화 |
| 토큰 갱신 | POST | `/api/auth/refresh` | 액세스 토큰 갱신 |
| 회원 탈퇴 | DELETE | `/api/auth/withdraw` | 회원 탈퇴 (SNS 연동 해제 포함) |

---

### 👤 사용자 (User)

| API | Method | Endpoint | 설명 |
|-----|--------|----------|------|
| 내 정보 조회 | GET | `/api/users/me` | 로그인 사용자 정보 |
| 내 정보 수정 | PUT | `/api/users/me` | 프로필 수정 |

---

### 🗺️ 여행 (Trip)

| API | Method | Endpoint | 설명 |
|-----|--------|----------|------|
| 여행 목록 조회 | GET | `/api/trips` | 내 여행 전체 목록 |
| 여행 상세 조회 | GET | `/api/trips/:tripId` | 특정 여행 상세 |
| 여행 생성 | POST | `/api/trips` | 새 여행 추가 |
| 여행 수정 | PUT | `/api/trips/:tripId` | 여행 정보 수정 |
| 여행 삭제 | DELETE | `/api/trips/:tripId` | 여행 삭제 |

---

### 📍 장소 (Place)

| API | Method | Endpoint | 설명 |
|-----|--------|----------|------|
| 장소 목록 조회 | GET | `/api/trips/:tripId/places` | 여행 내 장소 목록 |
| 장소 상세 조회 | GET | `/api/places/:placeId` | 특정 장소 상세 |
| 장소 추가 | POST | `/api/trips/:tripId/places` | 여행에 장소 추가 |
| 장소 수정 | PUT | `/api/places/:placeId` | 장소 정보 수정 |
| 장소 삭제 | DELETE | `/api/places/:placeId` | 장소 삭제 |
| 장소 검색 | GET | `/api/places/search` | 지도 기반 장소 검색 |

---

### 📷 사진 (Photo)

| API | Method | Endpoint | 설명 |
|-----|--------|----------|------|
| 사진 목록 조회 | GET | `/api/places/:placeId/photos` | 장소별 사진 목록 |
| 사진 상세 조회 | GET | `/api/photos/:photoId` | 특정 사진 상세 |
| 사진 업로드 | POST | `/api/places/:placeId/photos` | 사진 업로드 |
| 사진 삭제 | DELETE | `/api/photos/:photoId` | 사진 삭제 |
| 대표 이미지 설정 | PUT | `/api/trips/:tripId/cover` | 여행 대표 이미지 지정 |

---

### 📝 게시물 및 댓글 (Posts & Comments)

| API | Method | Endpoint | 설명 |
|-----|--------|----------|------|
| 게시물 목록 조회 | GET | `/api/posts` | 피드 조회 (페이징 지원) |
| 게시물 상세 조회 | GET | `/api/posts/:postId` | 특정 게시물 상세 |
| 게시물 생성 | POST | `/api/posts` | 게시물 작성 (이미지 다중 업로드 지원) |
| 게시물 수정 | PUT | `/api/posts/:postId` | 게시물 수정 |
| 게시물 삭제 | DELETE | `/api/posts/:postId` | 게시물 삭제 |
| 게시물 좋아요 | POST | `/api/posts/:postId/like` | 게시물 좋아요 추가/제거 (토글) |
| 댓글 목록 조회 | GET | `/api/posts/:postId/comments` | 게시물 댓글 조회 |
| 댓글 작성 | POST | `/api/posts/:postId/comments` | 댓글 작성 |
| 댓글 수정 | PUT | `/api/comments/:commentId` | 댓글 수정 |
| 댓글 삭제 | DELETE | `/api/comments/:commentId` | 댓글 삭제 |
| 댓글 좋아요 | POST | `/api/comments/:commentId/like` | 댓글 좋아요 추가/제거 (토글) |

**게시물 생성 예시**:
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Authorization: Bearer {token}" \
  -F "content=부산 여행 너무 좋았어요!" \
  -F "images=@photo1.jpg" \
  -F "images=@photo2.jpg" \
  -F "tags=부산,여행,맛집" \
  -F "visibility=public"
```

**지원 이미지 형식**: JPEG, JPG, PNG, GIF, WebP (최대 10개, 파일당 10MB 이하)

---

### ⭐ 추천 여행 (Recommendation)

| API | Method | Endpoint | 설명 |
|-----|--------|----------|------|
| 추천 여행 목록 | GET | `/api/recommendations` | 추천 여행지 목록 (DB/공공 API, 페이징 지원) |
| 추천 여행 상세 | GET | `/api/recommendations/:id` | 추천 여행 상세 조회 |
| 관광정보 검색 | GET | `/api/recommendations/search` | 한국관광공사 공공 API 키워드 검색 |

---

### 🔖 북마크 (Bookmark)

| API | Method | Endpoint | 설명 |
|-----|--------|----------|------|
| 북마크 토글 | POST | `/api/bookmarks/toggle` | 북마크 추가/제거 (토글) |
| 북마크 목록 조회 | GET | `/api/bookmarks` | 내 북마크 목록 (페이징 지원) |
| 북마크 상태 확인 | GET | `/api/bookmarks/check/:id` | 특정 여행지 북마크 여부 확인 |
| 모든 북마크 삭제 | DELETE | `/api/bookmarks` | 북마크 일괄 삭제 |

**쿼리 파라미터**:
- `category`: 카테고리 필터 (관광지, 문화시설, 축제공연행사, 여행코스, 레포츠, 숙박, 쇼핑, 산, 바다, 도시)
- `region`: 지역 (공공 API 사용 시)
- `usePublicApi`: true/false (기본값: false - DB 데이터 사용)
- `page`: 페이지 번호 (기본값: 1)
- `pageSize`: 한 페이지 항목 수 (기본값: 20, 최대: 100)

**예시**:
```
# 제주의 관광지 추천 (공공 API, 1페이지, 페이지당 10개)
GET /api/recommendations?region=제주&usePublicApi=true&category=관광지&page=1&pageSize=10

# DB 추천 정보 (산 카테고리, 2페이지)
GET /api/recommendations?category=산&page=2&pageSize=20

# 키워드 검색 (페이징 지원)
GET /api/recommendations/search?keyword=서울&page=1&pageSize=20
```

---

### 🔖 북마크 (Bookmark)

| API | Method | Endpoint | 설명 |
|-----|--------|----------|------|
| 북마크 토글 | POST | `/api/bookmarks/toggle` | 북마크 추가/제거 (토글) |
| 북마크 목록 조회 | GET | `/api/bookmarks` | 내 북마크 목록 (페이징 지원) |
| 북마크 상태 확인 | GET | `/api/bookmarks/check/:id` | 특정 여행지 북마크 여부 확인 |
| 모든 북마크 삭제 | DELETE | `/api/bookmarks` | 북마크 일괄 삭제 |

**쿼리 파라미터** (목록 조회):
- `page`: 페이지 번호 (기본값: 1)
- `pageSize`: 한 페이지 항목 수 (기본값: 20, 최대: 100)
- `sortBy`: 정렬 기준 (-createdAt, createdAt, title, -title)

**예시**:
```bash
# 북마크 추가/제거
POST /api/bookmarks/toggle
Headers: Authorization: Bearer {token}
Body: {"recommendationId": "2850913"}

# 북마크 목록 조회 (페이징)
GET /api/bookmarks?page=1&pageSize=10
Headers: Authorization: Bearer {token}

# 북마크 상태 확인
GET /api/bookmarks/check/2850913
Headers: Authorization: Bearer {token}
```

**응답 예시**:
```json
// 북마크 토글 - 추가 시
{
  "message": "북마크가 추가되었습니다",
  "isBookmarked": true,
  "bookmarkCount": 5
}

// 북마크 목록 조회
{
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 5,
    "totalPages": 1
  },
  "count": 5,
  "data": ["2850913", "2850914", "69833ce1819d809ddb3a869b"]
}
```

---

### ⚙️ 설정 (Settings)

| API | Method | Endpoint | 설명 |
|-----|--------|----------|------|
| 설정 조회 | GET | `/api/settings` | 사용자 설정 조회 |
| 설정 수정 | PUT | `/api/settings` | 알림, 테마 등 수정 |

---

## 공공 API 통합

### 한국관광공사 관광정보 서비스

TripLog는 한국관광공사의 공공 API를 통합하여 실시간 국내 관광정보를 제공합니다.

**Base URL**: `https://apis.data.go.kr/B551011/KorService2`

**주요 기능**:
- 🗺️ **지역기반 관광정보 조회** (`areaBasedList2`)
  - 지역코드별 관광지, 문화시설, 축제, 숙박 등 조회
  - 카테고리 필터링 지원
  - 페이징 처리 (최대 100개/페이지)

- 🔍 **키워드 검색** (`searchKeyword2`)
  - 전국 관광정보 검색
  - 페이징 지원

- 📋 **상세정보 조회** (`detailCommon2`, `detailImage2`)
  - 관광지 상세 정보 및 이미지 조회

**지원 지역** (17개):
서울, 인천, 대전, 대구, 광주, 부산, 울산, 세종, 경기, 강원, 충북, 충남, 전북, 전남, 경북, 경남, 제주

**카테고리** (공공 API):
- 관광지 (12)
- 문화시설 (14)
- 축제공연행사 (15)
- 여행코스 (25)
- 레포츠 (28)
- 숙박 (32)
- 쇼핑 (38)

**환경변수 설정**:
```
# .env 파일
TOUR_API_KEY=your_api_key_here
```

---

## 페이징 처리

모든 목록 조회 API에서 페이징을 지원합니다.

**응답 구조**:
```json
{
  "source": "database",
  "pagination": {
    "page": 1,           // 현재 페이지
    "pageSize": 20,      // 페이지 크기
    "total": 1904,       // 전체 항목 수
    "totalPages": 96     // 전체 페이지 수
  },
  "count": 20,           // 현재 페이지 항목 수
  "category": "산",
  "data": [...]          // 데이터 배열
}
```

**페이징 파라미터**:
- `page`: 1부터 시작 (기본값: 1)
- `pageSize`: 1~100 사이의 값 (기본값: 20)

---

## 인증 방식

### 요청 예시

```json
// POST /api/auth/apple
{
  "idToken": "애플에서 받은 ID 토큰",
  "authorizationCode": "인가 코드 (선택)"
}

// POST /api/auth/google
{
  "idToken": "구글에서 받은 ID 토큰"
}
```

### 응답 예시

```json
{
  "accessToken": "JWT 액세스 토큰",
  "refreshToken": "JWT 리프레시 토큰",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "홍길동",
    "provider": "apple"
  },
  "isNewUser": true
}
```

### 인증 헤더

모든 인증이 필요한 API 요청 시:
```
Authorization: Bearer {accessToken}
```

---

## 샘플 데이터 추가

데이터베이스에 샘플 추천여행지를 추가하려면:

```bash
npm run seed:recommendations
```

이 명령어는 5개의 샘플 추천여행지를 DB에 추가합니다:
- 제주 한라산 등산 (산)
- 강릉 정동진 해변 일출 (바다)
- 지리산 천왕봉 트레킹 (산)
- 서울 남산 야경 (도시)
- 부산 광안리 해수욕장 (바다)

---

## API 문서

### Swagger UI
서버 실행 후 http://localhost:3000/api-docs 에서 모든 API 문서와 테스트 기능을 사용할 수 있습니다.

---

## 기술 스택

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT + Apple/Google OAuth2
- **API Documentation**: Swagger/OpenAPI 3.0
- **HTTP Client**: Axios
- **Security**: Helmet, CORS, Morgan

---

## 구조

```
src/
├── config/              # 설정
│   ├── index.js        # 환경변수 관리
│   ├── database.js     # MongoDB 연결
│   └── swagger.js      # Swagger 설정
├── controllers/        # 요청 처리 로직
├── models/             # Mongoose 스키마
├── routes/             # API 라우트
├── middlewares/        # 미들웨어
├── services/           # 외부 API 호출 (공공 API 등)
└── seeds/              # 데이터 시드 스크립트
```

---

**총 API 개수: 30개** (북마크 4개 포함)

**마지막 업데이트**: 2026.02.05
- ✅ 한국관광공사 공공 API 통합
- ✅ 카테고리 필터링 (DB & 공공 API)
- ✅ 페이징 처리 (모든 목록 조회 API)
- ✅ 북마크 기능 (추가/제거/목록/일괄삭제)
- ✅ Swagger 문서 업데이트
- ✅ 게시물 이미지 업로드 기능 (다중 파일 지원)
