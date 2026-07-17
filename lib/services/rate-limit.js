import { redis } from "../redis";

/**
 * Atomic sliding-window rate limiter using Redis Sorted Sets (ZSET)
 * 
 * @param {string} key Unique identifier for the client (e.g., token hash or userId)
 * @param {number} limit Maximum requests allowed inside the window
 * @param {number} windowSeconds Window duration in seconds
 * @returns {Promise<{success: boolean, limit: number, remaining: number, reset: number}>}
 */
export async function rateLimit(key, limit = 10, windowSeconds = 60) {
  const now = Date.now();
  const clearBefore = now - (windowSeconds * 1000);
  const redisKey = `rate_limit:${key}`;

  try {
    // Execute atomic Redis transaction
    const multi = redis.multi();
    
    // 1. Remove request timestamps older than the sliding window boundary
    multi.zremrangebyscore(redisKey, 0, clearBefore);
    // 2. Add current timestamp as both score and value using standard Upstash object syntax
    multi.zadd(redisKey, { score: now, member: now.toString() });
    // 3. Count total elements in the set (active requests inside window)
    multi.zcard(redisKey);
    // 4. Set TTL on the set to auto-cleanup idle keys
    multi.expire(redisKey, windowSeconds);

    const results = await multi.exec();
    
    // ZCARD returns the current number of requests in the sliding window
    const requestCount = parseInt(results[2] || "0", 10);
    const isAllowed = requestCount <= limit;

    return {
      success: isAllowed,
      limit,
      remaining: Math.max(0, limit - requestCount),
      reset: Math.round((now + (windowSeconds * 1000)) / 1000)
    };
  } catch (error) {
    console.error("[FlowSense AI] Redis rate-limiter communication error:", error);
    // Fail-open: If Redis is down, allow the request so the app stays functional
    return {
      success: true,
      limit,
      remaining: 1,
      reset: 0
    };
  }
}
