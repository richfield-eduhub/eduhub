# Project Template Guide - Based on EduHub Architecture

> **Purpose:** This document serves as a comprehensive template for creating new full-stack web applications. It captures the proven architecture, patterns, and best practices from the EduHub Student Management System.

---

## Table of Contents

1. [Technology Stack](#1-technology-stack)
2. [Project Structure](#2-project-structure)
3. [Database Setup](#3-database-setup)
4. [Backend Architecture](#4-backend-architecture)
5. [Frontend Architecture](#5-frontend-architecture)
6. [Docker Configuration](#6-docker-configuration)
7. [GitHub Workflows (CI/CD)](#7-github-workflows-cicd)
8. [Testing Strategy](#8-testing-strategy)
9. [Security Implementation](#9-security-implementation)
10. [Deployment Configuration](#10-deployment-configuration)
11. [Development Workflow](#11-development-workflow)

---

## 1. Technology Stack

### Backend
- **Runtime:** Node.js 20 (LTS)
- **Framework:** Express 5.x
- **ORM:** Sequelize 6.x
- **Database:** PostgreSQL 16
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** express-validator
- **File Upload:** Multer
- **Email:** Nodemailer
- **MFA:** Speakeasy + QRCode
- **Testing:** Jest + Supertest

### Frontend
- **Architecture:** Multi-Page Application (MPA)
- **Base:** Vanilla JavaScript (ES6+)
- **Styling:** Custom CSS + responsive design
- **HTTP Client:** Fetch API
- **State:** localStorage + sessionStorage

### Infrastructure
- **Containerization:** Docker + Docker Compose
- **Reverse Proxy:** Nginx
- **Database Admin:** pgAdmin 4
- **SSL/TLS:** Let's Encrypt (Certbot)
- **VPN:** Tailscale (for secure deployments)
- **Registry:** GitHub Container Registry (GHCR)
- **CI/CD:** GitHub Actions

---

## 2. Project Structure

### Directory Layout

```
project-root/
├── .github/
│   └── workflows/
│       ├── deploy.yml              # Main deployment workflow
│       ├── test.yml                # Test runner for PRs
│       └── backend-tests.yml       # Reusable test workflow
├── backend/
│   ├── src/
│   │   ├── app.js                  # Main application entry
│   │   ├── config/
│   │   │   └── database.js         # Sequelize configuration
│   │   ├── controllers/            # Request handlers
│   │   ├── middleware/             # Express middleware
│   │   ├── models/                 # Sequelize models
│   │   │   └── index.js            # Model associations
│   │   ├── routes/                 # API route definitions
│   │   ├── services/               # Business logic layer
│   │   ├── database/
│   │   │   ├── migrations/         # Database migrations
│   │   │   └── seeds/              # Seed data
│   │   ├── db/
│   │   │   └── migrator.js         # Custom migration runner
│   │   ├── utils/                  # Helper functions
│   │   └── uploads/                # File upload directory
│   ├── tests/
│   │   ├── unit/                   # Unit tests
│   │   ├── integration/            # Integration tests
│   │   │   ├── env.js              # Test environment config
│   │   │   └── globalSetup.js     # Test database setup
│   │   └── setup.js                # Jest setup
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   ├── jest.config.js
│   └── .env.example
├── frontend/
│   ├── index.html                  # Landing page
│   ├── shared.js                   # Global utilities & API client
│   ├── shared.css                  # Global styles
│   ├── public/                     # Unauthenticated pages
│   │   ├── Home.html
│   │   ├── Login.html
│   │   ├── Register.html
│   │   └── ForgotPassword.html
│   ├── admin/                      # Admin dashboard pages
│   ├── student/                    # Student portal pages
│   ├── lecturer/                   # Lecturer portal pages (if applicable)
│   └── shared/                     # Shared component pages
├── nginx/
│   ├── Dockerfile
│   ├── nginx.conf                  # Main Nginx configuration
│   └── frontend-routes.conf        # Frontend routing rules
├── database/
│   └── pgadmin/
│       └── servers.json            # pgAdmin auto-configuration
├── logs/                           # Log persistence
│   ├── backend/
│   └── nginx/
├── docker-compose.yml              # Local development
├── docker-compose.override.yml     # Local overrides
├── docker-compose.prod.yml         # Production configuration
├── docker-compose.test.yml         # Test database
├── Makefile                        # Development commands
├── .env.example                    # Environment variable template
├── .gitignore
├── README.md
└── PROJECT_TEMPLATE.md             # This file
```

---

## 3. Database Setup

### Configuration Strategy

**File:** `backend/src/config/database.js`

```javascript
require('dotenv').config();

module.exports = {
  development: {
    // Primary: Use DATABASE_URL for Railway/Heroku compatibility
    url: process.env.DATABASE_URL,
    // Fallback: Individual variables for local Docker
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'myapp',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5433,
    dialect: 'postgres',
    logging: false,
    dialectOptions: process.env.DATABASE_URL?.includes('railway') ? {
      ssl: { rejectUnauthorized: false }
    } : {}
  },
  test: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'myapp_test',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5434,
    dialect: 'postgres',
    logging: false
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: { rejectUnauthorized: false }
    },
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000
    }
  }
};
```

### Migration System

**File:** `backend/src/db/migrator.js`

```javascript
const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

async function runMigrations() {
  const env = process.env.NODE_ENV || 'development';
  const config = require('../config/database')[env];

  const sequelize = config.url
    ? new Sequelize(config.url, config)
    : new Sequelize(config.database, config.username, config.password, config);

  try {
    // Create migrations tracking table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Get executed migrations
    const [executedMigrations] = await sequelize.query(
      'SELECT name FROM migrations ORDER BY name'
    );
    const executedNames = executedMigrations.map(m => m.name);

    // Get migration files
    const migrationsDir = path.join(__dirname, '../database/migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.js'))
      .sort();

    // Run pending migrations
    for (const file of migrationFiles) {
      if (executedNames.includes(file)) {
        console.log(`⏭️  Skipping ${file} (already executed)`);
        continue;
      }

      console.log(`🔄 Running migration: ${file}`);

      const migration = require(path.join(migrationsDir, file));
      const transaction = await sequelize.transaction();

      try {
        await migration.up(sequelize.queryInterface, Sequelize, transaction);
        await sequelize.query(
          'INSERT INTO migrations (name) VALUES (?)',
          { replacements: [file], transaction }
        );
        await transaction.commit();
        console.log(`✅ Completed ${file}`);
      } catch (error) {
        await transaction.rollback();
        console.error(`❌ Migration ${file} failed:`, error);
        throw error;
      }
    }

    console.log('✨ All migrations completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };
```

### Migration File Template

**File:** `backend/src/database/migrations/YYYY-MM-DD-description.js`

```javascript
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize, transaction) => {
    // Enable UUID extension
    await queryInterface.sequelize.query(
      'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";',
      { transaction }
    );

    // Create table
    await queryInterface.createTable('table_name', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    }, { transaction });

    // Add indexes
    await queryInterface.addIndex('table_name', ['name'], {
      name: 'idx_table_name_name',
      transaction
    });
  },

  down: async (queryInterface, Sequelize, transaction) => {
    await queryInterface.dropTable('table_name', { transaction });
  }
};
```

### Core Database Tables Pattern

**Essential Tables:**

1. **users** - Authentication and user management
   - UUID primary key
   - email, password_hash, member_number
   - role ENUM (student, lecturer, admin, etc.)
   - account_status ENUM (active, pending_verification, blocked, suspended, terminated)
   - email_verification_token, email_verification_expires_at
   - password_reset_token, password_reset_expires_at
   - failed_login_attempts, last_failed_login
   - mfa_enabled, mfa_secret, mfa_backup_codes

2. **user_details** - Extended user information
   - One-to-one with users
   - Personal info (first_name, last_name, date_of_birth, gender)
   - Contact info (phone, alt_phone, email)
   - Address fields
   - profile_photo_url, bio
   - lifecycle_status tracking

3. **audit_logs** - Complete audit trail
   - user_id, action (INSERT/UPDATE/DELETE)
   - table_name, record_id
   - old_data, new_data (JSONB)
   - ip_address, user_agent
   - created_at

4. **system_settings** - Application configuration
   - key (unique), value (JSONB)
   - description, is_public
   - updated_by (user_id)

### Sequelize Model Template

**File:** `backend/src/models/ModelName.js`

```javascript
const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  class ModelName extends Model {
    // Instance methods
    async customMethod() {
      // Implementation
    }

    // For password models
    async validatePassword(password) {
      return bcrypt.compare(password, this.password_hash);
    }

    // JSON serialization
    toJSON() {
      const values = { ...this.get() };
      delete values.password_hash;
      delete values.password_reset_token;
      return values;
    }
  }

  ModelName.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 255]
      }
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'ModelName',
    tableName: 'table_names',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
      beforeCreate: async (instance) => {
        // Hash password before creating
        if (instance.password) {
          instance.password_hash = await bcrypt.hash(instance.password, 12);
          delete instance.password;
        }
      },
      beforeUpdate: async (instance) => {
        // Hash password before updating
        if (instance.changed('password')) {
          instance.password_hash = await bcrypt.hash(instance.password, 12);
          delete instance.password;
        }
      }
    }
  });

  return ModelName;
};
```

### Model Associations

**File:** `backend/src/models/index.js`

```javascript
const { Sequelize } = require('sequelize');
const config = require('../config/database');
const fs = require('fs');
const path = require('path');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = dbConfig.url
  ? new Sequelize(dbConfig.url, dbConfig)
  : new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig);

const db = {};

// Load all models
fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== 'index.js' &&
      file.slice(-3) === '.js'
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize);
    db[model.name] = model;
  });

// Define associations
db.User.hasMany(db.Application, { foreignKey: 'user_id' });
db.Application.belongsTo(db.User, { foreignKey: 'user_id' });

db.User.hasMany(db.Registration, { foreignKey: 'user_id' });
db.Registration.belongsTo(db.User, { foreignKey: 'user_id' });

db.User.hasOne(db.UserDetail, { foreignKey: 'user_id' });
db.UserDetail.belongsTo(db.User, { foreignKey: 'user_id' });

db.User.hasMany(db.EmergencyContact, { foreignKey: 'user_id' });
db.EmergencyContact.belongsTo(db.User, { foreignKey: 'user_id' });

// Add more associations as needed

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
```

---

## 4. Backend Architecture

### 3-Layer Architecture

**Pattern:** Routes → Controllers → Services

### Layer 1: Routes

**File:** `backend/src/routes/resource.routes.js`

```javascript
const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resource.controller');
const { authenticateToken, authorize } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validator.middleware');
const { strictRateLimit } = require('../middleware/rateLimit.middleware');
const { resourceValidation } = require('../validators/resource.validator');

// Public routes
router.get('/public', resourceController.getPublic);

// Authenticated routes
router.use(authenticateToken);

router.get('/', resourceController.getAll);
router.get('/:id', resourceController.getById);

// Protected routes (admin only)
router.post(
  '/',
  authorize(['admin']),
  resourceValidation.create,
  validate,
  resourceController.create
);

router.patch(
  '/:id',
  authorize(['admin']),
  resourceValidation.update,
  validate,
  resourceController.update
);

router.delete(
  '/:id',
  authorize(['admin']),
  resourceController.delete
);

// Sensitive routes with strict rate limiting
router.post(
  '/sensitive-action',
  strictRateLimit(3, 60000), // 3 requests per minute
  resourceValidation.sensitiveAction,
  validate,
  resourceController.sensitiveAction
);

module.exports = router;
```

### Layer 2: Controllers

**File:** `backend/src/controllers/resource.controller.js`

```javascript
const resourceService = require('../services/resource.service');
const ResponseHandler = require('../utils/responseHandler');

class ResourceController {
  async getAll(req, res, next) {
    try {
      const { page = 1, limit = 10, search } = req.query;

      const result = await resourceService.getAll({
        page: parseInt(page),
        limit: parseInt(limit),
        search
      });

      return ResponseHandler.success(res, result, 'Resources retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const resource = await resourceService.getById(id);

      return ResponseHandler.success(res, resource, 'Resource retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const data = req.body;
      const userId = req.user.user_id;

      const resource = await resourceService.create(data, userId);

      return ResponseHandler.created(res, resource, 'Resource created successfully');
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const data = req.body;
      const userId = req.user.user_id;

      const resource = await resourceService.update(id, data, userId);

      return ResponseHandler.success(res, resource, 'Resource updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.user_id;

      await resourceService.delete(id, userId);

      return ResponseHandler.success(res, null, 'Resource deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ResourceController();
```

### Layer 3: Services

**File:** `backend/src/services/resource.service.js`

```javascript
const { Resource, User } = require('../models');
const { Op } = require('sequelize');
const AppError = require('../utils/appError');

class ResourceService {
  async getAll({ page = 1, limit = 10, search }) {
    const offset = (page - 1) * limit;

    const whereClause = search ? {
      [Op.or]: [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ]
    } : {};

    const { rows: resources, count } = await Resource.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [{
        model: User,
        attributes: ['id', 'email', 'first_name', 'last_name']
      }]
    });

    return {
      resources,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  async getById(id) {
    const resource = await Resource.findByPk(id, {
      include: [{
        model: User,
        attributes: ['id', 'email', 'first_name', 'last_name']
      }]
    });

    if (!resource) {
      throw new AppError('Resource not found', 404);
    }

    return resource;
  }

  async create(data, userId) {
    const resource = await Resource.create({
      ...data,
      created_by: userId
    });

    return this.getById(resource.id);
  }

  async update(id, data, userId) {
    const resource = await this.getById(id);

    await resource.update({
      ...data,
      updated_by: userId
    });

    return this.getById(id);
  }

  async delete(id, userId) {
    const resource = await this.getById(id);

    // Soft delete or hard delete based on requirements
    await resource.destroy();

    return true;
  }
}

module.exports = new ResourceService();
```

### Main Application File

**File:** `backend/src/app.js`

```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND = path.join(__dirname, '../../frontend');

// Trust proxy (for X-Forwarded-For)
app.set('trust proxy', 1);

// Security headers
const securityHeaders = require('./middleware/securityHeaders.middleware');
app.use(securityHeaders);

// Rate limiting
const { globalRateLimit } = require('./middleware/rateLimit.middleware');
app.use(globalRateLimit);

// CORS
const corsMiddleware = require('./middleware/cors.middleware');
app.use(corsMiddleware);

// Parsers
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization
const { sanitizeInputs } = require('./middleware/sanitize.middleware');
app.use(sanitizeInputs);

// HTTP logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/resources', require('./routes/resource.routes'));
// Add more routes...

// Frontend routes (serve static files)
app.use(express.static(FRONTEND));

const page = (file) => (req, res) => {
  res.sendFile(path.join(FRONTEND, file));
};

app.get('/', page('public/Home.html'));
app.get('/login', page('public/Login.html'));
app.get('/register', page('public/Register.html'));
app.get('/admin', page('admin/Dashboard.html'));
app.get('/student', page('student/Dashboard.html'));
// Add more frontend routes...

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Frontend fallback (for SPA-like behavior)
app.get('*', page('public/Home.html'));

// Global error handler
const errorHandler = require('./middleware/errorHandler.middleware');
app.use(errorHandler);

// Database connection and migration
const { sequelize } = require('./models');
const { runMigrations } = require('./db/migrator');

async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Run migrations
    await runMigrations();
    console.log('✅ Migrations completed');

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;
```

### Essential Middleware

**1. Authentication Middleware**

**File:** `backend/src/middleware/auth.middleware.js`

```javascript
const jwt = require('jsonwebtoken');
const ResponseHandler = require('../utils/responseHandler');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
      return ResponseHandler.unauthorized(res, 'Access token required');
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return ResponseHandler.unauthorized(res, 'Token expired');
        }
        return ResponseHandler.unauthorized(res, 'Invalid token');
      }

      req.user = user;
      next();
    });
  } catch (error) {
    return ResponseHandler.error(res, error);
  }
};

const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return ResponseHandler.unauthorized(res, 'Authentication required');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return ResponseHandler.forbidden(res, 'Insufficient permissions');
    }

    next();
  };
};

module.exports = { authenticateToken, authorize };
```

**2. Rate Limiting Middleware**

**File:** `backend/src/middleware/rateLimit.middleware.js`

```javascript
const rateLimit = require('express-rate-limit');

const globalRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: process.env.DISABLE_RATE_LIMIT === 'true' ? 0 : 100,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test'
});

const strictRateLimit = (maxRequests = 5, windowMs = 60000) => {
  return rateLimit({
    windowMs,
    max: process.env.DISABLE_RATE_LIMIT === 'true' ? 0 : maxRequests,
    message: `Too many attempts, please try again in ${windowMs / 1000} seconds`,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => process.env.NODE_ENV === 'test'
  });
};

module.exports = { globalRateLimit, strictRateLimit };
```

**3. Error Handler Middleware**

**File:** `backend/src/middleware/errorHandler.middleware.js`

```javascript
const AppError = require('../utils/appError');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    const message = err.errors.map(e => e.message).join(', ');
    error = new AppError(message, 400);
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0].path;
    error = new AppError(`${field} already exists`, 409);
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token', 401);
  }

  // JWT expired
  if (err.name === 'TokenExpiredError') {
    error = new AppError('Token expired', 401);
  }

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = new AppError('File too large', 400);
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
```

**4. Input Sanitization Middleware**

**File:** `backend/src/middleware/sanitize.middleware.js`

```javascript
const xss = require('xss');

const sanitizeInputs = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

const sanitizeObject = (obj) => {
  const sanitized = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = xss(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

module.exports = { sanitizeInputs };
```

### Utility Classes

**1. Response Handler**

**File:** `backend/src/utils/responseHandler.js`

```javascript
class ResponseHandler {
  static success(res, data, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }

  static created(res, data, message = 'Created successfully') {
    return this.success(res, data, message, 201);
  }

  static error(res, error, statusCode = 500) {
    return res.status(statusCode).json({
      success: false,
      error: error.message || error
    });
  }

  static badRequest(res, message = 'Bad request') {
    return this.error(res, { message }, 400);
  }

  static unauthorized(res, message = 'Unauthorized') {
    return this.error(res, { message }, 401);
  }

  static forbidden(res, message = 'Forbidden') {
    return this.error(res, { message }, 403);
  }

  static notFound(res, message = 'Resource not found') {
    return this.error(res, { message }, 404);
  }

  static conflict(res, message = 'Conflict') {
    return this.error(res, { message }, 409);
  }
}

module.exports = ResponseHandler;
```

**2. App Error Class**

**File:** `backend/src/utils/appError.js`

```javascript
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
```

---

## 5. Frontend Architecture

### Global Configuration and API Client

**File:** `frontend/shared.js`

```javascript
// Application configuration
const APP_CONFIG = {
  API_BASE: "/api",
  API_URL: "/api",
  LOCALE: "en-ZA",
  ROUTES: {
    login: "/login",
    home: "/",
    roleHomes: {
      admin: "/admin",
      student: "/student",
      lecturer: "/lecturer",
    },
    forceChangePassword: "/student/profile?forceChange=1",
  },
  DEFAULTS: {
    toastMs: 4000,
    referenceDataTtlMs: 24 * 60 * 60 * 1000, // 24 hours
    referenceDataVersion: "v3",
  },
  STORAGE_KEYS: {
    authToken: "authToken",
    currentUser: "currentUser",
    referenceData: "eduhub.referenceData",
  }
};

// API wrapper with automatic token handling
async function api(endpoint, options = {}) {
  const token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.authToken);

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${APP_CONFIG.API_URL}${endpoint}`, config);

    // Handle unauthorized
    if (response.status === 401) {
      logout();
      return;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Authentication helpers
function isAuthenticated() {
  return !!localStorage.getItem(APP_CONFIG.STORAGE_KEYS.authToken);
}

function getCurrentUser() {
  const userJson = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.currentUser);
  return userJson ? JSON.parse(userJson) : null;
}

function logout() {
  localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.authToken);
  localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.currentUser);
  window.location.href = APP_CONFIG.ROUTES.login;
}

function requireAuth(requiredRole = null) {
  if (!isAuthenticated()) {
    window.location.href = APP_CONFIG.ROUTES.login;
    return false;
  }

  if (requiredRole) {
    const user = getCurrentUser();
    if (user.role !== requiredRole) {
      window.location.href = APP_CONFIG.ROUTES.home;
      return false;
    }
  }

  return true;
}

// Toast notifications
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, APP_CONFIG.DEFAULTS.toastMs);
}

// Form validation helpers
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePhone(phone) {
  const re = /^[0-9]{10}$/;
  return re.test(phone.replace(/[\s\-\(\)]/g, ''));
}

// Reference data caching
async function getReferenceData(key, fetchFunction) {
  const cacheKey = `${APP_CONFIG.STORAGE_KEYS.referenceData}.${key}`;
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    const { data, timestamp, version } = JSON.parse(cached);
    const age = Date.now() - timestamp;

    if (age < APP_CONFIG.DEFAULTS.referenceDataTtlMs &&
        version === APP_CONFIG.DEFAULTS.referenceDataVersion) {
      return data;
    }
  }

  const data = await fetchFunction();

  localStorage.setItem(cacheKey, JSON.stringify({
    data,
    timestamp: Date.now(),
    version: APP_CONFIG.DEFAULTS.referenceDataVersion
  }));

  return data;
}

// DOM helpers
function createElement(tag, attributes = {}, children = []) {
  const element = document.createElement(tag);

  for (const [key, value] of Object.entries(attributes)) {
    if (key === 'className') {
      element.className = value;
    } else if (key.startsWith('on')) {
      element.addEventListener(key.substring(2).toLowerCase(), value);
    } else {
      element.setAttribute(key, value);
    }
  }

  for (const child of children) {
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child));
    } else {
      element.appendChild(child);
    }
  }

  return element;
}

// Date formatting
function formatDate(dateString, options = {}) {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };

  return new Date(dateString).toLocaleDateString(APP_CONFIG.LOCALE, defaultOptions);
}

// Currency formatting
function formatCurrency(amount) {
  return new Intl.NumberFormat(APP_CONFIG.LOCALE, {
    style: 'currency',
    currency: 'ZAR'
  }).format(amount);
}

// Render navigation bar
function renderNavbar(role) {
  const user = getCurrentUser();

  const navbar = `
    <nav class="navbar">
      <div class="navbar-brand">
        <a href="${APP_CONFIG.ROUTES.roleHomes[role] || APP_CONFIG.ROUTES.home}">MyApp</a>
      </div>
      <div class="navbar-menu">
        ${role === 'admin' ? `
          <a href="/admin">Dashboard</a>
          <a href="/admin/users">Users</a>
          <a href="/admin/settings">Settings</a>
        ` : ''}
        ${role === 'student' ? `
          <a href="/student">Dashboard</a>
          <a href="/student/courses">My Courses</a>
          <a href="/student/profile">Profile</a>
        ` : ''}
        <div class="navbar-user">
          <span>${user.email}</span>
          <button onclick="logout()">Logout</button>
        </div>
      </div>
    </nav>
  `;

  const navbarContainer = document.getElementById('navbar-container');
  if (navbarContainer) {
    navbarContainer.innerHTML = navbar;
  }
}
```

### Page Template Pattern

**File:** `frontend/public/PageName.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Name - MyApp</title>
  <link rel="stylesheet" href="/shared.css">
  <style>
    /* Page-specific styles */
    .page-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
  </style>
</head>
<body>
  <div id="navbar-container"></div>

  <main class="page-container">
    <h1>Page Name</h1>

    <div id="content">
      <!-- Dynamic content goes here -->
    </div>
  </main>

  <script src="/shared.js"></script>
  <script>
    // Page-specific JavaScript
    (function() {
      // Check authentication
      requireAuth('student'); // or 'admin', 'lecturer', null for public

      // Initialize page
      async function initPage() {
        try {
          renderNavbar('student');
          await loadData();
        } catch (error) {
          console.error('Error initializing page:', error);
          showToast('Failed to load page', 'error');
        }
      }

      async function loadData() {
        try {
          const response = await api('/endpoint');
          renderContent(response.data);
        } catch (error) {
          console.error('Error loading data:', error);
          showToast('Failed to load data', 'error');
        }
      }

      function renderContent(data) {
        const contentDiv = document.getElementById('content');
        contentDiv.innerHTML = `
          <div class="data-item">
            ${data.map(item => `
              <div class="item">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
              </div>
            `).join('')}
          </div>
        `;
      }

      // Event handlers
      function handleSubmit(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData);

        api('/endpoint', {
          method: 'POST',
          body: JSON.stringify(data)
        })
        .then(response => {
          showToast('Success!', 'success');
          loadData();
        })
        .catch(error => {
          showToast(error.message, 'error');
        });
      }

      // Initialize on load
      document.addEventListener('DOMContentLoaded', initPage);
    })();
  </script>
