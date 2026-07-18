import express from 'express';
import * as paymentController from '../controllers/payment.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { paymentLimiter } from '../middlewares/rateLimiter.js';
import validate from '../middlewares/validate.js';
import { createOrderSchema, capturePaymentSchema, payWithWalletSchema } from '../validators/payment.validator.js';

const router = express.Router();

router.use(protect);

router.post('/order', paymentLimiter, validate(createOrderSchema), paymentController.createOrder);
router.post('/verify', validate(capturePaymentSchema), paymentController.verifyPayment);
router.post('/wallet-pay', validate(payWithWalletSchema), paymentController.walletPay);
router.post('/generate-qr', paymentController.generateQRCode);

export default router;
