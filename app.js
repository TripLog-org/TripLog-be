require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

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

// Swagger spec with dynamic server URL
const getDynamicSwaggerSpec = (req) => {
  const protocol = req.protocol;
  const host = req.get('host');

  return {
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
};

// Swagger JSON endpoint
app.get('/api-docs.json', (req, res) => {
  res.json(getDynamicSwaggerSpec(req));
});

// Swagger UI page (CDN assets, Vercel 호환)
app.get('/api-docs', (req, res) => {
  const html = `<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TripLog API 문서</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
    <style>
      html, body { margin: 0; padding: 0; }
      #swagger-ui { max-width: 1200px; margin: 0 auto; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
    <script>
      window.onload = () => {
        window.ui = SwaggerUIBundle({
          url: '/api-docs.json',
          dom_id: '#swagger-ui',
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
          layout: 'BaseLayout',
          docExpansion: 'none',
          displayRequestDuration: true,
        });
      };
    </script>
  </body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
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

// 로컬 실행 시에만 listen (Vercel에서는 module.exports로 처리)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(config.port, () => {
    console.log(`Server running at http://localhost:${config.port}`);
  });
}

module.exports = app;
