import express from 'express';
import * as vehicleController from '../controllers/vehicle.controller.js';
import { protect, requireAdmin } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.js';
import validate from '../middlewares/validate.js';
import { createVehicleSchema, approveVehicleSchema } from '../validators/vehicle.validator.js';

const router = express.Router();

router.use(protect);

router.post('/', upload.single('rcPhoto'), validate(createVehicleSchema), vehicleController.createVehicle);
router.get('/my-vehicles', vehicleController.getMyVehicles);
router.get('/:id', vehicleController.getVehicleById);
router.delete('/:id', vehicleController.deleteVehicle);

// Admin route
router.patch('/:id/approve', requireAdmin, validate(approveVehicleSchema), vehicleController.adminApproveVehicle);

export default router;
