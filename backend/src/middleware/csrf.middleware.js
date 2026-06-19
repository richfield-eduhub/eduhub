/**
 * CSRF Protection Middleware
 *
 * Protects against Cross-Site Request Forgery attacks
 * Uses double-submit cookie pattern with signed tokens
 */

const crypto = require('crypto');

// Store for CSRF tokens (in production, use Redis)
const csrfTokens = new Map();

// Clean up expired tokens every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of csrfTokens.entries()) {
    if (now - data.createdAt > 3600000) { // 1 hour expiry
      csrfTokens.delete(token);
    }
  }
}, 10 * 60 * 1000);

/**
 * Generate a CSRF token
 */
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Middleware to generate and attach CSRF token
 * Use this on routes that render forms
 */
function csrfToken(req, res, next) {
  // Generate new token
  const token = generateToken();

  // Store token with timestamp
  csrfTokens.set(token, {
    createdAt: Date.now(),
  });

  // Attach token to response
  res.locals.csrfToken = token;

  // Set CSRF cookie
  res.cookie('XSRF-TOKEN', token, {
    httpOnly: false, // Needs to be readable by JavaScript
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 3600000, // 1 hour
  });

  // Send token in response header (for API clients)
  res.setHeader('X-CSRF-Token', token);

  next();
}

/**
 * Middleware to verify CSRF token
 * Use this on state-changing routes (POST, PUT, DELETE, PATCH)
 */
function verifyCsrfToken(req, res, next) {
  // Skip CSRF for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Get token from header or body
  const token = req.headers['x-csrf-token'] ||
                req.headers['x-xsrf-token'] ||
                req.body._csrf ||
                req.query._csrf;

  // Get cookie token
  const cookieToken = req.cookies['XSRF-TOKEN'];

  // Verify token exists
  if (!token) {
    return res.status(403).json({
      success: false,
      message: 'CSRF token missing. Include X-CSRF-Token header or _csrf field.',
    });
  }

  // Verify token is valid
  if (!csrfTokens.has(token)) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired CSRF token.',
    });
  }

  // Double-submit cookie validation
  if (cookieToken !== token) {
    return res.status(403).json({
      success: false,
      message: 'CSRF token mismatch.',
    });
  }

  // Verify origin/referer for additional security
  const origin = req.headers.origin || req.headers.referer;
  const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    `http://localhost:${process.env.PORT || 3000}`,
  ];

  if (origin && !allowedOrigins.some(allowed => origin.startsWith(allowed))) {
    return res.status(403).json({
      success: false,
      message: 'Invalid origin.',
    });
  }

  next();
}

/**
 * Optional: Exempt certain routes from CSRF protection
 */
function csrfExempt(req, res, next) {
  req.csrfExempt = true;
  next();
}

/**
 * Conditional CSRF verification (checks if route is exempt)
 */
function conditionalCsrf(req, res, next) {
  if (req.csrfExempt) {
    return next();
  }
  return verifyCsrfToken(req, res, next);
}

module.exports = {
  csrfToken,
  verifyCsrfToken,
  csrfExempt,
  conditionalCsrf,
  generateToken,
};
