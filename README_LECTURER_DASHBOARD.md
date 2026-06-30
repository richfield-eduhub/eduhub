# Lecturer Dashboard Implementation - Quick Reference

## Files Overview

| File Path | Purpose | Key Content |
|-----------|---------|-------------|
| `/frontend/lecturer/Dashboard.html` | Main UI & logic | 712 lines, tab-based interface with 4 sections |
| `/frontend/shared.js` | API helpers & storage | 1600+ lines, data normalization, localStorage wrappers |
| `/backend/src/routes/lecturer.routes.js` | API endpoints | 122 lines, 6 endpoints for lecturer management |
| `/backend/src/controllers/lecturer.controller.js` | Request handlers | 172 lines, delegates to service layer |
| `/backend/src/services/lecturer.service.js` | Business logic | 283 lines, database queries for lecturer data |
| `/backend/src/services/registration.service.js` | Registration logic | 250+ lines, validation & enrollment queries |

---

## Quick Stats Overview

### Top Cards (4 KPIs)
```
Total Students        = count of users where role='student'
Active Registrations  = count of registrations where status in ['approved', 'allocated']
Unread Messages       = count of messages where to=lecturerId AND read=false
Pending Grading       = count of assignments where status='submitted'
```

### Overview Section (3 KPIs)
```
Programmes            = unique count of qualificationCode in registrations
Pass Rate             = (count of grades >= 50) / (total graded) * 100 %
Average Mark          = sum of all marks / count of graded assignments
```

---

## Data Sources Mapping

| Dashboard Element | Source | Endpoint | Storage |
|------------------|--------|----------|---------|
| Total Students | API | `/api/admin/users` | Memory (allUsers) |
| Active Registrations | API | `/api/registrations` | Memory (approvedRegs) |
| Unread Messages | Client | localStorage | localStorage['eduhub.legacy.messages.v1'] |
| Pending Grading | Client | localStorage | localStorage['eduhub.legacy.assignmentSubmissions.v1'] |
| Student Table | API + Client | `/api/registrations` + users | Memory (approvedRegs) |
| Submission Table | Client | localStorage | localStorage['eduhub.legacy.assignmentSubmissions.v1'] |
| Messages | Client | localStorage | localStorage['eduhub.legacy.messages.v1'] |
| Assignments | Client | localStorage | localStorage['eduhub.legacy.assignmentSubmissions.v1'] |
| Events | Client | localStorage | localStorage['eduhub.legacy.events.v1'] |

---

## Critical Functions

### Core Dashboard Functions

```javascript
// From Dashboard.html
renderOverviewKpis()          // Calculates & displays Programmes, Pass Rate, Avg Mark
renderAssignments()           // Filters and displays submissions with search/filter
gradeAsgn(id)                 // Updates assignment with mark & feedback
initMessageCompose()          // Populates student dropdown for messages
sendComposedMessage()         // Sends message to selected student
renderMessages()              // Shows inbox and sent messages
buildCal()                    // Renders calendar for current month
getUpcomingEvents(role)       // Filters future events by audience

// From shared.js
getUsers()                    // Fetches from /api/admin/users
getRegistrations()            // Fetches from /api/registrations, groups by student
getAssignments()              // Reads from localStorage
getInboxFor(userId)           // Filters messages to userId
getSentBy(userId)             // Filters messages from userId
sendMessage(from, to, subject, body)  // Creates message in localStorage
submitAssignment(...)         // Creates submission in localStorage
gradeAssignment(id, mark, feedback, gradedBy)  // Updates submission status
```

---

## Data Flow Sequences

### On Page Load
1. Check authentication (token + role)
2. Fetch users from `/api/admin/users`
3. Fetch registrations from `/api/registrations`
4. Read assignments from localStorage
5. Read messages from localStorage
6. Render all 4 top stat cards
7. Render 3 overview KPIs
8. Render student enrollment table
9. Render recent 5 submissions
10. Add badges to tabs if unread/pending exists

### When Tab is Switched
**Messages Tab:**
- Load all students into dropdown
- Render inbox (filtered to lecturer)
- Render sent messages (filtered from lecturer)