</body>
</html>
```

### Global Styles

**File:** `frontend/shared.css`

```css
/* CSS Reset */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* CSS Variables */
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --danger-color: #dc3545;
  --warning-color: #ffc107;
  --info-color: #17a2b8;

  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --text-primary: #212529;
  --text-secondary: #6c757d;

  --border-color: #dee2e6;
  --border-radius: 4px;

  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --font-size-sm: 14px;
  --font-size-base: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 24px;
}

/* Base Styles */
body {
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  color: var(--text-primary);
  background-color: var(--bg-secondary);
  line-height: 1.5;
}

/* Navbar */
.navbar {
  background-color: var(--primary-color);
  color: white;
  padding: var(--spacing-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar-brand a {
  color: white;
  text-decoration: none;
  font-size: var(--font-size-xl);
  font-weight: bold;
}

.navbar-menu {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
}

.navbar-menu a {
  color: white;
  text-decoration: none;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius);
  transition: background-color 0.2s;
}

.navbar-menu a:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* Forms */
.form-group {
  margin-bottom: var(--spacing-md);
}

.form-label {
  display: block;
  margin-bottom: var(--spacing-sm);
  font-weight: 500;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: var(--font-size-base);
  font-family: var(--font-family);
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.form-error {
  color: var(--danger-color);
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-xs);
}

/* Buttons */
.btn {
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: var(--border-radius);
  font-size: var(--font-size-base);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-block;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: var(--secondary-color);
  color: white;
}

.btn-success {
  background-color: var(--success-color);
  color: white;
}

.btn-danger {
  background-color: var(--danger-color);
  color: white;
}

/* Cards */
.card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
}

