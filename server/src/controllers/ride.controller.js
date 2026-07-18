import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as rideService from '../services/ride.service.js';

export const createRide = asyncHandler(async (req, res) => {
  const ride = await rideService.createRide(req.user._id, req.user.orgId, req.body);
  return res.status(201).json(new ApiResponse(201, ride, 'Ride published successfully'));
});

export const searchRides = asyncHandler(async (req, res) => {
  const rides = await rideService.searchRides(req.user.orgId, req.query);
  return res.status(200).json(new ApiResponse(200, rides, 'Rides fetched'));
});

export const getRideById = asyncHandler(async (req, res) => {
  const ride = await rideService.getRideById(req.params.id);
  return res.status(200).json(new ApiResponse(200, ride, 'Ride fetched'));
});

export const cancelRide = asyncHandler(async (req, res) => {
  const ride = await rideService.cancelRide(req.params.id, req.user._id);
  return res.status(200).json(new ApiResponse(200, ride, 'Ride cancelled'));
});

export const getMyRides = asyncHandler(async (req, res) => {
  const rides = await rideService.getMyRides(req.user._id);
  return res.status(200).json(new ApiResponse(200, rides, 'My rides fetched'));
});

export const suggestFare = asyncHandler(async (req, res) => {
  const { distanceKm } = req.query;
  const fare = await rideService.suggestFare(req.user.orgId, parseFloat(distanceKm));
  return res.status(200).json(new ApiResponse(200, fare, 'Fare suggestion calculated'));
});

export default { createRide, searchRides, getRideById, cancelRide, getMyRides, suggestFare };
