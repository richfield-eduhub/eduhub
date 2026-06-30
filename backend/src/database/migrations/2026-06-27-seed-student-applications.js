module.exports = {
  migration: {
    name: '2026-06-27-seed-student-applications',

    up: async (queryInterface, Sequelize, transaction) => {
      console.log('📝 Creating applications for existing students...');
      const sequelize = queryInterface.sequelize;

      // Get students who don't have applications yet
      const [studentsWithoutApps] = await sequelize.query(
        `SELECT s.id as student_id, s.user_id, s.student_number, s.qualification_id,
                u.email, ud.first_name, ud.last_name, ud.date_of_birth, ud.gender,
                ud.nationality, ud.id_number, ud.phone, ud.city, ud.province
         FROM students s
         JOIN users u ON s.user_id = u.id
         LEFT JOIN user_details ud ON u.id = ud.user_id
         LEFT JOIN applications a ON s.user_id = a.user_id
         WHERE a.id IS NULL AND u.role = 'student'`,
        { transaction }
      );

      if (studentsWithoutApps.length === 0) {
        console.log('✓ All students already have applications');
        return;
      }

      // Get the first available campus
      const [campuses] = await sequelize.query(
        `SELECT id FROM campuses LIMIT 1`,
        { transaction }
      );
      const campusId = campuses[0]?.id;

      console.log(`   Found ${studentsWithoutApps.length} students without applications`);

      for (const student of studentsWithoutApps) {
        console.log(`   Creating application for ${student.first_name} ${student.last_name}...`);

        // Strip "STUD-" prefix if present to fit varchar(10) constraint
        const studentNum = student.student_number?.replace(/^STUD-/, '') || student.student_number;

        await sequelize.query(
          `INSERT INTO applications (
             id, user_id, qualification_id, campus_id,
             first_name, last_name, email, phone,
             date_of_birth, gender, nationality, id_number,
             city, province,
             application_type, admission_for, study_year,
             status, student_number,
             submitted_at, approved_at, created_at, updated_at
           )
           VALUES (
             gen_random_uuid(), :userId, :qualId, :campusId,
             :firstName, :lastName, :email, :phone,
             :dob, :gender, :nationality, :idNum,
             :city, :province,
             'new', '1st Semester', 1,
             'approved', :studentNum,
             NOW() - INTERVAL '60 days',
             NOW() - INTERVAL '30 days',
             NOW() - INTERVAL '60 days',
             NOW()
           )`,
          {
            replacements: {
              userId: student.user_id,
              qualId: student.qualification_id,
              campusId: campusId,
              firstName: student.first_name || 'Student',
              lastName: student.last_name || 'User',
              email: student.email,
              phone: student.phone || '0000000000',
              dob: student.date_of_birth || '2000-01-01',
              gender: student.gender || 'Prefer not to say',
              nationality: student.nationality || 'South African',
              idNum: student.id_number,
              city: student.city || 'Johannesburg',
              province: student.province || 'Gauteng',
              studentNum: studentNum,
            },
            transaction,
          }
        );
      }

      console.log(`✅ Created ${studentsWithoutApps.length} applications for existing students`);
    },

    down: async (queryInterface, Sequelize, transaction) => {
      // Rollback: delete applications created by this migration
      await queryInterface.sequelize.query(
        `DELETE FROM applications
         WHERE status = 'approved'
         AND submitted_at IS NOT NULL
         AND student_number IN (
           SELECT student_number FROM students
           WHERE student_number LIKE 'STUD-2026-%'
         )`,
        { transaction }
      );
    },
  },
};
