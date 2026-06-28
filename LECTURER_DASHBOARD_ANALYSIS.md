# EduHub Lecturer Dashboard Implementation Analysis

## Overview
The lecturer dashboard is a comprehensive interface that displays key metrics, manages student communications, handles assignments, and tracks academic calendar events. The system uses a hybrid architecture with frontend data collection and client-side storage (localStorage) due to ongoing API parity work.

---

## 1. FRONTEND FILES

### Main Dashboard File
**Location:** `/Users/tammynkuna/rnt/school/it_project_700/eduhub/frontend/lecturer/Dashboard.html`

**Key Components:**
- Dashboard title: "LECTURER PORTAL"
- Tab-based interface with 4 main sections:
  1. Overview (KPIs and tables)
  2. Messages (compose and inbox)
  3. Assignments (submissions and grading)
  4. Calendar (events and scheduling)

---

## 2. DATA FLOW ARCHITECTURE

### 2.1 Initial Data Load (Async IIFE - Lines 293-338)

The dashboard initializes with an async function that:
1. Fetches all users from the API
2. Fetches all registrations
3. Filters approved/allocated registrations
4. Filters student users
5. Counts unique programmes
6. Retrieves unread messages
7. Loads all assignments

```javascript
(async () => {
  allUsers = await getUsers();                    // From shared.js
  regs = await getRegistrations();                // From shared.js
  approvedRegs = regs.filter(r => r.status==='approved'||r.status==='allocated');
  students = allUsers.filter(u => u.role === 'student');
  progCount = new Set(approvedRegs.map(r => r.qualificationCode)).size;
  const inbox = getInboxFor(user.id);
  const unreadCount = inbox.filter(m => !m.read).length;
  allAsgns = getAssignments();
  const pendingAsgns = allAsgns.filter(a => a.status === 'submitted');
  
  // Render stats, tables, and KPIs...
})();
```

---

## 3. DASHBOARD STATISTICS SECTIONS

### 3.1 Top Stats Cards (Lines 304-311)
Displays 4 key metrics:

| Metric | Data Source | Formula |
|--------|-------------|---------|
| 🎓 Total Students | `students.length` | Count of all users with role='student' |
| 📝 Active Registrations | `approvedRegs.length` | Count of registrations with status='approved'\|'allocated' |
| 💬 Unread Messages | `inbox.filter(m => !m.read).length` | Count of unread messages in lecturer's inbox |
| 📤 Pending Grading | `pendingAsgns.length` | Count of assignments with status='submitted' |

```javascript
document.getElementById('stats').innerHTML = [
  { icon:'🎓', label:'Total Students', value: students.length, bg:'#E0E7FF' },
  { icon:'📝', label:'Active Registrations', value: approvedRegs.length, bg:'#D1FAE5' },
  { icon:'💬', label:'Unread Messages', value: unreadCount, bg: unreadCount > 0 ? '#FEE2E2' : '#F3F4F6' },
  { icon:'📤', label:'Pending Grading', value: pendingAsgns.length, bg: pendingAsgns.length > 0 ? '#FEF3C7' : '#F3F4F6' },
].map(s => `<div class="stat-card">...</div>`).join('');
```

### 3.2 Overview KPIs (Lines 356-365)
Displays 3 calculated metrics:

| KPI | Data Source | Formula |
|-----|-------------|---------|
| Programmes | Unique `qualificationCode` values | `new Set(approvedRegs.map(r => r.qualificationCode)).size` |
| Pass Rate | Assignment grades >= 50 | `(passMarks.length / graded.length) * 100` % |
| Average Mark | All graded assignments | `sum(marks) / graded.length` |

```javascript
function renderOverviewKpis() {
  const passMarks = allAsgns.filter(a => a.status==='graded' && Number(a.mark) >= 50);
  const graded = allAsgns.filter(a => a.status==='graded');
  const avg = graded.length ? Math.round(graded.reduce((s,a)=>s+Number(a.mark||0),0)/graded.length) : 0;
  
  // Render: Programmes, Pass Rate, Average Mark
}
```

---

## 4. OVERVIEW TAB - DATA TABLES

### 4.1 Enrolled Students by Programme Table (Lines 319-326)

