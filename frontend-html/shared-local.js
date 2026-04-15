/**
 * EduHub shared-local.js — 100% localStorage, no backend required
 * All paths are RELATIVE so it works by opening files directly (no server needed).
 */

/* ═══════════════════════════════════════════════════
   DATA CONSTANTS
   ═══════════════════════════════════════════════════ */
// Logo path resolved at runtime using rootPath so it works from any subfolder
const EDUHUB_LOGO = null; // replaced by dynamic path in renderNavbar

const QUALIFICATIONS = [
  {code:'BSc IT',name:'Bachelor of Science in Information Technology',faculty:'Faculty of Information Technology',duration:'3 Years',fee:45000,modules:[{code:'BSCIT1101',name:'Introduction to Programming',credits:15,semester:1,year:1},{code:'BSCIT1102',name:'Computer Architecture & Organisation',credits:15,semester:1,year:1},{code:'BSCIT1103',name:'Mathematics for Computing',credits:15,semester:1,year:1},{code:'BSCIT1204',name:'Web Development Fundamentals',credits:15,semester:2,year:1},{code:'BSCIT1205',name:'Database Design & Management',credits:15,semester:2,year:1},{code:'BSCIT1206',name:'Networking Fundamentals',credits:15,semester:2,year:1},{code:'BSCIT2107',name:'Object-Oriented Programming',credits:15,semester:1,year:2},{code:'BSCIT2108',name:'Systems Analysis & Design',credits:15,semester:1,year:2},{code:'BSCIT2109',name:'Data Structures & Algorithms',credits:15,semester:1,year:2},{code:'BSCIT2210',name:'Cyber Security Fundamentals',credits:15,semester:2,year:2},{code:'BSCIT2211',name:'Cloud Computing',credits:15,semester:2,year:2},{code:'BSCIT2212',name:'Internet of Things',credits:15,semester:2,year:2},{code:'BSCIT3113',name:'Business Intelligence & Data Analytics',credits:15,semester:1,year:3},{code:'BSCIT3114',name:'Mobile Computing & Applications',credits:15,semester:1,year:3},{code:'BSCIT3115',name:'IT Project Management',credits:15,semester:1,year:3},{code:'BSCIT3216',name:'Digital Applications Development',credits:15,semester:2,year:3},{code:'BSCIT3217',name:'Work Integrated Learning',credits:15,semester:2,year:3},{code:'BSCIT3218',name:'IT Research Project',credits:15,semester:2,year:3}]},
  {code:'Dip IT',name:'Diploma in Information Technology',faculty:'Faculty of Information Technology',duration:'3 Years',fee:42000,modules:[{code:'DIT1101',name:'Introduction to IT',credits:15,semester:1,year:1},{code:'DIT1102',name:'Programming Logic & Design',credits:15,semester:1,year:1},{code:'DIT1103',name:'Computer Hardware & Software',credits:15,semester:1,year:1},{code:'DIT1204',name:'Database Fundamentals',credits:15,semester:2,year:1},{code:'DIT1205',name:'Web Design & Development',credits:15,semester:2,year:1},{code:'DIT1206',name:'Business Communication',credits:15,semester:2,year:1},{code:'DIT2107',name:'Network Administration',credits:15,semester:1,year:2},{code:'DIT2108',name:'Application Programming',credits:15,semester:1,year:2},{code:'DIT2109',name:'Operating Systems Administration',credits:15,semester:1,year:2},{code:'DIT2210',name:'IT Service Management',credits:15,semester:2,year:2},{code:'DIT2211',name:'Python Development',credits:15,semester:2,year:2},{code:'DIT2212',name:'Systems Security',credits:15,semester:2,year:2},{code:'DIT3113',name:'Advanced Networking & Infrastructure',credits:15,semester:1,year:3},{code:'DIT3114',name:'Database Administration',credits:15,semester:1,year:3},{code:'DIT3115',name:'Software Engineering',credits:15,semester:1,year:3},{code:'DIT3216',name:'Work Integrated Learning',credits:15,semester:2,year:3},{code:'DIT3217',name:'IT Governance & Compliance',credits:15,semester:2,year:3},{code:'DIT3218',name:'Emerging Technologies',credits:15,semester:2,year:3}]},
  {code:'HC IT',name:'Higher Certificate in Information Technology',faculty:'Faculty of Information Technology',duration:'1 Year',fee:28000,modules:[{code:'HCIT1101',name:'IT Fundamentals',credits:15,semester:1,year:1},{code:'HCIT1102',name:'Introduction to Programming',credits:15,semester:1,year:1},{code:'HCIT1103',name:'Computer Networks Basics',credits:15,semester:1,year:1},{code:'HCIT1204',name:'Systems Development',credits:15,semester:2,year:1},{code:'HCIT1205',name:'Technical Support Fundamentals',credits:15,semester:2,year:1},{code:'HCIT1206',name:'Web Development Basics',credits:15,semester:2,year:1}]},
  {code:'HC CF',name:'Higher Certificate in Computer Forensics',faculty:'Faculty of Information Technology',duration:'1 Year',fee:28000,modules:[{code:'HCCF1101',name:'Introduction to Cybercrime & Law',credits:15,semester:1,year:1},{code:'HCCF1102',name:'Digital Evidence & Acquisition',credits:15,semester:1,year:1},{code:'HCCF1103',name:'Computer Forensics Fundamentals',credits:15,semester:1,year:1},{code:'HCCF1204',name:'Information Security Management',credits:15,semester:2,year:1},{code:'HCCF1205',name:'Cybercrime Investigation Techniques',credits:15,semester:2,year:1},{code:'HCCF1206',name:'Forensic Reporting & Documentation',credits:15,semester:2,year:1}]},
  {code:'BSc Hons IT',name:'BSc Honours in Information Technology',faculty:'Faculty of Information Technology',duration:'1 Year',fee:48000,modules:[{code:'BSCHIT1101',name:'Advanced Research Methodology',credits:15,semester:1,year:1},{code:'BSCHIT1102',name:'IT Leadership & Governance',credits:15,semester:1,year:1},{code:'BSCHIT1203',name:'Advanced Software Engineering',credits:15,semester:2,year:1},{code:'BSCHIT1204',name:'Research Project & Dissertation',credits:15,semester:2,year:1}]},
  {code:'BCom',name:'Bachelor of Commerce',faculty:'Faculty of Business & Management Sciences',duration:'3 Years',fee:42000,modules:[{code:'BCOM1101',name:'Business Communication',credits:15,semester:1,year:1},{code:'BCOM1102',name:'Principles of Management',credits:15,semester:1,year:1},{code:'BCOM1103',name:'Financial Accounting',credits:15,semester:1,year:1},{code:'BCOM1204',name:'Economics I',credits:15,semester:2,year:1},{code:'BCOM1205',name:'Business Mathematics & Statistics',credits:15,semester:2,year:1},{code:'BCOM1206',name:'Marketing Fundamentals',credits:15,semester:2,year:1},{code:'BCOM2107',name:'Cost & Management Accounting',credits:15,semester:1,year:2},{code:'BCOM2108',name:'Human Resource Management',credits:15,semester:1,year:2},{code:'BCOM2109',name:'Business Law',credits:15,semester:1,year:2},{code:'BCOM2210',name:'Financial Management',credits:15,semester:2,year:2},{code:'BCOM2211',name:'Marketing Management',credits:15,semester:2,year:2},{code:'BCOM2212',name:'Operations Management',credits:15,semester:2,year:2},{code:'BCOM3113',name:'Strategic Management',credits:15,semester:1,year:3},{code:'BCOM3114',name:'Entrepreneurship & Innovation',credits:15,semester:1,year:3},{code:'BCOM3115',name:'Supply Chain Management',credits:15,semester:1,year:3},{code:'BCOM3216',name:'Corporate Governance & Ethics',credits:15,semester:2,year:3},{code:'BCOM3217',name:'International Business',credits:15,semester:2,year:3},{code:'BCOM3218',name:'Business Research Project',credits:15,semester:2,year:3}]},
  {code:'BBA',name:'Bachelor of Business Administration',faculty:'Faculty of Business & Management Sciences',duration:'3 Years',fee:42000,modules:[{code:'BBA1101',name:'Business Communication',credits:15,semester:1,year:1},{code:'BBA1102',name:'Organisational Behaviour',credits:15,semester:1,year:1},{code:'BBA1103',name:'Business Mathematics',credits:15,semester:1,year:1},{code:'BBA1204',name:'Introduction to Economics',credits:15,semester:2,year:1},{code:'BBA1205',name:'Business Computing',credits:15,semester:2,year:1},{code:'BBA1206',name:'Marketing Principles',credits:15,semester:2,year:1},{code:'BBA2107',name:'Financial Accounting',credits:15,semester:1,year:2},{code:'BBA2108',name:'Human Resource Management',credits:15,semester:1,year:2},{code:'BBA2109',name:'Business Law & Ethics',credits:15,semester:1,year:2},{code:'BBA2210',name:'Project Management',credits:15,semester:2,year:2},{code:'BBA2211',name:'Operations & Supply Chain',credits:15,semester:2,year:2},{code:'BBA2212',name:'Entrepreneurship',credits:15,semester:2,year:2},{code:'BBA3113',name:'Strategic Management',credits:15,semester:1,year:3},{code:'BBA3114',name:'Leadership & Change Management',credits:15,semester:1,year:3},{code:'BBA3115',name:'Digital Business & Innovation',credits:15,semester:1,year:3},{code:'BBA3216',name:'International Business Management',credits:15,semester:2,year:3},{code:'BBA3217',name:'Corporate Governance',credits:15,semester:2,year:3},{code:'BBA3218',name:'Business Research Project',credits:15,semester:2,year:3}]},
  {code:'BPM',name:'Bachelor of Public Management',faculty:'Faculty of Business & Management Sciences',duration:'3 Years',fee:38000,modules:[{code:'BPM1101',name:'Introduction to Public Administration',credits:15,semester:1,year:1},{code:'BPM1102',name:'Public Policy Fundamentals',credits:15,semester:1,year:1},{code:'BPM1103',name:'Government & Governance',credits:15,semester:1,year:1},{code:'BPM1204',name:'Public Sector Economics',credits:15,semester:2,year:1},{code:'BPM1205',name:'Public Finance & Budgeting',credits:15,semester:2,year:1},{code:'BPM1206',name:'Communication for Public Sector',credits:15,semester:2,year:1},{code:'BPM2107',name:'Public Sector HR Management',credits:15,semester:1,year:2},{code:'BPM2108',name:'Local Government Management',credits:15,semester:1,year:2},{code:'BPM2109',name:'Public Law & Administration',credits:15,semester:1,year:2},{code:'BPM2210',name:'Service Delivery Management',credits:15,semester:2,year:2},{code:'BPM2211',name:'Development Studies',credits:15,semester:2,year:2},{code:'BPM2212',name:'Research Methods in Public Sector',credits:15,semester:2,year:2},{code:'BPM3113',name:'Public Sector Strategic Planning',credits:15,semester:1,year:3},{code:'BPM3114',name:'Performance Management in Public Sector',credits:15,semester:1,year:3},{code:'BPM3115',name:'Intergovernmental Relations',credits:15,semester:1,year:3},{code:'BPM3216',name:'Policy Implementation & Evaluation',credits:15,semester:2,year:3},{code:'BPM3217',name:'Public Sector Entrepreneurship',credits:15,semester:2,year:3},{code:'BPM3218',name:'Research Project',credits:15,semester:2,year:3}]},
  {code:'DBA',name:'Diploma in Business Administration',faculty:'Faculty of Business & Management Sciences',duration:'3 Years',fee:38000,modules:[{code:'DBA1101',name:'Business Communication',credits:15,semester:1,year:1},{code:'DBA1102',name:'Principles of Management',credits:15,semester:1,year:1},{code:'DBA1103',name:'Business Mathematics',credits:15,semester:1,year:1},{code:'DBA1204',name:'Introduction to Accounting',credits:15,semester:2,year:1},{code:'DBA1205',name:'Marketing Basics',credits:15,semester:2,year:1},{code:'DBA1206',name:'Business Computing',credits:15,semester:2,year:1},{code:'DBA2107',name:'Financial Management',credits:15,semester:1,year:2},{code:'DBA2108',name:'Human Resources Fundamentals',credits:15,semester:1,year:2},{code:'DBA2109',name:'Business Law',credits:15,semester:1,year:2},{code:'DBA2210',name:'Supply Chain & Procurement',credits:15,semester:2,year:2},{code:'DBA2211',name:'Entrepreneurship',credits:15,semester:2,year:2},{code:'DBA2212',name:'Operations Management',credits:15,semester:2,year:2},{code:'DBA3113',name:'Strategic Business Management',credits:15,semester:1,year:3},{code:'DBA3114',name:'Leadership & Organisational Development',credits:15,semester:1,year:3},{code:'DBA3115',name:'Business Research Methods',credits:15,semester:1,year:3},{code:'DBA3216',name:'Work Integrated Learning',credits:15,semester:2,year:3},{code:'DBA3217',name:'Digital Business Transformation',credits:15,semester:2,year:3},{code:'DBA3218',name:'Business Research Project',credits:15,semester:2,year:3}]},
  {code:'DLGM',name:'Diploma in Local Government Management',faculty:'Faculty of Business & Management Sciences',duration:'3 Years',fee:36000,modules:[{code:'DLGM1101',name:'Introduction to Local Government',credits:15,semester:1,year:1},{code:'DLGM1102',name:'Public Administration Foundations',credits:15,semester:1,year:1},{code:'DLGM1103',name:'Municipal Finance Basics',credits:15,semester:1,year:1},{code:'DLGM1204',name:'Local Government Legislation',credits:15,semester:2,year:1},{code:'DLGM1205',name:'Integrated Development Planning',credits:15,semester:2,year:1},{code:'DLGM1206',name:'Community Development',credits:15,semester:2,year:1},{code:'DLGM2107',name:'Municipal HR Management',credits:15,semester:1,year:2},{code:'DLGM2108',name:'Service Delivery & Performance',credits:15,semester:1,year:2},{code:'DLGM2109',name:'Local Government Finance',credits:15,semester:1,year:2},{code:'DLGM2210',name:'Policy Process & Implementation',credits:15,semester:2,year:2},{code:'DLGM2211',name:'Ward Committee Systems',credits:15,semester:2,year:2},{code:'DLGM2212',name:'Municipal Governance',credits:15,semester:2,year:2},{code:'DLGM3113',name:'Advanced Municipal Management',credits:15,semester:1,year:3},{code:'DLGM3114',name:'Local Economic Development',credits:15,semester:1,year:3},{code:'DLGM3115',name:'Environmental Management in LGM',credits:15,semester:1,year:3},{code:'DLGM3216',name:'Work Integrated Learning',credits:15,semester:2,year:3},{code:'DLGM3217',name:'Research Methods in Public Management',credits:15,semester:2,year:3},{code:'DLGM3218',name:'Applied Research Project',credits:15,semester:2,year:3}]},
  {code:'HCBA',name:'Higher Certificate in Business Administration',faculty:'Faculty of Business & Management Sciences',duration:'1 Year',fee:26000,modules:[{code:'HCBA1101',name:'Business Communication',credits:15,semester:1,year:1},{code:'HCBA1102',name:'Introduction to Management',credits:15,semester:1,year:1},{code:'HCBA1103',name:'Basic Financial Literacy',credits:15,semester:1,year:1},{code:'HCBA1204',name:'Customer Service & Relations',credits:15,semester:2,year:1},{code:'HCBA1205',name:'Office Technology & Computing',credits:15,semester:2,year:1},{code:'HCBA1206',name:'Work Integrated Learning',credits:15,semester:2,year:1}]},
  {code:'HCOA',name:'Higher Certificate in Office Administration',faculty:'Faculty of Business & Management Sciences',duration:'1 Year',fee:26000,modules:[{code:'HCOA1101',name:'Office Administration Principles',credits:15,semester:1,year:1},{code:'HCOA1102',name:'Business English & Communication',credits:15,semester:1,year:1},{code:'HCOA1103',name:'Computer Applications & Office Software',credits:15,semester:1,year:1},{code:'HCOA1204',name:'Records & Information Management',credits:15,semester:2,year:1},{code:'HCOA1205',name:'Administrative Support Services',credits:15,semester:2,year:1},{code:'HCOA1206',name:'Work Integrated Learning',credits:15,semester:2,year:1}]},
  {code:'HCLGM',name:'Higher Certificate in Local Government Management',faculty:'Faculty of Business & Management Sciences',duration:'1 Year',fee:26000,modules:[{code:'HCLGM1101',name:'Introduction to Local Government',credits:15,semester:1,year:1},{code:'HCLGM1102',name:'Public Sector Administration',credits:15,semester:1,year:1},{code:'HCLGM1103',name:'Municipal Finance Fundamentals',credits:15,semester:1,year:1},{code:'HCLGM1204',name:'Community Engagement & Development',credits:15,semester:2,year:1},{code:'HCLGM1205',name:'Service Delivery Basics',credits:15,semester:2,year:1},{code:'HCLGM1206',name:'Work Integrated Learning',credits:15,semester:2,year:1}]},
  {code:'HC RPLA',name:'Higher Certificate in Recognition of Prior Learning Activities',faculty:'Faculty of Business & Management Sciences',duration:'1 Year',fee:24000,modules:[{code:'HCRPLA1101',name:'Principles of RPL in Higher Education',credits:15,semester:1,year:1},{code:'HCRPLA1102',name:'Portfolio Preparation & Assessment',credits:15,semester:1,year:1},{code:'HCRPLA1203',name:'RPL Facilitation Practice',credits:15,semester:2,year:1},{code:'HCRPLA1204',name:'Work Integrated Learning in RPL',credits:15,semester:2,year:1}]},
  {code:'MBA',name:'Master of Business Administration',faculty:'Faculty of Business & Management Sciences',duration:'2 Years',fee:68000,modules:[{code:'MBA1101',name:'Advanced Business Strategy',credits:15,semester:1,year:1},{code:'MBA1102',name:'Leadership in the 4th Industrial Revolution',credits:15,semester:1,year:1},{code:'MBA1103',name:'Advanced Financial Management',credits:15,semester:1,year:1},{code:'MBA1204',name:'Digital Transformation & Innovation',credits:15,semester:2,year:1},{code:'MBA1205',name:'Research Methodology',credits:15,semester:2,year:1},{code:'MBA1206',name:'Advanced Marketing Strategy',credits:15,semester:2,year:1},{code:'MBA2107',name:'Big Data & Analytics for Managers',credits:15,semester:1,year:2},{code:'MBA2108',name:'Entrepreneurship & Venture Capital',credits:15,semester:1,year:2},{code:'MBA2109',name:'Corporate Governance & Business Ethics',credits:15,semester:1,year:2},{code:'MBA2210',name:'MBA Research Project / Dissertation',credits:15,semester:2,year:2}]},
  {code:'PGDip Mgt',name:'Postgraduate Diploma in Management',faculty:'Faculty of Business & Management Sciences',duration:'1 Year',fee:48000,modules:[{code:'PGDM1101',name:'Management Principles & Practices',credits:15,semester:1,year:1},{code:'PGDM1102',name:'Organisational Leadership',credits:15,semester:1,year:1},{code:'PGDM1203',name:'Strategic Human Resource Management',credits:15,semester:2,year:1},{code:'PGDM1204',name:'Applied Management Research Project',credits:15,semester:2,year:1}]},
];


