import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { getCache, setCache } from '../config/redis.js';

// Middleware to authenticate JWT token
export const protect = async (req, res, next) => {
  let token;

  // Extract token from Authorization header: Bearer <token>
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided',
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 1. Kiểm tra cache thông tin user trong Redis trước
    const cacheKey = `user:${decoded.id}`;
    let user = await getCache(cacheKey);

    // 2. Nếu cache miss -> Query MongoDB và lưu vào Redis (TTL 15 phút)
    if (!user) {
      user = await User.findById(decoded.id).select('-password');
      if (user) {
        await setCache(cacheKey, 900, user);
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found or account deactivated',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token is invalid or expired',
    });
  }
};
