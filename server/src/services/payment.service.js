import crypto from 'crypto';
import mongoose from 'mongoose';
import razorpayInstance from '../config/razorpay.js';
import Payment from '../models/Payment.model.js';
import Trip from '../models/Trip.model.js';
import User from '../models/User.model.js';
import WalletTransaction from '../models/WalletTransaction.model.js';
import ApiError from '../utils/ApiError.js';

export const createRazorpayOrder = async (userId, { amount, type, tripId }) => {
  // Convert amount to paisa (₹1 = 100 paisa)
  const options = {
    amount: Math.round(amount * 100),
    currency: 'INR',
    receipt: `rcpt_${Date.now()}`,
    notes: { userId: userId.toString(), type, tripId: tripId || '' },
  };

  const order = await razorpayInstance.orders.create(options);

  // Save pending payment record
  await Payment.create({
    userId,
    tripId: tripId || undefined,
    type,
    amount,
    method: 'upi', // default pending method or generic placeholder
    status: 'pending',
    razorpayOrderId: order.id,
  });

  return order;
};

export const verifyPaymentSignature = async (userId, { razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
  const generatedSignature = hmac.digest('hex');

  if (generatedSignature !== razorpaySignature) {
    throw ApiError.badRequest('Invalid payment signature verification failed');
  }

  const payment = await Payment.findOne({ razorpayOrderId, userId });
  if (!payment) throw ApiError.notFound('Payment record not found');

  if (payment.status === 'captured') {
    return payment;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    payment.status = 'captured';
    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    payment.capturedAt = new Date();
    await payment.save({ session });

    if (payment.type === 'wallet_recharge') {
      const user = await User.findById(userId).session(session);
      const balanceBefore = user.walletBalance;
      user.walletBalance += payment.amount;
      await user.save({ session });

      await WalletTransaction.create(
        [
          {
            userId,
            type: 'credit',
            amount: payment.amount,
            balanceBefore,
            balanceAfter: user.walletBalance,
            description: 'Wallet recharged via Razorpay',
            referenceId: payment._id,
            referenceModel: 'Payment',
            paymentId: payment._id,
          },
        ],
        { session }
      );
    } else if (payment.type === 'trip_payment') {
      const trip = await Trip.findById(payment.tripId).session(session);
      if (trip) {
        trip.status = 'completed_paid';
        trip.paidAt = new Date();
        await trip.save({ session });
      }
    }

    await session.commitTransaction();
    session.endSession();

    return payment;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const payWithWallet = async (userId, { tripId }) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const trip = await Trip.findById(tripId).session(session);
    if (!trip) throw ApiError.notFound('Trip not found');

    if (trip.passengerId.toString() !== userId.toString()) {
      throw ApiError.forbidden('You are not authorized to pay for this trip');
    }

    if (trip.status !== 'payment_pending') {
      throw ApiError.badRequest(`Trip status is ${trip.status}, payment not required or already completed`);
    }

    const passenger = await User.findById(userId).session(session);
    if (passenger.walletBalance < trip.fare) {
      throw ApiError.badRequest('Insufficient wallet balance. Please recharge.');
    }

    // Deduct passenger balance
    const pBalanceBefore = passenger.walletBalance;
    passenger.walletBalance -= trip.fare;
    await passenger.save({ session });

    // Credit driver wallet
    const driver = await User.findById(trip.driverId).session(session);
    const dBalanceBefore = driver.walletBalance;
    driver.walletBalance += trip.fare;
    await driver.save({ session });

    // Create passenger debit txn
    const passengerTxn = await WalletTransaction.create(
      [
        {
          userId,
          type: 'debit',
          amount: trip.fare,
          balanceBefore: pBalanceBefore,
          balanceAfter: passenger.walletBalance,
          description: `Fare payment for Trip #${trip._id.toString().slice(-6)}`,
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
          description: `Fare received for Trip #${trip._id.toString().slice(-6)}`,
          referenceId: trip._id,
          referenceModel: 'Trip',
        },
      ],
      { session }
    );

    // Create local payment record
    const payment = await Payment.create(
      [
        {
          userId,
          tripId,
          type: 'trip_payment',
          amount: trip.fare,
          method: 'wallet',
          status: 'captured',
          capturedAt: new Date(),
        },
      ],
      { session }
    );

    // Update trip status
    trip.status = 'completed_paid';
    trip.paidAt = new Date();
    await trip.save({ session });

    await session.commitTransaction();
    session.endSession();

    return payment[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const generatePaymentQRCode = async (userId, { amount, tripId }) => {
  // Generates a mock/test dynamic UPI QR code or calls Razorpay QR API if config matches
  // For Razorpay, we can generate a payment link and convert it to QR, or use Razorpay QR API.
  // We'll generate a valid UPI URL string so the frontend QR component can render it.
  const payeeVPA = process.env.GOOGLE_EMAIL || 'teamclickjack@okaxis';
  const payeeName = 'Carpooling Platform';
  const transactionId = `txn_${Date.now()}`;
  
  // Standard UPI URI format
  const upiLink = `upi://pay?pa=${payeeVPA}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tr=${transactionId}`;

  // Log in payment model
  await Payment.create({
    userId,
    tripId: tripId || undefined,
    type: tripId ? 'trip_payment' : 'wallet_recharge',
    amount,
    method: 'upi',
    status: 'pending',
    razorpayQrId: transactionId,
  });

  return { upiLink, transactionId };
};

export default { createRazorpayOrder, verifyPaymentSignature, payWithWallet, generatePaymentQRCode };
