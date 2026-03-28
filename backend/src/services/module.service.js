/**
 * Module Service
 * Handles business logic for module operations
 */

const sequelize = require('../config/database');

class ModuleService {
  /**
   * Get all modules with optional filtering
   */
  async getAllModules({ qualification_id, level, active_only = false } = {}) {
    const bindings = [];
    const whereClauses = [];
    let bindIndex = 1;

    if (qualification_id) {
      whereClauses.push(`m.qualification_id = $${bindIndex}`);
      bindings.push(qualification_id);
      bindIndex++;
    }

    if (level) {
      whereClauses.push(`m.level = $${bindIndex}`);
      bindings.push(level);
      bindIndex++;
    }

    if (active_only) {
      whereClauses.push('m.is_active = true');
    }

    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const modules = await sequelize.query(
      `SELECT m.module_id, m.code, m.name, m.level, m.credits, m.description,
              m.is_active, m.qualification_id,
              q.name as qualification_name, q.code as qualification_code,
              COUNT(DISTINCT r.student_id)::int as student_count,
              COUNT(DISTINCT ml.lecturer_id)::int as lecturer_count
       FROM modules m
       LEFT JOIN qualifications q ON m.qualification_id = q.qualification_id
       LEFT JOIN registrations r ON m.module_id = r.module_id
       LEFT JOIN module_lecturers ml ON m.module_id = ml.module_id
       ${whereClause}
       GROUP BY m.module_id, q.name, q.code
       ORDER BY m.level ASC, m.code ASC`,
      {
        bind: bindings,
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return modules;
  }

  /**
   * Get module by ID
   */
  async getModuleById(moduleId) {
    const [modules] = await sequelize.query(
      `SELECT m.module_id, m.code, m.name, m.level, m.credits, m.description,
              m.is_active, m.qualification_id, m.created_at, m.updated_at,
              q.name as qualification_name, q.code as qualification_code
       FROM modules m
       LEFT JOIN qualifications q ON m.qualification_id = q.qualification_id
       WHERE m.module_id = $1`,
      {
        bind: [moduleId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const module = modules[0];

    if (!module) {
      throw { statusCode: 404, message: 'Module not found' };
    }

    // Get lecturers teaching this module
    const lecturers = await sequelize.query(
      `SELECT l.lecturer_id, l.staff_number, l.department,
              ud.first_name, ud.last_name, u.email,
              ml.assigned_at
       FROM module_lecturers ml
       INNER JOIN lecturers l ON ml.lecturer_id = l.lecturer_id
       INNER JOIN users u ON l.user_id = u.user_id
       LEFT JOIN user_details ud ON u.user_id = ud.user_id
       WHERE ml.module_id = $1
       ORDER BY ml.assigned_at DESC`,
      {
        bind: [moduleId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return {
      ...module,
      lecturers,
    };
  }

  /**
   * Get students enrolled in a module for a specific semester
   */
  async getModuleStudents(moduleId, semesterId = null) {
    const bindings = [moduleId];
    let semesterFilter = '';

    if (semesterId) {
      semesterFilter = 'AND r.semester_id = $2';
      bindings.push(semesterId);
    }

    const students = await sequelize.query(
      `SELECT s.student_id, s.student_number,
              ud.first_name, ud.last_name, u.email,
              r.registration_id, r.status, r.registration_date, r.grade, r.credits_earned,
              sem.name as semester_name, sem.year as semester_year
       FROM registrations r
       INNER JOIN students s ON r.student_id = s.student_id
       INNER JOIN users u ON s.user_id = u.user_id
       LEFT JOIN user_details ud ON u.user_id = ud.user_id
       LEFT JOIN semesters sem ON r.semester_id = sem.semester_id
       WHERE r.module_id = $1 ${semesterFilter}
       ORDER BY s.student_number ASC`,
      {
        bind: bindings,
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return students;
  }
}

module.exports = new ModuleService();
