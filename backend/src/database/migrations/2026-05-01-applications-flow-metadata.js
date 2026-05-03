/**
 * Adds draft-flow metadata fields used by admissions workflow.
 */
module.exports = {
  migration: {
    name: '2026-05-01-applications-flow-metadata',

    up: async (queryInterface, Sequelize, transaction) => {
      await queryInterface.addColumn(
        'applications',
        'additional_qualifications',
        {
          type: Sequelize.JSONB,
          allowNull: true,
        },
        { transaction }
      );

      await queryInterface.addColumn(
        'applications',
        'payer_type',
        {
          type: Sequelize.STRING(30),
          allowNull: false,
          defaultValue: 'self',
        },
        { transaction }
      );

      await queryInterface.addColumn(
        'applications',
        'popia_accepted',
        {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        { transaction }
      );

      await queryInterface.addColumn(
        'applications',
        'popia_accepted_at',
        {
          type: Sequelize.DATE,
          allowNull: true,
        },
        { transaction }
      );

      await queryInterface.addColumn(
        'applications',
        'tc_version',
        {
          type: Sequelize.STRING(30),
          allowNull: true,
        },
        { transaction }
      );

      await queryInterface.addColumn(
        'applications',
        'popia_version',
        {
          type: Sequelize.STRING(30),
          allowNull: true,
        },
        { transaction }
      );

      await queryInterface.addColumn(
        'applications',
        'related_party_match_status',
        {
          type: Sequelize.STRING(30),
          allowNull: true,
        },
        { transaction }
      );

      await queryInterface.addColumn(
        'applications',
        'related_party_id',
        {
          type: Sequelize.UUID,
          allowNull: true,
        },
        { transaction }
      );

      await queryInterface.addColumn(
        'applications',
        'mark_entries',
        {
          type: Sequelize.JSONB,
          allowNull: true,
        },
        { transaction }
      );

      await queryInterface.addColumn(
        'applications',
        'aps_result',
        {
          type: Sequelize.JSONB,
          allowNull: true,
        },
        { transaction }
      );
    },

    down: async (queryInterface, _Sequelize, transaction) => {
      await queryInterface.removeColumn('applications', 'aps_result', { transaction });
      await queryInterface.removeColumn('applications', 'mark_entries', { transaction });
      await queryInterface.removeColumn('applications', 'related_party_id', { transaction });
      await queryInterface.removeColumn('applications', 'related_party_match_status', { transaction });
      await queryInterface.removeColumn('applications', 'popia_version', { transaction });
      await queryInterface.removeColumn('applications', 'tc_version', { transaction });
      await queryInterface.removeColumn('applications', 'popia_accepted_at', { transaction });
      await queryInterface.removeColumn('applications', 'popia_accepted', { transaction });
      await queryInterface.removeColumn('applications', 'payer_type', { transaction });
      await queryInterface.removeColumn('applications', 'additional_qualifications', { transaction });
    },
  },
};