const NATIONALITIES = ['South African','Zimbabwean','Mozambican','Zambian','Malawian','Botswanan','Namibian','Swazi','Lesothan','Congolese (DRC)','Nigerian','Ghanaian','Kenyan','Tanzanian','Ugandan','Rwandan','British','American','Canadian','Australian','German','French','Indian','Pakistani','Brazilian','Other'];

const SEED_USERS = [
  { id:'admin-001', name:'Admin User', email:'admin@eduhub.ac.za', role:'admin' },
  { id:'lec-001',   name:'Dr. Sarah Mokoena', email:'smokoena@eduhub.ac.za', role:'lecturer' },
];
const DEFAULT_PASSWORDS = { 'admin@eduhub.ac.za':'admin123', 'smokoena@eduhub.ac.za':'lec123' };

/* ═══════════════════════════════════════════════════
   RELATIVE PATH HELPER
   Works out the correct prefix (e.g. "../" or "")
   based on where the current HTML file lives.
   ═══════════════════════════════════════════════════ */
function getRoot() {
  const path = window.location.pathname.replace(/\\/g, '/');
  // depth = number of folders below the frontend-html root
  // index.html  → depth 0 → prefix ""
  // public/X    → depth 1 → prefix "../"
  // admin/X     → depth 1 → prefix "../"
  // student/X   → depth 1 → prefix "../"
  // lecturer/X  → depth 1 → prefix "../"
  const parts = path.split('/').filter(Boolean);
  // Find "frontend-html" in the path and measure depth after it
  const fhIdx = parts.lastIndexOf('frontend-html');
  const depth = fhIdx >= 0 ? parts.length - fhIdx - 1 : (parts.length > 0 ? 1 : 0);
  return depth <= 1 ? '' : '../'.repeat(depth - 1);
}

