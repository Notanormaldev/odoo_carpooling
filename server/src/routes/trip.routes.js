import express from 'express';
import * as tripController from '../controllers/trip.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.js';
import { createTripSchema, updateTripStatusSchema, rateTripSchema } from '../validators/trip.validator.js';

const router = express.Router();

router.use(protect);

router.post('/book', validate(createTripSchema), tripController.bookRide);
router.post('/verify-qr', tripController.verifyQR);
router.get('/my-trips', tripController.getMyTrips);
router.get('/:id', tripController.getTripById);
router.patch('/:id/status', validate(updateTripStatusSchema), tripController.updateStatus);
router.post('/:id/rate', validate(rateTripSchema), tripController.rateTrip);
router.post('/:id/sos', tripController.triggerSOS);

export default router;
