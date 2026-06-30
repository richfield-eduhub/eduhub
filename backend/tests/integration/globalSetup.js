const path = require('path');
const fs = require('fs');

module.exports = async () => {
  require('./env');

  const flagPath = path.join(__dirname, '.db-ready');
  const sequelize = require('../../src/config/database');
  const { migrator } = require('../../src/db/migrator');

  const maxAttempts = 30;
  let connected = false;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await sequelize.authenticate();
      connected = true;
      break;
    } catch (error) {
      if (attempt === maxAttempts) {
        fs.writeFileSync(flagPath, '0');
        console.warn(
          `[integration] Test database unavailable after ${maxAttempts} attempts: ${error.message}`
        );
        console.warn('[integration] Start it with: docker compose -f docker-compose.test.yml up -d');
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  if (!connected) {
    fs.writeFileSync(flagPath, '0');
    return;
  }

  try {
    await migrator();
    fs.writeFileSync(flagPath, '1');
    console.log('[integration] Test database ready and migrations applied');
  } catch (error) {
    fs.writeFileSync(flagPath, '0');
    throw error;
  } finally {
    await sequelize.close();
  }
};
