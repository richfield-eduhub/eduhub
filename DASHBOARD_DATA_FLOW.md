# Lecturer Dashboard Data Flow Diagram

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  LECTURER BROWSER SESSION                    │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  localStorage                                        │   │
│  │  ├─ authToken (JWT)                                │   │
│  │  ├─ currentUser (cached)                           │   │
│  │  ├─ eduhub.legacy.messages.v1 (JSON array)       │   │
│  │  ├─ eduhub.legacy.assignmentSubmissions.v1       │   │
│  │  ├─ eduhub.legacy.lecturerAssignments.v1         │   │
│  │  ├─ eduhub.legacy.events.v1                      │   │
│  │  └─ eduhub.referenceData (cached qualifications) │   │
│  └──────────────────────────────────────────────────────┘   │
│                              ▲                                │
│                              │                                │
│                    ┌─────────┴──────────┐                     │
│                    │                    │                     │
│         ┌──────────▼────────┐  ┌───────▼──────────┐           │
│         │  Dashboard.html   │  │  shared.js       │           │
│         │  (Frontend Logic) │  │  (API Helpers)   │           │
│         └──────────────────┘  └───────┬──────────┘           │
│                                        │                      │
└────────────────────────────────────────┼──────────────────────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    │                    │                    │
                    ▼                    ▼                    ▼
        ┌───────────────────┐  ┌──────────────────┐  ┌────────────┐
        │  /api/admin/users │  │ /api/registrations │  │ /api/apps  │
        │                   │  │                    │  │            │
        │ Returns: User[]   │  │ Returns: Reg[]     │  │ Returns:   │
        │ {id, name, email, │  │ {studentId,        │  │ Application│
        │  role, firstName  │  │  qualCode, status, │  │ []         │
        │  lastName, phone} │  │  semester, year,   │  │            │
        │                   │  │  modules[]}        │  │            │
        └───────────────────┘  └──────────────────┘  └────────────┘
                    ▲                    ▲                    ▲
                    │                    │                    │
                    └────────────────────┴────────────────────┘
                                         │
                    ┌────────────────────┘
                    │
                    ▼
        ┌──────────────────────────┐
        │  PostgreSQL Database     │
        │                          │
        │  Tables:                 │
        │  - users                 │
        │  - lecturers             │
        │  - registrations         │
        │  - applications          │
        │  - modules               │
        │  - qualifications        │
        │  - module_lecturers      │
        │  - semesters             │
        └──────────────────────────┘
```

---

## Data Flow: Dashboard Initialization

```
USER OPENS: /lecturer/Dashboard.html
         │
         ▼
┌─────────────────────────────────────────┐
│ requireAuth('lecturer')                  │
│ Checks: token exists, role == 'lecturer'│
│ Retrieves: user from localStorage       │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ Async IIFE (Lines 293-338)               │
│ Loads data on page init                 │
└─────────────────────────────────────────┘
         │
    ┌────┴─────┬────────────┬─────────────┐
    │           │            │             │
    ▼           ▼            ▼             ▼
getUsers()  getRegistrations() getAssignments()  getInboxFor()
    │           │            │             │
    ▼           ▼            ▼             ▼
API CALL    API CALL    localStorage    localStorage
 /api/       /api/       read 'eduhub.  read 'eduhub.
admin/users  registrations legacy.      legacy.
             assignments  messages.v1
    │           │            │             │
    ▼           ▼            ▼             ▼
User[]      Registration[]  Assignment[]  Message[]
    │           │            │             │
    ▼           ▼            ▼             ▼
Store in:  Store in:    Store in:      Store in:
allUsers   regs         allAsgns       inbox
           approvedRegs pendingAsgns   unreadCount
           progCount
    │
    ▼
┌──────────────────────────────────────┐
│ RENDER DASHBOARD                      │
│                                      │
│ 1. Stats Cards (4 KPIs)              │
│ 2. Overview KPIs (3 metrics)         │
│ 3. Enrolled Students Table           │
│ 4. Recent Submissions Table          │
│ 5. Tab badges (unread/pending count) │
└──────────────────────────────────────┘
```

---

## Stats Calculation Flow

### Total Students
```
getUsers() ──→ /api/admin/users ──→ API returns User[]
    │
    ▼
allUsers = User[]
    │
    ▼
students = allUsers.filter(u => u.role === 'student')
    │
    ▼
Display: students.length
```

### Active Registrations
```
getRegistrations() ──→ /api/registrations ──→ API returns Reg[]
    │
    ▼
