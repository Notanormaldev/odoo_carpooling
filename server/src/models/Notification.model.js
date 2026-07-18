import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'ride_booked',
        'ride_started',
        'ride_completed',
        'payment_success',
        'payment_failed',
        'ride_cancelled',
        'driver_arriving',
        'seat_locked',
        'admin_announcement',
        'sos_triggered',
        'vehicle_approved',
        'vehicle_rejected',
        'new_rating',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
