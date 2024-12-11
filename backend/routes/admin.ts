import { Router } from 'express';
import { adminController } from '../controllers/adminController';

const router = Router();

router.get('/metrics', adminController.getSystemMetrics);
router.post('/actions', adminController.performAction);

export const adminRoutes = router;