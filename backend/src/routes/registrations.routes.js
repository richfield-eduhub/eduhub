/**
 * Registrations Routes — /api/registrations/*
 * Compatibility shim wrapping the Postgres registrations table.
 */
const express   = require('express');
const router    = express.Router();
const sequelize = require('../config/database');
const { authenticateToken } = require('../middleware/auth.middleware');
const { checkRole } = require('../middleware/roleCheck.middleware');

router.use(authenticateToken);

// GET /api/registrations
router.get('/', async (req, res, next) => {
  try {
    let registrations;
    if (req.user.role === 'admin' || req.user.role === 'lecturer') {
      registrations = await sequelize.query(
        `SELECT r.id, r.status, r.created_at,
                m.code AS module_code, m.name AS module_name, m.credits,
                s.student_number,
                ud.first_name, ud.last_name
         FROM registrations r
         JOIN modules m ON r.module_id = m.id
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

// POST /api/registrations
router.post('/', async (req, res, next) => {
  try {
    const { applicationId, modules: moduleIds, semester, studyYear } = req.body;

    // Get student record
    const [students] = await sequelize.query(
      `SELECT id FROM students WHERE user_id = ?`,
      { replacements: [req.user.user_id] }
    );
    const student = students[0];
    if (!student) {
      return res.status(400).json({ ok: false, message: 'No student profile found for this account.' });
    }

    // Get or create current semester
    let semesterId;
    const [semesters] = await sequelize.query(
      `SELECT id FROM semesters ORDER BY start_date DESC LIMIT 1`
    );
    if (semesters[0]) {
      semesterId = semesters[0].id;
    }

    const created = [];
    for (const moduleId of (moduleIds || [])) {
      const [[existing]] = await sequelize.query(
        `SELECT id FROM registrations WHERE student_id = ? AND module_id = ?`,
        { replacements: [student.id, moduleId] }
      );
      if (!existing) {
        const [[reg]] = await sequelize.query(
          `INSERT INTO registrations (student_id, module_id, semester_id, status, created_at, updated_at)
           VALUES (?, ?, ?, 'pending', NOW(), NOW()) RETURNING id`,
          { replacements: [student.id, moduleId, semesterId || null] }
        );
        created.push(reg);
      }
    }

    res.status(201).json({ ok: true, message: `${created.length} module(s) registered successfully.`, registrations: created });
  } catch (err) { next(err); }
});

// DELETE /api/registrations/:id
router.delete('/:id', async (req, res, next) => {
  try {
    // Verify ownership unless admin
    if (req.user.role !== 'admin') {
      const [rows] = await sequelize.query(
        `SELECT r.id FROM registrations r
         JOIN students s ON r.student_id = s.id
         WHERE r.id = ? AND s.user_id = ?`,
        { replacements: [req.params.id, req.user.user_id] }
      );
      if (!rows[0]) return res.status(403).json({ ok: false, message: 'Access denied.' });
    }
    await sequelize.query(`DELETE FROM registrations WHERE id = ?`, { replacements: [req.params.id] });
    res.json({ ok: true, message: 'Registration dropped.' });
  } catch (err) { next(err); }
});

module.exports = router;
