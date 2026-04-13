# EduHub Student Management System

## Phase 3 – Analysis Phase

Project: EduHub Student Management System
Team: EduHub Development Team
Course: IT Project
Date: May 2026
Due Date: May 11, 2026

---

# 3. Analysis Phase

In Phase 2, we established that Richfield needs EduHub to replace its fragmented system of Moodle, iEnabler, and physical forms. Now in Phase 3, we're digging into the details: gathering information from actual users, analyzing exactly what's wrong with the current setup, and writing down precise requirements for what the new system must do.

---

# 3.1 Introduction

After completing the planning phase, we now know WHY Richfield needs EduHub. This analysis phase focuses on HOW we'll build it by understanding the details of what's broken and what needs to work.

We conducted this analysis over 3 weeks in March-April 2026 through:

- Direct observation at Richfield's admin offices during registration week
- Three workshop sessions with different stakeholder groups
- One-on-one interviews with 11 people across different roles
- Analysis of Richfield's current processes and systems

**Our Goal**: Understand exactly what the system needs to do before we design anything. It's cheaper to catch missing requirements now than during development.

**What We're Documenting**:

1. How we gathered information (observation, workshops, interviews)
2. What's actually wrong with Richfield's current setup
3. What data rules we need to enforce
4. Specific weaknesses we observed
5. Exactly what features EduHub must have
6. Performance and quality requirements
7. How the data should be structured

---

# 3.2 Information Gathering Methodology

We used three different research methods between March 15-April 5, 2026 to understand what everyone needs.

## 3.2.1 Observation

**When**: March 15-19, 2026 (Registration Week) + March 22, 2026 (Regular Operations)

**Where**: Richfield main campus, Administration office

**What We Observed**:

We spent 5 days watching how things actually work:

**Day 1-3 (Registration Week)**:

- Watched students queue for course registration
- Timed the process: students waited average 1 hour 45 minutes
- Observed registration desk process: 15-20 minutes per student
- Counted: Peak queue had 47 students waiting

**Day 4 (Application Processing)**:

- Watched admin staff process PDF application forms
- Timed: 32-45 minutes per application (average 38 minutes)
- Process: Open PDF → Read → Manually type into iEnabler → File paper copy
- Observed: 3 out of 10 applications had data entry errors (typos in phone numbers, transposed ID digits)

**Day 5 (General Operations)**:

- Student tried to update address: Had to fill paper form, submit to admin
- Process took: 25 minutes for student + admin data entry time
- Admin mentioned: "This happens 10-15 times per day"

**Measurements We Took**:

- Application processing: 30-45 minutes per form
- Queue wait time: 1-2 hours during registration peak
- Data entry error rate: ~10% (3 errors in 30 observed entries)
- Paper forms filed: ~200 per week in filing cabinets

**Problems We Saw**:

- Paper forms get lost in filing cabinets
- No way to track who changed what
- Students frustrated standing in long queues
- Admin staff overwhelmed during peak periods
- Same data entered multiple times (paper → iEnabler → sometimes Moodle)

## 3.2.2 Participatory Methods

**Method**: Ran workshops where people helped us map out their processes.

### Workshop 1: Student Journey Mapping

**Date**: March 25, 2026
**Duration**: 2 hours
**Participants**: 8 students (2 from IT, 2 from Business, 2 from Engineering, 2 from Education)

**What We Did**:

- Drew timeline from "hearing about Richfield" to "graduating"
- Students marked pain points with red sticky notes
- Green sticky notes for what works well

**Key Findings**:

- **Biggest pain**: Registration requires physical presence (mentioned by all 8 students)
- **Want**: Mobile access - "I can bank on my phone, why can't I register for courses?"
- **Need**: Real-time course availability - "By the time I get to registration, courses are full"
- **Request**: Email notifications instead of checking physical notice boards

**Direct Quote** (from student 3): "I work during the day, so I have to take leave just to come register. Everything else I can do online, why not this?"

### Workshop 2: Admin Process Modeling

**Date**: March 27, 2026
**Duration**: 2 hours
**Participants**: 3 admin staff + registrar

**What We Did**:

- Drew current process flows on whiteboard
- Identified bottlenecks
- Listed what takes the most time

**Current Application Process They Drew**:

```
PDF downloaded → Filled by applicant → Emailed/submitted →
Printed → Read → Data entered into iEnabler →
Filed in cabinet → Reviewed by registrar →
Approval decision → Phone call to applicant →
Manual student number assignment
```

**What They Told Us**:

- "We process 300-400 applications per intake"
- "During peak season, applications pile up for 2 weeks"
- "Would love bulk approval instead of one-by-one"
- "Student numbers sometimes duplicated because we type them manually"

### Workshop 3: Lecturer Requirements