**SQL-like Query (Client-Side):**
```javascript
SELECT 
  student.name,
  registration.studentId,
  registration.qualificationName,
  CONCAT('Sem ', registration.semester, ', ', registration.year),
  registration.modules.length as moduleCount
FROM approvedRegs
JOIN students ON registration.studentId = students.id
```

**Columns:**
| Column | Source | Description |
|--------|--------|-------------|
| Student | `s?.name` | Student name from allUsers |
| Student ID | `r.studentId` | Registration student ID |
| Programme | `r.qualificationName` | Qualification name |
| Semester | `r.semester`, `r.year` | Study period |
| Modules | `r.modules.length` | Number of registered modules |

**Data Source:**
- `approvedRegs` = registrations filtered by status 'approved' or 'allocated'
- `allUsers` = all user records from `/api/users` or `/api/admin/users`

### 4.2 Recent Submissions Table (Lines 329-337)

**SQL-like Query (Client-Side):**
```javascript
SELECT 
  student.name,
  assignment.moduleCode,
  assignment.title,
  assignment.status,
  assignment.mark (if graded)
FROM allAsgns
ORDER BY submittedAt DESC
LIMIT 5
```

**Columns:**
| Column | Source | Description |
|--------|--------|-------------|
| Student | `stu?.name` | Student name from submission record |
| Module | `a.moduleCode` | Module code |
| Title | `a.title` | Assignment title |
| Status | `a.status` | 'graded' with mark, or 'submitted' (pending) |

**Data Source:**
- `allAsgns` = `getAssignments()` from localStorage (LEGACY_STORE_KEYS.assignmentSubmissions)

---

## 5. MESSAGES TAB - DATA MANAGEMENT

### 5.1 Message Flow

**Functions Used:**
```javascript
getInboxFor(user.id)        // Get messages TO the lecturer
getSentBy(user.id)          // Get messages FROM the lecturer
getMessages()               // Get all messages (localStorage)
```

**Data Structure:**
```javascript
{
  id: "msg_*",
  from: userId,
  to: userId,
  subject: string,
  body: string,
  sentAt: ISO8601_timestamp,
  read: boolean,
  replies: [{
    id: "reply_*",
    from: userId,
    body: string,
    sentAt: ISO8601_timestamp
  }]
}
```

**Storage:** `localStorage['eduhub.legacy.messages.v1']`

### 5.2 Compose Student Selector
```javascript
initMessageCompose() {
  const students = allUsers.filter(u => u.role==='student');
  // Populate dropdown with all students
}
```

---

## 6. ASSIGNMENTS TAB - SUBMISSION & GRADING

### 6.1 Assignment Submission Schema
```javascript
{
  id: "asgn_*",
  studentId: string,
  moduleCode: string,
  moduleName: string,
  title: string,
  content: string (submission text),
  fileName: string (optional),
  submittedAt: ISO8601_timestamp,
  status: "submitted" | "graded",
  mark: number (0-100, null if pending),
  feedback: string,
  gradedAt: ISO8601_timestamp (null if pending),
  gradedBy: string (lecturer name)
}
```

### 6.2 Lecturer Assignment Schema
```javascript
{
  id: "lec_asgn_*",
  lecturerId: string,
  lecturerName: string,
  moduleCode: string,
  moduleName: string,
  title: string,
  description: string,
  dueDate: date (optional),
  fileName: string (optional),
  uploadedAt: ISO8601_timestamp
}
```

### 6.3 Assignment Summary Calculation (Lines 590-600)
```javascript
function renderAsgnSummary(filtered) {
  const graded = filtered.filter(a => a.status==='graded');
  const pending = filtered.filter(a => a.status==='submitted');
  const avg = graded.length 
    ? Math.round(graded.reduce((s,a)=>s+Number(a.mark||0),0)/graded.length) 
    : '—';
  
  // Display: Total Visible | Pending Grading | Average Mark %
}
```

### 6.4 Grading Flow
```javascript
gradeAssignment(id, mark, feedback, gradedBy) {
  // Updates assignment status to 'graded'
  // Sets mark, feedback, gradedBy, gradedAt
  // Stored in localStorage
}
```

**Storage:** `localStorage['eduhub.legacy.assignmentSubmissions.v1']`

