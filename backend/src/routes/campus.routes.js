/**
 * Campus Routes
 * Public endpoints for campus information
 */

const express = require('express');
const router = express.Router();
const {
  getAllCampuses,
  getCampusById,
  getCampusesByProvince,
  getCampusesByQualification,
} = require('../controllers/campus.controller');

/**
 * @route   GET /api/campuses/by-province
 * @desc    Get campuses grouped by province
 * @access  Public
 */
router.get('/by-province', getCampusesByProvince);

/**
 * @route   GET /api/campuses/by-qualification/:qualificationId
 * @desc    Get campuses offering a specific qualification
 * @access  Public
 */
router.get('/by-qualification/:qualificationId', getCampusesByQualification);

/**
 * @route   GET /api/campuses/:id
 * @desc    Get campus by ID
 * @access  Public
 */
router.get('/:id', getCampusById);

/**
 * @route   GET /api/campuses
 * @desc    Get all campuses
 * @access  Public
 */
router.get('/', getAllCampuses);

module.exports = router;
