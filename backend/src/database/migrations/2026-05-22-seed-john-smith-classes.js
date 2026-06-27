/** @type {{ migration: { name: string, up: Function } }} */
module.exports = {
  migration: {
    name: "2026-05-22-seed-john-smith-classes",

    up: async (queryInterface, Sequelize, transaction) => {
      console.log(
        "🎓 Seeding John Smith's classes with students and schedules...",
      );

      const bcrypt = require("bcrypt");

      // Helper function to hash passwords
      const hashPassword = async (password) => {
        return await bcrypt.hash(password, 10);
      };

      const defaultPassword = await hashPassword("Password123!");

      // ════════════════════════════════════════════════════════════════
      // 1. FIND JOHN SMITH & ENSURE LECTURER RECORD EXISTS
      // ════════════════════════════════════════════════════════════════

      const [johnSmithUser] = await queryInterface.sequelize.query(
        `SELECT id, email FROM users
         WHERE email IN ('john.smith@eduhub.ac.za', 'john.smith@richfield.ac.za')
         ORDER BY CASE email WHEN 'john.smith@eduhub.ac.za' THEN 0 ELSE 1 END
         LIMIT 1`,
        { transaction },
      );

      if (!johnSmithUser || johnSmithUser.length === 0) {
        console.error(
          "❌ John Smith user not found. Please run the default accounts seed first.",
        );
        return;
      }

      const johnSmithUserId = johnSmithUser[0].id;

      let johnSmithLecturerId;
      const [existingLecturer] = await queryInterface.sequelize.query(
        `SELECT id FROM lecturers WHERE user_id = :userId LIMIT 1`,
        { replacements: { userId: johnSmithUserId }, transaction },
      );

      if (existingLecturer && existingLecturer.length > 0) {
        johnSmithLecturerId = existingLecturer[0].id;
      } else {
        johnSmithLecturerId = "32000001-0000-4000-8000-000000000001";
        await queryInterface.bulkInsert(
          "lecturers",
          [
            {
              id: johnSmithLecturerId,
              user_id: johnSmithUserId,
              employee_number: "2620000006",
              department: "Information Technology",
              title: "Dr.",
              specialization: "Software Engineering & Web Development",
              hire_date: new Date("2020-01-15"),
              created_at: new Date(),
              updated_at: new Date(),
            },
          ],
          { transaction },
        );
        console.log("✅ Created lecturer record for John Smith");
      }

      console.log(`✅ Found John Smith: Lecturer ID ${johnSmithLecturerId}`);

      // ════════════════════════════════════════════════════════════════
      // 2. GET OR CREATE 3 MODULES FOR JOHN SMITH
      // ════════════════════════════════════════════════════════════════

      // Find BSc IT qualification
      const [qualResult] = await queryInterface.sequelize.query(
        `SELECT id FROM qualifications WHERE code = 'BSC-IT' LIMIT 1`,
        { transaction },
      );

      let qualId;
      if (!qualResult || qualResult.length === 0) {
        console.log("Creating BSc IT qualification...");
        const newQualId = "11111111-1111-1111-1111-111111111111";
        await queryInterface.bulkInsert(
          "qualifications",
          [
            {
              id: newQualId,
              code: "BSC-IT",
              name: "Bachelor of Science in Information Technology",
              faculty: "Faculty of Information Technology",
              duration_years: 3,
              total_fee: 85000.0,
              is_active: true,
              created_at: new Date(),
              updated_at: new Date(),
            },
          ],
          { transaction },
        );
        qualId = newQualId;
      } else {
        qualId = qualResult[0].id;
      }

      // Define John Smith's 3 modules
      const modules = [
        {
          id: "10000001-0001-4000-8000-000000000001",
          qualification_id: qualId,
          code: "PROG511",
          name: "Programming 511",
          description:
            "Introduction to programming using Python and Java. Core concepts include variables, data types, control structures, functions, and object-oriented programming basics.",
          credits: 16,
          year: 1,
          semester: 1,
          prerequisites: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "10000002-0002-4000-8000-000000000002",
          qualification_id: qualId,
          code: "WEB511",
          name: "Web Development 511",
          description:
            "Web fundamentals covering HTML5, CSS3, JavaScript, responsive design, and modern web development practices.",
          credits: 12,
          year: 1,
          semester: 1,
          prerequisites: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "10000003-0003-4000-8000-000000000003",
          qualification_id: qualId,
          code: "SE700",
          name: "Software Engineering 700",
          description:
            "Software development lifecycle, Agile methodologies, version control, testing, and project management for software development.",
          credits: 16,
          year: 2,
          semester: 1,
          prerequisites: JSON.stringify(["PROG511"]),
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      // Insert modules (ignore if they already exist) and get actual IDs
      const actualModuleIds = [];
      for (const module of modules) {
        const [existing] = await queryInterface.sequelize.query(
          `SELECT id FROM modules WHERE code = :code LIMIT 1`,
          { replacements: { code: module.code }, transaction },
        );

        if (!existing || existing.length === 0) {
          await queryInterface.bulkInsert("modules", [module], { transaction });
          actualModuleIds.push({ code: module.code, id: module.id });
          console.log(`✅ Created module: ${module.code}`);
        } else {
          actualModuleIds.push({ code: module.code, id: existing[0].id });
          console.log(`ℹ️  Module ${module.code} already exists`);
        }
      }

      // Update modules array with actual IDs from database
      for (let i = 0; i < modules.length; i++) {
        const actual = actualModuleIds.find(m => m.code === modules[i].code);
        if (actual) {
          modules[i].id = actual.id;
        }
      }

      // ════════════════════════════════════════════════════════════════
      // 3. GET OR CREATE CURRENT SEMESTER
      // ════════════════════════════════════════════════════════════════

      const [semResult] = await queryInterface.sequelize.query(
        `SELECT id FROM semesters WHERE year = 2026 AND semester_number = 1 LIMIT 1`,
        { transaction },
      );

      let semesterId;
      if (!semResult || semResult.length === 0) {
        console.log("Creating 2026 Semester 1...");
        semesterId = "99000001-0000-4000-8000-000000000001";
        await queryInterface.bulkInsert(
          "semesters",
          [
            {
              id: semesterId,
              name: "2026 Semester 1",
              year: 2026,
              semester_number: 1,
              start_date: new Date("2026-02-01"),
              end_date: new Date("2026-06-30"),
              registration_open: true,
              registration_start_date: new Date("2025-11-01"),
              registration_end_date: new Date("2026-02-15"),
              add_drop_deadline: new Date("2026-03-15"),
              is_active: true,
              created_at: new Date(),
              updated_at: new Date(),
            },
          ],
          { transaction },
        );
      } else {
        semesterId = semResult[0].id;
      }
      console.log(`✅ Using Semester ID: ${semesterId}`);

      // ════════════════════════════════════════════════════════════════
      // 4. ASSIGN JOHN SMITH TO TEACH THESE 3 MODULES
      // ════════════════════════════════════════════════════════════════

      const moduleLecturerAssignments = modules.map((module, idx) => ({
        id: `80000001-000${idx + 1}-4000-8000-000000000001`,
        module_id: module.id,
        lecturer_id: johnSmithLecturerId,
        semester_id: semesterId,
        is_primary: true,
        created_at: new Date(),
        updated_at: new Date(),
      }));

      for (const assignment of moduleLecturerAssignments) {
        const [existing] = await queryInterface.sequelize.query(
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
          await queryInterface.bulkInsert("module_lecturers", [assignment], {
            transaction,
          });
        }
      }

      console.log("✅ Assigned John Smith to teach 3 modules");

      // ════════════════════════════════════════════════════════════════
      // 5. CREATE 10 BSc IT STUDENTS (incl. Thabo) & REGISTER FOR MODULES
      // ════════════════════════════════════════════════════════════════

      const cities = [
        "Johannesburg",
        "Pretoria",
        "Durban",
        "Cape Town",
        "Port Elizabeth",
        "Bloemfontein",
        "Polokwane",
      ];
      const provinces = [
        "Gauteng",
        "KwaZulu-Natal",
        "Western Cape",
        "Eastern Cape",
        "Free State",
        "Limpopo",
      ];

      // moduleIndexes: 0=PROG511, 1=WEB511, 2=SE700
      const studentDefs = [
        {
          email: "thabo.molefe@student.eduhub.ac.za",
          firstName: "Thabo",
          lastName: "Molefe",
          studentNumber: "2610000008",
          userId: "20000003-0000-4000-8000-000000000003",
          detailsId: "41000001-0000-4000-8000-000000000001",
          studentId: "42000001-0000-4000-8000-000000000001",
          dob: "2000-03-15",
          idNumber: "0003150001083",
          phone: "+27821234567",
          moduleIndexes: [0, 1],
          skipUserCreate: true,
        },
        {
          email: "lerato.khumalo@student.eduhub.ac.za",
          firstName: "Lerato",
          lastName: "Khumalo",
          studentNumber: "2610000016",
          userId: "50000001-0001-4000-8000-000000000001",
          detailsId: "51000001-0001-4000-8000-000000000001",
          studentId: "52000001-0001-4000-8000-000000000001",
          dob: "2004-06-12",
          idNumber: "0406125002087",
          phone: "+27731000001",
          moduleIndexes: [0],
        },
        {
          email: "sipho.dlamini@student.eduhub.ac.za",
          firstName: "Sipho",
          lastName: "Dlamini",
          studentNumber: "2610000024",
          userId: "50000002-0002-4000-8000-000000000002",
          detailsId: "51000002-0002-4000-8000-000000000002",
          studentId: "52000002-0002-4000-8000-000000000002",
          dob: "2003-09-20",
          idNumber: "0309205003086",
          phone: "+27731000002",
          moduleIndexes: [0],
        },
        {
          email: "zanele.mahlangu@student.eduhub.ac.za",
          firstName: "Zanele",
          lastName: "Mahlangu",
          studentNumber: "2610000032",
          userId: "50000003-0003-4000-8000-000000000003",
          detailsId: "51000003-0003-4000-8000-000000000003",
          studentId: "52000003-0003-4000-8000-000000000003",
          dob: "2005-01-08",
          idNumber: "0501085004085",
          phone: "+27731000003",
          moduleIndexes: [0],
        },
        {
          email: "lungile.sithole@student.eduhub.ac.za",
          firstName: "Lungile",
          lastName: "Sithole",
          studentNumber: "2610000040",
          userId: "50000004-0004-4000-8000-000000000004",
          detailsId: "51000004-0004-4000-8000-000000000004",
          studentId: "52000004-0004-4000-8000-000000000004",
          dob: "2004-11-25",
          idNumber: "0411255005084",
          phone: "+27731000004",
          moduleIndexes: [1],
        },
        {
          email: "nomsa.zulu@student.eduhub.ac.za",
          firstName: "Nomsa",
          lastName: "Zulu",
          studentNumber: "2610000057",
          userId: "50000005-0005-4000-8000-000000000005",
          detailsId: "51000005-0005-4000-8000-000000000005",
          studentId: "52000005-0005-4000-8000-000000000005",
          dob: "2003-04-14",
          idNumber: "0304145006083",
          phone: "+27731000005",
          moduleIndexes: [1],
        },
        {
          email: "bongani.mthembu@student.eduhub.ac.za",
          firstName: "Bongani",
          lastName: "Mthembu",
          studentNumber: "2610000065",
          userId: "50000006-0006-4000-8000-000000000006",
          detailsId: "51000006-0006-4000-8000-000000000006",
          studentId: "52000006-0006-4000-8000-000000000006",
          dob: "2005-07-03",
          idNumber: "0507035007082",
          phone: "+27731000006",
          moduleIndexes: [1],
        },
        {
          email: "thandiwe.ngcobo@student.eduhub.ac.za",
          firstName: "Thandiwe",
          lastName: "Ngcobo",
          studentNumber: "2610000073",
          userId: "50000007-0007-4000-8000-000000000007",
          detailsId: "51000007-0007-4000-8000-000000000007",
          studentId: "52000007-0007-4000-8000-000000000007",
          dob: "2003-12-18",
          idNumber: "0312185008081",
          phone: "+27731000007",
          moduleIndexes: [2],
        },
        {
          email: "mandla.ndlovu@student.eduhub.ac.za",
          firstName: "Mandla",
          lastName: "Ndlovu",
          studentNumber: "2610000081",
          userId: "50000008-0008-4000-8000-000000000008",
          detailsId: "51000008-0008-4000-8000-000000000008",
          studentId: "52000008-0008-4000-8000-000000000008",
          dob: "2004-02-27",
          idNumber: "0402275009080",
          phone: "+27731000008",
          moduleIndexes: [2],
        },
        {
          email: "precious.radebe@student.eduhub.ac.za",
          firstName: "Precious",
          lastName: "Radebe",
          studentNumber: "2610000099",
          userId: "50000009-0009-4000-8000-000000000009",
          detailsId: "51000009-0009-4000-8000-000000000009",
          studentId: "52000009-0009-4000-8000-000000000009",
          dob: "2005-08-09",
          idNumber: "0508095010089",
          phone: "+27731000009",
          moduleIndexes: [2],
        },
      ];

      let studentsCreated = 0;
      let registrationsCreated = 0;

      for (let i = 0; i < studentDefs.length; i++) {
        const def = studentDefs[i];
        const city = cities[i % cities.length];
        const province = provinces[i % provinces.length];

        if (!def.skipUserCreate) {
          const [existingUser] = await queryInterface.sequelize.query(
            `SELECT id FROM users WHERE email = :email LIMIT 1`,
            { replacements: { email: def.email }, transaction },
          );

          if (!existingUser || existingUser.length === 0) {
            await queryInterface.bulkInsert(
              "users",
              [
                {
                  id: def.userId,
                  email: def.email,
                  password_hash: defaultPassword,
                  member_number: def.studentNumber,
                  role: "student",
                  account_status: "active",
                  is_verified: true,
                  is_default_password: true,
                  created_at: new Date(),
                  updated_at: new Date(),
                },
              ],
              { transaction },
            );

            await queryInterface.bulkInsert(
              "user_details",
              [
                {
                  id: def.detailsId,
                  user_id: def.userId,
                  first_name: def.firstName,
                  last_name: def.lastName,
                  date_of_birth: new Date(def.dob),
                  gender: i % 2 === 0 ? "Male" : "Female",
                  nationality: "South African",
                  id_number: def.idNumber,
                  phone: def.phone,
                  street_address: `${i + 1} Main Street`,
                  suburb: [
                    "Hatfield",
                    "Brooklyn",
                    "Menlyn",
                    "Arcadia",
                    "Sunnyside",
                  ][i % 5],
                  city,
                  province,
                  postal_code: String(1000 + i * 10),
                  lifecycle_status: "enrolled",
                  created_at: new Date(),
                  updated_at: new Date(),
                },
              ],
              { transaction },
            );
          }
        }

        const [existingStudent] = await queryInterface.sequelize.query(
          `SELECT id FROM students WHERE user_id = :userId LIMIT 1`,
          { replacements: { userId: def.userId }, transaction },
        );

        let studentId = def.studentId;
        if (existingStudent && existingStudent.length > 0) {
          studentId = existingStudent[0].id;
        } else {
          await queryInterface.bulkInsert(
            "students",
            [
              {
                id: def.studentId,
                user_id: def.userId,
                student_number: def.studentNumber,
                qualification_id: qualId,
                year_of_study: def.moduleIndexes.includes(2) ? 2 : 1,
                enrollment_date: new Date("2026-02-01"),
                academic_status: "active",
                created_at: new Date(),
                updated_at: new Date(),
              },
            ],
            { transaction },
          );
          studentsCreated++;
        }

        for (let m = 0; m < def.moduleIndexes.length; m++) {
          const moduleIdx = def.moduleIndexes[m];
          const moduleId = modules[moduleIdx].id;
          const regId = `60000${String(i + 1).padStart(3, "0")}-${String(m + 1).padStart(4, "0")}-4000-8000-000000000001`;

          const [existingReg] = await queryInterface.sequelize.query(
            `SELECT id FROM registrations
             WHERE student_id = :studentId AND module_id = :moduleId AND semester_id = :semesterId
             LIMIT 1`,
            {
              replacements: { studentId, moduleId, semesterId },
              transaction,
            },
          );

          if (!existingReg || existingReg.length === 0) {
            await queryInterface.bulkInsert(
              "registrations",
              [
                {
                  id: regId,
                  student_id: studentId,
                  module_id: moduleId,
                  semester_id: semesterId,
                  status: "approved",
                  approved_by: johnSmithUserId,
                  approved_at: new Date(),
                  created_at: new Date(),
                  updated_at: new Date(),
                },
              ],
              { transaction },
            );
            registrationsCreated++;
          }
        }
      }

      console.log(
        `✅ Ensured ${studentDefs.length} BSc IT students (${studentsCreated} new student records)`,
      );
      console.log(`✅ Created ${registrationsCreated} module registrations`);

      // ════════════════════════════════════════════════════════════════
      // 6. SEED CALENDAR/TIMETABLE WITH CLASS SCHEDULES
      // ════════════════════════════════════════════════════════════════

      // Check if there's a timetable/schedule table
      const tables = await queryInterface.sequelize.query(
        `SELECT table_name FROM information_schema.tables
         WHERE table_schema = 'public'
         AND table_name IN ('Timetables', 'Schedules', 'Class_Schedules', 'timetables', 'schedules', 'class_schedules')`,
        { transaction },
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
            id: "70000001-0001-4000-8000-000000000001",
            module_id: modules[0].id,
            lecturer_id: johnSmithLecturerId,
            semester_id: semesterId,
            day_of_week: 1, // Monday
            start_time: "09:00:00",
            end_time: "11:00:00",
            room: "IT Lab 301",
            building: "IT Building",
            created_at: new Date(),
            updated_at: new Date(),
          },
          {
            id: "70000002-0002-4000-8000-000000000002",
            module_id: modules[0].id,
            lecturer_id: johnSmithLecturerId,
            semester_id: semesterId,
            day_of_week: 3, // Wednesday
            start_time: "09:00:00",
            end_time: "11:00:00",
            room: "IT Lab 301",
            building: "IT Building",
            created_at: new Date(),
            updated_at: new Date(),
          },

          // WEB511 - Tuesday & Thursday 13:00-15:00
          {
            id: "70000003-0003-4000-8000-000000000003",
            module_id: modules[1].id,
            lecturer_id: johnSmithLecturerId,
            semester_id: semesterId,
            day_of_week: 2, // Tuesday
            start_time: "13:00:00",
            end_time: "15:00:00",
            room: "IT Lab 302",
            building: "IT Building",
            created_at: new Date(),
            updated_at: new Date(),
          },
          {
            id: "70000004-0004-4000-8000-000000000004",
            module_id: modules[1].id,
            lecturer_id: johnSmithLecturerId,
            semester_id: semesterId,
            day_of_week: 4, // Thursday
            start_time: "13:00:00",
            end_time: "15:00:00",
            room: "IT Lab 302",
            building: "IT Building",
            created_at: new Date(),
            updated_at: new Date(),
          },

          // SE700 - Monday & Friday 14:00-16:00
          {
            id: "70000005-0005-4000-8000-000000000005",
            module_id: modules[2].id,
            lecturer_id: johnSmithLecturerId,
            semester_id: semesterId,
            day_of_week: 1, // Monday
            start_time: "14:00:00",
            end_time: "16:00:00",
            room: "Lecture Hall 5",
            building: "Main Building",
            created_at: new Date(),
            updated_at: new Date(),
          },
          {
            id: "70000006-0006-4000-8000-000000000006",
            module_id: modules[2].id,
            lecturer_id: johnSmithLecturerId,
            semester_id: semesterId,
            day_of_week: 5, // Friday
            start_time: "14:00:00",
            end_time: "16:00:00",
            room: "Lecture Hall 5",
            building: "Main Building",
            created_at: new Date(),
            updated_at: new Date(),
          },
        ];

        try {
          await queryInterface.bulkInsert(scheduleTable, classSchedules, {
            transaction,
          });
          console.log("✅ Created 6 class schedule entries for John Smith");
        } catch (err) {
          console.log(
            `⚠️  Could not create schedules (table structure may differ): ${err.message}`,
          );
        }
      } else {
        console.log("ℹ️  No schedule table found - skipping class schedules");
        console.log(
          "ℹ️  You may need to create this manually or use the Events system",
        );
      }

      // Create calendar events as alternative to timetable
      console.log("📅 Creating calendar events for John Smith's classes...");

      // Generate recurring class events for the semester (Feb - June 2026)
      const calendarEvents = [];
      const startDate = new Date("2026-02-03"); // First Monday of semester
      const endDate = new Date("2026-06-26"); // Last week of semester

      // Helper to generate dates for a specific day of week
      const generateClassDates = (
        dayOfWeek,
        startTime,
        endTime,
        moduleName,
        moduleCode,
        room,
      ) => {
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
            id: `75${String(dayOfWeek)}${String(eventCounter).padStart(4, "0")}-0000-4000-${moduleCode.slice(0, 4)}-${Date.now().toString().slice(-12)}`,
            title: `${moduleCode}: ${moduleName}`,
            description: `Lecture by Dr. John Smith\nRoom: ${room}`,
            type: "academic",
            audience: "students",
            date: currentDate.toISOString().split("T")[0],
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
      calendarEvents.push(
        ...generateClassDates(
          1,
          "09:00",
          "11:00",
          "Programming 511",
          "PROG511",
          "IT Lab 301",
        ),
      );
      calendarEvents.push(
        ...generateClassDates(
          3,
          "09:00",
          "11:00",
          "Programming 511",
          "PROG511",
          "IT Lab 301",
        ),
      );

      // WEB511 - Tuesdays & Thursdays 13:00-15:00
      calendarEvents.push(
        ...generateClassDates(
          2,
          "13:00",
          "15:00",
          "Web Development 511",
          "WEB511",
          "IT Lab 302",
        ),
      );
      calendarEvents.push(
        ...generateClassDates(
          4,
          "13:00",
          "15:00",
          "Web Development 511",
          "WEB511",
          "IT Lab 302",
        ),
      );

      // SE700 - Mondays & Fridays 14:00-16:00
      calendarEvents.push(
        ...generateClassDates(
          1,
          "14:00",
          "16:00",
          "Software Engineering 700",
          "SE700",
          "Lecture Hall 5",
        ),
      );
      calendarEvents.push(
        ...generateClassDates(
          5,
          "14:00",
          "16:00",
          "Software Engineering 700",
          "SE700",
          "Lecture Hall 5",
        ),
      );

      // Check if Events table exists
      const [eventsTableCheck] = await queryInterface.sequelize.query(
        `SELECT table_name FROM information_schema.tables
         WHERE table_schema = 'public'
         AND table_name IN ('Events', 'events', 'Calendar_Events', 'calendar_events')`,
        { transaction },
      );

      if (eventsTableCheck && eventsTableCheck.length > 0) {
        const eventsTable = eventsTableCheck[0].table_name;

        // Insert in batches to avoid overwhelming the database
        const batchSize = 50;
        for (let i = 0; i < calendarEvents.length; i += batchSize) {
          const batch = calendarEvents.slice(i, i + batchSize);
          try {
            await queryInterface.bulkInsert(eventsTable, batch, {
              transaction,
            });
          } catch (err) {
            console.log(
              `⚠️  Could not insert event batch ${i / batchSize + 1}: ${err.message}`,
            );
          }
        }
        console.log(
          `✅ Created ${calendarEvents.length} calendar events for the semester`,
        );
      } else {
        console.log("⚠️  No Events table found - skipping calendar events");
      }

      // ════════════════════════════════════════════════════════════════
      // SUMMARY
      // ════════════════════════════════════════════════════════════════

      console.log("");
      console.log("🎉 John Smith's classes seeded successfully!");
      console.log("");
      console.log("📊 Summary:");
      console.log("   👨‍🏫 Lecturer: Dr. John Smith");
      console.log("   📚 Modules: 3 (PROG511, WEB511, SE700)");
      console.log("   👨‍🎓 Students: 10 total (BSc IT)");
      console.log("      • PROG511: Thabo, Lerato, Sipho, Zanele");
      console.log("      • WEB511:  Thabo, Lungile, Nomsa, Bongani");
      console.log("      • SE700:   Thandiwe, Mandla, Precious");
      console.log(
        `   📅 Calendar Events: ${calendarEvents.length} class sessions`,
      );
      console.log("");
      console.log("🔐 Student login credentials:");
      console.log(
        "   Demo account: thabo.molefe@student.eduhub.ac.za / Password123!",
      );
      console.log(
        "   Other students: firstname.lastname@student.eduhub.ac.za / Password123!",
      );
      console.log("");
      console.log("📅 Class Schedule:");
      console.log("   PROG511: Mon & Wed 09:00-11:00 (IT Lab 301)");
      console.log("   WEB511:  Tue & Thu 13:00-15:00 (IT Lab 302)");
      console.log("   SE700:   Mon & Fri 14:00-16:00 (Lecture Hall 5)");
      console.log("");
    },
  },
};
