/** @type {{ migration: { name: string, up: Function } }} */
module.exports = {
  migration: {
    name: '2026-06-27-seed-bba-dba-modules',

    up: async (queryInterface, Sequelize, transaction) => {
      console.log('📚 Seeding BBA and DBA modules (Richfield Business programmes)...');

      // ════════════════════════════════════════════════════════════════
      // BBA - Bachelor of Business Administration Modules
      // ════════════════════════════════════════════════════════════════

      const bbaModules = [
        // ──────────────────────────────────────────────────────────────
        // Year 1, Semester 1
        // ──────────────────────────────────────────────────────────────
        {
          id: 'bba10001-0000-4000-8000-000000000001',
          qualification_id: 'a3dea4bb-f84f-444a-8913-129f50711af4', // BBA ID
          code: 'BUS511',
          name: 'Business Management 511',
          description: 'Introduction to business management principles and organizational structures',
          credits: 16,
          year: 1,
          semester: 1,
          prerequisites: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 'bba10002-0000-4000-8000-000000000002',
          qualification_id: 'a3dea4bb-f84f-444a-8913-129f50711af4',
          code: 'ACC511',
          name: 'Financial Accounting 511',
          description: 'Basic principles of financial accounting and bookkeeping',
          credits: 14,
          year: 1,
          semester: 1,
          prerequisites: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 'bba10003-0000-4000-8000-000000000003',
          qualification_id: 'a3dea4bb-f84f-444a-8913-129f50711af4',
          code: 'ECO511',
          name: 'Economics 511',
          description: 'Introduction to microeconomics and macroeconomics principles',
          credits: 12,
          year: 1,
          semester: 1,
          prerequisites: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 'bba10004-0000-4000-8000-000000000004',
          qualification_id: 'a3dea4bb-f84f-444a-8913-129f50711af4',
          code: 'COM511',
          name: 'Business Communication 511',
          description: 'Professional communication skills for business environments',
          credits: 10,
          year: 1,
          semester: 1,
          prerequisites: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },

        // ──────────────────────────────────────────────────────────────
        // Year 1, Semester 2
        // ──────────────────────────────────────────────────────────────
        {
          id: 'bba10005-0000-4000-8000-000000000005',
          qualification_id: 'a3dea4bb-f84f-444a-8913-129f50711af4',
          code: 'MKT511',
          name: 'Marketing 511',
          description: 'Introduction to marketing concepts, strategies and consumer behavior',
          credits: 14,
          year: 1,
          semester: 2,
          prerequisites: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 'bba10006-0000-4000-8000-000000000006',
          qualification_id: 'a3dea4bb-f84f-444a-8913-129f50711af4',
          code: 'ACC512',
          name: 'Management Accounting 512',
          description: 'Cost accounting and management decision-making techniques',
          credits: 14,
          year: 1,
          semester: 2,
          prerequisites: JSON.stringify(['ACC511']),
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 'bba10007-0000-4000-8000-000000000007',
          qualification_id: 'a3dea4bb-f84f-444a-8913-129f50711af4',
          code: 'STA511',
          name: 'Business Statistics 511',
          description: 'Statistical methods and data analysis for business decision-making',
          credits: 12,
          year: 1,
          semester: 2,
          prerequisites: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 'bba10008-0000-4000-8000-000000000008',
          qualification_id: 'a3dea4bb-f84f-444a-8913-129f50711af4',
          code: 'LAW511',
          name: 'Business Law 511',
          description: 'Legal framework for business operations in South Africa',
          credits: 12,
          year: 1,
          semester: 2,
          prerequisites: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },

        // ──────────────────────────────────────────────────────────────
        // Year 2, Semester 1
        // ──────────────────────────────────────────────────────────────
        {
          id: 'bba20001-0000-4000-8000-000000000001',
          qualification_id: 'a3dea4bb-f84f-444a-8913-129f50711af4',
          code: 'HRM521',
          name: 'Human Resource Management 521',
          description: 'Principles and practices of human resource management',
          credits: 14,
          year: 2,
          semester: 1,
          prerequisites: JSON.stringify(['BUS511']),
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 'bba20002-0000-4000-8000-000000000002',
          qualification_id: 'a3dea4bb-f84f-444a-8913-129f50711af4',
          code: 'FIN521',
          name: 'Financial Management 521',
          description: 'Corporate finance principles and investment decisions',
          credits: 16,
          year: 2,
          semester: 1,
          prerequisites: JSON.stringify(['ACC512']),
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      // ════════════════════════════════════════════════════════════════
      // DBA - Diploma in Business Administration Modules
      // ════════════════════════════════════════════════════════════════

      const dbaModules = [
        // ──────────────────────────────────────────────────────────────
        // Year 1, Semester 1
        // ──────────────────────────────────────────────────────────────
        {
          id: 'dba10001-0000-4000-8000-000000000001',
          qualification_id: '0b741d4c-ef66-4ace-b153-c796e709864a', // DBA ID
          code: 'BUS411',
          name: 'Business Fundamentals 411',
          description: 'Introduction to business operations and management',
          credits: 14,
          year: 1,
          semester: 1,
          prerequisites: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 'dba10002-0000-4000-8000-000000000002',
          qualification_id: '0b741d4c-ef66-4ace-b153-c796e709864a',
          code: 'ACC411',
          name: 'Accounting Principles 411',
          description: 'Basic accounting concepts and financial statements',
          credits: 12,
          year: 1,
          semester: 1,
          prerequisites: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 'dba10003-0000-4000-8000-000000000003',
          qualification_id: '0b741d4c-ef66-4ace-b153-c796e709864a',
          code: 'COM411',
          name: 'Business Communication 411',
          description: 'Effective communication in business contexts',
          credits: 10,
          year: 1,
          semester: 1,
          prerequisites: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },

        // ──────────────────────────────────────────────────────────────
        // Year 1, Semester 2
        // ──────────────────────────────────────────────────────────────
        {
          id: 'dba10004-0000-4000-8000-000000000004',
          qualification_id: '0b741d4c-ef66-4ace-b153-c796e709864a',
          code: 'MKT411',
          name: 'Marketing Basics 411',
          description: 'Introduction to marketing and customer service',
          credits: 12,
          year: 1,
          semester: 2,
          prerequisites: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 'dba10005-0000-4000-8000-000000000005',
          qualification_id: '0b741d4c-ef66-4ace-b153-c796e709864a',
          code: 'OFF411',
          name: 'Office Administration 411',
          description: 'Administrative skills and office management',
          credits: 12,
          year: 1,
          semester: 2,
          prerequisites: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      // Insert all modules
      const allModules = [...bbaModules, ...dbaModules];
      await queryInterface.bulkInsert('modules', allModules, {
        transaction,
        ignoreDuplicates: true
      });

      console.log('   ✅ Seeded BBA modules: 10 modules (Year 1-2)');
      console.log('   ✅ Seeded DBA modules: 5 modules (Year 1)');
      console.log('   📊 Total: 15 new business modules added');
    },
  },
};