groupRegistrationsForLegacyUI(registrations)
    │
    ├─ Group by: studentId + qualCode + semester + year
    ├─ Aggregate: modules array
    └─ Compute: totalFee
    │
    ▼
regs = grouped registrations
    │
    ▼
approvedRegs = regs.filter(r => 
  r.status === 'approved' || r.status === 'allocated'
)
    │
    ▼
Display: approvedRegs.length
```

### Unread Messages
```
getMessages() ──→ localStorage['eduhub.legacy.messages.v1']
    │
    ▼
getInboxFor(lecturerId)
    │
    ├─ Filter: message.to === lecturerId
    └─ Sort: by sentAt DESC
    │
    ▼
inbox = filtered messages
    │
    ▼
unreadCount = inbox.filter(m => m.read === false).length
    │
    ▼
Display: unreadCount
    │
    ▼
If unreadCount > 0:
  └─ Show red background, add badge to Messages tab
```

### Pending Grading
```
getAssignments() ──→ localStorage['eduhub.legacy.assignmentSubmissions.v1']
    │
    ▼
allAsgns = sorted assignments (newest first)
    │
    ▼
pendingAsgns = allAsgns.filter(a => a.status === 'submitted')
    │
    ▼
Display: pendingAsgns.length
    │
    ▼
If pendingAsgns.length > 0:
  └─ Show yellow background, add badge to Assignments tab
```

### Programmes Count
```
approvedRegs
    │
    ├─ Map: each registration's qualificationCode
    ├─ Unique: new Set(codes)
    └─ Count: set.size
    │
    ▼
progCount = unique qualification codes
    │
    ▼
Display: progCount
```

### Pass Rate & Average Mark
```
allAsgns
    │
    ├─ graded = allAsgns.filter(a => a.status === 'graded')
    └─ passMarks = graded.filter(a => a.mark >= 50)
    │
    ▼
passRate = (passMarks.length / graded.length) * 100
avgMark = sum(graded.map(a => a.mark)) / graded.length
    │
    ▼
Display: "XX%", "XX%"
```

---

## Table Data Population

### Enrolled Students by Programme

```
RENDER FLOW:
    │
    ├─ Loop through: approvedRegs
    │
    └─ For each registration:
        │
        ├─ Find student in allUsers
        │   WHERE: u.studentId === r.studentId
        │
        ├─ Extract fields:
        │   ├─ Student name: s?.name
        │   ├─ Student ID: r.studentId
        │   ├─ Programme: r.qualificationName
        │   ├─ Semester: "Sem {r.semester}, {r.year}"
        │   └─ Module count: r.modules.length
        │
        └─ Create HTML table row

DATABASE JOINS (if executed on backend):
    
    SELECT
      ud.first_name || ' ' || ud.last_name AS student_name,
      r.student_id,
      q.name AS programme,
      r.semester,
      r.year,
      COUNT(DISTINCT rm.module_id) AS module_count
    FROM registrations r
    JOIN users u ON r.student_id = u.id
    JOIN user_details ud ON u.id = ud.user_id
    JOIN qualifications q ON r.qualification_id = q.id
    LEFT JOIN registration_modules rm ON r.id = rm.registration_id
    WHERE r.status IN ('approved', 'allocated')
    GROUP BY r.id, ud.first_name, ud.last_name, q.name, r.semester, r.year
    ORDER BY ud.last_name, ud.first_name
```

### Recent Submissions

```
RENDER FLOW:
    │
    ├─ Get: allAsgns (all assignments)
    │
    ├─ Sort: by submittedAt DESC
    │
    ├─ Slice: first 5 items
    │
    └─ For each assignment:
        │
        ├─ Find student in allUsers
        │   WHERE: u.studentId === a.studentId
        │
        ├─ Extract fields:
        │   ├─ Student name: stu?.name
        │   ├─ Module code: a.moduleCode
        │   ├─ Title: a.title
        │   └─ Status: 
        │       └─ if graded: "✅ {mark}%"
        │       └─ if pending: "⏳ Pending"
        │
        └─ Create HTML table row

DATABASE QUERY (if executed on backend):

    SELECT
      ud.first_name || ' ' || ud.last_name AS student_name,
      a.module_code,
      a.title,
      a.status,
      a.mark,
      a.submitted_at
    FROM assignment_submissions a
    JOIN students st ON a.student_id = st.id
    JOIN users u ON st.user_id = u.id
    JOIN user_details ud ON u.id = ud.user_id
    WHERE a.lecturer_id = ? -- current lecturer
    ORDER BY a.submitted_at DESC
    LIMIT 5
