/**
<<<<<<< HEAD
 * Admin routes — requires admin role
 */

const express = require('express');
const { query, param, body } = require('express-validator');
const adminController = require('../controllers/admin.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/roleCheck.middleware');
const { validate } = require('../middleware/validator.middleware');
const { APPLICATION_STATUS, PAGINATION } = require('../utils/constants');

const router = express.Router();

const semesterIdParam = [param('id').isUUID().withMessage('Valid semester id required')];
const studentIdParam = [param('id').isUUID().withMessage('Valid student id required')];

const startSemesterValidation = [
  body('name').trim().notEmpty().withMessage('name is required'),
  body('year').isInt({ min: 2000, max: 2100 }).withMessage('year must be between 2000 and 2100'),
  body('semester_number')
    .isInt({ min: 1, max: 4 })
    .withMessage('semester_number must be between 1 and 4'),
  body('start_date').optional().isISO8601().withMessage('start_date must be a valid date'),
  body('end_date').optional().isISO8601().withMessage('end_date must be a valid date'),
  body('registration_open').optional().isBoolean().withMessage('registration_open must be a boolean'),
  body('registration_start_date')
    .optional()
    .isISO8601()
    .withMessage('registration_start_date must be a valid date'),
  body('registration_end_date')
    .optional()
    .isISO8601()
    .withMessage('registration_end_date must be a valid date'),
  body('add_drop_deadline')
    .optional()
    .isISO8601()
    .withMessage('add_drop_deadline must be a valid date'),
];

const setRegistrationValidation = [
  ...semesterIdParam,
  body('registration_open')
    .isBoolean()
    .withMessage('registration_open must be a boolean'),
];

const accountStatusValidation = [
  ...studentIdParam,
  body('account_status')
    .isIn(['active', 'blocked', 'suspended'])
    .withMessage('account_status must be active, blocked, or suspended'),
  body('status_reason').optional().isString(),
];

const listApplicationsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: PAGINATION.MAX_LIMIT })
    .withMessage(`Limit must be between 1 and ${PAGINATION.MAX_LIMIT}`),
  query('status')
    .optional()
    .isIn(Object.values(APPLICATION_STATUS))
    .withMessage('Invalid status filter'),
  query('campus_id').optional().isUUID().withMessage('campus_id must be a valid UUID'),
  query('qualification_id')
    .optional()
    .isUUID()
    .withMessage('qualification_id must be a valid UUID'),
  query('search').optional().trim(),
];

const applicationIdParam = [param('id').isUUID().withMessage('Valid application id required')];

const updateStatusValidation = [
  ...applicationIdParam,
  body('status')
    .notEmpty()
    .withMessage('status is required')
    .isIn([
      APPLICATION_STATUS.UNDER_REVIEW,
      APPLICATION_STATUS.APPROVED,
      APPLICATION_STATUS.REJECTED,
      APPLICATION_STATUS.CANCELLED,
    ])
    .withMessage(
      `status must be one of: ${APPLICATION_STATUS.UNDER_REVIEW}, ${APPLICATION_STATUS.APPROVED}, ${APPLICATION_STATUS.REJECTED}, ${APPLICATION_STATUS.CANCELLED}`
    ),
  body('rejection_reason').optional().isString(),
];

router.use(authenticateToken, adminOnly);

router.get(
  '/applications',
  listApplicationsValidation,
  validate,
  adminController.listApplications
);

router.get('/stats/applications', adminController.getApplicationStats);

router.get(
  '/applications/:id',
  applicationIdParam,
  validate,
  adminController.getApplication
);

router.patch(
  '/applications/:id/status',
  updateStatusValidation,
  validate,
  adminController.updateApplicationStatus
);

router.get('/semesters', adminController.listSemesters);

router.post(
  '/semesters',
  startSemesterValidation,
  validate,
  adminController.startSemester
);

router.get(
  '/semesters/:id',
  semesterIdParam,
  validate,
  adminController.getSemester
);

