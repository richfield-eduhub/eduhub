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
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:3000', 'http://localhost:5173'];

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
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

<<<<<<< HEAD
// Use development CORS in development, production CORS in production
const corsMiddleware = cors(
  process.env.NODE_ENV === 'production' ? corsOptions : devCorsOptions
);
=======
// Allow all origins — frontend is served from the same Railway domain
const corsMiddleware = cors(devCorsOptions);
>>>>>>> 531c062 (popi's changes)

module.exports = corsMiddleware;
