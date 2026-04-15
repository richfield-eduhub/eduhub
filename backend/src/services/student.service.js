/**
 * Student Service
 * Handles business logic for student operations
 */

const sequelize = require('../config/database');
const { PAGINATION, LIFECYCLE_STATUS, ACADEMIC_STATUS } = require('../utils/constants');

class StudentService {
  /**
   * Get all students with pagination and filtering
   */
  async getAllStudents({ page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT, status, search }) {
    const offset = (page - 1) * limit;
    const limitValue = Math.min(limit, PAGINATION.MAX_LIMIT);

    let whereClause = '';
    const bindings = [];
    let bindIndex = 1;

    if (status) {
      whereClause += ` AND s.lifecycle_status = $${bindIndex}`;
      bindings.push(status);
      bindIndex++;
    }

    if (search) {
      whereClause += ` AND (
        ud.first_name ILIKE $${bindIndex} OR
        ud.last_name ILIKE $${bindIndex} OR
        s.student_number ILIKE $${bindIndex} OR
        u.email ILIKE $${bindIndex}
      )`;
      bindings.push(`%${search}%`);
      bindIndex++;
    }

    // Get total count
    const [countResult] = await sequelize.query(
      `SELECT COUNT(*)::int as total
       FROM students s
       INNER JOIN users u ON s.user_id = u.user_id
       LEFT JOIN user_details ud ON u.user_id = ud.user_id
       WHERE 1=1 ${whereClause}`,
      {
        bind: bindings,
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // Get students
    bindings.push(limitValue, offset);
    const students = await sequelize.query(
      `SELECT s.student_id, s.user_id, s.student_number, s.qualification_id,
              s.lifecycle_status, s.academic_status, s.enrollment_date,
              u.email, u.account_status,
              ud.first_name, ud.last_name, ud.phone_number,
              q.name as qualification_name, q.code as qualification_code
       FROM students s
       INNER JOIN users u ON s.user_id = u.user_id
       LEFT JOIN user_details ud ON u.user_id = ud.user_id
       LEFT JOIN qualifications q ON s.qualification_id = q.qualification_id
       WHERE 1=1 ${whereClause}
       ORDER BY s.created_at DESC
       LIMIT $${bindIndex} OFFSET $${bindIndex + 1}`,
      {
        bind: bindings,
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return {
      students,
      pagination: {
        page,
        limit: limitValue,
        total: countResult.total,
      },
    };
  }

  /**
   * Get student by ID
   */
  async getStudentById(studentId) {
    const [students] = await sequelize.query(
      `SELECT s.student_id, s.user_id, s.student_number, s.qualification_id,
              s.lifecycle_status, s.academic_status, s.enrollment_date,
              s.expected_graduation, s.graduation_date, s.created_at, s.updated_at,
              u.email, u.account_status, u.email_verified,
              ud.first_name, ud.last_name, ud.date_of_birth, ud.phone_number,
              ud.id_number, ud.nationality, ud.gender, ud.home_address,
              ud.postal_address, ud.city, ud.province, ud.postal_code,
              q.name as qualification_name, q.code as qualification_code,
              q.level as qualification_level
       FROM students s
       INNER JOIN users u ON s.user_id = u.user_id
       LEFT JOIN user_details ud ON u.user_id = ud.user_id
       LEFT JOIN qualifications q ON s.qualification_id = q.qualification_id
       WHERE s.student_id = $1`,
      {
        bind: [studentId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const student = students[0];

    if (!student) {
      throw { statusCode: 404, message: 'Student not found' };
    }

    // Get emergency contacts
    const emergencyContacts = await sequelize.query(
      `SELECT contact_id, contact_name, relationship, phone_number, email,
              is_primary, created_at
       FROM emergency_contacts
       WHERE student_id = $1
       ORDER BY is_primary DESC, created_at ASC`,
      {
        bind: [studentId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return {
      ...student,
      emergency_contacts: emergencyContacts,
    };
  }

  /**
   * Get student by user ID
   */
  async getStudentByUserId(userId) {
    const [students] = await sequelize.query(
      `SELECT s.student_id, s.user_id, s.student_number, s.qualification_id,
              s.lifecycle_status, s.academic_status, s.enrollment_date,
              s.expected_graduation, s.graduation_date,
              ud.first_name, ud.last_name,
              q.name as qualification_name
       FROM students s
       LEFT JOIN user_details ud ON s.user_id = ud.user_id
       LEFT JOIN qualifications q ON s.qualification_id = q.qualification_id
       WHERE s.user_id = $1`,
      {
        bind: [userId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const student = students[0];

    if (!student) {
      throw { statusCode: 404, message: 'Student record not found' };
    }

    return student;
  }

  /**
   * Update student information
   */
  async updateStudent(studentId, updateData) {
    const transaction = await sequelize.transaction();

    try {
      const { lifecycle_status, academic_status, qualification_id, expected_graduation, graduation_date } = updateData;

      // Build update query dynamically
      const updates = [];
      const bindings = [];
      let bindIndex = 1;

      if (lifecycle_status !== undefined) {
        updates.push(`lifecycle_status = $${bindIndex}`);
        bindings.push(lifecycle_status);
        bindIndex++;
      }

      if (academic_status !== undefined) {
        updates.push(`academic_status = $${bindIndex}`);
        bindings.push(academic_status);
        bindIndex++;
      }

      if (qualification_id !== undefined) {
        updates.push(`qualification_id = $${bindIndex}`);
        bindings.push(qualification_id);
        bindIndex++;
      }

      if (expected_graduation !== undefined) {
        updates.push(`expected_graduation = $${bindIndex}`);
        bindings.push(expected_graduation);
        bindIndex++;
      }

      if (graduation_date !== undefined) {
        updates.push(`graduation_date = $${bindIndex}`);
        bindings.push(graduation_date);
        bindIndex++;
      }

      if (updates.length === 0) {
        await transaction.rollback();
        throw { statusCode: 400, message: 'No valid update fields provided' };
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      bindings.push(studentId);

      const [result] = await sequelize.query(
        `UPDATE students
         SET ${updates.join(', ')}
         WHERE student_id = $${bindIndex}
         RETURNING student_id, lifecycle_status, academic_status, qualification_id`,
        {
          bind: bindings,
          type: sequelize.QueryTypes.UPDATE,
          transaction,
        }
      );

      if (!result) {
        await transaction.rollback();
        throw { statusCode: 404, message: 'Student not found' };
      }

      await transaction.commit();

      return await this.getStudentById(studentId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Get student's registrations
   */
  async getStudentRegistrations(studentId) {
    const registrations = await sequelize.query(
      `SELECT r.registration_id, r.module_id, r.semester_id, r.status,
              r.registration_date, r.grade, r.credits_earned,
              m.code as module_code, m.name as module_name, m.credits as module_credits,
              s.name as semester_name, s.year as semester_year, s.start_date, s.end_date
       FROM registrations r
       INNER JOIN modules m ON r.module_id = m.module_id
       INNER JOIN semesters s ON r.semester_id = s.semester_id
       WHERE r.student_id = $1
       ORDER BY s.year DESC, s.start_date DESC, m.code ASC`,
      {
        bind: [studentId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return registrations;
  }
}

module.exports = new StudentService();
