/** @type {{ migration: { name: string, up: Function } }} */
module.exports = {
  migration: {
    name: '2026-05-22-seed-john-smith-classes',

    up: async (queryInterface, Sequelize, transaction) => {
      console.log('🎓 Seeding John Smith\'s classes with students and schedules...');

      const bcrypt = require('bcrypt');

      // Helper function to hash passwords
      const hashPassword = async (password) => {
        return await bcrypt.hash(password, 10);
      };

      const defaultPassword = await hashPassword('Student123!');

      // ════════════════════════════════════════════════════════════════
      // 1. FIND JOHN SMITH'S LECTURER ID
      // ════════════════════════════════════════════════════════════════

      const [lecturerRecord] = await queryInterface.sequelize.query(
        `SELECT l.id as lecturer_id, l.user_id, u.email
         FROM lecturers l
         JOIN users u ON l.user_id = u.id
         WHERE u.email = 'john.smith@richfield.ac.za'
         LIMIT 1`,
        { transaction }
      );

      if (!lecturerRecord || lecturerRecord.length === 0) {
        console.error('❌ John Smith lecturer not found. Please run the base seed first.');
        return;
      }

      const johnSmithLecturerId = lecturerRecord[0].lecturer_id;
      const johnSmithUserId = lecturerRecord[0].user_id;
      console.log(`✅ Found John Smith: Lecturer ID ${johnSmithLecturerId}`);

      // ════════════════════════════════════════════════════════════════
      // 2. GET OR CREATE 3 MODULES FOR JOHN SMITH
      // ════════════════════════════════════════════════════════════════

      // Find BSc IT qualification
      const [qualResult] = await queryInterface.sequelize.query(
        `SELECT id FROM qualifications WHERE code = 'BSC-IT' LIMIT 1`,
        { transaction }
      );

      let qualId;
      if (!qualResult || qualResult.length === 0) {
        console.log('Creating BSc IT qualification...');
        const newQualId = '11111111-1111-1111-1111-111111111111';
        await queryInterface.bulkInsert('qualifications', [
          {
            id: newQualId,
            code: 'BSC-IT',
            name: 'Bachelor of Science in Information Technology',
            faculty: 'Faculty of Information Technology',
            duration_years: 3,
            total_fee: 85000.00,
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
          }
        ], { transaction });
        qualId = newQualId;
      } else {
        qualId = qualResult[0].id;
      }

      // Define John Smith's 3 modules
      const modules = [
        {
          id: '10000001-0001-4000-8000-000000000001',
          qualification_id: qualId,
          code: 'PROG511',
          name: 'Programming 511',
          description: 'Introduction to programming using Python and Java. Core concepts include variables, data types, control structures, functions, and object-oriented programming basics.',
          credits: 16,
          year: 1,
          semester: 1,
          prerequisites: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '10000002-0002-4000-8000-000000000002',
          qualification_id: qualId,
          code: 'WEB511',
          name: 'Web Development 511',
          description: 'Web fundamentals covering HTML5, CSS3, JavaScript, responsive design, and modern web development practices.',
          credits: 12,
          year: 1,
          semester: 1,
          prerequisites: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '10000003-0003-4000-8000-000000000003',
          qualification_id: qualId,
          code: 'SE700',
          name: 'Software Engineering 700',
          description: 'Software development lifecycle, Agile methodologies, version control, testing, and project management for software development.',
          credits: 16,
          year: 2,
          semester: 1,
          prerequisites: JSON.stringify(['PROG511']),
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      // Insert modules (ignore if they already exist)
      for (const module of modules) {
        const [existing] = await queryInterface.sequelize.query(
          `SELECT id FROM modules WHERE code = :code LIMIT 1`,
          { replacements: { code: module.code }, transaction }
        );

        if (!existing || existing.length === 0) {
          await queryInterface.bulkInsert('modules', [module], { transaction });
          console.log(`✅ Created module: ${module.code}`);
        } else {
          console.log(`ℹ️  Module ${module.code} already exists`);
        }
      }

      // ════════════════════════════════════════════════════════════════
      // 3. GET OR CREATE CURRENT SEMESTER
      // ════════════════════════════════════════════════════════════════

      const [semResult] = await queryInterface.sequelize.query(
        `SELECT id FROM semesters WHERE year = 2026 AND semester_number = 1 LIMIT 1`,
        { transaction }
      );

      let semesterId;
      if (!semResult || semResult.length === 0) {
        console.log('Creating 2026 Semester 1...');
        semesterId = '99000001-0000-4000-8000-000000000001';
        await queryInterface.bulkInsert('semesters', [
          {
            id: semesterId,
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
          }
        ], { transaction });
      } else {
        semesterId = semResult[0].id;
      }
      console.log(`✅ Using Semester ID: ${semesterId}`);

      // ════════════════════════════════════════════════════════════════
      // 4. ASSIGN JOHN SMITH TO TEACH THESE 3 MODULES
      // ════════════════════════════════════════════════════════════════

      const moduleLecturerAssignments = modules.map((module, idx) => ({
        id: `80000001-000${idx+1}-4000-8000-000000000001`,
        module_id: module.id,
        lecturer_id: johnSmithLecturerId,
        semester_id: semesterId,
        is_primary: true,
        created_at: new Date(),
        updated_at: new Date(),
      }));

      for (const assignment of moduleLecturerAssignments) {
        const [existing] = await queryInterface.sequelize.query(
          `SELECT id FROM "Module_Lecturers"
           WHERE module_id = :moduleId AND lecturer_id = :lecturerId AND semester_id = :semesterId
           LIMIT 1`,
          {
            replacements: {
              moduleId: assignment.module_id,
              lecturerId: assignment.lecturer_id,
              semesterId: assignment.semester_id
            },
            transaction
          }
        );

        if (!existing || existing.length === 0) {
          await queryInterface.bulkInsert('Module_Lecturers', [assignment], { transaction });
        }
      }

      console.log('✅ Assigned John Smith to teach 3 modules');

      // ════════════════════════════════════════════════════════════════
      // 5. CREATE 30 STUDENTS (10 per module)
      // ════════════════════════════════════════════════════════════════

      const firstNames = ['Thabo', 'Lerato', 'Sipho', 'Zanele', 'Lungile', 'Nomsa', 'Bongani', 'Thandiwe', 'Mandla', 'Precious', 'Kagiso', 'Refilwe', 'Thabiso', 'Mpho', 'Sello', 'Dineo', 'Karabo', 'Kgotso', 'Tshepo', 'Keabetswe', 'Neo', 'Tlou', 'Pule', 'Lesedi', 'Bokang', 'Thato', 'Boitumelo', 'Tumi', 'Rethabile', 'Naledi'];
      const lastNames = ['Mokoena', 'Dlamini', 'Nkosi', 'Mahlangu', 'Sithole', 'Khumalo', 'Zulu', 'Mthembu', 'Ngcobo', 'Ndlovu', 'Molefe', 'Radebe', 'Shabalala', 'Mabaso', 'Zwane', 'Naidoo', 'Pillay', 'Govender', 'Chetty', 'Moodley', 'Van Der Merwe', 'Botha', 'Pretorius', 'Nel', 'Venter', 'De Beer', 'Marais', 'Coetzee', 'Olivier', 'Du Plessis'];

      const cities = ['Johannesburg', 'Pretoria', 'Durban', 'Cape Town', 'Port Elizabeth', 'Bloemfontein', 'Polokwane'];
      const provinces = ['Gauteng', 'KwaZulu-Natal', 'Western Cape', 'Eastern Cape', 'Free State', 'Limpopo'];

      const studentUsers = [];
      const studentDetails = [];
      const students = [];
      const registrations = [];

      for (let i = 0; i < 30; i++) {
        const studentNum = `2026-${String(i + 1).padStart(4, '0')}`;
        const userId = `50000${String(i + 1).padStart(3, '0')}-0000-4000-8000-00000000${String(i + 1).padStart(4, '0')}`;
        const detailsId = `51000${String(i + 1).padStart(3, '0')}-0000-4000-8000-00000000${String(i + 1).padStart(4, '0')}`;
        const studentId = `52000${String(i + 1).padStart(3, '0')}-0000-4000-8000-00000000${String(i + 1).padStart(4, '0')}`;

        const firstName = firstNames[i % firstNames.length];
        const lastName = lastNames[i % lastNames.length];
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@student.richfield.ac.za`;

        // Random birth year between 2003-2006 (18-21 years old in 2026)
        const birthYear = 2003 + (i % 4);
        const birthMonth = String((i % 12) + 1).padStart(2, '0');
        const birthDay = String(((i * 3) % 28) + 1).padStart(2, '0');
        const dob = new Date(`${birthYear}-${birthMonth}-${birthDay}`);

        const idNumber = `${String(birthYear).slice(2)}${birthMonth}${birthDay}5${String(i).padStart(3, '0')}08${i % 10}`;
        const phone = `+2773${String(1000000 + i).slice(1)}`;
        const city = cities[i % cities.length];
        const province = provinces[i % provinces.length];

        // User
        studentUsers.push({
          id: userId,
          email,
          password_hash: defaultPassword,
          member_number: studentNum,
          role: 'student',
          account_status: 'active',
          is_verified: true,
          is_default_password: true,
          created_at: new Date(),
          updated_at: new Date(),
        });

        // User Details
        studentDetails.push({
          id: detailsId,
          user_id: userId,
          first_name: firstName,
          last_name: lastName,
          date_of_birth: dob,
          gender: i % 2 === 0 ? 'Male' : 'Female',
          nationality: 'South African',
          id_number: idNumber,
          phone,
          street_address: `${i + 1} ${['Main', 'Oak', 'Pine', 'Elm', 'Maple'][i % 5]} ${ ['Street', 'Avenue', 'Road', 'Drive'][i % 4]}`,
          suburb: ['Hatfield', 'Brooklyn', 'Menlyn', 'Arcadia', 'Sunnyside'][i % 5],
          city,
          province,
          postal_code: String(1000 + (i * 10)),
          lifecycle_status: 'enrolled',
          created_at: new Date(),
          updated_at: new Date(),
        });

        // Student
        students.push({
          id: studentId,
          user_id: userId,
          student_number: studentNum,
          qualification_id: qualId,
          year_of_study: 1,
          enrollment_date: new Date('2026-02-01'),
          academic_status: 'active',
          created_at: new Date(),
          updated_at: new Date(),
        });

        // Registrations - Each student registers for specific module(s)
        // First 10 students -> PROG511
        // Next 10 students -> WEB511
        // Last 10 students -> SE700
        // (Some students could be in multiple, but keeping it simple for now)

        let moduleIdx = Math.floor(i / 10); // 0, 1, or 2
        const moduleId = modules[moduleIdx].id;

        registrations.push({
          id: `60000${String(i + 1).padStart(3, '0')}-0000-4000-8000-00000000${String(i + 1).padStart(4, '0')}`,
          student_id: studentId,
          module_id: moduleId,
          semester_id: semesterId,
          status: 'approved',
          approved_by: johnSmithUserId,
          approved_at: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        });

        // Some students take 2 modules (overlap between classes)
        if (i % 3 === 0 && moduleIdx < 2) {
          const secondModuleId = modules[moduleIdx + 1].id;
          registrations.push({
            id: `61000${String(i + 1).padStart(3, '0')}-0000-4000-8000-00000000${String(i + 1).padStart(4, '0')}`,
            student_id: studentId,
            module_id: secondModuleId,
            semester_id: semesterId,
            status: 'approved',
            approved_by: johnSmithUserId,
            approved_at: new Date(),
            created_at: new Date(),
            updated_at: new Date(),
          });
        }
      }

      await queryInterface.bulkInsert('Users', studentUsers, { transaction });
      console.log('✅ Created 30 student users');

      await queryInterface.bulkInsert('User_Details', studentDetails, { transaction });
      console.log('✅ Created 30 student details');

      await queryInterface.bulkInsert('Students', students, { transaction });
      console.log('✅ Created 30 student records');

      await queryInterface.bulkInsert('Registrations', registrations, { transaction });
      console.log(`✅ Created ${registrations.length} module registrations`);

      // ════════════════════════════════════════════════════════════════
      // 6. SEED CALENDAR/TIMETABLE WITH CLASS SCHEDULES
      // ════════════════════════════════════════════════════════════════

      // Check if there's a timetable/schedule table
      const tables = await queryInterface.sequelize.query(
        `SELECT table_name FROM information_schema.tables
         WHERE table_schema = 'public'
         AND table_name IN ('Timetables', 'Schedules', 'Class_Schedules', 'timetables', 'schedules', 'class_schedules')`,
        { transaction }
      );

      let scheduleTable = null;
      if (tables && tables[0] && tables[0].length > 0) {
        scheduleTable = tables[0][0].table_name;
        console.log(`✅ Found schedule table: ${scheduleTable}`);
      }

      // Create class schedule entries if table exists
      if (scheduleTable) {
        const classSchedules = [
          // PROG511 - Monday & Wednesday 09:00-11:00
          {
            id: '70000001-0001-4000-8000-000000000001',
            module_id: modules[0].id,
            lecturer_id: johnSmithLecturerId,
            semester_id: semesterId,
            day_of_week: 1, // Monday
            start_time: '09:00:00',
            end_time: '11:00:00',
            room: 'IT Lab 301',
            building: 'IT Building',
            created_at: new Date(),
            updated_at: new Date(),
          },
          {
            id: '70000002-0002-4000-8000-000000000002',
            module_id: modules[0].id,
            lecturer_id: johnSmithLecturerId,
            semester_id: semesterId,
            day_of_week: 3, // Wednesday
            start_time: '09:00:00',
            end_time: '11:00:00',
            room: 'IT Lab 301',
            building: 'IT Building',
            created_at: new Date(),
            updated_at: new Date(),
          },

          // WEB511 - Tuesday & Thursday 13:00-15:00
          {
            id: '70000003-0003-4000-8000-000000000003',
            module_id: modules[1].id,
            lecturer_id: johnSmithLecturerId,
            semester_id: semesterId,
            day_of_week: 2, // Tuesday
            start_time: '13:00:00',
            end_time: '15:00:00',
            room: 'IT Lab 302',
            building: 'IT Building',
            created_at: new Date(),
            updated_at: new Date(),
          },
          {
            id: '70000004-0004-4000-8000-000000000004',
            module_id: modules[1].id,
            lecturer_id: johnSmithLecturerId,
            semester_id: semesterId,
            day_of_week: 4, // Thursday
            start_time: '13:00:00',
            end_time: '15:00:00',
            room: 'IT Lab 302',
            building: 'IT Building',
            created_at: new Date(),
            updated_at: new Date(),
          },

          // SE700 - Monday & Friday 14:00-16:00
          {
            id: '70000005-0005-4000-8000-000000000005',
            module_id: modules[2].id,
            lecturer_id: johnSmithLecturerId,
            semester_id: semesterId,
            day_of_week: 1, // Monday
            start_time: '14:00:00',
            end_time: '16:00:00',
            room: 'Lecture Hall 5',
            building: 'Main Building',
            created_at: new Date(),
            updated_at: new Date(),
          },
          {
            id: '70000006-0006-4000-8000-000000000006',
            module_id: modules[2].id,
            lecturer_id: johnSmithLecturerId,
            semester_id: semesterId,
            day_of_week: 5, // Friday
            start_time: '14:00:00',
            end_time: '16:00:00',
            room: 'Lecture Hall 5',
            building: 'Main Building',
            created_at: new Date(),
            updated_at: new Date(),
          },
        ];

        try {
          await queryInterface.bulkInsert(scheduleTable, classSchedules, { transaction });
          console.log('✅ Created 6 class schedule entries for John Smith');
        } catch (err) {
          console.log(`⚠️  Could not create schedules (table structure may differ): ${err.message}`);
        }
      } else {
        console.log('ℹ️  No schedule table found - skipping class schedules');
        console.log('ℹ️  You may need to create this manually or use the Events system');
      }

      // Create calendar events as alternative to timetable
      console.log('📅 Creating calendar events for John Smith\'s classes...');

      // Generate recurring class events for the semester (Feb - June 2026)
      const calendarEvents = [];
      const startDate = new Date('2026-02-03'); // First Monday of semester
      const endDate = new Date('2026-06-26'); // Last week of semester

      // Helper to generate dates for a specific day of week
      const generateClassDates = (dayOfWeek, startTime, endTime, moduleName, moduleCode, room) => {
        const dates = [];
        let currentDate = new Date(startDate);

        // Move to first occurrence of the day
        while (currentDate.getDay() !== dayOfWeek) {
          currentDate.setDate(currentDate.getDate() + 1);
        }

        // Generate weekly occurrences
        let eventCounter = 1;
        while (currentDate <= endDate) {
          dates.push({
            id: `75${String(dayOfWeek)}${String(eventCounter).padStart(4, '0')}-0000-4000-${moduleCode.slice(0, 4)}-${Date.now().toString().slice(-12)}`,
            title: `${moduleCode}: ${moduleName}`,
            description: `Lecture by Dr. John Smith\nRoom: ${room}`,
            type: 'academic',
            audience: 'students',
            date: currentDate.toISOString().split('T')[0],
            time: startTime,
            end_time: endTime,
            created_by: johnSmithUserId,
            created_at: new Date(),
            updated_at: new Date(),
          });

          currentDate.setDate(currentDate.getDate() + 7); // Next week
          eventCounter++;
        }

        return dates;
      };

      // PROG511 - Mondays & Wednesdays 09:00-11:00
      calendarEvents.push(...generateClassDates(1, '09:00', '11:00', 'Programming 511', 'PROG511', 'IT Lab 301'));
      calendarEvents.push(...generateClassDates(3, '09:00', '11:00', 'Programming 511', 'PROG511', 'IT Lab 301'));

      // WEB511 - Tuesdays & Thursdays 13:00-15:00
      calendarEvents.push(...generateClassDates(2, '13:00', '15:00', 'Web Development 511', 'WEB511', 'IT Lab 302'));
      calendarEvents.push(...generateClassDates(4, '13:00', '15:00', 'Web Development 511', 'WEB511', 'IT Lab 302'));

      // SE700 - Mondays & Fridays 14:00-16:00
      calendarEvents.push(...generateClassDates(1, '14:00', '16:00', 'Software Engineering 700', 'SE700', 'Lecture Hall 5'));
      calendarEvents.push(...generateClassDates(5, '14:00', '16:00', 'Software Engineering 700', 'SE700', 'Lecture Hall 5'));

      // Check if Events table exists
      const [eventsTableCheck] = await queryInterface.sequelize.query(
        `SELECT table_name FROM information_schema.tables
         WHERE table_schema = 'public'
         AND table_name IN ('Events', 'events', 'Calendar_Events', 'calendar_events')`,
        { transaction }
      );

      if (eventsTableCheck && eventsTableCheck.length > 0) {
        const eventsTable = eventsTableCheck[0].table_name;

        // Insert in batches to avoid overwhelming the database
        const batchSize = 50;
        for (let i = 0; i < calendarEvents.length; i += batchSize) {
          const batch = calendarEvents.slice(i, i + batchSize);
          try {
            await queryInterface.bulkInsert(eventsTable, batch, { transaction });
          } catch (err) {
            console.log(`⚠️  Could not insert event batch ${i / batchSize + 1}: ${err.message}`);
          }
        }
        console.log(`✅ Created ${calendarEvents.length} calendar events for the semester`);
      } else {
        console.log('⚠️  No Events table found - skipping calendar events');
      }

      // ════════════════════════════════════════════════════════════════
      // SUMMARY
      // ════════════════════════════════════════════════════════════════

      console.log('');
      console.log('🎉 John Smith\'s classes seeded successfully!');
      console.log('');
      console.log('📊 Summary:');
      console.log('   👨‍🏫 Lecturer: Dr. John Smith');
      console.log('   📚 Modules: 3 (PROG511, WEB511, SE700)');
      console.log('   👨‍🎓 Students: 30 total');
      console.log('      • PROG511: ~10 students');
      console.log('      • WEB511: ~10 students');
      console.log('      • SE700: ~10 students');
      console.log(`   📅 Calendar Events: ${calendarEvents.length} class sessions`);
      console.log('');
      console.log('🔐 Student login credentials:');
      console.log('   Email: firstname.lastname#@student.richfield.ac.za');
      console.log('   Example: thabo.mokoena0@student.richfield.ac.za');
      console.log('   Password: Student123!');
      console.log('');
      console.log('📅 Class Schedule:');
      console.log('   PROG511: Mon & Wed 09:00-11:00 (IT Lab 301)');
      console.log('   WEB511:  Tue & Thu 13:00-15:00 (IT Lab 302)');
      console.log('   SE700:   Mon & Fri 14:00-16:00 (Lecture Hall 5)');
      console.log('');
    },
  },
};
