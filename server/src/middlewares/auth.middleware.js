import { verifyToken } from '../utils/tokenHelper.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.model.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check Authorization header
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Check cookie
  else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    throw ApiError.unauthorized('Access token required');
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    throw ApiError.unauthorized('Invalid or expired token');
  }

  const user = await User.findById(decoded.userId).select('-password -refreshToken');
  if (!user) {
    throw ApiError.unauthorized('User not found');
  }

  if (!user.isActive) {
    throw ApiError.forbidden('Your account has been deactivated. Contact your admin.');
  }

  req.user = user;
  next();
});

export const requireAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw ApiError.unauthorized('Authentication required');
  }

  if (req.user.role !== 'admin') {
    throw ApiError.forbidden('Admin access required');
  }

  next();
});

export const requireEmployee = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw ApiError.unauthorized('Authentication required');
  }

  if (req.user.role !== 'employee' && req.user.role !== 'admin') {
    throw ApiError.forbidden('Employee access required');
  }

  next();
});

export default { protect, requireAdmin, requireEmployee };
