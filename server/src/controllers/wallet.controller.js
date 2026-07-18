import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as walletService from '../services/wallet.service.js';
import * as paymentService from '../services/payment.service.js';

export const getBalance = asyncHandler(async (req, res) => {
  const balance = await walletService.getWalletBalance(req.user._id);
  return res.status(200).json(new ApiResponse(200, balance, 'Wallet balance fetched'));
});

export const getHistory = asyncHandler(async (req, res) => {
  const history = await walletService.getWalletHistory(req.user._id);
  return res.status(200).json(new ApiResponse(200, history, 'Transaction history fetched'));
});

export const rechargeOrder = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  const order = await paymentService.createRazorpayOrder(req.user._id, {
    amount,
    type: 'wallet_recharge',
  });
  return res.status(201).json(new ApiResponse(201, order, 'Razorpay order created'));
});

export const verifyRecharge = asyncHandler(async (req, res) => {
  const payment = await paymentService.verifyPaymentSignature(req.user._id, req.body);
  return res.status(200).json(new ApiResponse(200, payment, 'Payment verified and processed'));
});

export default { getBalance, getHistory, rechargeOrder, verifyRecharge };
