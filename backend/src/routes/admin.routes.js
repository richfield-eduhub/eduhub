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

// GET /api/admin/lecturers - Get all lecturers with their modules
router.get('/lecturers', async (req, res, next) => {
  try {
    const lecturers = await sequelize.query(
      `SELECT
        l.id as lecturer_id,
        l.employee_number,
        l.department,
        l.title,
        l.specialization,
        l.hire_date,
        u.id as user_id,
        u.email,
        u.member_number,
        u.account_status,
        u.is_default_password as temp_password,
        ud.first_name,
        ud.last_name,
        ud.phone,
        COUNT(DISTINCT ml.module_id) as modules_count
       FROM lecturers l
       JOIN users u ON l.user_id = u.id
       LEFT JOIN user_details ud ON u.id = ud.user_id
       LEFT JOIN module_lecturers ml ON l.id = ml.lecturer_id
       GROUP BY l.id, l.employee_number, l.department, l.title, l.specialization,
                l.hire_date, u.id, u.email, u.member_number, u.account_status,
                u.is_default_password, ud.first_name, ud.last_name, ud.phone
       ORDER BY l.created_at DESC`,
      { type: sequelize.QueryTypes.SELECT }
    );

    res.json({
      ok: true,
      success: true,
      data: lecturers,
      total: lecturers.length
    });
  } catch (err) { next(err); }
});

// GET /api/admin/lecturers/:id/modules - Get modules for a specific lecturer
router.get('/lecturers/:id/modules', async (req, res, next) => {
  try {
    const { id } = req.params;

    const modules = await sequelize.query(
      `SELECT
        m.id,
        m.code,
        m.name,
        m.credits,
        m.year,
        m.semester,
        q.code as qualification_code,
        q.name as qualification_name,
        ml.is_primary,
        s.name as semester_name,
        COUNT(DISTINCT r.student_id) as students_enrolled
       FROM module_lecturers ml
       JOIN modules m ON ml.module_id = m.id
       JOIN qualifications q ON m.qualification_id = q.id
       JOIN semesters s ON ml.semester_id = s.id
       LEFT JOIN registrations r ON m.id = r.module_id AND r.status = 'approved'
       WHERE ml.lecturer_id = :lecturerId
       GROUP BY m.id, m.code, m.name, m.credits, m.year, m.semester,
                q.code, q.name, ml.is_primary, s.name
       ORDER BY q.code, m.year, m.semester`,
      {
        replacements: { lecturerId: id },
        type: sequelize.QueryTypes.SELECT
      }
    );

    res.json({
      ok: true,
      success: true,
      data: modules,
      total: modules.length
    });
  } catch (err) { next(err); }
});

// POST /api/admin/lecturers - Create a new lecturer (hire)
router.post('/lecturers',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('employeeNumber').notEmpty().withMessage('Employee number is required'),
    body('department').notEmpty().withMessage('Department is required'),
    body('title').optional().isString(),
    body('specialization').optional().isString(),
    body('hireDate').optional().isString(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { email, firstName, lastName, employeeNumber, department, title, specialization, hireDate } = req.body;
      const bcrypt = require('bcrypt');

      // Check if email already exists
      const [existingUser] = await sequelize.query(
        `SELECT id FROM users WHERE email = :email LIMIT 1`,
        { replacements: { email }, type: sequelize.QueryTypes.SELECT }
      );

      if (existingUser) {
        return res.status(400).json({ ok: false, success: false, message: 'Email already exists' });
      }

      // Check if employee number already exists
      const [existingLecturer] = await sequelize.query(
        `SELECT id FROM lecturers WHERE employee_number = :empNum LIMIT 1`,
        { replacements: { empNum: employeeNumber }, type: sequelize.QueryTypes.SELECT }
      );

      if (existingLecturer) {
        return res.status(400).json({ ok: false, success: false, message: 'Employee number already exists' });
      }

      const defaultPassword = await bcrypt.hash('Password123!', 10);
      const userId = require('crypto').randomUUID();
      const userDetailsId = require('crypto').randomUUID();
      const lecturerId = require('crypto').randomUUID();

      // Create user account
      await sequelize.query(
        `INSERT INTO users (id, email, password_hash, member_number, role, account_status, is_verified, is_default_password, created_at, updated_at)
         VALUES (:id, :email, :pw, :mn, 'lecturer', 'active', true, true, NOW(), NOW())`,
        {
          replacements: {
            id: userId,
            email: email,
            pw: defaultPassword,
            mn: employeeNumber
          }
        }
      );

      // Create user details
      await sequelize.query(
        `INSERT INTO user_details (id, user_id, first_name, last_name, date_of_birth, gender, nationality, id_number, phone, city, province, created_at, updated_at)
         VALUES (:id, :uid, :firstName, :lastName, '1980-01-01', 'Prefer not to say', 'South African', '8001010001088', '0000000000', 'Johannesburg', 'Gauteng', NOW(), NOW())`,
        {
          replacements: {
            id: userDetailsId,
            uid: userId,
            firstName: firstName,
            lastName: lastName
          }
        }
      );

      // Create lecturer record
      await sequelize.query(
        `INSERT INTO lecturers (id, user_id, employee_number, department, title, specialization, hire_date, created_at, updated_at)
         VALUES (:id, :uid, :empNum, :dept, :title, :spec, :hireDate, NOW(), NOW())`,
        {
          replacements: {
            id: lecturerId,
            uid: userId,
            empNum: employeeNumber,
            dept: department,
            title: title || null,
            spec: specialization || null,
            hireDate: hireDate || new Date().toISOString().split('T')[0]
          }
        }
      );

      res.json({
        ok: true,
        success: true,
        message: 'Lecturer hired successfully',
        data: {
          lecturer_id: lecturerId,
          user_id: userId,
          email: email
        }
      });
    } catch (err) { next(err); }
  }
);

