import express from 'express';
import * as walletController from '../controllers/wallet.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/balance', walletController.getBalance);
router.get('/history', walletController.getHistory);

export default router;
