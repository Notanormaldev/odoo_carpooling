import Vehicle from '../models/Vehicle.model.js';
import ApiError from '../utils/ApiError.js';
import { uploadImage } from './imagekit.service.js';

export const createVehicle = async (ownerId, orgId, vehicleData, file) => {
  const { model, registrationNumber, seatingCapacity, fuelType, fuelEfficiency } = vehicleData;

  const exists = await Vehicle.findOne({ registrationNumber });
  if (exists) throw ApiError.conflict('Vehicle with this registration number already registered');

  let rcPhotoUrl = '';
  if (file) {
    const fileName = `rc_${registrationNumber}_${Date.now()}`;
    rcPhotoUrl = await uploadImage(file.buffer, fileName, 'vehicles');
  }

  const vehicle = await Vehicle.create({
    ownerId,
    orgId,
    model,
    registrationNumber,
    seatingCapacity,
    fuelType,
    fuelEfficiency,
    rcPhotoUrl,
    status: 'pending', // Awaiting admin approval
  });

  return vehicle;
};

export const getMyVehicles = async (ownerId) => {
  return Vehicle.find({ ownerId });
};

export const getVehicleById = async (vehicleId, ownerId) => {
  const vehicle = await Vehicle.findOne({ _id: vehicleId, ownerId });
  if (!vehicle) throw ApiError.notFound('Vehicle not found');
  return vehicle;
};

export const deleteVehicle = async (vehicleId, ownerId) => {
  const vehicle = await Vehicle.findOneAndDelete({ _id: vehicleId, ownerId });
  if (!vehicle) throw ApiError.notFound('Vehicle not found');
  return vehicle;
};

export const adminApproveVehicle = async (vehicleId, adminId, { status }) => {
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) throw ApiError.notFound('Vehicle not found');

  vehicle.status = status;
  vehicle.approvedAt = status === 'active' ? new Date() : undefined;
  vehicle.approvedBy = status === 'active' ? adminId : undefined;
  await vehicle.save();

  return vehicle;
};

export default { createVehicle, getMyVehicles, getVehicleById, deleteVehicle, adminApproveVehicle };