// DELETE /api/admin/lecturers/:id - Delete a lecturer (fire)
router.delete('/lecturers/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get lecturer's user_id
    const [lecturer] = await sequelize.query(
      `SELECT user_id FROM lecturers WHERE id = :id LIMIT 1`,
      { replacements: { id }, type: sequelize.QueryTypes.SELECT }
    );

    if (!lecturer) {
      return res.status(404).json({ ok: false, success: false, message: 'Lecturer not found' });
    }

    // Delete module assignments first (foreign key constraint)
    await sequelize.query(
      `DELETE FROM module_lecturers WHERE lecturer_id = :id`,
      { replacements: { id } }
    );

    // Delete lecturer record
    await sequelize.query(
      `DELETE FROM lecturers WHERE id = :id`,
      { replacements: { id } }
    );

    // Optionally, deactivate the user account instead of deleting
    await sequelize.query(
      `UPDATE users SET account_status = 'terminated', updated_at = NOW() WHERE id = :userId`,
      { replacements: { userId: lecturer.user_id } }
    );

    res.json({
      ok: true,
      success: true,
      message: 'Lecturer removed successfully'
    });
  } catch (err) { next(err); }
});

// POST /api/admin/lecturers/:id/modules - Allocate modules to a lecturer
router.post('/lecturers/:id/modules',
  [
    body('moduleIds').isArray({ min: 1 }).withMessage('At least one module ID is required'),
    body('semesterId').notEmpty().withMessage('Semester ID is required'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { moduleIds, semesterId } = req.body;

      // Verify lecturer exists
      const [lecturer] = await sequelize.query(
        `SELECT id FROM lecturers WHERE id = :id LIMIT 1`,
        { replacements: { id }, type: sequelize.QueryTypes.SELECT }
      );

      if (!lecturer) {
        return res.status(404).json({ ok: false, success: false, message: 'Lecturer not found' });
      }

      // Allocate each module
      let allocated = 0;
      let skipped = 0;

      for (const moduleId of moduleIds) {
        // Check if already allocated
        const [existing] = await sequelize.query(
          `SELECT id FROM module_lecturers
           WHERE module_id = :moduleId AND lecturer_id = :lecturerId AND semester_id = :semesterId
           LIMIT 1`,
          {
            replacements: { moduleId, lecturerId: id, semesterId },
            type: sequelize.QueryTypes.SELECT
          }
        );

        if (existing) {
          skipped++;
          continue;
        }

        // Allocate module
        await sequelize.query(
          `INSERT INTO module_lecturers (id, module_id, lecturer_id, semester_id, is_primary, created_at, updated_at)
           VALUES (gen_random_uuid(), :moduleId, :lecturerId, :semesterId, true, NOW(), NOW())`,
          {
            replacements: {
              moduleId,
              lecturerId: id,
              semesterId
            }
          }
        );
        allocated++;
      }

      res.json({
        ok: true,
        success: true,
        message: `${allocated} module(s) allocated, ${skipped} already assigned`,
        data: { allocated, skipped }
      });
    } catch (err) { next(err); }
  }
);

// DELETE /api/admin/lecturers/:lecturerId/modules/:moduleId - Remove module from lecturer
router.delete('/lecturers/:lecturerId/modules/:moduleId', async (req, res, next) => {
  try {
    const { lecturerId, moduleId } = req.params;

    const result = await sequelize.query(
      `DELETE FROM module_lecturers
       WHERE lecturer_id = :lecturerId AND module_id = :moduleId`,
      { replacements: { lecturerId, moduleId } }
    );

    res.json({
      ok: true,
      success: true,
      message: 'Module removed from lecturer'
    });
  } catch (err) { next(err); }
});

// GET /api/admin/modules - Get all available modules
router.get('/modules', async (req, res, next) => {
  try {
    const modules = await sequelize.query(
      `SELECT
        m.id,
        m.code,
        m.name,
        m.credits,
        m.year,
        m.semester,
        m.is_active,
        q.code as qualification_code,
        q.name as qualification_name
       FROM modules m
       LEFT JOIN qualifications q ON m.qualification_id = q.id
       WHERE m.is_active = true
       ORDER BY q.code, m.year, m.semester, m.code`,
      { type: sequelize.QueryTypes.SELECT }
    );

    res.json({
      ok: true,
      success: true,
      data: modules,
      total: modules.length
    });
  } catch (err) { next(err); }
});

// GET /api/admin/semesters - Get all semesters
router.get('/semesters', async (req, res, next) => {
  try {
    const semesters = await sequelize.query(
      `SELECT id, name, year, semester_number, start_date, end_date, is_active
       FROM semesters
       ORDER BY year DESC, semester_number DESC`,
      { type: sequelize.QueryTypes.SELECT }
    );

    res.json({
      ok: true,
      success: true,
      data: semesters,
      total: semesters.length
    });
  } catch (err) { next(err); }
});

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
