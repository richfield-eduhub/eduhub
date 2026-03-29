/**
 * Module Routes
 */

const express = require("express");
const { param, query } = require("express-validator");
const moduleController = require("../controllers/module.controller");
const { authenticateToken } = require("../middleware/auth.middleware");
const { staffOnly } = require("../middleware/roleCheck.middleware");
const { validate } = require("../middleware/validator.middleware");

const router = express.Router();

/**
 * Validation rules
 */
const getAllModulesValidation = [
  query("qualification_id")
    .optional()
    .isUUID()
    .withMessage("Valid qualification ID required"),
  query("level")
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage("Level must be between 1 and 10"),
  query("active_only")
    .optional()
    .isBoolean()
    .withMessage("active_only must be a boolean"),
];

const getModuleStudentsValidation = [
  query("semester_id")
    .optional()
    .isUUID()
    .withMessage("Valid semester ID required"),
];

const getModulesByQualificationValidation = [
  param("qualificationId")
    .isUUID()
    .withMessage("Valid qualification ID required"),
  query("year")
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage("Year must be between 1 and 10"),
  query("semester")
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage("Semester must be between 1 and 10"),
  query("active_only")
    .optional()
    .isBoolean()
    .withMessage("active_only must be a boolean"),
];

/**
 * Routes
 */

// GET /api/modules - Get all modules (public)
router.get(
  "/",
  getAllModulesValidation,
  validate,
  moduleController.getAllModules,
);

// GET /api/modules/by-qualification/:qualificationId - Modules for a qualification (public)
router.get(
  "/by-qualification/:qualificationId",
  getModulesByQualificationValidation,
  validate,
  moduleController.getModulesByQualification,
);

// GET /api/modules/:id - Get module by ID (public)
router.get("/:id", moduleController.getModuleById);

// GET /api/modules/:id/students - Get students in module (staff only)
router.get(
  "/:id/students",
  authenticateToken,
  staffOnly,
  getModuleStudentsValidation,
  validate,
  moduleController.getModuleStudents,
);

module.exports = router;
