/**
 * Courses Routes — /api/courses/*
 * Exposes modules as "courses" for the frontend-html shared.js.
 */
const express   = require('express');
const router    = express.Router();
const sequelize = require('../config/database');
const { authenticateToken } = require('../middleware/auth.middleware');

router.use(authenticateToken);

// GET /api/courses
router.get('/', async (req, res, next) => {
  try {
    const courses = await sequelize.query(
      `SELECT m.id, m.code, m.name, m.credits, m.semester_number AS semester,
              m.year_of_study AS year, m.qualification_id,
              q.name AS qual_name, q.faculty
       FROM modules m
       LEFT JOIN qualifications q ON m.qualification_id = q.id
       WHERE m.is_active = true
       ORDER BY q.code, m.year_of_study, m.semester_number, m.code`,
      { type: sequelize.QueryTypes.SELECT }
    ).catch(() => []);
    res.json({ ok: true, courses, total: courses.length });
  } catch (err) { next(err); }
});

// GET /api/courses/:moduleCode/roster
router.get('/:moduleCode/roster', async (req, res, next) => {
  try {
    const roster = await sequelize.query(
      `SELECT u.id as user_id, ud.first_name, ud.last_name, u.email,
              s.student_number, r.status AS registration_status
       FROM registrations r
       JOIN students s ON r.student_id = s.id
       JOIN users u ON s.user_id = u.id
       LEFT JOIN user_details ud ON u.id = ud.user_id
       JOIN modules m ON r.module_id = m.id
       WHERE m.code = ?
       ORDER BY ud.last_name, ud.first_name`,
      { replacements: [req.params.moduleCode], type: sequelize.QueryTypes.SELECT }
    ).catch(() => []);
    res.json({ ok: true, roster, total: roster.length });
  } catch (err) { next(err); }
});

module.exports = router;
