const path = require('path');
const fs = require('fs');
const sequelize = require('../config/database');

const MIGRATIONS_TABLE = 'migrations';
const MIGRATIONS_DIR = path.join(__dirname, '../database/migrations');

async function migrator() {
  const queryInterface = sequelize.getQueryInterface();

  await queryInterface.createTable(
    MIGRATIONS_TABLE,
    {
      name: { type: 'VARCHAR(255)', primaryKey: true },
      runAt: { type: 'TIMESTAMP WITH TIME ZONE', defaultValue: sequelize.literal('NOW()') },
    },
    { ifNotExists: true }
  );

  const [ran] = await sequelize.query(`SELECT name FROM "${MIGRATIONS_TABLE}"`);
  const ranNames = new Set(ran.map((r) => r.name));

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.js'))
    .sort();

  for (const file of files) {
    const mod = require(path.join(MIGRATIONS_DIR, file));
    const migration = mod.migration || mod;

    if (!migration || !migration.name) continue;
    if (ranNames.has(migration.name)) continue;

    const t = await sequelize.transaction();
    try {
      console.log(`[migrator] running: ${migration.name}`);
      await migration.up(queryInterface, sequelize.constructor, t);
      await sequelize.query(`INSERT INTO "${MIGRATIONS_TABLE}" (name) VALUES (:name)`, {
        replacements: { name: migration.name },
        transaction: t,
      });
      await t.commit();
      console.log(`[migrator] done:    ${migration.name}`);
    } catch (err) {
      await t.rollback();
      throw new Error(`Migration failed [${migration.name}]: ${err.message}`);
    }
  }
}

module.exports = { migrator };