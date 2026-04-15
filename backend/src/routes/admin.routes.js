/**
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

module.exports = router;
