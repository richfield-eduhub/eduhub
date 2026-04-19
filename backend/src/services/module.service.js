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
    const replacements = [];
    const whereClauses = [];

    if (qualification_id) {
      whereClauses.push('m.qualification_id = ?');
      replacements.push(qualification_id);
    }

    if (level) {
      whereClauses.push('m.year = ?');
      replacements.push(level);
    }

    if (active_only) {
      whereClauses.push('m.is_active = true');
    }

    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const modules = await sequelize.query(
      `SELECT m.id, m.code, m.name, m.year, m.semester, m.credits, m.description,
              m.is_active, m.qualification_id,
              q.name as qualification_name, q.code as qualification_code,
              COUNT(DISTINCT r.id)::int as student_count,
              COUNT(DISTINCT ml.id)::int as lecturer_count
       FROM modules m
       LEFT JOIN qualifications q ON m.qualification_id = q.id
       LEFT JOIN registrations r ON m.id = r.module_id
       LEFT JOIN module_lecturers ml ON m.id = ml.module_id
       ${whereClause}
       GROUP BY m.id, q.name, q.code
       ORDER BY m.year ASC, m.code ASC`,
      {
        replacements,
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return modules;
  }

  /**
   * Get modules for a qualification, optionally filtered by academic year and/or semester.
   * Omitted year or semester means no filter on that dimension (returns all for the qualification).
   */
  async getModulesByQualification(
    qualificationId,
    { year, semester, active_only = false } = {}
  ) {
    const [qualification] = await sequelize.query(
      `SELECT id FROM qualifications WHERE id = ?`,
      {
        replacements: [qualificationId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!qualification) {
      throw { statusCode: 404, message: 'Qualification not found' };
    }

    const replacements = [qualificationId];
    const whereClauses = ['m.qualification_id = ?'];

    if (year != null) {
      whereClauses.push('m.year = ?');
      replacements.push(year);
    }

    if (semester != null) {
      whereClauses.push('m.semester = ?');
      replacements.push(semester);
    }

    if (active_only) {
      whereClauses.push('m.is_active = true');
    }

    const whereClause = `WHERE ${whereClauses.join(' AND ')}`;

    const modules = await sequelize.query(
      `SELECT m.id, m.code, m.name, m.year, m.semester, m.credits, m.description,
              m.is_active, m.qualification_id,
              q.name as qualification_name, q.code as qualification_code,
              COUNT(DISTINCT r.id)::int as student_count,
              COUNT(DISTINCT ml.id)::int as lecturer_count
       FROM modules m
       LEFT JOIN qualifications q ON m.qualification_id = q.id
       LEFT JOIN registrations r ON m.id = r.module_id
       LEFT JOIN module_lecturers ml ON m.id = ml.module_id
       ${whereClause}
       GROUP BY m.id, q.name, q.code
       ORDER BY m.year ASC NULLS LAST, m.semester ASC NULLS LAST, m.code ASC`,
      {
        replacements,
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return modules;
  }

  /**
   * Get module by ID
   */
  async getModuleById(moduleId) {
    const modules = await sequelize.query(
      `SELECT m.id, m.code, m.name, m.year, m.semester, m.credits, m.description,
              m.is_active, m.qualification_id, m.created_at, m.updated_at,
              q.name as qualification_name, q.code as qualification_code
       FROM modules m
       LEFT JOIN qualifications q ON m.qualification_id = q.id
       WHERE m.id = ?`,
      {
        replacements: [moduleId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const module = modules[0];

    if (!module) {
      throw { statusCode: 404, message: 'Module not found' };
    }

    // Get lecturers teaching this module
    const lecturers = await sequelize.query(
      `SELECT l.id, l.employee_number, l.department, l.title,
              ud.first_name, ud.last_name, u.email,
              ml.created_at
       FROM module_lecturers ml
       INNER JOIN lecturers l ON ml.lecturer_id = l.id
       INNER JOIN users u ON l.user_id = u.id
       LEFT JOIN user_details ud ON u.id = ud.user_id
       WHERE ml.module_id = ?
       ORDER BY ml.created_at DESC`,
      {
        replacements: [moduleId],
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
    const replacements = [moduleId];
    let semesterFilter = '';

    if (semesterId) {
      semesterFilter = 'AND r.semester_id = ?';
      replacements.push(semesterId);
    }

    const students = await sequelize.query(
      `SELECT s.id, s.student_number,
              ud.first_name, ud.last_name, u.email,
              r.id as registration_id, r.status, r.registration_date, r.grade, r.credits_earned,
              sem.name as semester_name, sem.year as semester_year
       FROM registrations r
       INNER JOIN students s ON r.student_id = s.id
       INNER JOIN users u ON s.user_id = u.id
       LEFT JOIN user_details ud ON u.id = ud.user_id
       LEFT JOIN semesters sem ON r.semester_id = sem.id
       WHERE r.module_id = ? ${semesterFilter}
       ORDER BY s.student_number ASC`,
      {
        replacements,
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return students;
  }
}

module.exports = new ModuleService();