**Assignments Tab:**
- Build module filter dropdown
- Render all submissions with filters
- Render published assignments
- Calculate summary stats

**Calendar Tab:**
- Build calendar for current month
- Mark events with dots
- Show upcoming events list

### When User Takes Action
**Send Message:**
1. Validate inputs
2. Create message object
3. Append to localStorage
4. Re-render messages
5. Show confirmation

**Grade Assignment:**
1. Validate mark (0-100) & feedback
2. Update assignment in localStorage
3. Update status to 'graded'
4. Set gradedAt, gradedBy
5. Recalculate pass rate & average
6. Show confirmation

---

## Key Calculations

### Pass Rate
```javascript
const graded = allAsgns.filter(a => a.status==='graded');
const passMarks = graded.filter(a => Number(a.mark) >= 50);
const passRate = graded.length > 0 
  ? Math.round((passMarks.length / graded.length) * 100)
  : '—';
```

### Average Mark
```javascript
const graded = allAsgns.filter(a => a.status==='graded');
const avg = graded.length > 0
  ? Math.round(graded.reduce((s,a) => s + Number(a.mark||0), 0) / graded.length)
  : 0;
```

### Programme Count
```javascript
const approvedRegs = regs.filter(r => 
  r.status==='approved' || r.status==='allocated'
);
const progCount = new Set(approvedRegs.map(r => r.qualificationCode)).size;
```

---

## Database Tables Used (Backend)

```sql
-- Users & Roles
users              -- All system users
user_details       -- Extended user info (name, DOB, etc.)
lecturers          -- Lecturer-specific data (employee_number, department)
students           -- Student-specific data

-- Academic Structure
qualifications     -- Degree programs (BSc IT, BCom, etc.)
modules            -- Courses within qualifications
module_lecturers   -- Maps lecturers to their taught modules
module_schedules   -- Class times for modules

-- Enrollment & Applications
applications       -- Student applications for admission
registrations      -- Student enrollment in modules/programmes
semesters          -- Academic periods

-- Metadata
campuses           -- Physical/online campus info
```

---

## API Endpoints Used

### For Dashboard Data
```
GET /api/admin/users              -- Get all students (filter by role='student')
GET /api/registrations            -- Get all enrollments (filter & group by student)
GET /api/applications             -- Get all applications (mostly for admin)
GET /api/users/profile            -- Get current user profile
```

### For Lecturer-Specific Data
```
GET /api/lecturers/me             -- Get current lecturer profile
GET /api/lecturers/me/modules     -- Get modules taught by current lecturer
GET /api/lecturers/:id            -- Get specific lecturer
GET /api/lecturers/:id/modules    -- Get modules taught by specific lecturer
PATCH /api/lecturers/:id          -- Update lecturer info (admin only)
```

---

## localStorage Keys Used

| Key | Type | Purpose | Size (typical) |
|-----|------|---------|----------------|
| `authToken` | String | JWT for API auth | 500-1000 bytes |
| `currentUser` | JSON | Cached user object | 300-500 bytes |
| `eduhub.legacy.messages.v1` | JSON Array | Student-lecturer messages | Grows with usage |
| `eduhub.legacy.assignmentSubmissions.v1` | JSON Array | Assignments & grades | Grows with usage |
| `eduhub.legacy.lecturerAssignments.v1` | JSON Array | Published assignments | Grows with usage |
| `eduhub.legacy.events.v1` | JSON Array | Calendar events (4-10 items) | 2-5 KB |
| `eduhub.referenceData` | JSON (versioned) | Qualifications, nationalities | 50-100 KB |
| `_unreadCount` | String | Unread notification count | <10 bytes |

---

## Important Data Structures

### Registration (from API, grouped)
```javascript
{
  id: string,
  studentId: string,
  qualificationCode: string,
  qualificationName: string,
  semester: number (1 or 2),
  year: number (1-4),
  modules: [{code, name, credits}],
  status: 'approved' | 'allocated' | 'pending' | 'declined',
  totalFee: number,
  submittedAt: ISO8601_timestamp
}
```

