// backend/src/routes/registrations.js
const express = require('express');
const router  = express.Router();
const {
  registrations, applications, qualifications,
  users, notifications, uuidv4,
} = require('../models/store');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.use(authMiddleware);

function addNotif(userId, title, message, type = 'info') {
  notifications.unshift({
    id: uuidv4(), userId, title, message, type,
    read: false, createdAt: new Date().toISOString(),
  });
}

// ── GET /api/registrations ──────────────────────────────────────────────────
// Admin/lecturer: all registrations. Student: own only.
router.get('/', (req, res) => {
  if (req.user.role === 'admin' || req.user.role === 'lecturer') {
    return res.json({ registrations });
  }
  const mine = registrations.filter(r => r.studentId === req.user.studentId);
  res.json({ registrations: mine });
});

// ── GET /api/registrations/eligible ────────────────────────────────────────
// Must be defined BEFORE /:id to avoid route collision
router.get('/eligible', (req, res) => {
  const studentId = req.user.studentId;
  const myApp = applications.find(
    a => (a.studentId === studentId || a.userId === req.user.id) && a.status === 'approved'
  );
  if (!myApp) {
    return res.json({ eligible: [], message: 'No approved application found.' });
  }

  const qual = qualifications.find(q => q.code === myApp.qualificationCode);
  if (!qual) return res.json({ eligible: [] });

  const studyYear = myApp.studyYear || 1;
  const eligible  = qual.modules.filter(m => m.year === studyYear);

  res.json({
    eligible,
    qualificationCode: qual.code,
    qualificationName: qual.name,
    studyYear,
  });
});

// ── POST /api/registrations ─────────────────────────────────────────────────
// Admin allocates modules to a student
router.post('/', requireRole('admin'), (req, res) => {
  const { applicationId, modules, semester, studyYear } = req.body;

  if (!applicationId || !modules || !semester || !studyYear) {
    return res.status(400).json({
      message: 'applicationId, modules, semester, and studyYear are required.',
    });
  }

  const app = applications.find(a => a.id === applicationId);
  if (!app) return res.status(404).json({ message: 'Application not found.' });
  if (app.status !== 'approved') {
    return res.status(400).json({ message: 'Can only allocate modules to approved applications.' });
  }

  // Remove any existing allocation for same student/semester/year
  const filtered = registrations.filter(
    r => !(r.studentId === app.studentId && r.semester === semester && r.studyYear === studyYear)
  );
  registrations.length = 0;
  filtered.forEach(r => registrations.push(r));

  const fee = modules.length * 5000;
  const reg = {
    id:               `ALLOC-${Date.now()}`,
    studentId:        app.studentId,
    applicationId,
    qualificationCode: app.qualificationCode,
    qualificationName: app.qualificationName,
    modules,
    semester:         Number(semester),
    studyYear:        Number(studyYear),
    year:             new Date().getFullYear(),
    status:           'allocated',
    allocatedAt:      new Date().toISOString(),
    allocatedBy:      req.user.name,
    submittedAt:      new Date().toISOString(),
    totalFee:         fee,
    feePaid:          false,
  };

  registrations.unshift(reg);

  // Notify student
  const student = users.find(u => u.studentId === app.studentId);
  if (student) {
    addNotif(
      student.id,
      '📚 Modules Allocated!',
      `Your modules for ${app.qualificationName} — Year ${studyYear}, Semester ${semester} — have been allocated. You have ${modules.length} modules.`,
      'success'
    );
  }

  res.status(201).json({ message: 'Modules allocated successfully.', registration: reg });
});

// ── DELETE /api/registrations/:id ──────────────────────────────────────────
router.delete('/:id', (req, res) => {
  const idx = registrations.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Registration not found.' });

  const reg = registrations[idx];

  // Student can only drop their own; admin can drop any
  if (req.user.role === 'student' && reg.studentId !== req.user.studentId) {
    return res.status(403).json({ message: 'Access denied.' });
  }

  registrations.splice(idx, 1);
  res.json({ message: 'Registration dropped successfully.' });
});

module.exports = router;
