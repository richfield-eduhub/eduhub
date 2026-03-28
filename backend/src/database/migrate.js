#!/usr/bin/env node
/**
 * Standalone migration runner
 *
 * This script runs database migrations without starting the Express server.
 * Useful for database-only deployments or when working on schema changes.
 *
 * Usage:
 *   node migrate.js
 *   npm run migrate
 *   make migrate
 */

require('dotenv').config();
const { migrator } = require('../db/migrator');

console.log('🔄 Starting database migrations...\n');

migrator()
  .then(() => {
    console.log('\n✅ All migrations completed successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Migration failed:', err.message);
    console.error(err);
    process.exit(1);
  });
