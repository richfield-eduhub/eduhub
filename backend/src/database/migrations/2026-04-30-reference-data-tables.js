/** @type {{ migration: { name: string, up: Function } }} */
module.exports = {
  migration: {
    name: '2026-04-30-reference-data-tables',

    up: async (queryInterface, Sequelize, transaction) => {
      console.log('📚 Creating reference data tables...');

      // ===== QUALIFICATION TYPES =====
      console.log('  → Creating reference_qualification_types table...');
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
      await queryInterface.addIndex('reference_qualification_types', ['is_active'], {
        name: 'idx_reference_qualification_types_is_active',
        transaction,
      });

      // ===== FACULTIES =====
      console.log('  → Creating reference_faculties table...');
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
      await queryInterface.addIndex('reference_faculties', ['is_active'], {
        name: 'idx_reference_faculties_is_active',
        transaction,
      });

      // ===== STUDY MODES =====
      console.log('  → Creating reference_study_modes table...');
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
      await queryInterface.addIndex('reference_study_modes', ['is_active'], {
        name: 'idx_reference_study_modes_is_active',
        transaction,
      });

      // ===== REFERENCE CAMPUSES =====
      console.log('  → Creating reference_campuses table...');
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
      await queryInterface.addIndex('reference_campuses', ['is_active'], {
        name: 'idx_reference_campuses_is_active',
        transaction,
      });
      await queryInterface.addIndex('reference_campuses', ['province'], {
        name: 'idx_reference_campuses_province',
        transaction,
      });

      // ===== QUALIFICATIONS =====
      console.log('  → Creating reference_qualifications table...');
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
      await queryInterface.addIndex('reference_qualifications', ['faculty_code'], {
        name: 'idx_reference_qualifications_faculty_code',
        transaction,
      });
      await queryInterface.addIndex('reference_qualifications', ['qualification_type_code'], {
        name: 'idx_reference_qualifications_qualification_type_code',
        transaction,
      });
      await queryInterface.addIndex('reference_qualifications', ['is_active'], {
        name: 'idx_reference_qualifications_is_active',
        transaction,
      });

      // ===== SPECIALIZATIONS =====
      console.log('  → Creating reference_specializations table...');
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
      await queryInterface.addIndex('reference_specializations', ['faculty_code'], {
        name: 'idx_reference_specializations_faculty_code',
        transaction,
      });
      await queryInterface.addIndex('reference_specializations', ['is_active'], {
        name: 'idx_reference_specializations_is_active',
        transaction,
      });

      // ===== DOCUMENT REQUIREMENTS =====
      console.log('  → Creating reference_document_requirements table...');
      await queryInterface.createTable(
        'reference_document_requirements',
        {
          id: {
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: Sequelize.literal('uuid_generate_v4()'),
          },
          document_name: {
            type: Sequelize.STRING(200),
            allowNull: false,
          },
          applicant_type: {
            type: Sequelize.ENUM('sa_national', 'foreign_national', 'all'),
            allowNull: false,
            defaultValue: 'all',
          },
          sort_order: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
          },
          is_required: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true,
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

      await queryInterface.addIndex('reference_document_requirements', ['is_active', 'applicant_type'], {
        name: 'idx_reference_doc_requirements_active_type',
        transaction,
      });

      const documentRequirements = [
        // SA National documents
        { name: 'Certified copy of SA ID document', type: 'sa_national', order: 1 },
        { name: 'Certified copy of Matric certificate', type: 'sa_national', order: 2 },
        { name: 'Certified copy of tertiary qualifications', type: 'sa_national', order: 3 },
        { name: 'Proof of payment / funding letter', type: 'sa_national', order: 4 },
        { name: 'Passport photo', type: 'sa_national', order: 5 },
        // Foreign National documents
        { name: 'Certified copy of Passport (all pages)', type: 'foreign_national', order: 1 },
        { name: 'Study permit / visa', type: 'foreign_national', order: 2 },
        { name: 'Certified copy of highest qualification', type: 'foreign_national', order: 3 },
        { name: 'Proof of payment / funding letter', type: 'foreign_national', order: 4 },
        { name: 'Passport photo', type: 'foreign_national', order: 5 },
        { name: 'SAQA evaluation letter', type: 'foreign_national', order: 6 },
      ];
      await queryInterface.bulkInsert(
        'reference_document_requirements',
        documentRequirements.map((doc) => ({
          id: Sequelize.literal('uuid_generate_v4()'),
          document_name: doc.name,
          applicant_type: doc.type,
          sort_order: doc.order,
          is_required: true,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        })),
        { transaction },
      );
      console.log(`  ✅ Seeded ${documentRequirements.length} document requirements`);

      console.log('✅ Reference tables created and document requirements seeded successfully!');
    },
  },
};
