import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import * as authService from '../services/auth.service.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENVIRONMENT === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);
  res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
  return res.status(201).json(
    new ApiResponse(201, {
      user: result.user,
      accessToken: result.accessToken,
      orgName: result.orgName,
    }, 'Account created successfully')
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
  return res.status(200).json(new ApiResponse(200, req.user, 'User profile fetched'));
});

export default { register, login, refresh, logout, googleCallback, getMe };
