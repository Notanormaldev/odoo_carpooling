import Ride from '../models/Ride.model.js';
import Vehicle from '../models/Vehicle.model.js';
import { getRedisClient } from '../config/redis.js';
import ApiError from '../utils/ApiError.js';
import { calculateFare } from '../utils/fareCalculator.js';
import Organization from '../models/Organization.model.js';

const RIDE_CACHE_TTL = 300; // 5 minutes

export const createRide = async (driverId, orgId, rideData) => {
  const { vehicleId, startLocation, destination, dateTime, totalSeats, farePerSeat, isRecurring, recurringDays } = rideData;

  // Verify vehicle is active and belongs to driver
  const vehicle = await Vehicle.findOne({ _id: vehicleId, ownerId: driverId, status: 'active' });
  if (!vehicle) throw ApiError.badRequest('Vehicle not found or not approved. Please register a vehicle first.');

  // Prevent duplicate rides at same time
  const conflict = await Ride.findOne({
    driverId,
    status: { $in: ['published', 'in_progress'] },
    dateTime: {
      $gte: new Date(new Date(dateTime).getTime() - 30 * 60 * 1000),
      $lte: new Date(new Date(dateTime).getTime() + 30 * 60 * 1000),
    },
  });
  if (conflict) throw ApiError.conflict('You already have a ride within 30 minutes of this time');

  const ride = await Ride.create({
    driverId,
    vehicleId,
    orgId,
    startLocation,
    destination,
    dateTime: new Date(dateTime),
    totalSeats,
    availableSeats: totalSeats,
    farePerSeat,
    isRecurring,
    recurringDays: isRecurring ? recurringDays : undefined,
  });

  // Cache in Redis
  const redis = getRedisClient();
  await redis.setex(`ride:${ride._id}`, RIDE_CACHE_TTL, JSON.stringify(ride));

  return ride;
};

export const searchRides = async (orgId, { lat, lng, date, seats = 1, radius = 5 }) => {
  // Use geospatial aggregation if coordinates provided
  if (lat && lng) {
    const rides = await Ride.findNearbyRides(orgId, lat, lng, radius);
    return rides.filter((r) => r.availableSeats >= seats);
  }

  // Fallback: date-based search
  const query = { orgId, status: 'published', availableSeats: { $gte: seats } };
  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    query.dateTime = { $gte: start, $lte: end };
  } else {
    query.dateTime = { $gte: new Date() };
  }

  return Ride.find(query)
    .populate('driverId', 'name profilePhoto trustScore')
    .populate('vehicleId', 'model registrationNumber seatingCapacity')
    .sort({ dateTime: 1 })
    .limit(50);
};

export const getRideById = async (rideId) => {
  const redis = getRedisClient();
  const cached = await redis.get(`ride:${rideId}`);
  if (cached) return JSON.parse(cached);

  const ride = await Ride.findById(rideId)
    .populate('driverId', 'name profilePhoto trustScore mobile')
    .populate('vehicleId', 'model registrationNumber seatingCapacity fuelType')
    .populate('orgId', 'name');

  if (!ride) throw ApiError.notFound('Ride not found');

  await redis.setex(`ride:${rideId}`, RIDE_CACHE_TTL, JSON.stringify(ride));
  return ride;
};

export const cancelRide = async (rideId, driverId) => {
  const ride = await Ride.findOne({ _id: rideId, driverId });
  if (!ride) throw ApiError.notFound('Ride not found');
  if (!['published'].includes(ride.status)) {
    throw ApiError.badRequest('Only published rides can be cancelled');
  }

  ride.status = 'cancelled';
  await ride.save();

  // Invalidate cache
  const redis = getRedisClient();
  await redis.del(`ride:${rideId}`);

  return ride;
};

export const getMyRides = async (driverId) => {
  return Ride.find({ driverId })
    .populate('vehicleId', 'model registrationNumber')
    .sort({ dateTime: -1 });
};

export const suggestFare = async (orgId, distanceKm) => {
  const org = await Organization.findById(orgId);
  return calculateFare(distanceKm, org?.costPerKm || 8.0);
};

export default { createRide, searchRides, getRideById, cancelRide, getMyRides, suggestFare };
