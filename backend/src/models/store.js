// backend/src/models/store.js
// In-memory data store — same seed data as frontend-html/shared.js
// In production you would replace this with a real database (PostgreSQL, MongoDB, etc.)

const { v4: uuidv4 } = require('uuid');

// ── Seed Users ──────────────────────────────────────────────────────────────
const users = [
  {
    id: 'admin-001',
    name: 'Admin User',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@richfield.ac.za',
    role: 'admin',
    status: 'active',
    createdAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'lec-001',
    name: 'Dr. Sarah Mokoena',
    firstName: 'Sarah',
    lastName: 'Mokoena',
    email: 'smokoena@richfield.ac.za',
    role: 'lecturer',
    status: 'active',
    createdAt: new Date('2024-01-01').toISOString(),
  },
];

// Passwords stored separately (plain text for demo — use bcrypt in production)
const passwords = {
  'admin@richfield.ac.za':    'admin123',
  'smokoena@richfield.ac.za': 'lec123',
};

// ── Qualifications (same as QUALIFICATIONS in shared.js) ───────────────────
const qualifications = [
  {
    code: 'BICT', name: 'Bachelor of ICT',
    faculty: 'Information & Communication Technology', duration: '3 Years', fee: 45000,
    modules: [
      { code:'ICT101', name:'Introduction to Programming',    credits:15, semester:1, year:1 },
      { code:'ICT102', name:'Computer Architecture',          credits:15, semester:1, year:1 },
      { code:'ICT103', name:'Mathematics for Computing',      credits:15, semester:1, year:1 },
      { code:'ICT104', name:'Web Development Fundamentals',   credits:15, semester:2, year:1 },
      { code:'ICT105', name:'Database Design',                credits:15, semester:2, year:1 },
      { code:'ICT106', name:'Networking Fundamentals',        credits:15, semester:2, year:1 },
      { code:'ICT201', name:'Object-Oriented Programming',    credits:15, semester:1, year:2 },
      { code:'ICT202', name:'Operating Systems',              credits:15, semester:1, year:2 },
      { code:'ICT203', name:'Data Structures & Algorithms',   credits:15, semester:1, year:2 },
      { code:'ICT204', name:'Software Engineering',           credits:15, semester:2, year:2 },
      { code:'ICT205', name:'Cloud Computing',                credits:15, semester:2, year:2 },
      { code:'ICT206', name:'Cybersecurity Fundamentals',     credits:15, semester:2, year:2 },
      { code:'ICT301', name:'Advanced Software Development',  credits:15, semester:1, year:3 },
      { code:'ICT302', name:'Machine Learning Basics',        credits:15, semester:1, year:3 },
      { code:'ICT303', name:'IT Project Management',          credits:15, semester:1, year:3 },
      { code:'ICT304', name:'Research Project',               credits:15, semester:2, year:3 },
      { code:'ICT305', name:'Enterprise Architecture',        credits:15, semester:2, year:3 },
      { code:'ICT306', name:'Professional Practice in ICT',   credits:15, semester:2, year:3 },
    ],
  },
  {
    code: 'NDBS', name: 'National Diploma: Business Studies',
    faculty: 'Business & Management', duration: '3 Years', fee: 38000,
    modules: [
      { code:'BUS101', name:'Business Communication',         credits:15, semester:1, year:1 },
      { code:'BUS102', name:'Principles of Management',       credits:15, semester:1, year:1 },
      { code:'BUS103', name:'Business Mathematics',           credits:15, semester:1, year:1 },
      { code:'BUS104', name:'Marketing Fundamentals',         credits:15, semester:2, year:1 },
      { code:'BUS105', name:'Financial Accounting',           credits:15, semester:2, year:1 },
      { code:'BUS106', name:'Human Resources Management',     credits:15, semester:2, year:1 },
      { code:'BUS201', name:'Advanced Marketing',             credits:15, semester:1, year:2 },
      { code:'BUS202', name:'Business Law',                   credits:15, semester:1, year:2 },
      { code:'BUS203', name:'Cost Accounting',                credits:15, semester:1, year:2 },
      { code:'BUS204', name:'Operations Management',          credits:15, semester:2, year:2 },
      { code:'BUS205', name:'Entrepreneurship',               credits:15, semester:2, year:2 },
      { code:'BUS206', name:'Business Statistics',            credits:15, semester:2, year:2 },
      { code:'BUS301', name:'Strategic Management',           credits:15, semester:1, year:3 },
      { code:'BUS302', name:'International Business',         credits:15, semester:1, year:3 },
      { code:'BUS303', name:'Leadership & Change',            credits:15, semester:1, year:3 },
      { code:'BUS304', name:'Business Research Project',      credits:15, semester:2, year:3 },
      { code:'BUS305', name:'Corporate Governance',           credits:15, semester:2, year:3 },
      { code:'BUS306', name:'Professional Business Practice', credits:15, semester:2, year:3 },
    ],
  },
  {
    code: 'HDGD', name: 'Higher Certificate: Graphic Design',
    faculty: 'Creative Arts & Design', duration: '1 Year', fee: 32000,
    modules: [
      { code:'GD101', name:'Design Principles',       credits:15, semester:1, year:1 },
      { code:'GD102', name:'Typography & Layout',     credits:15, semester:1, year:1 },
      { code:'GD103', name:'Digital Illustration',    credits:15, semester:1, year:1 },
      { code:'GD104', name:'Brand Identity Design',   credits:15, semester:2, year:1 },
      { code:'GD105', name:'Motion Graphics',         credits:15, semester:2, year:1 },
      { code:'GD106', name:'Portfolio Development',   credits:15, semester:2, year:1 },
    ],
  },
  {
    code: 'NDIT', name: 'National Diploma: Information Technology',
    faculty: 'Information & Communication Technology', duration: '3 Years', fee: 42000,
    modules: [
      { code:'IT101', name:'Systems Analysis & Design',       credits:15, semester:1, year:1 },
      { code:'IT102', name:'Object-Oriented Programming',     credits:15, semester:1, year:1 },
      { code:'IT103', name:'Operating Systems',               credits:15, semester:1, year:1 },
      { code:'IT104', name:'Software Engineering',            credits:15, semester:2, year:1 },
      { code:'IT105', name:'Cloud Computing',                 credits:15, semester:2, year:1 },
      { code:'IT106', name:'Cybersecurity Fundamentals',      credits:15, semester:2, year:1 },
      { code:'IT201', name:'Advanced Networking',             credits:15, semester:1, year:2 },
      { code:'IT202', name:'Database Administration',         credits:15, semester:1, year:2 },
      { code:'IT203', name:'Web Application Development',     credits:15, semester:1, year:2 },
      { code:'IT204', name:'IT Service Management',           credits:15, semester:2, year:2 },
      { code:'IT205', name:'Mobile Development',              credits:15, semester:2, year:2 },
      { code:'IT206', name:'Digital Forensics',               credits:15, semester:2, year:2 },
      { code:'IT301', name:'Capstone Project',                credits:15, semester:1, year:3 },
      { code:'IT302', name:'DevOps & Automation',             credits:15, semester:1, year:3 },
      { code:'IT303', name:'AI & Machine Learning',           credits:15, semester:1, year:3 },
      { code:'IT304', name:'Work Integrated Learning',        credits:15, semester:2, year:3 },
      { code:'IT305', name:'IT Governance & Compliance',      credits:15, semester:2, year:3 },
      { code:'IT306', name:'Emerging Technologies',           credits:15, semester:2, year:3 },
    ],
  },
];

// ── Runtime collections ─────────────────────────────────────────────────────
const applications   = [];
const registrations  = [];
const notifications  = [];
const auditLogs      = [];
const sessions       = {}; // token → userId

// ── Helper: generate student ID ─────────────────────────────────────────────
function generateStudentId() {
  const year  = new Date().getFullYear();
  const short = String(year).slice(2);
  const rand  = Math.floor(1000000 + Math.random() * 9000000);
  return `SD${short}/${year}/${rand}`;
}

// ── Helper: safe user (strip password) ─────────────────────────────────────
function safeUser(u) {
  if (!u) return null;
  const { password, ...rest } = u;
  return rest;
}

module.exports = {
  users, passwords, qualifications,
  applications, registrations, notifications, auditLogs, sessions,
  generateStudentId, safeUser, uuidv4,
};