---

## 7. CALENDAR TAB - EVENTS

### 7.1 Event Schema
```javascript
{
  id: "ev_*",
  title: string,
  date: "YYYY-MM-DD",
  time: "HH:MM" (optional),
  type: "academic" | "exam" | "general" | "holiday",
  audience: "all" | "lecturers" | "students" | "admins",
  description: string,
  createdBy: userId (null for seeded events),
  createdAt: ISO8601_timestamp
}
```

### 7.2 Event Filtering by Audience (Lines 624, 656)
```javascript
// Calendar displays events where:
// - audience === 'all' OR
// - audience === 'lecturers'

const hasEv = allEvents.some(e => 
  e.date === dateStr && 
  (e.audience === 'all' || e.audience === 'lecturers')
);
```

### 7.3 Upcoming Events (Lines 635-652)
```javascript
getUpcomingEvents('lecturer') {
  // Filters events for lecturer audience
  // Filters future dates only
  // Returns sorted by date ascending
}
```

**Storage:** `localStorage['eduhub.legacy.events.v1']`

---

## 8. BACKEND API INTEGRATION

### 8.1 Data Fetching Sources

**Primary API Endpoints Used:**

| Data | Endpoint | Method | Cached | Purpose |
|------|----------|--------|--------|---------|
| Users | `/api/users` or `/api/admin/users` | GET | Yes (dashboardCache) | Get all student and staff info |
| Registrations | `/api/registrations` | GET | Yes (dashboardCache) | Get student enrollment records |
| Applications | `/api/applications` | GET | Yes (dashboardCache) | Get application records |
| Current User | localStorage['currentUser'] | - | Yes | Cached user object |

### 8.2 Dashboard Cache (shared.js Lines 714-756)

```javascript
const dashboardCache = {
  applications: [],
  registrations: [],
  users: [],
  ready: false,
  loading: null,
};

async function refreshDashboardData(force = false) {
  const [appsRes, regsRes, usersRes] = await Promise.all([
    api("GET", "/applications"),
    api("GET", "/registrations"),
    api("GET", "/admin/users")
  ]);
  
  // Normalize and cache results
  dashboardCache.applications = appsRes.applications.map(normalizeApplication);
  dashboardCache.registrations = groupRegistrationsForLegacyUI(regsRes.registrations);
  dashboardCache.users = usersRes.users.map(normalizeUser);
  dashboardCache.ready = true;
}
```

### 8.3 Data Normalization Functions

**normalizeUser()** - Standardizes user field names
```javascript
{
  id, user_id, firstName, lastName, name, email, role, phone
}
```

**normalizeRegistration()** - Normalizes registration records
```javascript
{
  studentId, qualificationCode, qualificationName,
  semester, year, modules: [{code, name, credits}],
  status, totalFee, submittedAt
}
```

**groupRegistrationsForLegacyUI()** - Merges module registrations by student
- Groups by: studentId + qualificationCode + semester + year
- Aggregates: modules array, statuses array
- Computes: totalFee from module credits

---

## 9. LECTURER API ENDPOINTS (Backend)

**Location:** `/Users/tammynkuna/rnt/school/it_project_700/eduhub/backend/src/routes/lecturer.routes.js`

### 9.1 Available Endpoints

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/lecturers` | GET | staffOnly | List all lecturers (pagination) |
| `/api/lecturers/me` | GET | lecturerOnly | Get current lecturer profile |
| `/api/lecturers/:id` | GET | staffOnly | Get specific lecturer |
| `/api/lecturers/:id/modules` | GET | staffOnly | Get lecturer's assigned modules |
| `/api/lecturers/me/modules` | GET | lecturerOnly | Get current lecturer's modules |
| `/api/lecturers/:id` | PATCH | adminOnly | Update lecturer info |

### 9.2 Lecturer Profile Query (lecturer.service.js Lines 210-242)

```sql
SELECT
  l.id, l.user_id, l.employee_number, l.department, l.title, l.campus_id,
  c.code as campus_code, c.name as campus_name,
  u.email, u.member_number, u.account_status,
  ud.first_name, ud.last_name, ud.phone
