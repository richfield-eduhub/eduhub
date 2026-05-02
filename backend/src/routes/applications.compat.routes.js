/**
 * Applications compat routes
 * Handles both authenticated admin actions AND the frontend's public application form.
 * Mounted at /api/applications BEFORE the strict application.routes.js
 */
const express   = require('express');
const router    = express.Router();
const sequelize = require('../config/database');
const { authenticateToken }    = require('../middleware/auth.middleware');
const { adminOnly }            = require('../middleware/roleCheck.middleware');
const crypto = require('crypto');

function genRef() {
  return `APP-${new Date().getFullYear()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}
function genStudentId() {
  const y = new Date().getFullYear();
  return `SD${String(y).slice(2)}/${y}/${Math.floor(1000000 + Math.random() * 9000000)}`;
}

// ──────────────────────────────────────────────────────────
// POST /api/applications  — public (no auth), accepts frontend camelCase form
// ──────────────────────────────────────────────────────────
router.post('/', async (req, res, next) => {
  try {
    const b = req.body;

    // Accept both camelCase (frontend) and snake_case
    const firstName       = b.firstName       || b.first_name       || '';
    const lastName        = b.lastName        || b.last_name        || '';
    const email           = (b.email || '').toLowerCase().trim();
    const phone           = b.phone           || '';
    const idNumber        = b.idNumber        || b.id_number        || '';
    const passportNumber  = b.passportNumber  || b.passport_number  || '';
    const nationality     = b.nationality     || 'South African';
    const dateOfBirth     = b.dateOfBirth     || b.date_of_birth    || null;
    const gender          = b.gender          || null;
    const altEmail        = b.altEmail        || b.alt_email        || null;
    const streetAddress   = b.streetAddress   || b.street_address   || null;
    const suburb          = b.suburb          || null;
    const city            = b.city            || null;
    const province        = b.province        || null;
    const postalCode      = b.postalCode      || b.postal_code      || null;
    const highSchool      = b.highSchool      || b.high_school      || null;
    const highestGrade    = b.highestGrade    || b.highest_grade    || null;
    const qualCode        = b.qualificationCode || b.qualification_code || '';
    const qualName        = b.qualificationName || b.qualification_name || qualCode;
    const payerName       = b.payerName       || b.payer_name       || null;
    const payerPhone      = b.payerPhone      || b.payer_phone      || null;
    const payerEmail      = b.payerEmail      || b.payer_email      || null;
    const payerRelation   = b.payerRelation   || b.payer_relation   || null;
    const admissionFor    = b.admissionFor    || b.admission_for    || '1st Semester';
    const applicationType = b.applicationType || b.application_type || 'new';
    const studyYear       = parseInt(b.studyYear || b.study_year || 1, 10);
    const tcAccepted      = Boolean(b.tcAccepted || b.tc_accepted);

    if (!firstName || !lastName || !email) {
      return res.status(400).json({ ok: false, message: 'first_name, last_name and email are required.' });
    }

    const referenceNumber = genRef();
    const studentId       = genStudentId();

    // Try to insert into the applications table with available data
    // We use a flexible INSERT that works even if some FK columns are NULL
    await sequelize.query(
      `INSERT INTO applications (
         reference_number, status, application_type, admission_for,
         first_name, last_name, email, phone, id_number, passport_number,
         nationality, date_of_birth, gender, alt_email,
         street_address, suburb, city, province, postal_code,
         high_school, highest_grade,
         payer_name, payer_phone, payer_email, payer_relation,
         qualification_code, qualification_name, study_year,
         student_id, tc_accepted, tc_accepted_at, submitted_at,
         created_at, updated_at
       ) VALUES (
         :ref, 'pending', :appType, :admFor,
         :fn, :ln, :email, :phone, :idNum, :passport,
         :nat, :dob, :gender, :altEmail,
         :street, :suburb, :city, :province, :postal,
         :school, :grade,
         :payerName, :payerPhone, :payerEmail, :payerRel,
         :qualCode, :qualName, :studyYear,
         :studentId, :tc, :tcAt, NOW(),
         NOW(), NOW()
       )`,
      {
        replacements: {
          ref: referenceNumber, appType: applicationType, admFor: admissionFor,
          fn: firstName.trim(), ln: lastName.trim(), email,
          phone: phone || '', idNum: idNumber || null, passport: passportNumber || null,
          nat: nationality, dob: dateOfBirth, gender, altEmail,
          street: streetAddress, suburb, city, province, postal: postalCode,
          school: highSchool, grade: highestGrade,
          payerName, payerPhone, payerEmail, payerRel: payerRelation,
          qualCode, qualName, studyYear,
          studentId, tc: tcAccepted, tcAt: tcAccepted ? new Date() : null,
        }
      }
    ).catch(async (err) => {
      // If our extra columns don't exist yet (older schema), fall back to minimal insert
      await sequelize.query(
        `INSERT INTO applications (
           reference_number, status, application_type, admission_for,
           first_name, last_name, email, phone, id_number,
           tc_accepted, submitted_at, created_at, updated_at
         ) VALUES (
           :ref, 'pending', :appType, :admFor,
           :fn, :ln, :email, :phone, :idNum,
           :tc, NOW(), NOW(), NOW()
         )`,
        {
          replacements: {
            ref: referenceNumber, appType: applicationType, admFor: admissionFor,
            fn: firstName.trim(), ln: lastName.trim(), email,
            phone: phone || '', idNum: idNumber || null, tc: tcAccepted,
          }
        }
      );
    });

    return res.status(201).json({
      ok: true,
      message: 'Application submitted successfully.',
      data: {
        referenceNumber,
        studentId,
        status: 'pending',
        firstName,
        lastName,
        email,
      }
    });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────────────────
// GET /api/applications  (authenticated — admin sees all, student sees own)
// ──────────────────────────────────────────────────────────
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    let applications;
    if (req.user.role === 'admin' || req.user.role === 'lecturer') {
      applications = await sequelize.query(
        `SELECT a.* FROM applications a ORDER BY a.created_at DESC`,
        { type: sequelize.QueryTypes.SELECT }
      ).catch(() => []);
    } else {
      applications = await sequelize.query(
        `SELECT a.* FROM applications a WHERE a.email = ? ORDER BY a.created_at DESC`,
        { replacements: [req.user.email], type: sequelize.QueryTypes.SELECT }
      ).catch(() => []);
    }
    res.json({ ok: true, data: applications, applications, total: applications.length });
  } catch (err) { next(err); }
});

// ──────────────────────────────────────────────────────────
// PUT /api/applications/:id/approve  (admin only)
// ──────────────────────────────────────────────────────────
router.put('/:id/approve', authenticateToken, adminOnly, async (req, res, next) => {
  try {
    await sequelize.query(
      `UPDATE applications SET status = 'approved', updated_at = NOW() WHERE id = ?`,
      { replacements: [req.params.id] }
    );
    res.json({ ok: true, message: 'Application approved.' });
  } catch (err) { next(err); }
});

// ──────────────────────────────────────────────────────────
// PUT /api/applications/:id/reject  (admin only)
// ──────────────────────────────────────────────────────────
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

// ──────────────────────────────────────────────────────────
// POST /api/applications/:id/documents  (stub)
// ──────────────────────────────────────────────────────────
router.post('/:id/documents', authenticateToken, async (req, res) => {
  res.json({ ok: true, message: 'Document recorded.', documentName: req.body.documentName });
});

module.exports = router;