// Build a path from root of frontend-html
function rootPath(rel) {
  return getRoot() + rel;
}

/* ═══════════════════════════════════════════════════
   STORAGE HELPERS
   ═══════════════════════════════════════════════════ */
function load(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function save(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

function getUsers()         { return load('users', SEED_USERS); }
function getApplications()  { return load('applications', []); }
function getRegistrations() { return load('registrations', []); }
function getNotifications() { return load('notifications', []); }
function getPasswords()     { return load('passwords', DEFAULT_PASSWORDS); }
function getCurrentUser()   { return load('currentUser', null); }

function setUsers(v)         { save('users', v); }
function setApplications(v)  { save('applications', v); }
function setRegistrations(v) { save('registrations', v); }
function setNotifications(v) { save('notifications', v); }
function setPasswords(v)     { save('passwords', v); }
function setCurrentUser(v)   { save('currentUser', v); }

/* ═══════════════════════════════════════════════════
   AUTH
   ═══════════════════════════════════════════════════ */
function login(email, password) {
  const users = getUsers();
  const pwds  = getPasswords();
  const user  = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return { success:false, message:'No account found with that email.' };
  if (pwds[email.toLowerCase()] !== password && pwds[email] !== password)
    return { success:false, message:'Incorrect password.' };
  setCurrentUser(user);
  return { success:true, user };
}

function logout() { setCurrentUser(null); }

function requireAuth(role) {
  const u = getCurrentUser();
  if (!u) { window.location.href = rootPath('public/Login.html'); return null; }
  if (role && u.role !== role) { window.location.href = rootPath('index.html'); return null; }
  return u;
}

function doChangePassword(userId, newPassword) {
  const user = getUsers().find(u => u.id === userId);
  if (!user) return;
  const pwds = getPasswords();
  pwds[user.email.toLowerCase()] = newPassword;
  setPasswords(pwds);
  setUsers(getUsers().map(u => u.id === userId ? {...u, tempPassword:false} : u));
  const cur = getCurrentUser();
  if (cur && cur.id === userId) setCurrentUser({...cur, tempPassword:false});
}

/* ═══════════════════════════════════════════════════
   NOTIFICATIONS
   ═══════════════════════════════════════════════════ */
function addNotification(n) {
  const notif = { ...n, id: Date.now().toString() + Math.random().toString(36).slice(2), createdAt: new Date().toISOString(), read: false };
  setNotifications([notif, ...getNotifications()]);
}

function markNotifRead(id) {
  setNotifications(getNotifications().map(n => n.id === id ? {...n, read:true} : n));
}

function getUserNotifs(user) {
  if (!user) return [];
  return getNotifications().filter(n => n.userId === user.id || n.userId === user.studentId);
}

/* ═══════════════════════════════════════════════════
   STUDENT ID GENERATOR
   ═══════════════════════════════════════════════════ */
function generateStudentId() {
  const year = new Date().getFullYear();
  return `SD${year.toString().slice(2)}/${year}/${Math.floor(1000000 + Math.random() * 9000000)}`;
}

/* ═══════════════════════════════════════════════════
   APPLICATIONS
   ═══════════════════════════════════════════════════ */
function findStudentByIdOrPassport(value) {
  const app = getApplications().find(a => a.status === 'approved' && (a.idNumber === value || a.passportNumber === value));
  if (!app) return null;
  const user = getUsers().find(u => u.studentId === app.studentId);
  if (!user) return null;
  return { user, application: app };
}

function submitApplication(appData) {
  let studentId = generateStudentId();
  if (appData.applicationType === 'returning') {
    const existing = findStudentByIdOrPassport(appData.idNumber || appData.passportNumber);
    if (existing) studentId = existing.application.studentId;
  }
  const app = { ...appData, id:`APP-${Date.now()}`, studentId, submittedAt: new Date().toISOString(), status:'pending' };
  setApplications([app, ...getApplications()]);
  const typeLabel = appData.applicationType === 'returning' ? '🔄 Returning Student' : '🆕 New Student';
  getUsers().filter(u => u.role === 'admin').forEach(a => addNotification({
    userId: a.id,
    title: `${typeLabel} Application Received`,
    message: `${appData.firstName} ${appData.lastName} submitted a ${appData.applicationType} application for ${appData.qualificationName} (Year ${appData.studyYear}).`,
    type:'info'
  }));
  return app;
}

function approveApplication(id) {
  setApplications(getApplications().map(a => a.id === id ? {...a, status:'approved'} : a));
  const app = getApplications().find(a => a.id === id);
  if (!app) return { isNew:false };
  const existingUser = getUsers().find(u => u.studentId === app.studentId);
  if (existingUser) {
    addNotification({ userId:existingUser.id, title:'🎉 Re-enrolment Approved!', message:`Your returning student application for Year ${app.studyYear} of ${app.qualificationName} has been approved.`, type:'success' });
    return { isNew:false };
  }
  const tempPwd = 'EduHub@2026';
  const newUser = { id:`user-${Date.now()}`, name:`${app.firstName} ${app.lastName}`, email:app.email, role:'student', studentId:app.studentId, tempPassword:true };
  setUsers([...getUsers(), newUser]);
  const pwds = getPasswords();
  pwds[app.email.toLowerCase()] = tempPwd;
  setPasswords(pwds);
  addNotification({ userId:newUser.id, title:'🎉 Application Approved!', message:`Your application has been approved. Student ID: ${app.studentId}. Temporary password: ${tempPwd}. Please log in and change your password.`, type:'success' });
  getUsers().filter(u => u.role === 'admin').forEach(a => addNotification({ userId:a.id, title:'Application Approved', message:`Approved ${app.firstName} ${app.lastName}'s application. Student ID: ${app.studentId}.`, type:'success' }));
  sendApprovalEmail(app, tempPwd);
  return { tempPassword:tempPwd, isNew:true };
}

function declineApplication(id, reason) {
  setApplications(getApplications().map(a => a.id === id ? {...a, status:'declined', declineReason:reason} : a));
  const app = getApplications().find(a => a.id === id);
  if (app) {
    addNotification({ userId:app.studentId, title:'Application Update', message:`Your application was not approved. Reason: ${reason}`, type:'error' });
    sendRejectionEmail(app, reason);
  }
}

/* ═══════════════════════════════════════════════════
   REGISTRATIONS
   ═══════════════════════════════════════════════════ */
function submitRegistration(regData) {
  const reg = { ...regData, id:`REG-${Date.now()}`, submittedAt:new Date().toISOString(), status:'pending' };
  setRegistrations([reg, ...getRegistrations()]);
  getUsers().filter(u => u.role === 'admin').forEach(a => addNotification({ userId:a.id, title:'New Registration Submitted', message:`Student ${regData.studentId} submitted registration for ${regData.qualificationName}.`, type:'info' }));
  return reg;
}

function approveRegistration(id) {
  setRegistrations(getRegistrations().map(r => r.id === id ? {...r, status:'approved'} : r));
  const reg = getRegistrations().find(r => r.id === id);
  if (!reg) return;
  const student = getUsers().find(u => u.studentId === reg.studentId);
  if (student) addNotification({ userId:student.id, title:'✅ Registration Confirmed!', message:`Your registration for ${reg.qualificationName} — Year ${reg.studyYear}, Semester ${reg.semester} has been approved.`, type:'success' });
}

function declineRegistration(id, reason) {
  setRegistrations(getRegistrations().map(r => r.id === id ? {...r, status:'declined', declineReason:reason} : r));
  const reg = getRegistrations().find(r => r.id === id);
  if (!reg) return;
  const student = getUsers().find(u => u.studentId === reg.studentId);
  if (student) addNotification({ userId:student.id, title:'Registration Declined', message:`Your registration was declined. Reason: ${reason}`, type:'error' });
}

function doAllocateModules(applicationId, modules, semester, studyYear) {
  const app = getApplications().find(a => a.id === applicationId);
  if (!app) return;
  const fee = modules.length * 5000;
  setRegistrations(getRegistrations().filter(r => !(r.studentId === app.studentId && r.semester === semester && r.studyYear === studyYear)));
  const reg = {
    id:`ALLOC-${Date.now()}`, studentId:app.studentId, applicationId,
    qualificationCode:app.qualificationCode, qualificationName:app.qualificationName,
    modules, semester, studyYear, year:new Date().getFullYear(),
    status:'allocated', allocatedAt:new Date().toISOString(), allocatedBy:'Admin',
    submittedAt:new Date().toISOString(), totalFee:fee, feePaid:false
  };
  setRegistrations([reg, ...getRegistrations()]);
  const student = getUsers().find(u => u.studentId === app.studentId);
  if (student) addNotification({ userId:student.id, title:'📚 Modules Allocated!', message:`Your modules for ${app.qualificationName} — Year ${studyYear}, Semester ${semester} have been allocated. You have ${modules.length} modules.`, type:'success' });
  getUsers().filter(u => u.role === 'admin').forEach(a => addNotification({ userId:a.id, title:'Modules Allocated', message:`${modules.length} modules allocated to ${app.firstName} ${app.lastName} (${app.studentId}) for Semester ${semester}, Year ${studyYear}.`, type:'success' }));
}

/* ═══════════════════════════════════════════════════
   UI HELPERS
   ═══════════════════════════════════════════════════ */
function showAlert(containerId, msg, type='error') {
  const el = document.getElementById(containerId);
  if (!el) return;
  const colors = { error:'#fee2e2', success:'#d1fae5', info:'#eef2ff', warning:'#fef3c7' };
  const textColors = { error:'#dc2626', success:'#065f46', info:'#3730a3', warning:'#92400e' };
  el.innerHTML = `<div style="background:${colors[type]||colors.error};color:${textColors[type]||textColors.error};padding:12px 16px;border-radius:8px;font-size:14px;margin-bottom:12px;display:flex;gap:8px;align-items:flex-start">
    <span>${type==='error'?'⚠️':type==='success'?'✅':type==='warning'?'⚠️':'ℹ️'}</span><span>${msg}</span></div>`;
}
function clearAlert(id) { const el = document.getElementById(id); if (el) el.innerHTML=''; }

function setLoading(btnId, loading, text) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = loading;
  btn.textContent = text;
}

function badge(status) {
  const map = { pending:'badge-pending', approved:'badge-approved', declined:'badge-declined', allocated:'badge-approved', info:'badge-info' };
  return `<span class="badge ${map[status]||'badge-pending'}">${status}</span>`;
}

function fmtDate(d) { return d ? new Date(d).toLocaleDateString('en-ZA',{year:'numeric',month:'short',day:'numeric'}) : '—'; }
function fmtDateTime(d) { return d ? new Date(d).toLocaleString('en-ZA') : '—'; }

function showToast(msg, type='success', ms=3500) {
  const colors = { success:'#059669', error:'#dc2626', info:'#3730a3', warning:'#d97706' };
  const t = document.createElement('div');
  t.style.cssText = `position:fixed;bottom:28px;right:28px;z-index:9999;background:${colors[type]||colors.success};color:white;padding:14px 22px;border-radius:10px;box-shadow:0 4px 20px rgba(0,0,0,.2);font-size:14px;font-weight:600;max-width:420px;line-height:1.5;transition:opacity .3s`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity='0'; setTimeout(() => t.remove(), 300); }, ms);
}

