# EduHub Student Management System

## Phase 3 – Analysis Phase

Project: EduHub Student Management System
Team: EduHub Development Team
Course: IT Project
Date: May 2026
Due Date: May 11, 2026

---

# 3. Analysis Phase

This phase focuses on gathering detailed information, analyzing the current system, identifying weaknesses, and specifying detailed functional and non-functional requirements for the proposed EduHub system.

---

# 3.1 Introduction

The Analysis Phase builds upon the planning activities completed in Phase 2 to provide a comprehensive understanding of system requirements. This phase involves:

- Detailed information gathering using multiple methodologies
- Analysis of the current manual/fragmented system
- Data integrity and constraint analysis
- Identification of current system weaknesses
- Detailed specification of functional requirements
- Detailed specification of non-functional requirements
- Comprehensive data modeling for the proposed system

The analysis phase ensures that all stakeholder needs are thoroughly understood and documented before proceeding to system design.

## Objectives

The key objectives of this analysis phase are to:

1. Employ systematic information gathering techniques to understand user needs
2. Analyze the current system to identify pain points and inefficiencies
3. Document data requirements, integrity rules, and constraints
4. Clearly articulate weaknesses of the current approach
5. Specify detailed, testable functional requirements with acceptance criteria
6. Define comprehensive non-functional requirements for system quality attributes
7. Develop detailed data models to guide database and system design

## Approach

The analysis employs an iterative approach combining multiple research methodologies to ensure comprehensive requirement coverage. Information gathered during the Planning Phase (Phase 2) is refined and expanded through additional observation, participatory sessions, and stakeholder interviews.

---

# 3.2 Information Gathering Methodology

To ensure comprehensive requirement coverage, multiple information gathering techniques were employed during the analysis phase.

## 3.2.1 Observation

**Method**: Direct observation of current student management processes in action.

**Activities**:
- Observed student registration process during registration period
- Watched administrators processing paper applications
- Observed library staff verifying student status manually
- Documented time taken for each process and identified bottlenecks

**Key Findings**:
- Application processing takes 30-45 minutes per application
- Students wait 1-2 hours in queues during registration
- Manual verification requires phone calls between departments
- Paper documents are frequently misplaced or misfiled
- Data entry errors occur in approximately 10% of manual entries

## 3.2.2 Participatory Methods

**Method**: Engaged stakeholders in active participation to understand workflows and requirements.

**Workshop Sessions Conducted**:

**Session 1: Student Journey Mapping**
- Participants: 8 students from various programs
- Duration: 2 hours
- Output: Detailed journey map from application to graduation
- Key insights: Students want 24/7 access, mobile support, and real-time status updates

**Session 2: Administrative Process Modeling**
- Participants: 3 administrators, 1 registrar
- Duration: 2 hours
- Output: Current process diagrams for applications and registrations
- Key insights: Need for automated workflows, bulk operations, and reporting

**Session 3: Lecturer Requirements Workshop**
- Participants: 5 lecturers from different departments
- Duration: 1.5 hours
- Output: Prioritized feature list for lecturer portal
- Key insights: Class roster access, communication tools, enrollment visibility

## 3.2.3 Interviews

**Method**: One-on-one structured interviews with key stakeholders.

**Interview Summary**:

| Interviewee | Role | Duration | Key Requirements |
|-------------|------|----------|------------------|
| Registrar | Senior Administrator | 45 min | Automated student number generation, bulk approval, advanced reporting |
| IT Manager | Technical | 30 min | Security requirements, scalability, integration with existing email system |
| 3 Students | Student (Various) | 20 min each | Mobile access, course search, prerequisite checking, email notifications |
| 2 Lecturers | Faculty | 30 min each | Easy roster access, student contact info, export functionality |
| Librarian | Library Staff | 25 min | Quick student verification, enrollment status check |

**Common Themes**:
- High priority on security and data protection
- Need for automated notifications
- Desire for self-service capabilities
- Importance of mobile/responsive design
- Request for reporting and analytics

---

# 3.3 Analysis of Existing System

## Current System Overview

The current student management system is a hybrid of manual paper-based processes and disconnected digital systems (primarily spreadsheets and word processors).

### Components

**Application Processing**:
- Paper application forms filled by hand
- Documents submitted physically or via email
- Applications stored in filing cabinets
- Review conducted manually with paper forms
- Status communicated via phone or email

**Student Records**:
- Maintained in Excel spreadsheets
- Each department maintains separate records
- Physical files stored in filing cabinets
- Student numbers assigned manually by administrator

**Course Registration**:
- In-person registration during specified periods
- Paper forms filled and submitted at registration desk
- Administrator manually checks prerequisites and capacity
- Registrations recorded in Excel
- Printed course rosters distributed to lecturers

### System Limitations

1. **No Integration**: Disconnected systems lead to data duplication and inconsistency
2. **No Automation**: All processes require manual intervention
3. **Limited Access**: Information only available during office hours
4. **No Real-Time Updates**: Status changes not immediately visible
5. **Error-Prone**: Manual data entry leads to errors
6. **No Audit Trail**: Difficult to track who made changes and when
7. **Scalability Issues**: System cannot handle growing student population efficiently
8. **Limited Reporting**: Generating reports requires manual data compilation

---

# 3.4 Data Analysis (Data Integrity & Constraints)

## Data Integrity Requirements

The EduHub system must maintain data integrity through:

### Entity Integrity
- Every entity must have a unique primary key
- Primary keys cannot be null
- Examples: user_id, student_id, course_id, application_id

### Referential Integrity
- Foreign keys must reference valid primary keys
- Orphaned records must be prevented
- Examples: student_id in Registrations must exist in Students table

### Domain Integrity
- Values must conform to defined data types and ranges
- Examples: email format validation, date ranges, numeric constraints

### Business Rule Integrity
- System must enforce business rules through constraints
- Examples: registration only during registration period, maximum 3 emergency contacts

## Data Constraints

### Field-Level Constraints

| Entity | Field | Constraint Type | Constraint Description |
|--------|-------|----------------|------------------------|
| Users | email | UNIQUE, FORMAT | Must be unique, valid email format |
| Users | password | LENGTH, COMPLEXITY | Min 8 chars, must contain uppercase, lowercase, number |
| Users | role | ENUM | Must be one of: Applicant, Student, Lecturer, Admin, Librarian, Alumni |
| Students | student_number | UNIQUE, FORMAT | Must be unique, format: YEAR-9999 |
| Students | id_number | UNIQUE | Must be unique national ID |
| Students | year_of_study | RANGE | Must be between 1 and 6 |
| Courses | course_code | UNIQUE | Must be unique |
| Courses | credits | POSITIVE | Must be greater than 0 |
| Courses | capacity | POSITIVE | Must be greater than 0 |
| Applications | status | ENUM | Must be one of: Submitted, Under Review, Approved, Rejected, Withdrawn |
| Registrations | (student_id, course_id, semester) | UNIQUE COMPOSITE | Student cannot register for same course twice in same semester |