```

---

## Message System Flow

### Sending a Message

```
USER ACTION: Click "Send Message"
    │
    ▼
sendComposedMessage()
    │
    ├─ Get values:
    │   ├─ to: selected student ID
    │   ├─ subject: text input
    │   └─ body: textarea
    │
    ├─ Validate: to, subject, body not empty
    │
    ├─ Call: sendMessage(from, to, subject, body)
    │
    └─ sendMessage():
        │
        ├─ Create message object:
        │   {
        │     id: "msg_*",
        │     from: lecturerId,
        │     to: studentId,
        │     subject, body,
        │     sentAt: ISO timestamp,
        │     read: false,
        │     replies: []
        │   }
        │
        ├─ Append to localStorage['eduhub.legacy.messages.v1']
        │
        ├─ Display: "✅ Message sent"
        │
        └─ Re-render: renderMessages()
```

### Receiving Messages

```
STUDENT SENDS MESSAGE TO LECTURER
    │
    ▼
sendMessage(studentId, lecturerId, subject, body)
    │
    └─ Appends to: localStorage['eduhub.legacy.messages.v1']

LECTURER OPENS DASHBOARD
    │
    ▼
getInboxFor(lecturerId)
    │
    ├─ Filter: message.to === lecturerId
    ├─ Filter: message.from !== lecturerId
    └─ Sort: by sentAt DESC
    │
    ▼
renderMessages()
    │
    ├─ Display inbox messages
    │   ├─ Show subject, from, sentAt
    │   ├─ Show unread indicator (left border)
    │   └─ Show any replies
    │
    └─ Mark as read when replied
```

---

## Assignment Submission & Grading Flow

### Student Submits Assignment

```
STUDENT ACTION: Submit Assignment
    │
    ▼
submitAssignment(
  studentId,
  moduleCode,
  moduleName,
  title,
  content,
  fileName
)
    │
    ├─ Create assignment object:
    │   {
    │     id: "asgn_*",
    │     studentId, moduleCode, moduleName,
    │     title, content, fileName,
    │     submittedAt: ISO timestamp,
    │     status: "submitted",
    │     mark: null,
    │     feedback: "",
    │     gradedAt: null,
    │     gradedBy: null
    │   }
    │
    ├─ Append to: localStorage['.assignmentSubmissions.v1']
    │
    └─ Updates Dashboard:
       └─ pendingAsgns count increases
       └─ Message tab badge appears
```

### Lecturer Grades Assignment

```
LECTURER ACTION: Submit Grade
    │
    ▼
gradeAsgn(assignmentId)
    │
    ├─ Get values:
    │   ├─ mark: number input (0-100)
    │   └─ feedback: textarea
    │
    ├─ Validate: mark 0-100, feedback not empty
    │
    ├─ Call: gradeAssignment(id, mark, feedback, lecturerName)
    │
    └─ gradeAssignment():
        │
        ├─ Update assignment object:
        │   {
        │     ...existing fields...,
        │     status: "graded",
        │     mark: number,
        │     feedback: string,
        │     gradedAt: ISO timestamp,
        │     gradedBy: lecturerName
        │   }
        │
        ├─ Update: localStorage['.assignmentSubmissions.v1']
        │
        ├─ Display: "✅ Grade saved!"
        │
        ├─ Recalculate:
        │   ├─ pendingAsgns count decreases
        │   ├─ Pass rate recalculates
        │   └─ Average mark recalculates
        │
        └─ Re-render: renderAssignments()
```

### Assignment Summary Statistics

```
When rendering assignments list, also calculate:

    ┌─────────────────────────────────────────┐
    │ SUMMARY CHIPS                            │
    │                                         │
    │ [Total Visible] [Pending Grading] [Avg]│
    └─────────────────────────────────────────┘

    total = filtered.length
    pending = filtered.filter(a => a.status === 'submitted').length
    graded = filtered.filter(a => a.status === 'graded')
    avg = graded.length > 0
      ? round(sum(graded.map(m => m.mark)) / graded.length)
      : "—"

    Display: [total] [pending] [avg%]
```

---

## Calendar Event System

### Event Storage & Retrieval

```
DEFAULT EVENTS (seeded):
    │
    ├─ Student Orientation (2026-02-03)
    ├─ Semester 1 Exams Start (2026-05-25)
    ├─ Faculty Teaching & Learning Forum (2026-08-12)
    └─ EduHub Open Day (2026-09-05)

