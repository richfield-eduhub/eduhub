/** @type {{ migration: { name: string, up: Function } }} */
module.exports = {
  migration: {
    name: '2026-03-29-seed-reference-data',

    up: async (queryInterface, Sequelize, transaction) => {
      console.log('📚 Seeding reference data (Qualifications, Modules, Semesters)...');
      console.log('   ⚠️  This runs in ALL environments (dev, test, prod)');

      // ════════════════════════════════════════════════════════════════
<<<<<<< HEAD
      // 1. SEED QUALIFICATIONS (Real Richfield programmes)
=======
      // 1. SEED QUALIFICATIONS (Real EduHub programmes)
>>>>>>> 531c062 (popi's changes)
      // ════════════════════════════════════════════════════════════════

      const qualifications = [
        {
          id: '727ff8ae-0470-42a0-b8c6-58daf0ee564d',
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
          id: '1ffc6bf4-cb65-4cac-919c-ab214915a01b',
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
          id: 'ab63090d-b07f-492d-b766-023aca06cb89',
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
          id: 'eb11dad8-0080-424c-8fe1-debf2ba9513d',
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
          id: 'a3dea4bb-f84f-444a-8913-129f50711af4',
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
          id: '0b741d4c-ef66-4ace-b153-c796e709864a',
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

      await queryInterface.bulkInsert('qualifications', qualifications, { transaction });
<<<<<<< HEAD
      console.log('   ✅ Seeded 6 Richfield qualifications');

      // ════════════════════════════════════════════════════════════════
      // 2. SEED MODULES (Real Richfield module structure)
=======
      console.log('   ✅ Seeded 6 EduHub qualifications');

      // ════════════════════════════════════════════════════════════════
      // 2. SEED MODULES (Real EduHub module structure)
>>>>>>> 531c062 (popi's changes)
      // ════════════════════════════════════════════════════════════════

      const modules = [
        // ──────────────────────────────────────────────────────────────
<<<<<<< HEAD
        // BSc IT Modules (Based on Richfield BSc IT curriculum)
=======
        // BSc IT Modules (Based on EduHub BSc IT curriculum)
>>>>>>> 531c062 (popi's changes)
        // ──────────────────────────────────────────────────────────────

        // Year 1, Semester 1
        {
          id: 'e2213c05-7621-4c41-a384-9367a1f3b90a',
          qualification_id: '727ff8ae-0470-42a0-b8c6-58daf0ee564d',
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
          id: 'a48dc0bb-0004-4b68-9135-cde4e233367b',
          qualification_id: '727ff8ae-0470-42a0-b8c6-58daf0ee564d',
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
          id: 'ca3ceb85-5027-41cd-8d36-31aba49284b0',
          qualification_id: '727ff8ae-0470-42a0-b8c6-58daf0ee564d',
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
          id: '6a25a805-eb36-4358-b1af-df4057f57f0a',
          qualification_id: '727ff8ae-0470-42a0-b8c6-58daf0ee564d',
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
          id: 'c99f1b9f-88d7-425c-8621-d046b07de22f',
          qualification_id: '727ff8ae-0470-42a0-b8c6-58daf0ee564d',
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
          id: 'fb4cf90d-4985-4c4b-89c7-b3c08ea7618f',
          qualification_id: '727ff8ae-0470-42a0-b8c6-58daf0ee564d',
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
          id: 'e37ed59c-8a56-450b-af54-0199945cc37b',
          qualification_id: '727ff8ae-0470-42a0-b8c6-58daf0ee564d',
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
          id: 'f466b5e8-6fff-4110-ab6b-6b1fbd5bbbdc',
          qualification_id: '727ff8ae-0470-42a0-b8c6-58daf0ee564d',
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
          id: 'e95ca5c9-e4be-42ca-9d20-42cedcc3338c',
          qualification_id: '727ff8ae-0470-42a0-b8c6-58daf0ee564d',
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
          id: 'bee2fb05-c4bc-43a4-88e2-7c1933fb2028',
          qualification_id: '727ff8ae-0470-42a0-b8c6-58daf0ee564d',
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
          id: '2e16ed7f-c51c-415a-ae47-1dc2da925655',
          qualification_id: '727ff8ae-0470-42a0-b8c6-58daf0ee564d',
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
          id: 'c5db6817-8783-4219-8d18-c7759d3e1566',
          qualification_id: '727ff8ae-0470-42a0-b8c6-58daf0ee564d',
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
          id: '2b1e5be6-fc6c-4191-ad4c-f4fc506d972c',
          qualification_id: '727ff8ae-0470-42a0-b8c6-58daf0ee564d',
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
          id: '54bf0f5e-2455-4ad4-9d1c-0efe656dca25',
          qualification_id: '727ff8ae-0470-42a0-b8c6-58daf0ee564d',
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
          id: 'eec6aeba-815a-4439-89e7-6f3ab797cc5d',
          qualification_id: '727ff8ae-0470-42a0-b8c6-58daf0ee564d',
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
          id: '3e308d64-4718-4838-ab38-29509a1a8c83',
          qualification_id: '727ff8ae-0470-42a0-b8c6-58daf0ee564d',
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
          id: 'eab6d5a8-2068-4ad1-ad8f-69f09c826932',
          qualification_id: '727ff8ae-0470-42a0-b8c6-58daf0ee564d',
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
          id: '8803120f-c8bb-48b7-9e1b-40a5fa34c054',
          qualification_id: 'ab63090d-b07f-492d-b766-023aca06cb89',
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
          id: '583bb43f-f4f7-43d8-941d-39b99bba2b80',
          qualification_id: 'ab63090d-b07f-492d-b766-023aca06cb89',
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
          id: '8cea66e5-4d2e-425a-a58c-0e2716f592cd',
          qualification_id: 'ab63090d-b07f-492d-b766-023aca06cb89',
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
          id: '3f5f7b28-2cf5-47ce-bc3e-e4c555960107',
          qualification_id: 'ab63090d-b07f-492d-b766-023aca06cb89',
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
          id: '80c4cb34-5f55-4468-aaed-f2c35e14cad0',
          qualification_id: 'ab63090d-b07f-492d-b766-023aca06cb89',
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
          id: 'c378e021-09de-4704-b89f-d146e672b01e',
          qualification_id: 'ab63090d-b07f-492d-b766-023aca06cb89',
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
          id: '5f3d8092-d987-4fc2-9a72-eec15c53bd12',
          qualification_id: 'ab63090d-b07f-492d-b766-023aca06cb89',
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
          id: 'c153fe67-27c4-42cf-aa42-9491e007b827',
          qualification_id: 'ab63090d-b07f-492d-b766-023aca06cb89',
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
          id: 'a451cbab-0415-4116-ae29-d6448f40d0ae',
          qualification_id: 'ab63090d-b07f-492d-b766-023aca06cb89',
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
          id: '288265c9-fbea-4d54-ada7-c249d071b579',
          qualification_id: 'ab63090d-b07f-492d-b766-023aca06cb89',
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
          id: 'dfe90550-4321-44c9-a8a3-d4905ddaacf4',
          qualification_id: 'ab63090d-b07f-492d-b766-023aca06cb89',
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
          id: '60d1deec-ab3a-423e-99a3-0d0cb27698e0',
          qualification_id: 'ab63090d-b07f-492d-b766-023aca06cb89',
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
          id: '94fd008d-c1e3-47c4-b2ea-662327930748',
          qualification_id: '1ffc6bf4-cb65-4cac-919c-ab214915a01b',
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
          id: '48234aee-f18c-475b-b602-1190050620a3',
          qualification_id: '1ffc6bf4-cb65-4cac-919c-ab214915a01b',
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
          id: '76b50fb8-e731-4788-9ccb-467fb9b3af10',
          qualification_id: '1ffc6bf4-cb65-4cac-919c-ab214915a01b',
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
          id: '9bb878ea-112b-42e4-96d3-93a4dce8456f',
          qualification_id: '1ffc6bf4-cb65-4cac-919c-ab214915a01b',
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

      await queryInterface.bulkInsert('modules', modules, { transaction });
      console.log(`   ✅ Seeded ${modules.length} modules across programmes`);

      // ════════════════════════════════════════════════════════════════
      // 3. SEED SEMESTERS (Initial semesters - more can be added later)
      // ════════════════════════════════════════════════════════════════

      const semesters = [
        {
          id: '3c18624a-2e62-406d-9d56-94353b95fbb7',
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
          id: '0ae6bf4f-af45-416f-a7c6-7b17f42c6016',
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
          id: 'ee58cda9-a99a-46ab-a84c-701aed3b16f5',
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

      await queryInterface.bulkInsert('semesters', semesters, { transaction });
      console.log('   ✅ Seeded 3 semesters');

      console.log('');
      console.log('✅ Reference data seeding completed!');
      console.log('');
      console.log('📊 Summary:');
      console.log('   - 6 Qualifications (BSc IT, DIT, BCom, BCom AGA-IT, BBA, DBA)');
      console.log(`   - ${modules.length} Modules across programmes`);
      console.log('   - 3 Semesters (2026-2027)');
      console.log('');
      console.log('💡 This data is now consistent across all environments (dev/test/prod)');
      console.log('💡 To add test users, run: npm run seed (dev/test only)');
    },
  },
};
