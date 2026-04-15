/**
 * Lecturer Controller
 * Handles HTTP requests for lecturer-related operations
 */

const lecturerService = require('../services/lecturer.service');
const ResponseHandler = require('../utils/responseHandler');

/**
 * Get all lecturers
 * @route GET /api/lecturers
 * @access Staff Only (Admin or Lecturer)
 */
const getAllLecturers = async (req, res) => {
  try {
    const { page, limit, campus_id, search } = req.query;

    const result = await lecturerService.getAllLecturers({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      campus_id,
      search,
    });

    return ResponseHandler.success(
      res,
      result.lecturers,
      'Lecturers retrieved successfully',
      200,
      { pagination: result.pagination }
    );
  } catch (error) {
    console.error('Error in getAllLecturers:', error);
    return ResponseHandler.error(
      res,
      error.message || 'Failed to retrieve lecturers',
      error.statusCode || 500
    );
  }
};

/**
 * Get current lecturer's profile
 * @route GET /api/lecturers/me
 * @access Lecturer Only
 */
const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const lecturer = await lecturerService.getLecturerByUserId(userId);

    return ResponseHandler.success(res, lecturer, 'Lecturer profile retrieved successfully');
  } catch (error) {
    console.error('Error in getMyProfile:', error);
    return ResponseHandler.error(
      res,
      error.message || 'Failed to retrieve lecturer profile',
      error.statusCode || 500
    );
  }
};

/**
 * Get current lecturer's modules
 * @route GET /api/lecturers/me/modules
 * @access Lecturer Only
 */
const getMyModules = async (req, res) => {
  try {
    const userId = req.user.id;
    const { semester_id, active_only } = req.query;

    // First get lecturer profile to get lecturer ID
    const lecturer = await lecturerService.getLecturerByUserId(userId);

    const modules = await lecturerService.getLecturerModules(lecturer.id, {
      semester_id,
      active_only: active_only === 'true',
    });

    return ResponseHandler.success(res, modules, 'Lecturer modules retrieved successfully');
  } catch (error) {
    console.error('Error in getMyModules:', error);
    return ResponseHandler.error(
      res,
      error.message || 'Failed to retrieve lecturer modules',
      error.statusCode || 500
    );
  }
};

/**
 * Get lecturer by ID
 * @route GET /api/lecturers/:id
 * @access Staff Only (Admin or Lecturer)
 */
const getLecturerById = async (req, res) => {
  try {
    const { id } = req.params;

    const lecturer = await lecturerService.getLecturerById(id);

    return ResponseHandler.success(res, lecturer, 'Lecturer retrieved successfully');
  } catch (error) {
    console.error('Error in getLecturerById:', error);
    return ResponseHandler.error(
      res,
      error.message || 'Failed to retrieve lecturer',
      error.statusCode || 500
    );
  }
};

/**
 * Get lecturer's modules by lecturer ID
 * @route GET /api/lecturers/:id/modules
 * @access Staff Only (Admin or Lecturer)
 */
const getLecturerModules = async (req, res) => {
  try {
    const { id } = req.params;
    const { semester_id, active_only } = req.query;

    const modules = await lecturerService.getLecturerModules(id, {
      semester_id,
      active_only: active_only === 'true',
    });

    return ResponseHandler.success(res, modules, 'Lecturer modules retrieved successfully');
  } catch (error) {
    console.error('Error in getLecturerModules:', error);
    return ResponseHandler.error(
      res,
      error.message || 'Failed to retrieve lecturer modules',
      error.statusCode || 500
    );
  }
};

/**
 * Update lecturer information
 * @route PATCH /api/lecturers/:id
 * @access Admin Only
 */
const updateLecturer = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedLecturer = await lecturerService.updateLecturer(id, updates);

    return ResponseHandler.success(res, updatedLecturer, 'Lecturer updated successfully');
  } catch (error) {
    console.error('Error in updateLecturer:', error);
    return ResponseHandler.error(
      res,
      error.message || 'Failed to update lecturer',
      error.statusCode || 500
    );
  }
};

module.exports = {
  getAllLecturers,
  getMyProfile,
  getMyModules,
  getLecturerById,
  getLecturerModules,
  updateLecturer,
};
