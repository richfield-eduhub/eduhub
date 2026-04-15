/**
 * Applications: align with admissions form / student capture — address, identity,
 * demographics, denormalized qualification labels, docs snapshot, study year.
 * Adds application_type value "other"; relaxes id_number for passport holders.
 */

module.exports = {
  migration: {
    name: '2026-03-31-applications-extended-fields',

    up: async (queryInterface, Sequelize, transaction) => {
      await queryInterface.sequelize.query(
        `
        DO $$ BEGIN
          ALTER TYPE "enum_applications_application_type" ADD VALUE 'other';
        EXCEPTION
          WHEN duplicate_object THEN NULL;
        END $$;
        `,
        { transaction }
      );

      await queryInterface.changeColumn(
        'applications',
        'id_number',
        {
          type: Sequelize.STRING(13),
          allowNull: true,
        },
        { transaction }
      );

      await queryInterface.addColumn(
        'applications',
        'nationality',
        {
          type: Sequelize.STRING(50),
          allowNull: false,
          defaultValue: 'South African',
        },
        { transaction }
      );

      await queryInterface.addColumn(
        'applications',
        'passport_number',
        {
          type: Sequelize.STRING(20),
          allowNull: true,
        },
        { transaction }
      );

      await queryInterface.addColumn(
        'applications',
        'date_of_birth',
        {
          type: Sequelize.DATEONLY,
          allowNull: true,
        },
        { transaction }
      );

      await queryInterface.addColumn(
        'applications',
        'gender',
        {
          type: Sequelize.STRING(20),
          allowNull: true,
        },
        { transaction }
      );

      await queryInterface.addColumn(
        'applications',
        'alt_email',
        {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        { transaction }
      );

      await queryInterface.addColumn(
        'applications',
        'street_address',
        {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        { transaction }
      );

      await queryInterface.addColumn(
        'applications',
        'suburb',
        {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        { transaction }
      );

      await queryInterface.addColumn(
        'applications',
        'city',
        {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        { transaction }
      );

      await queryInterface.addColumn(
        'applications',
        'province',
        {
          type: Sequelize.STRING(50),
          allowNull: true,
        },
        { transaction }
      );

      await queryInterface.addColumn(
        'applications',
        'postal_code',
        {
          type: Sequelize.STRING(10),
          allowNull: true,
        },
        { transaction }
      );

      await queryInterface.addColumn(
        'applications',
        'study_year',
        {
          type: Sequelize.SMALLINT,
          allowNull: true,
          defaultValue: 1,
        },
        { transaction }
      );

      await queryInterface.addColumn(
        'applications',
        'qualification_code',
        {
          type: Sequelize.STRING(20),
          allowNull: true,
        },
        { transaction }
      );

      await queryInterface.addColumn(
        'applications',
        'qualification_name',
        {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        { transaction }
      );

      await queryInterface.addColumn(
        'applications',
        'docs_uploaded',
        {
          type: Sequelize.JSONB,
          allowNull: true,
        },
        { transaction }
      );

      await queryInterface.sequelize.query(
        `CREATE UNIQUE INDEX IF NOT EXISTS idx_applications_passport_number
         ON applications (passport_number)
         WHERE passport_number IS NOT NULL;`,
        { transaction }
      );
    },

    down: async (queryInterface, Sequelize, transaction) => {
      await queryInterface.sequelize.query(
        `DROP INDEX IF EXISTS idx_applications_passport_number;`,
        { transaction }
      );

      await queryInterface.removeColumn('applications', 'docs_uploaded', { transaction });
      await queryInterface.removeColumn('applications', 'qualification_name', { transaction });
      await queryInterface.removeColumn('applications', 'qualification_code', { transaction });
      await queryInterface.removeColumn('applications', 'study_year', { transaction });
      await queryInterface.removeColumn('applications', 'postal_code', { transaction });
      await queryInterface.removeColumn('applications', 'province', { transaction });
      await queryInterface.removeColumn('applications', 'city', { transaction });
      await queryInterface.removeColumn('applications', 'suburb', { transaction });
      await queryInterface.removeColumn('applications', 'street_address', { transaction });
      await queryInterface.removeColumn('applications', 'alt_email', { transaction });
      await queryInterface.removeColumn('applications', 'gender', { transaction });
      await queryInterface.removeColumn('applications', 'date_of_birth', { transaction });
      await queryInterface.removeColumn('applications', 'passport_number', { transaction });
      await queryInterface.removeColumn('applications', 'nationality', { transaction });
    },
  },
};
