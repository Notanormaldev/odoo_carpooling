import express from 'express';
import * as reportController from '../controllers/report.controller.js';
import { protect, requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect, requireAdmin);

router.get('/', reportController.getReport);

export default router;
