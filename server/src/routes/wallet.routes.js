import express from 'express';
import * as walletController from '../controllers/wallet.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.js';
import { walletRechargeSchema, capturePaymentSchema } from '../validators/payment.validator.js';

const router = express.Router();

router.use(protect);

router.get('/balance', walletController.getBalance);
router.get('/history', walletController.getHistory);
router.post('/recharge/order', validate(walletRechargeSchema), walletController.rechargeOrder);
router.post('/recharge/verify', validate(capturePaymentSchema), walletController.verifyRecharge);

export default router;
