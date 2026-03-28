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
      `SELECT q.qualification_id, q.code, q.name, q.level, q.duration_years,
              q.total_credits, q.description, q.is_active, q.created_at,
              COUNT(DISTINCT s.student_id)::int as student_count,
              COUNT(DISTINCT m.module_id)::int as module_count
       FROM qualifications q
       LEFT JOIN students s ON q.qualification_id = s.qualification_id
       LEFT JOIN modules m ON q.qualification_id = m.qualification_id
       ${whereClause}
       GROUP BY q.qualification_id
       ORDER BY q.level ASC, q.name ASC`,
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
    const [qualifications] = await sequelize.query(
      `SELECT q.qualification_id, q.code, q.name, q.level, q.duration_years,
              q.total_credits, q.description, q.is_active, q.created_at, q.updated_at
       FROM qualifications q
       WHERE q.qualification_id = $1`,
      {
        bind: [qualificationId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const qualification = qualifications[0];

    if (!qualification) {
      throw { statusCode: 404, message: 'Qualification not found' };
    }

    // Get modules for this qualification
    const modules = await sequelize.query(
      `SELECT module_id, code, name, level, credits, is_active
       FROM modules
       WHERE qualification_id = $1
       ORDER BY level ASC, code ASC`,
      {
        bind: [qualificationId],
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