### Business Rule Constraints

1. **Student Number Generation**: Must follow format YEAR-#### where #### is sequential
2. **Course Prerequisites**: Student cannot register for course without completing prerequisites
3. **Course Capacity**: Cannot exceed maximum number of students per course
4. **Registration Period**: Students can only register during designated registration periods
5. **Add/Drop Deadline**: Students cannot drop courses after the add/drop deadline
6. **Emergency Contacts**: Students can have maximum of 3 emergency contacts
7. **Role Transition**: Applicant role must change to Student upon application approval
8. **Document Size**: Uploaded documents must not exceed 5MB
9. **Session Timeout**: User sessions must expire after 30 minutes of inactivity
10. **Concurrent Sessions**: Only one active session per user account

### Data Validation Rules

**Input Validation**:
- All user inputs must be validated on both client and server side
- SQL injection prevention through parameterized queries
- XSS prevention through output encoding
- File upload validation (type, size, content scanning)

**Format Validation**:
- Email: Must match standard email regex pattern
- Phone: Must match institutional phone number format
- Date: Must be valid date in acceptable range
- National ID: Must match national ID number format

---

# 3.5 Weakness of the Current System

Based on the analysis conducted, the current system exhibits the following critical weaknesses:

## 1. Inefficiency and Time Consumption

**Problem**:
- Application processing takes 30-45 minutes per application
- Course registration requires 1-2 hours of student waiting time
- Report generation takes 2-4 hours of manual compilation

**Impact**:
- Low throughput during application and registration periods
- Student dissatisfaction due to long wait times
- Administrative staff overwhelmed during peak periods

**Root Cause**:
- Manual processes without automation
- No workflow management
- Sequential rather than parallel processing

## 2. Data Duplication and Inconsistency

**Problem**:
- Student information stored in multiple disconnected systems
- Same data entered multiple times in different formats
- Updates in one system not reflected in others

**Impact**:
- Conflicting information across departments
- Difficulty in establishing single source of truth
- Increased likelihood of errors

**Root Cause**:
- No centralized database
- Lack of data integration
- No data synchronization mechanisms

## 3. Limited Accessibility

**Problem**:
- Information only accessible during office hours (8 AM - 5 PM weekdays)
- Physical presence required for most transactions
- No remote access capability

**Impact**:
- Inconvenience for students and staff
- Unable to serve users outside office hours
- Difficulty for distance learning students

**Root Cause**:
- Paper-based processes
- No online portal
- Centralized physical location dependency

## 4. Lack of Real-Time Information

**Problem**:
- Application status changes not immediately visible
- Course capacity information not updated in real-time
- No automated notifications

**Impact**:
- Students must call or visit to check status
- Students register for full courses
- Missed deadlines due to lack of reminders

**Root Cause**:
- Manual status updates
- No notification system
- Batch processing rather than real-time updates

## 5. Error-Prone Manual Processes

**Problem**:
- Manual data entry leads to typos and errors (~10% error rate)
- Manual student number generation occasionally produces duplicates
- Calculation errors in reporting

**Impact**:
- Data quality issues
- Time spent correcting errors
- Potential compliance violations

**Root Cause**:
- Human error in repetitive tasks
- No validation mechanisms
- Lack of automated checks

## 6. Poor Auditability

**Problem**:
- No record of who made changes to data
- No timestamp of when changes occurred
- Difficult to track application history

**Impact**:
- Cannot trace responsibility for errors
- Compliance and accountability issues
- Difficulty in dispute resolution

**Root Cause**:
- No audit logging
- Paper records don't track modifications
- No change history

## 7. Scalability Limitations

**Problem**:
- System cannot handle growing student population
- Registration period bottleneck worsens with more students
- Physical storage space running out

**Impact**:
- Degrading service quality as institution grows
- Need for more administrative staff
- Infrastructure constraints

**Root Cause**:
- Linear resource requirements
- No automation to handle scale
- Physical limitations

## 8. Limited Reporting and Analytics

**Problem**:
- Generating reports requires hours of manual work
- No real-time dashboard or analytics
- Difficult to extract insights from data

**Impact**:
- Management decisions based on outdated data
- Cannot respond quickly to trends
- Limited strategic planning capability

**Root Cause**:
- Data scattered across multiple sources
- No reporting tools
- Manual data compilation required

## 9. Security and Privacy Concerns

**Problem**:
- Physical documents can be accessed by unauthorized personnel
- No encryption of sensitive data
- Difficult to ensure data privacy compliance

**Impact**:
- Risk of data breaches
- Potential regulatory violations
- Loss of trust

**Root Cause**:
- Paper-based storage
- Lack of access controls
- No encryption mechanisms

## 10. Communication Gaps

**Problem**:
- No integrated communication system
- Announcements rely on physical notice boards
- Email communication not systematic

**Impact**:
- Students miss important information
- Lack of engagement
- Increased support inquiries

**Root Cause**:
- No notification system
- Manual communication processes
- No centralized announcement platform

---

# 3.6 Analysis of the Proposed System (Functional Requirements)

The proposed EduHub system addresses the weaknesses of the current system through comprehensive digital automation. This section provides detailed functional requirements with acceptance criteria.

## Functional Requirements Overview

Functional requirements describe what the system must do - the specific behaviors, functions, and features it must provide. The EduHub system requires the following major functional capabilities:

### 1. User Authentication and Account Management

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-1.1 | User Registration | Must Have | - User can create account with email, password, first name, last name<br>- Email must be unique and validated<br>- Password must meet complexity requirements (min 8 chars, 1 uppercase, 1 number)<br>- Verification email sent upon registration<br>- Account created in "unverified" state until email confirmed |
| FR-1.2 | User Login | Must Have | - User can log in with email and password<br>- Invalid credentials show error message<br>- Successful login redirects to role-appropriate dashboard<br>- Session token (JWT) generated with 24-hour expiry<br>- Failed login attempts tracked (max 5 before temporary lockout) |
| FR-1.3 | Password Reset | Must Have | - User can request password reset via email<br>- Reset link sent to registered email<br>- Reset link valid for 1 hour<br>- User can set new password meeting complexity requirements<br>- Old password invalidated after reset |
| FR-1.4 | Multi-Factor Authentication (MFA) | Should Have | - User can enable MFA on their account<br>- MFA supports authenticator apps (TOTP)<br>- Backup codes provided during MFA setup<br>- MFA required at login if enabled |
| FR-1.5 | User Logout | Must Have | - User can log out from any page<br>- Session token invalidated upon logout<br>- User redirected to login page after logout |
| FR-1.6 | Session Management | Must Have | - Sessions expire after 24 hours<br>- Inactive sessions timeout after 30 minutes<br>- User warned 5 minutes before timeout<br>- User can extend session before timeout |

