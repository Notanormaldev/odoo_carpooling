import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const tripSchema = new mongoose.Schema(
  {
    rideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ride',
      required: true,
    },
    passengerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    seatsBooked: {
      type: Number,
      required: true,
      min: 1,
    },
    fare: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: [
        'booked',
        'qr_pending',     // passenger has QR, awaiting driver scan
        'started',
        'in_progress',
        'completed',
        'payment_pending',
        'completed_paid',
        'cancelled',
      ],
      default: 'booked',
    },
    // QR Verification
    verificationQR: {
      type: String,
      default: () => uuidv4(),
      unique: true,
    },
    qrVerifiedAt: { type: Date },

    // Trip timeline
    bookedAt: { type: Date, default: Date.now },
    startedAt: { type: Date },
    completedAt: { type: Date },
    paidAt: { type: Date },
    cancelledAt: { type: Date },
    cancellationReason: { type: String },

    // ESG data
    distanceKm: { type: Number, default: 0 },
    co2SavedKg: { type: Number, default: 0 },
    fuelSavedLitres: { type: Number, default: 0 },

    // Rating
    passengerRating: { type: Number, min: 1, max: 5 },
    driverRating: { type: Number, min: 1, max: 5 },
    passengerRatedAt: { type: Date },
    driverRatedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tripSchema.index({ passengerId: 1, status: 1 });
tripSchema.index({ driverId: 1, status: 1 });
tripSchema.index({ rideId: 1 });
tripSchema.index({ orgId: 1 });
tripSchema.index({ verificationQR: 1 }, { unique: true });

// Aggregation pipeline: monthly trip stats for reports
tripSchema.statics.getMonthlyStats = function (orgId) {
  return this.aggregate([
    { $match: { orgId: new mongoose.Types.ObjectId(orgId), status: 'completed_paid' } },
    {
      $group: {
        _id: {
          year: { $year: '$completedAt' },
          month: { $month: '$completedAt' },
        },
        revenue: { $sum: '$fare' },
        totalTrips: { $sum: 1 },
        totalCO2Saved: { $sum: '$co2SavedKg' },
        totalDistance: { $sum: '$distanceKm' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    {
      $project: {
        _id: 0,
        year: '$_id.year',
        month: '$_id.month',
        revenue: 1,
        totalTrips: 1,
        totalCO2Saved: 1,
        totalDistance: 1,
      },
    },
  ]);
};

const Trip = mongoose.model('Trip', tripSchema);
export default Trip;
