import mongoose from 'mongoose';
import Trip from '../models/Trip.model.js';
import Ride from '../models/Ride.model.js';
import User from '../models/User.model.js';
import Vehicle from '../models/Vehicle.model.js';
import ApiError from '../utils/ApiError.js';
import { calculateCO2Saved, calculateFuelSaved } from '../utils/co2Calculator.js';
import { getRedisClient } from '../config/redis.js';

export const bookRide = async (passengerId, orgId, { rideId, seatsBooked }) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const ride = await Ride.findOne({ _id: rideId, orgId }).session(session);
    if (!ride) throw ApiError.notFound('Ride not found');

    if (ride.driverId.toString() === passengerId.toString()) {
      throw ApiError.badRequest('You cannot book your own ride');
    }

    if (ride.status !== 'published') {
      throw ApiError.badRequest('Ride is not available for booking');
    }

    if (ride.availableSeats < seatsBooked) {
      throw ApiError.badRequest(`Only ${ride.availableSeats} seats are available`);
    }

    // Check if passenger already booked this ride
    const alreadyBooked = await Trip.findOne({ rideId, passengerId, status: { $ne: 'cancelled' } }).session(session);
    if (alreadyBooked) {
      throw ApiError.badRequest('You have already booked a seat on this ride');
    }

    // Calculate total fare
    const fare = ride.farePerSeat * seatsBooked;

    // Create the trip
    const trip = await Trip.create(
      [
        {
          rideId,
          passengerId,
          driverId: ride.driverId,
          orgId,
          seatsBooked,
          fare,
          status: 'booked',
        },
      ],
      { session }
    );

    // Update ride available seats
    ride.availableSeats -= seatsBooked;
    if (ride.availableSeats === 0) {
      ride.status = 'full';
    }
    ride.passengers.push({
      userId: passengerId,
      tripId: trip[0]._id,
      seatsBooked,
    });
    await ride.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Clear ride cache
    const redis = getRedisClient();
    await redis.del(`ride:${rideId}`);

    return trip[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const verifyPassengerQR = async (driverId, { qrCode }) => {
  const trip = await Trip.findOne({ verificationQR: qrCode, driverId, status: 'booked' })
    .populate('passengerId', 'name profilePhoto')
    .populate('rideId');

  if (!trip) throw ApiError.notFound('No matching booked trip found for verification QR');

  trip.status = 'started'; // Trip transitions to started after verification scan
  trip.startedAt = new Date();
  trip.qrVerifiedAt = new Date();
  await trip.save();

  // Also update ride status if it's the first passenger starting
  const ride = await Ride.findById(trip.rideId);
  if (ride && ride.status !== 'in_progress') {
    ride.status = 'in_progress';
    await ride.save();
    const redis = getRedisClient();
    await redis.del(`ride:${ride._id}`);
  }

  return trip;
};

export const updateTripStatus = async (tripId, userId, role, { status, cancellationReason }) => {
  const query = { _id: tripId };
  if (role === 'employee') {
    // Only passenger or driver of the trip can modify it
    query.$or = [{ passengerId: userId }, { driverId: userId }];
  }

  const trip = await Trip.findOne(query);
  if (!trip) throw ApiError.notFound('Trip not found or unauthorized');

  if (status === 'cancelled') {
    if (['completed', 'completed_paid', 'cancelled'].includes(trip.status)) {
      throw ApiError.badRequest(`Cannot cancel trip in ${trip.status} state`);
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      trip.status = 'cancelled';
      trip.cancelledAt = new Date();
      trip.cancellationReason = cancellationReason || 'Cancelled by user';
      await trip.save({ session });

      // Restore seats to the ride
      const ride = await Ride.findById(trip.rideId).session(session);
      if (ride) {
        ride.availableSeats += trip.seatsBooked;
        if (ride.status === 'full' && ride.availableSeats > 0) {
          ride.status = 'published';
        }
        // Remove passenger from list
        ride.passengers = ride.passengers.filter(p => p.userId.toString() !== trip.passengerId.toString());
        await ride.save({ session });
      }

      await session.commitTransaction();
      session.endSession();

      const redis = getRedisClient();
      await redis.del(`ride:${trip.rideId}`);
      return trip;
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  }

  // Lifecycle state machine: started -> in_progress -> completed -> payment_pending
  if (status === 'in_progress') {
    if (trip.status !== 'started') throw ApiError.badRequest('Trip must be started first');
    trip.status = 'in_progress';
  } else if (status === 'completed') {
    if (!['started', 'in_progress'].includes(trip.status)) {
      throw ApiError.badRequest('Trip must be started or in progress to complete');
    }

    trip.status = 'payment_pending';
    trip.completedAt = new Date();

    // Fetch vehicle efficiency & distance
    const ride = await Ride.findById(trip.rideId);
    const vehicle = await Vehicle.findById(ride?.vehicleId);
    const distance = ride?.distanceKm || 0;

    trip.distanceKm = distance;

    // Calculate ESG metric (CO2 savings)
    const totalRiders = (ride?.passengers?.length || 0) + 1; // passengers + driver
    const co2 = calculateCO2Saved(distance, totalRiders);
    trip.co2SavedKg = co2.savedKg;

    if (vehicle) {
      const fuel = calculateFuelSaved(distance, vehicle.fuelEfficiency || 15, totalRiders);
      trip.fuelSavedLitres = fuel.savedLitres;
    }

    await trip.save();

    // Increment employee ride statistics
    await User.findByIdAndUpdate(trip.passengerId, {
      $inc: { totalRides: 1, co2SavedKg: trip.co2SavedKg },
    });
    await User.findByIdAndUpdate(trip.driverId, {
      $inc: { totalRidesOffered: 1 },
    });
  }

  await trip.save();
  return trip;
};

export const getTripById = async (tripId, userId) => {
  const trip = await Trip.findOne({
    _id: tripId,
    $or: [{ passengerId: userId }, { driverId: userId }],
  })
    .populate('passengerId', 'name profilePhoto trustScore mobile')
    .populate('driverId', 'name profilePhoto trustScore mobile')
    .populate({
      path: 'rideId',
      populate: {
        path: 'vehicleId',
        select: 'model registrationNumber seatingCapacity',
      },
    });

  if (!trip) throw ApiError.notFound('Trip not found or unauthorized');
  return trip;
};

export const getMyTrips = async (userId) => {
  return Trip.find({
    $or: [{ passengerId: userId }, { driverId: userId }],
  })
    .populate('passengerId', 'name profilePhoto')
    .populate('driverId', 'name profilePhoto')
    .populate({
      path: 'rideId',
      select: 'startLocation destination dateTime status',
    })
    .sort({ createdAt: -1 });
};

export default { bookRide, verifyPassengerQR, updateTripStatus, getTripById, getMyTrips };