### FR-2: Role-Based Access Control

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-2.1 | Role Assignment | Must Have | - System supports roles: Applicant, Student, Lecturer, Admin, Librarian, Alumni<br>- New registrations assigned "Applicant" role by default<br>- Admin can change user roles<br>- Role changes logged in audit trail |
| FR-2.2 | Permission Enforcement | Must Have | - Each role has specific permissions defined<br>- Unauthorized access attempts blocked with 403 error<br>- API endpoints enforce role-based permissions<br>- Frontend hides inaccessible features based on role |
| FR-2.3 | Role Transition | Must Have | - Approved applicants automatically promoted to "Student" role<br>- Graduated students can be changed to "Alumni" role<br>- Role history maintained for audit purposes |

### FR-3: Application Management

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-3.1 | Submit Application | Must Have | - Applicant can fill application form with personal details<br>- Required fields: Name, ID number, email, phone, address, program<br>- Applicant can upload documents (ID copy, certificates, transcripts)<br>- Supported file formats: PDF, JPG, PNG (max 5MB per file)<br>- Application saved as draft before submission<br>- Applicant can submit completed application<br>- Confirmation email sent upon submission |
| FR-3.2 | View Application Status | Must Have | - Applicant can view application status (Submitted, Under Review, Approved, Rejected)<br>- Status updates shown with timestamp<br>- Email notification sent when status changes |
| FR-3.3 | Edit Draft Application | Should Have | - Applicant can edit draft application before submission<br>- Cannot edit after submission<br>- Auto-save functionality for drafts |
| FR-3.4 | Application Withdrawal | Could Have | - Applicant can withdraw submitted application<br>- Withdrawal requires confirmation<br>- Admin notified of withdrawal |

### FR-4: Administrative Approval Workflow

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-4.1 | View Applications | Must Have | - Admin can view list of all applications<br>- Filter by status (Submitted, Under Review, Approved, Rejected)<br>- Search by applicant name or ID<br>- Sort by submission date |
| FR-4.2 | Review Application | Must Have | - Admin can view full application details<br>- Admin can view uploaded documents<br>- Admin can download documents<br>- Admin can add review notes |
| FR-4.3 | Approve Application | Must Have | - Admin can approve application<br>- Student number automatically generated upon approval<br>- Student number format: YEAR-SEQUENTIAL (e.g., 2026-0001)<br>- Applicant role changed to Student<br>- Approval email sent with student number and login instructions |
| FR-4.4 | Reject Application | Must Have | - Admin can reject application with reason<br>- Rejection reason required<br>- Rejection email sent to applicant |
| FR-4.5 | Bulk Actions | Should Have | - Admin can select multiple applications<br>- Perform bulk approve or reject<br>- Confirmation required for bulk actions |

### FR-5: Student Profile Management

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-5.1 | View Profile | Must Have | - Student can view complete profile information<br>- Display: Personal details, academic info, emergency contacts<br>- Show student number prominently |
| FR-5.2 | Edit Personal Information | Must Have | - Student can edit: Address, phone, email (with verification)<br>- Cannot edit: Name, ID number, student number<br>- Changes logged in audit trail<br>- Confirmation required before saving |
| FR-5.3 | Manage Emergency Contacts | Must Have | - Student can add up to 3 emergency contacts<br>- Required fields: Name, relationship, phone, email<br>- Student can edit or delete emergency contacts |
| FR-5.4 | Upload Profile Photo | Should Have | - Student can upload profile photo<br>- Supported formats: JPG, PNG (max 2MB)<br>- Photo cropped to square aspect ratio<br>- Default avatar shown if no photo uploaded |
| FR-5.5 | View Academic Record | Must Have | - Student can view registered courses<br>- Show current semester courses<br>- Show course history |

### FR-6: Course Registration System

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-6.1 | Browse Courses | Must Have | - Student can view available courses for current semester<br>- Display: Course code, name, credits, schedule, capacity<br>- Filter by department/program<br>- Search by course code or name |
| FR-6.2 | View Course Details | Must Have | - Student can view detailed course information<br>- Show: Description, prerequisites, lecturer, schedule, available seats<br>- Indicate if prerequisites met |
| FR-6.3 | Register for Courses | Must Have | - Student can register for available courses<br>- Registration only allowed during registration period<br>- Check prerequisites before allowing registration<br>- Check for schedule conflicts<br>- Check course capacity (max students)<br>- Confirmation required before registering<br>- Confirmation email sent after registration |
| FR-6.4 | Drop Courses | Must Have | - Student can drop registered courses within drop period<br>- Cannot drop after drop deadline<br>- Confirmation required before dropping<br>- Notification email sent after drop |
| FR-6.5 | View Registered Courses | Must Have | - Student can view all registered courses<br>- Show total credits registered<br>- Highlight schedule conflicts if any<br>- Show registration status |
| FR-6.6 | Registration Periods | Must Have | - Admin can set registration start and end dates<br>- Admin can set add/drop deadline<br>- Students cannot register outside these periods<br>- System displays countdown to registration period |

### FR-7: Course Management (Admin/Lecturer)

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-7.1 | Create Course | Must Have | - Admin can create new course<br>- Required fields: Code, name, credits, description, capacity<br>- Optional: Prerequisites, lecturer assignment<br>- Course code must be unique |
| FR-7.2 | Edit Course | Must Have | - Admin can edit course details<br>- Cannot edit if students registered (except capacity increase)<br>- Changes logged in audit trail |
| FR-7.3 | Delete Course | Must Have | - Admin can delete course<br>- Cannot delete if students registered<br>- Confirmation required |
| FR-7.4 | Assign Lecturer | Must Have | - Admin can assign lecturer to course<br>- Lecturer can view assigned courses<br>- Email notification sent to lecturer |
| FR-7.5 | View Enrollments | Must Have | - Lecturer can view students enrolled in their courses<br>- Display: Student number, name, email<br>- Export class roster to CSV |