.card-header {
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin-bottom: var(--spacing-md);
}

/* Tables */
.table {
  width: 100%;
  border-collapse: collapse;
  background-color: var(--bg-primary);
}

.table th,
.table td {
  padding: var(--spacing-md);
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.table th {
  font-weight: 600;
  background-color: var(--bg-secondary);
}

/* Toast Notifications */
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: var(--spacing-md);
  background-color: white;
  border-left: 4px solid var(--info-color);
  border-radius: var(--border-radius);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  animation: slideIn 0.3s ease-out;
}

.toast-success {
  border-left-color: var(--success-color);
}

.toast-error {
  border-left-color: var(--danger-color);
}

.toast-warning {
  border-left-color: var(--warning-color);
}

.toast.fade-out {
  animation: slideOut 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .navbar-menu {
    flex-direction: column;
    width: 100%;
  }
}
```

---

## 6. Docker Configuration

### Development Compose File

**File:** `docker-compose.yml`

```yaml
version: '3.8'

services:
  db:
    image: postgres:16-alpine
    container_name: myapp_db
    environment:
      POSTGRES_DB: ${DB_NAME:-myapp}
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres}
    ports:
      - "${DB_PORT:-5433}:5432"
    volumes:
      - myapp_pgdata:/var/lib/postgresql/data
    networks:
      - myapp_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-postgres}"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: myapp_pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: ${PGADMIN_EMAIL:-admin@myapp.com}
      PGADMIN_DEFAULT_PASSWORD: ${PGADMIN_PASSWORD:-admin}
      PGADMIN_CONFIG_SERVER_MODE: 'False'
    ports:
      - "5050:80"
    volumes:
      - myapp_pgadmin:/var/lib/pgadmin
      - ./database/pgadmin/servers.json:/pgadmin4/servers.json:ro
    networks:
      - myapp_network
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: myapp_backend
    command: npm run dev
    environment:
      NODE_ENV: ${NODE_ENV:-development}
      PORT: 3000
      DB_HOST: db
      DB_PORT: 5432
      DB_NAME: ${DB_NAME:-myapp}
      DB_USER: ${DB_USER:-postgres}
      DB_PASSWORD: ${DB_PASSWORD:-postgres}
      JWT_SECRET: ${JWT_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      JWT_EXPIRES_IN: ${JWT_EXPIRES_IN:-7d}
      ALLOWED_ORIGINS: ${ALLOWED_ORIGINS:-http://localhost}
    ports:
      - "3000:3000"
    volumes:
      - ./backend:/app
      - /app/node_modules
      - ./logs/backend:/app/logs
      - myapp_uploads:/app/uploads
    networks:
      - myapp_network
    depends_on:
      db:
        condition: service_healthy
      pgadmin:
        condition: service_started
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 40s
    restart: unless-stopped

  nginx:
    build:
      context: .
      dockerfile: nginx/Dockerfile
    container_name: myapp_nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./frontend:/usr/share/nginx/html:ro
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./logs/nginx:/var/log/nginx
    networks:
      - myapp_network
    depends_on:
      backend:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s
    restart: unless-stopped

networks:
  myapp_network:
    driver: bridge

volumes:
  myapp_pgdata:
  myapp_pgadmin:
  myapp_uploads:
```

### Production Compose File

**File:** `docker-compose.prod.yml`

```yaml
version: '3.8'

services:
  db:
    image: postgres:16-alpine
    container_name: myapp_db_prod
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - myapp_pgdata_prod:/var/lib/postgresql/data
    networks:
      - myapp_network_prod
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: always

  backend:
    image: ghcr.io/yourorg/myapp-backend:latest
    container_name: myapp_backend_prod
    environment:
      NODE_ENV: production
      PORT: 3000
      DB_HOST: db
      DB_PORT: 5432
      DB_NAME: ${DB_NAME}
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      JWT_EXPIRES_IN: ${JWT_EXPIRES_IN:-7d}
      SMTP_HOST: ${SMTP_HOST}
      SMTP_PORT: ${SMTP_PORT}
      SMTP_USER: ${SMTP_USER}
      SMTP_PASS: ${SMTP_PASS}
    ports:
      - "3000:3000"
    volumes:
      - myapp_uploads_prod:/app/uploads
      - ./logs/backend:/app/logs
    networks:
      - myapp_network_prod
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 40s
    restart: always

  nginx:
    image: ghcr.io/yourorg/myapp-nginx:latest
    container_name: myapp_nginx_prod
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./logs/nginx:/var/log/nginx
      - certbot-etc:/etc/letsencrypt
      - certbot-var:/var/lib/letsencrypt
    networks:
      - myapp_network_prod
    depends_on:
      backend:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/healthz"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s
    restart: always

  certbot:
    image: certbot/certbot
    container_name: myapp_certbot
    volumes:
      - certbot-etc:/etc/letsencrypt
      - certbot-var:/var/lib/letsencrypt
      - ./frontend:/var/www/html:ro
    depends_on:
      - nginx
    command: certonly --webroot --webroot-path=/var/www/html --email admin@yourdomain.com --agree-tos --no-eff-email --force-renewal -d yourdomain.com -d www.yourdomain.com

networks:
  myapp_network_prod:
    driver: bridge

volumes:
  myapp_pgdata_prod:
  myapp_uploads_prod:
  certbot-etc:
  certbot-var:
```

### Test Database Compose File

**File:** `docker-compose.test.yml`

```yaml
version: '3.8'

services:
  db-test:
    image: postgres:16-alpine
    container_name: myapp_db_test
    environment:
      POSTGRES_DB: myapp_test
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5434:5432"
    networks:
      - myapp_test_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 3s
      retries: 5
    tmpfs:
      - /var/lib/postgresql/data

networks:
  myapp_test_network:
    driver: bridge
```

### Backend Dockerfile

**File:** `backend/Dockerfile`

```dockerfile
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) })"

