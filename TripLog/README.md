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

### ⭐ 추천 여행 (Recommendation)

| API | Method | Endpoint | 설명 |
|-----|--------|----------|------|
| 추천 여행 목록 | GET | `/api/recommendations` | 추천 여행지 목록 |
| 추천 여행 상세 | GET | `/api/recommendations/:id` | 추천 여행 상세 |
| 카테고리별 조회 | GET | `/api/recommendations?category=` | 카테고리 필터링 |

---

### ⚙️ 설정 (Settings)

| API | Method | Endpoint | 설명 |
|-----|--------|----------|------|
| 설정 조회 | GET | `/api/settings` | 사용자 설정 조회 |
| 설정 수정 | PUT | `/api/settings` | 알림, 테마 등 수정 |

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

**총 API 개수: 24개**
