import express from 'express';
import { register, login, getProfile, updateProfile, changePassword } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { loginLimiter, registerLimiter, passwordChangeLimiter } from '../middleware/rateLimiters';
import { registerValidation, loginValidation, updateProfileValidation, changePasswordValidation } from '../middleware/validators';
import { validate } from '../middleware/validate';

const router = express.Router();

router.post('/register', registerLimiter, registerValidation, validate, register);
router.post('/login', loginLimiter, loginValidation, validate, login);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfileValidation, validate, updateProfile);
router.post('/change-password', authenticate, passwordChangeLimiter, changePasswordValidation, validate, changePassword);

export default router;