# Start application
CMD ["npm", "start"]
```

### Nginx Dockerfile

**File:** `nginx/Dockerfile`

```dockerfile
FROM nginx:alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Copy nginx configuration
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/frontend-routes.conf /etc/nginx/frontend-routes.conf

# Copy frontend files
COPY frontend/ /usr/share/nginx/html/

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -fsS http://localhost/healthz || exit 1

# Expose ports
EXPOSE 80 443

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration

**File:** `nginx/nginx.conf`

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 10M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript
               application/json application/javascript application/xml+rss
               application/rss+xml application/atom+xml image/svg+xml;

    # Rate limiting zones
    limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=api:10m rate=30r/s;

    # Upstream backend
    upstream backend {
        server backend:3000;
    }

    server {
        listen 80;
        server_name _;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;

        # Health check endpoint
        location /healthz {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }

        # API proxy
        location /api/ {
            limit_req zone=api burst=10 nodelay;

            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            proxy_read_timeout 300s;
            proxy_connect_timeout 75s;
        }

        # Static files
        location / {
            limit_req zone=general burst=5 nodelay;

            root /usr/share/nginx/html;
            try_files $uri $uri/ @frontend_routes;

            # Cache static assets
            location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
                expires 1y;
                add_header Cache-Control "public, immutable";
            }
        }

        # Frontend routing
        location @frontend_routes {
            include /etc/nginx/frontend-routes.conf;
        }
    }

    # HTTPS configuration (production)
    server {
        listen 443 ssl http2;
        server_name yourdomain.com;

        ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;

        # Same configuration as HTTP server
        # ... (duplicate location blocks)
    }
}
```

### Frontend Routes Configuration

**File:** `nginx/frontend-routes.conf`

```nginx
# Public routes
location = / {
    root /usr/share/nginx/html;
    try_files /public/Home.html =404;
}

