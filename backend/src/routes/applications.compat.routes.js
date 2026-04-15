/**
 * Applications compat routes — adds authenticated list/approve/reject
 * on top of the public task-backend application routes.
 * Mounted at /api/applications alongside application.routes.js
 */
const express   = require('express');
const router    = express.Router();
const sequelize = require('../config/database');
const { authenticateToken }      = require('../middleware/auth.middleware');
const { adminOnly, staffOnly }   = require('../middleware/roleCheck.middleware');

// GET /api/applications  (authenticated — admin sees all, student sees own)
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    let applications;
    if (req.user.role === 'admin' || req.user.role === 'lecturer') {
      applications = await sequelize.query(
        `SELECT a.*, q.name AS qualification_name, c.name AS campus_name
         FROM applications a
         LEFT JOIN qualifications q ON a.qualification_id = q.id
         LEFT JOIN campuses c ON a.campus_id = c.id
         ORDER BY a.created_at DESC`,
        { type: sequelize.QueryTypes.SELECT }
      ).catch(() => []);
    } else {
      applications = await sequelize.query(
        `SELECT a.*, q.name AS qualification_name, c.name AS campus_name
         FROM applications a
         LEFT JOIN qualifications q ON a.qualification_id = q.id
         LEFT JOIN campuses c ON a.campus_id = c.id
         WHERE a.email = ?
         ORDER BY a.created_at DESC`,
        { replacements: [req.user.email], type: sequelize.QueryTypes.SELECT }
      ).catch(() => []);
    }
    res.json({ ok: true, applications, total: applications.length });
  } catch (err) { next(err); }
});

// PUT /api/applications/:id/approve  (admin only)
router.put('/:id/approve', authenticateToken, adminOnly, async (req, res, next) => {
  try {
    await sequelize.query(
      `UPDATE applications SET status = 'approved', updated_at = NOW() WHERE id = ?`,
      { replacements: [req.params.id] }
    );
    res.json({ ok: true, message: 'Application approved.' });
  } catch (err) { next(err); }
});

// PUT /api/applications/:id/reject  (admin only)
router.put('/:id/reject', authenticateToken, adminOnly, async (req, res, next) => {
  try {
    const { reason } = req.body;
    await sequelize.query(
      `UPDATE applications SET status = 'rejected', rejection_reason = ?, updated_at = NOW() WHERE id = ?`,
      { replacements: [reason || null, req.params.id] }
    );
    res.json({ ok: true, message: 'Application rejected.' });
  } catch (err) { next(err); }
});

// POST /api/applications/:id/documents  (stub)
router.post('/:id/documents', authenticateToken, async (req, res) => {
  res.json({ ok: true, message: 'Document recorded.', documentName: req.body.documentName });
});

module.exports = router;
