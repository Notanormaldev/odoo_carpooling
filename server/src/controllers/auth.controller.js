import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import * as authService from '../services/auth.service.js';
import User from '../models/User.model.js';
import jwt from 'jsonwebtoken';
import { getRedisClient } from '../config/redis.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENVIRONMENT === 'production',
  sameSite: process.env.NODE_ENVIRONMENT === 'production' ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);
  return res.status(201).json(
    new ApiResponse(201, { email: result.email }, result.message)
  );
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.loginUser(req.body);
  res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
  return res.status(200).json(
    new ApiResponse(200, {
      user: result.user,
      accessToken: result.accessToken,
      org: result.org,
    }, 'Login successful')
  );
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  const tokens = await authService.refreshAccessToken(token);
  res.cookie('refreshToken', tokens.refreshToken, COOKIE_OPTIONS);
  return res.status(200).json(
    new ApiResponse(200, { accessToken: tokens.accessToken }, 'Token refreshed')
  );
});

export const logout = asyncHandler(async (req, res) => {
  // Extract token
  let token;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (token) {
    try {
      const redis = getRedisClient();
      const decoded = jwt.decode(token);
      if (decoded && decoded.exp) {
        const secondsUntilExpiry = decoded.exp - Math.floor(Date.now() / 1000);
        if (secondsUntilExpiry > 0) {
          await redis.set(`blacklist:${token}`, '1', 'EX', secondsUntilExpiry);
        }
      } else {
        await redis.set(`blacklist:${token}`, '1', 'EX', 86400); // 1 day fallback
      }
    } catch (err) {
      console.error('Failed to blacklist token in Redis:', err);
    }
  }

  await authService.logoutUser(req.user._id);
  res.clearCookie('refreshToken');
  return res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
});

export const googleCallback = asyncHandler(async (req, res) => {
  const profile = req.user;
  if (!profile) throw ApiError.unauthorized('Google authentication failed');

  const result = await authService.handleGoogleUser(profile);
  res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);

  // Redirect to frontend with access token
  res.redirect(
    `${process.env.CLIENT_URL}/auth/google/success?token=${result.accessToken}`
  );
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('orgId', 'name logo');
  return res.status(200).json(new ApiResponse(200, user, 'User profile fetched'));
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    throw ApiError.badRequest('Email and OTP are required');
  }
  const result = await authService.verifyOtp({ email, otp });
  res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
  return res.status(200).json(
    new ApiResponse(200, { accessToken: result.accessToken, user: result.user, org: result.org }, 'Email verified successfully')
  );
});

export const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw ApiError.badRequest('Email is required');
  }
  const result = await authService.resendOtp({ email });
  return res.status(200).json(new ApiResponse(200, null, result.message));
});

export default { register, login, refresh, logout, googleCallback, getMe, verifyOtp, resendOtp };
