import express from 'express';
import authRoutes from './auth.routes.js';
import rideRoutes from './ride.routes.js';
import tripRoutes from './trip.routes.js';
import vehicleRoutes from './vehicle.routes.js';
import paymentRoutes from './payment.routes.js';
import walletRoutes from './wallet.routes.js';
import adminRoutes from './admin.routes.js';
import reportRoutes from './report.routes.js';
import userRoutes from './user.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/rides', rideRoutes);
router.use('/trips', tripRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/payments', paymentRoutes);
router.use('/wallet', walletRoutes);
router.use('/admin', adminRoutes);
router.use('/reports', reportRoutes);
router.use('/users', userRoutes);

export default router;
