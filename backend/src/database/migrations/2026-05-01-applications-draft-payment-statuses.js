/**
 * Extend applications status lifecycle for draft + payment flow.
 */
module.exports = {
  migration: {
    name: '2026-05-01-applications-draft-payment-statuses',

    up: async (queryInterface, Sequelize, transaction) => {
      await queryInterface.sequelize.query(
        `
        DO $$ BEGIN
          ALTER TYPE "enum_applications_status" ADD VALUE 'payment_pending';
        EXCEPTION
          WHEN duplicate_object THEN NULL;
        END $$;
        `,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `
        DO $$ BEGIN
          ALTER TYPE "enum_applications_status" ADD VALUE 'applied';
        EXCEPTION
          WHEN duplicate_object THEN NULL;
        END $$;
        `,
        { transaction }
      );
    },

    down: async () => {
      // Postgres enum values are not trivially removable in down migrations.
    },
  },
};
