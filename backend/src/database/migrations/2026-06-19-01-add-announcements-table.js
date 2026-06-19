/**
 * Migration: Add announcements table
 * Date: 2026-06-19
 */

module.exports.migration = {
  name: '2026-06-19-01-add-announcements-table',

  async up(sequelize) {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
        created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await sequelize.query(`
      CREATE INDEX idx_announcements_module_id ON announcements(module_id);
    `);

    await sequelize.query(`
      CREATE INDEX idx_announcements_created_by ON announcements(created_by);
    `);

    await sequelize.query(`
      CREATE INDEX idx_announcements_priority ON announcements(priority);
    `);

    await sequelize.query(`
      CREATE INDEX idx_announcements_created_at ON announcements(created_at DESC);
    `);

    console.log('✅ Announcements table created successfully');
  },

  async down(sequelize) {
    await sequelize.query(`DROP TABLE IF EXISTS announcements CASCADE;`);
    console.log('✅ Announcements table dropped');
  },
};