FROM lecturers l
INNER JOIN users u ON l.user_id = u.id
LEFT JOIN user_details ud ON u.id = ud.user_id
LEFT JOIN campuses c ON l.campus_id = c.id
WHERE l.user_id = :userId
```

### 9.3 Lecturer Modules Query (lecturer.service.js Lines 155-204)

```sql
SELECT
  m.id, m.code, m.name, m.year, m.semester, m.credits, m.description,
  m.is_active,
  q.id as qualification_id, q.code as qualification_code, q.name as qualification_name,
  s.id as semester_id, s.name as semester_name, s.start_date, s.end_date,
  ml.created_at as assigned_at,
  (SELECT COUNT(*)::int FROM registrations r
   WHERE r.module_id = m.id AND r.semester_id = ml.semester_id) as student_count
FROM module_lecturers ml
INNER JOIN modules m ON ml.module_id = m.id
INNER JOIN qualifications q ON m.qualification_id = q.id
LEFT JOIN semesters s ON ml.semester_id = s.id
WHERE ml.lecturer_id = :lecturerId
ORDER BY m.year, m.semester, m.code
```

---

## 10. DATA CALCULATION FORMULAS

### 10.1 Pass Rate Calculation
```
passMarks = assignments where status='graded' AND mark >= 50
graded = assignments where status='graded'
PassRate = (passMarks.length / graded.length) * 100
```

### 10.2 Average Mark Calculation
```
graded = assignments where status='graded'
AvgMark = sum(graded.map(a => a.mark)) / graded.length
Rounded to nearest integer
```

### 10.3 Programme Count
```
approvedRegs = registrations where status IN ['approved', 'allocated']
ProgrammeCount = unique count of qualificationCode values in approvedRegs
```

### 10.4 Enrollment by Programme
```
For each registration in approvedRegs:
- Display student name
- Display qualificationName
- Count modules in registration.modules array
- Show semester and year
```

---

## 11. STORAGE MECHANISMS

### 11.1 LocalStorage Keys Used

| Key | Type | Purpose | Cleared On |
|-----|------|---------|------------|
| `authToken` | String | JWT token for API calls | Logout |
| `currentUser` | JSON | Cached user object | Logout |
| `eduhub.legacy.messages.v1` | JSON Array | Lecturer/student messages | Manual |
| `eduhub.legacy.assignmentSubmissions.v1` | JSON Array | Student submissions & grades | Manual |
| `eduhub.legacy.lecturerAssignments.v1` | JSON Array | Assignments published by lecturer | Manual |
| `eduhub.legacy.events.v1` | JSON Array | Calendar events | Manual |
| `eduhub.legacy.announcements.v1` | JSON Array | Announcements | Manual |
| `eduhub.legacy.notifications.v1` | JSON Array | Local notifications | Manual |
| `eduhub.referenceData` | JSON (versioned) | Cached qualifications, nationalities | 24 hours TTL |
| `_unreadCount` | String (number) | Unread notification count | Manual |

### 11.2 Dashboard Cache (Memory)

```javascript
dashboardCache = {
  applications: [],      // From /api/applications
  registrations: [],     // From /api/registrations (grouped)
  users: [],            // From /api/admin/users
  ready: boolean,       // Flag when loaded
  loading: Promise      // Loading state
}
```

---

## 12. TAB SWITCHING & LAZY LOADING

### 12.1 Tab Switch Handler (Lines 345-354)
```javascript
function switchTab(btn, tabId) {
  // Remove active class from all buttons
  // Add active class to current button
  // Hide all tab panes
  // Show selected tab pane
  
  // Lazy-load data on tab switch:
  if (tabId === 'tab-messages') { 
    initMessageCompose(); 
    renderMessages(); 
  }
  if (tabId === 'tab-assignments') { 
    initAsgnFilters(); 
    renderAssignments(); 
    renderPublishedAssignments(); 
  }
  if (tabId === 'tab-calendar') { 
    buildCal(); 
    renderEventsList(); 
  }
}
```

---

## 13. FILTERING & SEARCH

### 13.1 Assignment Filters (Lines 525-544)
```javascript
function renderAssignments() {
  let asgns = getAssignments();
  
  // Filter by module
  if (modFilter !== 'all') 
    asgns = asgns.filter(a => a.moduleCode === modFilter);
  
  // Filter by status
  if (statusFilter !== 'all') 
    asgns = asgns.filter(a => a.status === statusFilter);
  
  // Search by title, code, student name/ID
  if (q) {
    asgns = asgns.filter(a => {
      const stuName = (student?.name || '').toLowerCase();
      return a.title.toLowerCase().includes(q) ||
             a.moduleCode.toLowerCase().includes(q) ||
             stuName.includes(q) ||
             a.studentId.toLowerCase().includes(q);
    });
  }
  
  // Sort by submission date descending
  asgns.sort((a,b) => new Date(b.submittedAt) - new Date(a.submittedAt));
}
```

---

## 14. INTEGRATION FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                    LECTURER DASHBOARD.HTML                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                   ┌──────────────────────┐
                   │   Async IIFE (Init)   │
                   └──────────────────────┘
                    │     │      │      │
         ┌──────────┴─────┴─┬────┴─┬────┴────┐
         │                  │      │         │
         ▼                  ▼      ▼         ▼
    getUsers()      getRegistrations()  getAssignments()
         │                  │              │
         ▼                  ▼              ▼
    shared.js       shared.js           localStorage
    API calls       API calls           (local store)
         │                  │              │
         ▼                  ▼              ▼
    /api/admin/users  /api/registrations  LEGACY_STORE_KEYS
         │                  │              .assignmentSubmissions
         │                  ▼
         │            dashboardCache
         │            (normalized &
         ▼            grouped)
    allUsers[]
         │
         ▼
    Filter, sort, render in:
    - Stats cards
    - Overview KPIs
    - Student table
    - Message dropdowns
    - Assignment filters
```

