/**
 * Announcement Service
 *
 * Handles announcements for modules/courses
 * Lecturers can create announcements for their modules
 *
 * Design Reference: MISSING_FEATURES.md section 2.6
 */

const sequelize = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class AnnouncementService {
  /**
   * Create a new announcement
   */
  async createAnnouncement({ moduleId, createdBy, title, content, priority = 'normal' }) {
    if (!title || !content) {
      throw { statusCode: 400, message: 'Title and content are required' };
    }

    // Validate priority
    const validPriorities = ['low', 'normal', 'high', 'urgent'];
    if (!validPriorities.includes(priority)) {
      throw { statusCode: 400, message: `Priority must be one of: ${validPriorities.join(', ')}` };
    }

    // Verify module exists
    const [module] = await sequelize.query(
      `SELECT id, code, name FROM modules WHERE id = ?`,
      {
        replacements: [moduleId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!module) {
      throw { statusCode: 404, message: 'Module not found' };
    }

    // Verify lecturer is assigned to this module
    const [assignment] = await sequelize.query(
      `SELECT id FROM module_lecturers WHERE module_id = ? AND lecturer_id = ?`,
      {
        replacements: [moduleId, createdBy],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!assignment) {
      throw { statusCode: 403, message: 'You are not assigned to this module' };
    }

    const announcementId = uuidv4();

    await sequelize.query(
      `INSERT INTO announcements (
         id, module_id, created_by, title, content, priority, created_at, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      {
        replacements: [announcementId, moduleId, createdBy, title, content, priority],
      }
    );

    return await this.getAnnouncementById(announcementId);
  }

  /**
   * Get announcement by ID
   */
  async getAnnouncementById(announcementId) {
    const [announcement] = await sequelize.query(
      `SELECT
         a.id,
         a.module_id,
         a.created_by,
         a.title,
         a.content,
         a.priority,
         a.created_at,
         a.updated_at,
         m.code AS module_code,
         m.name AS module_name,
         ud.first_name AS author_first_name,
         ud.last_name AS author_last_name,
         u.email AS author_email
       FROM announcements a
       JOIN modules m ON a.module_id = m.id
       JOIN users u ON a.created_by = u.id
       LEFT JOIN user_details ud ON u.id = ud.user_id
       WHERE a.id = ?`,
      {
        replacements: [announcementId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!announcement) {
      throw { statusCode: 404, message: 'Announcement not found' };
    }

    return announcement;
  }

  /**
   * Get all announcements for a module
   */
  async getModuleAnnouncements(moduleId, { limit = 50, offset = 0 } = {}) {
    const announcements = await sequelize.query(
      `SELECT
         a.id,
         a.module_id,
         a.created_by,
         a.title,
         a.content,
         a.priority,
         a.created_at,
         a.updated_at,
         m.code AS module_code,
         m.name AS module_name,
         ud.first_name AS author_first_name,
         ud.last_name AS author_last_name
       FROM announcements a
       JOIN modules m ON a.module_id = m.id
       JOIN users u ON a.created_by = u.id
       LEFT JOIN user_details ud ON u.id = ud.user_id
       WHERE a.module_id = ?
       ORDER BY a.priority DESC, a.created_at DESC
       LIMIT ? OFFSET ?`,
      {
        replacements: [moduleId, limit, offset],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return announcements;
  }

  /**
   * Get all announcements for student's registered modules
   */
  async getStudentAnnouncements(studentId, { limit = 50, offset = 0 } = {}) {
    const announcements = await sequelize.query(
      `SELECT DISTINCT
         a.id,
         a.module_id,
         a.title,
         a.content,
         a.priority,
         a.created_at,
         m.code AS module_code,
         m.name AS module_name,
         ud.first_name AS author_first_name,
         ud.last_name AS author_last_name
       FROM announcements a
       JOIN modules m ON a.module_id = m.id
       JOIN registrations r ON m.id = r.module_id
       JOIN users u ON a.created_by = u.id
       LEFT JOIN user_details ud ON u.id = ud.user_id
       WHERE r.student_id = ?
         AND r.status IN ('registered', 'active')
       ORDER BY a.priority DESC, a.created_at DESC
       LIMIT ? OFFSET ?`,
      {
        replacements: [studentId, limit, offset],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return announcements;
  }

  /**
   * Get all announcements created by a lecturer
   */
  async getLecturerAnnouncements(lecturerId, { limit = 50, offset = 0 } = {}) {
    const announcements = await sequelize.query(
      `SELECT
         a.id,
         a.module_id,
         a.title,
         a.content,
         a.priority,
         a.created_at,
         a.updated_at,
         m.code AS module_code,
         m.name AS module_name
       FROM announcements a
       JOIN modules m ON a.module_id = m.id
       WHERE a.created_by = ?
       ORDER BY a.created_at DESC
       LIMIT ? OFFSET ?`,
      {
        replacements: [lecturerId, limit, offset],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return announcements;
  }

  /**
   * Update an announcement
   */
  async updateAnnouncement(announcementId, lecturerId, updateData) {
    // Verify announcement exists and belongs to lecturer
    const [announcement] = await sequelize.query(
      `SELECT id, created_by FROM announcements WHERE id = ?`,
      {
        replacements: [announcementId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!announcement) {
      throw { statusCode: 404, message: 'Announcement not found' };
    }

    if (String(announcement.created_by) !== String(lecturerId)) {
      throw { statusCode: 403, message: 'You can only update your own announcements' };
    }

    const { title, content, priority } = updateData;
    const updates = [];
    const replacements = [];

    if (title !== undefined) {
      updates.push('title = ?');
      replacements.push(title);
    }

    if (content !== undefined) {
      updates.push('content = ?');
      replacements.push(content);
    }

    if (priority !== undefined) {
      const validPriorities = ['low', 'normal', 'high', 'urgent'];
      if (!validPriorities.includes(priority)) {
        throw { statusCode: 400, message: `Priority must be one of: ${validPriorities.join(', ')}` };
      }
      updates.push('priority = ?');
      replacements.push(priority);
    }

    if (updates.length === 0) {
      throw { statusCode: 400, message: 'No valid update fields provided' };
    }

    updates.push('updated_at = NOW()');
    replacements.push(announcementId);

    await sequelize.query(
      `UPDATE announcements SET ${updates.join(', ')} WHERE id = ?`,
      { replacements }
    );

    return await this.getAnnouncementById(announcementId);
  }

  /**
   * Delete an announcement
   */
  async deleteAnnouncement(announcementId, lecturerId) {
    // Verify announcement exists and belongs to lecturer
    const [announcement] = await sequelize.query(
      `SELECT id, created_by FROM announcements WHERE id = ?`,
      {
        replacements: [announcementId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!announcement) {
      throw { statusCode: 404, message: 'Announcement not found' };
    }

    if (String(announcement.created_by) !== String(lecturerId)) {
      throw { statusCode: 403, message: 'You can only delete your own announcements' };
    }

    await sequelize.query(
      `DELETE FROM announcements WHERE id = ?`,
      { replacements: [announcementId] }
    );

    return { success: true, message: 'Announcement deleted successfully' };
  }
}

module.exports = new AnnouncementService();
