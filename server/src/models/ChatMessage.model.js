import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderName: { type: String },
    message: {
      type: String,
      required: [true, 'Message cannot be empty'],
      maxlength: [500, 'Message cannot exceed 500 characters'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['text', 'system'],
      default: 'text',
    },
    isRead: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

chatMessageSchema.index({ tripId: 1, createdAt: 1 });
chatMessageSchema.index({ senderId: 1 });

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
export default ChatMessage;