function openModal(id)  { document.getElementById(id)?.classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id)?.classList.add('hidden'); }

/* ═══════════════════════════════════════════════════
   NAVBAR — uses relative paths via rootPath()
   ═══════════════════════════════════════════════════ */
function renderNavbar(activePage) {
  const user = getCurrentUser();
  const notifs = getUserNotifs(user);
  const unread = notifs.filter(n => !n.read).length;
  const r = rootPath; // shorthand

  let links = '';
  if (!user) {
    links = `
      <a href="${r('index.html')}" class="nav-link ${activePage==='home'?'active':''}">Home</a>
      <a href="${r('public/Programmes.html')}" class="nav-link ${activePage==='programmes'?'active':''}">Programmes</a>
      <a href="${r('public/Apply.html')}" class="nav-link highlight ${activePage==='apply'?'active':''}">Apply</a>
      <a href="${r('public/Login.html')}" class="nav-link ${activePage==='login'?'active':''}">Login</a>`;
  } else if (user.role === 'admin') {
    links = `
      <a href="${r('admin/Dashboard.html')}" class="nav-link ${activePage==='admin-dashboard'?'active':''}">Dashboard</a>
      <a href="${r('admin/Applications.html')}" class="nav-link ${activePage==='admin-apps'?'active':''}">Applications</a>
      <a href="${r('admin/Registrations.html')}" class="nav-link ${activePage==='admin-regs'?'active':''}">Registrations</a>
      <a href="${r('admin/Allocations.html')}" class="nav-link highlight ${activePage==='admin-alloc'?'active':''}">Allocate</a>
      <a href="${r('admin/Courses.html')}" class="nav-link ${activePage==='admin-courses'?'active':''}">Courses</a>
      <a href="${r('admin/Users.html')}" class="nav-link ${activePage==='admin-users'?'active':''}">Users</a>
      <a href="${r('admin/Reports.html')}" class="nav-link ${activePage==='admin-reports'?'active':''}">Reports</a>`;
  } else if (user.role === 'student') {
    links = `
      <a href="${r('student/Dashboard.html')}" class="nav-link ${activePage==='student-dashboard'?'active':''}">Dashboard</a>
      <a href="${r('student/Courses.html')}" class="nav-link ${activePage==='student-courses'?'active':''}">Courses</a>
      <a href="${r('student/Register.html')}" class="nav-link ${activePage==='student-register'?'active':''}">Register</a>
      <a href="${r('student/MyCourses.html')}" class="nav-link ${activePage==='student-mycourses'?'active':''}">My Courses</a>
      <a href="${r('student/Applications.html')}" class="nav-link ${activePage==='student-applications'?'active':''}">Applications</a>
      <a href="${r('student/Profile.html')}" class="nav-link ${activePage==='student-profile'?'active':''}">Profile</a>`;
  } else if (user.role === 'lecturer') {
    links = `
      <a href="${r('lecturer/Dashboard.html')}" class="nav-link ${activePage==='lecturer-dashboard'?'active':''}">Dashboard</a>
      <a href="${r('lecturer/MyCourses.html')}" class="nav-link ${activePage==='lecturer-courses'?'active':''}">My Courses</a>
      <a href="${r('lecturer/Roster.html')}" class="nav-link ${activePage==='lecturer-roster'?'active':''}">Roster</a>
      <a href="${r('lecturer/Announcements.html')}" class="nav-link ${activePage==='lecturer-announcements'?'active':''}">Announcements</a>`;
  }

  const userArea = user ? `
    <div style="position:relative;display:inline-block">
      <button onclick="toggleNotifs(event)" class="notif-btn" id="notif-btn">🔔
        ${unread > 0 ? `<span class="notif-badge">${unread}</span>` : ''}
      </button>
      <div id="notif-dropdown" class="hidden" style="position:absolute;right:0;top:46px;width:360px;background:white;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.2);z-index:200;overflow:hidden;border:1px solid #e5e7eb">
        <div style="padding:14px 16px;border-bottom:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center">
          <span style="font-weight:700;color:#001A4D;font-size:15px">Notifications</span>
          ${unread > 0 ? `<span style="font-size:12px;color:#123f7a">${unread} unread</span>` : ''}
        </div>
        <div style="max-height:340px;overflow-y:auto">
          ${notifs.length === 0 ? '<div style="padding:24px;text-align:center;color:#6b7280;font-size:14px">No notifications yet</div>' :
            notifs.map(n => `<div onclick="doMarkRead('${n.id}')" style="padding:12px 16px;border-bottom:1px solid #e5e7eb;cursor:pointer;background:${n.read?'white':'#EEF2FF'}">
              <div style="font-weight:600;font-size:13px;color:#001A4D;margin-bottom:3px">${n.title}</div>
              <div style="font-size:12px;color:#6b7280;line-height:1.5">${n.message}</div>
              <div style="font-size:11px;color:#9CA3AF;margin-top:4px">${fmtDateTime(n.createdAt)}</div>
            </div>`).join('')
          }
        </div>
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:10px;margin-left:12px">
      <div style="text-align:right">
        <div style="font-size:13px;font-weight:600">${user.name}</div>
      </div>
      <button onclick="doLogout()" style="background:rgba(255,255,255,.15);color:white;border:1px solid rgba(255,255,255,.3);padding:6px 14px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer">Logout</button>
    </div>` : '';

  const nav = document.createElement('nav');
  nav.className = 'navbar';

  // Build logo link via DOM for reliability across all pages
  const logoLink = document.createElement('a');
  logoLink.href = r('index.html');
  logoLink.style.cssText = 'display:flex;align-items:center;gap:10px;text-decoration:none';

  // EduHub SVG logo (shield icon + wordmark)
  const logoSvg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  logoSvg.setAttribute('width','38');
  logoSvg.setAttribute('height','38');
  logoSvg.setAttribute('viewBox','0 0 38 38');
  logoSvg.setAttribute('fill','none');
  logoSvg.innerHTML = `
    <rect width="38" height="38" rx="9" fill="white" fill-opacity="0.15"/>
    <path d="M19 5 L32 11 L32 20 C32 27 25.5 33 19 35 C12.5 33 6 27 6 20 L6 11 Z" fill="white" fill-opacity="0.9"/>
    <path d="M19 9 L28.5 13.5 L28.5 20.5 C28.5 25.5 24 30 19 31.5 C14 30 9.5 25.5 9.5 20.5 L9.5 13.5 Z" fill="#123f7a"/>
    <text x="19" y="24" text-anchor="middle" font-family="Montserrat,Arial,sans-serif" font-size="10" font-weight="900" fill="white">E</text>`;
  logoLink.appendChild(logoSvg);

  const logoTextWrap = document.createElement('div');
  logoTextWrap.style.cssText = 'display:flex;flex-direction:column;line-height:1';
  const logoWordmark = document.createElement('span');
  logoWordmark.style.cssText = 'font-family:Montserrat,Arial,sans-serif;font-size:20px;font-weight:900;color:white;letter-spacing:1px';
  logoWordmark.textContent = 'EduHub';
  const logoTagline = document.createElement('span');
  logoTagline.style.cssText = 'font-size:9px;color:rgba(255,255,255,0.65);letter-spacing:0.5px;margin-top:1px';
  logoTagline.textContent = 'eduhub.ac.za';
  logoTextWrap.appendChild(logoWordmark);
  logoTextWrap.appendChild(logoTagline);
  logoLink.appendChild(logoTextWrap);

  // Build the links + user area via innerHTML (no large base64 here)
  const linksDiv = document.createElement('div');
  linksDiv.style.cssText = 'display:flex;align-items:center;gap:2px;flex-wrap:wrap';
  linksDiv.innerHTML = `${links}${userArea}`;

  nav.appendChild(logoLink);
  nav.appendChild(linksDiv);

  const placeholder = document.getElementById('navbar-root');
  if (placeholder) {
    placeholder.replaceWith(nav);
  } else {
    document.body.insertBefore(nav, document.body.firstChild);
  }
}

