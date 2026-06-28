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
                m.semester, m.year,
                q.code AS qualification_code, q.name AS qualification_name,
                s.student_number, s.user_id,
                ud.first_name, ud.last_name,
                u.account_status
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
                m.code AS module_code, m.name AS module_name, m.credits, m.semester, m.year,
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
      `SELECT m.id, m.code, m.name, m.credits, m.semester, m.year,
              q.name AS qualification_name, q.code AS qualification_code
       FROM modules m
       JOIN qualifications q ON m.qualification_id = q.id
       WHERE m.is_active = true
       ORDER BY q.code, m.year, m.semester`,
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
      const students = await sequelize.query(
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
    const students = await sequelize.query(
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
      const semesters = await sequelize.query(
        `SELECT id FROM semesters WHERE is_active = true ORDER BY start_date DESC LIMIT 1`,
        { type: sequelize.QueryTypes.SELECT }
      );
      if (semesters && semesters.length > 0) {
        activeSemesterId = semesters[0].id;
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
    const students = await sequelize.query(
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

// GET /api/registrations/proof - Generate proof of registration for current student
router.get('/proof', async (req, res, next) => {
  try {
    // Get student record
    const students = await sequelize.query(
      `SELECT s.id, s.student_number, s.enrollment_date, s.qualification_id,
              u.email, ud.first_name, ud.last_name, ud.id_number, ud.phone,
              q.code AS qualification_code, q.name AS qualification_name
       FROM students s
       JOIN users u ON s.user_id = u.id
       LEFT JOIN user_details ud ON u.id = ud.user_id
       LEFT JOIN qualifications q ON s.qualification_id = q.id
       WHERE s.user_id = ?`,
      { replacements: [req.user.user_id], type: sequelize.QueryTypes.SELECT }
    );

    const student = students[0];
    if (!student) {
      return ResponseHandler.notFound(res, 'No student profile found for this account.');
    }

    // Get approved/active registrations for current semester
    const registrations = await sequelize.query(
      `SELECT r.id, r.status, r.created_at, r.quotation_amount,
              m.code AS module_code, m.name AS module_name, m.credits,
              sem.name AS semester_name, sem.year AS semester_year,
              sem.start_date, sem.end_date
       FROM registrations r
       JOIN modules m ON r.module_id = m.id
       JOIN semesters sem ON r.semester_id = sem.id
       WHERE r.student_id = ?
         AND r.status IN ('approved', 'completed')
         AND sem.is_active = true
       ORDER BY m.code ASC`,
      { replacements: [student.id], type: sequelize.QueryTypes.SELECT }
    );

    if (registrations.length === 0) {
      return ResponseHandler.badRequest(res, 'No approved registrations found for current semester.');
    }

    // Calculate totals
    const totalCredits = registrations.reduce((sum, r) => sum + (r.credits || 0), 0);
    const totalFees = registrations.reduce((sum, r) => sum + parseFloat(r.quotation_amount || 0), 0);

    // Generate proof of registration data
    const proofData = {
      student: {
        student_number: student.student_number,
        first_name: student.first_name,
        last_name: student.last_name,
        id_number: student.id_number,
        email: student.email,
        phone: student.phone,
        qualification: student.qualification_name,
        qualification_code: student.qualification_code,
        enrollment_date: student.enrollment_date
      },
      semester: {
        name: registrations[0].semester_name,
        year: registrations[0].semester_year,
        start_date: registrations[0].start_date,
        end_date: registrations[0].end_date
      },
      registrations: registrations.map(r => ({
        module_code: r.module_code,
        module_name: r.module_name,
        credits: r.credits,
        status: r.status,
        fee: parseFloat(r.quotation_amount || 0).toFixed(2)
      })),
      summary: {
        total_modules: registrations.length,
        total_credits: totalCredits,
        total_fees: totalFees.toFixed(2),
        currency: 'ZAR'
      },
      generated_at: new Date().toISOString(),
      generated_by: 'EduHub Graduate Institute',
      document_id: `PROOF-${student.student_number}-${Date.now()}`
    };

    res.json({ ok: true, proof: proofData });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
