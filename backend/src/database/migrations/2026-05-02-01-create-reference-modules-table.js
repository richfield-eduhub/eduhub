/**
 * Creates the reference_modules table
 */
module.exports = {
  migration: {
    name: '2026-05-02-create-reference-modules-table',

    up: async (queryInterface, Sequelize, transaction) => {
      console.log('📚 Creating reference_modules table...');

      await queryInterface.createTable(
        'reference_modules',
        {
          id: {
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: Sequelize.literal('uuid_generate_v4()'),
          },
          qualification_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
              model: 'reference_qualifications',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          code: {
            type: Sequelize.STRING(40),
            allowNull: false,
          },
          name: {
            type: Sequelize.STRING(255),
            allowNull: false,
          },
          description: {
            type: Sequelize.TEXT,
            allowNull: true,
          },
          nqf_level: {
            type: Sequelize.INTEGER,
            allowNull: false,
          },
          credits: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
          },
          year_level: {
            type: Sequelize.INTEGER,
            allowNull: false,
            comment: 'Academic year (1, 2, 3, etc.)',
          },
          semester: {
            type: Sequelize.INTEGER,
            allowNull: false,
            comment: 'Semester (1 or 2)',
          },
          is_core: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            comment: 'True for core/compulsory modules, false for electives',
          },
          prerequisites: {
            type: Sequelize.JSONB,
            allowNull: true,
            comment: 'Array of prerequisite module codes',
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
        { transaction }
      );

      // Add indexes for performance
      await queryInterface.addIndex('reference_modules', ['qualification_id'], {
        name: 'idx_reference_modules_qualification_id',
        transaction,
      });

      await queryInterface.addIndex('reference_modules', ['code'], {
        name: 'idx_reference_modules_code',
        transaction,
      });

      await queryInterface.addIndex('reference_modules', ['year_level', 'semester'], {
        name: 'idx_reference_modules_year_semester',
        transaction,
      });

      await queryInterface.addIndex('reference_modules', ['is_active'], {
        name: 'idx_reference_modules_is_active',
        transaction,
      });

      // Add unique constraint for code per qualification
      await queryInterface.addConstraint('reference_modules', {
        fields: ['qualification_id', 'code'],
        type: 'unique',
        name: 'uq_reference_modules_qualification_code',
        transaction,
      });

      console.log('✅ reference_modules table created successfully!');
    },

    down: async (queryInterface, _Sequelize, transaction) => {
      console.log('🗑️  Dropping reference_modules table...');
      await queryInterface.dropTable('reference_modules', { transaction });
      console.log('✅ reference_modules table dropped successfully!');
    },
  },
};
