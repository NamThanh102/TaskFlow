import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Khởi tạo kết nối Redis
const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 1,      // chỉ thử 1 lần
  retryStrategy(times) {
    if (times > 3) return null; // Thử 3 lần không được thì dừng, không làm phiền console
    return Math.min(times * 1000, 3000);
  },
  enableOfflineQueue: false,    // Không xếp hàng lệnh khi Redis mất kết nối
});

redis.on('connect', () => {
  console.log('[Redis] Connected to Redis Cache successfully');
});

redis.on('error', (err) => {
  // Chỉ in cảnh báo ngắn gọn
  console.warn('[Redis Offline] Chạy chế độ fallback trực tiếp với MongoDB');
});

/**
 * Lấy dữ liệu từ cache an toàn (Graceful Fallback)
 * Nếu Redis tắt hoặc lỗi -> tự động trả về null để query DB, không gây sập server
 */
export const getCache = async (key) => {
  try {
    if (redis.status !== 'ready') return null;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.warn(`[Redis Get Error] Key: ${key} - ${err.message}`);
    return null;
  }
};

/**
 * Lưu dữ liệu vào cache an toàn với TTL (thời gian sống tính bằng giây)
 */
export const setCache = async (key, ttlInSeconds, data) => {
  try {
    if (redis.status !== 'ready') return;
    const value = typeof data === 'string' ? data : JSON.stringify(data);
    await redis.setex(key, ttlInSeconds, value);
  } catch (err) {
    console.warn(`[Redis Set Error] Key: ${key} - ${err.message}`);
  }
};

/**
 * Xóa một hoặc nhiều keys trong cache an toàn
 */
export const delCache = async (...keys) => {
  try {
    if (redis.status !== 'ready') return;
    const validKeys = keys.filter(Boolean);
    if (validKeys.length > 0) {
      await redis.del(...validKeys);
    }
  } catch (err) {
    console.warn(`[Redis Del Error] Keys: ${keys.join(', ')} - ${err.message}`);
  }
};

export default redis;
