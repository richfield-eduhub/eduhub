/**
 * EduHub shared-local.js — 100% localStorage, no backend required
 * All paths are RELATIVE so it works by opening files directly (no server needed).
 */

/* ═══════════════════════════════════════════════════
   DATA CONSTANTS
   ═══════════════════════════════════════════════════ */
const RICHFIELD_LOGO = 'data:image/png;base64,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';

const QUALIFICATIONS = [
  { code:'BICT', name:'Bachelor of ICT', faculty:'Information & Communication Technology', duration:'3 Years', fee:45000,
    modules:[
      {code:'ICT101',name:'Introduction to Programming',credits:15,semester:1,year:1},{code:'ICT102',name:'Computer Architecture',credits:15,semester:1,year:1},{code:'ICT103',name:'Mathematics for Computing',credits:15,semester:1,year:1},
      {code:'ICT104',name:'Web Development Fundamentals',credits:15,semester:2,year:1},{code:'ICT105',name:'Database Design',credits:15,semester:2,year:1},{code:'ICT106',name:'Networking Fundamentals',credits:15,semester:2,year:1},
      {code:'ICT201',name:'Object-Oriented Programming',credits:15,semester:1,year:2},{code:'ICT202',name:'Operating Systems',credits:15,semester:1,year:2},{code:'ICT203',name:'Data Structures & Algorithms',credits:15,semester:1,year:2},
      {code:'ICT204',name:'Software Engineering',credits:15,semester:2,year:2},{code:'ICT205',name:'Cloud Computing',credits:15,semester:2,year:2},{code:'ICT206',name:'Cybersecurity Fundamentals',credits:15,semester:2,year:2},
      {code:'ICT301',name:'Advanced Software Development',credits:15,semester:1,year:3},{code:'ICT302',name:'Machine Learning Basics',credits:15,semester:1,year:3},{code:'ICT303',name:'IT Project Management',credits:15,semester:1,year:3},
      {code:'ICT304',name:'Research Project',credits:15,semester:2,year:3},{code:'ICT305',name:'Enterprise Architecture',credits:15,semester:2,year:3},{code:'ICT306',name:'Professional Practice in ICT',credits:15,semester:2,year:3},
    ]},
  { code:'NDBS', name:'National Diploma: Business Studies', faculty:'Business & Management', duration:'3 Years', fee:38000,
    modules:[
      {code:'BUS101',name:'Business Communication',credits:15,semester:1,year:1},{code:'BUS102',name:'Principles of Management',credits:15,semester:1,year:1},{code:'BUS103',name:'Business Mathematics',credits:15,semester:1,year:1},
      {code:'BUS104',name:'Marketing Fundamentals',credits:15,semester:2,year:1},{code:'BUS105',name:'Financial Accounting',credits:15,semester:2,year:1},{code:'BUS106',name:'Human Resources Management',credits:15,semester:2,year:1},
      {code:'BUS201',name:'Advanced Marketing',credits:15,semester:1,year:2},{code:'BUS202',name:'Business Law',credits:15,semester:1,year:2},{code:'BUS203',name:'Cost Accounting',credits:15,semester:1,year:2},
      {code:'BUS204',name:'Operations Management',credits:15,semester:2,year:2},{code:'BUS205',name:'Entrepreneurship',credits:15,semester:2,year:2},{code:'BUS206',name:'Business Statistics',credits:15,semester:2,year:2},
      {code:'BUS301',name:'Strategic Management',credits:15,semester:1,year:3},{code:'BUS302',name:'International Business',credits:15,semester:1,year:3},{code:'BUS303',name:'Leadership & Change',credits:15,semester:1,year:3},
      {code:'BUS304',name:'Business Research Project',credits:15,semester:2,year:3},{code:'BUS305',name:'Corporate Governance',credits:15,semester:2,year:3},{code:'BUS306',name:'Professional Business Practice',credits:15,semester:2,year:3},
    ]},
  { code:'HDGD', name:'Higher Certificate: Graphic Design', faculty:'Creative Arts & Design', duration:'1 Year', fee:32000,
    modules:[
      {code:'GD101',name:'Design Principles',credits:15,semester:1,year:1},{code:'GD102',name:'Typography & Layout',credits:15,semester:1,year:1},{code:'GD103',name:'Digital Illustration',credits:15,semester:1,year:1},
      {code:'GD104',name:'Brand Identity Design',credits:15,semester:2,year:1},{code:'GD105',name:'Motion Graphics',credits:15,semester:2,year:1},{code:'GD106',name:'Portfolio Development',credits:15,semester:2,year:1},
    ]},
  { code:'NDIT', name:'National Diploma: Information Technology', faculty:'Information & Communication Technology', duration:'3 Years', fee:42000,
    modules:[
      {code:'IT101',name:'Systems Analysis & Design',credits:15,semester:1,year:1},{code:'IT102',name:'Object-Oriented Programming',credits:15,semester:1,year:1},{code:'IT103',name:'Operating Systems',credits:15,semester:1,year:1},
      {code:'IT104',name:'Software Engineering',credits:15,semester:2,year:1},{code:'IT105',name:'Cloud Computing',credits:15,semester:2,year:1},{code:'IT106',name:'Cybersecurity Fundamentals',credits:15,semester:2,year:1},
      {code:'IT201',name:'Advanced Networking',credits:15,semester:1,year:2},{code:'IT202',name:'Database Administration',credits:15,semester:1,year:2},{code:'IT203',name:'Web Application Development',credits:15,semester:1,year:2},
      {code:'IT204',name:'IT Service Management',credits:15,semester:2,year:2},{code:'IT205',name:'Mobile Development',credits:15,semester:2,year:2},{code:'IT206',name:'Digital Forensics',credits:15,semester:2,year:2},
      {code:'IT301',name:'Capstone Project',credits:15,semester:1,year:3},{code:'IT302',name:'DevOps & Automation',credits:15,semester:1,year:3},{code:'IT303',name:'AI & Machine Learning',credits:15,semester:1,year:3},
      {code:'IT304',name:'Work Integrated Learning',credits:15,semester:2,year:3},{code:'IT305',name:'IT Governance & Compliance',credits:15,semester:2,year:3},{code:'IT306',name:'Emerging Technologies',credits:15,semester:2,year:3},
    ]},
];

