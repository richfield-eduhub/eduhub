/**
 * Migration: Add Campuses System
<<<<<<< HEAD
 * - Creates campuses table with Richfield campus data
=======
 * - Creates campuses table with EduHub campus data
>>>>>>> 531c062 (popi's changes)
 * - Creates campus_qualifications junction table (many-to-many)
 * - Adds campus_id to students and lecturers tables
 */

const crypto = require('crypto');

module.exports = {
  migration: {
    name: '2026-03-29-add-campuses',

    up: async (queryInterface, Sequelize, transaction) => {
    // Create campuses table
    await queryInterface.createTable('campuses', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
      },
      code: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      province: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      whatsapp: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      is_online: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Add indexes to campuses table
    await queryInterface.addIndex('campuses', ['code'], {
      name: 'idx_campuses_code',
    });
    await queryInterface.addIndex('campuses', ['is_active'], {
      name: 'idx_campuses_is_active',
    });
    await queryInterface.addIndex('campuses', ['province'], {
      name: 'idx_campuses_province',
    });

    // Create campus_qualifications junction table
    await queryInterface.createTable('campus_qualifications', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
      },
      campus_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'campuses',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      qualification_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'qualifications',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Add unique constraint for campus-qualification pair
    await queryInterface.addConstraint('campus_qualifications', {
      fields: ['campus_id', 'qualification_id'],
      type: 'unique',
      name: 'campus_qualifications_unique',
    });

    // Add indexes to campus_qualifications
    await queryInterface.addIndex('campus_qualifications', ['campus_id'], {
      name: 'idx_campus_qualifications_campus_id',
    });
    await queryInterface.addIndex('campus_qualifications', ['qualification_id'], {
      name: 'idx_campus_qualifications_qualification_id',
    });

    // Add campus_id to students table
    await queryInterface.addColumn('students', 'campus_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'campuses',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addIndex('students', ['campus_id'], {
      name: 'idx_students_campus_id',
    });

    // Add campus_id to lecturers table
    await queryInterface.addColumn('lecturers', 'campus_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'campuses',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addIndex('lecturers', ['campus_id'], {
      name: 'idx_lecturers_campus_id',
    });

<<<<<<< HEAD
    // Seed Richfield campuses data with proper UUIDs
=======
    // Seed EduHub campuses data with proper UUIDs
>>>>>>> 531c062 (popi's changes)
    const campuses = [
      {
        id: crypto.randomUUID(),
        code: 'BRYANSTON',
        name: 'Bryanston Campus',
        city: 'Sandton',
        province: 'Gauteng',
        address: 'In the heart of Sandton\'s tech corridor',
        phone: '011 029 8371',
        whatsapp: '082 888 8675',
<<<<<<< HEAD
        email: 'richfieldbryanston@richfield.ac.za',
=======
        email: 'eduhubbryanston@eduhub.ac.za',
>>>>>>> 531c062 (popi's changes)
        is_online: false,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: crypto.randomUUID(),
        code: 'CENTURION',
        name: 'Centurion Campus',
        city: 'Centurion',
        province: 'Gauteng',
        address: 'From Gautrain links to rooftop views',
        phone: '012 745 8113',
        whatsapp: '072 084 4664',
<<<<<<< HEAD
        email: 'centurion@richfield.ac.za',
=======
        email: 'centurion@eduhub.ac.za',
>>>>>>> 531c062 (popi's changes)
        is_online: false,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: crypto.randomUUID(),
        code: 'NEWTOWN',
        name: 'Newtown Junction Campus',
        city: 'Johannesburg',
        province: 'Gauteng',
        address: 'Study in the heart of Newtown surrounded by history, creativity, and career possibilities',
        phone: '011 595 4300',
        whatsapp: '066 257 2755',
<<<<<<< HEAD
        email: 'newtown@richfield.ac.za',
=======
        email: 'newtown@eduhub.ac.za',
>>>>>>> 531c062 (popi's changes)
        is_online: false,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: crypto.randomUUID(),
        code: 'PRETORIA',
        name: 'Pretoria Campus',
        city: 'Pretoria',
        province: 'Gauteng',
        address: 'Opposite Sammy Marks Square',
        phone: '012 765 1700',
        whatsapp: '083 648 5563',
<<<<<<< HEAD
        email: 'pretoria@richfield.ac.za',
=======
        email: 'pretoria@eduhub.ac.za',
>>>>>>> 531c062 (popi's changes)
        is_online: false,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: crypto.randomUUID(),
        code: 'POLOKWANE',
        name: 'Polokwane New Premium Campus',
        city: 'Polokwane',
        province: 'Limpopo',
        address: 'Library Gardens - state-of-the-art learning with the energy of a city centre',
        phone: '015 817 2600',
        whatsapp: '066 257 2749',
<<<<<<< HEAD
        email: 'richfieldpolokwane@richfield.ac.za',
=======
        email: 'eduhubpolokwane@eduhub.ac.za',
>>>>>>> 531c062 (popi's changes)
        is_online: false,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: crypto.randomUUID(),
        code: 'CAPETOWN',
        name: 'Cape Town Campus',
        city: 'Cape Town',
        province: 'Western Cape',
        address: 'Navigating your future in a supportive, modern campus experience',
        phone: '021 831 0701',
        whatsapp: '066 240 8728',
<<<<<<< HEAD
        email: 'capetown@richfield.ac.za',
=======
        email: 'capetown@eduhub.ac.za',
>>>>>>> 531c062 (popi's changes)
        is_online: false,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: crypto.randomUUID(),
        code: 'MUSGRAVE',
        name: 'Musgrave Campus',
        city: 'Durban',
        province: 'KwaZulu-Natal',
        address: 'Focused learning with easy access to shopping, dining, and green spaces',
        phone: '031 831 2200',
        whatsapp: '081 344 0634',
<<<<<<< HEAD
        email: 'Musgrave@richfield.ac.za',
=======
        email: 'Musgrave@eduhub.ac.za',
>>>>>>> 531c062 (popi's changes)
        is_online: false,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: crypto.randomUUID(),
        code: 'UMHLANGA',
        name: 'Umhlanga Campus',
        city: 'Umhlanga',
        province: 'KwaZulu-Natal',
        address: 'Located in Park Square, this modern campus combines convenience, community, and career-focused energy',
        phone: '031 834 7500',
        whatsapp: '081 344 0634',
<<<<<<< HEAD
        email: 'umhlanga@richfield.ac.za',
=======
        email: 'umhlanga@eduhub.ac.za',
>>>>>>> 531c062 (popi's changes)
        is_online: false,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: crypto.randomUUID(),
        code: 'ONLINE',
        name: 'Online Learning',
        city: 'Online',
        province: 'National',
        address: null,
        phone: '0861 321 321',
        whatsapp: '082 332 1321',
<<<<<<< HEAD
        email: 'admissions@richfield.ac.za',
=======
        email: 'admissions@eduhub.ac.za',
>>>>>>> 531c062 (popi's changes)
        is_online: true,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    await queryInterface.bulkInsert('campuses', campuses);

<<<<<<< HEAD
    console.log(`✅ Inserted ${campuses.length} Richfield campuses`);
=======
    console.log(`✅ Inserted ${campuses.length} EduHub campuses`);
>>>>>>> 531c062 (popi's changes)
    console.log('✅ Campus system setup complete');
    },

    down: async (queryInterface, Sequelize, transaction) => {
      // Remove campus_id from lecturers
      await queryInterface.removeIndex('lecturers', 'idx_lecturers_campus_id');
      await queryInterface.removeColumn('lecturers', 'campus_id');

      // Remove campus_id from students
      await queryInterface.removeIndex('students', 'idx_students_campus_id');
      await queryInterface.removeColumn('students', 'campus_id');

      // Drop campus_qualifications junction table
      await queryInterface.dropTable('campus_qualifications');

      // Drop campuses table
      await queryInterface.dropTable('campuses');
    },
  },
};
