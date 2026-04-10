/**
 * Campus Service
 * Handles business logic for campus operations
 */

const sequelize = require('../config/database');

class CampusService {
  /**
   * Get all campuses with optional filtering
   */
  async getAllCampuses({ active_only = false, include_online = true } = {}) {
    const whereClauses = [];

    if (active_only) {
      whereClauses.push('is_active = true');
    }

    if (!include_online) {
      whereClauses.push('is_online = false');
    }

    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const campuses = await sequelize.query(
      `SELECT id, code, name, city, province, address, phone, whatsapp, email,
              is_online, is_active, created_at
       FROM campuses
       ${whereClause}
       ORDER BY
         is_online ASC,
         province ASC,
         city ASC,
         name ASC`,
      {
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return campuses;
  }

  /**
   * Get campus by ID
   */
  async getCampusById(campusId) {
    const campuses = await sequelize.query(
      `SELECT id, code, name, city, province, address, phone, whatsapp, email,
              is_online, is_active, created_at, updated_at
       FROM campuses
       WHERE id = ?`,
      {
        replacements: [campusId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const campus = campuses[0];

    if (!campus) {
      throw { statusCode: 404, message: 'Campus not found' };
    }

    // Get student count and lecturer count for this campus
    const counts = await sequelize.query(
      `SELECT
         (SELECT COUNT(*)::int FROM students WHERE campus_id = ?) as student_count,
         (SELECT COUNT(*)::int FROM lecturers WHERE campus_id = ?) as lecturer_count`,
      {
        replacements: [campusId, campusId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // Get qualifications offered at this campus
    const qualifications = await sequelize.query(
      `SELECT q.id, q.code, q.name, q.faculty, q.duration_years
       FROM qualifications q
       INNER JOIN campus_qualifications cq ON q.id = cq.qualification_id
       WHERE cq.campus_id = ? AND cq.is_active = true
       ORDER BY q.name ASC`,
      {
        replacements: [campusId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return {
      ...campus,
      student_count: counts[0].student_count,
      lecturer_count: counts[0].lecturer_count,
      qualifications,
    };
  }

  /**
   * Get campuses grouped by province
   */
  async getCampusesByProvince({ active_only = false } = {}) {
    const whereClauses = ['is_online = false'];

    if (active_only) {
      whereClauses.push('is_active = true');
    }

    const whereClause = `WHERE ${whereClauses.join(' AND ')}`;

    const campuses = await sequelize.query(
      `SELECT province,
              json_agg(
                json_build_object(
                  'id', id,
                  'code', code,
                  'name', name,
                  'city', city,
                  'address', address,
                  'phone', phone,
                  'whatsapp', whatsapp,
                  'email', email,
                  'is_active', is_active
                ) ORDER BY city, name
              ) as campuses
       FROM campuses
       ${whereClause}
       GROUP BY province
       ORDER BY province ASC`,
      {
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return campuses;
  }

  /**
   * Get campuses that offer a specific qualification
   */
  async getCampusesByQualification(qualificationId) {
    const campuses = await sequelize.query(
      `SELECT c.id, c.code, c.name, c.city, c.province, c.address,
              c.phone, c.whatsapp, c.email, c.is_online, c.is_active
       FROM campuses c
       INNER JOIN campus_qualifications cq ON c.id = cq.campus_id
       WHERE cq.qualification_id = ?
         AND c.is_active = true
         AND cq.is_active = true
       ORDER BY c.is_online ASC, c.province ASC, c.city ASC`,
      {
        replacements: [qualificationId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return campuses;
  }
}

module.exports = new CampusService();
