// backend/src/routes/applications.js
const express = require('express');
const router  = express.Router();
const {
  applications, users, notifications, passwords,
  generateStudentId, safeUser, uuidv4,
} = require('../models/store');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.use(authMiddleware);

// Helper: add notification
function addNotif(userId, title, message, type = 'info') {
  notifications.unshift({
    id: uuidv4(), userId, title, message, type,
    read: false, createdAt: new Date().toISOString(),
  });
}

// ── GET /api/applications ───────────────────────────────────────────────────
// Admin sees all; student sees only their own
router.get('/', (req, res) => {
  if (req.user.role === 'admin') {
    return res.json({ applications });
  }
  // Student: match by userId or studentId
  const mine = applications.filter(
    a => a.userId === req.user.id || a.studentId === req.user.studentId
  );
  res.json({ applications: mine });
});

// ── POST /api/applications ──────────────────────────────────────────────────
router.post('/', (req, res) => {
  const {
    firstName, lastName, email, phone, idNumber, passportNumber,
    dateOfBirth, gender, nationality,
    streetAddress, suburb, city, province, postalCode,
    highSchool, highSchoolYear, highestGrade,
    tertiaryInstitution, tertiaryQualification, tertiaryYear,
    payerName, payerRelation, payerPhone, payerEmail, payerAddress,
    qualificationCode, qualificationName,
    applicationType, admissionFor, studyYear,
    docsUploaded, tcAccepted,
  } = req.body;

  if (!firstName || !lastName || !qualificationCode) {
    return res.status(400).json({
      message: 'firstName, lastName, and qualificationCode are required.',
    });
  }

  const app = {
    id:          `APP-${Date.now()}`,
    userId:      req.user.id,
    studentId:   req.user.studentId || generateStudentId(),
    // Personal
    firstName, lastName,
    email:       email || req.user.email,
    phone:       phone || '',
    idNumber:    idNumber || '',
    passportNumber: passportNumber || '',
    dateOfBirth: dateOfBirth || '',
    gender:      gender || '',
    nationality: nationality || 'South African',
    // Address
    streetAddress: streetAddress || '',
    suburb:      suburb || '',
    city:        city || '',
    province:    province || '',
    postalCode:  postalCode || '',
    // Education
    highSchool:  highSchool || '',
    highSchoolYear: highSchoolYear || '',
    highestGrade: highestGrade || '',
    tertiaryInstitution:  tertiaryInstitution || '',
    tertiaryQualification: tertiaryQualification || '',
    tertiaryYear: tertiaryYear || '',
    // Payer
    payerName:    payerName || '',
    payerRelation: payerRelation || '',
    payerPhone:   payerPhone || '',
    payerEmail:   payerEmail || '',
    payerAddress: payerAddress || '',
    // Qualification
    qualificationCode,
    qualificationName: qualificationName || qualificationCode,
    // Meta
    applicationType: applicationType || 'new',
    admissionFor:    admissionFor || '1st Semester',
    studyYear:       studyYear || 1,
    docsUploaded:    docsUploaded || [],
    tcAccepted:      tcAccepted || false,
    status:          'pending',
    submittedAt:     new Date().toISOString(),
    createdAt:       new Date().toISOString(),
  };

  applications.unshift(app);

  // Notify admins
  users.filter(u => u.role === 'admin').forEach(a =>
    addNotif(a.id,
      applicationType === 'returning' ? '🔄 Returning Student Application' : '🆕 New Application',
      `${firstName} ${lastName} submitted an application for ${qualificationName || qualificationCode}.`,
      'info')
  );

  res.status(201).json({ message: 'Application submitted successfully.', application: app });
});

// ── GET /api/applications/:id ───────────────────────────────────────────────
router.get('/:id', (req, res) => {
  const app = applications.find(a => a.id === req.params.id);
  if (!app) return res.status(404).json({ message: 'Application not found.' });

  // Students can only view their own
  if (req.user.role === 'student' &&
      app.userId !== req.user.id &&
      app.studentId !== req.user.studentId) {
    return res.status(403).json({ message: 'Access denied.' });
  }
  res.json({ application: app });
});

// ── PUT /api/applications/:id ───────────────────────────────────────────────
router.put('/:id', (req, res) => {
  const app = applications.find(a => a.id === req.params.id);
  if (!app) return res.status(404).json({ message: 'Application not found.' });
  if (req.user.role === 'student' && app.userId !== req.user.id) {
    return res.status(403).json({ message: 'Access denied.' });
  }
  if (app.status !== 'pending' && req.user.role === 'student') {
    return res.status(400).json({ message: 'Only pending applications can be edited.' });
  }

  // Merge allowed fields
  const allowed = [
    'firstName','lastName','phone','email','nationality','idNumber','passportNumber',
    'dateOfBirth','gender','streetAddress','suburb','city','province','postalCode',
    'highSchool','highSchoolYear','highestGrade','tertiaryInstitution','tertiaryQualification',
    'tertiaryYear','payerName','payerRelation','payerPhone','payerEmail','payerAddress',
    'qualificationCode','qualificationName','admissionFor','studyYear','docsUploaded','tcAccepted',
  ];
  allowed.forEach(k => { if (req.body[k] !== undefined) app[k] = req.body[k]; });
  app.updatedAt = new Date().toISOString();

  res.json({ message: 'Application updated.', application: app });
});

