import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as paymentService from '../services/payment.service.js';

export const createOrder = asyncHandler(async (req, res) => {
  const order = await paymentService.createRazorpayOrder(req.user._id, req.body);
  return res.status(201).json(new ApiResponse(201, order, 'Razorpay order created'));
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.verifyPaymentSignature(req.user._id, req.body);
  return res.status(200).json(new ApiResponse(200, payment, 'Payment verified and processed'));
});

export const walletPay = asyncHandler(async (req, res) => {
  const payment = await paymentService.payWithWallet(req.user._id, req.body);
  return res.status(200).json(new ApiResponse(200, payment, 'Trip payment completed using wallet'));
});

export const generateQRCode = asyncHandler(async (req, res) => {
  const qrData = await paymentService.generatePaymentQRCode(req.user._id, req.body);
  return res.status(200).json(new ApiResponse(200, qrData, 'Dynamic UPI QR code generated'));
});

export default { createOrder, verifyPayment, walletPay, generateQRCode };
