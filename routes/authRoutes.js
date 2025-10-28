import express from 'express';
import { body } from 'express-validator';
import { register, login, getMe, updateOnboarding, checkEmail } from '../controllers/authController.js';
import { sendOTP, verifyOTP } from '../controllers/otpController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const registerValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email')
];

const otpVerifyValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be exactly 6 digits')
];

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/check-email', checkEmail);
router.get('/me', protect, getMe);
router.put('/onboarding', protect, updateOnboarding);

// OTP routes
router.post('/otp/send', sendOTP);
router.post('/otp/verify', otpVerifyValidation, verifyOTP);

export default router;

