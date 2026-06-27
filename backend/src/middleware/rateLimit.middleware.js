/**
 * Rate Limiting Middleware
 *
 * Limits requests per IP address to prevent DDoS attacks.
 * Each limiter uses its own counter (namespace) so a global cap
 * does not consume login/password-reset budgets.
 */

const rateStore = new Map();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateStore.entries()) {
    if (now - data.resetTime > data.windowMs) {
      rateStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

function clientIp(req) {
  return req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
}

/**
 * Rate limit middleware
 * @param {number} maxRequests - Maximum requests per window (default: 100)
 * @param {number} windowMs - Time window in milliseconds (default: 60000 = 1 minute)
 * @param {string} namespace - Separate counter bucket per limiter
 */
function rateLimit(maxRequests = 100, windowMs = 60000, namespace = 'global') {
  return (req, res, next) => {
    if (process.env.NODE_ENV === 'development' && process.env.DISABLE_RATE_LIMIT === 'true') {
      return next();
    }

    const ip = clientIp(req);
    const storeKey = `${namespace}:${ip}`;
    const now = Date.now();

    let bucket = rateStore.get(storeKey);

    if (!bucket) {
      bucket = {
        count: 0,
        resetTime: now + windowMs,
        windowMs,
      };
      rateStore.set(storeKey, bucket);
    }

    if (now > bucket.resetTime) {
      bucket.count = 0;
      bucket.resetTime = now + windowMs;
    }

    bucket.count++;

    const remaining = Math.max(0, maxRequests - bucket.count);
    const resetTime = Math.ceil((bucket.resetTime - now) / 1000);

    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', resetTime);

    if (bucket.count > maxRequests) {
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
  const limit =
    process.env.NODE_ENV === 'development'
      ? Math.max(maxRequests, 30)
      : maxRequests;
  return rateLimit(limit, windowMs, 'auth');
}

module.exports = {
  rateLimit,
  strictRateLimit,
};
