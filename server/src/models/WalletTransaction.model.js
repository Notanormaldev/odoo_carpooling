import mongoose from 'mongoose';

const walletTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['credit', 'debit'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0.01, 'Amount must be positive'],
    },
    balanceBefore: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'referenceModel',
    },
    referenceModel: {
      type: String,
      enum: ['Payment', 'Trip'],
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
  },
  {
    timestamps: true,
  }
);

walletTransactionSchema.index({ userId: 1, createdAt: -1 });

// Aggregation pipeline: wallet summary
walletTransactionSchema.statics.getWalletSummary = function (userId) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]);
};

const WalletTransaction = mongoose.model('WalletTransaction', walletTransactionSchema);
export default WalletTransaction;
