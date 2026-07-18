import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import passport from 'passport';

import { apiLimiter } from './middlewares/rateLimiter.js';
import errorHandler from './middlewares/errorHandler.js';
import configurePassport from './config/passport.js';
import routes from './routes/index.js';

const app = express();

// ─── Security Middleware ────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Request Parsing ────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// ─── Sanitization ───────────────────────────────────────────────────
app.use(mongoSanitize());

// ─── Compression ────────────────────────────────────────────────────
app.use(compression());

// ─── Logging ────────────────────────────────────────────────────────
if (process.env.NODE_ENVIRONMENT === 'development') {
  app.use(morgan('dev'));
}

// ─── Passport (Google OAuth) ────────────────────────────────────────
configurePassport();
app.use(passport.initialize());

// ─── Global Rate Limit ──────────────────────────────────────────────
app.use('/api', apiLimiter);

// ─── Health Check ───────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    environment: process.env.NODE_ENVIRONMENT,
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ─────────────────────────────────────────────────────
app.use('/api', routes);

// ─── 404 Handler ────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Global Error Handler ───────────────────────────────────────────
app.use(errorHandler);

export default app;
