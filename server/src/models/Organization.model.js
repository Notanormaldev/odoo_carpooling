import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    registeredAddress: {
      type: String,
      required: [true, 'Registered address is required'],
      trim: true,
    },
    industry: { type: String, trim: true },
    adminContact: {
      type: String,
      required: [true, 'Admin contact email is required'],
      lowercase: true,
      trim: true,
    },
    allowedEmailDomain: {
      type: String,
      required: [true, 'Allowed email domain is required'],
      lowercase: true,
      trim: true,
    },
    logo: { type: String, default: '' },
    totalRegisteredEmployees: { type: Number, default: 0 },

    // Carpooling Configuration
    fuelCostPerLitre: { type: Number, default: 96.5 },
    costPerKm: { type: Number, default: 8.0 },
    travelCostOperational: { type: Number, default: 2.5 },

    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

organizationSchema.index({ allowedEmailDomain: 1 }, { unique: true });

const Organization = mongoose.model('Organization', organizationSchema);
export default Organization;
