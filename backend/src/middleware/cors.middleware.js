/**
 * CORS Configuration Middleware
 * Handles Cross-Origin Resource Sharing
 */

const cors = require('cors');

/**
 * CORS options configuration
 */
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl requests, health checks from load balancers)
    if (!origin) {
      console.log('[CORS] Request with no origin header - allowing');
      return callback(null, true);
    }

    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
      : ['http://localhost:3000', 'http://localhost:5173'];

    console.log('[CORS] Checking origin:', origin);
    console.log('[CORS] Allowed origins:', allowedOrigins);

    if (allowedOrigins.includes(origin)) {
      console.log('[CORS] Origin allowed:', origin);
      callback(null, true);
    } else {
      console.error('[CORS] Origin blocked:', origin);
      console.error('[CORS] Make sure ALLOWED_ORIGINS env variable includes:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // 24 hours
};

/**
 * Development CORS - allows all origins
 */
const devCorsOptions = {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
};

// Use development CORS in development, production CORS in production
const corsMiddleware = cors(
  process.env.NODE_ENV === 'production' ? corsOptions : devCorsOptions
);

module.exports = corsMiddleware;
