import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    model: {
      type: String,
      required: [true, 'Vehicle model is required'],
      trim: true,
    },
    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      unique: true,
      uppercase: true,
      trim: true,
      match: [/^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/, 'Invalid Indian vehicle registration format (e.g. GJ01AB1234)'],
    },
    seatingCapacity: {
      type: Number,
      required: [true, 'Seating capacity is required'],
      min: [2, 'Minimum 2 seats'],
      max: [8, 'Maximum 8 seats'],
    },
    fuelType: {
      type: String,
      enum: ['petrol', 'diesel', 'cng', 'electric', 'hybrid'],
      default: 'petrol',
    },
    fuelEfficiency: {
      type: Number, // km per litre
      default: 15,
    },
    rcPhotoUrl: { type: String, default: '' },
    vehiclePhotoUrl: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'active', 'inactive'],
      default: 'pending',
    },
    approvedAt: { type: Date },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

vehicleSchema.index({ ownerId: 1 });
vehicleSchema.index({ orgId: 1 });
vehicleSchema.index({ status: 1 });
vehicleSchema.index({ registrationNumber: 1 }, { unique: true });

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
export default Vehicle;
