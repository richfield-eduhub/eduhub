/**
 * DEV/TEST SEED DATA - DO NOT RUN IN PRODUCTION
 *
 * This file contains test users, lecturers, students, and sample registrations.
 * It should ONLY be run in development and test environments.
 */

const bcrypt = require('bcrypt');
const sequelize = require('../src/config/database');

module.exports = {
  async run() {
    console.log('👥 Seeding dev/test users...');
    console.log('   ⚠️  This should ONLY run in dev/test environments');

    // Helper function to hash passwords
    const hashPassword = async (password) => {
      return await bcrypt.hash(password, 10);
    };

    const defaultPassword = await hashPassword('Password123!');

    try {
      // Start transaction
      const transaction = await sequelize.transaction();

      try {
        // ════════════════════════════════════════════════════════════════
        // 1. SEED ADMIN USER
        // ════════════════════════════════════════════════════════════════

        const adminUserId = '20000001-0000-4000-8000-000000000001';

        await sequelize.query(`
          INSERT INTO "Users" (id, email, password_hash, member_number, role, account_status, is_verified, is_default_password, created_at, updated_at)
          VALUES (:id, :email, :password_hash, :member_number, :role, :account_status, :is_verified, :is_default_password, NOW(), NOW())
          ON CONFLICT (id) DO NOTHING
        `, {
          replacements: {
            id: adminUserId,
            email: 'admin@richfield.ac.za',
            password_hash: defaultPassword,
            member_number: 'ADMIN001',
            role: 'admin',
            account_status: 'active',
            is_verified: true,
            is_default_password: true,
          },
          transaction,
        });

        await sequelize.query(`
          INSERT INTO "User_Details" (id, user_id, first_name, last_name, date_of_birth, gender, nationality, id_number, phone, city, province, created_at, updated_at)
          VALUES (:id, :user_id, :first_name, :last_name, :date_of_birth, :gender, :nationality, :id_number, :phone, :city, :province, NOW(), NOW())
          ON CONFLICT (id) DO NOTHING
        `, {
          replacements: {
            id: '21000001-0000-4000-8000-000000000001',
            user_id: adminUserId,
            first_name: 'System',
            last_name: 'Administrator',
            date_of_birth: '1985-01-15',
            gender: 'Male',
            nationality: 'South African',
            id_number: '8501155555555',
            phone: '+27123456789',
            city: 'Johannesburg',
            province: 'Gauteng',
          },
          transaction,
        });

        console.log('   ✅ Seeded 1 admin user');

        // ════════════════════════════════════════════════════════════════
        // 2. SEED LECTURERS
        // ════════════════════════════════════════════════════════════════

        const lecturers = [
          {
            user_id: '30000001-0000-4000-8000-000000000001',
            email: 'john.smith@richfield.ac.za',
            member_number: 'EMP2024001',
            detail_id: '31000001-0000-4000-8000-000000000001',
            first_name: 'John',
            last_name: 'Smith',
            date_of_birth: '1980-05-20',
            gender: 'Male',
            id_number: '8005205555555',
            phone: '+27821234567',
            city: 'Pretoria',
            lecturer_id: '32000001-0000-4000-8000-000000000001',
            employee_number: 'EMP2024001',
            department: 'Information Technology',
            title: 'Dr.',
            specialization: 'Software Engineering and Cloud Computing',
            hire_date: '2020-01-15',
          },
          {
            user_id: '30000002-0000-4000-8000-000000000002',
            email: 'sarah.jones@richfield.ac.za',
            member_number: 'EMP2024002',
            detail_id: '31000002-0000-4000-8000-000000000002',
            first_name: 'Sarah',
            last_name: 'Jones',
            date_of_birth: '1978-08-12',
            gender: 'Female',
            id_number: '7808125555555',
            phone: '+27827654321',
            city: 'Johannesburg',
            lecturer_id: '32000002-0000-4000-8000-000000000002',
            employee_number: 'EMP2024002',
            department: 'Business Science',
            title: 'Prof.',
            specialization: 'Financial Accounting and Auditing',
            hire_date: '2018-03-01',
          },
          {
            user_id: '30000003-0000-4000-8000-000000000003',
            email: 'david.naidoo@richfield.ac.za',
            member_number: 'EMP2024003',
            detail_id: '31000003-0000-4000-8000-000000000003',
            first_name: 'David',
            last_name: 'Naidoo',
            date_of_birth: '1982-11-30',
            gender: 'Male',
            id_number: '8211305555555',
            phone: '+27829876543',
            city: 'Durban',
            lecturer_id: '32000003-0000-4000-8000-000000000003',
            employee_number: 'EMP2024003',
            department: 'Information Technology',
            title: 'Mr.',
            specialization: 'Artificial Intelligence and Machine Learning',
            hire_date: '2021-07-01',
          },
        ];

        for (const lect of lecturers) {
          await sequelize.query(`
            INSERT INTO "Users" (id, email, password_hash, member_number, role, account_status, is_verified, is_default_password, created_at, updated_at)
            VALUES (:id, :email, :password_hash, :member_number, 'lecturer', 'active', true, true, NOW(), NOW())
            ON CONFLICT (id) DO NOTHING
          `, {
            replacements: {
              id: lect.user_id,
              email: lect.email,
              password_hash: defaultPassword,
              member_number: lect.member_number,
            },
            transaction,
          });

          await sequelize.query(`
            INSERT INTO "User_Details" (id, user_id, first_name, last_name, date_of_birth, gender, nationality, id_number, phone, city, province, created_at, updated_at)
            VALUES (:id, :user_id, :first_name, :last_name, :date_of_birth, :gender, 'South African', :id_number, :phone, :city, 'Gauteng', NOW(), NOW())
            ON CONFLICT (id) DO NOTHING
          `, {
            replacements: {
              id: lect.detail_id,
              user_id: lect.user_id,
              first_name: lect.first_name,
              last_name: lect.last_name,
              date_of_birth: lect.date_of_birth,
              gender: lect.gender,
              id_number: lect.id_number,
              phone: lect.phone,
              city: lect.city,
            },
            transaction,
          });

          await sequelize.query(`
            INSERT INTO "Lecturers" (id, user_id, employee_number, department, title, specialization, hire_date, created_at, updated_at)
            VALUES (:id, :user_id, :employee_number, :department, :title, :specialization, :hire_date, NOW(), NOW())
            ON CONFLICT (id) DO NOTHING
          `, {
            replacements: {
              id: lect.lecturer_id,
              user_id: lect.user_id,
              employee_number: lect.employee_number,
              department: lect.department,
              title: lect.title,
              specialization: lect.specialization,
              hire_date: lect.hire_date,
            },
            transaction,
          });
        }

        console.log('   ✅ Seeded 3 lecturers');

        // ════════════════════════════════════════════════════════════════
        // 3. SEED STUDENTS
        // ════════════════════════════════════════════════════════════════

        const students = [
          {
            user_id: '40000001-0000-4000-8000-000000000001',
            email: 'thabo.molefe@student.richfield.ac.za',
            member_number: '2026-0001',
            detail_id: '41000001-0000-4000-8000-000000000001',
            first_name: 'Thabo',
            last_name: 'Molefe',
            date_of_birth: '2004-03-15',
            gender: 'Male',
            id_number: '0403155555555',
            phone: '+27731234567',
            street_address: '123 Main Street',
            suburb: 'Hatfield',
            city: 'Pretoria',
            province: 'Gauteng',
            postal_code: '0083',
            student_id: '42000001-0000-4000-8000-000000000001',
            student_number: '2026-0001',
            qualification_id: '11111111-1111-1111-1111-111111111111', // BSc IT
            year_of_study: 1,
          },
          {
            user_id: '40000002-0000-4000-8000-000000000002',
            email: 'lerato.khumalo@student.richfield.ac.za',
            member_number: '2026-0002',
            detail_id: '41000002-0000-4000-8000-000000000002',
            first_name: 'Lerato',
            last_name: 'Khumalo',
            date_of_birth: '2003-07-22',
            gender: 'Female',
            id_number: '0307225555555',
            phone: '+27737654321',
            street_address: '456 Oak Avenue',
            suburb: 'Sandton',
            city: 'Johannesburg',
            province: 'Gauteng',
            postal_code: '2196',
            student_id: '42000002-0000-4000-8000-000000000002',
            student_number: '2026-0002',
            qualification_id: '33333333-3333-3333-3333-333333333333', // BCom Accounting
            year_of_study: 1,
          },
          {
            user_id: '40000003-0000-4000-8000-000000000003',
            email: 'sipho.dlamini@student.richfield.ac.za',
            member_number: '2026-0003',
            detail_id: '41000003-0000-4000-8000-000000000003',
            first_name: 'Sipho',
            last_name: 'Dlamini',
            date_of_birth: '2005-01-10',
            gender: 'Male',
            id_number: '0501105555555',
            phone: '+27739876543',
            street_address: '789 Beach Road',
            suburb: 'Umhlanga',
            city: 'Durban',
            province: 'KwaZulu-Natal',
            postal_code: '4319',
            student_id: '42000003-0000-4000-8000-000000000003',
            student_number: '2026-0003',
            qualification_id: '22222222-2222-2222-2222-222222222222', // Diploma IT
            year_of_study: 1,
          },
        ];

        for (const stud of students) {
          await sequelize.query(`
            INSERT INTO "Users" (id, email, password_hash, member_number, role, account_status, is_verified, is_default_password, created_at, updated_at)
            VALUES (:id, :email, :password_hash, :member_number, 'student', 'active', true, true, NOW(), NOW())
            ON CONFLICT (id) DO NOTHING
          `, {
            replacements: {
              id: stud.user_id,
              email: stud.email,
              password_hash: defaultPassword,
              member_number: stud.member_number,
            },
            transaction,
          });

          await sequelize.query(`
            INSERT INTO "User_Details" (id, user_id, first_name, last_name, date_of_birth, gender, nationality, id_number, phone, street_address, suburb, city, province, postal_code, lifecycle_status, created_at, updated_at)
            VALUES (:id, :user_id, :first_name, :last_name, :date_of_birth, :gender, 'South African', :id_number, :phone, :street_address, :suburb, :city, :province, :postal_code, 'enrolled', NOW(), NOW())
            ON CONFLICT (id) DO NOTHING
          `, {
            replacements: {
              id: stud.detail_id,
              user_id: stud.user_id,
              first_name: stud.first_name,
              last_name: stud.last_name,
              date_of_birth: stud.date_of_birth,
              gender: stud.gender,
              id_number: stud.id_number,
              phone: stud.phone,
              street_address: stud.street_address,
              suburb: stud.suburb,
              city: stud.city,
              province: stud.province,
              postal_code: stud.postal_code,
            },
            transaction,
          });

          await sequelize.query(`
            INSERT INTO "Students" (id, user_id, student_number, qualification_id, year_of_study, enrollment_date, academic_status, created_at, updated_at)
            VALUES (:id, :user_id, :student_number, :qualification_id, :year_of_study, '2026-02-01', 'active', NOW(), NOW())
            ON CONFLICT (id) DO NOTHING
          `, {
            replacements: {
              id: stud.student_id,
              user_id: stud.user_id,
              student_number: stud.student_number,
              qualification_id: stud.qualification_id,
              year_of_study: stud.year_of_study,
            },
            transaction,
          });
        }

        console.log('   ✅ Seeded 3 students');

        // ════════════════════════════════════════════════════════════════
        // 4. SEED MODULE-LECTURER ASSIGNMENTS
        // ════════════════════════════════════════════════════════════════

        const moduleAssignments = [
          // Dr. John Smith teaches IT modules
          { id: '50000001-0000-4000-8000-000000000001', module_id: '00000003-0003-4000-8000-000000000003', lecturer_id: '32000001-0000-4000-8000-000000000001', semester_id: '10000001-0000-4000-8000-000000000001' },
          { id: '50000002-0000-4000-8000-000000000002', module_id: '00000007-0007-4000-8000-000000000007', lecturer_id: '32000001-0000-4000-8000-000000000001', semester_id: '10000001-0000-4000-8000-000000000001' },
          { id: '50000003-0000-4000-8000-000000000003', module_id: '00000010-0010-4000-8000-000000000010', lecturer_id: '32000001-0000-4000-8000-000000000001', semester_id: '10000002-0000-4000-8000-000000000002' },

          // Prof. Sarah Jones teaches Accounting
          { id: '50000004-0000-4000-8000-000000000004', module_id: '00000101-0101-4000-8000-000000000101', lecturer_id: '32000002-0000-4000-8000-000000000002', semester_id: '10000001-0000-4000-8000-000000000001' },
          { id: '50000005-0000-4000-8000-000000000005', module_id: '00000107-0107-4000-8000-000000000107', lecturer_id: '32000002-0000-4000-8000-000000000002', semester_id: '10000001-0000-4000-8000-000000000001' },

          // Mr. David Naidoo teaches AI/ML
          { id: '50000006-0000-4000-8000-000000000006', module_id: '00000013-0013-4000-8000-000000000013', lecturer_id: '32000003-0000-4000-8000-000000000003', semester_id: '10000001-0000-4000-8000-000000000001' },
          { id: '50000007-0000-4000-8000-000000000007', module_id: '00000014-0014-4000-8000-000000000014', lecturer_id: '32000003-0000-4000-8000-000000000003', semester_id: '10000001-0000-4000-8000-000000000001' },
        ];

        for (const assign of moduleAssignments) {
          await sequelize.query(`
            INSERT INTO "Module_Lecturers" (id, module_id, lecturer_id, semester_id, is_primary, created_at)
            VALUES (:id, :module_id, :lecturer_id, :semester_id, true, NOW())
            ON CONFLICT (id) DO NOTHING
          `, {
            replacements: assign,
            transaction,
          });
        }

        console.log('   ✅ Seeded module-lecturer assignments');

        // ════════════════════════════════════════════════════════════════
        // 5. SEED STUDENT REGISTRATIONS
        // ════════════════════════════════════════════════════════════════

        const registrations = [
          // Thabo (BSc IT Year 1) - registered for semester 1 modules
          { id: '60000001-0000-4000-8000-000000000001', student_id: '42000001-0000-4000-8000-000000000001', module_id: '00000001-0001-4000-8000-000000000001', semester_id: '10000001-0000-4000-8000-000000000001' },
          { id: '60000002-0000-4000-8000-000000000002', student_id: '42000001-0000-4000-8000-000000000001', module_id: '00000002-0002-4000-8000-000000000002', semester_id: '10000001-0000-4000-8000-000000000001' },
          { id: '60000003-0000-4000-8000-000000000003', student_id: '42000001-0000-4000-8000-000000000001', module_id: '00000003-0003-4000-8000-000000000003', semester_id: '10000001-0000-4000-8000-000000000001' },

          // Lerato (BCom Accounting Year 1)
          { id: '60000004-0000-4000-8000-000000000004', student_id: '42000002-0000-4000-8000-000000000002', module_id: '00000101-0101-4000-8000-000000000101', semester_id: '10000001-0000-4000-8000-000000000001' },
          { id: '60000005-0000-4000-8000-000000000005', student_id: '42000002-0000-4000-8000-000000000002', module_id: '00000102-0102-4000-8000-000000000102', semester_id: '10000001-0000-4000-8000-000000000001' },
          { id: '60000006-0000-4000-8000-000000000006', student_id: '42000002-0000-4000-8000-000000000002', module_id: '00000103-0103-4000-8000-000000000103', semester_id: '10000001-0000-4000-8000-000000000001' },

          // Sipho (Diploma IT Year 1)
          { id: '60000007-0000-4000-8000-000000000007', student_id: '42000003-0000-4000-8000-000000000003', module_id: '00000201-0201-4000-8000-000000000201', semester_id: '10000001-0000-4000-8000-000000000001' },
          { id: '60000008-0000-4000-8000-000000000008', student_id: '42000003-0000-4000-8000-000000000003', module_id: '00000202-0202-4000-8000-000000000202', semester_id: '10000001-0000-4000-8000-000000000001' },
        ];

        for (const reg of registrations) {
          await sequelize.query(`
            INSERT INTO "Registrations" (id, student_id, module_id, semester_id, status, approved_by, approved_at, created_at, updated_at)
            VALUES (:id, :student_id, :module_id, :semester_id, 'approved', :approved_by, NOW(), NOW(), NOW())
            ON CONFLICT (id) DO NOTHING
          `, {
            replacements: {
              ...reg,
              approved_by: adminUserId,
            },
            transaction,
          });
        }

        console.log('   ✅ Seeded student registrations');

        // Commit transaction
        await transaction.commit();

        console.log('');
        console.log('✅ Dev/test seed data completed!');
        console.log('');
        console.log('📊 Summary:');
        console.log('   - 1 Admin');
        console.log('   - 3 Lecturers');
        console.log('   - 3 Students');
        console.log('   - 7 Module assignments');
        console.log('   - 8 Student registrations');
        console.log('');
        console.log('🔐 Default login credentials:');
        console.log('   Email: admin@richfield.ac.za');
        console.log('   Password: Password123!');
        console.log('');
        console.log('   All users have the same default password: Password123!');
        console.log('   (is_default_password = true, will require change on first login)');
        console.log('');
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      console.error('❌ Seed failed:', error);
      throw error;
    }
  },
};
