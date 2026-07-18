import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  address: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  placeId: { type: String },
});

const recurringSchema = new mongoose.Schema({
  monday: { type: Boolean, default: false },
  tuesday: { type: Boolean, default: false },
  wednesday: { type: Boolean, default: false },
  thursday: { type: Boolean, default: false },
  friday: { type: Boolean, default: false },
  saturday: { type: Boolean, default: false },
  sunday: { type: Boolean, default: false },
});

const rideSchema = new mongoose.Schema(
  {
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    startLocation: { type: locationSchema, required: true },
    destination: { type: locationSchema, required: true },
    dateTime: {
      type: Date,
      required: [true, 'Departure date and time is required'],
    },
    totalSeats: {
      type: Number,
      required: true,
      min: 1,
      max: 7,
    },
    availableSeats: {
      type: Number,
      required: true,
      min: 0,
    },
    farePerSeat: {
      type: Number,
      required: [true, 'Fare per seat is required'],
      min: [0, 'Fare cannot be negative'],
    },
    distanceKm: { type: Number },
    durationMin: { type: Number },
    status: {
      type: String,
      enum: ['published', 'full', 'in_progress', 'completed', 'cancelled'],
      default: 'published',
    },
    isRecurring: { type: Boolean, default: false },
    recurringDays: { type: recurringSchema },
    passengers: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
        seatsBooked: { type: Number, default: 1 },
      },
    ],
    // Geospatial index fields (GeoJSON format)
    startPoint: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number] }, // [lng, lat]
    },
    endPoint: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number] },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Geospatial indexes for proximity search
rideSchema.index({ startPoint: '2dsphere' });
rideSchema.index({ endPoint: '2dsphere' });
rideSchema.index({ orgId: 1, status: 1, dateTime: 1 });
rideSchema.index({ driverId: 1 });
rideSchema.index({ dateTime: 1 });

// Pre-save: sync geo points from location
rideSchema.pre('save', function (next) {
  if (this.startLocation?.lng && this.startLocation?.lat) {
    this.startPoint = { type: 'Point', coordinates: [this.startLocation.lng, this.startLocation.lat] };
  }
  if (this.destination?.lng && this.destination?.lat) {
    this.endPoint = { type: 'Point', coordinates: [this.destination.lng, this.destination.lat] };
  }
  next();
});

// Static: search rides near a location
rideSchema.statics.findNearbyRides = function (orgId, lat, lng, radiusKm = 5) {
  return this.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [lng, lat] },
        key: 'startPoint',
        distanceField: 'startDistance',
        maxDistance: radiusKm * 1000,
        spherical: true,
        query: { orgId: new mongoose.Types.ObjectId(orgId), status: 'published', availableSeats: { $gt: 0 } },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'driverId',
        foreignField: '_id',
        as: 'driver',
        pipeline: [{ $project: { name: 1, profilePhoto: 1, trustScore: 1 } }],
      },
    },
    { $unwind: '$driver' },
    {
      $lookup: {
        from: 'vehicles',
        localField: 'vehicleId',
        foreignField: '_id',
        as: 'vehicle',
        pipeline: [{ $project: { model: 1, registrationNumber: 1, seatingCapacity: 1 } }],
      },
    },
    { $unwind: '$vehicle' },
    { $sort: { dateTime: 1, startDistance: 1 } },
  ]);
};

const Ride = mongoose.model('Ride', rideSchema);
export default Ride;
