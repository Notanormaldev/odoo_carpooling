import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const savedPlaceSchema = new mongoose.Schema({
  label: { type: String, required: true },
  address: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  icon: { type: String, enum: ['home', 'work', 'custom'], default: 'custom' },
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    mobile: {
      type: String,
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please provide a valid Indian mobile number'],
    },
    password: {
      type: String,
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    googleId: { type: String, sparse: true },
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization is required'],
    },
    role: {
      type: String,
      enum: ['employee', 'admin'],
      default: 'employee',
    },
    department: { type: String, trim: true },
    emergencyEmail: { type: String, lowercase: true, trim: true },
    emergencyEmailVerified: { type: Boolean, default: false },
    emergencyEmailOtp: { type: String },
    emergencyEmailOtpExpires: { type: Date },
    officeLocation: { type: String, trim: true },
    profilePhoto: {
      type: String,
      default: 'https://imgs.search.brave.com/ULkqH4Dkkk-qfYT18nkJRCaoEbITbYy9mk59M5eiVC8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9wcmV2/aWV3LnJlZGQuaXQv/ajV5NnA1YWkzb3ln/MS5qcGc_d2lkdGg9/MTQwJmhlaWdodD0x/NDAmYXV0bz13ZWJw/JnM9OGZhZThjNWEz/YzdjZjE1YmRhZWMy/MzQ4ZjlhM2M5ZmJl/NTRlMDU5ZA',
    },
    drivingLicense: { type: String, default: '' },
    drivingLicensePhoto: { type: String, default: '' },
    drivingLicenseStatus: {
      type: String,
      enum: ['none', 'pending', 'approved', 'rejected'],
      default: 'none',
    },
    drivingLicenseAiStatus: {
      type: String,
      enum: ['none', 'processing', 'verified', 'failed'],
      default: 'none',
    },
    drivingLicenseAiDetails: { type: mongoose.Schema.Types.Mixed, default: null },
    walletBalance: {
      type: Number,
      default: 0,
      min: [0, 'Wallet balance cannot be negative'],
    },
    trustScore: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5,
    },
    totalRatings: { type: Number, default: 0 },
    totalRides: { type: Number, default: 0 },
    totalRidesOffered: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    platformAccess: { type: Boolean, default: true },
    savedPlaces: [savedPlaceSchema],
    emergencyContacts: [
      {
        name: String,
        mobile: String,
      },
    ],
    refreshToken: { type: String, select: false },
    lastLogin: { type: Date },
    verificationOtp: { type: String },
    verificationOtpExpires: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
userSchema.index({ orgId: 1 });
userSchema.index({ orgId: 1, role: 1 });
userSchema.index({ trustScore: -1 });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Aggregation pipeline: leaderboard stats
userSchema.statics.getLeaderboard = function (orgId, limit = 10) {
  return this.aggregate([
    { $match: { orgId: new mongoose.Types.ObjectId(orgId), isActive: true } },
    {
      $project: {
        name: 1,
        profilePhoto: 1,
        totalRides: 1,
        totalRidesOffered: 1,
        trustScore: 1,
        totalTrips: { $add: ['$totalRides', '$totalRidesOffered'] },
      },
    },
    { $sort: { totalTrips: -1 } },
    { $limit: limit },
  ]);
};

const User = mongoose.model('User', userSchema);
export default User;
