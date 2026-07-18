import WalletTransaction from '../models/WalletTransaction.model.js';
import User from '../models/User.model.js';
import ApiError from '../utils/ApiError.js';

export const getWalletBalance = async (userId) => {
  const user = await User.findById(userId).select('walletBalance');
  if (!user) throw ApiError.notFound('User not found');
  return { balance: user.walletBalance };
};

export const getWalletHistory = async (userId) => {
  return WalletTransaction.find({ userId }).sort({ createdAt: -1 });
};

export default { getWalletBalance, getWalletHistory };
