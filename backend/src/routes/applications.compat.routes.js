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

// ──────────────────────────────────────────────────────────
// GET /api/applications/identity/status  — public (no auth)
// Called by Apply.html before the form starts, to detect existing/duplicate records.
// Query params: nationality, id_number (SA), passport_number (foreign)
// ──────────────────────────────────────────────────────────
router.get('/identity/status', async (req, res) => {
  try {
    const { nationality = 'South African', id_number, passport_number } = req.query;

    const isSa = !nationality || nationality.trim().toLowerCase() === 'south african';
    const identityValue = isSa
      ? String(id_number || '').trim()
      : String(passport_number || '').trim();

    if (!identityValue) {
      return res.status(400).json({ ok: false, message: 'Identity value is required.' });
    }

    // Check if user already exists in the system
    const [existingUsers] = await sequelize.query(
      `SELECT u.id, u.email, u.role, u.account_status,
              ud.first_name, ud.last_name
       FROM users u
       LEFT JOIN user_details ud ON u.id = ud.user_id
       WHERE ${isSa ? 'ud.id_number = ?' : 'ud.passport_number = ?'}`,
      { replacements: [identityValue] }
    );

    const existingUser = existingUsers.length > 0 ? existingUsers[0] : null;

    // Check for existing applications
    const rows = await sequelize.query(
      `SELECT id, reference_number, status, qualification_code, qualification_name, submitted_at, updated_at
       FROM applications
       WHERE (
         (TRIM(COALESCE(nationality, 'South African')) = 'South African' AND id_number = ?)
         OR
         (TRIM(COALESCE(nationality, 'South African')) <> 'South African' AND passport_number = ?)
       )
       ORDER BY updated_at DESC
       LIMIT 10`,
      {
        replacements: [isSa ? identityValue : null, isSa ? null : identityValue],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const openDraft = rows.find((r) => r.status === 'draft') || null;
    const latest    = rows[0] || null;

    return res.json({
      ok: true,
      data: {
        identity_type:   isSa ? 'id_number' : 'passport_number',
        identity_value:  identityValue,
        nationality:     nationality.trim(),
        has_records:     rows.length > 0,
        has_open_draft:  Boolean(openDraft),
        draft_id:        openDraft ? openDraft.id : null,
        latest_status:   latest ? latest.status : null,
        applications:    rows,
        // NEW: Existing user information
        existing_user:   existingUser ? {
          email: existingUser.email,
          first_name: existingUser.first_name,
          last_name: existingUser.last_name,
          role: existingUser.role,
          account_status: existingUser.account_status,
        } : null,
        requires_login:  Boolean(existingUser),
      },
    });
  } catch (err) {
    console.error('[identity/status]', err);
    return res.status(500).json({ ok: false, message: 'Could not verify identity. Please try again.' });
  }
});

module.exports = router;
