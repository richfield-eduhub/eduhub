/**
 * Users Routes — /api/users/*
 * Profile read/update for the logged-in user.
 */
const express   = require('express');
const router    = express.Router();
const bcrypt    = require('bcryptjs');
const sequelize = require('../config/database');
const { authenticateToken } = require('../middleware/auth.middleware');

router.use(authenticateToken);

// GET /api/users/profile
router.get('/profile', async (req, res, next) => {
  try {
    const [rows] = await sequelize.query(
      `SELECT u.id as user_id, u.email, u.role, u.account_status, u.created_at,
              u.is_default_password, u.require_password_change,
              ud.first_name, ud.last_name, ud.phone, ud.date_of_birth, ud.id_number,
              ud.nationality, ud.gender, ud.city, ud.province, ud.street_address,
              ud.suburb, ud.postal_code
       FROM users u
       LEFT JOIN user_details ud ON u.id = ud.user_id
       WHERE u.id = ?`,
      { replacements: [req.user.user_id] }
    );
    const base = rows[0];
    const user = base
      ? {
          ...base,
          tempPassword: Boolean(base.require_password_change || base.is_default_password),
        }
      : null;
    if (!user) return res.status(404).json({ ok: false, message: 'User not found.' });
    res.json({ ok: true, user });
  } catch (err) { next(err); }
});

// PUT /api/users/profile
router.put('/profile', async (req, res, next) => {
  try {
    const { firstName, lastName, first_name, last_name, phone, dateOfBirth, date_of_birth,
            address, street_address, suburb, city, province, postal_code } = req.body;
    const fn  = firstName  || first_name;
    const ln  = lastName   || last_name;
    const dob = dateOfBirth || date_of_birth;
    const sa  = address    || street_address;

    await sequelize.query(
      `UPDATE user_details
       SET first_name = COALESCE(?, first_name),
           last_name  = COALESCE(?, last_name),
           phone      = COALESCE(?, phone),
           date_of_birth = COALESCE(?, date_of_birth),
           street_address = COALESCE(?, street_address),
           suburb     = COALESCE(?, suburb),
           city       = COALESCE(?, city),
           province   = COALESCE(?, province),
           postal_code = COALESCE(?, postal_code),
           updated_at = NOW()
       WHERE user_id = ?`,
      { replacements: [fn||null, ln||null, phone||null, dob||null, sa||null,
                        suburb||null, city||null, province||null, postal_code||null,
                        req.user.user_id] }
    );

    // Fetch updated user
    const [rows] = await sequelize.query(
      `SELECT u.id as user_id, u.email, u.role, ud.first_name, ud.last_name, ud.phone
       FROM users u LEFT JOIN user_details ud ON u.id = ud.user_id WHERE u.id = ?`,
      { replacements: [req.user.user_id] }
    );
    res.json({ ok: true, message: 'Profile updated.', user: rows[0] });
  } catch (err) { next(err); }
});

// PUT /api/users/password
router.put('/password', async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ ok: false, message: 'currentPassword and newPassword are required.' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ ok: false, message: 'New password must be at least 8 characters.' });
    }
    const [rows] = await sequelize.query(
      `SELECT password_hash FROM users WHERE id = ?`,
      { replacements: [req.user.user_id] }
    );
    const user = rows[0];
    if (!user) return res.status(404).json({ ok: false, message: 'User not found.' });

    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) return res.status(401).json({ ok: false, message: 'Current password is incorrect.' });

    const hash = await bcrypt.hash(newPassword, 12);
    await sequelize.query(
      `UPDATE users
       SET password_hash = ?,
           is_default_password = false,
           require_password_change = false,
           last_password_change = NOW(),
           updated_at = NOW()
       WHERE id = ?`,
      { replacements: [hash, req.user.user_id] }
    );
    res.json({ ok: true, message: 'Password changed successfully.' });
  } catch (err) { next(err); }
});

