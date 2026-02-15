require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const config = require('./src/config');
const connectDB = require('./src/config/database');
const swaggerSpec = require('./src/config/swagger');
const routes = require('./src/routes');
const errorHandler = require('./src/middlewares/errorHandler');

const app = express();

// DB 연결
connectDB();

// 미들웨어
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적 파일 제공 (업로드된 이미지)
app.use('/uploads', express.static('uploads'));

// 테스트 파일 제공
app.get('/test-google-login', (req, res) => {
  res.sendFile(__dirname + '/test_google_login.html');
});

app.get('/test-apple-login', (req, res) => {
  res.sendFile(__dirname + '/test_apple_login.html');
});

app.get('/test-image-upload', (req, res) => {
  res.sendFile(__dirname + '/test_image_upload.html');
});

// Swagger UI with dynamic server URL
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', (req, res, next) => {
  const protocol = req.protocol;
  const host = req.get('host');
  const dynamicSwaggerSpec = {
    ...swaggerSpec,
    servers: [
      {
        url: `${protocol}://${host}`,
        description: '현재 서버',
      },
      {
        url: 'http://localhost:3000',
        description: '로컬 서버',
      },
    ],
  };
  
  swaggerUi.setup(dynamicSwaggerSpec, {
    explorer: true,
    customSiteTitle: 'TripLog API 문서',
  })(req, res, next);
});

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'TripLog API Server', version: '1.0.0' });
});

// API 라우터
app.use('/api', routes);

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({ message: '요청한 리소스를 찾을 수 없습니다.' });
});

// 에러 핸들러
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Server running at http://localhost:${config.port}`);
});