location = /login {
    root /usr/share/nginx/html;
    try_files /public/Login.html =404;
}

location = /register {
    root /usr/share/nginx/html;
    try_files /public/Register.html =404;
}

# Admin routes
location /admin {
    root /usr/share/nginx/html;
    try_files $uri /admin/Dashboard.html =404;
}

# Student routes
location /student {
    root /usr/share/nginx/html;
    try_files $uri /student/Dashboard.html =404;
}

# Default fallback
location / {
    root /usr/share/nginx/html;
    try_files /public/Home.html =404;
}
```

---

## 7. GitHub Workflows (CI/CD)

### Main Deployment Workflow

**File:** `.github/workflows/deploy.yml`

```yaml
name: Build and Deploy

on:
  push:
    branches:
      - main
  workflow_dispatch:
    inputs:
      force_deploy_all:
        description: 'Force deploy all services'
        required: false
        type: boolean
        default: false

jobs:
  changes:
    name: Detect Changes
    runs-on: ubuntu-latest
    outputs:
      backend: ${{ steps.filter.outputs.backend }}
      nginx: ${{ steps.filter.outputs.nginx }}
      root: ${{ steps.filter.outputs.root }}
    steps:
      - uses: actions/checkout@v4

      - uses: dorny/paths-filter@v3
        id: filter
        with:
          filters: |
            backend:
              - 'backend/**'
            nginx:
              - 'nginx/**'
              - 'frontend/**'
            root:
              - 'docker-compose*.yml'
              - 'database/**'
              - '.env.example'

  backend-tests:
    name: Backend Tests
    if: needs.changes.outputs.backend == 'true' || needs.changes.outputs.root == 'true' || github.event.inputs.force_deploy_all == 'true'
    needs: changes
    uses: ./.github/workflows/backend-tests.yml
    with:
      coverage: true

  build-backend:
    name: Build Backend Image
    needs: [changes, backend-tests]
    if: needs.changes.outputs.backend == 'true' || needs.changes.outputs.root == 'true' || github.event.inputs.force_deploy_all == 'true'
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4

      - name: Log in to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/${{ github.repository }}-backend
          tags: |
            type=raw,value=latest
            type=sha

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          file: ./backend/Dockerfile
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          no-cache: true

  build-nginx:
    name: Build Nginx Image
    needs: changes
    if: needs.changes.outputs.nginx == 'true' || needs.changes.outputs.root == 'true' || github.event.inputs.force_deploy_all == 'true'
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4

      - name: Log in to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/${{ github.repository }}-nginx
          tags: |
            type=raw,value=latest
            type=sha

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./nginx/Dockerfile
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          no-cache: true

  deploy:
    name: Deploy to Production
    needs: [changes, build-backend, build-nginx]
    if: |
      always() &&
      (needs.build-backend.result == 'success' || needs.build-backend.result == 'skipped') &&
      (needs.build-nginx.result == 'success' || needs.build-nginx.result == 'skipped')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Tailscale
        uses: tailscale/github-action@v2
        with:
          oauth-client-id: ${{ secrets.TS_OAUTH_CLIENT_ID }}
          oauth-secret: ${{ secrets.TS_OAUTH_SECRET }}
          tags: tag:ci

      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        env:
          CHANGED_BACKEND: ${{ needs.changes.outputs.backend }}
          CHANGED_NGINX: ${{ needs.changes.outputs.nginx }}
          FORCE_DEPLOY: ${{ github.event.inputs.force_deploy_all }}
        with:
          host: ${{ secrets.DEPLOY_HOST }}
          username: ${{ secrets.DEPLOY_USER }}
          key: ${{ secrets.DEPLOY_SSH_KEY }}
          port: 22
          envs: CHANGED_BACKEND,CHANGED_NGINX,FORCE_DEPLOY
          script: |
            set -e
            cd /opt/myapp

            # Write docker-compose files
            cat > docker-compose.yml << 'EOF'
            ${{ secrets.DOCKER_COMPOSE_CONTENT }}
            EOF

            cat > docker-compose.prod.yml << 'EOF'
            ${{ secrets.DOCKER_COMPOSE_PROD_CONTENT }}
            EOF

            # Write .env file
            cat > .env << 'EOF'
            DB_NAME=${{ secrets.DB_NAME }}
            DB_USER=${{ secrets.DB_USER }}
            DB_PASSWORD=${{ secrets.DB_PASSWORD }}
            JWT_SECRET=${{ secrets.JWT_SECRET }}
            JWT_REFRESH_SECRET=${{ secrets.JWT_REFRESH_SECRET }}
            SMTP_USER=${{ secrets.SMTP_USER }}
            SMTP_PASS=${{ secrets.SMTP_PASS }}
            EOF

            # Login to GHCR
            echo "${{ secrets.GHCR_TOKEN }}" | docker login ghcr.io -u ${{ github.actor }} --password-stdin

            # Pull latest images
            docker compose -f docker-compose.prod.yml pull

            # Smart deployment
            SERVICES_TO_RESTART=""

            if [ "$FORCE_DEPLOY" = "true" ]; then
              SERVICES_TO_RESTART="backend nginx"
            else
              [ "$CHANGED_BACKEND" = "true" ] && SERVICES_TO_RESTART="$SERVICES_TO_RESTART backend"
              [ "$CHANGED_NGINX" = "true" ] && SERVICES_TO_RESTART="$SERVICES_TO_RESTART nginx"
            fi

            if [ -n "$SERVICES_TO_RESTART" ]; then
              echo "Restarting services: $SERVICES_TO_RESTART"
              docker compose -f docker-compose.prod.yml up -d $SERVICES_TO_RESTART

              # Health checks
              for i in {1..24}; do
                if docker compose -f docker-compose.prod.yml ps | grep -q "healthy"; then
                  echo "✅ Deployment successful"
                  exit 0
                fi
                echo "Waiting for services to be healthy... ($i/24)"
                sleep 5
              done

              echo "❌ Health check failed, rolling back"
              docker compose -f docker-compose.prod.yml down
              docker compose -f docker-compose.prod.yml up -d
              exit 1
            else
              echo "No services to restart"
            fi
```

### Test Workflow

**File:** `.github/workflows/test.yml`

```yaml
name: Tests

on:
  push:
    branches:
      - main
      - develop
      - 'feature/**'
    paths:
      - 'backend/**'
      - 'docker-compose.test.yml'
      - 'Makefile'
      - '.github/workflows/**'
  pull_request:

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  test:
    name: Run Tests
    uses: ./.github/workflows/backend-tests.yml
    with:
      coverage: true
```

### Backend Tests Workflow (Reusable)

**File:** `.github/workflows/backend-tests.yml`

```yaml
name: Backend Tests

on:
  workflow_call:
    inputs:
      coverage:
        required: false
        type: boolean
        default: false

