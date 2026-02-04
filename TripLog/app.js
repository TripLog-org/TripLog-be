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
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customSiteTitle: 'TripLog API 문서',
}));

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
