import express from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { protect, requireAdmin } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.js';
import { addEmployeeSchema, updateOrgSettingsSchema } from '../validators/admin.validator.js';

const router = express.Router();

// All routes require authentication & admin role
router.use(protect, requireAdmin);

router.get('/stats', adminController.getStats);
router.get('/employees', adminController.getEmployees);
router.post('/employees', validate(addEmployeeSchema), adminController.addEmployee);
router.patch('/employees/:id/access', adminController.toggleAccess);
router.get('/vehicles', adminController.getVehicles);
router.get('/settings', adminController.getSettings);
router.patch('/settings', validate(updateOrgSettingsSchema), adminController.updateSettings);

export default router;
