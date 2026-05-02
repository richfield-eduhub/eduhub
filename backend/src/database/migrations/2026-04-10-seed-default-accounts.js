const bcrypt = require('bcryptjs');

module.exports = {
  migration: {
    name: '2026-04-10-seed-default-accounts',

    up: async (queryInterface, Sequelize, transaction) => {
      console.log('👥 Creating default accounts...');
      const sequelize = queryInterface.sequelize;

      // Check table exists (lowercase)
      try {
        await sequelize.query(`SELECT 1 FROM users LIMIT 1`);
      } catch (e) {
        console.log('⚠️  users table not found — skipping default accounts');
        return;
      }

      // Hash the demo passwords shown on the Login page
      const adminHash    = await bcrypt.hash('admin123',   12);
      const lecturerHash = await bcrypt.hash('lec123',     12);
      const studentHash  = await bcrypt.hash('Password123!', 12);

      const adminId    = '20000001-0000-4000-8000-000000000001';
      const lecturerId = '20000002-0000-4000-8000-000000000002';
      const studentId  = '20000003-0000-4000-8000-000000000003';

      // ── Admin ──────────────────────────────────────────
      await sequelize.query(
        `INSERT INTO users (id, email, password_hash, role, account_status, is_verified, created_at, updated_at)
         VALUES (:id, :email, :pw, 'admin', 'active', true, NOW(), NOW())
         ON CONFLICT (id) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
        { replacements: { id: adminId, email: 'admin@eduhub.ac.za', pw: adminHash }, transaction }
      );
      await sequelize.query(
        `INSERT INTO user_details (user_id, first_name, last_name, date_of_birth, phone, created_at, updated_at)
         VALUES (:uid, 'System', 'Admin', '1990-01-01', '0800000000', NOW(), NOW())
         ON CONFLICT (user_id) DO NOTHING`,
        { replacements: { uid: adminId }, transaction }
      );

      // ── Lecturer (matches Login page demo: smokoena@eduhub.ac.za / lec123) ──
      await sequelize.query(
        `INSERT INTO users (id, email, password_hash, role, account_status, is_verified, created_at, updated_at)
         VALUES (:id, :email, :pw, 'lecturer', 'active', true, NOW(), NOW())
         ON CONFLICT (id) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
        { replacements: { id: lecturerId, email: 'smokoena@eduhub.ac.za', pw: lecturerHash }, transaction }
      );
      await sequelize.query(
        `INSERT INTO user_details (user_id, first_name, last_name, date_of_birth, phone, created_at, updated_at)
         VALUES (:uid, 'Sarah', 'Mokoena', '1985-07-12', '0112345678', NOW(), NOW())
         ON CONFLICT (user_id) DO NOTHING`,
        { replacements: { uid: lecturerId }, transaction }
      );

      // ── Demo Student ──────────────────────────────────
      await sequelize.query(
        `INSERT INTO users (id, email, password_hash, role, account_status, is_verified, created_at, updated_at)
         VALUES (:id, :email, :pw, 'student', 'active', true, NOW(), NOW())
         ON CONFLICT (id) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
        { replacements: { id: studentId, email: 'thabo.molefe@student.eduhub.ac.za', pw: studentHash }, transaction }
      );
      await sequelize.query(
        `INSERT INTO user_details (user_id, first_name, last_name, date_of_birth, phone, created_at, updated_at)
         VALUES (:uid, 'Thabo', 'Molefe', '2000-03-15', '0821234567', NOW(), NOW())
         ON CONFLICT (user_id) DO NOTHING`,
        { replacements: { uid: studentId }, transaction }
      );

      console.log('✅ Default accounts seeded:');
      console.log('   admin@eduhub.ac.za        / admin123');
      console.log('   smokoena@eduhub.ac.za      / lec123');
      console.log('   thabo.molefe@...           / Password123!');
    },

    down: async (queryInterface, Sequelize, transaction) => {
      await queryInterface.sequelize.query(
        `DELETE FROM users WHERE email IN ('admin@eduhub.ac.za','smokoena@eduhub.ac.za','thabo.molefe@student.eduhub.ac.za')`,
        { transaction }
      );
    },
  },
};
