import { Router } from 'express';
import { authPassengerController } from '../controllers/authPassengerController.js';
import { authenticatePassenger } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', authPassengerController.register);
router.post('/login', authPassengerController.login);
router.post('/verify-otp', authPassengerController.verifyOtp);
router.post('/social-login', authPassengerController.socialLogin);
router.post('/forgot-password', authPassengerController.forgotPassword);
router.get('/profile', authenticatePassenger, authPassengerController.getProfile);
router.patch('/profile', authenticatePassenger, authPassengerController.updateProfile);

export default router;