function toggleNotifs(event) {
  if (event) event.stopPropagation();
  document.getElementById('notif-dropdown')?.classList.toggle('hidden');
}

function doMarkRead(id) { markNotifRead(id); location.reload(); }
function doLogout() { logout(); window.location.href = rootPath('index.html'); }

// Close notif dropdown when clicking outside
document.addEventListener('click', function(e) {
  const dd = document.getElementById('notif-dropdown');
  const btn = document.getElementById('notif-btn');
  if (dd && !dd.classList.contains('hidden') && !dd.contains(e.target) && (!btn || !btn.contains(e.target))) {
    dd.classList.add('hidden');
  }
});

/* ═══════════════════════════════════════════════════
   ADDITIONAL HELPERS — new pages
   ═══════════════════════════════════════════════════ */

// POST /api/auth/register
function registerUser(firstName, lastName, email, password, phone, idNumber) {
  const users = getUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase()))
    return { success:false, message:'An account with this email already exists.' };
  if (password.length < 8)
    return { success:false, message:'Password must be at least 8 characters.' };
  const newUser = {
    id: `user-${Date.now()}`,
    name: `${firstName} ${lastName}`,
    firstName, lastName,
    email: email.toLowerCase(),
    phone: phone || '',
    idNumber: idNumber || '',
    role: 'student',
    studentId: generateStudentId(),
    status: 'active',
    tempPassword: false,
    createdAt: new Date().toISOString(),
  };
  setUsers([...users, newUser]);
  const pwds = getPasswords();
  pwds[email.toLowerCase()] = password;
  setPasswords(pwds);
  getUsers().filter(u => u.role === 'admin').forEach(a =>
    addNotification({ userId:a.id, title:'🆕 New Account Registered',
      message:`${newUser.name} (${email}) created an account.`, type:'info' })
  );
  return { success:true, user:newUser };
}

// POST /api/auth/forgot-password  (localStorage: just validate email exists)
function requestPasswordReset(email) {
  const user = getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  // Always succeed to avoid email enumeration, but store a reset token
  const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
  if (user) {
    const resets = load('pwdResets', {});
    resets[token] = { userId: user.id, email: user.email.toLowerCase(), createdAt: Date.now() };
    save('pwdResets', resets);
  }
  return { success:true, token: user ? token : null,
    message:'If an account with that email exists, a reset link has been sent.' };
}

// POST /api/auth/reset-password
function resetPasswordWithToken(token, newPassword) {
  const resets = load('pwdResets', {});
  const entry  = resets[token];
  if (!entry) return { success:false, message:'Invalid or expired reset token.' };
  if (Date.now() - entry.createdAt > 3600000) return { success:false, message:'Reset token has expired.' };
  if (newPassword.length < 8) return { success:false, message:'Password must be at least 8 characters.' };
  const pwds = getPasswords();
  pwds[entry.email] = newPassword;
  setPasswords(pwds);
  setUsers(getUsers().map(u => u.id === entry.userId ? {...u, tempPassword:false} : u));
  delete resets[token];
  save('pwdResets', resets);
  return { success:true, message:'Password reset successfully. You can now log in.' };
}

// PUT /api/users/profile
function updateProfile(userId, patch) {
  const users = getUsers();
  const idx   = users.findIndex(u => u.id === userId);
  if (idx === -1) return { success:false, message:'User not found.' };
  const user  = { ...users[idx], ...patch, updatedAt: new Date().toISOString() };
  if (patch.firstName || patch.lastName)
    user.name = `${user.firstName||''} ${user.lastName||''}`.trim();
  users[idx] = user;
  setUsers(users);
  const cur = getCurrentUser();
  if (cur && cur.id === userId) setCurrentUser(user);
  return { success:true, user };
}

// POST /api/users/avatar (localStorage: store data URL)
function uploadAvatar(userId, dataUrl) {
  updateProfile(userId, { avatarUrl: dataUrl });
  return { success:true };
}

// Courses — admin CRUD helpers
function getCourses() { return QUALIFICATIONS; }  // uses static data; in backend: GET /api/courses

function getAnnouncements() { return load('announcements', []); }
function saveAnnouncements(v) { save('announcements', v); }

function addAnnouncement(ann) {
  const list = getAnnouncements();
  const item = { ...ann, id:`ANN-${Date.now()}`, createdAt: new Date().toISOString() };
  saveAnnouncements([item, ...list]);
  return item;
}

function getAuditLogs() { return load('auditLogs', []); }
function addAuditLog(entry) {
  const logs = getAuditLogs();
  save('auditLogs', [{ ...entry, id:`LOG-${Date.now()}`, createdAt: new Date().toISOString() }, ...logs].slice(0, 200));
}

// Update navbar to include new pages
// (renderNavbar is redefined below — replaces the one above)

/* ═══════════════════════════════════════════════════
   SA ID — Date of Birth cross-validation
   First 6 digits of SA ID must be YYMMDD of birth date
   ═══════════════════════════════════════════════════ */
function validateSAIdDOB(idNumber, dateOfBirth) {
  if (!idNumber || idNumber.length < 6 || !dateOfBirth) return true;
  const parts = dateOfBirth.split('-'); // yyyy-mm-dd
  if (parts.length !== 3) return true;
  const expected = parts[0].slice(-2) + parts[1] + parts[2];
  return idNumber.slice(0, 6) === expected;
}

/* ═══════════════════════════════════════════════════
   EMAIL — EmailJS integration
   ═══════════════════════════════════════════════════
   HOW TO SET UP (free at emailjs.com):
   1. Sign up at https://www.emailjs.com
   2. Add Email Service → connect Gmail/Outlook → copy Service ID
   3. Create Email Template:
      To:      {{to_email}}
      Subject: {{subject}}
      Body:    {{{html_body}}}   ← triple braces for raw HTML
      Copy Template ID
   4. Account → General → Public Key → copy it
   5. Paste all three values below and set EMAILJS_CONFIGURED = true
   ═══════════════════════════════════════════════════ */
const EMAILJS_CONFIG = {
  SERVICE_ID:  'service_service_t0ofow9',
  TEMPLATE_ID: 'template_qhuhhxz',
  PUBLIC_KEY:  'OEaUhfQefKiKSgys',
};
const EMAILJS_CONFIGURED = true; // ← set true once credentials are filled in

