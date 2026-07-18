import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as tripService from '../services/trip.service.js';

export const bookRide = asyncHandler(async (req, res) => {
  const trip = await tripService.bookRide(req.user._id, req.user.orgId, req.body);
  return res.status(201).json(new ApiResponse(201, trip, 'Ride booked successfully'));
});

export const verifyQR = asyncHandler(async (req, res) => {
  const trip = await tripService.verifyPassengerQR(req.user._id, req.body);
  return res.status(200).json(new ApiResponse(200, trip, 'Passenger verification successful'));
});

export const updateStatus = asyncHandler(async (req, res) => {
  const trip = await tripService.updateTripStatus(
    req.params.id,
    req.user._id,
    req.user.role,
    req.body
  );
  return res.status(200).json(new ApiResponse(200, trip, `Trip status updated to ${trip.status}`));
});

export const getTripById = asyncHandler(async (req, res) => {
  const trip = await tripService.getTripById(req.params.id, req.user._id);
  return res.status(200).json(new ApiResponse(200, trip, 'Trip details fetched'));
});

export const getMyTrips = asyncHandler(async (req, res) => {
  const trips = await tripService.getMyTrips(req.user._id);
  return res.status(200).json(new ApiResponse(200, trips, 'My trips fetched'));
});

export default { bookRide, verifyQR, updateStatus, getTripById, getMyTrips };
