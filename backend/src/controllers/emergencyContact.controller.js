/**
 * Emergency Contact Controller
 *
 * Handles emergency contact management endpoints
 */

const emergencyContactService = require('../services/emergencyContact.service');
const ResponseHandler = require('../utils/responseHandler');

class EmergencyContactController {
  /**
   * GET /api/students/:studentId/emergency-contacts
   * Get all emergency contacts for a student
   */
  async getStudentContacts(req, res, next) {
    try {
      const { studentId } = req.params;
      const requestingUserId = req.user.user_id;
      const requestingUserRole = req.user.role;

      // Students can only access their own contacts
      // Admins and lecturers can access any student's contacts
      if (
        requestingUserRole === 'student' &&
        String(studentId) !== String(requestingUserId)
      ) {
        return ResponseHandler.forbidden(
          res,
          'You can only access your own emergency contacts'
        );
      }

      const contacts = await emergencyContactService.getStudentContacts(studentId);

      return ResponseHandler.success(res, contacts);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/students/:studentId/emergency-contacts/:contactId
   * Get a specific emergency contact
   */
  async getContact(req, res, next) {
    try {
      const { studentId, contactId } = req.params;
      const requestingUserId = req.user.user_id;
      const requestingUserRole = req.user.role;

      // Students can only access their own contacts
      if (
        requestingUserRole === 'student' &&
        String(studentId) !== String(requestingUserId)
      ) {
        return ResponseHandler.forbidden(
          res,
          'You can only access your own emergency contacts'
        );
      }

      const contact = await emergencyContactService.getContactById(contactId, studentId);

      return ResponseHandler.success(res, contact);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/students/:studentId/emergency-contacts
   * Create a new emergency contact
   */
  async createContact(req, res, next) {
    try {
      const { studentId } = req.params;
      const requestingUserId = req.user.user_id;
      const requestingUserRole = req.user.role;

      // Students can only create their own contacts
      // Admins can create for any student
      if (
        requestingUserRole === 'student' &&
        String(studentId) !== String(requestingUserId)
      ) {
        return ResponseHandler.forbidden(
          res,
          'You can only create your own emergency contacts'
        );
      }

      const contact = await emergencyContactService.createContact(studentId, req.body);

      return ResponseHandler.created(res, contact, 'Emergency contact created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/students/:studentId/emergency-contacts/:contactId
   * Update an emergency contact
   */
  async updateContact(req, res, next) {
    try {
      const { studentId, contactId } = req.params;
      const requestingUserId = req.user.user_id;
      const requestingUserRole = req.user.role;

      // Students can only update their own contacts
      if (
        requestingUserRole === 'student' &&
        String(studentId) !== String(requestingUserId)
      ) {
        return ResponseHandler.forbidden(
          res,
          'You can only update your own emergency contacts'
        );
      }

      const contact = await emergencyContactService.updateContact(
        contactId,
        studentId,
        req.body
      );

      return ResponseHandler.success(res, contact, 'Emergency contact updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/students/:studentId/emergency-contacts/:contactId
   * Delete an emergency contact
   */
  async deleteContact(req, res, next) {
    try {
      const { studentId, contactId } = req.params;
      const requestingUserId = req.user.user_id;
      const requestingUserRole = req.user.role;

      // Students can only delete their own contacts
      if (
        requestingUserRole === 'student' &&
        String(studentId) !== String(requestingUserId)
      ) {
        return ResponseHandler.forbidden(
          res,
          'You can only delete your own emergency contacts'
        );
      }

      const result = await emergencyContactService.deleteContact(contactId, studentId);

      return ResponseHandler.success(res, null, result.message);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/students/:studentId/emergency-contacts/:contactId/set-primary
   * Set a contact as primary
   */
  async setPrimaryContact(req, res, next) {
    try {
      const { studentId, contactId } = req.params;
      const requestingUserId = req.user.user_id;
      const requestingUserRole = req.user.role;

      // Students can only update their own contacts
      if (
        requestingUserRole === 'student' &&
        String(studentId) !== String(requestingUserId)
      ) {
        return ResponseHandler.forbidden(
          res,
          'You can only update your own emergency contacts'
        );
      }

      const contact = await emergencyContactService.setPrimaryContact(contactId, studentId);

      return ResponseHandler.success(res, contact, 'Primary contact updated successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EmergencyContactController();
