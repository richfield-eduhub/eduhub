/** @type {{ migration: { name: string, up: Function } }} */
module.exports = {
  migration: {
    name: '2026-04-30-reference-core-recovery',

    up: async (queryInterface, Sequelize, transaction) => {
      console.log('🛠️  Ensuring core reference tables exist...');

      const tableExists = async (tableName) => {
        const [rows] = await queryInterface.sequelize.query(
          "SELECT to_regclass(:tableName) AS exists_name",
          { replacements: { tableName }, transaction },
        );
        return Boolean(rows?.[0]?.exists_name);
      };

      if (!(await tableExists('reference_qualification_types'))) {
        await queryInterface.createTable(
          'reference_qualification_types',
          {
            id: {
              type: Sequelize.UUID,
              primaryKey: true,
              defaultValue: Sequelize.literal('uuid_generate_v4()'),
            },
            code: {
              type: Sequelize.STRING(30),
              allowNull: false,
              unique: true,
            },
            name: {
              type: Sequelize.STRING(200),
              allowNull: false,
            },
            nqf_level: {
              type: Sequelize.INTEGER,
              allowNull: false,
            },
            minimum_credits: {
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
      }

      if (!(await tableExists('reference_faculties'))) {
        await queryInterface.createTable(
          'reference_faculties',
          {
            id: {
              type: Sequelize.UUID,
              primaryKey: true,
              defaultValue: Sequelize.literal('uuid_generate_v4()'),
            },
            code: {
              type: Sequelize.STRING(20),
              allowNull: false,
              unique: true,
            },
            name: {
              type: Sequelize.STRING(255),
              allowNull: false,
            },
            abbreviation: {
              type: Sequelize.STRING(30),
              allowNull: true,
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
      }

      if (!(await tableExists('reference_study_modes'))) {
        await queryInterface.createTable(
          'reference_study_modes',
          {
            id: {
              type: Sequelize.UUID,
              primaryKey: true,
              defaultValue: Sequelize.literal('uuid_generate_v4()'),
            },
            code: {
              type: Sequelize.STRING(30),
              allowNull: false,
              unique: true,
            },
            name: {
              type: Sequelize.STRING(120),
              allowNull: false,
            },
            description: {
              type: Sequelize.STRING(255),
              allowNull: true,
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
      }

      if (!(await tableExists('reference_campuses'))) {
        await queryInterface.createTable(
          'reference_campuses',
          {
            id: {
              type: Sequelize.UUID,
              primaryKey: true,
              defaultValue: Sequelize.literal('uuid_generate_v4()'),
            },
            code: {
              type: Sequelize.STRING(30),
              allowNull: false,
              unique: true,
            },
            name: {
              type: Sequelize.STRING(120),
              allowNull: false,
            },
            city: {
              type: Sequelize.STRING(100),
              allowNull: true,
            },
            province: {
              type: Sequelize.STRING(100),
              allowNull: true,
            },
            address: {
              type: Sequelize.TEXT,
              allowNull: true,
            },
            phone: {
              type: Sequelize.STRING(30),
              allowNull: true,
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
      }

      if (!(await tableExists('reference_qualifications'))) {
        await queryInterface.createTable(
          'reference_qualifications',
          {
            id: {
              type: Sequelize.UUID,
              primaryKey: true,
              defaultValue: Sequelize.literal('uuid_generate_v4()'),
            },
            saqa_id: {
              type: Sequelize.STRING(20),
              allowNull: true,
            },
            code: {
              type: Sequelize.STRING(40),
              allowNull: false,
              unique: true,
            },
            name: {
              type: Sequelize.STRING(255),
              allowNull: false,
            },
            abbreviation: {
              type: Sequelize.STRING(80),
              allowNull: true,
            },
            faculty_code: {
              type: Sequelize.STRING(20),
              allowNull: false,
              references: {
                model: 'reference_faculties',
                key: 'code',
              },
              onUpdate: 'CASCADE',
              onDelete: 'RESTRICT',
            },
            qualification_type_code: {
              type: Sequelize.STRING(30),
              allowNull: false,
              references: {
                model: 'reference_qualification_types',
                key: 'code',
              },
              onUpdate: 'CASCADE',
              onDelete: 'RESTRICT',
            },
            nqf_level: {
              type: Sequelize.INTEGER,
              allowNull: false,
            },
            total_credits: {
              type: Sequelize.INTEGER,
              allowNull: false,
              defaultValue: 0,
            },
            duration_years: {
              type: Sequelize.INTEGER,
              allowNull: false,
              defaultValue: 1,
            },
            study_modes: {
              type: Sequelize.STRING(255),
              allowNull: true,
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
      }

      if (!(await tableExists('reference_specializations'))) {
        await queryInterface.createTable(
          'reference_specializations',
          {
            id: {
              type: Sequelize.UUID,
              primaryKey: true,
              defaultValue: Sequelize.literal('uuid_generate_v4()'),
            },
            code: {
              type: Sequelize.STRING(40),
              allowNull: false,
              unique: true,
            },
            name: {
              type: Sequelize.STRING(150),
              allowNull: false,
            },
            faculty_code: {
              type: Sequelize.STRING(20),
              allowNull: false,
              references: {
                model: 'reference_faculties',
                key: 'code',
              },
              onUpdate: 'CASCADE',
              onDelete: 'RESTRICT',
            },
            description: {
              type: Sequelize.TEXT,
              allowNull: true,
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
      }

      console.log('✅ Core reference tables are ready');
    },
  },
};
