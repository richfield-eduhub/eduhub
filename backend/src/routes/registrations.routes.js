/**
 * Registrations Routes — /api/registrations/*
 * Enhanced with prerequisite, schedule, and credit validations
 */
const express   = require('express');
const router    = express.Router();
const sequelize = require('../config/database');
const { authenticateToken } = require('../middleware/auth.middleware');
const { checkRole } = require('../middleware/roleCheck.middleware');
const { body } = require('express-validator');
const { validate } = require('../middleware/validator.middleware');
const registrationService = require('../services/registration.service');
const ResponseHandler = require('../utils/responseHandler');

router.use(authenticateToken);

// GET /api/registrations
router.get('/', async (req, res, next) => {
  try {
    let registrations;
    if (req.user.role === 'admin' || req.user.role === 'lecturer') {
      registrations = await sequelize.query(
        `SELECT r.id, r.status, r.created_at, r.decline_reason, r.quotation_amount,
                m.code AS module_code, m.name AS module_name, m.credits,
                m.semester_number, m.year_of_study,
                q.code AS qualification_code, q.name AS qualification_name,
                s.student_number,
                ud.first_name, ud.last_name
         FROM registrations r
         JOIN modules m ON r.module_id = m.id
         JOIN qualifications q ON m.qualification_id = q.id
         JOIN students s ON r.student_id = s.id
         JOIN users u ON s.user_id = u.id
         LEFT JOIN user_details ud ON u.id = ud.user_id
         ORDER BY r.created_at DESC`,
        { type: sequelize.QueryTypes.SELECT }
      ).catch(() => []);
    } else {
      // Student sees only their own
      registrations = await sequelize.query(
        `SELECT r.id, r.status, r.created_at,
                m.code AS module_code, m.name AS module_name, m.credits, m.semester_number, m.year_of_study,
                q.name AS qualification_name
         FROM registrations r
         JOIN modules m ON r.module_id = m.id
         JOIN qualifications q ON m.qualification_id = q.id
         JOIN students s ON r.student_id = s.id
         WHERE s.user_id = ?
         ORDER BY r.created_at DESC`,
        { replacements: [req.user.user_id], type: sequelize.QueryTypes.SELECT }
      ).catch(() => []);
    }
    res.json({ ok: true, registrations, total: registrations.length });
  } catch (err) { next(err); }
});

// GET /api/registrations/eligible
router.get('/eligible', async (req, res, next) => {
  try {
    // Return all active modules as eligible (student can self-service register)
    const modules = await sequelize.query(
      `SELECT m.id, m.code, m.name, m.credits, m.semester_number, m.year_of_study,
              q.name AS qualification_name, q.code AS qualification_code
       FROM modules m
       JOIN qualifications q ON m.qualification_id = q.id
       WHERE m.is_active = true
       ORDER BY q.code, m.year_of_study, m.semester_number`,
      { type: sequelize.QueryTypes.SELECT }
    ).catch(() => []);
    res.json({ ok: true, modules, total: modules.length });
  } catch (err) { next(err); }
});

// POST /api/registrations - Register for a single module with validations
router.post(
  '/',
  [
    body('moduleId').notEmpty().withMessage('Module ID is required'),
    body('semesterId').notEmpty().withMessage('Semester ID is required'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { moduleId, semesterId } = req.body;

      // Get student record
      const [students] = await sequelize.query(
        `SELECT id FROM students WHERE user_id = ?`,
        { replacements: [req.user.user_id], type: sequelize.QueryTypes.SELECT }
      );
      const student = students[0];
      if (!student) {
        return ResponseHandler.badRequest(res, 'No student profile found for this account.');
      }

      // Register with validations
      const registration = await registrationService.registerForModule(
        student.id,
        moduleId,
        semesterId
      );

      return ResponseHandler.created(res, registration, 'Module registered successfully');
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/registrations/bulk - Register for multiple modules (legacy support)
router.post('/bulk', async (req, res, next) => {
  try {
    const { modules: moduleIds, semesterId } = req.body;

    // Get student record
    const [students] = await sequelize.query(
      `SELECT id FROM students WHERE user_id = ?`,
      { replacements: [req.user.user_id], type: sequelize.QueryTypes.SELECT }
    );
    const student = students[0];
    if (!student) {
      return ResponseHandler.badRequest(res, 'No student profile found for this account.');
    }

    // Get or use current semester
    let activeSemesterId = semesterId;
    if (!activeSemesterId) {
      const [semesters] = await sequelize.query(
        `SELECT id FROM semesters WHERE is_active = true ORDER BY start_date DESC LIMIT 1`,
        { type: sequelize.QueryTypes.SELECT }
      );
      if (semesters) {
        activeSemesterId = semesters.id;
      }
    }

    if (!activeSemesterId) {
      return ResponseHandler.badRequest(res, 'No active semester found');
    }

    const results = [];
    const errors = [];

    for (const moduleId of (moduleIds || [])) {
      try {
        const registration = await registrationService.registerForModule(
          student.id,
          moduleId,
          activeSemesterId
        );
        results.push(registration);
      } catch (error) {
        errors.push({
          moduleId,
          error: error.message,
          details: error.details,
        });
      }
    }

    return res.status(201).json({
      ok: true,
      message: `${results.length} module(s) registered successfully, ${errors.length} failed`,
      registrations: results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/registrations/:id - Drop registration
router.delete('/:id', async (req, res, next) => {
  try {
    // Get student record
    const [students] = await sequelize.query(
      `SELECT id FROM students WHERE user_id = ?`,
      { replacements: [req.user.user_id], type: sequelize.QueryTypes.SELECT }
    );
    const student = students[0];

    // Admin can drop any registration
    if (req.user.role === 'admin') {
      const result = await registrationService.dropRegistration(req.params.id, student ? student.id : null);
      return ResponseHandler.success(res, null, result.message);
    }

    // Student can only drop their own
    if (!student) {
      return ResponseHandler.badRequest(res, 'No student profile found for this account.');
    }

    const result = await registrationService.dropRegistration(req.params.id, student.id);
    return ResponseHandler.success(res, null, result.message);
  } catch (err) {
    next(err);
  }
});

// PUT /api/registrations/:id/grade - Update grade (lecturer/admin only)
router.put(
  '/:id/grade',
  checkRole(['admin', 'lecturer']),
  [
    body('grade')
      .notEmpty()
      .withMessage('Grade is required')
      .isIn(['A', 'B', 'C', 'D', 'F'])
      .withMessage('Grade must be A, B, C, D, or F'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { grade } = req.body;
      const updatedBy = req.user.user_id;

      const registration = await registrationService.updateGrade(id, grade, updatedBy);

      return ResponseHandler.success(res, registration, 'Grade updated successfully');
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
