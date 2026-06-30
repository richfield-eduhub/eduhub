const bcrypt = require("bcrypt");

module.exports = {
  migration: {
    name: "2026-06-27-seed-additional-lecturers",

    up: async (queryInterface, Sequelize, transaction) => {
      console.log("👨‍🏫 Seeding additional lecturers and their modules...");
      const sequelize = queryInterface.sequelize;

      const defaultPassword = await bcrypt.hash("Password123!", 10);

      // ════════════════════════════════════════════════════════════════
      // 1. CREATE TWO ADDITIONAL LECTURERS
      // ════════════════════════════════════════════════════════════════

      const lecturer1UserId = "20000004-0000-4000-8000-000000000004";
      const lecturer2UserId = "20000005-0000-4000-8000-000000000005";
      const lecturer1Id = "32000002-0000-4000-8000-000000000002";
      const lecturer2Id = "32000003-0000-4000-8000-000000000003";

      // Dr. Sarah Chen - Software Engineering & Database Expert
      const [existingChen] = await sequelize.query(
        `SELECT id FROM users WHERE email = 'sarah.chen@eduhub.ac.za' LIMIT 1`,
        { transaction },
      );

      if (!existingChen || existingChen.length === 0) {
        await sequelize.query(
          `INSERT INTO users (id, email, password_hash, member_number, role, account_status, is_verified, is_default_password, created_at, updated_at)
           VALUES (:id, :email, :pw, :mn, 'lecturer', 'active', true, true, NOW(), NOW())`,
          {
            replacements: {
              id: lecturer1UserId,
              email: "sarah.chen@eduhub.ac.za",
              pw: defaultPassword,
              mn: "2620000014", // role 2, sequence 000001, check digit 4
            },
            transaction,
          },
        );

        await sequelize.query(
          `INSERT INTO user_details (id, user_id, first_name, last_name, date_of_birth, gender, nationality, id_number, phone, city, province, created_at, updated_at)
           VALUES (:id, :uid, 'Sarah', 'Chen', '1985-08-15', 'Female', 'South African', '8508150002088', '0117654321', 'Pretoria', 'Gauteng', NOW(), NOW())`,
          {
            replacements: {
              id: "21000002-0000-4000-8000-000000000002",
              uid: lecturer1UserId,
            },
            transaction,
          },
        );

        await sequelize.query(
          `INSERT INTO lecturers (id, user_id, employee_number, department, title, specialization, hire_date, created_at, updated_at)
           VALUES (:id, :uid, :empNum, 'Information Technology', 'Dr.', 'Software Engineering & Database Systems', '2018-03-01', NOW(), NOW())`,
          {
            replacements: {
              id: lecturer1Id,
              uid: lecturer1UserId,
              empNum: "2620000014",
            },
            transaction,
          },
        );
        console.log("✅ Created lecturer: Dr. Sarah Chen");
      }

      // Prof. Michael Botha - Business & Accounting
      const [existingBotha] = await sequelize.query(
        `SELECT id FROM users WHERE email = 'michael.botha@eduhub.ac.za' LIMIT 1`,
        { transaction },
      );

      if (!existingBotha || existingBotha.length === 0) {
        await sequelize.query(
          `INSERT INTO users (id, email, password_hash, member_number, role, account_status, is_verified, is_default_password, created_at, updated_at)
           VALUES (:id, :email, :pw, :mn, 'lecturer', 'active', true, true, NOW(), NOW())`,
          {
            replacements: {
              id: lecturer2UserId,
              email: "michael.botha@eduhub.ac.za",
              pw: defaultPassword,
              mn: "2620000022", // role 2, sequence 000002, check digit 2
            },
            transaction,
          },
        );

        await sequelize.query(
          `INSERT INTO user_details (id, user_id, first_name, last_name, date_of_birth, gender, nationality, id_number, phone, city, province, created_at, updated_at)
           VALUES (:id, :uid, 'Michael', 'Botha', '1978-11-20', 'Male', 'South African', '7811200003087', '0118765432', 'Johannesburg', 'Gauteng', NOW(), NOW())`,
          {
            replacements: {
              id: "21000003-0000-4000-8000-000000000003",
              uid: lecturer2UserId,
            },
            transaction,
          },
        );

        await sequelize.query(
          `INSERT INTO lecturers (id, user_id, employee_number, department, title, specialization, hire_date, created_at, updated_at)
           VALUES (:id, :uid, :empNum, 'Business & Commerce', 'Prof.', 'Business Management & Accounting', '2015-01-15', NOW(), NOW())`,
          {
            replacements: {
              id: lecturer2Id,
              uid: lecturer2UserId,
              empNum: "2620000022",
            },
            transaction,
          },
        );
        console.log("✅ Created lecturer: Prof. Michael Botha");
      }

      // ════════════════════════════════════════════════════════════════
      // 2. GET QUALIFICATIONS
      // ════════════════════════════════════════════════════════════════

      const [bscitQual] = await sequelize.query(
        `SELECT id FROM qualifications WHERE code = 'BSC-IT' LIMIT 1`,
        { transaction },
      );
      const bscitQualId = bscitQual && bscitQual[0] ? bscitQual[0].id : null;

      const [bbaQual] = await sequelize.query(
        `SELECT id FROM qualifications WHERE code = 'BBA' LIMIT 1`,
        { transaction },
      );
      const bbaQualId = bbaQual && bbaQual[0] ? bbaQual[0].id : null;

      const [dbaQual] = await sequelize.query(
        `SELECT id FROM qualifications WHERE code = 'DBA' LIMIT 1`,
        { transaction },
      );
      const dbaQualId = dbaQual && dbaQual[0] ? dbaQual[0].id : null;

      // ════════════════════════════════════════════════════════════════
      // 3. CREATE MODULES FOR DR. SARAH CHEN (IT - 3 modules)
      // ════════════════════════════════════════════════════════════════

      const chenModules = [
        {
          id: "10000004-0004-4000-8000-000000000004",
          code: "DB511",
          name: "Database Systems 511",
          description:
            "Introduction to database design, SQL, normalization, and database management systems.",
          credits: 16,
          year: 1,
          semester: 2,
          qualificationId: bscitQualId,
        },
        {
          id: "10000005-0005-4000-8000-000000000005",
          code: "SE611",
          name: "Software Engineering 611",
          description:
            "Advanced software development methodologies, design patterns, and software architecture.",
          credits: 16,
          year: 2,
          semester: 1,
          qualificationId: bscitQualId,
        },
        {
          id: "10000006-0006-4000-8000-000000000006",
          code: "DB711",
          name: "Advanced Database 711",
          description:
            "Advanced database topics including NoSQL, data warehousing, and big data technologies.",
          credits: 20,
          year: 3,
          semester: 1,
          qualificationId: bscitQualId,
        },
      ];

      const chenModuleIds = [];
      for (const module of chenModules) {
        const [existing] = await sequelize.query(
          `SELECT id FROM modules WHERE code = :code LIMIT 1`,
          { replacements: { code: module.code }, transaction },
        );

        if (!existing || existing.length === 0) {
          await sequelize.query(
            `INSERT INTO modules (id, qualification_id, code, name, description, credits, year, semester, is_active, created_at, updated_at)
             VALUES (:id, :qualId, :code, :name, :desc, :credits, :year, :semester, true, NOW(), NOW())`,
            {
              replacements: {
                id: module.id,
                qualId: module.qualificationId,
                code: module.code,
                name: module.name,
                desc: module.description,
                credits: module.credits,
                year: module.year,
                semester: module.semester,
              },
              transaction,
            },
          );
          chenModuleIds.push(module.id);
          console.log(`✅ Created module: ${module.code}`);
        } else {
          chenModuleIds.push(existing[0].id);
        }
      }

      // ════════════════════════════════════════════════════════════════
      // 4. CREATE MODULES FOR PROF. MICHAEL BOTHA (Business - 4 modules)
      // ════════════════════════════════════════════════════════════════

      const bothaModules = [
        {
          id: "10000007-0007-4000-8000-000000000007",
          code: "BM511",
          name: "Business Management 511",
          description:
            "Fundamentals of business management, organizational behavior, and leadership.",
          credits: 12,
          year: 1,
          semester: 1,
          qualificationId: bbaQualId,
        },
        {
          id: "10000008-0008-4000-8000-000000000008",
          code: "ACC511",
          name: "Financial Accounting 511",
          description:
            "Introduction to financial accounting principles, financial statements, and reporting.",
          credits: 16,
          year: 1,
          semester: 1,
          qualificationId: bbaQualId,
        },
        {
          id: "10000009-0009-4000-8000-000000000009",
          code: "BM611",
          name: "Strategic Management 611",
          description:
            "Strategic planning, competitive analysis, and business strategy development.",
          credits: 16,
          year: 2,
          semester: 1,
          qualificationId: bbaQualId,
        },
        {
          id: "10000010-0010-4000-8000-000000000010",
          code: "BMGT501",
          name: "Business Management 501",
          description:
            "Core business management principles for diploma students.",
          credits: 12,
          year: 1,
          semester: 1,
          qualificationId: dbaQualId,
        },
      ];

      const bothaModuleIds = [];
      for (const module of bothaModules) {
        const [existing] = await sequelize.query(
          `SELECT id FROM modules WHERE code = :code LIMIT 1`,
          { replacements: { code: module.code }, transaction },
        );

        if (!existing || existing.length === 0) {
          await sequelize.query(
            `INSERT INTO modules (id, qualification_id, code, name, description, credits, year, semester, is_active, created_at, updated_at)
             VALUES (:id, :qualId, :code, :name, :desc, :credits, :year, :semester, true, NOW(), NOW())`,
            {
              replacements: {
                id: module.id,
                qualId: module.qualificationId,
                code: module.code,
                name: module.name,
                desc: module.description,
                credits: module.credits,
                year: module.year,
                semester: module.semester,
              },
              transaction,
            },
          );
          bothaModuleIds.push(module.id);
          console.log(`✅ Created module: ${module.code}`);
        } else {
          bothaModuleIds.push(existing[0].id);
        }
      }

      // ════════════════════════════════════════════════════════════════
      // 5. GET CURRENT SEMESTER
      // ════════════════════════════════════════════════════════════════

      const [semester] = await sequelize.query(
        `SELECT id FROM semesters WHERE year = 2026 AND semester_number = 1 LIMIT 1`,
        { transaction },
      );
      const semesterId = semester && semester[0] ? semester[0].id : null;

      if (!semesterId) {
        console.log(
          "⚠️  No active semester found, skipping module assignments",
        );
        return;
      }

      // ════════════════════════════════════════════════════════════════
      // 6. ASSIGN LECTURERS TO MODULES
      // ════════════════════════════════════════════════════════════════

      // Dr. Sarah Chen teaches 3 IT modules
      const chenAssignments = chenModuleIds.map((moduleId, idx) => ({
        id: `80000002-000${idx + 1}-4000-8000-000000000002`,
        module_id: moduleId,
        lecturer_id: lecturer1Id,
        semester_id: semesterId,
      }));

      // Prof. Michael Botha teaches 4 Business modules
      const bothaAssignments = bothaModuleIds.map((moduleId, idx) => ({
        id: `80000003-000${idx + 1}-4000-8000-000000000003`,
        module_id: moduleId,
        lecturer_id: lecturer2Id,
        semester_id: semesterId,
      }));

      const allAssignments = [...chenAssignments, ...bothaAssignments];

      for (const assignment of allAssignments) {
        const [existing] = await sequelize.query(
          `SELECT id FROM module_lecturers
           WHERE module_id = :moduleId AND lecturer_id = :lecturerId AND semester_id = :semesterId
           LIMIT 1`,
          {
            replacements: {
              moduleId: assignment.module_id,
              lecturerId: assignment.lecturer_id,
              semesterId: assignment.semester_id,
            },
            transaction,
          },
        );

        if (!existing || existing.length === 0) {
          await sequelize.query(
            `INSERT INTO module_lecturers (id, module_id, lecturer_id, semester_id, is_primary, created_at, updated_at)
             VALUES (:id, :moduleId, :lecturerId, :semesterId, true, NOW(), NOW())`,
            {
              replacements: {
                id: assignment.id,
                moduleId: assignment.module_id,
                lecturerId: assignment.lecturer_id,
                semesterId: assignment.semester_id,
              },
              transaction,
            },
          );
        }
      }

      console.log("✅ Assigned Dr. Sarah Chen to 3 IT modules");
      console.log("✅ Assigned Prof. Michael Botha to 4 Business modules");
      console.log("🎉 Additional lecturers seeded successfully!");
    },

    down: async (queryInterface, Sequelize, transaction) => {
      await queryInterface.sequelize.query(
        `DELETE FROM users WHERE email IN ('sarah.chen@eduhub.ac.za', 'michael.botha@eduhub.ac.za')`,
        { transaction },
      );
    },
  },
};
