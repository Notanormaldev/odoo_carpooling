import User from '../models/User.model.js';
import Organization from '../models/Organization.model.js';
import { generateTokenPair, verifyToken } from '../utils/tokenHelper.js';
import ApiError from '../utils/ApiError.js';
import { sendEmail } from '../config/brevo.js';

export const registerUser = async ({ name, email, password, mobile, department, officeLocation }) => {
  // Check org by email domain
  const domain = email.split('@')[1];
  let org = await Organization.findOne({ allowedEmailDomain: domain, isActive: true });
  if (!org && (domain === 'gmail.com' || process.env.NODE_ENVIRONMENT === 'development')) {
    org = await Organization.findOne({ isActive: true });
  }
  if (!org) {
    throw ApiError.forbidden(`No registered organization found for email domain: @${domain}`);
  }

  // Check duplicate
  const exists = await User.findOne({ email });
  if (exists) throw ApiError.conflict('Email already registered');

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const user = await User.create({
    name,
    email,
    password,
    mobile,
    department,
    officeLocation,
    orgId: org._id,
    role: 'employee',
    isEmailVerified: false,
    verificationOtp: otp,
    verificationOtpExpires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
  });

  // Update org employee count
  await Organization.findByIdAndUpdate(org._id, { $inc: { totalRegisteredEmployees: 1 } });

  // Send verification email
  sendEmail({
    to: email,
    subject: `Verify your Email - ${org.name} Carpooling`,
    htmlContent: `<h2>Hi ${name}!</h2><p>Your verification OTP is <b>${otp}</b>. It is valid for 15 minutes. Start carpooling and save fuel 🚗</p>`,
  }).catch(console.error);

  return {
    success: true,
    email,
    message: 'Verification OTP sent to your email.',
  };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password +refreshToken');
  if (!user) throw ApiError.unauthorized('Invalid email or password');

  if (!user.isActive) throw ApiError.forbidden('Account deactivated. Contact your admin.');
  if (!user.platformAccess) throw ApiError.forbidden('Platform access revoked. Contact your admin.');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw ApiError.unauthorized('Invalid email or password');

  // If email is not verified, throw error and send OTP
  if (!user.isEmailVerified) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationOtp = otp;
    user.verificationOtpExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    const org = await Organization.findById(user.orgId);
    sendEmail({
      to: email,
      subject: `Verify your Email - ${org?.name || 'Carpooling'}`,
      htmlContent: `<h2>Hi ${user.name}!</h2><p>Your verification OTP is <b>${otp}</b>. It is valid for 15 minutes. Start carpooling and save fuel 🚗</p>`,
    }).catch(console.error);

    throw new ApiError(403, 'Email not verified. OTP sent.', [{ unverified: true, email }]);
  }

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
      drivingLicense: user.drivingLicense,
      drivingLicenseStatus: user.drivingLicenseStatus,
      totalRides: user.totalRides,
      totalRidesOffered: user.totalRidesOffered,
      mobile: user.mobile,
      department: user.department,
      manager: user.manager,
      officeLocation: user.officeLocation,
      drivingLicensePhoto: user.drivingLicensePhoto,
      drivingLicenseAiStatus: user.drivingLicenseAiStatus,
      drivingLicenseAiDetails: user.drivingLicenseAiDetails,
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

export const handleGoogleUser = async ({ googleId, name, email, profilePhoto }) => {
  let user = await User.findOne({ email });

  if (!user) {
    throw ApiError.unauthorized('Your Google account email is not registered in this system. Please contact your administrator.');
  }

  if (!user.googleId) {
    user.googleId = googleId;
    user.profilePhoto = user.profilePhoto || profilePhoto;
    await user.save();
  }
  const tokens = generateTokenPair(user);
  const org = await Organization.findById(user.orgId).select('name logo');
  return { user, org, ...tokens };
};

export const verifyOtp = async ({ email, otp }) => {
  const user = await User.findOne({ email });
  if (!user) throw ApiError.notFound('User not found');
  if (user.isEmailVerified) throw ApiError.badRequest('Email is already verified');

  if (!user.verificationOtp || user.verificationOtp !== otp || new Date() > user.verificationOtpExpires) {
    throw ApiError.badRequest('Invalid or expired OTP');
  }

  user.isEmailVerified = true;
  user.verificationOtp = undefined;
  user.verificationOtpExpires = undefined;
  await user.save();

  const tokens = generateTokenPair(user);
  user.refreshToken = tokens.refreshToken;
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
      drivingLicense: user.drivingLicense,
      drivingLicenseStatus: user.drivingLicenseStatus,
      totalRides: user.totalRides,
      totalRidesOffered: user.totalRidesOffered,
    },
    org,
    ...tokens,
  };
};

export const resendOtp = async ({ email }) => {
  const user = await User.findOne({ email });
  if (!user) throw ApiError.notFound('User not found');
  if (user.isEmailVerified) throw ApiError.badRequest('Email is already verified');

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.verificationOtp = otp;
  user.verificationOtpExpires = new Date(Date.now() + 15 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  const org = await Organization.findById(user.orgId);

  await sendEmail({
    to: email,
    subject: `Verify your Email - ${org?.name || 'Carpooling'}`,
    htmlContent: `<h2>Hi ${user.name}!</h2><p>Your new verification OTP is <b>${otp}</b>. It is valid for 15 minutes. Start carpooling and save fuel 🚗</p>`,
  });

  return { success: true, message: 'OTP resent successfully.' };
};

export const forgotPassword = async ({ email }) => {
  const user = await User.findOne({ email });
  if (!user) throw ApiError.notFound('No account found with this email address');

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.verificationOtp = otp;
  user.verificationOtpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min
  await user.save({ validateBeforeSave: false });

  const org = await Organization.findById(user.orgId);
  await sendEmail({
    to: email,
    subject: `Password Reset OTP - ${org?.name || 'Carpooling'}`,
    htmlContent: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px; max-width: 600px;">
        <h2 style="color: #e85d4a;">Password Reset Request</h2>
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>You requested to reset your password. Use the OTP below:</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; font-size: 28px; font-weight: bold; text-align: center; color: #e85d4a; letter-spacing: 6px; margin: 20px 0;">
          ${otp}
        </div>
        <p>This OTP is valid for <strong>15 minutes</strong>. Do not share it with anyone.</p>
        <p>If you did not request a password reset, please ignore this email.</p>
        <p style="font-size: 12px; color: #777; margin-top: 30px;">Odoo Carpooling Platform</p>
      </div>
    `,
  });

  return { success: true, message: 'Password reset OTP sent to your email.' };
};

export const resetPassword = async ({ email, otp, newPassword }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) throw ApiError.notFound('No account found with this email address');

  if (
    !user.verificationOtp ||
    user.verificationOtp !== otp ||
    new Date() > user.verificationOtpExpires
  ) {
    throw ApiError.badRequest('Invalid or expired OTP. Please request a new one.');
  }

  user.password = newPassword; // pre-save hook will hash it
  user.verificationOtp = undefined;
  user.verificationOtpExpires = undefined;
  await user.save();

  return { success: true, message: 'Password reset successfully. Please log in with your new password.' };
};

export default { registerUser, loginUser, refreshAccessToken, logoutUser, handleGoogleUser, verifyOtp, resendOtp, forgotPassword, resetPassword };