jobs:
  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./backend
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        env:
          JWT_SECRET: test-secret
          JWT_REFRESH_SECRET: test-refresh-secret
          JWT_EXPIRES_IN: 7d
          DISABLE_RATE_LIMIT: 'true'
        run: npm run test:unit

  integration-tests:
    name: Integration Tests
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./backend
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: myapp_test
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
        ports:
          - 5434:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Run integration tests
        env:
          CI: true
          DB_HOST: localhost
          DB_PORT: 5434
          DB_NAME: myapp_test
          DB_USER: postgres
          DB_PASSWORD: postgres
          JWT_SECRET: test-secret
          JWT_REFRESH_SECRET: test-refresh-secret
          JWT_EXPIRES_IN: 7d
          DISABLE_RATE_LIMIT: 'true'
        run: npm run test:integration

  coverage:
    name: Coverage Report
    if: inputs.coverage
    runs-on: ubuntu-latest
    needs: [unit-tests, integration-tests]
    defaults:
      run:
        working-directory: ./backend
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: myapp_test
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
        ports:
          - 5434:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Generate coverage
        env:
          CI: true
          DB_HOST: localhost
          DB_PORT: 5434
          DB_NAME: myapp_test
          DB_USER: postgres
          DB_PASSWORD: postgres
          JWT_SECRET: test-secret
          JWT_REFRESH_SECRET: test-refresh-secret
          JWT_EXPIRES_IN: 7d
          DISABLE_RATE_LIMIT: 'true'
        run: npm run test:coverage

      - name: Upload coverage artifacts
        uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: backend/coverage/
          retention-days: 14

      - name: Generate coverage summary
        run: |
          echo "## Test Coverage Summary" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY

          if [ -f coverage/coverage-summary.json ]; then
            node -e "
              const summary = require('./coverage/coverage-summary.json');
              const total = summary.total;

              console.log('| Metric | Coverage |');
              console.log('|--------|----------|');
              console.log('| Lines | ' + total.lines.pct + '% |');
              console.log('| Statements | ' + total.statements.pct + '% |');
              console.log('| Functions | ' + total.functions.pct + '% |');
              console.log('| Branches | ' + total.branches.pct + '% |');
            " >> $GITHUB_STEP_SUMMARY
          fi
```

---

## 8. Testing Strategy

### Jest Configuration

**File:** `backend/jest.config.js`

```javascript
module.exports = {
  projects: [
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/tests/unit/**/*.test.js'],
      testEnvironment: 'node',
      collectCoverageFrom: [
        'src/**/*.js',
        '!src/database/**',
        '!src/db/**',
      ],
      coverageDirectory: 'coverage',
      coverageReporters: ['text', 'lcov', 'json-summary'],
      testTimeout: 10000,
    },
    {
      displayName: 'integration',
      testMatch: ['<rootDir>/tests/integration/**/*.integration.test.js'],
      testEnvironment: 'node',
      globalSetup: '<rootDir>/tests/integration/globalSetup.js',
      testTimeout: 30000,
    },
  ],
  coverageThreshold: {
    './src/utils/passwordValidator.js': {
      branches: 85,
      functions: 100,
      lines: 90,
      statements: 90,
    },
    './src/utils/responseHandler.js': {
      branches: 75,
      functions: 100,
      lines: 90,
      statements: 90,
    },
  },
};
```

### Test Setup Files

**File:** `backend/tests/setup.js`

```javascript
// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.JWT_EXPIRES_IN = '7d';
process.env.DISABLE_RATE_LIMIT = 'true';

// Global test utilities
global.testUtils = {
  createMockRequest: (overrides = {}) => ({
    body: {},
    params: {},
    query: {},
    headers: {},
    user: null,
    ...overrides,
  }),

  createMockResponse: () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
  },

  createMockNext: () => jest.fn(),
};
```

**File:** `backend/tests/integration/globalSetup.js`

```javascript
const { execSync } = require('child_process');
const { sequelize } = require('../../src/models');

module.exports = async () => {
  // Start test database if not in CI
  if (process.env.CI !== 'true') {
    try {
      execSync('docker compose -f ../docker-compose.test.yml up -d --wait', {
        stdio: 'inherit',
      });
    } catch (error) {
      console.error('Failed to start test database:', error);
      process.exit(1);
    }
  }

  // Wait for database connection
  let retries = 5;
  while (retries > 0) {
    try {
      await sequelize.authenticate();
      console.log('✅ Test database connected');
      break;
    } catch (error) {
      retries--;
      if (retries === 0) {
        console.error('❌ Failed to connect to test database');
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  await sequelize.close();
};
```

**File:** `backend/tests/integration/env.js`

```javascript
process.env.NODE_ENV = 'test';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5434';
process.env.DB_NAME = 'myapp_test';
process.env.DB_USER = 'postgres';
process.env.DB_PASSWORD = 'postgres';
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.DISABLE_RATE_LIMIT = 'true';
```

### Unit Test Template

**File:** `backend/tests/unit/services/resource.service.test.js`

```javascript
const resourceService = require('../../../src/services/resource.service');
const { Resource, User } = require('../../../src/models');

jest.mock('../../../src/models');

describe('ResourceService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return paginated resources', async () => {
      const mockResources = [
        { id: '1', name: 'Resource 1' },
        { id: '2', name: 'Resource 2' },
      ];

      Resource.findAndCountAll = jest.fn().mockResolvedValue({
        rows: mockResources,
        count: 2,
      });

      const result = await resourceService.getAll({ page: 1, limit: 10 });

      expect(result.resources).toEqual(mockResources);
      expect(result.pagination.total).toBe(2);
      expect(Resource.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 10,
          offset: 0,
        })
      );
    });

    it('should filter resources by search query', async () => {
      const search = 'test';
      Resource.findAndCountAll = jest.fn().mockResolvedValue({
        rows: [],
        count: 0,
      });

      await resourceService.getAll({ page: 1, limit: 10, search });

      expect(Resource.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            [expect.any(Symbol)]: expect.any(Array),
          }),
        })
      );
    });
  });

  describe('getById', () => {
    it('should return resource by id', async () => {
      const mockResource = { id: '1', name: 'Resource 1' };
      Resource.findByPk = jest.fn().mockResolvedValue(mockResource);

      const result = await resourceService.getById('1');

      expect(result).toEqual(mockResource);
      expect(Resource.findByPk).toHaveBeenCalledWith('1', expect.any(Object));
    });

    it('should throw error if resource not found', async () => {
      Resource.findByPk = jest.fn().mockResolvedValue(null);

      await expect(resourceService.getById('999')).rejects.toThrow(
        'Resource not found'
      );
    });
  });

  describe('create', () => {
    it('should create new resource', async () => {
      const mockData = { name: 'New Resource' };
      const mockResource = { id: '1', ...mockData };

      Resource.create = jest.fn().mockResolvedValue(mockResource);
      Resource.findByPk = jest.fn().mockResolvedValue(mockResource);

      const result = await resourceService.create(mockData, 'user-id');

      expect(Resource.create).toHaveBeenCalledWith({
        ...mockData,
        created_by: 'user-id',
      });
      expect(result).toEqual(mockResource);
    });
  });
});
```

### Integration Test Template

**File:** `backend/tests/integration/api/resource.integration.test.js`

```javascript
require('../env');
const request = require('supertest');
const app = require('../../../src/app');
const { sequelize, Resource, User } = require('../../../src/models');
const { runMigrations } = require('../../../src/db/migrator');

