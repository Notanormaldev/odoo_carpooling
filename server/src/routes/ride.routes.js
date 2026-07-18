import express from 'express';
import * as rideController from '../controllers/ride.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { searchLimiter } from '../middlewares/rateLimiter.js';
import validate from '../middlewares/validate.js';
import { createRideSchema, searchRidesSchema, updateRideSchema } from '../validators/ride.validator.js';

const router = express.Router();

router.use(protect);

router.post('/', validate(createRideSchema), rideController.createRide);
router.get('/search', searchLimiter, validate(searchRidesSchema), rideController.searchRides);
router.get('/my-rides', rideController.getMyRides);
router.get('/suggest-fare', rideController.suggestFare);
router.get('/:id', rideController.getRideById);
router.patch('/:id/cancel', rideController.cancelRide);

export default router;