async function sendApprovalEmail(app, tempPassword) {
  const isForeign = app.nationality !== 'South African';
  const docs = (app.docsUploaded && app.docsUploaded.length > 0) ? app.docsUploaded : (isForeign
    ? ['Certified copy of Passport (all pages)', 'Study permit / visa', 'Proof of payment / funding letter', 'Passport photo', 'SAQA evaluation letter']
    : ['Certified copy of SA ID document', 'Certified copy of Matric certificate', 'Proof of payment / funding letter', 'Passport photo']);

  const date = new Date(app.submittedAt).toLocaleDateString('en-ZA', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  const docRows = docs.map(d =>
    `<tr><td style="padding:9px 14px;border-bottom:1px solid #E5E7EB;font-size:14px;color:#374151;">` +
    `<span style="display:inline-block;width:18px;height:18px;background:#059669;border-radius:3px;color:white;font-weight:700;font-size:11px;text-align:center;line-height:18px;margin-right:8px;vertical-align:middle;">✓</span>${d}</td></tr>`
  ).join('');

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#F4F6FB;font-family:Arial,Helvetica,sans-serif;">
<div style="max-width:620px;margin:32px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,26,77,0.12);">
  <div style="background:linear-gradient(135deg,#001A4D 0%,#003DA5 100%);padding:36px 40px;color:white;">
    <div style="font-size:26px;font-weight:900;letter-spacing:3px;margin-bottom:4px;">EDUHUB</div>
    <div style="font-size:12px;opacity:0.6;letter-spacing:1px;">STUDENT PORTAL</div>
  </div>
  <div style="background:#059669;color:white;text-align:center;padding:18px 24px;">
    <div style="font-size:26px;margin-bottom:6px;">🎉</div>
    <div style="font-weight:800;font-size:17px;">CONGRATULATIONS! YOUR APPLICATION IS APPROVED</div>
  </div>
  <div style="padding:36px 40px;">
    <p style="font-size:21px;font-weight:700;color:#001A4D;margin:0 0 14px;">Dear ${app.firstName} ${app.lastName},</p>
    <p style="font-size:15px;color:#374151;line-height:1.75;margin:0 0 18px;">We are <strong>thrilled to inform you</strong> that your application to <strong>EduHub</strong> has been <strong style="color:#059669;">approved</strong>. Welcome to the EduHub family! 🎓</p>
    <div style="background:linear-gradient(135deg,#001A4D,#1a4da8);border-radius:14px;padding:26px 30px;color:white;text-align:center;margin:24px 0;">
      <div style="font-size:12px;opacity:0.65;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:10px;">Your Student ID Number</div>
      <div style="font-family:'Courier New',monospace;font-size:26px;font-weight:700;background:rgba(255,255,255,0.15);padding:10px 28px;border-radius:8px;display:inline-block;letter-spacing:2px;">${app.studentId}</div>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:14px;border:1px solid #E5E7EB;margin-bottom:24px;">
      <tr style="background:#F4F6FB;"><td style="padding:10px 14px;font-weight:600;color:#6B7280;width:45%;border-bottom:1px solid #E5E7EB;">Full Name</td><td style="padding:10px 14px;color:#001A4D;border-bottom:1px solid #E5E7EB;">${app.firstName} ${app.lastName}</td></tr>
      <tr><td style="padding:10px 14px;font-weight:600;color:#6B7280;border-bottom:1px solid #E5E7EB;">Qualification</td><td style="padding:10px 14px;color:#001A4D;border-bottom:1px solid #E5E7EB;"><strong>${app.qualificationName}</strong> (${app.qualificationCode})</td></tr>
      <tr style="background:#F4F6FB;"><td style="padding:10px 14px;font-weight:600;color:#6B7280;border-bottom:1px solid #E5E7EB;">Admitted For</td><td style="padding:10px 14px;color:#001A4D;border-bottom:1px solid #E5E7EB;">${app.admissionFor || '1st Semester'}</td></tr>
      <tr><td style="padding:10px 14px;font-weight:600;color:#6B7280;">Date Submitted</td><td style="padding:10px 14px;color:#001A4D;">${date}</td></tr>
    </table>
    <div style="background:#EEF2FF;border:1px solid #C7D2FE;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
      <p style="font-weight:700;color:#001A4D;font-size:15px;margin:0 0 12px;">🔑 Your Portal Login Credentials</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:8px 0;font-weight:600;color:#6B7280;width:150px;">Login Email</td><td style="padding:8px 0;color:#001A4D;font-family:monospace;font-weight:700;">${app.email}</td></tr>
        <tr><td style="padding:8px 0;font-weight:600;color:#6B7280;">Temporary Password</td><td style="padding:8px 0;"><span style="background:#001A4D;color:white;font-family:monospace;font-weight:700;font-size:15px;padding:4px 14px;border-radius:6px;letter-spacing:1px;">${tempPassword}</span></td></tr>
      </table>
      <div style="background:#FEF3C7;border:1px solid #FDE68A;border-radius:8px;padding:10px 14px;margin-top:14px;font-size:13px;color:#92400e;">⚠️ <strong>Important:</strong> Temporary password — you will be prompted to change it on first login.</div>
    </div>
    <div style="border:2px solid #FEF3C7;border-radius:12px;overflow:hidden;margin-bottom:24px;">
      <div style="background:#FEF3C7;padding:14px 20px;"><p style="font-weight:800;color:#92400e;font-size:15px;margin:0;">📎 ACTION REQUIRED — Submit Documents Within 3–5 Business Days</p></div>
      <div style="padding:16px 20px;">
        <p style="font-size:14px;color:#374151;line-height:1.7;margin:0 0 14px;">Email certified copies to <strong>admissions@eduhub.ac.za</strong> with Student ID <strong>${app.studentId}</strong> in the subject line. <strong style="color:#dc2626;">Failure to submit within 3–5 business days will result in your application being cancelled.</strong></p>
        <table style="width:100%;border-collapse:collapse;border:1px solid #E5E7EB;">${docRows}</table>
      </div>
    </div>
    <p style="font-size:14px;color:#374151;line-height:1.7;">Warm regards,<br/><strong style="color:#001A4D;">The Admissions Team</strong><br/>EduHub<br/>📧 admissions@eduhub.ac.za · 📞 0860 742 434</p>
  </div>
  <div style="background:#001A4D;padding:24px 40px;color:rgba(255,255,255,0.5);font-size:12px;text-align:center;">
    <div style="color:white;font-weight:700;font-size:14px;letter-spacing:2px;margin-bottom:4px;">EDUHUB</div>
    <div>Johannesburg · Cape Town · Durban · Pretoria</div>
  </div>
</div></body></html>`;

  // Always store locally for preview
  const sent = load('sentEmails', []);
  sent.unshift({ to:app.email, toName:`${app.firstName} ${app.lastName}`,
    subject:`🎉 Application Approved — Welcome to EduHub | ${app.studentId}`,
    html, sentAt:new Date().toISOString(), type:'approval' });
  save('sentEmails', sent.slice(0, 30));

  if (!EMAILJS_CONFIGURED) {
    console.log(`📧 [DEV] Approval email queued for ${app.email}. Set EMAILJS_CONFIGURED=true to send for real.`);
    // Show in-app toast notification for admin
    _showEmailDevToast(app.email, `🎉 Application Approved — Welcome to EduHub | ${app.studentId}`);
    return { success:true, mode:'dev' };
  }

  try {
    // Load EmailJS SDK if not already present
    if (!window.emailjs) {
      await new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
        s.onload = resolve;
        s.onerror = () => reject(new Error('Failed to load EmailJS SDK. Check your internet connection.'));
        document.head.appendChild(s);
      });
    }

    // Initialise with public key (v4 API)
    window.emailjs.init({ publicKey: EMAILJS_CONFIG.PUBLIC_KEY });

    // EmailJS free plan has a ~50 KB limit per variable.
    // We send a plain-text fallback for the body and rely on the HTML template
    // to render it. The full HTML is stored locally for preview in the Email Log.
    const result = await window.emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      {
        to_email:        app.email,
        to_name:         `${app.firstName} ${app.lastName}`,
        from_name:       'EduHub Admissions',
        from_email:      'admissions@eduhub.ac.za',
        reply_to:        'admissions@eduhub.ac.za',
        subject:         `🎉 Application Approved — Welcome to EduHub | ${app.studentId}`,
        student_name:    `${app.firstName} ${app.lastName}`,
        student_id:      app.studentId,
        qualification:   `${app.qualificationName} (${app.qualificationCode})`,
        temp_password:   tempPassword,
        login_email:     app.email,
        admitted_for:    app.admissionFor || '1st Semester',
        html_body:       html,
      }
    );

    console.log('✅ EmailJS send success:', result.status, result.text);
    return { success: true, mode: 'sent' };
  } catch(err) {
    console.error('❌ EmailJS error:', err);
    // Show visible error toast so admin knows it failed
    _showEmailErrorToast(app.email, String(err));
    return { success: false, error: String(err) };
  }
}

/* ═══════════════════════════════════════════════════
   EMAIL HELPERS
   ═══════════════════════════════════════════════════ */
function getSentEmails() { return load('sentEmails', []); }

async function sendRejectionEmail(app, reason) {
  const date = new Date().toLocaleDateString('en-ZA', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#F4F6FB;font-family:Arial,Helvetica,sans-serif;">
<div style="max-width:620px;margin:32px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,26,77,0.12);">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#001A4D 0%,#003DA5 100%);padding:36px 40px;color:white;">
    <div style="font-size:26px;font-weight:900;letter-spacing:3px;margin-bottom:4px;">EDUHUB</div>
    <div style="font-size:12px;opacity:0.6;letter-spacing:1px;">ADMISSIONS OFFICE</div>
  </div>

  <!-- Subject banner -->
  <div style="background:#374151;color:white;text-align:center;padding:16px 24px;">
    <div style="font-weight:700;font-size:15px;letter-spacing:.5px;">APPLICATION OUTCOME — ${date}</div>
  </div>

  <!-- Body -->
  <div style="padding:38px 40px;">
    <p style="font-size:20px;font-weight:700;color:#001A4D;margin:0 0 20px;">Dear ${app.firstName} ${app.lastName},</p>

    <p style="font-size:15px;color:#374151;line-height:1.8;margin:0 0 16px;">
      Thank you for applying to <strong>EduHub</strong>. We truly appreciate the time and effort you put into your application.
    </p>

    <p style="font-size:15px;color:#374151;line-height:1.8;margin:0 0 20px;">
      After careful review, we regret to inform you that we are <strong style="color:#dc2626;">unable to offer you admission</strong> for this intake. This decision was made due to the highly competitive nature of the selection process and the fact that your application did not fully meet the current programme requirements.
    </p>

    ${reason ? `
    <div style="background:#FEF2F2;border:1px solid #FECACA;border-left:4px solid #dc2626;border-radius:8px;padding:16px 20px;margin-bottom:20px;">
      <div style="font-size:13px;font-weight:700;color:#991b1b;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;">Reason noted on file</div>
      <div style="font-size:14px;color:#7f1d1d;line-height:1.6;">${reason}</div>
    </div>` : ''}

    <p style="font-size:15px;color:#374151;line-height:1.8;margin:0 0 16px;">
      We understand that this may be disappointing. Please know that this outcome does not reflect your potential, and we strongly encourage you to continue pursuing your academic goals.
    </p>

    <!-- Encouragement box -->
    <div style="background:#EEF2FF;border:1px solid #C7D2FE;border-radius:12px;padding:22px 26px;margin-bottom:24px;">
      <div style="font-weight:700;color:#001A4D;font-size:15px;margin-bottom:14px;">💡 You may consider the following steps:</div>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:8px 10px;font-size:14px;color:#374151;border-bottom:1px solid #C7D2FE;">
            <span style="display:inline-block;width:22px;height:22px;background:#4f46e5;border-radius:4px;color:white;font-weight:700;font-size:12px;text-align:center;line-height:22px;margin-right:10px;vertical-align:middle;">1</span>
            Improving your academic results or obtaining additional qualifications
          </td>
        </tr>
        <tr>
          <td style="padding:8px 10px;font-size:14px;color:#374151;border-bottom:1px solid #C7D2FE;">
            <span style="display:inline-block;width:22px;height:22px;background:#4f46e5;border-radius:4px;color:white;font-weight:700;font-size:12px;text-align:center;line-height:22px;margin-right:10px;vertical-align:middle;">2</span>
            Gaining relevant work experience in your field of interest
          </td>
        </tr>
        <tr>
          <td style="padding:8px 10px;font-size:14px;color:#374151;border-bottom:1px solid #C7D2FE;">
            <span style="display:inline-block;width:22px;height:22px;background:#4f46e5;border-radius:4px;color:white;font-weight:700;font-size:12px;text-align:center;line-height:22px;margin-right:10px;vertical-align:middle;">3</span>
            Exploring alternative programmes aligned with your interests
          </td>
        </tr>
        <tr>
          <td style="padding:8px 10px;font-size:14px;color:#374151;">
            <span style="display:inline-block;width:22px;height:22px;background:#4f46e5;border-radius:4px;color:white;font-weight:700;font-size:12px;text-align:center;line-height:22px;margin-right:10px;vertical-align:middle;">4</span>
            Reapplying in a future intake once the necessary requirements have been met
          </td>
        </tr>
      </table>
    </div>

    <p style="font-size:15px;color:#374151;line-height:1.8;margin:0 0 24px;">
      We would be <strong>happy to receive a future application</strong> from you once the necessary requirements have been met. Thank you again for considering EduHub. We wish you every success in your future studies and career.
    </p>

    <p style="font-size:14px;color:#374151;line-height:1.8;margin:0;">
      Warm regards,<br/>
      <strong style="color:#001A4D;font-size:15px;">Admissions Office</strong><br/>
      EduHub<br/>
      <span style="color:#6b7a99;">📧 admissions@eduhub.ac.za &nbsp;·&nbsp; 📞 0860 742 434</span>
    </p>
  </div>

  <!-- Footer -->
  <div style="background:#001A4D;padding:24px 40px;color:rgba(255,255,255,0.5);font-size:12px;text-align:center;">
    <div style="color:white;font-weight:700;font-size:14px;letter-spacing:2px;margin-bottom:4px;">EDUHUB</div>
    <div>Johannesburg · Cape Town · Durban · Pretoria</div>
    <div style="margin-top:8px;font-size:11px;">This is an automated message. Please do not reply directly to this email.</div>
  </div>

</div>
</body></html>`;

  // Store locally for Email Log preview
  const sent = load('sentEmails', []);
  sent.unshift({
    to: app.email,
    toName: `${app.firstName} ${app.lastName}`,
    subject: `Application Outcome — EduHub | ${app.studentId || app.firstName + ' ' + app.lastName}`,
    html,
    sentAt: new Date().toISOString(),
    type: 'rejection'
  });
  save('sentEmails', sent.slice(0, 30));

  if (!EMAILJS_CONFIGURED) {
    console.log(`📧 [DEV] Rejection email queued for ${app.email}.`);
    _showEmailDevToast(app.email, `Application Outcome — EduHub`);
    return { success: true, mode: 'dev' };
  }

  try {
    if (!window.emailjs) {
      await new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
        s.onload = resolve;
        s.onerror = () => reject(new Error('Failed to load EmailJS SDK.'));
        document.head.appendChild(s);
      });
    }
    window.emailjs.init({ publicKey: EMAILJS_CONFIG.PUBLIC_KEY });
    await window.emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      {
        to_email:     app.email,
        to_name:      `${app.firstName} ${app.lastName}`,
        from_name:    'EduHub Admissions',
        from_email:   'admissions@eduhub.ac.za',
        reply_to:     'admissions@eduhub.ac.za',
        subject:      `Application Outcome — EduHub | ${app.studentId || app.firstName + ' ' + app.lastName}`,
        student_name: `${app.firstName} ${app.lastName}`,
        html_body:    html,
      }
    );
    console.log('✅ Rejection email sent to', app.email);
    return { success: true, mode: 'sent' };
  } catch(err) {
    console.error('❌ EmailJS rejection error:', err);
    _showEmailErrorToast(app.email, String(err));
    return { success: false, error: String(err) };
  }
}