describe('Resource API Integration Tests', () => {
  let authToken;
  let testUser;

  beforeAll(async () => {
    // Run migrations
    await runMigrations();
  });

  beforeEach(async () => {
    // Create test user and get auth token
    testUser = await User.create({
      email: 'test@example.com',
      password: 'Password123!',
      role: 'admin',
    });

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Password123!',
      });

    authToken = loginResponse.body.data.token;
  });

  afterEach(async () => {
    // Clean up database
    await Resource.destroy({ where: {}, force: true });
    await User.destroy({ where: {}, force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /api/resources', () => {
    it('should return all resources', async () => {
      // Create test data
      await Resource.bulkCreate([
        { name: 'Resource 1', created_by: testUser.id },
        { name: 'Resource 2', created_by: testUser.id },
      ]);

      const response = await request(app)
        .get('/api/resources')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.resources).toHaveLength(2);
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/api/resources')
        .expect(401);
    });
  });

  describe('POST /api/resources', () => {
    it('should create new resource', async () => {
      const resourceData = {
        name: 'New Resource',
        description: 'Test description',
      };

      const response = await request(app)
        .post('/api/resources')
        .set('Authorization', `Bearer ${authToken}`)
        .send(resourceData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(resourceData.name);

      const dbResource = await Resource.findOne({
        where: { name: resourceData.name },
      });
      expect(dbResource).toBeTruthy();
    });

    it('should validate required fields', async () => {
      await request(app)
        .post('/api/resources')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);
    });
  });
});
```

---

## 9. Security Implementation

### Security Checklist

**Essential Security Measures:**

1. **Authentication & Authorization**
   - ✅ JWT-based authentication
   - ✅ Refresh token mechanism
   - ✅ Role-based access control
   - ✅ Multi-factor authentication (MFA)
   - ✅ Password strength validation
   - ✅ Account lockout after failed logins

2. **Input Validation**
   - ✅ express-validator for request validation
   - ✅ XSS protection via sanitization
   - ✅ SQL injection prevention (Sequelize ORM)
   - ✅ File upload validation

3. **Rate Limiting**
   - ✅ Global rate limiting (100 req/min)
   - ✅ API rate limiting (30 req/min)
   - ✅ Strict rate limiting for sensitive endpoints (3-5 req/min)

4. **Security Headers**
   - ✅ X-Frame-Options
   - ✅ X-Content-Type-Options
   - ✅ X-XSS-Protection
   - ✅ Referrer-Policy
   - ✅ Content-Security-Policy (recommended)

5. **Data Protection**
   - ✅ Password hashing (bcrypt with cost factor 12)
   - ✅ Sensitive data exclusion from JSON responses
   - ✅ Environment variable management
   - ✅ Secrets in GitHub Secrets (not in code)

6. **Audit & Logging**
   - ✅ Comprehensive audit logs
   - ✅ Request logging (Morgan)
   - ✅ Error logging
   - ✅ IP address tracking

7. **Infrastructure Security**
   - ✅ HTTPS/TLS encryption
   - ✅ Docker container security (non-root user)
   - ✅ VPN access for deployments (Tailscale)
   - ✅ PostgreSQL password protection

### Password Hashing Implementation

**File:** `backend/src/models/User.js` (excerpt)

```javascript
const bcrypt = require('bcryptjs');

// Hooks
hooks: {
  beforeCreate: async (user) => {
    if (user.password) {
      user.password_hash = await bcrypt.hash(user.password, 12);
      delete user.password;
    }
  },
  beforeUpdate: async (user) => {
    if (user.changed('password')) {
      user.password_hash = await bcrypt.hash(user.password, 12);
      delete user.password;
    }
  }
}

// Instance methods
async validatePassword(password) {
  return bcrypt.compare(password, this.password_hash);
}
```

### MFA Implementation

**File:** `backend/src/services/mfa.service.js`

```javascript
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { User } = require('../models');
const AppError = require('../utils/appError');

class MFAService {
  async setupMFA(userId) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.mfa_enabled) {
      throw new AppError('MFA is already enabled', 400);
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `MyApp (${user.email})`,
      issuer: 'MyApp',
    });

    // Generate backup codes
    const backupCodes = Array.from({ length: 10 }, () =>
      Math.random().toString(36).substring(2, 10).toUpperCase()
    );

    // Store temporary secret (not yet activated)
    await user.update({
      mfa_secret_temp: secret.base32,
      mfa_backup_codes_temp: JSON.stringify(backupCodes),
    });

    // Generate QR code
    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    return {
      secret: secret.base32,
      qrCode,
      backupCodes,
    };
  }

  async verifyAndActivateMFA(userId, token) {
    const user = await User.findByPk(userId);

    if (!user || !user.mfa_secret_temp) {
      throw new AppError('MFA setup not initiated', 400);
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: user.mfa_secret_temp,
      encoding: 'base32',
      token,
      window: 2,
    });

    if (!verified) {
      throw new AppError('Invalid verification code', 400);
    }

    // Activate MFA
    await user.update({
      mfa_enabled: true,
      mfa_secret: user.mfa_secret_temp,
      mfa_backup_codes: user.mfa_backup_codes_temp,
      mfa_secret_temp: null,
      mfa_backup_codes_temp: null,
    });

    return { success: true };
  }

  async verifyMFA(userId, token) {
    const user = await User.findByPk(userId);

    if (!user || !user.mfa_enabled) {
      throw new AppError('MFA not enabled', 400);
    }

    // Check if it's a backup code
    const backupCodes = JSON.parse(user.mfa_backup_codes || '[]');
    const backupCodeIndex = backupCodes.indexOf(token);

    if (backupCodeIndex !== -1) {
      // Remove used backup code
      backupCodes.splice(backupCodeIndex, 1);
      await user.update({ mfa_backup_codes: JSON.stringify(backupCodes) });
      return { success: true, usedBackupCode: true };
    }

    // Verify TOTP token
    const verified = speakeasy.totp.verify({
      secret: user.mfa_secret,
      encoding: 'base32',
      token,
      window: 2,
    });

    if (!verified) {
      throw new AppError('Invalid verification code', 401);
    }

    return { success: true, usedBackupCode: false };
  }
}

module.exports = new MFAService();
```

### Audit Logging

**File:** `backend/src/middleware/audit.middleware.js`

```javascript
const { AuditLog } = require('../models');

const auditAction = (action, tableName) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    const oldData = req.auditOldData || null;

    res.send = function (data) {
      // Only log successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const parsedData = typeof data === 'string' ? JSON.parse(data) : data;

        AuditLog.create({
          user_id: req.user?.user_id || null,
          action,
          table_name: tableName,
          record_id: req.params.id || parsedData?.data?.id || null,
          old_data: oldData,
          new_data: parsedData?.data || null,
          ip_address: req.ip,
          user_agent: req.get('user-agent'),
        }).catch(error => {
          console.error('Audit log error:', error);
        });
      }

      originalSend.call(this, data);
    };

    next();
  };
};

module.exports = { auditAction };
```

---

## 10. Deployment Configuration

### Environment Variables Template

**File:** `.env.example`

```bash
# Server
PORT=3000
NODE_ENV=development

# CORS
ALLOWED_ORIGINS=http://localhost,http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=5433
DB_NAME=myapp
DB_USER=postgres
DB_PASSWORD=yourpassword

# Alternative: Use DATABASE_URL for Railway/Heroku
# DATABASE_URL=postgresql://user:password@host:port/database

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
JWT_EXPIRES_IN=7d

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@myapp.com
ADMIN_EMAIL=admin@myapp.com

# pgAdmin
PGADMIN_EMAIL=admin@myapp.com
PGADMIN_PASSWORD=admin

# Rate Limiting
DISABLE_RATE_LIMIT=false

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# Application
APP_NAME=MyApp
APP_URL=http://localhost
```

### GitHub Secrets Required

**Repository Secrets:**

```bash
# Deployment
DEPLOY_HOST=your-server-ip-or-hostname
DEPLOY_USER=deployment-user
DEPLOY_SSH_KEY=<private-ssh-key>

# Tailscale VPN
TS_OAUTH_CLIENT_ID=<tailscale-oauth-client-id>
TS_OAUTH_SECRET=<tailscale-oauth-secret>

# Database
DB_NAME=myapp_prod
DB_USER=postgres
DB_PASSWORD=<strong-password>

# JWT
JWT_SECRET=<strong-secret-min-32-chars>
JWT_REFRESH_SECRET=<strong-secret-min-32-chars>

# Email
SMTP_USER=your-email@gmail.com
SMTP_PASS=<gmail-app-password>

# GHCR
GHCR_TOKEN=<github-personal-access-token>

# Docker Compose Content (as strings)
DOCKER_COMPOSE_CONTENT=<content-of-docker-compose.yml>
DOCKER_COMPOSE_PROD_CONTENT=<content-of-docker-compose.prod.yml>
```

### Makefile

**File:** `Makefile`

```makefile
.PHONY: help init up down restart logs health test clean

