/**
 * CORRECTED MIGRATION - Proper table dependency order
 *
 * Order matters! Tables must be created before they're referenced.
 *
 * Dependency graph:
 * 1. Users (no deps)
 * 2. User_Details (→ Users)
 * 3. Qualifications (no deps) ← MUST be before Students!
 * 4. Modules (→ Qualifications)
 * 5. Semesters (no deps)
 * 6. Students (→ Users, Qualifications)
 * 7. Lecturers (→ Users)
 * 8. Emergency_Contacts (→ Users)
 * 9. Module_Lecturers (→ Modules, Lecturers, Semesters)
 * 10. Applications (→ Users, Qualifications)
 * 11. Application_Documents (→ Applications, Users)
 * 12. Registrations (→ Students, Modules, Semesters, Users)
 * 13. Audit_Logs (→ Users)
 * 14. Notifications (→ Users)
 */

/** @type {{ migration: { name: string, up: Function } }} */
module.exports = {
  migration: {
    name: '2026-03-28-eduhub-schema-lowercase',

    up: async (queryInterface, Sequelize, transaction) => {
      console.log('🔄 Creating EduHub database schema (corrected order)...');

      // Enable UUID extension
      await queryInterface.sequelize.query(
        'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";',
        { transaction }
      );

      // ═══════════════════════════════════════════════════════════
      // 1. USERS (no dependencies)
      // ═══════════════════════════════════════════════════════════
      await queryInterface.createTable('users', {
        id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('uuid_generate_v4()') },
        email: { type: Sequelize.STRING(255), allowNull: false, unique: true },
        password_hash: { type: Sequelize.STRING(255), allowNull: false },
        member_number: { type: Sequelize.STRING(20), unique: true, allowNull: true },

        role: { type: Sequelize.ENUM('student', 'lecturer', 'admin'), allowNull: false },
        account_status: {
          type: Sequelize.ENUM('active', 'pending_verification', 'blocked', 'suspended', 'terminated'),
          defaultValue: 'pending_verification'
        },
        status_reason: { type: Sequelize.TEXT, allowNull: true },
        status_changed_at: { type: Sequelize.DATE, allowNull: true },
        status_changed_by: { type: Sequelize.UUID, allowNull: true },

        is_verified: { type: Sequelize.BOOLEAN, defaultValue: false },
        verification_token: { type: Sequelize.STRING(255), allowNull: true },
        verification_expires: { type: Sequelize.DATE, allowNull: true },

        is_default_password: { type: Sequelize.BOOLEAN, defaultValue: true },
        password_reset_token: { type: Sequelize.STRING(255), allowNull: true },
        password_reset_expires: { type: Sequelize.DATE, allowNull: true },
        last_password_change: { type: Sequelize.DATE, allowNull: true },
        require_password_change: { type: Sequelize.BOOLEAN, defaultValue: false },

        failed_login_attempts: { type: Sequelize.INTEGER, defaultValue: 0 },
        last_failed_login: { type: Sequelize.DATE, allowNull: true },
        last_login: { type: Sequelize.DATE, allowNull: true },
        last_login_ip: { type: Sequelize.STRING(45), allowNull: true },

        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      }, { transaction });

      await queryInterface.addIndex('users', ['email'], { name: 'idx_users_email', transaction });
      await queryInterface.addIndex('users', ['member_number'], { name: 'idx_users_member_number', transaction });
      await queryInterface.addIndex('users', ['role'], { name: 'idx_users_role', transaction });
      await queryInterface.addIndex('users', ['account_status'], { name: 'idx_users_account_status', transaction });

      // Add self-referencing FK after table exists
      await queryInterface.addConstraint('users', {
        fields: ['status_changed_by'],
        type: 'foreign key',
        name: 'fk_users_status_changed_by',
        references: { table: 'users', field: 'id' },
        onDelete: 'SET NULL',
        transaction
      });

      console.log('✅ Created Users table');

      // ═══════════════════════════════════════════════════════════
      // 2. USER_DETAILS (depends on Users)
      // ═══════════════════════════════════════════════════════════
      await queryInterface.createTable('user_details', {
        id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('uuid_generate_v4()') },
        user_id: {
          type: Sequelize.UUID,
          allowNull: false,
          unique: true,
          references: { model: 'users', key: 'id' },
          onDelete: 'CASCADE'
        },

        first_name: { type: Sequelize.STRING(100), allowNull: false },
        last_name: { type: Sequelize.STRING(100), allowNull: false },
        date_of_birth: { type: Sequelize.DATEONLY, allowNull: false },
        gender: { type: Sequelize.ENUM('Male', 'Female', 'Non-binary', 'Prefer not to say'), allowNull: true },
        nationality: { type: Sequelize.STRING(100), defaultValue: 'South African' },

        id_number: { type: Sequelize.STRING(13), unique: true, allowNull: true },
        passport_number: { type: Sequelize.STRING(20), unique: true, allowNull: true },

        phone: { type: Sequelize.STRING(20), allowNull: false },
        alt_phone: { type: Sequelize.STRING(20), allowNull: true },
        alt_email: { type: Sequelize.STRING(255), allowNull: true },

        street_address: { type: Sequelize.STRING(255), allowNull: true },
        suburb: { type: Sequelize.STRING(100), allowNull: true },
        city: { type: Sequelize.STRING(100), allowNull: true },
        province: { type: Sequelize.STRING(50), allowNull: true },
        postal_code: { type: Sequelize.STRING(10), allowNull: true },

        lifecycle_status: {
          type: Sequelize.ENUM('applicant', 'applied', 'enrolled', 'alumni', 'dropped_out', 'rejected'),
          allowNull: true
        },

        profile_photo_url: { type: Sequelize.STRING(500), allowNull: true },
        bio: { type: Sequelize.TEXT, allowNull: true },

        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      }, { transaction });

      await queryInterface.addIndex('user_details', ['user_id'], { name: 'idx_user_details_user_id', transaction });
      await queryInterface.addIndex('user_details', ['id_number'], { name: 'idx_user_details_id_number', transaction });
      await queryInterface.addIndex('user_details', ['lifecycle_status'], { name: 'idx_user_details_lifecycle_status', transaction });

      console.log('✅ Created User_Details table');

      // ═══════════════════════════════════════════════════════════
      // 3. QUALIFICATIONS (no dependencies) ← CRITICAL: Before Students!
      // ═══════════════════════════════════════════════════════════
      await queryInterface.createTable('qualifications', {
        id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('uuid_generate_v4()') },
        code: { type: Sequelize.STRING(20), allowNull: false, unique: true },
        name: { type: Sequelize.STRING(255), allowNull: false },
        faculty: { type: Sequelize.STRING(100), allowNull: true },
        duration_years: { type: Sequelize.INTEGER, allowNull: true },
        total_fee: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
        is_active: { type: Sequelize.BOOLEAN, defaultValue: true },

        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      }, { transaction });

      await queryInterface.addIndex('qualifications', ['code'], { name: 'idx_qualifications_code', transaction });
      await queryInterface.addIndex('qualifications', ['is_active'], { name: 'idx_qualifications_is_active', transaction });

      console.log('✅ Created Qualifications table');

      // ═══════════════════════════════════════════════════════════
      // 4. MODULES (depends on Qualifications)
      // ═══════════════════════════════════════════════════════════
      await queryInterface.createTable('modules', {
        id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('uuid_generate_v4()') },
        qualification_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'qualifications', key: 'id' },
          onDelete: 'CASCADE'
        },
        code: { type: Sequelize.STRING(20), allowNull: false, unique: true },
        name: { type: Sequelize.STRING(255), allowNull: false },
        description: { type: Sequelize.TEXT, allowNull: true },
        credits: { type: Sequelize.INTEGER, allowNull: false },

        year: { type: Sequelize.INTEGER, allowNull: true },
        semester: { type: Sequelize.INTEGER, allowNull: true },

        prerequisites: { type: Sequelize.JSONB, allowNull: true },

        is_active: { type: Sequelize.BOOLEAN, defaultValue: true },

        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      }, { transaction });

      await queryInterface.addIndex('modules', ['code'], { name: 'idx_modules_code', transaction });
      await queryInterface.addIndex('modules', ['qualification_id'], { name: 'idx_modules_qualification_id', transaction });
      await queryInterface.addIndex('modules', ['is_active'], { name: 'idx_modules_is_active', transaction });

      console.log('✅ Created Modules table');

      // ═══════════════════════════════════════════════════════════
      // 5. SEMESTERS (no dependencies)
      // ═══════════════════════════════════════════════════════════
      await queryInterface.createTable('semesters', {
        id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('uuid_generate_v4()') },
        name: { type: Sequelize.STRING(100), allowNull: false },
        year: { type: Sequelize.INTEGER, allowNull: false },
        semester_number: { type: Sequelize.INTEGER, allowNull: false },

        start_date: { type: Sequelize.DATEONLY, allowNull: true },
        end_date: { type: Sequelize.DATEONLY, allowNull: true },

        registration_open: { type: Sequelize.BOOLEAN, defaultValue: false },
        registration_start_date: { type: Sequelize.DATEONLY, allowNull: true },
        registration_end_date: { type: Sequelize.DATEONLY, allowNull: true },
        add_drop_deadline: { type: Sequelize.DATEONLY, allowNull: true },

        is_active: { type: Sequelize.BOOLEAN, defaultValue: false },

        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      }, { transaction });

      await queryInterface.addIndex('semesters', ['is_active'], { name: 'idx_semesters_is_active', transaction });
      await queryInterface.addIndex('semesters', ['year'], { name: 'idx_semesters_year', transaction });
      await queryInterface.addIndex('semesters', ['year', 'semester_number'], {
        unique: true,
        name: 'idx_semesters_year_semester_number',
        transaction
      });

      console.log('✅ Created Semesters table');

      // ═══════════════════════════════════════════════════════════
      // 6. STUDENTS (depends on Users AND Qualifications)
      // ═══════════════════════════════════════════════════════════
      await queryInterface.createTable('students', {
        id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('uuid_generate_v4()') },
        user_id: {
          type: Sequelize.UUID,
          allowNull: false,
          unique: true,
          references: { model: 'users', key: 'id' },
          onDelete: 'CASCADE'
        },

        student_number: { type: Sequelize.STRING(20), allowNull: false, unique: true },
        qualification_id: {
          type: Sequelize.UUID,
          allowNull: true,
          references: { model: 'qualifications', key: 'id' },
          onDelete: 'SET NULL'
        },
        year_of_study: { type: Sequelize.INTEGER, defaultValue: 1 },
        enrollment_date: { type: Sequelize.DATEONLY, allowNull: false },

        academic_status: {
          type: Sequelize.ENUM('active', 'on_leave', 'completed', 'withdrawn'),
          defaultValue: 'active'
        },

        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      }, { transaction });

      await queryInterface.addIndex('students', ['user_id'], { name: 'idx_students_user_id', transaction });
      await queryInterface.addIndex('students', ['student_number'], { name: 'idx_students_student_number', transaction });
      await queryInterface.addIndex('students', ['qualification_id'], { name: 'idx_students_qualification_id', transaction });

      console.log('✅ Created Students table');

      // ═══════════════════════════════════════════════════════════
      // 7. LECTURERS (depends on Users)
      // ═══════════════════════════════════════════════════════════
      await queryInterface.createTable('lecturers', {
        id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('uuid_generate_v4()') },
        user_id: {
          type: Sequelize.UUID,
          allowNull: false,
          unique: true,
          references: { model: 'users', key: 'id' },
          onDelete: 'CASCADE'
        },

        employee_number: { type: Sequelize.STRING(20), allowNull: false, unique: true },
        department: { type: Sequelize.STRING(100), allowNull: true },
        title: { type: Sequelize.STRING(50), allowNull: true },
        specialization: { type: Sequelize.TEXT, allowNull: true },
        hire_date: { type: Sequelize.DATEONLY, allowNull: true },

        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      }, { transaction });

      await queryInterface.addIndex('lecturers', ['user_id'], { name: 'idx_lecturers_user_id', transaction });
      await queryInterface.addIndex('lecturers', ['employee_number'], { name: 'idx_lecturers_employee_number', transaction });
      await queryInterface.addIndex('lecturers', ['department'], { name: 'idx_lecturers_department', transaction });

      console.log('✅ Created Lecturers table');

      // ═══════════════════════════════════════════════════════════
      // 8. EMERGENCY_CONTACTS (depends on Users)
      // ═══════════════════════════════════════════════════════════
      await queryInterface.createTable('emergency_contacts', {
        id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('uuid_generate_v4()') },
        user_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'users', key: 'id' },
          onDelete: 'CASCADE'
        },

        name: { type: Sequelize.STRING(100), allowNull: false },
        relationship: { type: Sequelize.STRING(50), allowNull: false },
        phone: { type: Sequelize.STRING(20), allowNull: false },
        alt_phone: { type: Sequelize.STRING(20), allowNull: true },
        email: { type: Sequelize.STRING(255), allowNull: true },
        is_primary: { type: Sequelize.BOOLEAN, defaultValue: false },

        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      }, { transaction });

      await queryInterface.addIndex('emergency_contacts', ['user_id'], { name: 'idx_emergency_contacts_user_id', transaction });

      console.log('✅ Created Emergency_Contacts table');

      // ═══════════════════════════════════════════════════════════
      // 9. MODULE_LECTURERS (depends on Modules, Lecturers, Semesters)
      // ═══════════════════════════════════════════════════════════
      await queryInterface.createTable('module_lecturers', {
        id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('uuid_generate_v4()') },
        module_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'modules', key: 'id' },
          onDelete: 'CASCADE'
        },
        lecturer_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'lecturers', key: 'id' },
          onDelete: 'CASCADE'
        },
        semester_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'semesters', key: 'id' },
          onDelete: 'CASCADE'
        },
        is_primary: { type: Sequelize.BOOLEAN, defaultValue: true },

        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      }, { transaction });

      await queryInterface.addIndex('module_lecturers', ['module_id'], { name: 'idx_module_lecturers_module_id', transaction });
      await queryInterface.addIndex('module_lecturers', ['lecturer_id'], { name: 'idx_module_lecturers_lecturer_id', transaction });
      await queryInterface.addIndex('module_lecturers', ['semester_id'], { name: 'idx_module_lecturers_semester_id', transaction });
      await queryInterface.addIndex(
        'module_lecturers',
        ['module_id', 'lecturer_id', 'semester_id'],
        { unique: true, name: 'idx_module_lecturers_unique', transaction }
      );

      console.log('✅ Created Module_Lecturers table');

      // ═══════════════════════════════════════════════════════════
      // 10. APPLICATIONS (depends on Users, Qualifications)
      // ═══════════════════════════════════════════════════════════
      await queryInterface.createTable('applications', {
        id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('uuid_generate_v4()') },
        user_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'users', key: 'id' },
          onDelete: 'CASCADE'
        },
        reference_number: { type: Sequelize.STRING(20), unique: true, allowNull: true },

        qualification_id: {
          type: Sequelize.UUID,
          allowNull: true,
          references: { model: 'qualifications', key: 'id' },
          onDelete: 'SET NULL'
        },
        admission_for: {
          type: Sequelize.ENUM('1st Semester', '2nd Semester', '1st Year', '2nd Year', '3rd Year'),
          allowNull: true
        },
        application_type: { type: Sequelize.ENUM('new', 'returning', 'transfer'), allowNull: true },

        high_school: { type: Sequelize.STRING(255), allowNull: true },
        high_school_year: { type: Sequelize.INTEGER, allowNull: true },
        highest_grade: { type: Sequelize.STRING(50), allowNull: true },
        matric_subjects: { type: Sequelize.JSONB, allowNull: true },

        tertiary_institution: { type: Sequelize.STRING(255), allowNull: true },
        tertiary_qualification: { type: Sequelize.STRING(255), allowNull: true },
        tertiary_year: { type: Sequelize.INTEGER, allowNull: true },

        payer_name: { type: Sequelize.STRING(255), allowNull: true },
        payer_relation: { type: Sequelize.STRING(50), allowNull: true },
        payer_phone: { type: Sequelize.STRING(20), allowNull: true },
        payer_email: { type: Sequelize.STRING(255), allowNull: true },
        payer_address: { type: Sequelize.TEXT, allowNull: true },

        status: {
          type: Sequelize.ENUM('draft', 'pending', 'under_review', 'approved', 'rejected', 'cancelled'),
          defaultValue: 'draft'
        },

        tc_accepted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
        tc_accepted_at: { type: Sequelize.DATE, allowNull: true },

        reviewed_by: {
          type: Sequelize.UUID,
          allowNull: true,
          references: { model: 'users', key: 'id' },
          onDelete: 'SET NULL'
        },
        reviewed_at: { type: Sequelize.DATE, allowNull: true },
        rejection_reason: { type: Sequelize.TEXT, allowNull: true },

        submitted_at: { type: Sequelize.DATE, allowNull: true },
        approved_at: { type: Sequelize.DATE, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      }, { transaction });

      await queryInterface.addIndex('applications', ['user_id'], { name: 'idx_applications_user_id', transaction });
      await queryInterface.addIndex('applications', ['status'], { name: 'idx_applications_status', transaction });
      await queryInterface.addIndex('applications', ['reference_number'], { name: 'idx_applications_reference_number', transaction });
      await queryInterface.addIndex('applications', ['qualification_id'], { name: 'idx_applications_qualification_id', transaction });

      console.log('✅ Created Applications table');

      // ═══════════════════════════════════════════════════════════
      // 11. APPLICATION_DOCUMENTS (depends on Applications, Users)
      // ═══════════════════════════════════════════════════════════
      await queryInterface.createTable('application_documents', {
        id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('uuid_generate_v4()') },
        application_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'applications', key: 'id' },
          onDelete: 'CASCADE'
        },
        document_type: {
          type: Sequelize.ENUM(
            'id_document',
            'matric_certificate',
            'tertiary_transcript',
            'proof_of_payment',
            'passport_photo',
            'study_permit',
            'saqa_evaluation',
            'other'
          ),
          allowNull: false
        },
        file_name: { type: Sequelize.STRING(255), allowNull: false },
        file_path: { type: Sequelize.STRING(500), allowNull: false },
        file_size: { type: Sequelize.INTEGER, allowNull: true },
        mime_type: { type: Sequelize.STRING(100), allowNull: true },

        is_verified: { type: Sequelize.BOOLEAN, defaultValue: false },
        verified_by: {
          type: Sequelize.UUID,
          allowNull: true,
          references: { model: 'users', key: 'id' },
          onDelete: 'SET NULL'
        },
        verified_at: { type: Sequelize.DATE, allowNull: true },

        uploaded_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      }, { transaction });

      await queryInterface.addIndex('application_documents', ['application_id'], { name: 'idx_application_documents_application_id', transaction });
      await queryInterface.addIndex('application_documents', ['document_type'], { name: 'idx_application_documents_document_type', transaction });

      console.log('✅ Created Application_Documents table');

      // ═══════════════════════════════════════════════════════════
      // 12. REGISTRATIONS (depends on Students, Modules, Semesters, Users)
      // ═══════════════════════════════════════════════════════════
      await queryInterface.createTable('registrations', {
        id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('uuid_generate_v4()') },
        student_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'students', key: 'id' },
          onDelete: 'RESTRICT'
        },
        module_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'modules', key: 'id' },
          onDelete: 'RESTRICT'
        },
        semester_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'semesters', key: 'id' },
          onDelete: 'RESTRICT'
        },

        status: {
          type: Sequelize.ENUM('pending', 'approved', 'dropped', 'completed', 'failed', 'declined'),
          defaultValue: 'pending'
        },

        quotation_amount: { type: Sequelize.DECIMAL(10, 2), allowNull: true },

        approved_by: {
          type: Sequelize.UUID,
          allowNull: true,
          references: { model: 'users', key: 'id' },
          onDelete: 'SET NULL'
        },
        approved_at: { type: Sequelize.DATE, allowNull: true },
        decline_reason: { type: Sequelize.TEXT, allowNull: true },

        grade: { type: Sequelize.STRING(5), allowNull: true },
        marks: { type: Sequelize.DECIMAL(5, 2), allowNull: true },

        registration_date: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
        dropped_at: { type: Sequelize.DATE, allowNull: true },
        completed_at: { type: Sequelize.DATE, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      }, { transaction });

      await queryInterface.addIndex('registrations', ['student_id'], { name: 'idx_registrations_student_id', transaction });
      await queryInterface.addIndex('registrations', ['module_id'], { name: 'idx_registrations_module_id', transaction });
      await queryInterface.addIndex('registrations', ['semester_id'], { name: 'idx_registrations_semester_id', transaction });
      await queryInterface.addIndex('registrations', ['status'], { name: 'idx_registrations_status', transaction });
      await queryInterface.addIndex(
        'registrations',
        ['student_id', 'module_id', 'semester_id'],
        { unique: true, name: 'idx_registrations_unique', transaction }
      );

      console.log('✅ Created Registrations table');

      // ═══════════════════════════════════════════════════════════
      // 13. AUDIT_LOGS (depends on Users)
      // ═══════════════════════════════════════════════════════════
      await queryInterface.createTable('audit_logs', {
        id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('uuid_generate_v4()') },
        user_id: {
          type: Sequelize.UUID,
          allowNull: true,
          references: { model: 'users', key: 'id' },
          onDelete: 'SET NULL'
        },

        action: { type: Sequelize.STRING(100), allowNull: false },
        table_name: { type: Sequelize.STRING(100), allowNull: true },
        record_id: { type: Sequelize.UUID, allowNull: true },

        old_data: { type: Sequelize.JSONB, allowNull: true },
        new_data: { type: Sequelize.JSONB, allowNull: true },

        ip_address: { type: Sequelize.STRING(45), allowNull: true },
        user_agent: { type: Sequelize.TEXT, allowNull: true },

        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      }, { transaction });

      await queryInterface.addIndex('audit_logs', ['user_id'], { name: 'idx_audit_logs_user_id', transaction });
      await queryInterface.addIndex('audit_logs', ['table_name'], { name: 'idx_audit_logs_table_name', transaction });
      await queryInterface.addIndex('audit_logs', ['created_at'], { name: 'idx_audit_logs_created_at', transaction });
      await queryInterface.addIndex('audit_logs', ['action'], { name: 'idx_audit_logs_action', transaction });

      console.log('✅ Created Audit_Logs table');

      // ═══════════════════════════════════════════════════════════
      // 14. NOTIFICATIONS (depends on Users)
      // ═══════════════════════════════════════════════════════════
      await queryInterface.createTable('notifications', {
        id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('uuid_generate_v4()') },
        user_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'users', key: 'id' },
          onDelete: 'CASCADE'
        },

        title: { type: Sequelize.STRING(200), allowNull: false },
        message: { type: Sequelize.TEXT, allowNull: false },
        type: { type: Sequelize.ENUM('info', 'success', 'warning', 'error'), allowNull: true },

        is_read: { type: Sequelize.BOOLEAN, defaultValue: false },
        link_url: { type: Sequelize.STRING(500), allowNull: true },

        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      }, { transaction });

      await queryInterface.addIndex('notifications', ['user_id'], { name: 'idx_notifications_user_id', transaction });
      await queryInterface.addIndex('notifications', ['is_read'], { name: 'idx_notifications_is_read', transaction });
      await queryInterface.addIndex('notifications', ['created_at'], { name: 'idx_notifications_created_at', transaction });

      console.log('✅ Created Notifications table');

      console.log('');
      console.log('🎉 EduHub schema migration completed successfully!');
      console.log('📊 Created 14 tables with proper dependency order');
    },
  },
};
