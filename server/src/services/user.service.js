import User from '../models/User.model.js';
import ApiError from '../utils/ApiError.js';
import { uploadImage } from './imagekit.service.js';
import { analyzeLicenseWithAI } from './licenseAi.service.js';
import { sendEmail } from '../config/brevo.js';

export const updateProfile = async (userId, updateData, files) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');

  // Handle Profile Photo Upload
  const profilePhotoFile = files?.profilePhoto?.[0];
  if (profilePhotoFile) {
    const fileName = `profile_${userId}_${Date.now()}`;
    updateData.profilePhoto = await uploadImage(profilePhotoFile.buffer, fileName, 'profiles');
  }

  // Handle Driving License Photo Upload & AI OCR analysis
  const dlPhotoFile = files?.drivingLicensePhoto?.[0];
  if (dlPhotoFile) {
    const fileName = `dl_${userId}_${Date.now()}`;
    updateData.drivingLicensePhoto = await uploadImage(dlPhotoFile.buffer, fileName, 'licenses');
    
    // Trigger AI Vision/OCR check
    const aiResult = await analyzeLicenseWithAI(dlPhotoFile.buffer, dlPhotoFile.originalname || '');
    updateData.drivingLicenseAiStatus = aiResult.status;
    updateData.drivingLicenseAiDetails = aiResult.details;
    updateData.drivingLicenseStatus = 'pending';
  } else if (updateData.drivingLicense && updateData.drivingLicense !== user.drivingLicense) {
    // If license number changed without uploading a new photo
    if (!user.drivingLicensePhoto) {
      throw ApiError.badRequest('Please upload a driving license document photo.');
    }
    updateData.drivingLicenseStatus = 'pending';
  }

  Object.assign(user, updateData);
  await user.save();
  return user;
};

export const addSavedPlace = async (userId, placeData) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');

  // Prevent duplicate labels
  const labelExists = user.savedPlaces.some(
    (p) => p.label.toLowerCase() === placeData.label.toLowerCase()
  );
  if (labelExists) throw ApiError.conflict(`Saved place with label "${placeData.label}" already exists`);

  user.savedPlaces.push(placeData);
  await user.save();
  return user.savedPlaces;
};

export const getSavedPlaces = async (userId) => {
  const user = await User.findById(userId).select('savedPlaces');
  if (!user) throw ApiError.notFound('User not found');
  return user.savedPlaces;
};

export const deleteSavedPlace = async (userId, placeId) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');

  user.savedPlaces = user.savedPlaces.filter((p) => p._id.toString() !== placeId);
  await user.save();
  return user.savedPlaces;
};

export const addEmergencyContact = async (userId, contactData) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');

  if (user.emergencyContacts.length >= 5) {
    throw ApiError.badRequest('You can add up to 5 emergency contacts only');
  }

  user.emergencyContacts.push(contactData);
  await user.save();
  return user.emergencyContacts;
};

export const deleteEmergencyContact = async (userId, contactId) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');

  user.emergencyContacts = user.emergencyContacts.filter((c) => c._id.toString() !== contactId);
  await user.save();
  return user.emergencyContacts;
};

export const setEmergencyEmail = async (userId, { emergencyEmail }) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');

  if (!emergencyEmail || !/^\S+@\S+\.\S+$/.test(emergencyEmail)) {
    throw ApiError.badRequest('Please provide a valid emergency email address');
  }

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  user.emergencyEmail = emergencyEmail;
  user.emergencyEmailVerified = false;
  user.emergencyEmailOtp = otp;
  user.emergencyEmailOtpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  await user.save();

  // Send OTP via email using Brevo API
  await sendEmail({
    to: emergencyEmail,
    subject: 'Emergency Contact Email Verification OTP - Carpooling',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px; max-width: 600px;">
        <h2 style="color: #e85d4a;">Emergency Contact Verification</h2>
        <p>Hello,</p>
        <p>A user (<strong>${user.name}</strong>) has added you as their emergency contact on the Odoo Carpooling Platform. To verify this email and activate priority SOS notifications, please share the OTP below with them:</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; font-size: 28px; font-weight: bold; text-align: center; color: #e85d4a; letter-spacing: 6px; margin: 20px 0;">
          ${otp}
        </div>
        <p>This OTP is valid for 15 minutes.</p>
        <p style="font-size: 12px; color: #777; margin-top: 30px;">Odoo Carpooling Platform</p>
      </div>
    `
  });

  return { 
    emergencyEmail: user.emergencyEmail, 
    emergencyEmailVerified: user.emergencyEmailVerified 
  };
};

export const verifyEmergencyEmail = async (userId, { otp }) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');

  if (!otp) throw ApiError.badRequest('OTP code is required');

  if (
    !user.emergencyEmailOtp || 
    user.emergencyEmailOtp !== otp || 
    new Date() > user.emergencyEmailOtpExpires
  ) {
    throw ApiError.badRequest('Invalid or expired OTP');
  }

  user.emergencyEmailVerified = true;
  user.emergencyEmailOtp = undefined;
  user.emergencyEmailOtpExpires = undefined;
  await user.save();

  return {
    emergencyEmail: user.emergencyEmail,
    emergencyEmailVerified: user.emergencyEmailVerified
  };
};

export default {
  updateProfile,
  addSavedPlace,
  getSavedPlaces,
  deleteSavedPlace,
  addEmergencyContact,
  deleteEmergencyContact,
  setEmergencyEmail,
  verifyEmergencyEmail,
};
