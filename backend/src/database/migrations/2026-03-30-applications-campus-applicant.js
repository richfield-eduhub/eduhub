/**
 * Public applications: allow applicants without a user account yet,
 * require campus choice, and store applicant contact details on the row.
 */

module.exports = {
  migration: {
    name: '2026-03-30-applications-campus-applicant',

    up: async (queryInterface, Sequelize) => {
      await queryInterface.sequelize.query(
        'ALTER TABLE applications ALTER COLUMN user_id DROP NOT NULL;'
      );

      await queryInterface.addColumn('applications', 'campus_id', {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'campuses', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      });

      await queryInterface.addColumn('applications', 'first_name', {
        type: Sequelize.STRING(100),
        allowNull: true,
      });
      await queryInterface.addColumn('applications', 'last_name', {
        type: Sequelize.STRING(100),
        allowNull: true,
      });
      await queryInterface.addColumn('applications', 'email', {
        type: Sequelize.STRING(255),
        allowNull: true,
      });
      await queryInterface.addColumn('applications', 'phone', {
        type: Sequelize.STRING(20),
        allowNull: true,
      });
      await queryInterface.addColumn('applications', 'id_number', {
        type: Sequelize.STRING(13),
        allowNull: true,
      });

      await queryInterface.addIndex('applications', ['campus_id'], {
        name: 'idx_applications_campus_id',
      });
      await queryInterface.addIndex('applications', ['email'], {
        name: 'idx_applications_email',
      });

      // Allow admissions: each active qualification is available at each active campus
      await queryInterface.sequelize.query(`
        INSERT INTO campus_qualifications (id, campus_id, qualification_id, is_active, created_at, updated_at)
        SELECT uuid_generate_v4(), c.id, q.id, true, NOW(), NOW()
        FROM campuses c
        CROSS JOIN qualifications q
        WHERE c.is_active = true AND q.is_active = true
        ON CONFLICT (campus_id, qualification_id) DO NOTHING;
      `);
    },

    down: async (queryInterface, Sequelize) => {
      await queryInterface.removeIndex('applications', 'idx_applications_email');
      await queryInterface.removeIndex('applications', 'idx_applications_campus_id');

      await queryInterface.removeColumn('applications', 'id_number');
      await queryInterface.removeColumn('applications', 'phone');
      await queryInterface.removeColumn('applications', 'email');
      await queryInterface.removeColumn('applications', 'last_name');
      await queryInterface.removeColumn('applications', 'first_name');
      await queryInterface.removeColumn('applications', 'campus_id');

      await queryInterface.sequelize.query(
        'DELETE FROM applications WHERE user_id IS NULL;'
      );
      await queryInterface.sequelize.query(
        'ALTER TABLE applications ALTER COLUMN user_id SET NOT NULL;'
      );
    },
  },
};