/* In-app toast shown to admin when EMAILJS_CONFIGURED=false */
function _showEmailDevToast(toEmail, subject) {
  // Only mount once
  if (document.getElementById('_eduhub_email_toast')) {
    document.getElementById('_eduhub_email_toast').remove();
  }
  const toast = document.createElement('div');
  toast.id = '_eduhub_email_toast';
  toast.style.cssText = `
    position:fixed;bottom:28px;right:28px;z-index:9999;
    background:#fff;border:1px solid #d4dbe8;border-left:4px solid #1a9e8f;
    border-radius:10px;box-shadow:0 6px 28px rgba(0,0,0,.15);
    padding:16px 20px;max-width:370px;font-family:Arial,sans-serif;
    animation:slideUp .35s cubic-bezier(.34,1.56,.64,1);
  `;
  if (!document.getElementById('_ehToastKF')) {
    const s = document.createElement('style');
    s.id = '_ehToastKF';
    s.textContent = '@keyframes slideUp{from{transform:translateY(40px);opacity:0}to{transform:translateY(0);opacity:1}}';
    document.head.appendChild(s);
  }
  toast.innerHTML = `
    <div style="display:flex;align-items:flex-start;gap:12px">
      <span style="font-size:1.4rem;flex-shrink:0">📧</span>
      <div style="flex:1;min-width:0">
        <div style="font-weight:700;font-size:.88rem;color:#123f7a;margin-bottom:3px">Approval Email Queued</div>
        <div style="font-size:.78rem;color:#6b7a99;margin-bottom:2px">To: <strong style="color:#1e2a3a">${toEmail}</strong></div>
        <div style="font-size:.74rem;color:#6b7a99;margin-bottom:8px;word-break:break-word">${subject}</div>
        <div style="font-size:.73rem;background:#FEF3C7;border-radius:5px;padding:6px 9px;color:#92400e;line-height:1.5">
          ⚠️ <strong>Dev mode:</strong> Email stored locally. Configure EmailJS in <code>shared-local.js</code> to send real emails.
        </div>
      </div>
      <button onclick="this.closest('#_eduhub_email_toast').remove()" style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:1rem;flex-shrink:0;padding:0;line-height:1">✕</button>
    </div>`;
  document.body.appendChild(toast);
  setTimeout(() => toast && toast.remove(), 8000);
}

/* In-app error toast shown when EmailJS send fails */
function _showEmailErrorToast(toEmail, errorMsg) {
  if (document.getElementById('_eduhub_email_err_toast')) {
    document.getElementById('_eduhub_email_err_toast').remove();
  }
  const toast = document.createElement('div');
  toast.id = '_eduhub_email_err_toast';
  toast.style.cssText = `
    position:fixed;bottom:28px;right:28px;z-index:9999;
    background:#fff;border:1px solid #fca5a5;border-left:4px solid #dc2626;
    border-radius:10px;box-shadow:0 6px 28px rgba(0,0,0,.15);
    padding:16px 20px;max-width:400px;font-family:Arial,sans-serif;
    animation:slideUp .35s cubic-bezier(.34,1.56,.64,1);
  `;
  toast.innerHTML = `
    <div style="display:flex;align-items:flex-start;gap:12px">
      <span style="font-size:1.4rem;flex-shrink:0">❌</span>
      <div style="flex:1;min-width:0">
        <div style="font-weight:700;font-size:.88rem;color:#dc2626;margin-bottom:3px">Email Failed to Send</div>
        <div style="font-size:.78rem;color:#6b7a99;margin-bottom:6px">To: <strong style="color:#1e2a3a">${toEmail}</strong></div>
        <div style="font-size:.74rem;background:#FEE2E2;border-radius:5px;padding:6px 9px;color:#991b1b;line-height:1.5;word-break:break-word">${errorMsg}</div>
        <div style="font-size:.72rem;color:#6b7a99;margin-top:6px">Check the Email Log below — the email HTML is saved there. Check browser console (F12) for details.</div>
      </div>
      <button onclick="this.closest('#_eduhub_email_err_toast').remove()" style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:1rem;flex-shrink:0;padding:0;line-height:1">✕</button>
    </div>`;
  document.body.appendChild(toast);
  setTimeout(() => toast && toast.remove(), 12000);
}