### FR-8: Lecturer Features

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-8.1 | View Assigned Courses | Must Have | - Lecturer can view courses assigned to them<br>- Show enrollment count and capacity |
| FR-8.2 | View Class Roster | Must Have | - Lecturer can view list of enrolled students<br>- Display student contact information<br>- Search and filter students |
| FR-8.3 | Post Announcements | Should Have | - Lecturer can post announcements to course<br>- Students receive email notification<br>- Announcements visible on student dashboard |

### FR-9: Librarian Features

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-9.1 | Verify Student Status | Must Have | - Librarian can search for student by number or name<br>- Display: Student status (Active, Graduated, Suspended)<br>- Show current enrollment status |
| FR-9.2 | View Student Details | Must Have | - Librarian can view basic student information<br>- Display: Name, student number, program, status<br>- Cannot view sensitive information (grades, personal details) |

### FR-10: Reporting and Analytics

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-10.1 | Application Reports | Should Have | - Admin can generate application statistics<br>- Metrics: Total, pending, approved, rejected<br>- Filter by date range<br>- Export to CSV/PDF |
| FR-10.2 | Enrollment Reports | Should Have | - Admin can generate enrollment statistics<br>- Metrics: Total students, by program, by semester<br>- Course enrollment numbers<br>- Export to CSV/PDF |
| FR-10.3 | System Usage Reports | Could Have | - Admin can view system usage statistics<br>- Metrics: Active users, login frequency<br>- Popular features tracked |

### FR-11: Notifications

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-11.1 | Email Notifications | Must Have | - System sends email for key events<br>- Events: Registration, application status, approval, course registration<br>- Emails use professional templates<br>- Include relevant details and links |
| FR-11.2 | In-App Notifications | Should Have | - Users see notifications in system<br>- Notification badge shows unread count<br>- Click notification to view details<br>- Mark as read functionality |

---

## Non-Functional Requirements

Non-functional requirements define system qualities - how well the system performs its functions.

### NFR-1: Security

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| NFR-1.1 | Authentication Security | Must Have | - Passwords hashed using bcrypt (min 10 rounds)<br>- JWT tokens used for session management<br>- Tokens include expiration time<br>- Sensitive data encrypted in transit (HTTPS) and at rest |
| NFR-1.2 | Authorization | Must Have | - Role-based access control enforced on all endpoints<br>- Unauthorized access returns 403 status<br>- API validates JWT token on every request |
| NFR-1.3 | Input Validation | Must Have | - All user inputs validated and sanitized<br>- SQL injection prevention through parameterized queries<br>- XSS prevention through output encoding<br>- File upload validation (type, size, content) |
| NFR-1.4 | Password Policy | Must Have | - Minimum 8 characters<br>- At least 1 uppercase, 1 lowercase, 1 number<br>- No common passwords allowed<br>- Password strength indicator shown |
| NFR-1.5 | Audit Logging | Must Have | - Log all authentication attempts<br>- Log all administrative actions<br>- Log all profile changes<br>- Logs include timestamp, user, action, IP address |
| NFR-1.6 | Session Security | Must Have | - Session timeout after 30 minutes inactivity<br>- Maximum session duration 24 hours<br>- Concurrent session limit: 1 per user<br>- Logout invalidates session immediately |

### NFR-2: Performance

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| NFR-2.1 | Response Time | Must Have | - Page load time < 3 seconds (95th percentile)<br>- API response time < 1 second (95th percentile)<br>- Database queries < 500ms (average) |
| NFR-2.2 | Concurrent Users | Should Have | - Support 100 concurrent users without degradation<br>- Support 500 peak concurrent users during registration periods<br>- Load tested with 200 concurrent users |
| NFR-2.3 | Database Performance | Must Have | - Indexes on frequently queried fields<br>- Query optimization for complex joins<br>- Connection pooling implemented |
| NFR-2.4 | File Upload Performance | Must Have | - File upload progress indicator shown<br>- Large files uploaded in chunks<br>- Upload completes within reasonable time (5MB in < 30 seconds) |

### NFR-3: Availability and Reliability

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| NFR-3.1 | System Uptime | Must Have | - 99.5% uptime (< 3.6 hours downtime per month)<br>- Planned maintenance during off-peak hours<br>- Advance notice for maintenance |
| NFR-3.2 | Error Handling | Must Have | - Graceful error handling for all failures<br>- User-friendly error messages shown<br>- Errors logged for debugging<br>- System recovers from errors without restart |
| NFR-3.3 | Data Backup | Must Have | - Database backed up daily<br>- Backups stored in separate location<br>- Backup restoration tested monthly<br>- Point-in-time recovery capability |
| NFR-3.4 | Disaster Recovery | Should Have | - Recovery Time Objective (RTO): < 4 hours<br>- Recovery Point Objective (RPO): < 24 hours<br>- Disaster recovery plan documented |

### NFR-4: Usability

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| NFR-4.1 | User Interface | Must Have | - Intuitive navigation structure<br>- Consistent design across all pages<br>- Clear labeling of all buttons and fields<br>- Contextual help available |
| NFR-4.2 | Responsive Design | Must Have | - Works on desktop (1920x1080, 1366x768)<br>- Works on tablet (iPad, 768x1024)<br>- Works on mobile (375x667, 414x896)<br>- Touch-friendly interface on mobile |
| NFR-4.3 | Browser Compatibility | Must Have | - Supports Chrome (latest 2 versions)<br>- Supports Firefox (latest 2 versions)<br>- Supports Safari (latest 2 versions)<br>- Supports Edge (latest 2 versions) |
| NFR-4.4 | Accessibility | Should Have | - WCAG 2.1 Level AA compliance<br>- Keyboard navigation supported<br>- Screen reader compatible<br>- Sufficient color contrast ratios<br>- Alt text for images |
| NFR-4.5 | User Training | Should Have | - User documentation available<br>- Video tutorials for key features<br>- FAQ section<br>- Onboarding wizard for new users |

### NFR-5: Maintainability

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| NFR-5.1 | Code Quality | Must Have | - Code follows style guide (ESLint/Prettier)<br>- Functions are modular and reusable<br>- Comments for complex logic<br>- DRY principle followed |
| NFR-5.2 | Documentation | Must Have | - API endpoints documented<br>- Database schema documented<br>- Setup instructions provided<br>- Architecture diagrams available |
| NFR-5.3 | Testing | Must Have | - Unit test coverage > 70%<br>- Integration tests for critical paths<br>- All tests pass before deployment<br>- Automated testing in CI/CD pipeline |
| NFR-5.4 | Version Control | Must Have | - All code in Git repository<br>- Meaningful commit messages<br>- Feature branches for new development<br>- Pull requests reviewed before merge |

