/**
 * Campus Controller
 * Handles HTTP requests for campus-related operations
 */

const campusService = require('../services/campus.service');
const ResponseHandler = require('../utils/responseHandler');

/**
 * Get all campuses
 * @route GET /api/campuses
 * @access Public
 */
const getAllCampuses = async (req, res) => {
  try {
    const { active_only, include_online } = req.query;

    const campuses = await campusService.getAllCampuses({
      active_only: active_only === 'true',
      include_online: include_online !== 'false', // Default to true
    });

    return ResponseHandler.success(res, campuses, 'Campuses retrieved successfully');
  } catch (error) {
    console.error('Error in getAllCampuses:', error);
    return ResponseHandler.error(res, error.message || 'Failed to retrieve campuses', error.statusCode || 500);
  }
};

/**
 * Get campus by ID
 * @route GET /api/campuses/:id
 * @access Public
 */
const getCampusById = async (req, res) => {
  try {
    const { id } = req.params;
    const campus = await campusService.getCampusById(id);

    return ResponseHandler.success(res, campus, 'Campus retrieved successfully');
  } catch (error) {
    console.error('Error in getCampusById:', error);
    return ResponseHandler.error(res, error.message || 'Failed to retrieve campus', error.statusCode || 500);
  }
};

/**
 * Get campuses grouped by province
 * @route GET /api/campuses/by-province
 * @access Public
 */
const getCampusesByProvince = async (req, res) => {
  try {
    const { active_only } = req.query;

    const campuses = await campusService.getCampusesByProvince({
      active_only: active_only === 'true',
    });

    return ResponseHandler.success(res, campuses, 'Campuses by province retrieved successfully');
  } catch (error) {
    console.error('Error in getCampusesByProvince:', error);
    return ResponseHandler.error(res, error.message || 'Failed to retrieve campuses by province', error.statusCode || 500);
  }
};

/**
 * Get campuses offering a specific qualification
 * @route GET /api/campuses/by-qualification/:qualificationId
 * @access Public
 */
const getCampusesByQualification = async (req, res) => {
  try {
    const { qualificationId } = req.params;
    const campuses = await campusService.getCampusesByQualification(qualificationId);

    return ResponseHandler.success(res, campuses, 'Campuses offering qualification retrieved successfully');
  } catch (error) {
    console.error('Error in getCampusesByQualification:', error);
    return ResponseHandler.error(res, error.message || 'Failed to retrieve campuses by qualification', error.statusCode || 500);
  }
};

module.exports = {
  getAllCampuses,
  getCampusById,
  getCampusesByProvince,
  getCampusesByQualification,
};
