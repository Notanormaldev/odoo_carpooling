import express from 'express';
import * as userController from '../controllers/user.controller.js';
import { protect, requireAdmin } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.js';
import validate from '../middlewares/validate.js';
import { updateProfileSchema, addSavedPlaceSchema, addEmergencyContactSchema } from '../validators/user.validator.js';

const router = express.Router();

router.use(protect);

router.patch(
  '/profile',
  upload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'drivingLicensePhoto', maxCount: 1 },
  ]),
  validate(updateProfileSchema),
  userController.updateProfile
);

// Saved Places
router.post('/saved-places', validate(addSavedPlaceSchema), userController.addSavedPlace);
router.get('/saved-places', userController.getSavedPlaces);
router.delete('/saved-places/:id', userController.deleteSavedPlace);

// Emergency Contacts
router.post('/emergency-contacts', validate(addEmergencyContactSchema), userController.addEmergencyContact);
router.delete('/emergency-contacts/:id', userController.deleteEmergencyContact);

// Admin driving license approval
router.get('/pending-licenses', requireAdmin, userController.getPendingLicenses);
router.post('/verify-license', requireAdmin, userController.verifyLicense);

export default router;