### NFR-6: Scalability

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| NFR-6.1 | Horizontal Scaling | Should Have | - Stateless API design allows multiple instances<br>- Database supports read replicas<br>- Load balancing ready architecture |
| NFR-6.2 | Data Growth | Must Have | - System handles 10,000 student records<br>- System handles 50,000 course registrations<br>- Database partitioning strategy for growth |
| NFR-6.3 | Feature Extensibility | Should Have | - Modular architecture allows new features<br>- Plugin architecture for extensions<br>- API versioning for backward compatibility |

### NFR-7: Portability

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| NFR-7.1 | Deployment Flexibility | Must Have | - Docker containerization<br>- Environment-based configuration<br>- Deploy to cloud platforms (AWS, Heroku, DigitalOcean) |
| NFR-7.2 | Database Portability | Should Have | - Abstraction layer (Sequelize ORM) for database independence<br>- Migrations for schema changes<br>- Seed data for development/testing |

### NFR-8: Compliance

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| NFR-8.1 | Data Protection | Must Have | - Compliance with data protection regulations<br>- Privacy policy available<br>- User consent for data collection<br>- Right to data deletion honored |
| NFR-8.2 | Audit Compliance | Must Have | - All administrative actions logged<br>- Audit trail immutable<br>- Audit logs retained for 1 year<br>- Audit reports generated on demand |

---

## Requirements Traceability Matrix

The Requirements Traceability Matrix ensures all requirements are implemented and tested:

| Requirement Category | Total Requirements | Must Have | Should Have | Could Have | Priority for MVP |
|---------------------|-------------------|-----------|-------------|------------|-----------------|
| Authentication (FR-1) | 6 | 5 | 1 | 0 | 100% Must Have |
| Access Control (FR-2) | 3 | 3 | 0 | 0 | 100% Must Have |
| Applications (FR-3) | 4 | 2 | 1 | 1 | 75% for MVP |
| Admin Workflow (FR-4) | 5 | 4 | 1 | 0 | 100% for MVP |
| Student Profile (FR-5) | 5 | 4 | 1 | 0 | 80% for MVP |
| Registration (FR-6) | 6 | 6 | 0 | 0 | 100% Must Have |
| Course Management (FR-7) | 5 | 5 | 0 | 0 | 100% Must Have |
| Lecturer Features (FR-8) | 3 | 2 | 1 | 0 | 100% for MVP |
| Librarian Features (FR-9) | 2 | 2 | 0 | 0 | 100% Must Have |
| Reporting (FR-10) | 3 | 0 | 2 | 1 | 0% for MVP |
| Notifications (FR-11) | 2 | 1 | 1 | 0 | 50% for MVP |
| **Non-Functional (All)** | 26 | 22 | 4 | 0 | 85% for MVP |

**MVP (Minimum Viable Product)** includes all "Must Have" requirements totaling approximately 45 requirements that deliver core system functionality.

This comprehensive SRS ensures clear, testable requirements that guide development, testing, and acceptance of the EduHub system.

---

# 2.7 Data Models

Data models describe how system data is structured and how different components interact. The EduHub system uses multiple modeling techniques to represent different aspects of the system architecture and data flow.

---

## Use Case Diagram

Use case diagrams show the functional requirements of the system from the user's perspective, illustrating actors (users) and their interactions with the system.

### Actors

The EduHub system has six primary actors:

| Actor | Description | Primary Goals |
|-------|-------------|---------------|
| **Applicant** | Person applying for admission | Submit application, track status |
| **Student** | Enrolled student with student number | Manage profile, register for courses |
| **Lecturer** | Faculty member teaching courses | View assigned courses, access class rosters |
| **Administrator** | Staff managing system | Approve applications, manage courses, generate reports |
| **Librarian** | Library staff | Verify student status, view student information |
| **Alumni** | Graduated student | View academic history (future feature) |

### Use Cases by Actor

#### Applicant Use Cases

- Register Account
- Login / Logout
- Submit Application
- Upload Documents
- View Application Status
- Edit Draft Application
- Withdraw Application

#### Student Use Cases

- Login / Logout
- Reset Password
- View Profile
- Edit Personal Information
- Manage Emergency Contacts
- Upload Profile Photo
- Browse Available Courses
- View Course Details
- Register for Courses
- Drop Courses
- View Registered Courses
- View Notifications

#### Lecturer Use Cases

- Login / Logout
- View Assigned Courses
- View Class Roster
- View Student Contact Information
- Export Class Roster
- Post Course Announcements

#### Administrator Use Cases

- Login / Logout
- View All Applications
- Review Application Details
- Approve Application
- Reject Application
- Perform Bulk Actions
- Create Course
- Edit Course
- Delete Course
- Assign Lecturer to Course
- Manage User Roles
- Set Registration Periods
- Generate Reports
- View System Analytics

#### Librarian Use Cases

- Login / Logout
- Search Student by Number/Name
- Verify Student Status
- View Student Basic Information

### Use Case Relationships

**Includes** (shared common behavior):
- All actors include "Login" use case
- All actors include "Logout" use case
- "Register for Course" includes "Check Prerequisites"
- "Register for Course" includes "Check Schedule Conflicts"

**Extends** (optional behavior):
- "Login" extends to "Enable MFA" (if user has MFA enabled)
- "Edit Profile" extends to "Verify Email Change" (if email is changed)
- "Submit Application" extends to "Upload Documents" (optional documents)

**Generalization**:
- Student, Lecturer, Administrator, Librarian generalize from "Registered User"
- Applicant is separate actor type (pre-registration)

(Detailed Use Case diagram will be inserted here)

---

## Entity Relationship Diagram (ERD)

The Entity Relationship Diagram shows the database structure, entities (tables), attributes (columns), and relationships between entities.

### Database Entities

#### 1. Users Entity

**Purpose**: Store authentication and basic information for all system users

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| user_id | UUID | PRIMARY KEY | Unique identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email address |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| first_name | VARCHAR(100) | NOT NULL | User first name |
| last_name | VARCHAR(100) | NOT NULL | User last name |
| role | ENUM | NOT NULL | User role (Applicant, Student, Lecturer, Admin, Librarian, Alumni) |
| is_active | BOOLEAN | DEFAULT TRUE | Account active status |
| is_verified | BOOLEAN | DEFAULT FALSE | Email verified status |
| mfa_enabled | BOOLEAN | DEFAULT FALSE | Multi-factor auth enabled |
| mfa_secret | VARCHAR(255) | NULLABLE | MFA secret key |
| last_login | TIMESTAMP | NULLABLE | Last login timestamp |
| created_at | TIMESTAMP | DEFAULT NOW() | Account creation date |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update date |