// GET /api/users/emergency-contacts
router.get('/emergency-contacts', async (req, res, next) => {
  try {
    const [contacts] = await sequelize.query(
      `SELECT ec.id, ec.name, ec.relationship, ec.phone, ec.alternate_phone,
              ec.email, ec.address, ec.is_primary
       FROM emergency_contacts ec
       WHERE ec.student_id = ?
       ORDER BY ec.is_primary DESC, ec.created_at ASC`,
      { replacements: [req.user.user_id] }
    );
    res.json({ ok: true, contacts });
  } catch (err) { next(err); }
});

// GET /api/users/payer-info
router.get('/payer-info', async (req, res, next) => {
  try {
    // Get payer info from the student's approved application
    const [rows] = await sequelize.query(
      `SELECT a.payer_type, a.payer_name, a.payer_relation, a.payer_phone,
              a.payer_email, a.payer_address
       FROM applications a
       WHERE a.user_id = ?
         AND a.status = 'approved'
       ORDER BY a.approved_at DESC
       LIMIT 1`,
      { replacements: [req.user.user_id] }
    );

    const payerInfo = rows[0] || {
      payer_type: 'self',
      payer_name: null,
      payer_relation: null,
      payer_phone: null,
      payer_email: null,
      payer_address: null
    };

    res.json({ ok: true, payer: payerInfo });
  } catch (err) { next(err); }
});

// GET /api/users/fees
router.get('/fees', async (req, res, next) => {
  try {
    // Get student's fees from registrations
    const [registrations] = await sequelize.query(
      `SELECT
        r.id,
        r.quotation_amount,
        r.status,
        m.code as module_code,
        m.name as module_name,
        m.credits,
        s.name as semester_name,
        s.year
       FROM registrations r
       JOIN modules m ON r.module_id = m.id
       JOIN semesters s ON r.semester_id = s.id
       WHERE r.student_id = (SELECT id FROM students WHERE user_id = ?)
       ORDER BY s.year DESC, s.name DESC, m.code ASC`,
      { replacements: [req.user.user_id] }
    );

    // Calculate totals
    const totalFees = registrations.reduce((sum, r) =>
      sum + parseFloat(r.quotation_amount || 0), 0
    );

    const paidFees = registrations
      .filter(r => r.status === 'approved' || r.status === 'completed')
      .reduce((sum, r) => sum + parseFloat(r.quotation_amount || 0), 0);

    const outstandingFees = totalFees - paidFees;

    res.json({
      ok: true,
      fees: {
        registrations,
        summary: {
          totalFees: totalFees.toFixed(2),
          paidFees: paidFees.toFixed(2),
          outstandingFees: outstandingFees.toFixed(2),
          currency: 'ZAR'
        }
      }
    });
  } catch (err) { next(err); }
});

// GET /api/users/documents
router.get('/documents', async (req, res, next) => {
  try {
    // Get documents from user's applications
    const [documents] = await sequelize.query(
      `SELECT
        ad.id,
        ad.document_type,
        ad.file_name,
        ad.file_path,
        ad.file_size,
        ad.mime_type,
        ad.is_verified,
        ad.uploaded_at,
        ad.notes,
        a.reference_number as application_ref,
        a.status as application_status
       FROM application_documents ad
       JOIN applications a ON ad.application_id = a.id
       WHERE a.user_id = ?
       ORDER BY ad.uploaded_at DESC`,
      { replacements: [req.user.user_id] }
    );

    // Group by application
    const grouped = {};
    documents.forEach(doc => {
      const key = doc.application_ref || 'Unknown';
      if (!grouped[key]) {
        grouped[key] = {
          application_ref: doc.application_ref,
          application_status: doc.application_status,
          documents: []
        };
      }
      grouped[key].documents.push(doc);
    });

    res.json({
      ok: true,
      documents: Object.values(grouped),
      totalDocuments: documents.length
    });
  } catch (err) { next(err); }
});

module.exports = router;
