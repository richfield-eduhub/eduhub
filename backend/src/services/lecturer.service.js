/**
 * Lecturer Service
 * Handles business logic for lecturer operations
 */

const sequelize = require('../config/database');

class LecturerService {
  /**
   * Get all lecturers with optional filtering
   */
  async getAllLecturers({ page = 1, limit = 20, campus_id, search } = {}) {
    const offset = (page - 1) * limit;
    const whereClauses = [];
    const replacements = {};

    if (campus_id) {
      whereClauses.push('l.campus_id = :campus_id');
      replacements.campus_id = campus_id;
    }

    if (search) {
      whereClauses.push(`(
        ud.first_name ILIKE :search OR
        ud.last_name ILIKE :search OR
        u.email ILIKE :search OR
        l.employee_number ILIKE :search
      )`);
      replacements.search = `%${search}%`;
    }

    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Get total count
    const [[{ total }]] = await sequelize.query(
      `SELECT COUNT(*)::int as total
       FROM lecturers l
       INNER JOIN users u ON l.user_id = u.id
       LEFT JOIN user_details ud ON u.id = ud.user_id
       ${whereClause}`,
      {
        replacements,
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // Get lecturers
    const lecturers = await sequelize.query(
      `SELECT
        l.id,
        l.employee_number,
        l.department,
        l.title,
        l.campus_id,
        c.code as campus_code,
        c.name as campus_name,
        u.email,
        u.member_number,
        u.account_status,
        ud.first_name,
        ud.last_name,
        ud.phone,
        l.created_at
       FROM lecturers l
       INNER JOIN users u ON l.user_id = u.id
       LEFT JOIN user_details ud ON u.id = ud.user_id
       LEFT JOIN campuses c ON l.campus_id = c.id
       ${whereClause}
       ORDER BY ud.last_name, ud.first_name
       LIMIT :limit OFFSET :offset`,
      {
        replacements: { ...replacements, limit, offset },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return {
      lecturers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get lecturer by ID
   */
  async getLecturerById(lecturerId) {
    const lecturers = await sequelize.query(
      `SELECT
        l.id,
        l.user_id,
        l.employee_number,
        l.department,
        l.title,
        l.campus_id,
        c.code as campus_code,
        c.name as campus_name,
        u.email,
        u.member_number,
        u.account_status,
        u.role,
        ud.first_name,
        ud.last_name,
        ud.phone,
        ud.id_number,
        ud.date_of_birth,
        ud.gender,
        ud.address,
        ud.city,
        ud.province,
        ud.postal_code,
        l.created_at,
        l.updated_at
       FROM lecturers l
       INNER JOIN users u ON l.user_id = u.id
       LEFT JOIN user_details ud ON u.id = ud.user_id
       LEFT JOIN campuses c ON l.campus_id = c.id
       WHERE l.id = :lecturerId`,
      {
        replacements: { lecturerId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const lecturer = lecturers[0];

    if (!lecturer) {
      throw { statusCode: 404, message: 'Lecturer not found' };
    }

    // Get module count
    const moduleStats = await sequelize.query(
      `SELECT COUNT(DISTINCT ml.module_id)::int as module_count
       FROM module_lecturers ml
       WHERE ml.lecturer_id = :lecturerId`,
      {
        replacements: { lecturerId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return {
      ...lecturer,
      module_count: moduleStats[0].module_count,
    };
  }

  /**
   * Get lecturer's assigned modules
   */
  async getLecturerModules(lecturerId, { semester_id, active_only = false } = {}) {
    const whereClauses = ['ml.lecturer_id = :lecturerId'];
    const replacements = { lecturerId };

    if (semester_id) {
      whereClauses.push('ml.semester_id = :semester_id');
      replacements.semester_id = semester_id;
    }

    if (active_only) {
      whereClauses.push('m.is_active = true');
    }

    const whereClause = `WHERE ${whereClauses.join(' AND ')}`;

    const modules = await sequelize.query(
      `SELECT
        m.id,
        m.code,
        m.name,
        m.year,
        m.semester,
        m.credits,
        m.description,
        m.is_active,
        q.id as qualification_id,
        q.code as qualification_code,
        q.name as qualification_name,
        s.id as semester_id,
        s.name as semester_name,
        s.start_date,
        s.end_date,
        ml.created_at as assigned_at,
        (SELECT COUNT(*)::int
         FROM registrations r
         WHERE r.module_id = m.id
         AND r.semester_id = ml.semester_id) as student_count
       FROM module_lecturers ml
       INNER JOIN modules m ON ml.module_id = m.id
       INNER JOIN qualifications q ON m.qualification_id = q.id
       LEFT JOIN semesters s ON ml.semester_id = s.id
       ${whereClause}
       ORDER BY m.year, m.semester, m.code`,
      {
        replacements,
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return modules;
  }

  /**
   * Get lecturer by user ID
   */
  async getLecturerByUserId(userId) {
    const lecturers = await sequelize.query(
      `SELECT
        l.id,
        l.user_id,
        l.employee_number,
        l.department,
        l.title,
        l.campus_id,
        c.code as campus_code,
        c.name as campus_name,
        u.email,
        u.member_number,
        u.account_status,
        ud.first_name,
        ud.last_name,
        ud.phone
       FROM lecturers l
       INNER JOIN users u ON l.user_id = u.id
       LEFT JOIN user_details ud ON u.id = ud.user_id
       LEFT JOIN campuses c ON l.campus_id = c.id
       WHERE l.user_id = :userId`,
      {
        replacements: { userId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!lecturers[0]) {
      throw { statusCode: 404, message: 'Lecturer profile not found' };
    }

    return lecturers[0];
  }

  /**
   * Update lecturer information (Admin only)
   */
  async updateLecturer(lecturerId, updates) {
    const allowedUpdates = ['department', 'title', 'campus_id', 'employee_number'];
    const setClauses = [];
    const replacements = { lecturerId };

    // Build SET clause dynamically
    Object.keys(updates).forEach((key) => {
      if (allowedUpdates.includes(key) && updates[key] !== undefined) {
        setClauses.push(`${key} = :${key}`);
        replacements[key] = updates[key];
      }
    });

    if (setClauses.length === 0) {
      throw { statusCode: 400, message: 'No valid fields to update' };
    }

    setClauses.push('updated_at = CURRENT_TIMESTAMP');

    await sequelize.query(
      `UPDATE lecturers
       SET ${setClauses.join(', ')}
       WHERE id = :lecturerId`,
      {
        replacements,
        type: sequelize.QueryTypes.UPDATE,
      }
    );

    // Return updated lecturer
    return this.getLecturerById(lecturerId);
  }
}

module.exports = new LecturerService();
