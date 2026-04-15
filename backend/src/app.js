require('dotenv').config();
const express = require('express');
const path    = require('path');
const morgan  = require('morgan');
const { migrator } = require('./db/migrator');

// Middleware
const corsMiddleware = require('./middleware/cors.middleware');
const { sanitizeInputs } = require('./middleware/validator.middleware');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler.middleware');

// Routes — core (Postgres/JWT)
const authRoutes          = require('./routes/auth.routes');
const studentRoutes       = require('./routes/student.routes');
const lecturerRoutes      = require('./routes/lecturer.routes');
const qualificationRoutes = require('./routes/qualification.routes');
const moduleRoutes        = require('./routes/module.routes');
const campusRoutes        = require('./routes/campus.routes');
const applicationRoutes   = require('./routes/application.routes');
const applicationCompatRoutes = require('./routes/applications.compat.routes');

// Routes — compatibility shims (used by frontend-html)
const adminRoutes         = require('./routes/admin.routes');
const notificationRoutes  = require('./routes/notification.routes');
const usersRoutes         = require('./routes/users.routes');
const coursesRoutes       = require('./routes/courses.routes');
const registrationsRoutes = require('./routes/registrations.routes');

const app = express();

/**
 * Global Middleware
 */
app.use(corsMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(sanitizeInputs);

// HTTP Request Logging
if (process.env.NODE_ENV === 'development') {
  // 'dev' format: :method :url :status :response-time ms - :res[content-length]
  app.use(morgan('dev'));
} else {
  // 'combined' format for production (Apache-style logs)
  app.use(morgan('combined'));
}

/**
 * Health Check
 */
app.get('/api/health', (_, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

/**
 * API Routes — core
 */
app.use('/api/auth',           authRoutes);
app.use('/api/students',       studentRoutes);
app.use('/api/lecturers',      lecturerRoutes);
app.use('/api/qualifications', qualificationRoutes);
app.use('/api/modules',        moduleRoutes);
app.use('/api/campuses',       campusRoutes);
app.use('/api/applications',   applicationCompatRoutes); // auth-based list/approve/reject first
app.use('/api/applications',   applicationRoutes);        // public create/lookup/get

// Compatibility shims (used by frontend-html shared.js)
app.use('/api/admin',          adminRoutes);
app.use('/api/notifications',  notificationRoutes);
app.use('/api/users',          usersRoutes);
app.use('/api/courses',        coursesRoutes);
app.use('/api/registrations',  registrationsRoutes);

/**
 * Static Frontend (frontend-html)
 */
const FRONTEND = path.join(__dirname, '../../frontend-html');
app.use(express.static(FRONTEND));

const page = (file) => (_, res) => res.sendFile(path.join(FRONTEND, file));

app.get('/',                 page('public/Home.html'));
app.get('/home',             page('public/Home.html'));
app.get('/login',            page('public/Login.html'));
app.get('/register',         page('public/Register.html'));
app.get('/forgot-password',  page('public/ForgotPassword.html'));
app.get('/apply',            page('public/Apply.html'));
app.get('/programmes',       page('public/Programmes.html'));
app.get('/programmes/:slug', page('public/Programmes.html'));

app.get('/admin',               page('admin/Dashboard.html'));
app.get('/admin/applications',  page('admin/Applications.html'));
app.get('/admin/registrations', page('admin/Registrations.html'));
app.get('/admin/allocations',   page('admin/Allocations.html'));
app.get('/admin/students',      page('admin/Students.html'));
app.get('/admin/courses',       page('admin/Courses.html'));
app.get('/admin/users',         page('admin/Users.html'));
app.get('/admin/reports',       page('admin/Reports.html'));

app.get('/student',              page('student/Dashboard.html'));
app.get('/student/courses',      page('student/Courses.html'));
app.get('/student/register',     page('student/Register.html'));
app.get('/student/mycourses',    page('student/MyCourses.html'));
app.get('/student/modules',      page('student/MyCourses.html'));
app.get('/student/profile',      page('student/Profile.html'));
app.get('/student/applications', page('student/Applications.html'));

app.get('/lecturer',               page('lecturer/Dashboard.html'));
app.get('/lecturer/courses',       page('lecturer/MyCourses.html'));
app.get('/lecturer/roster',        page('lecturer/Roster.html'));
app.get('/lecturer/announcements', page('lecturer/Announcements.html'));

/**
 * Error Handling — must be after all routes
 */
app.use(notFoundHandler);
app.use(errorHandler);

/**
 * Start Server
 */
const PORT = process.env.PORT || 3000;

migrator()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`
  ╔══════════════════════════════════════════════════════════╗
  ║   EduHub is running →  http://localhost:${PORT}              ║
  ╠══════════════════════════════════════════════════════════╣
  ║  Demo accounts (after running: npm run seed)             ║
  ║    Admin    : admin@eduhub.ac.za     / Password123!   ║
  ║    Lecturer : john.smith@eduhub.ac.za / Password123!  ║
  ║    Student  : thabo.molefe@student.eduhub.ac.za       ║
  ╠══════════════════════════════════════════════════════════╣
  ║  Pages                                                   ║
  ║    /login   /admin   /student   /lecturer                ║
  ╚══════════════════════════════════════════════════════════╝`);
    });
  })
  .catch((err) => {
    console.error('Startup failed:', err.message);
    process.exit(1);
  });