router.post(
  '/semesters/:id/end',
  semesterIdParam,
  validate,
  adminController.endSemester
);

router.patch(
  '/semesters/:id/registration',
  setRegistrationValidation,
  validate,
  adminController.setSemesterRegistration
);

router.patch(
  '/students/:id/account-status',
  accountStatusValidation,
  validate,
  adminController.setStudentAccountStatus
);
=======
 * Admin Routes — compatibility shim for frontend-html shared.js
 * Wraps the Postgres-backed student/lecturer/user queries under /api/admin/*
 */
const express = require('express');
const router  = express.Router();
const sequelize = require('../config/database');
const { authenticateToken } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/roleCheck.middleware');

router.use(authenticateToken, adminOnly);

// GET /api/admin/users
router.get('/users', async (req, res, next) => {
  try {
    const users = await sequelize.query(
      `SELECT u.id as user_id, u.email, u.role, u.account_status, u.created_at,
              ud.first_name, ud.last_name, ud.phone
       FROM users u
       LEFT JOIN user_details ud ON u.id = ud.user_id
       ORDER BY u.created_at DESC`,
      { type: sequelize.QueryTypes.SELECT }
    );
    res.json({ ok: true, users, total: users.length });
  } catch (err) { next(err); }
});

// GET /api/admin/statistics
router.get('/statistics', async (req, res, next) => {
  try {
    const [[{ total_students }]] = await sequelize.query(
      `SELECT COUNT(*) AS total_students FROM users WHERE role = 'student'`
    );
    const [[{ total_lecturers }]] = await sequelize.query(
      `SELECT COUNT(*) AS total_lecturers FROM users WHERE role = 'lecturer'`
    );
    const [[{ pending_applications }]] = await sequelize.query(
      `SELECT COUNT(*) AS pending_applications FROM applications WHERE status IN ('pending','under_review')`
    );
    const [[{ total_qualifications }]] = await sequelize.query(
      `SELECT COUNT(*) AS total_qualifications FROM qualifications`
    );
    res.json({
      ok: true,
      stats: {
        totalStudents:       Number(total_students),
        totalLecturers:      Number(total_lecturers),
        pendingApplications: Number(pending_applications),
        totalQualifications: Number(total_qualifications),
      }
    });
  } catch (err) { next(err); }
});

// GET /api/admin/audit-logs
router.get('/audit-logs', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const logs = await sequelize.query(
      `SELECT id, user_id, action, resource_type, resource_id, created_at
       FROM audit_logs ORDER BY created_at DESC LIMIT ?`,
      { replacements: [limit], type: sequelize.QueryTypes.SELECT }
    ).catch(() => []); // table may not exist yet
    res.json({ ok: true, logs });
  } catch (err) { next(err); }
});

// PUT /api/admin/users/:id/role
router.put('/users/:id/role', async (req, res, next) => {
  try {
    const { role } = req.body;
    const validRoles = ['admin', 'student', 'lecturer'];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({ ok: false, message: `role must be one of: ${validRoles.join(', ')}` });
    }
    await sequelize.query(
      `UPDATE users SET role = ?, updated_at = NOW() WHERE id = ?`,
      { replacements: [role, req.params.id] }
    );
    res.json({ ok: true, message: 'Role updated.' });
  } catch (err) { next(err); }
});

// PUT /api/admin/users/:id/status
router.put('/users/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['active', 'inactive', 'suspended', 'blocked', 'terminated'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ ok: false, message: `status must be one of: ${validStatuses.join(', ')}` });
    }
    await sequelize.query(
      `UPDATE users SET account_status = ?, updated_at = NOW() WHERE id = ?`,
      { replacements: [status, req.params.id] }
    );
    res.json({ ok: true, message: 'Status updated.' });
  } catch (err) { next(err); }
});
>>>>>>> 531c062 (popi's changes)

module.exports = router;