# Colors for output
CYAN := \033[0;36m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

help: ## Show this help message
	@echo "$(CYAN)Available commands:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

init: ## Initialize project (setup + build + start)
	@echo "$(CYAN)Initializing project...$(NC)"
	@make up
	@echo "$(GREEN)✅ Project initialized!$(NC)"

up: ## Start all services
	@echo "$(CYAN)Starting services...$(NC)"
	docker compose up -d --wait
	@echo "$(GREEN)✅ Services started$(NC)"

down: ## Stop all services
	@echo "$(CYAN)Stopping services...$(NC)"
	docker compose down
	@echo "$(GREEN)✅ Services stopped$(NC)"

restart: ## Restart all services
	@echo "$(CYAN)Restarting services...$(NC)"
	@make down
	@make up

logs: ## View logs (all services)
	docker compose logs -f

logs-backend: ## View backend logs
	docker compose logs -f backend

logs-nginx: ## View nginx logs
	docker compose logs -f nginx

logs-db: ## View database logs
	docker compose logs -f db

health: ## Check service health
	@echo "$(CYAN)Checking service health...$(NC)"
	@docker compose ps
	@echo ""
	@curl -s http://localhost/api/health | jq . || echo "$(RED)❌ Backend unhealthy$(NC)"

test: ## Run all tests (auto-starts test DB)
	@echo "$(CYAN)Running tests...$(NC)"
	cd backend && npm run test:all

test-unit: ## Run unit tests only
	@echo "$(CYAN)Running unit tests...$(NC)"
	cd backend && npm run test:unit

test-integration: ## Run integration tests (auto-starts test DB)
	@echo "$(CYAN)Running integration tests...$(NC)"
	cd backend && npm run test:integration

test-coverage: ## Run tests with coverage
	@echo "$(CYAN)Generating coverage report...$(NC)"
	cd backend && npm run test:coverage

test-watch: ## Run unit tests in watch mode
	cd backend && npm run test:watch

migrate: ## Run database migrations
	@echo "$(CYAN)Running migrations...$(NC)"
	docker compose exec backend npm run migrate
	@echo "$(GREEN)✅ Migrations completed$(NC)"

shell-backend: ## Open shell in backend container
	docker compose exec backend sh

shell-db: ## Open PostgreSQL shell
	docker compose exec db psql -U postgres -d myapp

shell-nginx: ## Open shell in nginx container
	docker compose exec nginx sh

backup: ## Backup database
	@echo "$(CYAN)Creating database backup...$(NC)"
	@mkdir -p backups
	docker compose exec -T db pg_dump -U postgres myapp > backups/backup-$(shell date +%Y%m%d-%H%M%S).sql
	@echo "$(GREEN)✅ Backup created in backups/$(NC)"

restore: ## Restore database from latest backup
	@echo "$(CYAN)Restoring database from latest backup...$(NC)"
	@LATEST=$$(ls -t backups/*.sql | head -1); \
	if [ -z "$$LATEST" ]; then \
		echo "$(RED)❌ No backups found$(NC)"; \
		exit 1; \
	fi; \
	echo "Restoring from $$LATEST"; \
	docker compose exec -T db psql -U postgres myapp < $$LATEST
	@echo "$(GREEN)✅ Database restored$(NC)"

clean: ## Clean up containers, volumes, and build artifacts
	@echo "$(YELLOW)⚠️  This will remove all containers, volumes, and build artifacts$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker compose down -v; \
		rm -rf backend/node_modules; \
		rm -rf backend/coverage; \
		echo "$(GREEN)✅ Cleanup completed$(NC)"; \
	fi

up-prod: ## Start services in production mode
	@echo "$(CYAN)Starting production services...$(NC)"
	docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --wait
	@echo "$(GREEN)✅ Production services started$(NC)"

down-prod: ## Stop production services
	@echo "$(CYAN)Stopping production services...$(NC)"
	docker compose -f docker-compose.yml -f docker-compose.prod.yml down
	@echo "$(GREEN)✅ Production services stopped$(NC)"

deploy: ## Deploy to production (requires Tailscale)
	@echo "$(CYAN)Deploying to production...$(NC)"
	@echo "$(YELLOW)⚠️  This should normally be done via GitHub Actions$(NC)"
	@read -p "Continue with manual deployment? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		@make up-prod; \
	fi
```

---

## 11. Development Workflow

### Initial Setup

```bash
# 1. Clone repository
git clone <repository-url>
cd project-name

# 2. Copy environment variables
cp .env.example .env

# 3. Edit .env with your values
nano .env

# 4. Initialize project
make init

# 5. Access services
# - Application: http://localhost
# - Backend API: http://localhost/api
# - pgAdmin: http://localhost:5050
# - API Health: http://localhost/api/health
```

### Daily Development

```bash
# Start services
make up

# View logs
make logs              # All services
make logs-backend      # Backend only
make logs-nginx        # Nginx only

# Run tests
make test              # All tests
make test-unit         # Unit tests
make test-integration  # Integration tests
make test-watch        # Watch mode

# Database operations
make migrate           # Run migrations
make shell-db          # Open PostgreSQL shell
make backup            # Backup database
make restore           # Restore latest backup

# Container access
make shell-backend     # Backend shell
make shell-nginx       # Nginx shell

# Stop services
make down
```

### Code Changes Workflow

```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Make changes
# - Edit files
# - Add tests
# - Run tests locally: make test

# 3. Commit changes
git add .
git commit -m "feat: add new feature"

# 4. Push to remote
git push origin feature/new-feature

# 5. Create pull request
# - GitHub will run tests automatically
# - Code review
# - Merge to main

# 6. Automatic deployment
# - GitHub Actions will deploy to production
# - Monitor deployment in Actions tab
```

### Testing Workflow

```bash
# Unit tests (fast, no database)
make test-unit

# Integration tests (requires database)
make test-integration

# All tests with coverage
make test-coverage

# Watch mode for TDD
make test-watch
```

### Database Workflow

```bash
# 1. Create migration file
touch backend/src/database/migrations/$(date +%Y-%m-%d)-description.js

# 2. Write migration (see migration template above)

# 3. Run migration
make migrate

# 4. Verify in database
make shell-db
\dt  # List tables
\d table_name  # Describe table

# 5. Create corresponding Sequelize model
touch backend/src/models/ModelName.js

# 6. Update model associations in models/index.js
```

### Production Deployment

**Automated (Recommended):**

```bash
# Push to main branch
git push origin main

# GitHub Actions will:
# 1. Run all tests
# 2. Build Docker images
# 3. Push to GHCR
# 4. Deploy to production server
# 5. Run health checks
# 6. Rollback if unhealthy
```

**Manual (Emergency):**

```bash
# 1. SSH to production server
ssh user@production-server

# 2. Navigate to app directory
cd /opt/myapp

# 3. Pull latest images
docker compose -f docker-compose.prod.yml pull

# 4. Restart services
docker compose -f docker-compose.prod.yml up -d

# 5. Monitor logs
docker compose -f docker-compose.prod.yml logs -f
```

---

## Summary

This template captures the complete architecture of a production-ready full-stack application:

**Key Strengths:**
- ✅ **Docker-first development** - Consistent environments
- ✅ **Automated CI/CD** - GitHub Actions with smart deployment
- ✅ **Comprehensive testing** - Unit + integration with 72% coverage
- ✅ **Security-first** - JWT, MFA, rate limiting, audit logs
- ✅ **Database migrations** - Version-controlled schema changes
- ✅ **3-layer architecture** - Clean separation of concerns
- ✅ **Production-ready** - HTTPS, health checks, rollback capability
- ✅ **Developer-friendly** - Makefile, hot reload, clear structure

**Use this template for:**
- Student management systems
- E-commerce platforms
- SaaS applications
- Internal business tools
- API-driven web applications

**Adapt by:**
1. Replacing "myapp" with your project name
2. Customizing database schema for your domain
3. Adding domain-specific services
4. Extending frontend with your pages
5. Adding integrations (payments, notifications, etc.)

**Remember:**
- Security is mandatory, not optional
- Test everything that matters
- Automate everything you can
- Document as you go
- Use environment variables for config
- Never commit secrets
- Monitor production
- Keep dependencies updated

---

**Generated from EduHub Student Management System**
**Template Version:** 1.0
**Last Updated:** 2026-07-26
