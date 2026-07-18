import mongoose from 'mongoose';
import Trip from '../models/Trip.model.js';
import Ride from '../models/Ride.model.js';
import User from '../models/User.model.js';
import Vehicle from '../models/Vehicle.model.js';
import ApiError from '../utils/ApiError.js';
import { calculateFuelSaved } from '../utils/co2Calculator.js';
import { getRedisClient } from '../config/redis.js';
import WalletTransaction from '../models/WalletTransaction.model.js';
import Payment from '../models/Payment.model.js';
import { sendEmail } from '../config/brevo.js';

export const bookRide = async (passengerId, orgId, { rideId, seatsBooked }) => {
  // Check minimum wallet balance before starting transaction
  const MIN_WALLET_BALANCE = 500;
  const passengerCheck = await User.findById(passengerId).select('walletBalance');
  if (!passengerCheck) throw ApiError.notFound('Passenger not found');
  if (passengerCheck.walletBalance < MIN_WALLET_BALANCE) {
    throw ApiError.badRequest(
      `Insufficient wallet balance. A minimum balance of ₹${MIN_WALLET_BALANCE} is required to book a ride. Your current balance is ₹${passengerCheck.walletBalance}.`
    );
  }

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
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
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
          verificationOtp: otp,
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

    // Send boarding OTP email to passenger asynchronously
    User.findById(passengerId).then(passengerUser => {
      if (passengerUser && passengerUser.email) {
        sendEmail({
          to: passengerUser.email,
          subject: 'Your Ride Boarding OTP - Carpooling',
          htmlContent: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px; max-width: 600px;">
              <h2 style="color: #e85d4a;">Ride Booked Successfully!</h2>
              <p>Hello <strong>${passengerUser.name}</strong>,</p>
              <p>Your booking for the ride has been confirmed. Below is your 6-digit verification boarding OTP:</p>
              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; font-size: 24px; font-weight: bold; text-align: center; color: #e85d4a; letter-spacing: 4px; margin: 20px 0;">
                ${otp}
              </div>
              <p>Please share this OTP with your driver when you board the vehicle to start the ride.</p>
              <p style="font-size: 12px; color: #777; margin-top: 30px;">This is an automated email from Odoo Carpooling.</p>
            </div>
          `
        }).catch(err => console.error('Failed to send boarding OTP email:', err));
      }
    });

    return trip[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const verifyPassengerQR = async (driverId, { qrCode, otpCode, tripId }) => {
  const query = { status: 'booked', driverId };
  if (tripId) {
    query._id = tripId;
  }
  
  if (otpCode) {
    query.verificationOtp = otpCode.trim();
  } else if (qrCode) {
    query.verificationQR = qrCode.trim();
  } else {
    throw ApiError.badRequest('Verification code or OTP is required');
  }

  const trip = await Trip.findOne(query)
    .populate('passengerId', 'name profilePhoto')
    .populate('rideId');

  if (!trip) throw ApiError.notFound('OTP is incorrect or no matching booked trip found. Please check the OTP and try again.');

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

  if (status === 'started') {
    throw ApiError.badRequest('Direct status change to started is not allowed. Please verify the passenger via QR/OTP.');
  }

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

    if (vehicle) {
      const totalRiders = (ride?.passengers?.length || 0) + 1; // passengers + driver
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
      $inc: { totalRides: 1 },
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

  if (!trip.verificationOtp) {
    trip.verificationOtp = Math.floor(100000 + Math.random() * 900000).toString();
    await trip.save();
  }

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

export const rateTrip = async (tripId, passengerId, { rating, comment }) => {
  const trip = await Trip.findOne({ _id: tripId, passengerId });
  if (!trip) throw ApiError.notFound('Trip not found or unauthorized');

  if (!['completed', 'completed_paid', 'payment_pending'].includes(trip.status)) {
    throw ApiError.badRequest('Cannot rate an incomplete trip');
  }

  if (trip.passengerRating) {
    throw ApiError.badRequest('You have already rated this trip');
  }

  trip.passengerRating = rating;
  trip.passengerRatedAt = new Date();
  await trip.save();

  // Aggregate driver trustScore
  const driver = await User.findById(trip.driverId);
  if (driver) {
    const totalRatings = driver.totalRatings || 0;
    const currentScore = driver.trustScore || 5.0;

    const newScore = ((currentScore * totalRatings) + rating) / (totalRatings + 1);
    driver.trustScore = Math.round(newScore * 10) / 10;
    driver.totalRatings = totalRatings + 1;
    await driver.save();
  }

  return trip;
};

export const triggerSOS = async (tripId, userId) => {
  // Try to find the trip. If tripId is 'global', it won't be castable as ObjectId so we catch or validate
  let trip = null;
  if (mongoose.Types.ObjectId.isValid(tripId)) {
    trip = await Trip.findOne({
      _id: tripId,
      $or: [{ passengerId: userId }, { driverId: userId }]
    })
      .populate('passengerId', 'name mobile')
      .populate('driverId', 'name mobile')
      .populate({
        path: 'rideId',
        populate: {
          path: 'vehicleId',
          select: 'model registrationNumber'
        }
      });
  }

  const subject = `🚨 EMERGENCY PANIC ALERT - CARPOOLING PLATFORM`;
  let detailsText = '';

  if (trip) {
    detailsText = `Trip ID: ${trip._id}
Passenger: ${trip.passengerId?.name || 'N/A'} (Mobile: ${trip.passengerId?.mobile || 'N/A'})
Driver: ${trip.driverId?.name || 'N/A'} (Mobile: ${trip.driverId?.mobile || 'N/A'})
Vehicle: ${trip.rideId?.vehicleId?.model || 'N/A'} (Plate: ${trip.rideId?.vehicleId?.registrationNumber || 'N/A'})
Pickup Location: ${trip.rideId?.startLocation?.address || 'N/A'}
Destination: ${trip.rideId?.destination?.address || 'N/A'}
Current Status: ${trip.status}`;
  } else {
    const user = await User.findById(userId);
    detailsText = `A panic SOS has been triggered globally.
Triggered by: ${user?.name || 'N/A'} (Mobile: ${user?.mobile || 'N/A'})
Note: No active ongoing trip was linked to this alert, or it was triggered globally.`;
  }

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 2px solid #dc2626; border-radius: 8px; max-width: 600px;">
      <h2 style="color: #dc2626; margin-top: 0;">🚨 EMERGENCY SOS PANIC ALERT</h2>
      <p>An emergency SOS alert has been dispatched from the Carpooling Mobile App. Please initiate emergency response procedures immediately.</p>
      <hr style="border: 0; border-top: 1px dashed #dc2626;" />
      <pre style="background-color: #fef2f2; padding: 15px; border-radius: 4px; font-size: 13px; color: #7f1d1d; white-space: pre-wrap; font-family: monospace;">${detailsText}</pre>
      <p style="font-size: 11px; color: #9ca3af; margin-top: 20px;">This alert was automatically generated by the Carpooling Enterprise Security Desk dispatcher.</p>
    </div>
  `;

  await sendEmail({
    to: 'teamclickjack@gmail.com',
    subject,
    html: htmlContent
  });

  return { success: true };
};

export default { bookRide, verifyPassengerQR, updateTripStatus, getTripById, getMyTrips, rateTrip, triggerSOS };