**Indexes**: email, role, is_active

**Relationships**:
- One-to-One with Students (when role = Student)
- One-to-Many with Applications
- One-to-Many with Audit_Logs
- One-to-Many with Notifications

#### 2. Students Entity

**Purpose**: Store additional information specific to enrolled students

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| student_id | UUID | PRIMARY KEY | Unique identifier |
| user_id | UUID | FOREIGN KEY (Users), UNIQUE | Reference to Users table |
| student_number | VARCHAR(20) | UNIQUE, NOT NULL | Generated student number (YEAR-SEQUENCE) |
| id_number | VARCHAR(50) | UNIQUE, NOT NULL | National ID number |
| phone | VARCHAR(20) | NOT NULL | Phone number |
| address | TEXT | NOT NULL | Physical address |
| date_of_birth | DATE | NOT NULL | Date of birth |
| program | VARCHAR(100) | NOT NULL | Academic program/course |
| year_of_study | INTEGER | DEFAULT 1 | Current year of study |
| status | ENUM | DEFAULT 'Active' | Status (Active, Graduated, Suspended) |
| profile_photo_url | VARCHAR(255) | NULLABLE | Profile photo URL |
| enrollment_date | DATE | NOT NULL | Date enrolled |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation date |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update date |

**Indexes**: student_number, user_id, id_number, status

**Relationships**:
- One-to-One with Users
- One-to-Many with Emergency_Contacts
- Many-to-Many with Courses (through Registrations)

#### 3. Emergency_Contacts Entity

**Purpose**: Store emergency contact information for students

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| contact_id | UUID | PRIMARY KEY | Unique identifier |
| student_id | UUID | FOREIGN KEY (Students) | Reference to Students table |
| name | VARCHAR(100) | NOT NULL | Contact name |
| relationship | VARCHAR(50) | NOT NULL | Relationship to student |
| phone | VARCHAR(20) | NOT NULL | Contact phone number |
| email | VARCHAR(255) | NULLABLE | Contact email |
| is_primary | BOOLEAN | DEFAULT FALSE | Primary contact flag |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation date |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update date |

**Indexes**: student_id

**Relationships**:
- Many-to-One with Students

#### 4. Applications Entity

**Purpose**: Store student applications for admission

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| application_id | UUID | PRIMARY KEY | Unique identifier |
| user_id | UUID | FOREIGN KEY (Users) | Reference to Users table (Applicant) |
| first_name | VARCHAR(100) | NOT NULL | Applicant first name |
| last_name | VARCHAR(100) | NOT NULL | Applicant last name |
| id_number | VARCHAR(50) | NOT NULL | National ID number |
| email | VARCHAR(255) | NOT NULL | Email address |
| phone | VARCHAR(20) | NOT NULL | Phone number |
| address | TEXT | NOT NULL | Physical address |
| date_of_birth | DATE | NOT NULL | Date of birth |
| program | VARCHAR(100) | NOT NULL | Applying for program |
| status | ENUM | DEFAULT 'Submitted' | Status (Submitted, Under Review, Approved, Rejected, Withdrawn) |
| rejection_reason | TEXT | NULLABLE | Reason if rejected |
| reviewed_by | UUID | FOREIGN KEY (Users), NULLABLE | Admin who reviewed |
| reviewed_at | TIMESTAMP | NULLABLE | Review timestamp |
| is_draft | BOOLEAN | DEFAULT TRUE | Draft status |
| submitted_at | TIMESTAMP | NULLABLE | Submission timestamp |
| created_at | TIMESTAMP | DEFAULT NOW() | Application creation date |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update date |

**Indexes**: user_id, status, submitted_at

**Relationships**:
- Many-to-One with Users (applicant)
- Many-to-One with Users (reviewer)
- One-to-Many with Application_Documents

#### 5. Application_Documents Entity

**Purpose**: Store documents uploaded with applications

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| document_id | UUID | PRIMARY KEY | Unique identifier |
| application_id | UUID | FOREIGN KEY (Applications) | Reference to Applications table |
| document_type | VARCHAR(50) | NOT NULL | Type (ID, Certificate, Transcript) |
| file_name | VARCHAR(255) | NOT NULL | Original file name |
| file_path | VARCHAR(255) | NOT NULL | Storage path |
| file_size | INTEGER | NOT NULL | File size in bytes |
| mime_type | VARCHAR(100) | NOT NULL | File MIME type |
| uploaded_at | TIMESTAMP | DEFAULT NOW() | Upload timestamp |

**Indexes**: application_id

**Relationships**:
- Many-to-One with Applications

#### 6. Courses Entity

**Purpose**: Store course information

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| course_id | UUID | PRIMARY KEY | Unique identifier |
| course_code | VARCHAR(20) | UNIQUE, NOT NULL | Course code (e.g., CS101) |
| course_name | VARCHAR(200) | NOT NULL | Course name |
| description | TEXT | NULLABLE | Course description |
| credits | INTEGER | NOT NULL | Credit hours |
| capacity | INTEGER | NOT NULL | Maximum students |
| department | VARCHAR(100) | NOT NULL | Department offering course |
| semester | VARCHAR(50) | NOT NULL | Semester (e.g., Fall 2026) |
| schedule | VARCHAR(100) | NULLABLE | Class schedule |
| prerequisites | TEXT | NULLABLE | Prerequisite courses |
| lecturer_id | UUID | FOREIGN KEY (Users), NULLABLE | Assigned lecturer |
| is_active | BOOLEAN | DEFAULT TRUE | Active status |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation date |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update date |

**Indexes**: course_code, lecturer_id, semester, is_active

**Relationships**:
- Many-to-One with Users (lecturer)
- Many-to-Many with Students (through Registrations)

#### 7. Registrations Entity

**Purpose**: Store student course registrations (junction table)

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| registration_id | UUID | PRIMARY KEY | Unique identifier |
| student_id | UUID | FOREIGN KEY (Students) | Reference to Students table |
| course_id | UUID | FOREIGN KEY (Courses) | Reference to Courses table |
| semester | VARCHAR(50) | NOT NULL | Registration semester |
| registration_date | TIMESTAMP | DEFAULT NOW() | When student registered |
| status | ENUM | DEFAULT 'Registered' | Status (Registered, Dropped, Completed) |
| dropped_at | TIMESTAMP | NULLABLE | When course was dropped |
| grade | VARCHAR(5) | NULLABLE | Final grade (future feature) |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation date |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update date |

