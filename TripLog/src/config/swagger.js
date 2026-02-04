const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TripLog API',
      version: '1.0.0',
      description: '트립로그 앱을 위한 REST API 서버',
      contact: {
        name: 'TripLog Team',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: '개발 서버',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            email: { type: 'string', example: 'user@example.com' },
            name: { type: 'string', example: '홍길동' },
            profileImage: { type: 'string', example: 'https://example.com/image.jpg' },
            provider: { type: 'string', enum: ['apple', 'google'], example: 'apple' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Trip: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            user: { type: 'string', example: '507f1f77bcf86cd799439011' },
            title: { type: 'string', example: '제주도 여행' },
            description: { type: 'string', example: '가족과 함께한 제주도 여행' },
            coverImage: { type: 'string', example: 'https://example.com/cover.jpg' },
            startDate: { type: 'string', format: 'date', example: '2026-01-01' },
            endDate: { type: 'string', format: 'date', example: '2026-01-05' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Place: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            trip: { type: 'string', example: '507f1f77bcf86cd799439011' },
            name: { type: 'string', example: '성산일출봉' },
            description: { type: 'string', example: '일출 명소' },
            address: { type: 'string', example: '제주특별자치도 서귀포시 성산읍' },
            location: {
              type: 'object',
              properties: {
                type: { type: 'string', example: 'Point' },
                coordinates: { type: 'array', items: { type: 'number' }, example: [126.9423, 33.4580] },
              },
            },
            visitedAt: { type: 'string', format: 'date-time' },
            order: { type: 'integer', example: 0 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Photo: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            place: { type: 'string', example: '507f1f77bcf86cd799439011' },
            url: { type: 'string', example: 'https://example.com/photo.jpg' },
            thumbnailUrl: { type: 'string', example: 'https://example.com/thumb.jpg' },
            caption: { type: 'string', example: '멋진 풍경' },
            takenAt: { type: 'string', format: 'date-time' },
            order: { type: 'integer', example: 0 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            user: { $ref: '#/components/schemas/User' },
            isNewUser: { type: 'boolean', example: false },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string', example: '에러 메시지' },
          },
        },
        Settings: {
          type: 'object',
          properties: {
            notifications: {
              type: 'object',
              properties: {
                push: { type: 'boolean', example: true },
                email: { type: 'boolean', example: false },
              },
            },
            theme: { type: 'string', enum: ['light', 'dark'], example: 'light' },
            language: { type: 'string', example: 'ko' },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: '인증 API (애플/구글 SNS 로그인)' },
      { name: 'Users', description: '사용자 API' },
      { name: 'Trips', description: '여행 API' },
      { name: 'Places', description: '장소 API' },
      { name: 'Photos', description: '사진 API' },
      { name: 'Recommendations', description: '추천 여행 API' },
      { name: 'Settings', description: '설정 API' },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