### Assignment (in localStorage)
```javascript
{
  id: "asgn_*",
  studentId: string,
  moduleCode: string,
  moduleName: string,
  title: string,
  content: string (submission text),
  fileName: string | null,
  submittedAt: ISO8601_timestamp,
  status: 'submitted' | 'graded',
  mark: number (0-100) | null,
  feedback: string,
  gradedAt: ISO8601_timestamp | null,
  gradedBy: string | null
}
```

### Message (in localStorage)
```javascript
{
  id: "msg_*",
  from: userId,
  to: userId,
  subject: string,
  body: string,
  sentAt: ISO8601_timestamp,
  read: boolean,
  replies: [{id, from, body, sentAt}]
}
```

### Event (in localStorage)
```javascript
{
  id: "ev_*",
  title: string,
  date: "YYYY-MM-DD",
  time: "HH:MM" | "",
  type: 'academic' | 'exam' | 'general' | 'holiday',
  audience: 'all' | 'lecturers' | 'students' | 'admins',
  description: string,
  createdBy: userId | null,
  createdAt: ISO8601_timestamp
}
```

---

## Performance Characteristics

### Load Time
- **API Calls:** 2 (users + registrations) = ~500-1000ms typical
- **localStorage Reads:** 3 (messages, assignments, events) = <50ms
- **Total Page Load:** ~1-2 seconds (including rendering)

### Data Freshness
- **Users/Registrations:** Cached at page load, no auto-refresh
- **Messages/Assignments:** Real-time (localStorage), refreshed on tab switch
- **Events:** Real-time (localStorage)

### Scalability Limits
- **localStorage:** Browser-dependent, typically 5-10MB per domain
- **Current data:** ~100-500 KB typical (should fit comfortably)
- **100+ active submissions:** Performance acceptable
- **1000+ messages:** May slow down rendering without pagination

---

## Known Limitations

1. **No Database Persistence for Assignments**
   - All assignment submissions/grades are client-side only
   - Data lost if localStorage is cleared or in private browsing mode
   - Not synced across devices

2. **No Real-time Updates**
   - Data loaded once on page init
   - No live updates when students submit or other lecturers update
   - Browser refresh required for fresh data

3. **No File Storage**
   - Assignment files are referenced by name only
   - No actual file upload/download capability
   - Content is text-only

4. **Limited Search/Filter**
   - Client-side filtering only (slower with large datasets)
   - No full-text search index
   - Cannot search across archived data

5. **No Access Control Per Module**
   - Lecturer sees all students, all assignments
   - Future: Should filter by lecturer's assigned modules only

---

## Development Notes

### To Add a New Dashboard Metric

1. **Frontend (Dashboard.html):**
   - Add calculation in renderOverviewKpis() or async IIFE
   - Add HTML element to display
   - Ensure data is loaded before rendering

2. **Data Source:**
   - If from API: Use getUsers(), getRegistrations(), etc. from shared.js
   - If from client: Use getAssignments(), getMessages(), etc.
   - Ensure caching strategy matches (API vs localStorage)

3. **Testing:**
   - Check with 0, 1, 10, 100+ records
   - Verify calculations are correct
   - Test with different registration statuses

### To Add Database Persistence

1. Create API endpoint in `/backend/src/routes/`
2. Add service method in `/backend/src/services/`
3. Replace localStorage calls with API calls in shared.js
4. Update Dashboard.html to use new API functions
5. Handle errors and loading states

---

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| Stats showing 0 | API call failed | Check network tab, verify token validity |
| Messages not appearing | localStorage not initialized | Clear storage, reload page |
| Assignments not grading | Mark validation failed | Check console for error message |
| Calendar not rendering | Event array malformed | Verify localStorage['eduhub.legacy.events.v1'] format |
| Student names missing | User data not fetched | Ensure /api/admin/users is called before rendering table |

---

## Related Files

- Dashboard styling: `/frontend/shared.css` (responsive grid, cards, tables)
- Navigation: `/frontend/shared.js` (renderNavbar function)
- Authentication: `/frontend/shared.js` (requireAuth, login, logout)
- Admin Dashboard: `/frontend/admin/Dashboard.html` (similar structure)
- Student Dashboard: `/frontend/student/Dashboard.html` (different data)

---

