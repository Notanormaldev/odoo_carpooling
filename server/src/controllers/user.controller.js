import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import * as userService from '../services/user.service.js';
import User from '../models/User.model.js';

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user._id, req.body, req.files);
  return res.status(200).json(new ApiResponse(200, user, 'Profile updated successfully'));
});

export const addSavedPlace = asyncHandler(async (req, res) => {
  const places = await userService.addSavedPlace(req.user._id, req.body);
  return res.status(200).json(new ApiResponse(200, places, 'Place saved successfully'));
});

export const getSavedPlaces = asyncHandler(async (req, res) => {
  const places = await userService.getSavedPlaces(req.user._id);
  return res.status(200).json(new ApiResponse(200, places, 'Saved places fetched'));
});

export const deleteSavedPlace = asyncHandler(async (req, res) => {
  const places = await userService.deleteSavedPlace(req.user._id, req.params.id);
  return res.status(200).json(new ApiResponse(200, places, 'Saved place deleted'));
});

export const addEmergencyContact = asyncHandler(async (req, res) => {
  const contacts = await userService.addEmergencyContact(req.user._id, req.body);
  return res.status(200).json(new ApiResponse(200, contacts, 'Emergency contact added'));
});

export const deleteEmergencyContact = asyncHandler(async (req, res) => {
  const contacts = await userService.deleteEmergencyContact(req.user._id, req.params.id);
  return res.status(200).json(new ApiResponse(200, contacts, 'Emergency contact deleted'));
});

export const getPendingLicenses = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    throw ApiError.forbidden('Only admins can view pending licenses');
  }
  const users = await User.find({ drivingLicenseStatus: 'pending' }).select('name email drivingLicense drivingLicenseStatus drivingLicensePhoto drivingLicenseAiStatus drivingLicenseAiDetails');
  return res.status(200).json(new ApiResponse(200, users, 'Pending licenses fetched'));
});

export const verifyLicense = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    throw ApiError.forbidden('Only admins can verify licenses');
  }
  const { userId, status } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    throw ApiError.badRequest('Invalid status');
  }

  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');

  user.drivingLicenseStatus = status;
  if (status === 'rejected') {
    user.drivingLicense = '';
  }
  await user.save();

  return res.status(200).json(new ApiResponse(200, user, `Driving license status updated to ${status}`));
});

export default {
  updateProfile,
  addSavedPlace,
  getSavedPlaces,
  deleteSavedPlace,
  addEmergencyContact,
  deleteEmergencyContact,
  getPendingLicenses,
  verifyLicense,
};
