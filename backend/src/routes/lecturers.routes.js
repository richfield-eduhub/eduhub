/**
 * Lecturers Routes — /api/admin/lecturers/*
 */
const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');
const { authenticateToken } = require('../middleware/auth.middleware');
const { checkRole } = require('../middleware/roleCheck.middleware');

router.use(authenticateToken);
router.use(checkRole(['admin']));

// GET /api/admin/lecturers - Get all lecturers with their modules
router.get('/', async (req, res, next) => {
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
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/lecturers/:id/modules - Get modules for a specific lecturer
router.get('/:id/modules', async (req, res, next) => {
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
  } catch (err) {
    next(err);
  }
});

module.exports = router;
