require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const { migrator } = require('./db/migrator');

// Middleware
const corsMiddleware = require('./middleware/cors.middleware');
const { sanitizeInputs } = require('./middleware/validator.middleware');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler.middleware');

// Routes
const authRoutes = require('./routes/auth.routes');
const studentRoutes = require('./routes/student.routes');
const qualificationRoutes = require('./routes/qualification.routes');
const moduleRoutes = require('./routes/module.routes');

const app = express();

/**
 * Global Middleware
 */
app.use(corsMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(sanitizeInputs);

// HTTP Request Logging
if (process.env.NODE_ENV === 'development') {
  // 'dev' format: :method :url :status :response-time ms - :res[content-length]
  app.use(morgan('dev'));
} else {
  // 'combined' format for production (Apache-style logs)
  app.use(morgan('combined'));
}

/**
 * Health Check
 */
app.get('/api/health', (_, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

/**
 * API Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/qualifications', qualificationRoutes);
app.use('/api/modules', moduleRoutes);

/**
 * Error Handling
 * Must be placed after all routes
 */
app.use(notFoundHandler);
app.use(errorHandler);

/**
 * Start Server
 */
const PORT = process.env.PORT || 3000;

migrator()
  .then(() => {
    app.listen(PORT, () => {
      console.log('=================================');
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
      console.log('=================================');
    });
  })
  .catch((err) => {
    console.error('❌ Startup failed:', err.message);
    process.exit(1);
  });
