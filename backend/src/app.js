// EduHub Backend — full REST API + static HTML frontend server
const express = require('express');
const path    = require('path');
const app     = express();
const PORT    = process.env.PORT || 3000;

// ── Parse JSON bodies ──────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── CORS (allows the HTML pages served from the same origin to call /api) ──
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// ── API routes (must come BEFORE static middleware) ────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/users',         require('./routes/users'));
app.use('/api/applications',  require('./routes/applications'));
app.use('/api/courses',       require('./routes/courses'));
app.use('/api/registrations', require('./routes/registrations'));
app.use('/api/admin',         require('./routes/admin'));
app.use('/api/notifications', require('./routes/notifications'));

// ── API 404 (catches unknown /api/* before falling through to HTML) ─────────
app.use('/api', (req, res) => {
  res.status(404).json({ message: `API route not found: ${req.method} ${req.path}` });
});

// ── Serve static assets (shared.css, shared.js, etc.) ─────────────────────
const FRONTEND = path.join(__dirname, '../../frontend-html');
app.use(express.static(FRONTEND));

// ── HTML page routes ───────────────────────────────────────────────────────
const page = (file) => (_, res) => res.sendFile(path.join(FRONTEND, file));

// Public
app.get('/',                  page('public/Home.html'));
app.get('/login',             page('public/Login.html'));
app.get('/apply',             page('public/Apply.html'));
app.get('/programmes',        page('public/Programmes.html'));
app.get('/programmes/:slug',  page('public/Programmes.html'));
app.get('/forgot-password',   page('public/Login.html'));

// Admin
app.get('/admin',             page('admin/Dashboard.html'));
app.get('/admin/applications',page('admin/Applications.html'));
app.get('/admin/registrations',page('admin/Registrations.html'));
app.get('/admin/allocations', page('admin/Allocations.html'));
app.get('/admin/students',    page('admin/Students.html'));

// Student
app.get('/student',           page('student/Dashboard.html'));
app.get('/student/register',  page('student/Register.html'));
app.get('/student/modules',   page('student/Modules.html'));

// Lecturer
app.get('/lecturer',          page('lecturer/Dashboard.html'));

// ── HTML 404 fallback ──────────────────────────────────────────────────────
app.use((req, res) => res.sendFile(path.join(FRONTEND, 'public/Home.html')));

// ── Start ──────────────────────────────────────────────────────────────────
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
  ║  API base   : http://localhost:${PORT}/api                   ║
  ║  Docs hint  : GET /api  lists all routes                 ║
  ╚══════════════════════════════════════════════════════════╝
  `);
});
