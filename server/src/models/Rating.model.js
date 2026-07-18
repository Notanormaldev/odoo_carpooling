import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
    },
    raterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ratedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Minimum rating is 1'],
      max: [5, 'Maximum rating is 5'],
    },
    comment: {
      type: String,
      maxlength: [300, 'Comment cannot exceed 300 characters'],
      trim: true,
    },
    raterRole: {
      type: String,
      enum: ['driver', 'passenger'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

ratingSchema.index({ tripId: 1 });
ratingSchema.index({ ratedUserId: 1 });
// Prevent duplicate rating for same trip by same user
ratingSchema.index({ tripId: 1, raterId: 1 }, { unique: true });

// Aggregation: average rating for a user
ratingSchema.statics.getAverageRating = function (userId) {
  return this.aggregate([
    { $match: { ratedUserId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$ratedUserId',
        averageRating: { $avg: '$rating' },
        totalRatings: { $sum: 1 },
      },
    },
  ]);
};

const Rating = mongoose.model('Rating', ratingSchema);
export default Rating;
