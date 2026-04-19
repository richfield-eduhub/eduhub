// backend/src/routes/courses.js
const express = require('express');
const router  = express.Router();
const { qualifications, registrations, users, auditLogs, uuidv4 } = require('../models/store');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.use(authMiddleware);

// Build course list from qualifications (each qualification = a course group)
// We expose individual modules as "courses" for the REST API
function getAllCourses() {
  const courses = [];
  qualifications.forEach(q => {
    q.modules.forEach(m => {
      courses.push({
        id:           `${q.code}-${m.code}`,
        code:         m.code,
        name:         m.name,
        credits:      m.credits,
        semester:     m.semester,
        year:         m.year,
        qualification: q.code,
        qualName:     q.name,
        faculty:      q.faculty,
        status:       'active',
      });
    });
  });
  return courses;
}

// ── GET /api/courses ────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  res.json({ courses: getAllCourses(), qualifications });
});

// ── GET /api/courses/:id ────────────────────────────────────────────────────
router.get('/:id', (req, res) => {
  const course = getAllCourses().find(c => c.id === req.params.id || c.code === req.params.id);
  if (!course) return res.status(404).json({ message: 'Course not found.' });
  res.json({ course });
});

// ── POST /api/courses   [admin only] ────────────────────────────────────────
router.post('/', requireRole('admin'), (req, res) => {
  const { qualificationCode, code, name, credits, semester, year } = req.body;
  if (!qualificationCode || !code || !name) {
    return res.status(400).json({ message: 'qualificationCode, code, and name are required.' });
  }

  const qual = qualifications.find(q => q.code === qualificationCode);
  if (!qual) return res.status(404).json({ message: 'Qualification not found.' });

  if (qual.modules.find(m => m.code === code)) {
    return res.status(409).json({ message: 'A module with that code already exists in this qualification.' });
  }

  const newModule = { code, name, credits: credits || 15, semester: semester || 1, year: year || 1 };
  qual.modules.push(newModule);

  auditLogs.unshift({
    id: uuidv4(), action: 'create',
    description: `Created module ${code}: ${name}`,
    performedBy: req.user.name, entityType: 'Course',
    createdAt: new Date().toISOString(),
  });

  res.status(201).json({ message: 'Course created.', course: newModule });
});

// ── PUT /api/courses/:id   [admin only] ─────────────────────────────────────
router.put('/:id', requireRole('admin'), (req, res) => {
  let found = null;
  for (const q of qualifications) {
    const m = q.modules.find(m => m.code === req.params.id);
    if (m) { found = m; break; }
  }
  if (!found) return res.status(404).json({ message: 'Course not found.' });

  const { name, credits, semester, year } = req.body;
  if (name)     found.name     = name;
  if (credits)  found.credits  = credits;
  if (semester) found.semester = semester;
  if (year)     found.year     = year;

  auditLogs.unshift({
    id: uuidv4(), action: 'update',
    description: `Updated module ${found.code}: ${found.name}`,
    performedBy: req.user.name, entityType: 'Course',
    createdAt: new Date().toISOString(),
  });

  res.json({ message: 'Course updated.', course: found });
});

// ── DELETE /api/courses/:id   [admin only] ───────────────────────────────────
router.delete('/:id', requireRole('admin'), (req, res) => {
  for (const q of qualifications) {
    const idx = q.modules.findIndex(m => m.code === req.params.id);
    if (idx !== -1) {
      const [removed] = q.modules.splice(idx, 1);
      auditLogs.unshift({
        id: uuidv4(), action: 'delete',
        description: `Deleted module ${removed.code}: ${removed.name}`,
        performedBy: req.user.name, entityType: 'Course',
        createdAt: new Date().toISOString(),
      });
      return res.json({ message: 'Course deleted.' });
    }
  }
  res.status(404).json({ message: 'Course not found.' });
});

// ── GET /api/courses/:id/roster   [admin + lecturer] ────────────────────────
router.get('/:id/roster', requireRole('admin', 'lecturer'), (req, res) => {
  // Find all students who have this module code in their registrations
  const moduleCode = req.params.id;
  const enrolled = [];

  registrations.forEach(r => {
    if (r.status === 'allocated' && r.modules && r.modules.find(m => m.code === moduleCode)) {
      const student = users.find(u => u.studentId === r.studentId);
      if (student) {
        enrolled.push({
          studentId:   student.studentId,
          name:        student.name,
          email:       student.email,
          enrolledAt:  r.allocatedAt || r.createdAt,
          status:      student.status,
        });
      }
    }
  });

  res.json({ courseCode: moduleCode, students: enrolled, total: enrolled.length });
});

module.exports = router;
