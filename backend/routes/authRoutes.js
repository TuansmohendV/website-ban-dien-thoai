import express from 'express';
import {
  changePassword,
  forgotPassword,
  loginUser,
  logoutUser,
  registerUser,
  resetPassword,
  socialLogin,
  firebaseLogin,
  otpEmailLogin,
} from '../controllers/authController.js';
import { sendOTP, verifyOTP } from '../controllers/otpController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/social-login', socialLogin);
router.post('/firebase-login', firebaseLogin);
router.post('/otp-login', otpEmailLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.put('/change-password', protect, changePassword);
router.post('/logout', protect, logoutUser);

export default router;
