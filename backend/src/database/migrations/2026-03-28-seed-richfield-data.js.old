/** @type {{ migration: { name: string, up: Function } }} */
module.exports = {
  migration: {
    name: '2026-03-28-seed-richfield-data',

    up: async (queryInterface, Sequelize, transaction) => {
      console.log('🌱 Seeding Richfield data...');

      const bcrypt = require('bcrypt');

      // Helper function to hash passwords
      const hashPassword = async (password) => {
        return await bcrypt.hash(password, 10);
      };

      // ════════════════════════════════════════════════════════════════
      // 1. SEED QUALIFICATIONS (Real Richfield programmes)
      // ════════════════════════════════════════════════════════════════

      const qualifications = [
        {
          id: '11111111-1111-1111-1111-111111111111',
          code: 'BSC-IT',
          name: 'Bachelor of Science in Information Technology',
          faculty: 'Faculty of Information Technology',
          duration_years: 3,
          total_fee: 85000.00,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '22222222-2222-2222-2222-222222222222',
          code: 'DIT',
          name: 'Diploma in Information Technology',
          faculty: 'Faculty of Information Technology',
          duration_years: 3,
          total_fee: 65000.00,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '33333333-3333-3333-3333-333333333333',
          code: 'BCOM-ACC',
          name: 'Bachelor of Commerce in Accounting',
          faculty: 'Faculty of Business Science',
          duration_years: 3,
          total_fee: 90000.00,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '44444444-4444-4444-4444-444444444444',
          code: 'BCOM-AGA-IT',
          name: 'Bachelor of Commerce (AGA-IT) - SAICA Endorsed',
          faculty: 'Faculty of Business Science',
          duration_years: 3,
          total_fee: 95000.00,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '55555555-5555-5555-5555-555555555555',
          code: 'BBA',
          name: 'Bachelor of Business Administration',
          faculty: 'Faculty of Business Science',
          duration_years: 3,
          total_fee: 80000.00,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '66666666-6666-6666-6666-666666666666',
          code: 'DBA',
          name: 'Diploma in Business Administration',
          faculty: 'Faculty of Business Science',
          duration_years: 3,
          total_fee: 60000.00,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      await queryInterface.bulkInsert('Qualifications', qualifications, { transaction });
      console.log('✅ Seeded 6 Richfield qualifications');

      // ════════════════════════════════════════════════════════════════
      // 2. SEED MODULES (Real Richfield module structure)
      // ════════════════════════════════════════════════════════════════

      const modules = [
        // ──────────────────────────────────────────────────────────────
        // BSc IT Modules (Based on Richfield BSc IT curriculum)
        // ──────────────────────────────────────────────────────────────

        // Year 1, Semester 1
        {
          id: '00000001-0001-4000-8000-000000000001',
          qualification_id: '11111111-1111-1111-1111-111111111111',
          code: 'IT511',
          name: 'Information Systems 511',
          description: 'Introduction to information systems and their role in business',
          credits: 12,
          year: 1,
          semester: 1,
          prerequisites: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '00000002-0002-4000-8000-000000000002',
          qualification_id: '11111111-1111-1111-1111-111111111111',
          code: 'MATH511',
          name: 'Mathematics 511',
          description: 'Fundamental mathematics for IT including algebra and calculus',
          credits: 12,
          year: 1,
          semester: 1,
          prerequisites: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '00000003-0003-4000-8000-000000000003',
          qualification_id: '11111111-1111-1111-1111-111111111111',
          code: 'PROG511',
          name: 'Programming 511',
          description: 'Introduction to programming using Python/Java',
          credits: 16,
          year: 1,
          semester: 1,
          prerequisites: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },

        // Year 1, Semester 2
        {
          id: '00000004-0004-4000-8000-000000000004',
          qualification_id: '11111111-1111-1111-1111-111111111111',
          code: 'WEB511',
          name: 'Web Technology 511',
          description: 'HTML, CSS, JavaScript fundamentals',
          credits: 12,
          year: 1,
          semester: 2,
          prerequisites: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '00000005-0005-4000-8000-000000000005',
          qualification_id: '11111111-1111-1111-1111-111111111111',
          code: 'DB600',
          name: 'Database Systems 600',
          description: 'Relational database design and SQL',
          credits: 16,
          year: 1,
          semester: 2,
          prerequisites: JSON.stringify(['IT511']),
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '00000006-0006-4000-8000-000000000006',
          qualification_id: '11111111-1111-1111-1111-111111111111',
          code: 'CA600',
          name: 'Computer Architecture 600',
          description: 'Hardware fundamentals and system architecture',
          credits: 12,
          year: 1,
          semester: 2,
          prerequisites: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },

        // Year 2, Semester 1
        {
          id: '00000007-0007-4000-8000-000000000007',
          qualification_id: '11111111-1111-1111-1111-111111111111',
          code: 'PROG731',
          name: 'Programming 731',
          description: 'Advanced programming concepts and OOP',
          credits: 16,
          year: 2,
          semester: 1,
          prerequisites: JSON.stringify(['PROG511']),
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '00000008-0008-4000-8000-000000000008',
          qualification_id: '11111111-1111-1111-1111-111111111111',
          code: 'NET731',
          name: 'Networks 731',
          description: 'Computer networking fundamentals',
          credits: 12,
          year: 2,
          semester: 1,
          prerequisites: JSON.stringify(['CA600']),
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '00000009-0009-4000-8000-000000000009',
          qualification_id: '11111111-1111-1111-1111-111111111111',
          code: 'OS700',
          name: 'Operating Systems 700',
          description: 'Operating system concepts and Linux/Unix',
          credits: 12,
          year: 2,
          semester: 1,
          prerequisites: JSON.stringify(['CA600']),
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },

        // Year 2, Semester 2
        {
          id: '00000010-0010-4000-8000-000000000010',
          qualification_id: '11111111-1111-1111-1111-111111111111',
          code: 'SE700',
          name: 'Software Engineering 700',
          description: 'Software development lifecycle and methodologies',
          credits: 16,
          year: 2,
          semester: 2,
          prerequisites: JSON.stringify(['PROG731']),
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '00000011-0011-4000-8000-000000000011',
          qualification_id: '11111111-1111-1111-1111-111111111111',
          code: 'CYBER700',
          name: 'Cyber Security 700',
          description: 'Information security principles and practices',
          credits: 12,
          year: 2,
          semester: 2,
          prerequisites: JSON.stringify(['NET731']),
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '00000012-0012-4000-8000-000000000012',
          qualification_id: '11111111-1111-1111-1111-111111111111',
          code: 'MOBILE700',
          name: 'Mobile App Development 700',
          description: 'Android and iOS app development',
          credits: 16,
          year: 2,
          semester: 2,
          prerequisites: JSON.stringify(['PROG731', 'WEB511']),
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },

        // Year 3, Semester 1
        {
          id: '00000013-0013-4000-8000-000000000013',
          qualification_id: '11111111-1111-1111-1111-111111111111',
          code: 'AI700',
          name: 'Artificial Intelligence 700',
          description: 'AI fundamentals and machine learning basics',
          credits: 16,
          year: 3,
          semester: 1,
          prerequisites: JSON.stringify(['PROG731', 'MATH511']),
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '00000014-0014-4000-8000-000000000014',
          qualification_id: '11111111-1111-1111-1111-111111111111',
          code: 'ML700',
          name: 'Machine Learning 700',
          description: 'Advanced machine learning algorithms',
          credits: 16,
          year: 3,
          semester: 1,
          prerequisites: JSON.stringify(['AI700']),
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '00000015-0015-4000-8000-000000000015',
          qualification_id: '11111111-1111-1111-1111-111111111111',
          code: 'CLOUD700',
          name: 'Cloud Computing 700',
          description: 'Cloud platforms (AWS, Azure) and deployment',
          credits: 12,
          year: 3,
          semester: 1,
          prerequisites: JSON.stringify(['NET731', 'OS700']),
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },

        // Year 3, Semester 2
        {
          id: '00000016-0016-4000-8000-000000000016',
          qualification_id: '11111111-1111-1111-1111-111111111111',
          code: 'ITPROJ700',
          name: 'IT Project 700',
          description: 'Final year capstone project',
          credits: 24,
          year: 3,
          semester: 2,
          prerequisites: JSON.stringify(['SE700']),
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '00000017-0017-4000-8000-000000000017',
          qualification_id: '11111111-1111-1111-1111-111111111111',
          code: 'WIL700',
          name: 'Work Integrated Learning 700',
          description: 'Workplace experience and internship',
          credits: 16,
          year: 3,
          semester: 2,
          prerequisites: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },

        // ──────────────────────────────────────────────────────────────
        // BCom Accounting Modules
        // ──────────────────────────────────────────────────────────────

        // Year 1
        {
          id: '00000101-0101-4000-8000-000000000101',
          qualification_id: '33333333-3333-3333-3333-333333333333',
          code: 'ACC511',
          name: 'Financial Accounting 511',
          description: 'Introduction to financial accounting principles',
          credits: 16,
          year: 1,
          semester: 1,
          prerequisites: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '00000102-0102-4000-8000-000000000102',
          qualification_id: '33333333-3333-3333-3333-333333333333',
          code: 'ECON511',
          name: 'Economics 511',
          description: 'Microeconomics and macroeconomics fundamentals',
          credits: 12,
          year: 1,
          semester: 1,
          prerequisites: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '00000103-0103-4000-8000-000000000103',
          qualification_id: '33333333-3333-3333-3333-333333333333',
          code: 'BUS511',
          name: 'Business Management 511',
          description: 'Introduction to business management',
          credits: 12,
          year: 1,
          semester: 1,
          prerequisites: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '00000104-0104-4000-8000-000000000104',
          qualification_id: '33333333-3333-3333-3333-333333333333',
          code: 'MACC521',
          name: 'Management Accounting 521',
          description: 'Cost and management accounting',
          credits: 16,
          year: 1,
          semester: 2,
          prerequisites: JSON.stringify(['ACC511']),
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '00000105-0105-4000-8000-000000000105',
          qualification_id: '33333333-3333-3333-3333-333333333333',
          code: 'TAX521',
          name: 'Taxation 521',
          description: 'Introduction to South African tax law',
          credits: 12,
          year: 1,
          semester: 2,
          prerequisites: JSON.stringify(['ACC511']),
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '00000106-0106-4000-8000-000000000106',
          qualification_id: '33333333-3333-3333-3333-333333333333',
          code: 'STAT521',
          name: 'Business Statistics 521',
          description: 'Statistical methods for business',
          credits: 12,
          year: 1,
          semester: 2,
          prerequisites: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },

        // Year 2
        {
          id: '00000107-0107-4000-8000-000000000107',
          qualification_id: '33333333-3333-3333-3333-333333333333',
          code: 'FACC731',
          name: 'Financial Accounting 731',
          description: 'Intermediate financial accounting',
          credits: 20,
          year: 2,
          semester: 1,
          prerequisites: JSON.stringify(['ACC511']),
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '00000108-0108-4000-8000-000000000108',
          qualification_id: '33333333-3333-3333-3333-333333333333',
          code: 'AUDIT731',
          name: 'Auditing 731',
          description: 'Introduction to auditing principles',
          credits: 16,
          year: 2,
          semester: 1,
          prerequisites: JSON.stringify(['ACC511']),
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '00000109-0109-4000-8000-000000000109',
          qualification_id: '33333333-3333-3333-3333-333333333333',
          code: 'LAW731',
          name: 'Commercial Law 731',
          description: 'Business and commercial law',
          credits: 12,
          year: 2,
          semester: 1,
          prerequisites: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },

        // Year 3
        {
          id: '00000110-0110-4000-8000-000000000110',
          qualification_id: '33333333-3333-3333-3333-333333333333',
          code: 'FACC841',
          name: 'Financial Accounting 841',
          description: 'Advanced financial accounting',
          credits: 24,
          year: 3,
          semester: 1,
          prerequisites: JSON.stringify(['FACC731']),
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '00000111-0111-4000-8000-000000000111',
          qualification_id: '33333333-3333-3333-3333-333333333333',
          code: 'MACC841',
          name: 'Management Accounting 841',
          description: 'Advanced management accounting',
          credits: 20,
          year: 3,
          semester: 1,
          prerequisites: JSON.stringify(['MACC521']),
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '00000112-0112-4000-8000-000000000112',
          qualification_id: '33333333-3333-3333-3333-333333333333',
          code: 'FIN841',
          name: 'Financial Management 841',
          description: 'Corporate finance and investment decisions',
          credits: 16,
          year: 3,
          semester: 2,
          prerequisites: JSON.stringify(['MACC521', 'ECON511']),
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },

        // ──────────────────────────────────────────────────────────────
        // Diploma IT Modules (Sample - fewer than degree)
        // ──────────────────────────────────────────────────────────────
        {
          id: '00000201-0201-4000-8000-000000000201',
          qualification_id: '22222222-2222-2222-2222-222222222222',
          code: 'DIT101',
          name: 'Introduction to Computing',
          description: 'Computer fundamentals and digital literacy',
          credits: 12,
          year: 1,
          semester: 1,
          prerequisites: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '00000202-0202-4000-8000-000000000202',
          qualification_id: '22222222-2222-2222-2222-222222222222',
          code: 'DIT102',
          name: 'Programming Fundamentals',
          description: 'Introduction to programming',
          credits: 16,
          year: 1,
          semester: 1,
          prerequisites: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '00000203-0203-4000-8000-000000000203',
          qualification_id: '22222222-2222-2222-2222-222222222222',
          code: 'DIT201',
          name: 'Web Development',
          description: 'HTML, CSS, JavaScript',
          credits: 16,
          year: 2,
          semester: 1,
          prerequisites: JSON.stringify(['DIT102']),
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '00000204-0204-4000-8000-000000000204',
          qualification_id: '22222222-2222-2222-2222-222222222222',
          code: 'DIT202',
          name: 'Database Management',
          description: 'Database design and SQL',
          credits: 16,
          year: 2,
          semester: 1,
          prerequisites: JSON.stringify(['DIT101']),
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      await queryInterface.bulkInsert('Modules', modules, { transaction });
      console.log(`✅ Seeded ${modules.length} modules across programmes`);

      // ════════════════════════════════════════════════════════════════
      // 3. SEED SEMESTERS
      // ════════════════════════════════════════════════════════════════

      const semesters = [
        {
          id: '10000001-0000-4000-8000-000000000001',
          name: '2026 Semester 1',
          year: 2026,
          semester_number: 1,
          start_date: new Date('2026-02-01'),
          end_date: new Date('2026-06-30'),
          registration_open: true,
          registration_start_date: new Date('2025-11-01'),
          registration_end_date: new Date('2026-02-15'),
          add_drop_deadline: new Date('2026-03-15'),
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '10000002-0000-4000-8000-000000000002',
          name: '2026 Semester 2',
          year: 2026,
          semester_number: 2,
          start_date: new Date('2026-07-01'),
          end_date: new Date('2026-11-30'),
          registration_open: false,
          registration_start_date: new Date('2026-05-01'),
          registration_end_date: new Date('2026-07-15'),
          add_drop_deadline: new Date('2026-08-15'),
          is_active: false,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '10000003-0000-4000-8000-000000000003',
          name: '2027 Semester 1',
          year: 2027,
          semester_number: 1,
          start_date: new Date('2027-02-01'),
          end_date: new Date('2027-06-30'),
          registration_open: false,
          registration_start_date: new Date('2026-11-01'),
          registration_end_date: new Date('2027-02-15'),
          add_drop_deadline: new Date('2027-03-15'),
          is_active: false,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      await queryInterface.bulkInsert('Semesters', semesters, { transaction });
      console.log('✅ Seeded 3 semesters');

      // ════════════════════════════════════════════════════════════════
      // 4. SEED USERS (Admin, Lecturers, Students)
      // ════════════════════════════════════════════════════════════════

      const defaultPassword = await hashPassword('Password123!');

      // Admin User
      const adminUserId = '20000001-0000-4000-8000-000000000001';
      await queryInterface.bulkInsert('Users', [
        {
          id: adminUserId,
          email: 'admin@richfield.ac.za',
          password_hash: defaultPassword,
          member_number: 'ADMIN001',
          role: 'admin',
          account_status: 'active',
          is_verified: true,
          is_default_password: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ], { transaction });

      await queryInterface.bulkInsert('User_Details', [
        {
          id: '21000001-0000-4000-8000-000000000001',
          user_id: adminUserId,
          first_name: 'System',
          last_name: 'Administrator',
          date_of_birth: new Date('1985-01-15'),
          gender: 'Male',
          nationality: 'South African',
          id_number: '8501155555555',
          phone: '+27123456789',
          city: 'Johannesburg',
          province: 'Gauteng',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ], { transaction });

      console.log('✅ Seeded 1 admin user');

      // Lecturers
      const lecturerUsers = [
        {
          id: '30000001-0000-4000-8000-000000000001',
          email: 'john.smith@richfield.ac.za',
          password_hash: defaultPassword,
          member_number: 'EMP2024001',
          role: 'lecturer',
          account_status: 'active',
          is_verified: true,
          is_default_password: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '30000002-0000-4000-8000-000000000002',
          email: 'sarah.jones@richfield.ac.za',
          password_hash: defaultPassword,
          member_number: 'EMP2024002',
          role: 'lecturer',
          account_status: 'active',
          is_verified: true,
          is_default_password: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '30000003-0000-4000-8000-000000000003',
          email: 'david.naidoo@richfield.ac.za',
          password_hash: defaultPassword,
          member_number: 'EMP2024003',
          role: 'lecturer',
          account_status: 'active',
          is_verified: true,
          is_default_password: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      await queryInterface.bulkInsert('Users', lecturerUsers, { transaction });

      const lecturerDetails = [
        {
          id: '31000001-0000-4000-8000-000000000001',
          user_id: '30000001-0000-4000-8000-000000000001',
          first_name: 'John',
          last_name: 'Smith',
          date_of_birth: new Date('1980-05-20'),
          gender: 'Male',
          nationality: 'South African',
          id_number: '8005205555555',
          phone: '+27821234567',
          city: 'Pretoria',
          province: 'Gauteng',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '31000002-0000-4000-8000-000000000002',
          user_id: '30000002-0000-4000-8000-000000000002',
          first_name: 'Sarah',
          last_name: 'Jones',
          date_of_birth: new Date('1978-08-12'),
          gender: 'Female',
          nationality: 'South African',
          id_number: '7808125555555',
          phone: '+27827654321',
          city: 'Johannesburg',
          province: 'Gauteng',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '31000003-0000-4000-8000-000000000003',
          user_id: '30000003-0000-4000-8000-000000000003',
          first_name: 'David',
          last_name: 'Naidoo',
          date_of_birth: new Date('1982-11-30'),
          gender: 'Male',
          nationality: 'South African',
          id_number: '8211305555555',
          phone: '+27829876543',
          city: 'Durban',
          province: 'KwaZulu-Natal',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      await queryInterface.bulkInsert('User_Details', lecturerDetails, { transaction });

      const lecturers = [
        {
          id: '32000001-0000-4000-8000-000000000001',
          user_id: '30000001-0000-4000-8000-000000000001',
          employee_number: 'EMP2024001',
          department: 'Information Technology',
          title: 'Dr.',
          specialization: 'Software Engineering and Cloud Computing',
          hire_date: new Date('2020-01-15'),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '32000002-0000-4000-8000-000000000002',
          user_id: '30000002-0000-4000-8000-000000000002',
          employee_number: 'EMP2024002',
          department: 'Business Science',
          title: 'Prof.',
          specialization: 'Financial Accounting and Auditing',
          hire_date: new Date('2018-03-01'),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '32000003-0000-4000-8000-000000000003',
          user_id: '30000003-0000-4000-8000-000000000003',
          employee_number: 'EMP2024003',
          department: 'Information Technology',
          title: 'Mr.',
          specialization: 'Artificial Intelligence and Machine Learning',
          hire_date: new Date('2021-07-01'),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      await queryInterface.bulkInsert('Lecturers', lecturers, { transaction });
      console.log('✅ Seeded 3 lecturers');

      // Students (Sample enrolled students)
      const studentUsers = [
        {
          id: '40000001-0000-4000-8000-000000000001',
          email: 'thabo.molefe@student.richfield.ac.za',
          password_hash: defaultPassword,
          member_number: '2026-0001',
          role: 'student',
          account_status: 'active',
          is_verified: true,
          is_default_password: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '40000002-0000-4000-8000-000000000002',
          email: 'lerato.khumalo@student.richfield.ac.za',
          password_hash: defaultPassword,
          member_number: '2026-0002',
          role: 'student',
          account_status: 'active',
          is_verified: true,
          is_default_password: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '40000003-0000-4000-8000-000000000003',
          email: 'sipho.dlamini@student.richfield.ac.za',
          password_hash: defaultPassword,
          member_number: '2026-0003',
          role: 'student',
          account_status: 'active',
          is_verified: true,
          is_default_password: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      await queryInterface.bulkInsert('Users', studentUsers, { transaction });

      const studentDetails = [
        {
          id: '41000001-0000-4000-8000-000000000001',
          user_id: '40000001-0000-4000-8000-000000000001',
          first_name: 'Thabo',
          last_name: 'Molefe',
          date_of_birth: new Date('2004-03-15'),
          gender: 'Male',
          nationality: 'South African',
          id_number: '0403155555555',
          phone: '+27731234567',
          street_address: '123 Main Street',
          suburb: 'Hatfield',
          city: 'Pretoria',
          province: 'Gauteng',
          postal_code: '0083',
          lifecycle_status: 'enrolled',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '41000002-0000-4000-8000-000000000002',
          user_id: '40000002-0000-4000-8000-000000000002',
          first_name: 'Lerato',
          last_name: 'Khumalo',
          date_of_birth: new Date('2003-07-22'),
          gender: 'Female',
          nationality: 'South African',
          id_number: '0307225555555',
          phone: '+27737654321',
          street_address: '456 Oak Avenue',
          suburb: 'Sandton',
          city: 'Johannesburg',
          province: 'Gauteng',
          postal_code: '2196',
          lifecycle_status: 'enrolled',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '41000003-0000-4000-8000-000000000003',
          user_id: '40000003-0000-4000-8000-000000000003',
          first_name: 'Sipho',
          last_name: 'Dlamini',
          date_of_birth: new Date('2005-01-10'),
          gender: 'Male',
          nationality: 'South African',
          id_number: '0501105555555',
          phone: '+27739876543',
          street_address: '789 Beach Road',
          suburb: 'Umhlanga',
          city: 'Durban',
          province: 'KwaZulu-Natal',
          postal_code: '4319',
          lifecycle_status: 'enrolled',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      await queryInterface.bulkInsert('User_Details', studentDetails, { transaction });

      const students = [
        {
          id: '42000001-0000-4000-8000-000000000001',
          user_id: '40000001-0000-4000-8000-000000000001',
          student_number: '2026-0001',
          qualification_id: '11111111-1111-1111-1111-111111111111', // BSc IT
          year_of_study: 1,
          enrollment_date: new Date('2026-02-01'),
          academic_status: 'active',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '42000002-0000-4000-8000-000000000002',
          user_id: '40000002-0000-4000-8000-000000000002',
          student_number: '2026-0002',
          qualification_id: '33333333-3333-3333-3333-333333333333', // BCom Accounting
          year_of_study: 1,
          enrollment_date: new Date('2026-02-01'),
          academic_status: 'active',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '42000003-0000-4000-8000-000000000003',
          user_id: '40000003-0000-4000-8000-000000000003',
          student_number: '2026-0003',
          qualification_id: '22222222-2222-2222-2222-222222222222', // Diploma IT
          year_of_study: 1,
          enrollment_date: new Date('2026-02-01'),
          academic_status: 'active',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      await queryInterface.bulkInsert('Students', students, { transaction });
      console.log('✅ Seeded 3 students');

      // ════════════════════════════════════════════════════════════════
      // 5. SEED MODULE ASSIGNMENTS (Lecturer → Module → Semester)
      // ════════════════════════════════════════════════════════════════

      const moduleLecturers = [
        // Dr. John Smith teaches IT modules
        { id: '50000001-0000-4000-8000-000000000001', module_id: '00000003-0003-4000-8000-000000000003', lecturer_id: '32000001-0000-4000-8000-000000000001', semester_id: '10000001-0000-4000-8000-000000000001', is_primary: true, created_at: new Date() },
        { id: '50000002-0000-4000-8000-000000000002', module_id: '00000007-0007-4000-8000-000000000007', lecturer_id: '32000001-0000-4000-8000-000000000001', semester_id: '10000001-0000-4000-8000-000000000001', is_primary: true, created_at: new Date() },
        { id: '50000003-0000-4000-8000-000000000003', module_id: '00000010-0010-4000-8000-000000000010', lecturer_id: '32000001-0000-4000-8000-000000000001', semester_id: '10000002-0000-4000-8000-000000000002', is_primary: true, created_at: new Date() },

        // Prof. Sarah Jones teaches Accounting
        { id: '50000004-0000-4000-8000-000000000004', module_id: '00000101-0101-4000-8000-000000000101', lecturer_id: '32000002-0000-4000-8000-000000000002', semester_id: '10000001-0000-4000-8000-000000000001', is_primary: true, created_at: new Date() },
        { id: '50000005-0000-4000-8000-000000000005', module_id: '00000107-0107-4000-8000-000000000107', lecturer_id: '32000002-0000-4000-8000-000000000002', semester_id: '10000001-0000-4000-8000-000000000001', is_primary: true, created_at: new Date() },

        // Mr. David Naidoo teaches AI/ML
        { id: '50000006-0000-4000-8000-000000000006', module_id: '00000013-0013-4000-8000-000000000013', lecturer_id: '32000003-0000-4000-8000-000000000003', semester_id: '10000001-0000-4000-8000-000000000001', is_primary: true, created_at: new Date() },
        { id: '50000007-0000-4000-8000-000000000007', module_id: '00000014-0014-4000-8000-000000000014', lecturer_id: '32000003-0000-4000-8000-000000000003', semester_id: '10000001-0000-4000-8000-000000000001', is_primary: true, created_at: new Date() },
      ];

      await queryInterface.bulkInsert('Module_Lecturers', moduleLecturers, { transaction });
      console.log('✅ Seeded module-lecturer assignments');

      // ════════════════════════════════════════════════════════════════
      // 6. SEED SAMPLE REGISTRATIONS
      // ════════════════════════════════════════════════════════════════

      const registrations = [
        // Thabo (BSc IT Year 1) - registered for semester 1 modules
        { id: '60000001-0000-4000-8000-000000000001', student_id: '42000001-0000-4000-8000-000000000001', module_id: '00000001-0001-4000-8000-000000000001', semester_id: '10000001-0000-4000-8000-000000000001', status: 'approved', approved_by: adminUserId, approved_at: new Date(), created_at: new Date(), updated_at: new Date() },
        { id: '60000002-0000-4000-8000-000000000002', student_id: '42000001-0000-4000-8000-000000000001', module_id: '00000002-0002-4000-8000-000000000002', semester_id: '10000001-0000-4000-8000-000000000001', status: 'approved', approved_by: adminUserId, approved_at: new Date(), created_at: new Date(), updated_at: new Date() },
        { id: '60000003-0000-4000-8000-000000000003', student_id: '42000001-0000-4000-8000-000000000001', module_id: '00000003-0003-4000-8000-000000000003', semester_id: '10000001-0000-4000-8000-000000000001', status: 'approved', approved_by: adminUserId, approved_at: new Date(), created_at: new Date(), updated_at: new Date() },

        // Lerato (BCom Accounting Year 1)
        { id: '60000004-0000-4000-8000-000000000004', student_id: '42000002-0000-4000-8000-000000000002', module_id: '00000101-0101-4000-8000-000000000101', semester_id: '10000001-0000-4000-8000-000000000001', status: 'approved', approved_by: adminUserId, approved_at: new Date(), created_at: new Date(), updated_at: new Date() },
        { id: '60000005-0000-4000-8000-000000000005', student_id: '42000002-0000-4000-8000-000000000002', module_id: '00000102-0102-4000-8000-000000000102', semester_id: '10000001-0000-4000-8000-000000000001', status: 'approved', approved_by: adminUserId, approved_at: new Date(), created_at: new Date(), updated_at: new Date() },
        { id: '60000006-0000-4000-8000-000000000006', student_id: '42000002-0000-4000-8000-000000000002', module_id: '00000103-0103-4000-8000-000000000103', semester_id: '10000001-0000-4000-8000-000000000001', status: 'approved', approved_by: adminUserId, approved_at: new Date(), created_at: new Date(), updated_at: new Date() },

        // Sipho (Diploma IT Year 1)
        { id: '60000007-0000-4000-8000-000000000007', student_id: '42000003-0000-4000-8000-000000000003', module_id: '00000201-0201-4000-8000-000000000201', semester_id: '10000001-0000-4000-8000-000000000001', status: 'approved', approved_by: adminUserId, approved_at: new Date(), created_at: new Date(), updated_at: new Date() },
        { id: '60000008-0000-4000-8000-000000000008', student_id: '42000003-0000-4000-8000-000000000003', module_id: '00000202-0202-4000-8000-000000000202', semester_id: '10000001-0000-4000-8000-000000000001', status: 'approved', approved_by: adminUserId, approved_at: new Date(), created_at: new Date(), updated_at: new Date() },
      ];

      await queryInterface.bulkInsert('Registrations', registrations, { transaction });
      console.log('✅ Seeded student registrations');

      console.log('');
      console.log('🎉 Richfield seed data completed!');
      console.log('');
      console.log('📊 Summary:');
      console.log('   - 6 Qualifications (BSc IT, DIT, BCom, BCom AGA-IT, BBA, DBA)');
      console.log(`   - ${modules.length} Modules across programmes`);
      console.log('   - 3 Semesters (2026-2027)');
      console.log('   - 1 Admin, 3 Lecturers, 3 Students');
      console.log('   - Module assignments and registrations');
      console.log('');
      console.log('🔐 Default login credentials:');
      console.log('   Email: admin@richfield.ac.za');
      console.log('   Password: Password123!');
      console.log('');
      console.log('   All users have the same default password: Password123!');
      console.log('   (is_default_password = true, will require change on first login)');
    },
  },
};