/* ═══════════════════════════════════════════════════
   EVENTS / CALENDAR  (admin creates → all roles see)
   ═══════════════════════════════════════════════════ */
function getEvents()      { return load('events', []); }
function setEvents(v)     { save('events', v); }

function createEvent(ev) {
  const events = getEvents();
  const newEv = {
    id: 'ev-' + Date.now(),
    title: ev.title,
    date: ev.date,
    time: ev.time || '',
    type: ev.type || 'general',       // general | academic | exam | holiday
    audience: ev.audience || 'all',   // all | students | lecturers
    description: ev.description || '',
    createdBy: ev.createdBy || 'admin',
    createdAt: new Date().toISOString(),
  };
  events.push(newEv);
  setEvents(events);
  return newEv;
}

function deleteEvent(id) {
  setEvents(getEvents().filter(e => e.id !== id));
}

function getEventsForDate(dateStr) {
  return getEvents().filter(e => e.date === dateStr);
}

function getUpcomingEvents(role) {
  const today = new Date();
  today.setHours(0,0,0,0);
  return getEvents()
    .filter(e => {
      const d = new Date(e.date);
      d.setHours(0,0,0,0);
      const matchAudience = e.audience === 'all'
        || (role === 'student'  && (e.audience === 'students' || e.audience === 'all'))
        || (role === 'lecturer' && (e.audience === 'lecturers' || e.audience === 'all'))
        || role === 'admin';
      return d >= today && matchAudience;
    })
    .sort((a,b) => new Date(a.date) - new Date(b.date))
    .slice(0, 10);
}

/* ═══════════════════════════════════════════════════
   MESSAGES  (student → lecturer & replies)
   ═══════════════════════════════════════════════════ */
function getMessages()   { return load('messages', []); }
function setMessages(v)  { save('messages', v); }

function sendMessage(fromUserId, toUserId, subject, body) {
  const msgs = getMessages();
  const msg = {
    id: 'msg-' + Date.now(),
    from: fromUserId,
    to: toUserId,
    subject,
    body,
    sentAt: new Date().toISOString(),
    read: false,
    replies: []
  };
  msgs.push(msg);
  setMessages(msgs);
  return msg;
}

function replyMessage(msgId, fromUserId, body) {
  const msgs = getMessages();
  const msg = msgs.find(m => m.id === msgId);
  if (!msg) return;
  msg.replies.push({ from: fromUserId, body, sentAt: new Date().toISOString() });
  setMessages(msgs);
}

function markMessageRead(msgId) {
  const msgs = getMessages();
  const msg = msgs.find(m => m.id === msgId);
  if (msg) { msg.read = true; setMessages(msgs); }
}

function getInboxFor(userId) {
  return getMessages().filter(m => m.to === userId).sort((a,b) => new Date(b.sentAt) - new Date(a.sentAt));
}

function getSentBy(userId) {
  return getMessages().filter(m => m.from === userId).sort((a,b) => new Date(b.sentAt) - new Date(a.sentAt));
}

/* ═══════════════════════════════════════════════════
   SCHOOL EMAILS  (admin sends to students)
   ═══════════════════════════════════════════════════ */
function getSchoolEmails(studentId) {
  return load('schoolEmails_' + studentId, []);
}
function addSchoolEmail(studentId, email) {
  const emails = getSchoolEmails(studentId);
  emails.unshift({ id: 'se-' + Date.now(), ...email, sentAt: new Date().toISOString(), read: false });
  save('schoolEmails_' + studentId, emails.slice(0, 50));
}
function markSchoolEmailRead(studentId, emailId) {
  const emails = getSchoolEmails(studentId);
  const e = emails.find(x => x.id === emailId);
  if (e) { e.read = true; save('schoolEmails_' + studentId, emails); }
}

/* ═══════════════════════════════════════════════════
   ASSIGNMENTS & MARKS
   ═══════════════════════════════════════════════════ */
function getAssignments()  { return load('assignments', []); }
function setAssignments(v) { save('assignments', v); }

function submitAssignment(studentId, moduleCode, moduleName, title, content, fileName) {
  const list = getAssignments();
  const asgn = {
    id: 'asgn-' + Date.now(),
    studentId,
    moduleCode,
    moduleName,
    title,
    content,
    fileName: fileName || null,
    submittedAt: new Date().toISOString(),
    status: 'submitted',   // submitted | graded
    mark: null,
    feedback: null,
    gradedBy: null,
    gradedAt: null
  };
  list.push(asgn);
  setAssignments(list);
  return asgn;
}

function gradeAssignment(id, mark, feedback, gradedBy) {
  const list = getAssignments();
  const asgn = list.find(a => a.id === id);
  if (!asgn) return;
  asgn.mark = mark;
  asgn.feedback = feedback;
  asgn.gradedBy = gradedBy;
  asgn.gradedAt = new Date().toISOString();
  asgn.status = 'graded';
  setAssignments(list);
  return asgn;
}

function getStudentAssignments(studentId) {
  return getAssignments().filter(a => a.studentId === studentId).sort((a,b) => new Date(b.submittedAt) - new Date(a.submittedAt));
}

function getAssignmentsForModule(moduleCode) {
  return getAssignments().filter(a => a.moduleCode === moduleCode).sort((a,b) => new Date(b.submittedAt) - new Date(a.submittedAt));
}
/* ═══════════════════════════════════════════════════
   LECTURER UPLOADED ASSIGNMENT BRIEFS
   ═══════════════════════════════════════════════════ */
function getLecturerAssignments()   { return load('lecturerAssignments', []); }
function setLecturerAssignments(v)  { save('lecturerAssignments', v); }

function uploadLecturerAssignment(lecturerId, lecturerName, moduleCode, moduleName, title, description, dueDate, fileName) {
  const list = getLecturerAssignments();
  const asgn = {
    id: 'lasgn-' + Date.now(),
    lecturerId, lecturerName, moduleCode, moduleName,
    title, description,
    dueDate: dueDate || null,
    fileName: fileName || null,
    uploadedAt: new Date().toISOString()
  };
  list.push(asgn);
  setLecturerAssignments(list);
  return asgn;
}

function getLecturerAssignmentsForModule(moduleCode) {
  return getLecturerAssignments()
    .filter(a => a.moduleCode === moduleCode)
    .sort((a,b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
}

function deleteLecturerAssignment(id) {
  setLecturerAssignments(getLecturerAssignments().filter(a => a.id !== id));
}

/* ═══════════════════════════════════════════════════
   STUDY MODE  (online / contact)
   ═══════════════════════════════════════════════════ */
function getStudyMode()      { return localStorage.getItem('studyMode') || null; }
function setStudyMode(mode)  { localStorage.setItem('studyMode', mode); }

/* ═══════════════════════════════════════════════════
   LIBRARY RESOURCES
   ═══════════════════════════════════════════════════ */
const LIBRARY_RESOURCES = [
  { id:'lib-001', code:'ICT101', name:'Introduction to Programming', type:'guide',     title:'Programming Fundamentals Study Guide', size:'2.4 MB' },
  { id:'lib-002', code:'ICT101', name:'Introduction to Programming', type:'slides',    title:'Week 1–6 Lecture Slides', size:'5.1 MB' },
  { id:'lib-003', code:'ICT102', name:'Computer Architecture',       type:'guide',     title:'Computer Architecture Textbook', size:'8.3 MB' },
  { id:'lib-004', code:'ICT103', name:'Mathematics for Computing',   type:'guide',     title:'Discrete Maths Study Notes', size:'3.2 MB' },
  { id:'lib-005', code:'ICT104', name:'Web Development Fundamentals',type:'guide',     title:'HTML & CSS Reference Guide', size:'1.8 MB' },
  { id:'lib-006', code:'ICT105', name:'Database Design',             type:'guide',     title:'SQL & ERD Study Guide', size:'4.1 MB' },
  { id:'lib-007', code:'ICT106', name:'Networking Fundamentals',     type:'guide',     title:'Networking OSI Model Notes', size:'2.9 MB' },
  { id:'lib-008', code:'BUS101', name:'Business Communication',      type:'guide',     title:'Business Writing Guide', size:'1.5 MB' },
  { id:'lib-009', code:'BUS102', name:'Principles of Management',    type:'guide',     title:'Management Theories Summary', size:'2.1 MB' },
  { id:'lib-010', code:'GD101',  name:'Design Principles',           type:'guide',     title:'Design Elements & Principles', size:'6.2 MB' },
  { id:'lib-011', code:'IT101',  name:'Systems Analysis & Design',   type:'guide',     title:'SDLC & UML Guide', size:'3.7 MB' },
  { id:'lib-012', code:'general',name:'General',                     type:'policy',    title:'Student Handbook 2026', size:'1.2 MB' },
  { id:'lib-013', code:'general',name:'General',                     type:'policy',    title:'Academic Calendar 2026', size:'0.5 MB' },
  { id:'lib-014', code:'general',name:'General',                     type:'research',  title:'How to Write Academic Essays', size:'0.8 MB' },
];

function getLibraryResources(moduleCode) {
  if (!moduleCode || moduleCode === 'all') return LIBRARY_RESOURCES;
  return LIBRARY_RESOURCES.filter(r => r.code === moduleCode || r.code === 'general');
}
