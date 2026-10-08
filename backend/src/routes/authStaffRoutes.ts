import { Router } from 'express';
import { authStaffController } from '../controllers/authStaffController.js';
import { authenticateStaff } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/login', authStaffController.login);
router.post('/pin-login', authStaffController.pinLogin);
router.post('/nfc-login', authStaffController.nfcLogin);
router.post('/unlock', authStaffController.unlock);
router.get('/profile', authenticateStaff, authStaffController.getProfile);

export default router;