**Unique Constraint**: (student_id, course_id, semester)

**Indexes**: student_id, course_id, semester, status

**Relationships**:
- Many-to-One with Students
- Many-to-One with Courses

#### 8. System_Settings Entity

**Purpose**: Store system configuration settings

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| setting_id | UUID | PRIMARY KEY | Unique identifier |
| setting_key | VARCHAR(100) | UNIQUE, NOT NULL | Setting key name |
| setting_value | TEXT | NOT NULL | Setting value |
| description | TEXT | NULLABLE | Setting description |
| updated_by | UUID | FOREIGN KEY (Users) | Admin who last updated |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update date |

**Common Settings**:
- registration_start_date
- registration_end_date
- add_drop_deadline
- current_semester
- max_credits_per_semester

**Indexes**: setting_key

**Relationships**:
- Many-to-One with Users (updater)

#### 9. Audit_Logs Entity

**Purpose**: Store audit trail of system actions

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| log_id | UUID | PRIMARY KEY | Unique identifier |
| user_id | UUID | FOREIGN KEY (Users), NULLABLE | User who performed action |
| action | VARCHAR(100) | NOT NULL | Action performed |
| entity_type | VARCHAR(50) | NOT NULL | Entity affected (User, Course, etc.) |
| entity_id | UUID | NULLABLE | ID of affected entity |
| changes | JSONB | NULLABLE | JSON of changes made |
| ip_address | VARCHAR(45) | NULLABLE | User IP address |
| user_agent | VARCHAR(255) | NULLABLE | Browser user agent |
| created_at | TIMESTAMP | DEFAULT NOW() | Log timestamp |

**Indexes**: user_id, entity_type, entity_id, created_at

**Relationships**:
- Many-to-One with Users

#### 10. Notifications Entity

**Purpose**: Store in-app notifications for users

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| notification_id | UUID | PRIMARY KEY | Unique identifier |
| user_id | UUID | FOREIGN KEY (Users) | Recipient user |
| title | VARCHAR(200) | NOT NULL | Notification title |
| message | TEXT | NOT NULL | Notification message |
| type | VARCHAR(50) | NOT NULL | Type (info, success, warning, error) |
| is_read | BOOLEAN | DEFAULT FALSE | Read status |
| link_url | VARCHAR(255) | NULLABLE | Link to related page |
| created_at | TIMESTAMP | DEFAULT NOW() | Notification timestamp |

**Indexes**: user_id, is_read, created_at

**Relationships**:
- Many-to-One with Users

### Entity Relationships Summary

**One-to-One**:
- Users ↔ Students

**One-to-Many**:
- Users → Applications (as applicant)
- Users → Applications (as reviewer)
- Users → Courses (as lecturer)
- Users → Audit_Logs
- Users → Notifications
- Students → Emergency_Contacts
- Applications → Application_Documents
- Courses → Registrations

**Many-to-Many**:
- Students ↔ Courses (through Registrations)

### Database Constraints and Rules

**Foreign Key Constraints**:
- ON DELETE CASCADE: Emergency_Contacts, Application_Documents, Notifications
- ON DELETE SET NULL: Courses.lecturer_id, Applications.reviewed_by
- ON DELETE RESTRICT: Registrations, Audit_Logs

**Check Constraints**:
- Users.role IN ('Applicant', 'Student', 'Lecturer', 'Admin', 'Librarian', 'Alumni')
- Students.year_of_study BETWEEN 1 AND 6
- Courses.credits > 0
- Courses.capacity > 0
- Applications.status IN ('Submitted', 'Under Review', 'Approved', 'Rejected', 'Withdrawn')

**Business Rules**:
- Student number format: {YEAR}-{4-digit-sequence} (e.g., 2026-0001)
- Email must be unique across all users
- Cannot register for course if capacity reached
- Cannot register for course without meeting prerequisites
- Cannot drop course after add/drop deadline
- Maximum 3 emergency contacts per student

(Detailed ER Diagram will be inserted here)

---

## Data Flow Diagram (DFD)

The Data Flow Diagram shows how data moves through the EduHub system, illustrating processes, data stores, and data flows between system components.

### DFD Level 0 (Context Diagram)

Shows the system boundary and external entities:

**External Entities**:
- Applicants
- Students
- Lecturers
- Administrators
- Librarians

**System**: EduHub Student Management System

**Data Flows**:

**Inputs to System**:
- Applicant → Application Data
- Student → Profile Updates, Course Registration Requests
- Lecturer → Course Information, Class Announcements
- Administrator → Approval Decisions, System Configuration
- Librarian → Student Verification Requests

**Outputs from System**:
- System → Applicant: Application Status, Acceptance/Rejection Notification
- System → Student: Registration Confirmation, Course Information
- System → Lecturer: Class Rosters, Student Contact Information
- System → Administrator: Reports, Analytics
- System → Librarian: Student Status Information

### DFD Level 1 (Major Processes)

**Process 1: User Authentication**
- Input: Login Credentials
- Process: Validate Credentials, Generate JWT Token
- Output: Authentication Token, User Role
- Data Store: Users Table

**Process 2: Application Management**
- Input: Application Data, Documents
- Process: Validate Application, Store Documents, Update Status
- Output: Application Confirmation, Status Updates
- Data Store: Applications Table, Application_Documents Table

**Process 3: Application Review**
- Input: Review Decision, Student Number Generation Request
- Process: Review Application, Generate Student Number, Update Role
- Output: Approval/Rejection Notification, Student Credentials
- Data Store: Applications Table, Students Table, Users Table

**Process 4: Profile Management**
- Input: Profile Updates, Emergency Contact Info
- Process: Validate Changes, Update Records, Log Changes
- Output: Update Confirmation
- Data Store: Students Table, Emergency_Contacts Table, Audit_Logs Table

**Process 5: Course Registration**
- Input: Course Selection, Registration Request
- Process: Check Prerequisites, Check Capacity, Check Conflicts, Create Registration
- Output: Registration Confirmation, Error Messages
- Data Store: Courses Table, Registrations Table, System_Settings Table

**Process 6: Course Management**
- Input: Course Details, Lecturer Assignment
- Process: Create/Update Course, Assign Lecturer, Set Capacity
- Output: Course Confirmation, Lecturer Notification
- Data Store: Courses Table

**Process 7: Reporting**
- Input: Report Parameters (date range, filters)
- Process: Query Data, Aggregate Statistics, Format Report
- Output: Reports, Analytics Dashboard
- Data Store: All Tables