// ── DELETE /api/applications/:id ────────────────────────────────────────────
router.delete('/:id', (req, res) => {
  const idx = applications.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Application not found.' });
  const app = applications[idx];
  if (req.user.role === 'student' && app.userId !== req.user.id) {
    return res.status(403).json({ message: 'Access denied.' });
  }
  if (app.status !== 'pending') {
    return res.status(400).json({ message: 'Only pending applications can be deleted.' });
  }
  applications.splice(idx, 1);
  res.json({ message: 'Application deleted.' });
});

// ── POST /api/applications/:id/submit ───────────────────────────────────────
router.post('/:id/submit', (req, res) => {
  const app = applications.find(a => a.id === req.params.id);
  if (!app) return res.status(404).json({ message: 'Application not found.' });
  if (req.user.role === 'student' && app.userId !== req.user.id) {
    return res.status(403).json({ message: 'Access denied.' });
  }
  app.status = 'pending';
  app.submittedAt = new Date().toISOString();

  users.filter(u => u.role === 'admin').forEach(a =>
    addNotif(a.id, '📋 Application Submitted',
      `${app.firstName} ${app.lastName} submitted their application for ${app.qualificationName}.`, 'info')
  );

  res.json({ message: 'Application submitted for review.', application: app });
});

// ── PUT /api/applications/:id/approve   [admin only] ────────────────────────
router.put('/:id/approve', requireRole('admin'), (req, res) => {
  const app = applications.find(a => a.id === req.params.id);
  if (!app) return res.status(404).json({ message: 'Application not found.' });

  app.status     = 'approved';
  app.approvedAt = new Date().toISOString();
  app.approvedBy = req.user.name;

  // Check if student account already exists
  const existingUser = users.find(u => u.studentId === app.studentId);
  let tempPassword = null;
  let isNew = false;

  if (!existingUser) {
    // Create student account with temp password
    isNew = true;
    tempPassword = `EduHub@${Math.floor(1000 + Math.random() * 9000)}`;
    const newUser = {
      id:           uuidv4(),
      name:         `${app.firstName} ${app.lastName}`,
      firstName:    app.firstName,
      lastName:     app.lastName,
      email:        app.email,
      role:         'student',
      studentId:    app.studentId,
      status:       'active',
      tempPassword: true,
      createdAt:    new Date().toISOString(),
    };
    users.push(newUser);
    passwords[app.email.toLowerCase()] = tempPassword;

    addNotif(newUser.id, '🎉 Application Approved!',
      `Your application has been approved. Student ID: ${app.studentId}. Temporary password: ${tempPassword}. Please log in and change your password.`,
      'success');
  } else {
    addNotif(existingUser.id, '🎉 Re-enrolment Approved!',
      `Your returning student application for Year ${app.studyYear} of ${app.qualificationName} has been approved.`,
      'success');
  }

  res.json({
    message: 'Application approved.',
    application: app,
    tempPassword,
    isNew,
  });
});

// ── PUT /api/applications/:id/reject   [admin only] ─────────────────────────
router.put('/:id/reject', requireRole('admin'), (req, res) => {
  const app = applications.find(a => a.id === req.params.id);
  if (!app) return res.status(404).json({ message: 'Application not found.' });

  const reason = req.body.reason || req.body.declineReason || 'Application did not meet requirements.';
  app.status        = 'declined';
  app.declineReason = reason;
  app.declinedAt    = new Date().toISOString();
  app.declinedBy    = req.user.name;

  // Notify student
  const student = users.find(u => u.studentId === app.studentId || u.id === app.userId);
  if (student) {
    addNotif(student.id, 'Application Update',
      `Your application for ${app.qualificationName} was not approved. Reason: ${reason}`, 'error');
  }

  res.json({ message: 'Application declined.', application: app });
});

// ── POST /api/applications/:id/documents ────────────────────────────────────
router.post('/:id/documents', (req, res) => {
  const app = applications.find(a => a.id === req.params.id);
  if (!app) return res.status(404).json({ message: 'Application not found.' });
  if (req.user.role === 'student' && app.userId !== req.user.id) {
    return res.status(403).json({ message: 'Access denied.' });
  }

  // In production: parse multipart/form-data and save the file
  const docName = req.body.documentName || req.body.docName || 'Uploaded Document';
  if (!app.docsUploaded) app.docsUploaded = [];
  app.docsUploaded.push(docName);

  res.json({ message: 'Document uploaded successfully.', docsUploaded: app.docsUploaded });
});

module.exports = router;
