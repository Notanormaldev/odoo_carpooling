import mongoose from 'mongoose';
import Trip from '../models/Trip.model.js';
import Ride from '../models/Ride.model.js';
import User from '../models/User.model.js';
import Vehicle from '../models/Vehicle.model.js';
import ApiError from '../utils/ApiError.js';
import { calculateCO2Saved, calculateFuelSaved } from '../utils/co2Calculator.js';
import { getRedisClient } from '../config/redis.js';
import WalletTransaction from '../models/WalletTransaction.model.js';
import Payment from '../models/Payment.model.js';

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

    // Try automatic wallet payment debit
    const passenger = await User.findById(trip.passengerId);
    const driver = await User.findById(trip.driverId);

    if (passenger && driver && passenger.walletBalance >= trip.fare) {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        // Deduct passenger balance
        const pBalanceBefore = passenger.walletBalance;
        passenger.walletBalance -= trip.fare;
        await passenger.save({ session });

        // Credit driver wallet
        const dBalanceBefore = driver.walletBalance;
        driver.walletBalance += trip.fare;
        await driver.save({ session });

        // Create passenger debit txn
        await WalletTransaction.create(
          [
            {
              userId: trip.passengerId,
              type: 'debit',
              amount: trip.fare,
              balanceBefore: pBalanceBefore,
              balanceAfter: passenger.walletBalance,
              description: `Auto-fare payment for Trip #${trip._id.toString().slice(-6)}`,
              referenceId: trip._id,
              referenceModel: 'Trip',
            },
          ],
          { session }
        );

        // Create driver credit txn
        await WalletTransaction.create(
          [
            {
              userId: trip.driverId,
              type: 'credit',
              amount: trip.fare,
              balanceBefore: dBalanceBefore,
              balanceAfter: driver.walletBalance,
              description: `Auto-fare received for Trip #${trip._id.toString().slice(-6)}`,
              referenceId: trip._id,
              referenceModel: 'Trip',
            },
          ],
          { session }
        );

        // Create payment record
        await Payment.create(
          [
            {
              userId: trip.passengerId,
              tripId: trip._id,
              type: 'trip_payment',
              amount: trip.fare,
              method: 'wallet',
              status: 'captured',
              capturedAt: new Date(),
            },
          ],
          { session }
        );

        trip.status = 'completed_paid';
        trip.paidAt = new Date();
        
        await session.commitTransaction();
        session.endSession();
      } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.error('❌ Auto-payment transaction failed:', err);
        // Fallback to payment pending if transaction fails
        trip.status = 'payment_pending';
      }
    } else {
      // Fallback if passenger has insufficient balance
      trip.status = 'payment_pending';
    }

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
