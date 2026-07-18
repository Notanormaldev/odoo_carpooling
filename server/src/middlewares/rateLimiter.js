import rateLimit from 'express-rate-limit';
import ApiError from '../utils/ApiError.js';

const createLimiter = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
      next(ApiError.tooMany(message || options.message));
    },
  });

// General API rate limit: 10000 req / 15 min per IP (increased for dev testing)
export const apiLimiter = createLimiter(
  15 * 60 * 1000,
  10000,
  'Too many requests from this IP, please try again after 15 minutes'
);

// Auth routes: 10000 req / 15 min (increased for dev testing)
export const authLimiter = createLimiter(
  15 * 60 * 1000,
  10000,
  'Too many auth attempts from this IP, please try again after 15 minutes'
);

// Ride search: 10000 req / 1 min (increased for dev testing)
export const searchLimiter = createLimiter(
  60 * 1000,
  10000,
  'Too many search requests, please slow down'
);

// Payment: 10000 req / 5 min (increased for dev testing)
export const paymentLimiter = createLimiter(
  5 * 60 * 1000,
  10000,
  'Too many payment attempts, please try again in 5 minutes'
);

export default { apiLimiter, authLimiter, searchLimiter, paymentLimiter };
