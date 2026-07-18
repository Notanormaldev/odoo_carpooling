import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as userService from '../services/user.service.js';

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user._id, req.body, req.file);
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

export default {
  updateProfile,
  addSavedPlace,
  getSavedPlaces,
  deleteSavedPlace,
  addEmergencyContact,
  deleteEmergencyContact,
};
