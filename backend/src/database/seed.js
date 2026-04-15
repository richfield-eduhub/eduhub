/**
 * SEED RUNNER - FOR DEV/TEST ENVIRONMENTS ONLY
 *
 * This script runs seed files from the seeds/ directory.
 * Seeds should NEVER be run in production - only migrations should modify prod data.
 *
 * Usage:
 *   npm run seed
 *   make seed
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const sequelize = require('../config/database');

// ════════════════════════════════════════════════════════════════
// PRODUCTION SAFETY CHECK
// ════════════════════════════════════════════════════════════════

if (process.env.NODE_ENV === 'production') {
  console.error('');
  console.error('❌ BLOCKED: Cannot run seeds in production!');
  console.error('');
  console.error('   Seeds are for development and test environments only.');
  console.error('   In production, use migrations to modify the database.');
  console.error('');
  console.error('   To modify production data:');
  console.error('     1. Create a migration file in backend/src/database/migrations/');
  console.error('     2. Run: npm run migrate');
  console.error('');
  process.exit(1);
}

// ════════════════════════════════════════════════════════════════
// SEED RUNNER
// ════════════════════════════════════════════════════════════════

async function runSeeds() {
  console.log('🌱 Starting seed runner...');
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('');

  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    console.log('');

    // Get all seed files
    const seedsDir = path.join(__dirname, 'seeds');
    const seedFiles = fs
      .readdirSync(seedsDir)
      .filter((file) => file.endsWith('.js'))
      .sort(); // Run seeds alphabetically

    if (seedFiles.length === 0) {
      console.log('⚠️  No seed files found in backend/src/database/seeds/');
      console.log('');
      process.exit(0);
    }

    console.log(`📁 Found ${seedFiles.length} seed file(s):`);
    seedFiles.forEach((file) => console.log(`   - ${file}`));
    console.log('');

    // Run each seed file
    for (const file of seedFiles) {
      const seedPath = path.join(seedsDir, file);
      console.log(`▶️  Running seed: ${file}`);

      try {
        const seedModule = require(seedPath);

        if (typeof seedModule.run !== 'function') {
          throw new Error(`Seed file ${file} must export a 'run' function`);
        }

        await seedModule.run();
        console.log('');
      } catch (error) {
        console.error(`❌ Seed failed: ${file}`);
        console.error(error);
        throw error;
      }
    }

    console.log('');
    console.log('🎉 All seeds completed successfully!');
    console.log('');
    console.log('💡 Next steps:');
    console.log('   - Start the backend: cd backend && npm start');
<<<<<<< HEAD
    console.log('   - Test login with: admin@richfield.ac.za / Password123!');
=======
    console.log('   - Test login with: admin@eduhub.ac.za / Password123!');
>>>>>>> 531c062 (popi's changes)
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('❌ Seed runner failed:');
    console.error(error);
    console.error('');
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run seeds
runSeeds();
