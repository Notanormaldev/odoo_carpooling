import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as vehicleService from '../services/vehicle.service.js';

export const createVehicle = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.createVehicle(
    req.user._id,
    req.user.orgId,
    req.body,
    req.file
  );
  return res.status(201).json(new ApiResponse(201, vehicle, 'Vehicle registered successfully. Awaiting admin approval.'));
});

export const getMyVehicles = asyncHandler(async (req, res) => {
  const vehicles = await vehicleService.getMyVehicles(req.user._id);
  return res.status(200).json(new ApiResponse(200, vehicles, 'Vehicles fetched'));
});

export const getVehicleById = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.getVehicleById(req.params.id, req.user._id);
  return res.status(200).json(new ApiResponse(200, vehicle, 'Vehicle details fetched'));
});

export const deleteVehicle = asyncHandler(async (req, res) => {
  await vehicleService.deleteVehicle(req.params.id, req.user._id);
  return res.status(200).json(new ApiResponse(200, null, 'Vehicle deleted successfully'));
});

export const adminApproveVehicle = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.adminApproveVehicle(
    req.params.id,
    req.user._id,
    req.body
  );
  return res.status(200).json(new ApiResponse(200, vehicle, `Vehicle status updated to ${vehicle.status}`));
});

export default { createVehicle, getMyVehicles, getVehicleById, deleteVehicle, adminApproveVehicle };
