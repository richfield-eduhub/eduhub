/**
 * Admin Routes — compatibility shim for frontend-html shared.js
 * Wraps the Postgres-backed student/lecturer/user queries under /api/admin/*
 */
const express = require('express');
const router  = express.Router();
const sequelize = require('../config/database');
const { body } = require('express-validator');
const { validate } = require('../middleware/validator.middleware');
const { authenticateToken } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/roleCheck.middleware');
const adminController = require('../controllers/admin.controller');
const systemSettingsService = require('../services/systemSettings.service');
const ResponseHandler = require('../utils/responseHandler');

router.use(authenticateToken, adminOnly);

// GET /api/admin/users
router.get('/users', async (req, res, next) => {
  try {
    const users = await sequelize.query(
      `SELECT u.id as user_id, u.email, u.role, u.account_status, u.created_at,
              u.is_default_password, u.require_password_change,
              ud.first_name, ud.last_name, ud.phone
       FROM users u
       LEFT JOIN user_details ud ON u.id = ud.user_id
       ORDER BY u.created_at DESC`,
      { type: sequelize.QueryTypes.SELECT }
    );
    const out = users.map((user) => ({
      ...user,
      tempPassword: Boolean(user.require_password_change || user.is_default_password),
    }));
    res.json({ ok: true, users: out, total: out.length });
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

// POST /api/admin/applications/bulk-update - Bulk approve/reject applications
router.post(
  '/applications/bulk-update',
  [
    body('applicationIds').isArray({ min: 1 }).withMessage('applicationIds must be a non-empty array'),
    body('status').notEmpty().withMessage('status is required'),
    body('rejection_reason').optional().isString().withMessage('rejection_reason must be a string'),
  ],
  validate,
  adminController.bulkUpdateApplications
);

// GET /api/admin/reports/enrollment - Enrollment report
router.get('/reports/enrollment', async (req, res, next) => {
  try {
    const { semesterId, qualificationId } = req.query;

    let whereClause = '';
    const replacements = [];

    if (semesterId) {
      whereClause += ' AND r.semester_id = ?';
      replacements.push(semesterId);
    }

    if (qualificationId) {
      whereClause += ' AND m.qualification_id = ?';
      replacements.push(qualificationId);
    }

    const enrollmentData = await sequelize.query(
      `SELECT
         q.name AS qualification_name,
         q.code AS qualification_code,
         m.code AS module_code,
         m.name AS module_name,
         COUNT(DISTINCT r.student_id)::int AS enrolled_students,
         COUNT(DISTINCT CASE WHEN r.status = 'completed' THEN r.student_id END)::int AS completed_students,
         AVG(m.credits)::int AS average_credits
       FROM registrations r
       JOIN modules m ON r.module_id = m.id
       LEFT JOIN qualifications q ON m.qualification_id = q.id
       WHERE r.status IN ('registered', 'active', 'completed') ${whereClause}
       GROUP BY q.name, q.code, m.code, m.name
       ORDER BY q.code, m.code`,
      { replacements, type: sequelize.QueryTypes.SELECT }
    );

    res.json({ ok: true, data: enrollmentData, total: enrollmentData.length });
  } catch (err) { next(err); }
});

// GET /api/admin/reports/applications - Application funnel report
router.get('/reports/applications', async (req, res, next) => {
  try {
    const { startDate, endDate, qualificationId } = req.query;

    let whereClause = '';
    const replacements = [];

    if (startDate) {
      whereClause += ' AND a.created_at >= ?';
      replacements.push(startDate);
    }

    if (endDate) {
      whereClause += ' AND a.created_at <= ?';
      replacements.push(endDate);
    }

    if (qualificationId) {
      whereClause += ' AND a.qualification_id = ?';
      replacements.push(qualificationId);
    }

    const funnelData = await sequelize.query(
      `SELECT
         a.status,
         COUNT(*)::int AS count,
         AVG(EXTRACT(EPOCH FROM (a.reviewed_at - a.created_at))/86400)::int AS avg_days_to_review
       FROM applications a
       WHERE 1=1 ${whereClause}
       GROUP BY a.status
       ORDER BY
         CASE a.status
           WHEN 'pending' THEN 1
           WHEN 'under_review' THEN 2
           WHEN 'approved' THEN 3
           WHEN 'rejected' THEN 4
           WHEN 'cancelled' THEN 5
           ELSE 6
         END`,
      { replacements, type: sequelize.QueryTypes.SELECT }
    );

    // Get qualification breakdown
    const qualificationBreakdown = await sequelize.query(
      `SELECT
         q.name AS qualification_name,
         q.code AS qualification_code,
         COUNT(a.id)::int AS total_applications,
         COUNT(CASE WHEN a.status = 'approved' THEN 1 END)::int AS approved,
         COUNT(CASE WHEN a.status = 'rejected' THEN 1 END)::int AS rejected,
         COUNT(CASE WHEN a.status = 'pending' THEN 1 END)::int AS pending
       FROM applications a
       JOIN qualifications q ON a.qualification_id = q.id
       WHERE 1=1 ${whereClause}
       GROUP BY q.name, q.code
       ORDER BY total_applications DESC`,
      { replacements, type: sequelize.QueryTypes.SELECT }
    );

    res.json({
      ok: true,
      data: {
        statusFunnel: funnelData,
        qualificationBreakdown: qualificationBreakdown,
      }
    });
  } catch (err) { next(err); }
});

// GET /api/admin/reports/system-usage - System usage analytics
router.get('/reports/system-usage', async (req, res, next) => {
  try {
    // Active users by role
    const usersByRole = await sequelize.query(
      `SELECT
         role,
         COUNT(*)::int AS total,
         COUNT(CASE WHEN account_status = 'active' THEN 1 END)::int AS active
       FROM users
       GROUP BY role`,
      { type: sequelize.QueryTypes.SELECT }
    );

    // Recent activity (last 30 days)
    const recentActivity = await sequelize.query(
      `SELECT
         DATE(created_at) AS activity_date,
         COUNT(*)::int AS new_users
       FROM users
       WHERE created_at >= NOW() - INTERVAL '30 days'
       GROUP BY DATE(created_at)
       ORDER BY activity_date DESC`,
      { type: sequelize.QueryTypes.SELECT }
    );

    // Module registrations trend
    const registrationTrend = await sequelize.query(
      `SELECT
         DATE(created_at) AS registration_date,
         COUNT(*)::int AS registrations
       FROM registrations
       WHERE created_at >= NOW() - INTERVAL '30 days'
       GROUP BY DATE(created_at)
       ORDER BY registration_date DESC`,
      { type: sequelize.QueryTypes.SELECT }
    );

    res.json({
      ok: true,
      data: {
        usersByRole,
        recentActivity,
        registrationTrend,
      }
    });
  } catch (err) { next(err); }
});

// ============================================
// System Settings Management
// ============================================

// GET /api/admin/settings - Get all system settings
router.get('/settings', async (req, res, next) => {
  try {
    const settings = await systemSettingsService.getAllSettings();
    return ResponseHandler.success(res, settings);
  } catch (err) { next(err); }
});

// GET /api/admin/settings/categorized - Get settings grouped by category
router.get('/settings/categorized', async (req, res, next) => {
  try {
    const categorized = await systemSettingsService.getSettingsByCategory();
    return ResponseHandler.success(res, categorized);
  } catch (err) { next(err); }
});

// GET /api/admin/settings/:key - Get specific setting
router.get('/settings/:key', async (req, res, next) => {
  try {
    const setting = await systemSettingsService.getSettingByKey(req.params.key);
    return ResponseHandler.success(res, setting);
  } catch (err) { next(err); }
});

// PUT /api/admin/settings/:key - Update specific setting
router.put(
  '/settings/:key',
  [
    body('value').notEmpty().withMessage('Value is required'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { value } = req.body;
      const setting = await systemSettingsService.updateSetting(req.params.key, value);
      return ResponseHandler.success(res, setting, 'Setting updated successfully');
    } catch (err) { next(err); }
  }
);

// POST /api/admin/settings/bulk-update - Bulk update settings
router.post(
  '/settings/bulk-update',
  [
    body('updates').isArray({ min: 1 }).withMessage('Updates must be a non-empty array'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { updates } = req.body;
      const result = await systemSettingsService.bulkUpdateSettings(updates);
      return res.status(200).json({
        success: true,
        message: `${result.updated.length} setting(s) updated successfully, ${result.failed.length} failed`,
        data: result,
      });
    } catch (err) { next(err); }
  }
);

module.exports = router;
