import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as walletService from '../services/wallet.service.js';

export const getBalance = asyncHandler(async (req, res) => {
  const balance = await walletService.getWalletBalance(req.user._id);
  return res.status(200).json(new ApiResponse(200, balance, 'Wallet balance fetched'));
});

export const getHistory = asyncHandler(async (req, res) => {
  const history = await walletService.getWalletHistory(req.user._id);
  return res.status(200).json(new ApiResponse(200, history, 'Transaction history fetched'));
});

export default { getBalance, getHistory };
