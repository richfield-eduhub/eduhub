/**
 * Rate Limiting Middleware
 *
 * Limits requests per IP address to prevent DDoS attacks
 * Default: 100 requests per minute per IP
 */

const rateStore = new Map();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateStore.entries()) {
    if (now - data.resetTime > 60000) {
      rateStore.delete(ip);
    }
  }
}, 5 * 60 * 1000);

/**
 * Rate limit middleware
 * @param {number} maxRequests - Maximum requests per window (default: 100)
 * @param {number} windowMs - Time window in milliseconds (default: 60000 = 1 minute)
 */
function rateLimit(maxRequests = 100, windowMs = 60000) {
  return (req, res, next) => {
    // Get client IP
    const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;

    const now = Date.now();

    // Get or create rate limit data for this IP
    let ipData = rateStore.get(ip);

    if (!ipData) {
      ipData = {
        count: 0,
        resetTime: now + windowMs,
      };
      rateStore.set(ip, ipData);
    }

    // Reset if window has passed
    if (now > ipData.resetTime) {
      ipData.count = 0;
      ipData.resetTime = now + windowMs;
    }

    // Increment request count
    ipData.count++;

    // Set rate limit headers
    const remaining = Math.max(0, maxRequests - ipData.count);
    const resetTime = Math.ceil((ipData.resetTime - now) / 1000);

    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', resetTime);

    // Check if rate limit exceeded
    if (ipData.count > maxRequests) {
      res.setHeader('Retry-After', resetTime);
      return res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later.',
        retryAfter: resetTime,
      });
    }

    next();
  };
}

/**
 * Strict rate limit for sensitive endpoints (login, password reset, etc.)
 */
function strictRateLimit(maxRequests = 5, windowMs = 60000) {
  return rateLimit(maxRequests, windowMs);
}

module.exports = {
  rateLimit,
  strictRateLimit,
};
