import User from '../models/User.model.js';
import ApiError from '../utils/ApiError.js';
import { uploadImage } from './imagekit.service.js';

export const updateProfile = async (userId, updateData, file) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');

  if (file) {
    const fileName = `profile_${userId}_${Date.now()}`;
    updateData.profilePhoto = await uploadImage(file.buffer, fileName, 'profiles');
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

export default {
  updateProfile,
  addSavedPlace,
  getSavedPlaces,
  deleteSavedPlace,
  addEmergencyContact,
  deleteEmergencyContact,
};
