/**
 * Make applications.user_id nullable so public (unauthenticated)
 * applications can be submitted without an existing user account.
 */
module.exports = {
  migration: {
    name: '2026-04-12-applications-nullable-user',

    up: async (queryInterface, Sequelize, transaction) => {
      try {
        // Drop FK constraint first if it exists
        await queryInterface.sequelize.query(
          `ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_user_id_fkey`,
          { transaction }
        );
        await queryInterface.changeColumn(
          'applications', 'user_id',
          { type: Sequelize.UUID, allowNull: true },
          { transaction }
        );
        console.log('✅ applications.user_id is now nullable');
      } catch (e) {
        console.warn('applications.user_id constraint update:', e.message);
      }
    },

    down: async (queryInterface, Sequelize, transaction) => {
      await queryInterface.changeColumn(
        'applications', 'user_id',
        { type: Sequelize.UUID, allowNull: false },
        { transaction }
      );
    },
  },
};
