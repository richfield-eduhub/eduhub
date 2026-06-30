const fs = require('fs');
const path = require('path');

const FLAG_PATH = path.join(__dirname, '..', '.db-ready');

function isIntegrationDbReady() {
  try {
    return fs.readFileSync(FLAG_PATH, 'utf8').trim() === '1';
  } catch {
    return false;
  }
}

const describeIfDb = isIntegrationDbReady() ? describe : describe.skip;

module.exports = { isIntegrationDbReady, describeIfDb };