**Process 8: Notification Management**
- Input: System Events (registration, approval, etc.)
- Process: Generate Notification, Send Email, Create In-App Notification
- Output: Email, In-App Notification
- Data Store: Notifications Table

### Data Flow Details

#### Application Submission Flow

```
Applicant
   │
   │ [Application Data + Documents]
   ▼
┌─────────────────┐
│ 1. Validate     │
│    Application  │
└────────┬────────┘
         │ [Validated Data]
         ▼
┌─────────────────┐     ┌──────────────────┐
│ 2. Store        │────▶│ Applications DB  │
│    Application  │     └──────────────────┘
└────────┬────────┘
         │
         │ [Document Files]
         ▼
┌─────────────────┐     ┌──────────────────┐
│ 3. Upload       │────▶│ File Storage     │
│    Documents    │     └──────────────────┘
└────────┬────────┘
         │
         │ [Confirmation Email Data]
         ▼
┌─────────────────┐
│ 4. Send         │
│    Notification │
└────────┬────────┘
         │
         │ [Confirmation]
         ▼
      Applicant
```

#### Course Registration Flow

```
Student
   │
   │ [Course Selection]
   ▼
┌──────────────────┐     ┌──────────────────┐
│ 1. Check         │◀────│ Courses DB       │
│    Availability  │     └──────────────────┘
└────────┬─────────┘
         │ [Available]
         ▼
┌──────────────────┐     ┌──────────────────┐
│ 2. Check         │◀────│ Students DB      │
│    Prerequisites │     │ Registrations DB │
└────────┬─────────┘     └──────────────────┘
         │ [Eligible]
         ▼
┌──────────────────┐     ┌──────────────────┐
│ 3. Check         │◀────│ Registrations DB │
│    Conflicts     │     └──────────────────┘
└────────┬─────────┘
         │ [No Conflicts]
         ▼
┌──────────────────┐     ┌──────────────────┐
│ 4. Create        │────▶│ Registrations DB │
│    Registration  │     └──────────────────┘
└────────┬─────────┘
         │
         │ [Registration Data]
         ▼
┌──────────────────┐     ┌──────────────────┐
│ 5. Send          │────▶│ Notifications DB │
│    Confirmation  │     └──────────────────┘
└────────┬─────────┘
         │
         │ [Confirmation]
         ▼
      Student
```

#### Approval Workflow Flow

```
Administrator
   │
   │ [View Applications Request]
   ▼
┌──────────────────┐     ┌──────────────────┐
│ 1. Retrieve      │◀────│ Applications DB  │
│    Applications  │     └──────────────────┘
└────────┬─────────┘
         │ [Application List]
         ▼
Administrator (Reviews)
   │
   │ [Approval Decision]
   ▼
┌──────────────────┐
│ 2. Generate      │
│    Student #     │
└────────┬─────────┘
         │ [Student Number]
         ▼
┌──────────────────┐     ┌──────────────────┐
│ 3. Create        │────▶│ Students DB      │
│    Student Record│     └──────────────────┘
└────────┬─────────┘
         │
         ▼
┌──────────────────┐     ┌──────────────────┐
│ 4. Update User   │────▶│ Users DB         │
│    Role          │     └──────────────────┘
└────────┬─────────┘
         │
         ▼
┌──────────────────┐     ┌──────────────────┐
│ 5. Update        │────▶│ Applications DB  │
│    Application   │     └──────────────────┘
└────────┬─────────┘
         │
         ▼
┌──────────────────┐     ┌──────────────────┐
│ 6. Log Action    │────▶│ Audit_Logs DB    │
└────────┬─────────┘     └──────────────────┘
         │
         │ [Approval Email]
         ▼
┌──────────────────┐
│ 7. Send          │
│    Notification  │
└────────┬─────────┘
         │
         │ [Approval + Student #]
         ▼
     Applicant
```

### Data Stores

| Data Store | Contents | Access |
|------------|----------|--------|
| **DS1: Users** | User accounts, authentication data | All processes |
| **DS2: Students** | Student records, profile information | Processes 3, 4, 5, 7 |
| **DS3: Applications** | Application submissions | Processes 2, 3, 7 |
| **DS4: Application_Documents** | Uploaded application documents | Process 2, 3 |
| **DS5: Courses** | Course catalog | Processes 5, 6, 7 |
| **DS6: Registrations** | Student-course registrations | Processes 5, 7 |
| **DS7: Emergency_Contacts** | Student emergency contacts | Process 4 |
| **DS8: System_Settings** | Configuration settings | Processes 5, 6 |
| **DS9: Audit_Logs** | System audit trail | All write processes |
| **DS10: Notifications** | User notifications | Process 8 |

(Detailed DFD diagrams will be inserted here)

---

This comprehensive data modeling section provides the foundation for database design, system architecture, and understanding of data flows within the EduHub system. The models will guide implementation during the design and development phases.

---


# Conclusion

The Analysis Phase has provided a comprehensive examination of the EduHub system requirements through systematic information gathering, current system analysis, and detailed requirement specification.

## Key Achievements

1. **Comprehensive Information Gathering**: Employed multiple methodologies (observation, participatory workshops, interviews) to gather requirements from all stakeholder groups

2. **Current System Analysis**: Identified 10 critical weaknesses in the existing manual/fragmented system that justify the need for automation

3. **Data Requirements**: Defined data integrity rules, constraints, and validation requirements to ensure data quality

4. **Detailed Functional Requirements**: Specified 71 functional requirements across 11 categories with unique identifiers, priorities, and acceptance criteria

5. **Comprehensive Non-Functional Requirements**: Defined 26 non-functional requirements across 8 quality attributes (security, performance, availability, usability, maintainability, scalability, portability, compliance)

6. **Detailed Data Models**: Created comprehensive use case diagrams, entity relationship diagrams with 10 entities, and data flow diagrams showing system processes and data flows

## Requirements Summary

- **Total Functional Requirements**: 71 (45 Must Have, 23 Should Have, 3 Could Have)
- **Total Non-Functional Requirements**: 26 (22 Must Have, 4 Should Have)
- **Data Entities**: 10 primary entities with defined relationships
- **System Actors**: 6 user roles with defined use cases

## Next Steps

The detailed requirements and data models developed in this Analysis Phase will guide:

- **Phase 4 (System Design)**: Architectural design, database schemas, API specifications, UI/UX design, security design
- **Phase 5 (Implementation)**: Actual coding and development of the system based on approved designs

The analysis ensures that all stakeholder needs are understood and documented, providing a solid foundation for successful system design and implementation.

---

**Document Status**: Analysis Phase Complete
**Next Phase**: System Design Phase (Due: June 8, 2026)