---

## 15. MISSING FEATURES & CURRENT LIMITATIONS

1. **No Real-time Updates**: Data is loaded once on page init; no refresh mechanism built-in
2. **LocalStorage for Assignments**: Assignment data is stored in browser localStorage, not in database
3. **No Message Persistence**: Messages are stored client-side only
4. **No Submission File Storage**: File references are text only, no actual file upload/storage
5. **Pass Rate/Average**: Calculated only on assignments with grades; no module-level calculations

---

## 16. KEY FILES SUMMARY

| File | Lines | Purpose |
|------|-------|---------|
| `/frontend/lecturer/Dashboard.html` | 712 | Main dashboard UI & logic |
| `/frontend/shared.js` | 1600+ | API calls, data normalization, localStorage helpers |
| `/backend/src/routes/lecturer.routes.js` | 122 | Lecturer API endpoints |
| `/backend/src/controllers/lecturer.controller.js` | 172 | Lecturer request handlers |
| `/backend/src/services/lecturer.service.js` | 283 | Lecturer business logic & DB queries |
| `/backend/src/services/registration.service.js` | 250+ | Registration validation & queries |

---

## 17. QUICK REFERENCE: DATA SOURCES

### For Lecturer Dashboard Stats:

```
Total Students
├── Source: /api/admin/users
├── Filter: role === 'student'
└── Count: .length

Active Registrations
├── Source: /api/registrations
├── Filter: status === 'approved' OR 'allocated'
└── Count: .length

Unread Messages
├── Source: localStorage['eduhub.legacy.messages.v1']
├── Filter: .to === currentUser.id AND .read === false
└── Count: .length

Pending Grading
├── Source: localStorage['eduhub.legacy.assignmentSubmissions.v1']
├── Filter: .status === 'submitted'
└── Count: .length

Pass Rate
├── Source: assignments where status === 'graded'
├── Calculate: (count(mark >= 50) / count(graded)) * 100
└── Return: "XX%"

Average Mark
├── Source: assignments where status === 'graded'
├── Calculate: sum(marks) / count
└── Return: "XX%"

Enrolled Students by Programme
├── Source: /api/registrations (grouped) + /api/admin/users
├── Join: registration.studentId = user.id
└── Select: name, studentId, qualificationName, semester, year, module count

Recent Submissions
├── Source: localStorage['eduhub.legacy.assignmentSubmissions.v1']
├── Sort: submittedAt DESC
├── Limit: 5
└── Join: studentId = user.id for name
```

---

