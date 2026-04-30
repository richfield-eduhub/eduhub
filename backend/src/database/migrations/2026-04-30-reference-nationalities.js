/** @type {{ migration: { name: string, up: Function } }} */
module.exports = {
  migration: {
    name: '2026-04-30-reference-nationalities',

    up: async (queryInterface, Sequelize, transaction) => {
      console.log('🌍 Creating reference_nationalities table...');

      await queryInterface.createTable(
        'reference_nationalities',
        {
          id: {
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: Sequelize.literal('uuid_generate_v4()'),
          },
          name: {
            type: Sequelize.STRING(120),
            allowNull: false,
            unique: true,
          },
          sort_order: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
          },
          is_active: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true,
          },
          created_at: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('NOW()'),
          },
          updated_at: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('NOW()'),
          },
        },
        { transaction },
      );

      await queryInterface.addIndex('reference_nationalities', ['is_active'], {
        name: 'idx_reference_nationalities_is_active',
        transaction,
      });
      await queryInterface.addIndex('reference_nationalities', ['sort_order'], {
        name: 'idx_reference_nationalities_sort_order',
        transaction,
      });

      const names = [
        'South African',
        'Zimbabwean',
        'Mozambican',
        'Zambian',
        'Malawian',
        'Botswanan',
        'Namibian',
        'Swazi',
        'Lesothan',
        'Congolese (DRC)',
        'Nigerian',
        'Ghanaian',
        'Kenyan',
        'Tanzanian',
        'Ugandan',
        'Rwandan',
        'British',
        'American',
        'Canadian',
        'Australian',
        'German',
        'French',
        'Indian',
        'Pakistani',
        'Brazilian',
        'Other',
      ];

      await queryInterface.bulkInsert(
        'reference_nationalities',
        names.map((name, idx) => ({
          id: Sequelize.literal('uuid_generate_v4()'),
          name,
          sort_order: idx + 1,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        })),
        { transaction },
      );

      console.log(`✅ Seeded ${names.length} nationalities`);
    },
  },
};
