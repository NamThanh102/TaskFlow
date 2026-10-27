import redis from '../config/redis.js';

/**
 * Middleware giới hạn tần suất request (Rate Limiting) bằng Redis Atomic Counter
 * @param {Object} options - { limit: số request tối đa, windowSecs: khung thời gian tính theo giây }
 */
export const authRateLimiter = (options = { limit: 10, windowSecs: 60 }) => {
  return async (req, res, next) => {
    try {
      // Nếu Redis chưa sẵn sàng -> bỏ qua kiểm tra, không chặn người dùng
      if (redis.status !== 'ready') return next();

      const ip =
        req.headers['x-forwarded-for']?.split(',')[0].trim() ||
        req.ip ||
        req.socket.remoteAddress ||
        'unknown_ip';

      const key = `ratelimit:auth:${ip}`;
      const current = await redis.incr(key);

      // Nếu là request đầu tiên trong chu kỳ -> gán thời gian hết hạn TTL
      if (current === 1) {
        await redis.expire(key, options.windowSecs);
      }

      if (current > options.limit) {
        return res.status(429).json({
          success: false,
          message: 'Quá nhiều yêu cầu đăng nhập/đăng ký. Vui lòng thử lại sau ít phút.',
        });
      }

      next();
    } catch (error) {
      // Graceful fallback nếu Redis gặp lỗi bất ngờ
      next();
    }
  };
};
