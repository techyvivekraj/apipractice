import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import authRoutes from './src/routes/authRoute.js';
import errorHandler from './src/utils/errorHandler.js';
import db from './src/config/db.js';
import compression from 'compression';
import setupRoutes from './src/routes/setupRoute.js';
import employeeRoutes from './src/routes/employeeRoutes.js';
const app = express();

// Security Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate Limiting
// const limiter = rateLimit({
//   windowMs: process.env.RATE_LIMIT_WINDOW * 60 * 1000,
//   max: process.env.RATE_LIMIT_MAX,
// });
// app.use(limiter);

// Body Parsing
app.use(express.json({ limit: '10kb' }));
app.use(mongoSanitize());

// Routes
app.use('/api/v1/auth/', authRoutes);
app.use('/api/v1/', setupRoutes);
app.use('/api/v1/', employeeRoutes);

// Error Handling
app.use(errorHandler);

// Database Connection Test
(async () => {
  try {
    const connection = await db.getConnection();
    console.log('Database connected successfully');
    connection.release();
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
})();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});