getEvents() function:
    │
    ├─ Check: localStorage['eduhub.legacy.events.v1']
    │
    ├─ If empty:
    │   ├─ Initialize with DEFAULT_LEGACY_EVENTS
    │   └─ Save to localStorage
    │
    └─ Return: all events
```

### Calendar Rendering

```
buildCal():
    │
    ├─ Get: current month/year
    ├─ Get: allEvents from localStorage
    │
    ├─ For each day in month:
    │   │
    │   ├─ Check if today
    │   │   └─ Mark with dark background + bold
    │   │
    │   ├─ Check if has events
    │   │   WHERE: event.date === day AND
    │   │   (audience === 'all' OR audience === 'lecturers')
    │   │   └─ Add dot indicator
    │   │
    │   └─ Make clickable
    │
    └─ Render calendar grid
```

### Event Filtering by Audience

```
Lecturer sees events where:
    │
    ├─ audience === 'all'  (everyone)
    │
    └─ audience === 'lecturers'  (lecturers only)

Student sees events where:
    │
    ├─ audience === 'all'  (everyone)
    │
    └─ audience === 'students'  (students only)

Admin sees events where:
    │
    ├─ audience === 'all'  (everyone)
    │
    └─ audience === 'admins'  (admin only)
```

### Creating New Events

```
USER ACTION: Click "Save Event"
    │
    ▼
addLecturerEvent()
    │
    ├─ Get values:
    │   ├─ title, date, time
    │   ├─ type: academic|general|exam|holiday
    │   └─ audience: all|lecturers|students|admins
    │
    ├─ Validate: title and date required
    │
    ├─ Call: createEvent({...})
    │
    └─ createEvent():
        │
        ├─ Create event object:
        │   {
        │     id: "ev_*",
        │     title, date, time,
        │     type, audience,
        │     description,
        │     createdBy: lecturerId,
        │     createdAt: ISO timestamp
        │   }
        │
        ├─ Append to: localStorage['eduhub.legacy.events.v1']
        │
        ├─ Re-render: buildCal() & renderEventsList()
        │
        └─ Display: "✅ Event added"
```

---

## Tab Lazy-Loading

```
TAB NAVIGATION
    │
    ├─ Messages Tab:
    │   └─ initMessageCompose()
    │      ├─ Load all students
    │      └─ Populate dropdown
    │
    │   └─ renderMessages()
    │      ├─ Get inbox messages
    │      ├─ Get sent messages
    │      └─ Render both lists
    │
    ├─ Assignments Tab:
    │   └─ initAsgnFilters()
    │      └─ Build module filter dropdown
    │
    │   └─ renderAssignments()
    │      ├─ Apply filters (module, status, search)
    │      ├─ Render submissions
    │      └─ Render summary chips
    │
    │   └─ renderPublishedAssignments()
    │      └─ Show assignments published by lecturer
    │
    └─ Calendar Tab:
        └─ buildCal()
           └─ Render month calendar with events
        
        └─ renderEventsList()
           └─ Show upcoming events
```

---

## API Call Sequence

```
1. PAGE LOAD
   └─ requireAuth('lecturer')
   └─ Gets user from localStorage

2. ASYNC INIT (IIFE)
   │
   ├─ api("GET", "/admin/users")
   │  └─ Response: {ok, users: User[]}
   │
   ├─ api("GET", "/registrations")
   │  └─ Response: {ok, registrations: Reg[]}
   │
   └─ localStorage reads (no API calls):
      ├─ eduhub.legacy.messages.v1
      └─ eduhub.legacy.assignmentSubmissions.v1

3. RENDER DASHBOARD
   └─ Display all calculated stats & tables

4. ON USER ACTION
   ├─ Create message → localStorage only
   ├─ Submit/grade assignment → localStorage only
   ├─ Create/delete event → localStorage only
   └─ No API calls for these operations (legacy limitation)
```

---

## Current Architecture Limitations

### What's NOT Persisted to Database
- Messages (student ↔ lecturer communication)
- Assignment submissions and grades
- Lecturer-published assignments
- Calendar events
- Announcements

**Why?** These are using client-side localStorage as per the comment in Dashboard.html:
```javascript
// Legacy HTML pages read applications/registrations/users
// synchronously; we preload once and refresh after mutations.
```

### What IS Persisted to Database
- Users (lecturers, students)
- Registrations (student enrollment)
- Applications (admission requests)
- Qualifications and modules (catalogue data)

### Performance Implications
- **Pros**: No API roundtrips for messaging/assignments, instant UI updates
- **Cons**: Data lost if localStorage cleared, no multi-device sync, no backup

---

