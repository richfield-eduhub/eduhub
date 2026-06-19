/**
 * Announcement Controller
 *
 * Handles announcement endpoints for lecturers and students
 */

const announcementService = require('../services/announcement.service');
const ResponseHandler = require('../utils/responseHandler');
const sequelize = require('../config/database');

class AnnouncementController {
  /**
   * POST /api/announcements
   * Create a new announcement (lecturer only)
   */
  async createAnnouncement(req, res, next) {
    try {
      const { moduleId, title, content, priority } = req.body;
      const lecturerUserId = req.user.user_id;

      // Get lecturer ID from user ID
      const [lecturer] = await sequelize.query(
        `SELECT id FROM lecturers WHERE user_id = ?`,
        {
          replacements: [lecturerUserId],
          type: sequelize.QueryTypes.SELECT,
        }
      );

      if (!lecturer) {
        return ResponseHandler.forbidden(res, 'Only lecturers can create announcements');
      }

      const announcement = await announcementService.createAnnouncement({
        moduleId,
        createdBy: lecturer.id,
        title,
        content,
        priority,
      });

      return ResponseHandler.created(res, announcement, 'Announcement created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/announcements/:id
   * Get announcement by ID
   */
  async getAnnouncement(req, res, next) {
    try {
      const { id } = req.params;

      const announcement = await announcementService.getAnnouncementById(id);

      return ResponseHandler.success(res, announcement);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/modules/:moduleId/announcements
   * Get all announcements for a module
   */
  async getModuleAnnouncements(req, res, next) {
    try {
      const { moduleId } = req.params;
      const { limit, offset } = req.query;

      const announcements = await announcementService.getModuleAnnouncements(moduleId, {
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined,
      });

      return ResponseHandler.success(res, announcements);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/students/me/announcements
   * Get announcements for current student's registered modules
   */
  async getMyAnnouncements(req, res, next) {
    try {
      const studentUserId = req.user.user_id;
      const { limit, offset } = req.query;

      // Get student ID from user ID
      const [student] = await sequelize.query(
        `SELECT id FROM students WHERE user_id = ?`,
        {
          replacements: [studentUserId],
          type: sequelize.QueryTypes.SELECT,
        }
      );

      if (!student) {
        return ResponseHandler.forbidden(res, 'Student profile not found');
      }

      const announcements = await announcementService.getStudentAnnouncements(student.id, {
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined,
      });

      return ResponseHandler.success(res, announcements);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/lecturers/me/announcements
   * Get announcements created by current lecturer
   */
  async getMyCreatedAnnouncements(req, res, next) {
    try {
      const lecturerUserId = req.user.user_id;
      const { limit, offset } = req.query;

      // Get lecturer ID from user ID
      const [lecturer] = await sequelize.query(
        `SELECT id FROM lecturers WHERE user_id = ?`,
        {
          replacements: [lecturerUserId],
          type: sequelize.QueryTypes.SELECT,
        }
      );

      if (!lecturer) {
        return ResponseHandler.forbidden(res, 'Lecturer profile not found');
      }

      const announcements = await announcementService.getLecturerAnnouncements(lecturer.id, {
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined,
      });

      return ResponseHandler.success(res, announcements);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/announcements/:id
   * Update an announcement (lecturer only, own announcements)
   */
  async updateAnnouncement(req, res, next) {
    try {
      const { id } = req.params;
      const { title, content, priority } = req.body;
      const lecturerUserId = req.user.user_id;

      // Get lecturer ID from user ID
      const [lecturer] = await sequelize.query(
        `SELECT id FROM lecturers WHERE user_id = ?`,
        {
          replacements: [lecturerUserId],
          type: sequelize.QueryTypes.SELECT,
        }
      );

      if (!lecturer) {
        return ResponseHandler.forbidden(res, 'Only lecturers can update announcements');
      }

      const announcement = await announcementService.updateAnnouncement(id, lecturer.id, {
        title,
        content,
        priority,
      });

      return ResponseHandler.success(res, announcement, 'Announcement updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/announcements/:id
   * Delete an announcement (lecturer only, own announcements)
   */
  async deleteAnnouncement(req, res, next) {
    try {
      const { id } = req.params;
      const lecturerUserId = req.user.user_id;

      // Get lecturer ID from user ID
      const [lecturer] = await sequelize.query(
        `SELECT id FROM lecturers WHERE user_id = ?`,
        {
          replacements: [lecturerUserId],
          type: sequelize.QueryTypes.SELECT,
        }
      );

      if (!lecturer) {
        return ResponseHandler.forbidden(res, 'Only lecturers can delete announcements');
      }

      const result = await announcementService.deleteAnnouncement(id, lecturer.id);

      return ResponseHandler.success(res, null, result.message);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AnnouncementController();
