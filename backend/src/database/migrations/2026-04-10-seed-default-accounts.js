/**
 * Production-safe seed migration
 * Creates default admin, lecturer and student accounts if they don't exist.
 * Uses ON CONFLICT DO NOTHING so it's safe to run multiple times.
 */

const bcrypt = require('bcrypt');

module.exports = {
  name: '2026-04-10-seed-default-accounts',

  async up(sequelize) {
    console.log('👥 Creating default accounts (production-safe)...');

    const defaultPassword = await bcrypt.hash('Password123!', 10);

    const adminUserId    = '20000001-0000-4000-8000-000000000001';
    const lecturerUserId = '20000002-0000-4000-8000-000000000002';
    const studentUserId  = '20000003-0000-4000-8000-000000000003';

    // ── Admin ──────────────────────────────────────────────────────────
    await sequelize.query(`
      INSERT INTO "Users" (id, email, password_hash, member_number, role, account_status, is_verified, is_default_password, created_at, updated_at)
      VALUES (:id, :email, :password_hash, :member_number, :role, :account_status, :is_verified, :is_default_password, NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
    `, { replacements: {
      id: adminUserId,
      email: 'admin@eduhub.ac.za',
      password_hash: defaultPassword,
      member_number: 'ADMIN001',
      role: 'admin',
      account_status: 'active',
      is_verified: true,
      is_default_password: true,
    }});

    await sequelize.query(`
      INSERT INTO "User_Details" (id, user_id, first_name, last_name, date_of_birth, gender, nationality, id_number, phone, city, province, created_at, updated_at)
      VALUES (:id, :user_id, :first_name, :last_name, :dob, :gender, :nationality, :id_number, :phone, :city, :province, NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
    `, { replacements: {
      id: '21000001-0000-4000-8000-000000000001',
      user_id: adminUserId,
      first_name: 'System',
      last_name: 'Admin',
      dob: '1990-01-01',
      gender: 'other',
      nationality: 'South African',
      id_number: '9001010001088',
      phone: '0800000000',
      city: 'Johannesburg',
      province: 'Gauteng',
    }});

    // ── Lecturer ───────────────────────────────────────────────────────
    await sequelize.query(`
      INSERT INTO "Users" (id, email, password_hash, member_number, role, account_status, is_verified, is_default_password, created_at, updated_at)
      VALUES (:id, :email, :password_hash, :member_number, :role, :account_status, :is_verified, :is_default_password, NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
    `, { replacements: {
      id: lecturerUserId,
      email: 'john.smith@eduhub.ac.za',
      password_hash: defaultPassword,
      member_number: 'EMP2024001',
      role: 'lecturer',
      account_status: 'active',
      is_verified: true,
      is_default_password: true,
    }});

    await sequelize.query(`
      INSERT INTO "User_Details" (id, user_id, first_name, last_name, date_of_birth, gender, nationality, id_number, phone, city, province, created_at, updated_at)
      VALUES (:id, :user_id, :first_name, :last_name, :dob, :gender, :nationality, :id_number, :phone, :city, :province, NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
    `, { replacements: {
      id: '31000001-0000-4000-8000-000000000001',
      user_id: lecturerUserId,
      first_name: 'John',
      last_name: 'Smith',
      dob: '1980-05-20',
      gender: 'male',
      nationality: 'South African',
      id_number: '8005200001083',
      phone: '0112345678',
      city: 'Johannesburg',
      province: 'Gauteng',
    }});

    // ── Student ────────────────────────────────────────────────────────
    await sequelize.query(`
      INSERT INTO "Users" (id, email, password_hash, member_number, role, account_status, is_verified, is_default_password, created_at, updated_at)
      VALUES (:id, :email, :password_hash, :member_number, :role, :account_status, :is_verified, :is_default_password, NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
    `, { replacements: {
      id: studentUserId,
      email: 'thabo.molefe@student.eduhub.ac.za',
      password_hash: defaultPassword,
      member_number: '2026-0001',
      role: 'student',
      account_status: 'active',
      is_verified: true,
      is_default_password: true,
    }});

    await sequelize.query(`
      INSERT INTO "User_Details" (id, user_id, first_name, last_name, date_of_birth, gender, nationality, id_number, phone, city, province, created_at, updated_at)
      VALUES (:id, :user_id, :first_name, :last_name, :dob, :gender, :nationality, :id_number, :phone, :city, :province, NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
    `, { replacements: {
      id: '41000001-0000-4000-8000-000000000001',
      user_id: studentUserId,
      first_name: 'Thabo',
      last_name: 'Molefe',
      dob: '2000-03-15',
      gender: 'male',
      nationality: 'South African',
      id_number: '0003150001083',
      phone: '0821234567',
      city: 'Johannesburg',
      province: 'Gauteng',
    }});

    console.log('✅ Default accounts created successfully');
    console.log('   Admin:    admin@eduhub.ac.za     / Password123!');
    console.log('   Lecturer: john.smith@eduhub.ac.za / Password123!');
    console.log('   Student:  thabo.molefe@student.eduhub.ac.za / Password123!');
  },

  async down(sequelize) {
    await sequelize.query(`DELETE FROM "Users" WHERE email IN ('admin@eduhub.ac.za','john.smith@eduhub.ac.za','thabo.molefe@student.eduhub.ac.za')`);
  },
};
