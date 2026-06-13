/**
 * Adds a permanent student number to applications.
 */
module.exports = {
  migration: {
    name: '2026-05-03-applications-student-number',

    up: async (queryInterface, Sequelize, transaction) => {
      await queryInterface.addColumn(
        'applications',
        'student_number',
        {
          type: Sequelize.STRING(10),
          allowNull: true,
          unique: true,
        },
        { transaction }
      );

      await queryInterface.addIndex('applications', ['student_number'], {
        name: 'idx_applications_student_number',
        unique: true,
        transaction,
      });
    },

    down: async (queryInterface, _Sequelize, transaction) => {
      await queryInterface.removeIndex('applications', 'idx_applications_student_number', { transaction });
      await queryInterface.removeColumn('applications', 'student_number', { transaction });
    },
  },
};
