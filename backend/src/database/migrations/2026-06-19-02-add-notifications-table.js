/**
 * Migration: Add notifications table for persistent in-app notifications
 * Date: 2026-06-19
 */

module.exports.migration = {
  name: '2026-06-19-02-add-notifications-table',

  async up(sequelize) {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
        is_read BOOLEAN DEFAULT false,
        read_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await sequelize.query(`
      CREATE INDEX idx_notifications_user_id ON notifications(user_id);
    `);

    await sequelize.query(`
      CREATE INDEX idx_notifications_is_read ON notifications(is_read);
    `);

    await sequelize.query(`
      CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
    `);

    console.log('✅ Notifications table created successfully');
  },

  async down(sequelize) {
    await sequelize.query(`DROP TABLE IF EXISTS notifications CASCADE;`);
    console.log('✅ Notifications table dropped');
  },
};
