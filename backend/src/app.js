// EduHub Backend — full REST API + static HTML frontend server
const express = require('express');
const path    = require('path');
const app     = express();
const PORT    = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/users',         require('./routes/users'));
app.use('/api/applications',  require('./routes/applications'));
app.use('/api/courses',       require('./routes/courses'));
app.use('/api/registrations', require('./routes/registrations'));
app.use('/api/admin',         require('./routes/admin'));
app.use('/api/notifications', require('./routes/notifications'));

// API 404
app.use('/api', (req, res) => {
  res.status(404).json({ message: `API route not found: ${req.method} ${req.path}` });
});

// ── Static assets ─────────────────────────────────────────────────────────────
const FRONTEND = path.join(__dirname, '../../frontend-html');
app.use(express.static(FRONTEND));

// ── HTML page routes ──────────────────────────────────────────────────────────
const page = (file) => (_, res) => res.sendFile(path.join(FRONTEND, file));

// Public
app.get('/',                   page('index.html'));
app.get('/login',              page('public/Login.html'));
app.get('/register',           page('public/Register.html'));
app.get('/forgot-password',    page('public/ForgotPassword.html'));
app.get('/apply',              page('public/Apply.html'));
app.get('/programmes',         page('public/Programmes.html'));
app.get('/programmes/:slug',   page('public/Programmes.html'));

// Admin
app.get('/admin',                page('admin/Dashboard.html'));
app.get('/admin/applications',   page('admin/Applications.html'));
app.get('/admin/registrations',  page('admin/Registrations.html'));
app.get('/admin/allocations',    page('admin/Allocations.html'));
app.get('/admin/students',       page('admin/Students.html'));
app.get('/admin/courses',        page('admin/Courses.html'));
app.get('/admin/users',          page('admin/Users.html'));
app.get('/admin/reports',        page('admin/Reports.html'));

// Student
app.get('/student',              page('student/Dashboard.html'));
app.get('/student/courses',      page('student/Courses.html'));
app.get('/student/register',     page('student/Register.html'));
app.get('/student/mycourses',    page('student/MyCourses.html'));
app.get('/student/modules',      page('student/MyCourses.html')); // legacy alias
app.get('/student/profile',      page('student/Profile.html'));
app.get('/student/applications', page('student/Applications.html'));

// Lecturer
app.get('/lecturer',             page('lecturer/Dashboard.html'));
app.get('/lecturer/courses',     page('lecturer/MyCourses.html'));
app.get('/lecturer/roster',      page('lecturer/Roster.html'));
app.get('/lecturer/announcements', page('lecturer/Announcements.html'));

// 404 fallback
app.use((req, res) => res.sendFile(path.join(FRONTEND, 'index.html')));

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════════════════╗
  ║   EduHub is running →  http://localhost:${PORT}              ║
  ╠══════════════════════════════════════════════════════════╣
  ║  Demo accounts                                           ║
  ║    Admin    : admin@richfield.ac.za     / admin123       ║
  ║    Lecturer : smokoena@richfield.ac.za  / lec123         ║
  ║    Student  : created when admin approves an application ║
  ╠══════════════════════════════════════════════════════════╣
  ║  Pages                                                   ║
  ║    /                  Home                               ║
  ║    /login             Login                              ║
  ║    /register          Create Account                     ║
  ║    /forgot-password   Reset Password                     ║
  ║    /apply             Apply for Admission                ║
  ║    /admin             Admin Dashboard                    ║
  ║    /student           Student Dashboard                  ║
  ║    /lecturer          Lecturer Dashboard                 ║
  ╚══════════════════════════════════════════════════════════╝
  `);
});