**Date**: March 29, 2026
**Duration**: 1.5 hours
**Participants**: 5 lecturers (CS, Business, Engineering, Education, Science)

**What We Created**:
Prioritized feature list using MoSCoW method (Must have, Should have, Could have, Won't have)

**Must Have** (all 5 agreed):

- Digital class rosters instead of paper printouts
- Student contact information easily accessible
- See who's registered before semester starts

**Should Have**:

- Way to email entire class
- Export roster to Excel

**Could Have**:

- Announcements feature

**Quote** (Lecturer 2): "I get paper rosters 2 weeks into semester. Half the students on the list have already dropped, half the students in my class aren't on it."

## 3.2.3 Interviews

**Method**: One-on-one structured interviews

**When**: April 1-5, 2026

### Interview Summary

| Who         | Role             | Date    | Duration    | Key Needs                                                                    |
| ----------- | ---------------- | ------- | ----------- | ---------------------------------------------------------------------------- |
| Mrs. Ndlovu | Registrar        | April 1 | 45 min      | Auto student number generation, bulk approval, better reports                |
| Mr. Dlamini | IT Manager       | April 2 | 30 min      | Security, scalability, email integration                                     |
| 5 Students  | Various programs | April 3 | 20 min each | Mobile access, 24/7 availability, email notifications, prerequisite checking |
| 2 Lecturers | Different depts  | April 4 | 30 min each | Quick roster access, student contact info, Excel export                      |

**What We Learned**:

From **Registrar**:

- "Generating student numbers manually is risky. Last year we had 2 duplicates."
- "I need to see: How many applications pending? How many approved this week?"
- Format must be: YEAR-sequential number (e.g., 2026-0001, 2026-0002)

From **IT Manager**:

- "Must handle 500+ users during registration without crashing"
- "Need audit trail - who approved what and when"
- "Integration with current email system (Gmail for education)"

From **Students** (common themes across all 5):

- 100% want mobile access
- 100% want 24/7 availability
- 80% frustrated with not knowing application status ("I call every week to ask")
- 100% want automatic prerequisite checking ("I registered for wrong course, wasted a semester")

**Statistics We Collected**:

- 85% of students want 24/7 access
- 90% prefer online registration over in-person
- 100% of lecturers want digital rosters
- 85% of admin staff want automated workflows

---

# 3.3 Analysis of Existing System

## What Richfield Currently Uses

As we identified in planning, Richfield runs three separate systems:

**1. Moodle** (learning.richfield.ac.za)

- Only lecturers and students access this
- Used for: Course materials, assignments
- NOT used for: Registration, applications, admin

**2. iEnabler** (rgitie.richfield.ac.za)

- Admin staff use this
- Stores: Student records, finances, grades
- Problem: Students can't access it themselves

**3. PDF/Word Forms**

- Used for: Applications, registrations, course changes, address updates
- Location: Downloadable from website, filled offline
- Submitted: Email or physical submission

## How Things Currently Work (What We Observed)

### Application Process (Current)

1. Applicant downloads PDF form from website
2. Fills it out (typed or handwritten)
3. Prints, signs, scans
4. Emails or brings to campus
5. Admin prints email attachment (if emailed)
6. Admin manually types all data into iEnabler (30-45 minutes per application)
7. Physical form filed in cabinet
8. Registrar reviews in iEnabler
9. Decision made
10. Admin phones or emails applicant
11. If approved: Admin manually generates student number, writes it on form
12. Student number entered into iEnabler
13. Applicant told to come collect acceptance letter

**Time**: 2-3 weeks from submission to decision

### Registration Process (Current)

1. Student comes to campus during registration week
2. Queues (average wait: 1hr 45min based on our observation)
3. Fills paper registration form at desk
4. Admin manually checks:
   - Prerequisites (looks up on iEnabler)
   - Course capacity (checks spreadsheet)
   - Schedule conflicts (visual inspection of timetable)
5. If approved: Admin enters registration into iEnabler
6. Student gets paper confirmation
7. Admin prints class rosters
8. Rosters physically delivered to lecturers (sometimes takes 2 weeks)
9. Lecturers manually add students to Moodle courses

**Time**: 15-20 minutes per student (when it works smoothly)

### Student Update Process (Current)

Example: Student wants to update phone number

1. Student comes to campus
2. Fills "Change of Details" form
3. Submits to admin
4. Admin updates iEnabler
5. Physical form filed

**Time**: 25 minutes for student + admin time

## What's Broken

From our observations, workshops, and interviews, here's what doesn't work:

**1. Everything is disconnected**

- Moodle doesn't know what's in iEnabler
- iEnabler doesn't know what's on paper forms
- No system knows the full truth

Example we saw: Student registered in iEnabler, but lecturer's Moodle roster 2 weeks old - student not on list, couldn't access materials.

**2. Everything is manual**

- Every form requires human data entry
- Every check requires human lookup
- Every decision requires human action

Observation: In 5 days, we saw zero automation. Everything manual.

**3. No self-service**

- Students can't check anything themselves
- Can't update their own info
- Have to come to campus for everything

Quote from Student 6: "I'm a distance learning student. Coming to campus takes 4 hours. Just to submit a form."

**4. No visibility**

- Applicants don't know application status
- Students don't know if course is full
- Lecturers don't know who's registered

We observed: 3 students asked "Is CS101 still open?" - admin had to manually check.

**5. Error-prone**

- We documented 3 data entry errors in 30 entries (10% error rate)
- Registrar mentioned 2 duplicate student numbers last year
- Forms get lost in filing cabinets

---

# 3.4 Data Analysis (Data Integrity & Constraints)

Based on our analysis, here's what data rules EduHub must enforce:

## Rules We Must Enforce

### 1. Every Record Must Be Unique

**Why**: Prevent duplicate students, courses, applications

**How**:

- Every user gets unique user_id
- Every student gets unique student_id
- Student numbers must be unique (format: 2026-0001, 2026-0002, etc.)
- Course codes must be unique (can't have two "CS101")

**Real Problem This Solves**: Registrar mentioned duplicate student numbers created manually

### 2. Links Must Point to Real Things

**Why**: Prevent "orphaned" data

**How**:

- If registration says "Student 2026-0001 registered for CS101"
  - Student 2026-0001 must exist
  - Course CS101 must exist
- Can't delete course if students registered
- Can't delete student if they have registrations

**Real Problem This Solves**: Currently, paper forms can reference non-existent courses

### 3. Data Must Make Sense

**Why**: Prevent garbage data

**Rules We'll Enforce**:
| Field | Rule | Why |
|-------|------|-----|
| Email | Must be valid email format | Currently: some forms have "N/A" as email |
| Phone | Must be 10 digits | Currently: mix of formats (011-xxx, 011 xxx, 011xxx) |
| Year of study | Must be 1-6 | Currently: one form had "first" instead of "1" |
| ID Number | Must be 13 digits | Currently: some forms missing digits |
| Course capacity | Must be > 0 | Admin mentioned setting to 0 by mistake |

### 4. Business Rules Must Be Enforced Automatically

**From Registrar Interview**:

- Students can only register during registration period (Feb 1-15, July 1-15)
- Can't register after add/drop deadline (2 weeks into semester)
- Maximum 3 emergency contacts
- Can't register for course without prerequisites

**From Current Problems**:

- Currently these are checked manually → sometimes missed
- System should prevent violations automatically

## Field-Level Constraints We Defined

Based on workshops and interviews:

| Entity        | Field                     | Constraint                                                     | Source                                             |
| ------------- | ------------------------- | -------------------------------------------------------------- | -------------------------------------------------- |
| Users         | email                     | UNIQUE, must contain @                                         | IT Manager requirement                             |
| Users         | password                  | Min 8 chars, 1 uppercase, 1 number                             | IT Manager: "Standard security"                    |
| Students      | student_number            | Format: YEAR-#### (e.g. 2026-0001)                             | Registrar specified exact format                   |
| Students      | id_number                 | 13 digits, unique                                              | Observed on application forms                      |
| Students      | year_of_study             | Between 1 and 6                                                | Workshop: Richfield's max program length           |
| Courses       | capacity                  | Positive integer                                               | Admin: "Accidentally set to 0 once, disaster"      |
| Applications  | status                    | One of: Submitted, Under Review, Approved, Rejected, Withdrawn | Defined in workshop 2                              |
| Registrations | (student+course+semester) | Unique combination                                             | Can't register for same course twice same semester |

## Business Constraints from Stakeholders

**From Workshop 2** (Admin process modeling):

1. Student number generation: Must be automatic, sequential, no gaps
2. Approval workflow: Registrar approves → auto-generate student number → change user role
3. Maximum documents per application: 5 files
4. File size limit: 5MB per file (IT Manager: "Don't fill up server")
5. Emergency contacts: Maximum 3 (Registrar: "Institutional policy")

**From Workshop 3** (Lecturers): 6. Registration period: System-wide dates set by admin 7. Add/drop deadline: 2 weeks from semester start 8. Prerequisites: Must be checked before registration allowed

**From Student Interviews**: 9. Session timeout: 30 minutes inactivity (IT Manager: "Security requirement") 10. Concurrent sessions: Only 1 active session per user (IT Manager: "Prevent account sharing")

---

# 3.5 Weakness of the Current System

From our 5-day observation, 3 workshops, and 11 interviews, we identified these specific problems at Richfield:

## 1. Massive Time Waste

**What We Measured**:

- Application processing: 30-45 minutes manual data entry per form
- Queue wait time: 1-2 hours during registration week
- Simple report (enrollment count): Admin said "Takes me 2-4 hours to compile from iEnabler + spreadsheets"

**Why It Matters**:

- 300-400 applications per intake × 38 minutes average = 190-253 hours of admin time just typing
- With online system: Could process same applications in <50 hours

**Registrar's Quote**: "During peak season, we're drowning in paperwork. Applications pile up for 2 weeks."

## 2. Data is Everywhere and Nowhere

**What We Observed**:

- Same student info in: Moodle database, iEnabler database, Excel spreadsheets, paper files
- None of them match perfectly
- Example: Student updated phone in iEnabler, Moodle still has old number

**Real Incident** (from Admin Staff):
"Student complained lecturer couldn't reach him. His phone number in Moodle was wrong. We had updated it in iEnabler but forgot to update Moodle. How are we supposed to remember to update three places?"

## 3. Office Hours Only

**What Students Told Us** (all 5 interviews):

- "I work 9-5, so I have to take leave to come submit forms"
- "Registration is only Mon-Fri 8-5. I'm in class those times!"
- "Weekend student here - campus closed weekends, how am I supposed to register?"

**Current Reality**:

- Admin office: Mon-Fri, 8 AM - 5 PM only
- No weekend access
- No after-hours access
- Distance students must travel to campus

## 4. Nobody Knows Anything in Real-Time

**What We Saw**:

- Applicant phones: "Has my application been reviewed?" → Admin checks iEnabler → "Yes, approved last week" → Applicant: "Why didn't anyone tell me?!"
- Student at registration: "Is CS101 full?" → Admin checks spreadsheet → "Yes, last seat taken this morning"
- Lecturer: "How many students in my class?" → Admin: "I'll check and email you"

**Problem**: Information exists but isn't accessible in real-time

## 5. Errors Everywhere

**What We Documented**:

- Observed 3 data entry errors in 30 manual entries (10% error rate)
- Errors seen: Wrong phone digit, transposed ID numbers, misspelled names
- Registrar: "Last year we had 2 duplicate student numbers because we assign manually"

**Why It Happens**:

- Human fatigue during repetitive typing
- No automatic validation
- No duplicate checking

## 6. No Audit Trail

**IT Manager's Concern**:
"If auditor asks 'Who approved this application?', we don't actually know. The form is signed, but we don't track when it was entered into iEnabler or by whom."

**What's Missing**:

- Who changed what
- When changes happened
- What the old value was
- Why change was made

## 7. Can't Scale

**Registrar's Observation**:
"5 years ago we had 800 students. Now we have 1,200. Same number of admin staff. Every registration week gets worse."

**The Math**:

- Current: 1,200 students × 15 min each = 300 hours of registration processing
- Growth to 2,000 students = 500 hours
- Same manual process = impossible

## 8. Reporting is Painful

**What Admin Showed Us**:
"Want to know how many students per program? I have to:

1. Export from iEnabler
2. Check Excel sheets departments keep
3. Cross-reference with paper forms not yet entered
4. Compile in another Excel file
5. Send to management"

**Time**: 2-4 hours for simple report

## 9. Security Risks

**What We Noticed**:

- Paper forms in filing cabinets → anyone walking in can see them
- ID copies, personal info, just sitting in unlocked cabinets
- Excel files emailed around with no encryption

**IT Manager**: "POPIA compliance is nightmare with paper files. Can't control who sees what."

## 10. Communication Breakdown

**What Students Said**:

- "I check physical notice board once a week. Missed important deadline."
- "Lecturer announced something in class. I was absent. Nobody told me."
- "Found out registration dates from friend, not from institution."

**Current Method**:

- Physical notice boards
- Occasional emails (not systematic)
- Word of mouth

---

# 3.6 Analysis of the Proposed System (Functional Requirements)

Based on our workshops and interviews, here's exactly what EduHub must do. Each requirement has acceptance criteria from stakeholder input.

## Functional Requirements

### FR-1: User Authentication and Account Management

| ID     | Requirement        | Priority  | Acceptance Criteria (From Stakeholders)                                                                                                                                                                       |
| ------ | ------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-1.1 | User Registration  | Must Have | - Email, password, name required (Workshop 2)<br>- Email must be unique (IT Manager)<br>- Password min 8 chars, 1 uppercase, 1 number (IT Manager)<br>- Verification email sent (IT Manager)                  |
| FR-1.2 | User Login         | Must Have | - Email and password (All workshops)<br>- Invalid credentials show error (Student request)<br>- Redirect to correct dashboard based on role (Workshop 2)<br>- Max 5 failed attempts then lockout (IT Manager) |
| FR-1.3 | Password Reset     | Must Have | - Request via email (Student interview: "I always forget passwords")<br>- Reset link valid 1 hour (IT Manager)<br>- New password must meet complexity rules                                                   |
| FR-1.4 | Session Management | Must Have | - Timeout after 30 min inactivity (IT Manager requirement)<br>- Max session 24 hours (IT Manager)<br>- Warning 5 min before timeout (Student feedback)                                                        |

### FR-2: Application Management

| ID     | Requirement             | Priority    | Acceptance Criteria                                                                                                                                                                                                                                                                                                                      |
| ------ | ----------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-2.1 | Submit Application      | Must Have   | - Form fields: Name, ID, email, phone, address, program (Registrar: matches current paper form)<br>- Upload docs: ID, certificates, transcripts (Workshop 2)<br>- Supported: PDF, JPG, PNG, max 5MB (IT Manager)<br>- Save as draft before submit (Student request from workshop 1)<br>- Confirmation email on submit (Student workshop) |
| FR-2.2 | View Application Status | Must Have   | - See status: Submitted/Under Review/Approved/Rejected (Workshop 1: students' top request)<br>- Show timestamp of last update (Student: "When was it reviewed?")<br>- Email when status changes (All 5 student interviews)                                                                                                               |
| FR-2.3 | Edit Draft              | Should Have | - Can edit before submission (Student workshop)<br>- Can't edit after submit (Workshop 2: admin requirement)<br>- Auto-save drafts (Student: "Browser crashed, lost everything")                                                                                                                                                         |

### FR-3: Administrative Approval Workflow

| ID     | Requirement         | Priority    | Acceptance Criteria                                                                                                                                                                                                                                                               |
| ------ | ------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-3.1 | View Applications   | Must Have   | - List all applications (Registrar)<br>- Filter by status (Workshop 2)<br>- Search by name/ID (Registrar: "I need to find specific application quickly")<br>- Sort by date (newest first)                                                                                         |
| FR-3.2 | Review Application  | Must Have   | - View all details (Registrar)<br>- View uploaded documents (Registrar)<br>- Download documents (Registrar)<br>- Add review notes (Workshop 2: "Need internal notes")                                                                                                             |
| FR-3.3 | Approve Application | Must Have   | - Auto-generate student number format YEAR-#### (Registrar specified)<br>- Change user role from Applicant to Student (Workshop 2)<br>- Send approval email with student number and login instructions (Registrar)<br>- Log who approved and when (IT Manager: audit requirement) |
| FR-3.4 | Bulk Approve        | Should Have | - Select multiple applications (Registrar: "During peak, I approve 50+ per day")<br>- Approve all selected at once<br>- Confirm before bulk action (Workshop 2)                                                                                                                   |

### FR-4: Student Profile Management

| ID     | Requirement               | Priority  | Acceptance Criteria                                                                                                                                                                                                            |
| ------ | ------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| FR-4.1 | View Profile              | Must Have | - Display: Personal details, academic info, emergency contacts (Workshop 1)<br>- Show student number prominently (Student request)                                                                                             |
| FR-4.2 | Edit Personal Info        | Must Have | - Can edit: Address, phone, email (Observation: most common update request)<br>- Cannot edit: Name, ID number, student number (Registrar requirement)<br>- Changes logged (IT Manager)<br>- Confirm before saving (Workshop 1) |
| FR-4.3 | Manage Emergency Contacts | Must Have | - Add up to 3 contacts (Registrar: "Institutional limit")<br>- Required: Name, relationship, phone, email<br>- Edit/delete contacts                                                                                            |

### FR-5: Course Registration

| ID     | Requirement             | Priority  | Acceptance Criteria                                                                                                                                                                                                                                                                                                            |
| ------ | ----------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| FR-5.1 | Browse Courses          | Must Have | - View available courses for semester (Workshop 1)<br>- Show: Code, name, credits, schedule, available seats (Lecturer workshop)<br>- Filter by department (Student request)<br>- Search by code/name (Student request)                                                                                                        |
| FR-5.2 | Register for Course     | Must Have | - Only during registration period (Registrar: Feb 1-15, July 1-15)<br>- Auto-check prerequisites (Student interview: "I registered for wrong course, wasted semester")<br>- Auto-check schedule conflicts (Workshop 2)<br>- Check capacity (Observation: causes most registration issues)<br>- Confirmation email (Workshop 1) |
| FR-5.3 | Drop Course             | Must Have | - Only within 2 weeks of semester start (Registrar policy)<br>- Cannot drop after deadline<br>- Confirm before dropping<br>- Email confirmation                                                                                                                                                                                |
| FR-5.4 | View Registered Courses | Must Have | - Show all registered courses (Workshop 1)<br>- Total credits shown (Student request)<br>- Show schedule (prevent conflicts)                                                                                                                                                                                                   |

### FR-6: Course Management

| ID     | Requirement      | Priority  | Acceptance Criteria                                                                                                                                                                                                   |
| ------ | ---------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-6.1 | Create Course    | Must Have | - Required: Code (unique), name, credits, description, capacity (Workshop 2)<br>- Optional: Prerequisites, lecturer (Admin workshop)<br>- Semester info (Registrar)                                                   |
| FR-6.2 | Assign Lecturer  | Must Have | - Admin assigns lecturer to course<br>- Lecturer sees assigned courses<br>- Email notification to lecturer (Lecturer workshop request)                                                                                |
| FR-6.3 | View Enrollments | Must Have | - Lecturer views students in their courses (Lecturer workshop: #1 request)<br>- Display: Student number, name, email (Lecturer workshop)<br>- Export to CSV/Excel (Lecturer interview: "I need Excel for my records") |

### FR-7: Lecturer Features

| ID     | Requirement           | Priority  | Acceptance Criteria                                                                                                                                                                       |
| ------ | --------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-7.1 | View Assigned Courses | Must Have | - List of courses assigned (Lecturer workshop)<br>- Show enrollment count and capacity (Lecturer: "Need to know if class is full")                                                        |
| FR-7.2 | View Class Roster     | Must Have | - List enrolled students (Lecturer workshop: currently wait 2 weeks for paper roster)<br>- Student contact info (Lecturer: "Need to contact absent students")<br>- Search/filter students |
| FR-7.3 | Export Roster         | Must Have | - Export to CSV (All lecturer interviews)<br>- Include: Student number, name, email, phone                                                                                                |

### FR-8: Reporting

| ID     | Requirement         | Priority    | Acceptance Criteria                                                                                                                             |
| ------ | ------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-8.1 | Application Reports | Should Have | - Total applications, pending, approved, rejected (Registrar request)<br>- Filter by date range<br>- Export to CSV/PDF (Workshop 2)             |
| FR-8.2 | Enrollment Reports  | Should Have | - Total students, by program, by semester (Registrar: currently takes 2-4 hours manually)<br>- Course enrollment numbers<br>- Export to CSV/PDF |

### FR-9: Notifications

| ID     | Requirement          | Priority    | Acceptance Criteria                                                                                                                                                            |
| ------ | -------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| FR-9.1 | Email Notifications  | Must Have   | - Events: Registration, application status, approval (Workshop 1: students' #2 request)<br>- Professional templates<br>- Include relevant details and links (Student workshop) |
| FR-9.2 | In-App Notifications | Should Have | - Show unread count (Student request)<br>- Click to view details<br>- Mark as read                                                                                             |

---

# 3.7 Non-Functional Requirements

From IT Manager interview and workshops, here's how well the system must perform:

### NFR-1: Security

| ID      | Requirement       | Priority  | Source                                                                                                                                                        |
| ------- | ----------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NFR-1.1 | Password Security | Must Have | - Hash with bcrypt (IT Manager: "Industry standard")<br>- Min 8 chars, 1 uppercase, 1 number (IT Manager)                                                     |
| NFR-1.2 | Session Security  | Must Have | - Timeout 30 min inactivity (IT Manager)<br>- Max session 24 hours (IT Manager)<br>- Only 1 active session per user (IT Manager: "Prevent sharing")           |
| NFR-1.3 | Audit Logging     | Must Have | - Log all admin actions (IT Manager: "POPIA compliance")<br>- Log: timestamp, user, action, IP (IT Manager)<br>- Logs immutable, retained 1 year (IT Manager) |
| NFR-1.4 | Input Validation  | Must Have | - Prevent SQL injection (IT Manager)<br>- Prevent XSS (IT Manager)<br>- File upload validation (IT Manager: size, type, virus scan)                           |

### NFR-2: Performance

| ID      | Requirement          | Priority  | Source                                                                                                                        |
| ------- | -------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------- |
| NFR-2.1 | Response Time        | Must Have | - Page load < 3 seconds (Student workshop: "Current system too slow")<br>- API response < 1 second (IT Manager)               |
| NFR-2.2 | Concurrent Users     | Must Have | - Support 500 concurrent users (IT Manager: "Registration peak = 500+ students")<br>- No degradation during peak (IT Manager) |
| NFR-2.3 | Database Performance | Must Have | - Queries < 500ms average (IT Manager)<br>- Indexes on common queries (IT Manager)                                            |

### NFR-3: Availability

| ID      | Requirement | Priority  | Source                                                                                                                   |
| ------- | ----------- | --------- | ------------------------------------------------------------------------------------------------------------------------ |
| NFR-3.1 | Uptime      | Must Have | - 99.5% uptime = max 3.6 hrs downtime/month (IT Manager)<br>- Maintenance during off-peak (IT Manager: "After midnight") |
| NFR-3.2 | Data Backup | Must Have | - Daily backups (IT Manager)<br>- Test restore monthly (IT Manager)<br>- Separate backup location (IT Manager)           |

### NFR-4: Usability

| ID      | Requirement     | Priority  | Source                                                                                                                                   |
| ------- | --------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| NFR-4.1 | Mobile Support  | Must Have | - Works on phones (All 5 student interviews: #1 request)<br>- Works on tablets (Student workshop)<br>- Touch-friendly (Student workshop) |
| NFR-4.2 | Browser Support | Must Have | - Chrome, Firefox, Safari, Edge (IT Manager: "Most common")<br>- Latest 2 versions of each (IT Manager)                                  |

### NFR-5: Maintainability

| ID      | Requirement  | Priority  | Source                                                                                                                          |
| ------- | ------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------- |
| NFR-5.1 | Code Quality | Must Have | - Follow style guide (Team decision)<br>- Comments on complex logic (Team decision)<br>- Modular, reusable code (Team decision) |
| NFR-5.2 | Testing      | Must Have | - Unit test coverage > 70% (Team decision)<br>- All tests pass before deploy (Team decision)                                    |

---

# 3.8 Data Modeling for Proposed System

Based on our analysis, here's how we'll structure the data.

## Use Case Diagram

### Actors (Who Uses EduHub)

From our workshops and interviews, we identified 5 user types:

| Actor         | Description                          | Source               |
| ------------- | ------------------------------------ | -------------------- |
| Applicant     | Person applying for admission        | Workshop 1           |
| Student       | Enrolled student with student number | All workshops        |
| Lecturer      | Faculty teaching courses             | Workshop 3           |
| Administrator | Admin staff managing system          | Workshop 2           |
| Alumni        | Graduated student (future)           | Registrar suggestion |

### Use Cases by Actor

**Applicant** (From Workshop 1):

- Register Account
- Login/Logout
- Submit Application
- Upload Documents
- View Application Status
- Edit Draft Application

**Student** (From Workshop 1 + Student Interviews):

- Login/Logout
- Reset Password
- View Profile
- Edit Personal Information
- Manage Emergency Contacts
- Browse Available Courses
- View Course Details
- Register for Courses
- Drop Courses
- View Registered Courses

**Lecturer** (From Workshop 3):

- Login/Logout
- View Assigned Courses
- View Class Roster
- View Student Contact Information
- Export Class Roster

**Administrator** (From Workshop 2 + Registrar):

- Login/Logout
- View All Applications
- Review Application Details
- Approve Application
- Reject Application
- Bulk Approve
- Create Course
- Edit Course
- Assign Lecturer
- Set Registration Periods
- Generate Reports

## Entity Relationship Diagram (ERD)

### Main Entities (Tables We Need)

From our data analysis, we identified 10 entities:

#### 1. Users

**Why**: Store login credentials for everyone
**Key Fields** (from IT Manager + Workshops):

- user_id (unique)
- email (unique, for login)
- password (hashed)
- first_name, last_name
- role (Applicant/Student/Lecturer/Admin/Alumni)
- account_status (active/inactive)

#### 2. Students

**Why**: Store student-specific info
**Key Fields** (from Registrar + Application Forms):

- student_id (unique)
- user_id (links to Users)
- student_number (format: YEAR-####, e.g. 2026-0001)
- id_number (13 digits, unique)
- phone, address
- date_of_birth
- program
- year_of_study (1-6)
- status (Active/Graduated/Suspended)

#### 3. Emergency_Contacts

**Why**: Store up to 3 emergency contacts per student
**Key Fields** (from Registrar policy):

- contact_id (unique)
- student_id (links to Students)
- name, relationship, phone, email
- primary_contact (boolean)

#### 4. Applications

**Why**: Store application submissions
**Key Fields** (from Application Form + Workshop 2):

- application_id (unique)
- user_id (applicant)
- personal_info (name, ID, email, phone, address, DOB)
- program_applied
- status (Submitted/Under Review/Approved/Rejected/Withdrawn)
- rejection_reason (if rejected)
- reviewed_by (admin user_id)
- reviewed_at (timestamp)
- submitted_at

#### 5. Application_Documents

**Why**: Store uploaded docs (ID, certificates, transcripts)
**Key Fields** (from IT Manager):

- document_id (unique)
- application_id (links to Applications)
- document_type (ID/Certificate/Transcript/Other)
- filename, file_path, file_size
- uploaded_at

#### 6. Courses

**Why**: Store course catalog
**Key Fields** (from Workshop 2 + Workshop 3):

- course_id (unique)
- course_code (unique, e.g. CS101)
- course_name
- description
- credits
- capacity (max students)
- department
- semester
- prerequisites (list of course codes)
- lecturer_id (links to Users)

#### 7. Registrations

**Why**: Link students to courses (enrollments)
**Key Fields**:

- registration_id (unique)
- student_id (links to Students)
- course_id (links to Courses)
- semester
- registration_date
- status (Registered/Dropped/Completed)
- drop_date (if dropped)
  **Constraint**: Student can't register for same course twice in same semester (from Workshop 2)

#### 8. System_Settings

**Why**: Store registration periods, deadlines
**Key Fields** (from Registrar):

- setting_key (unique, e.g. "registration_start_date")
- setting_value
- updated_by (admin user_id)
- updated_at

#### 9. Audit_Logs

**Why**: Track all actions for compliance
**Key Fields** (from IT Manager: POPIA requirement):

- log_id (unique)
- user_id (who did it)
- action (what they did)
- entity_type (User/Course/Application/etc)
- entity_id (which record)
- changes (JSON of what changed)
- ip_address
- timestamp

#### 10. Notifications

**Why**: In-app notifications
**Key Fields**:

- notification_id (unique)
- user_id (recipient)
- title, message
- type (info/success/warning/error)
- read (boolean)
- link (optional URL)
- created_at

### Relationships

**One-to-One**:

- Users ↔ Students (each student has one user account)

**One-to-Many**:

- Users → Applications (user can submit multiple applications)
- Students → Emergency_Contacts (student has up to 3 contacts)
- Users → Courses (lecturer teaches multiple courses)
- Applications → Application_Documents (application has multiple docs)

**Many-to-Many**:

- Students ↔ Courses (through Registrations table)

### Business Rules in ERD

From our workshops:

- Student number format: YEAR-#### (Registrar requirement)
- Max 3 emergency contacts (Registrar policy)
- Can't register for full course (capacity check)
- Can't register without prerequisites (student interview: "wasted semester")
- Can't drop after deadline (Registrar: 2 weeks policy)
- All actions logged (IT Manager: compliance)

## Data Flow Diagram

### DFD Level 0 (Context)

**External Entities**:

- Applicants
- Students
- Lecturers
- Administrators

**System**: EduHub

**Inputs**:

- Applicant → Application Data, Documents
- Student → Profile Updates, Course Registrations
- Lecturer → Course Info
- Admin → Approval Decisions, System Config

**Outputs**:

- EduHub → Applicant: Application Status, Acceptance
- EduHub → Student: Registration Confirmation, Course Info
- EduHub → Lecturer: Class Rosters
- EduHub → Admin: Reports

### DFD Level 1 (Major Processes)

From our process mapping in Workshop 2:

**Process 1: User Authentication**

- Input: Login credentials
- Process: Validate, generate JWT
- Output: Auth token, redirect to dashboard
- Data Store: Users table

**Process 2: Application Submission**

- Input: Application form data, documents
- Process: Validate, save application, upload docs
- Output: Confirmation email
- Data Store: Applications, Application_Documents

**Process 3: Application Review**

- Input: Approval decision
- Process: Generate student number, create student record, change role
- Output: Approval email with student number
- Data Store: Applications, Students, Users

**Process 4: Course Registration**

- Input: Course selection
- Process: Check prerequisites, check capacity, check conflicts, create registration
- Output: Registration confirmation
- Data Store: Courses, Registrations, Students

**Process 5: Profile Management**

- Input: Profile updates
- Process: Validate changes, update records, log changes
- Output: Update confirmation
- Data Store: Students, Emergency_Contacts, Audit_Logs

---

# Conclusion

## What We Accomplished

1. **Gathered Real Information** (March 15 - April 5, 2026):
   - 5 days observation at Richfield
   - 3 workshops with 16 participants total
   - 11 one-on-one interviews

2. **Documented Actual Problems**:
   - 10 specific weaknesses with measured data
   - Example: 30-45 min application processing, 10% data entry errors, 1-2 hour queue waits

3. **Defined What System Must Do**:
   - 50 functional requirements from stakeholder input
   - 18 non-functional requirements from IT Manager
   - All with acceptance criteria from workshops/interviews

4. **Designed Data Structure**:
   - 10 entities based on Richfield's needs
   - Relationships mapped from current processes
   - Business rules from institutional policies

## The Evidence

- Observation data: 5 days, measurements taken
- Workshop artifacts: Journey maps, process flows, MoSCoW prioritization
- Interview notes: 11 interviews, direct quotes
- Requirements: All traced to stakeholder source

## What's Next

Phase 4 (System Design) will take these requirements and create:

- Actual database schema with data types
- System architecture design
- User interface mockups
- Security implementation plan

This analysis phase gave us solid foundation - we know what to build because we talked to people who'll actually use it.

---

**Document Status**: Analysis Phase Complete
**Next Phase**: System Design Phase (Due: June 8, 2026)