const NATIONALITIES = ['South African','Zimbabwean','Mozambican','Zambian','Malawian','Botswanan','Namibian','Swazi','Lesothan','Congolese (DRC)','Nigerian','Ghanaian','Kenyan','Tanzanian','Ugandan','Rwandan','British','American','Canadian','Australian','German','French','Indian','Pakistani','Brazilian','Other'];

const SEED_USERS = [
  { id:'admin-001', name:'Admin User', email:'admin@richfield.ac.za', role:'admin' },
  { id:'lec-001',   name:'Dr. Sarah Mokoena', email:'smokoena@richfield.ac.za', role:'lecturer' },
];
const DEFAULT_PASSWORDS = { 'admin@richfield.ac.za':'admin123', 'smokoena@richfield.ac.za':'lec123' };

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
  const tempPwd = `Richfield@${Math.floor(1000 + Math.random() * 9000)}`;
  const newUser = { id:`user-${Date.now()}`, name:`${app.firstName} ${app.lastName}`, email:app.email, role:'student', studentId:app.studentId, tempPassword:true };
  setUsers([...getUsers(), newUser]);
  const pwds = getPasswords();
  pwds[app.email.toLowerCase()] = tempPwd;
  setPasswords(pwds);
  addNotification({ userId:newUser.id, title:'🎉 Application Approved!', message:`Your application has been approved. Student ID: ${app.studentId}. Temporary password: ${tempPwd}. Please log in and change your password.`, type:'success' });
  getUsers().filter(u => u.role === 'admin').forEach(a => addNotification({ userId:a.id, title:'Application Approved', message:`Approved ${app.firstName} ${app.lastName}'s application. Student ID: ${app.studentId}.`, type:'success' }));
  return { tempPassword:tempPwd, isNew:true };
}

function declineApplication(id, reason) {
  setApplications(getApplications().map(a => a.id === id ? {...a, status:'declined', declineReason:reason} : a));
  const app = getApplications().find(a => a.id === id);
  if (app) addNotification({ userId:app.studentId, title:'Application Update', message:`Your application was not approved. Reason: ${reason}`, type:'error' });
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
      <button onclick="toggleNotifs()" class="notif-btn" id="notif-btn">🔔
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
        <div style="font-size:11px;opacity:.7;text-transform:capitalize">${user.role}</div>
      </div>
      <button onclick="doLogout()" style="background:rgba(255,255,255,.15);color:white;border:1px solid rgba(255,255,255,.3);padding:6px 14px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer">Logout</button>
    </div>` : '';

  const nav = document.createElement('nav');
  nav.className = 'navbar';
  nav.innerHTML = `
    <a href="${r('index.html')}" style="display:flex;align-items:center">
      <img src="${RICHFIELD_LOGO}" alt="Richfield" style="height:36px">
    </a>
    <div style="display:flex;align-items:center;gap:2px;flex-wrap:wrap">
      ${links}
      ${userArea}
    </div>`;
  document.body.insertBefore(nav, document.body.firstChild);
}

function toggleNotifs() {
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
