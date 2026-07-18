import User from '../models/User.model.js';
import Organization from '../models/Organization.model.js';
import { generateTokenPair, verifyToken } from '../utils/tokenHelper.js';
import ApiError from '../utils/ApiError.js';
import { sendEmail } from '../config/brevo.js';

export const registerUser = async ({ name, email, password, mobile, department, officeLocation }) => {
  // Check org by email domain
  const domain = email.split('@')[1];
  const org = await Organization.findOne({ allowedEmailDomain: domain, isActive: true });
  if (!org) {
    throw ApiError.forbidden(`No registered organization found for email domain: @${domain}`);
  }

  // Check duplicate
  const exists = await User.findOne({ email });
  if (exists) throw ApiError.conflict('Email already registered');

  const user = await User.create({
    name,
    email,
    password,
    mobile,
    department,
    officeLocation,
    orgId: org._id,
    role: 'employee',
  });

  // Update org employee count
  await Organization.findByIdAndUpdate(org._id, { $inc: { totalRegisteredEmployees: 1 } });

  // Send welcome email (non-blocking)
  sendEmail({
    to: email,
    subject: `Welcome to ${org.name} Carpooling Platform`,
    htmlContent: `<h2>Hi ${name}!</h2><p>Your account has been created. Start carpooling and save fuel 🚗</p>`,
  }).catch(console.error);

  const tokens = generateTokenPair(user);

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      orgId: user.orgId,
      profilePhoto: user.profilePhoto,
      walletBalance: user.walletBalance,
    },
    ...tokens,
    orgName: org.name,
  };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password +refreshToken');
  if (!user) throw ApiError.unauthorized('Invalid email or password');

  if (!user.isActive) throw ApiError.forbidden('Account deactivated. Contact your admin.');
  if (!user.platformAccess) throw ApiError.forbidden('Platform access revoked. Contact your admin.');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw ApiError.unauthorized('Invalid email or password');

  const tokens = generateTokenPair(user);

  user.refreshToken = tokens.refreshToken;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const org = await Organization.findById(user.orgId).select('name logo');

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      orgId: user.orgId,
      profilePhoto: user.profilePhoto,
      walletBalance: user.walletBalance,
      trustScore: user.trustScore,
    },
    ...tokens,
    org,
  };
};

export const refreshAccessToken = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) throw ApiError.unauthorized('Refresh token required');

  const decoded = verifyToken(incomingRefreshToken);
  if (!decoded) throw ApiError.unauthorized('Invalid or expired refresh token');

  const user = await User.findById(decoded.userId).select('+refreshToken');
  if (!user || user.refreshToken !== incomingRefreshToken) {
    throw ApiError.unauthorized('Refresh token mismatch');
  }

  const tokens = generateTokenPair(user);
  user.refreshToken = tokens.refreshToken;
  await user.save({ validateBeforeSave: false });

  return tokens;
};

export const logoutUser = async (userId) => {
  await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
};

export const handleGoogleUser = async ({ googleId, name, email, profilePhoto, isNewUser }) => {
  if (!isNewUser) {
    const user = await User.findOne({ email });
    const tokens = generateTokenPair(user);
    return { user, ...tokens };
  }

  // New Google user — check org domain
  const domain = email.split('@')[1];
  const org = await Organization.findOne({ allowedEmailDomain: domain, isActive: true });
  if (!org) throw ApiError.forbidden(`Organization not found for domain @${domain}`);

  const exists = await User.findOne({ email });
  if (exists) {
    const tokens = generateTokenPair(exists);
    return { user: exists, ...tokens };
  }

  const user = await User.create({
    name,
    email,
    googleId,
    profilePhoto,
    orgId: org._id,
    role: 'employee',
    isEmailVerified: true,
  });

  await Organization.findByIdAndUpdate(org._id, { $inc: { totalRegisteredEmployees: 1 } });
  const tokens = generateTokenPair(user);
  return { user, ...tokens };
};

export default { registerUser, loginUser, refreshAccessToken, logoutUser, handleGoogleUser };
