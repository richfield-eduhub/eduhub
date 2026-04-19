/**
 * Qualification Service
 * Handles business logic for qualification operations
 */

const sequelize = require('../config/database');

class QualificationService {
  /**
   * Get all qualifications
   */
  async getAllQualifications({ active_only = false } = {}) {
    let whereClause = '';
    if (active_only) {
      whereClause = 'WHERE q.is_active = true';
    }

    const qualifications = await sequelize.query(
      `SELECT q.id, q.code, q.name, q.faculty, q.duration_years,
              q.total_fee, q.is_active, q.created_at,
              COUNT(DISTINCT s.id)::int as student_count,
              COUNT(DISTINCT m.id)::int as module_count
       FROM qualifications q
       LEFT JOIN students s ON q.id = s.qualification_id
       LEFT JOIN modules m ON q.id = m.qualification_id
       ${whereClause}
       GROUP BY q.id
       ORDER BY q.name ASC`,
      {
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return qualifications;
  }

  /**
   * Get qualification by ID
   */
  async getQualificationById(qualificationId) {
    const qualifications = await sequelize.query(
      `SELECT q.id, q.code, q.name, q.faculty, q.duration_years,
              q.total_fee, q.is_active, q.created_at, q.updated_at
       FROM qualifications q
       WHERE q.id = ?`,
      {
        replacements: [qualificationId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const qualification = qualifications[0];

    if (!qualification) {
      throw { statusCode: 404, message: 'Qualification not found' };
    }

    // Get modules for this qualification
    const modules = await sequelize.query(
      `SELECT id, code, name, year, semester, credits, is_active
       FROM modules
       WHERE qualification_id = ?
       ORDER BY year ASC, semester ASC, code ASC`,
      {
        replacements: [qualificationId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return {
      ...qualification,
      modules,
    };
  }
}

module.exports = new QualificationService();
