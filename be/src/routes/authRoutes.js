import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authRateLimiter } from '../middlewares/rateLimitMiddleware.js';

const router = express.Router();

// Rate limiting: 5 lần đăng ký/phút, 10 lần đăng nhập/phút chống tấn công dò mật khẩu
router.post('/register', authRateLimiter({ limit: 5, windowSecs: 60 }), register);
router.post('/login', authRateLimiter({ limit: 10, windowSecs: 60 }), login);

router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

export default router;
