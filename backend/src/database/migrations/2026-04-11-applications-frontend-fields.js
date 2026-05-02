/**
 * Add remaining fields needed by the frontend application form.
 */
module.exports = {
  migration: {
    name: '2026-04-11-applications-frontend-fields',
    up: async (queryInterface, Sequelize) => {
      const tableDesc = await queryInterface.describeTable('applications');

      const addIfMissing = async (col, def) => {
        if (!tableDesc[col]) {
          await queryInterface.addColumn('applications', col, def);
        }
      };

      await addIfMissing('student_id',      { type: Sequelize.STRING(50),  allowNull: true });
      await addIfMissing('high_school',     { type: Sequelize.STRING(255), allowNull: true });
      await addIfMissing('high_school_year',{ type: Sequelize.INTEGER,     allowNull: true });
      await addIfMissing('highest_grade',   { type: Sequelize.STRING(50),  allowNull: true });
      await addIfMissing('payer_name',      { type: Sequelize.STRING(255), allowNull: true });
      await addIfMissing('payer_phone',     { type: Sequelize.STRING(30),  allowNull: true });
      await addIfMissing('payer_email',     { type: Sequelize.STRING(255), allowNull: true });
      await addIfMissing('payer_relation',  { type: Sequelize.STRING(50),  allowNull: true });
      await addIfMissing('payer_address',   { type: Sequelize.TEXT,        allowNull: true });

      console.log('✅ applications: frontend fields added');
    },
    down: async (queryInterface) => {
      for (const col of ['student_id','high_school','high_school_year','highest_grade',
                         'payer_name','payer_phone','payer_email','payer_relation','payer_address']) {
        try { await queryInterface.removeColumn('applications', col); } catch {}
      }
    },
  },
};
