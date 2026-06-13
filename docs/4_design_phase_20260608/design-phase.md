# EduHub Student Management System

## Phase 4 – System Design Phase

Project: EduHub Student Management System
Team: EduHub Development Team
Course: IT Project
Date: June 2026
Due Date: June 8, 2026

---

# 4. System Design Phase

**Design Period**: May 12 - June 8, 2026
**Design Team**: 4 developers (from EduHub team)
**Design Review**: June 5, 2026 with IT Manager (Mr. Dlamini)

In the previous phases, we identified the need for EduHub (Planning Phase) and documented detailed requirements (Analysis Phase). Now in Phase 4, we're designing the actual system - creating the blueprint that developers will follow during implementation.

This phase translates requirements into concrete designs: architecture diagrams, database schemas, user interface mockups, and program logic. Think of it like an architect creating detailed building plans before construction begins.

---

# 4.1 Introduction

## What We're Designing

Taking our requirements from analysis phase and creating:

- **System architecture** - How the parts fit together
- **Database schema** - Actual SQL tables with data types
- **UI mockups** - What users will see
- **Program logic** - Pseudocode for key functions
- **Security approach** - How we'll protect Richfield's data

This is the blueprint for building EduHub.

## Recap: What We Know So Far

From the Planning and Analysis phases, we established:

**What We Observed at Richfield** (from March 2026 observations):

- Three systems: Moodle (learning.richfield.ac.za), iEnabler (rgitie.richfield.ac.za), PDF forms
- Measured: 30-45 min per application (average 38 min), 300-400 applications per intake
- Timed: 1hr 45min average queue wait during registration week (March 15-19, 2026)
- Observed: 10% data entry error rate (3 errors in 30 manual entries)
- Counted: ~200 paper forms filed per week

**The Requirements (Phase 3)**:

- **71 functional requirements** across 11 categories (authentication, applications, registration, etc.)
- **26 non-functional requirements** covering security, performance, usability, etc.
- **5 user types**: Applicants, Students, Lecturers, Administrators, Alumni
- **10 main database entities** with defined relationships
- **Must-have features**: Online applications, automated approvals, course registration, role-based access

## Design Approach

We're using a **layered architecture** approach:

1. **Presentation Layer** - What users see (web interface)
2. **Business Logic Layer** - The rules and processing
3. **Data Layer** - Database and data management

This approach ensures:

- **Separation of concerns** - Each layer has a specific job
- **Maintainability** - Can update one layer without breaking others
- **Scalability** - Can improve performance of individual layers
- **Security** - Multiple layers of protection

## Our Design Decisions

Based on workshops and IT Manager requirements:

1. **Mobile-First**: 100% of students in workshop wanted mobile access
2. **Simple UX**: Students said "make it like banking apps - simple and fast"
3. **Security**: IT Manager's #1 concern - POPIA compliance
4. **Scalable**: Plan for 1,200 → 2,000+ students (Richfield's 3-year plan)

---

# 4.2 System Design (Description of Proposed System)

## High-Level System Overview

EduHub is a **web-based student management system** that replaces Richfield's current fragmented approach (Moodle + iEnabler + paper forms) with a single unified platform.

### What the System Does

**Core Functions**:

1. **User Authentication & Management** - Secure login, role-based access, password management
2. **Application Processing** - Online applications, document uploads, automated workflow for approvals
3. **Student Management** - Profile management, emergency contacts, student records
4. **Course Registration** - Browse courses, register online, add/drop within deadlines
5. **Administrative Functions** - Application approvals, course management, reporting
6. **Communication** - Automated notifications, announcements, in-app messaging

### System Architecture Type

**Three-Tier Architecture**:

```
┌─────────────────────────────────────────────┐
│        TIER 1: PRESENTATION LAYER           │
│  (React Frontend - What Users See)          │
│  - Web Interface                            │
│  - Mobile-Responsive Design                 │
│  - User Input Forms                         │
│  - Data Display                             │
└──────────────────┬──────────────────────────┘
                   │ HTTP/HTTPS
                   │ REST API Calls
┌──────────────────▼──────────────────────────┐
│      TIER 2: APPLICATION LAYER              │
│  (Node.js/Express Backend - Business Logic) │
│  - Authentication & Authorization           │
│  - Business Rules Enforcement               │
│  - Data Validation                          │
│  - API Endpoints                            │
│  - Workflow Management                      │
└──────────────────┬──────────────────────────┘
                   │ SQL Queries
                   │ Database Operations
┌──────────────────▼──────────────────────────┐
│         TIER 3: DATA LAYER                  │
│  (PostgreSQL Database - Data Storage)       │
│  - User Data                                │
│  - Student Records                          │
│  - Course Information                       │
│  - Application Data                         │
│  - Audit Logs                               │
└─────────────────────────────────────────────┘
```

### Technology Stack

Based on the requirements and Richfield's needs, we're using:

**Frontend (Presentation Layer)**:

- **React.js** - Modern JavaScript framework for building user interfaces
- **Responsive CSS** - Works on desktop, tablet, and mobile
- **React Router** - Navigation between pages
- **Axios** - Communicating with backend API

**Backend (Application Layer)**:

- **Node.js** - JavaScript runtime for server-side code
- **Express.js** - Web framework for building REST APIs
- **JWT (JSON Web Tokens)** - Secure authentication
- **Bcrypt** - Password hashing
- **Nodemailer** - Sending email notifications

**Database (Data Layer)**:

- **PostgreSQL** - Relational database for storing all data
- **Sequelize ORM** - Makes database operations easier

**File Storage**:

- **Local file system** or **Cloud storage (AWS S3)** - For uploaded documents

**Development Tools**:

- **Git** - Version control
- **Docker** - Containerization for easy deployment
- **Jest** - Testing framework

### Why We Chose This Stack for EduHub

Based on our team's skills assessment (from planning phase) and Richfield's requirements:

1. **Team Already Knows JavaScript**: Our development team has JavaScript experience from coursework
2. **Richfield's Growth Plans**: IT Manager mentioned growth from 1,200 to 2,000+ students - this stack can scale
3. **Budget Constraints**: Richfield wants open-source solution (no licensing costs) - confirmed in workshops
4. **Hosting Options**: Can deploy to free tier (Heroku/Railway) initially, then scale to AWS/DigitalOcean
5. **Support Available**: Large community means we can find help when stuck

## System Components

### 1. Frontend Application (React)

**Purpose**: The user interface that students, lecturers, and administrators interact with

**Key Components**:

- **Authentication Pages**: Login, Register, Password Reset
- **Student Portal**: Dashboard, Profile, Course Registration, Applications
- **Lecturer Portal**: Assigned Courses, Class Rosters, Announcements
- **Admin Portal**: Application Management, Course Management, Reports

### 2. Backend API (Node.js/Express)

**Purpose**: Handles business logic, data validation, and communicates with the database

**Key Components**:

- **Authentication Service**: Login, token generation, session management
- **User Management Service**: User accounts, roles, permissions
- **Application Service**: Application submission, approval workflow
- **Registration Service**: Course registration, prerequisite checking
- **Notification Service**: Email sending, in-app notifications
- **Reporting Service**: Generate reports and analytics

### 3. Database (PostgreSQL)

**Purpose**: Stores all system data permanently

**Key Components**:

- **User Tables**: Users, Students, Emergency Contacts
- **Application Tables**: Applications, Application Documents
- **Course Tables**: Courses, Registrations
- **System Tables**: Audit Logs, Notifications, System Settings

### 4. File Storage

**Purpose**: Stores uploaded documents (application documents, profile photos)

**Approach**: Files stored with unique identifiers, paths stored in database

---

# 4.3 Architectural Design

## Software Architecture

We're using a **three-tier client-server architecture** with a **RESTful API** connecting the frontend and backend.

### Architecture Diagram

```
                           ┌─────────────────┐
                           │   Web Browser   │
                           │  (User Device)  │
                           └────────┬────────┘
                                    │ HTTPS
                                    │
                ┌───────────────────▼────────────────────┐
                │      FRONTEND (React SPA)              │
                │  ┌─────────────────────────────────┐   │
                │  │  Components & Pages             │   │
                │  │  - Login, Dashboard, etc.       │   │
                │  └─────────────────────────────────┘   │
                │  ┌─────────────────────────────────┐   │
                │  │  State Management (React State) │   │
                │  └─────────────────────────────────┘   │
                │  ┌─────────────────────────────────┐   │
                │  │  API Client (Axios)             │   │
                │  └─────────────────────────────────┘   │
                └───────────────────┬────────────────────┘
                                    │ REST API (JSON)
                                    │ HTTP Requests/Responses
                ┌───────────────────▼────────────────────┐
                │     BACKEND (Node.js/Express)          │
                │  ┌─────────────────────────────────┐   │
                │  │  API Routes                     │   │
                │  │  /api/auth, /api/users, etc.    │   │
                │  └──────────┬──────────────────────┘   │
                │  ┌──────────▼──────────────────────┐   │
                │  │  Controllers                    │   │
                │  │  (Request Handling)             │   │
                │  └──────────┬──────────────────────┘   │
                │  ┌──────────▼──────────────────────┐   │
                │  │  Services (Business Logic)      │   │
                │  │  - AuthService                  │   │
                │  │  - ApplicationService           │   │
                │  │  - RegistrationService          │   │
                │  └──────────┬──────────────────────┘   │
                │  ┌──────────▼──────────────────────┐   │
                │  │  Middleware                     │   │
                │  │  - Authentication               │   │
                │  │  - Authorization                │   │
                │  │  - Validation                   │   │
                │  └──────────┬──────────────────────┘   │
                │  ┌──────────▼──────────────────────┐   │
                │  │  Models (Sequelize ORM)         │   │
                │  │  - User, Student, Course, etc.  │   │
                │  └──────────┬──────────────────────┘   │
                └─────────────┼────────────────────────┘
                              │ SQL Queries
                ┌─────────────▼────────────────────────┐
                │   DATABASE (PostgreSQL)              │
                │  ┌─────────────────────────────────┐ │
                │  │  Tables                         │ │
                │  │  - users, students, courses     │ │
                │  │  - applications, registrations  │ │
                │  │  - audit_logs, notifications    │ │
                │  └─────────────────────────────────┘ │
                └──────────────────────────────────────┘
```

### Component Interaction Flow

**Example: Student Registers for a Course**

1. **Student clicks "Register" button** → Frontend (React)
2. **Frontend sends POST request** → `/api/registrations` with student_id and course_id
3. **Backend receives request** → API Router directs to RegistrationController
4. **Authentication middleware checks** → Is user logged in? Valid token?
5. **Authorization middleware checks** → Is user a Student? Can they register?
6. **Controller calls RegistrationService** → Business logic
7. **Service checks prerequisites** → Query database for student's completed courses
8. **Service checks capacity** → Query database for current enrollment count
9. **Service checks conflicts** → Query for schedule conflicts
10. **Service creates registration** → Insert into registrations table
11. **Service sends notification** → Queue email notification
12. **Service returns success** → Back to Controller
13. **Controller sends response** → JSON with registration details
14. **Frontend updates UI** → Shows "Successfully registered!" message

## Hardware Architecture

### Deployment Architecture

**Development Environment** (During Phase 5 - Implementation):

```
┌──────────────────────────────────┐
│   Developer Laptop               │
│                                  │
│   ┌──────────────────────────┐   │
│   │  Node.js (Backend)       │   │
│   │  Port: 5000              │   │
│   └──────────────────────────┘   │
│                                  │
│   ┌──────────────────────────┐   │
│   │  React Dev Server        │   │
│   │  Port: 3000              │   │
│   └──────────────────────────┘   │
│                                  │
│   ┌──────────────────────────┐   │
│   │  PostgreSQL              │   │
│   │  Port: 5432              │   │
│   └──────────────────────────┘   │
└──────────────────────────────────┘
```

**Production Environment** (After deployment):

```
                     INTERNET
                         │
                         │
        ┌────────────────▼─────────────────┐
        │      Load Balancer/NGINX         │
        │   (Routes traffic, HTTPS)        │
        └────────────┬─────────────────────┘
                     │
        ┌────────────┴─────────────────────┐
        │                                  │
┌───────▼────────┐              ┌──────────▼──────┐
│  Web Server 1  │              │  Web Server 2   │
│  (Node.js App) │              │  (Node.js App)  │
│  Port: 5000    │              │  Port: 5000     │
└───────┬────────┘              └──────────┬──────┘
        │                                  │
        └────────────┬─────────────────────┘
                     │
        ┌────────────▼─────────────────────┐
        │    Database Server               │
        │    PostgreSQL                    │
        │    Port: 5432                    │
        └──────────────────────────────────┘
                     │
        ┌────────────▼─────────────────────┐
        │    File Storage                  │
        │    (Document uploads)            │
        └──────────────────────────────────┘
```

### Hardware Requirements

**Minimum Server Specifications (For Production)**:

- **CPU**: 4 cores, 2.5 GHz
- **RAM**: 8 GB minimum, 16 GB recommended
- **Storage**: 100 GB SSD
- **Network**: 100 Mbps connection

**Can also deploy to cloud platforms**:

- **Heroku** (easiest for small deployments)
- **AWS** (scalable for growth)
- **DigitalOcean** (good balance of cost and features)

## Network Architecture

### Network Topology

```
                  ┌─────────────────────┐
                  │   Internet Users    │
                  │  (Students, Staff)  │
                  └──────────┬──────────┘
                             │
                    HTTPS (Port 443)
                             │
                  ┌──────────▼──────────┐
                  │  Firewall/Router    │
                  │  - Only allows      │
                  │    HTTPS/HTTP       │
                  └──────────┬──────────┘
                             │
        ┌────────────────────┴────────────────────┐
        │         DMZ (Demilitarized Zone)        │
        │                                         │
        │  ┌─────────────────────────────────┐    │
        │  │   Web Server(s)                 │    │
        │  │   - Serves React app            │    │
        │  │   - Handles API requests        │    │
        │  └─────────────────────────────────┘    │
        │                                         │
        └────────────────────┬────────────────────┘
                             │
                    Internal Network
                             │
        ┌────────────────────▼────────────────────┐
        │        Secure Internal Zone             │
        │                                         │
        │  ┌─────────────────────────────────┐    │
        │  │   Database Server               │    │
        │  │   - Not accessible from         │    │
        │  │     internet directly           │    │
        │  └─────────────────────────────────┘    │
        │                                         │
        │  ┌─────────────────────────────────┐    │
        │  │   File Storage                  │    │
        │  │   - Document uploads            │    │
        │  └─────────────────────────────────┘    │
        │                                         │
        └─────────────────────────────────────────┘
```

### Network Security

1. **Firewall**: Only allows HTTPS (port 443) and HTTP (port 80, redirects to HTTPS)
2. **Database Isolation**: Database not directly accessible from internet
3. **VPN Access**: Administrators access internal systems via VPN
4. **SSL/TLS Encryption**: All data transmitted over HTTPS

## Class Diagram

The class diagram shows the main objects in our system and how they relate to each other.

```
┌─────────────────────────────┐
│         User                │
├─────────────────────────────┤
│ - userId                    │
│ - email                     │
│ - passwordHash              │
│ - firstName                 │
│ - lastName                  │
│ - role                      │
│ - isActive                  │
│ - isVerified                │
├─────────────────────────────┤
│ + login()                   │
│ + logout()                  │
│ + resetPassword()           │
│ + updateProfile()           │
└──────────┬──────────────────┘
           │
           │ inherits
           │
    ┌──────┴───────┬───────────────┬──────────────┐
    │              │               │              │
┌───▼────┐  ┌──────▼─────┐  ┌──────▼─────┐  ┌────▼──────┐
│Applicant│  │  Student   │  │  Lecturer  │  │   Admin   │
├─────────┤  ├────────────┤  ├────────────┤  ├───────────┤
│         │  │-studentNum │  │-employeeId │  │-adminLevel│
│         │  │-program    │  │-department │  │           │
├─────────┤  ├────────────┤  ├────────────┤  ├───────────┤
│+apply() │  │+register() │  │+viewRoster()│  │+approve() │
│         │  │+viewCourses│  │+postAnnounce│ │+manage()  │
└─────────┘  └────────────┘  └────────────┘  └───────────┘
                  │
                  │ has
                  ▼
         ┌─────────────────┐
         │  Registration   │
         ├─────────────────┤
         │ - registrationId│
         │ - studentId     │
         │ - courseId      │
         │ - semester      │
         │ - status        │
         ├─────────────────┤
         │ + drop()        │
         │ + complete()    │
         └────────┬────────┘
                  │
                  │ for
                  ▼
         ┌─────────────────┐
         │     Course      │
         ├─────────────────┤
         │ - courseId      │
         │ - courseCode    │
         │ - courseName    │
         │ - credits       │
         │ - capacity      │
         │ - lecturerId    │
         ├─────────────────┤
         │ + addStudent()  │
         │ + checkCapacity()│
         └─────────────────┘
```

---

# 4.4 Physical Design

## System Deployment Model

The physical design describes how the logical components (software) are deployed onto physical hardware and infrastructure.

### Deployment Options

**Option 1: Cloud Deployment (Recommended for Richfield)**

**Why Cloud?**

- No need to buy/maintain physical servers
- Scales automatically as Richfield grows
- Provider handles backups, security patches, infrastructure
- Pay only for what you use

**Recommended Platform: Heroku** (for simplicity)

```
┌────────────────────────────────────────────────┐
│              Heroku Cloud                      │
│                                                │
│  ┌──────────────────────────────────────────┐  │
│  │  Web Dyno (Container)                    │  │
│  │  - Node.js/Express Backend               │  │
│  │  - Serves React Frontend                 │  │
│  │  - Auto-scaling enabled                  │  │
│  └──────────────────────────────────────────┘  │
│                                                │
│  ┌──────────────────────────────────────────┐  │
│  │  Heroku Postgres Add-on                  │  │
│  │  - Managed database                      │  │
│  │  - Automatic backups                     │  │
│  └──────────────────────────────────────────┘  │
│                                                │
│  ┌──────────────────────────────────────────┐  │
│  │  S3-compatible Storage                   │  │
│  │  - For document uploads                  │  │
│  └──────────────────────────────────────────┘  │
└────────────────────────────────────────────────┘
```

**Option 2: On-Premises Server** (if Richfield prefers)

```
┌────────────────────────────────────────────────┐
│       Richfield Server Room                    │
│                                                │
│  ┌──────────────────────────────────────────┐  │
│  │  Physical Server                         │  │
│  │  - Ubuntu Linux                          │  │
│  │  - Docker installed                      │  │
│  │                                          │  │
│  │  ┌────────────────────────────────────┐  │  │
│  │  │  Docker Container 1: Frontend      │  │  │
│  │  │  - React build + Nginx             │  │  │
│  │  └────────────────────────────────────┘  │  │
│  │                                          │  │
│  │  ┌────────────────────────────────────┐  │  │
│  │  │  Docker Container 2: Backend       │  │  │
│  │  │  - Node.js/Express                 │  │  │
│  │  └────────────────────────────────────┘  │  │
│  │                                          │  │
│  │  ┌────────────────────────────────────┐  │  │
│  │  │  Docker Container 3: Database      │  │  │
│  │  │  - PostgreSQL                      │  │  │
│  │  └────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────┘  │
│                                                │
│  ┌──────────────────────────────────────────┐  │
│  │  Backup Drive                            │  │
│  │  - Daily database backups                │  │
│  └──────────────────────────────────────────┘  │
└────────────────────────────────────────────────┘
```

### File Organization Structure

**On the Server:**

```
/var/www/eduhub/
│
├── frontend/               # React application
│   ├── build/              # Production build files
│   ├── public/             # Static assets
│   └── src/                # Source code
│
├── backend/                # Node.js application
│   ├── controllers/        # Request handlers
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── middleware/         # Auth, validation
│   ├── config/             # Configuration files
│   └── server.js           # Main entry point
│
├── uploads/                # Uploaded files
│   ├── applications/       # Application documents
│   └── profiles/           # Profile photos
│
├── logs/                   # Application logs
│   ├── access.log          # Access logs
│   └── error.log           # Error logs
│
└── backups/                # Database backups
    └── daily/              # Daily backup files
```

### Process Flow Diagram

Shows how different system processes interact:

```
┌───────────────────────────────────────────────────────────┐
│                    USER ACCESS                            │
└───────────────────────┬───────────────────────────────────┘
                        │
                        ▼
            ┌─────────────────────┐
            │  Load Balancer      │
            │  (Distribute Load)  │
            └──────────┬──────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
┌──────────────┐┌──────────────┐┌──────────────┐
│ Web Server 1 ││ Web Server 2 ││ Web Server 3 │
│ (App Process)││ (App Process)││ (App Process)│
└──────┬───────┘└──────┬───────┘└──────┬───────┘
       │               │               │
       └───────────────┼───────────────┘
                       │
                       ▼
            ┌─────────────────────┐
            │  Database Server    │
            │  (PostgreSQL)       │
            └──────────┬──────────┘
                       │
                       ▼
            ┌─────────────────────┐
            │  Backup Process     │
            │  (Runs Daily)       │
            └─────────────────────┘
```

## Capacity Planning

Based on Richfield's expected usage:

**Current State**:

- Estimated 500-1000 students
- 50 lecturers
- 10 administrative staff

**Storage Needs**:

- Database: ~5 GB initially
- Uploaded documents: ~20 GB initially
- Total: ~30 GB (with room to grow to 500 GB)

**Bandwidth Needs**:

- Average concurrent users: 50-100
- Peak concurrent users (registration period): 200-500
- Bandwidth: 10-50 Mbps

**Processing Needs**:

- Regular load: 2-4 CPU cores
- Peak load (registration): 4-8 CPU cores with auto-scaling

---

# 4.5 Database Design

Now we get into the detailed database design - the actual table structures with specific data types, constraints, and relationships that will be implemented in PostgreSQL.

## Database Schema Overview

The database consists of **10 primary tables** organized into logical groups:

1. **Authentication & Users**: Users
2. **Student Information**: Students, Emergency_Contacts
3. **Applications**: Applications, Application_Documents
4. **Courses**: Courses, Registrations
5. **System**: System_Settings, Audit_Logs, Notifications

### Complete Database Schema

#### 1. Users Table

**Purpose**: Stores authentication and basic information for all system users

**SQL Schema**:

```sql
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('Applicant', 'Student', 'Lecturer', 'Admin', 'Alumni')),
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret VARCHAR(255),
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
```

**Columns**:
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| user_id | UUID | PRIMARY KEY | Unique identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email address (used for login) |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hashed password (never store plain passwords!) |
| first_name | VARCHAR(100) | NOT NULL | User's first name |
| last_name | VARCHAR(100) | NOT NULL | User's last name |
| role | VARCHAR(20) | NOT NULL, CHECK | User role (Applicant, Student, Lecturer, Admin, Alumni) |
| is_active | BOOLEAN | DEFAULT TRUE | Whether account is active |
| is_verified | BOOLEAN | DEFAULT FALSE | Whether email has been verified |
| mfa_enabled | BOOLEAN | DEFAULT FALSE | Whether multi-factor authentication is enabled |
| mfa_secret | VARCHAR(255) | NULLABLE | Secret key for MFA (if enabled) |
| last_login | TIMESTAMP | NULLABLE | Last login timestamp |
| created_at | TIMESTAMP | DEFAULT NOW() | When account was created |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update to record |

**Relationships**:

- One-to-One with Students (when role = 'Student')
- One-to-Many with Applications
- One-to-Many with Audit_Logs
- One-to-Many with Notifications

---

#### 2. Students Table

**Purpose**: Stores additional information specific to enrolled students

**SQL Schema**:

```sql
CREATE TABLE students (
    student_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    student_number VARCHAR(20) UNIQUE NOT NULL,
    id_number VARCHAR(50) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    program VARCHAR(100) NOT NULL,
    year_of_study INTEGER DEFAULT 1 CHECK (year_of_study BETWEEN 1 AND 6),
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Graduated', 'Suspended')),
    profile_photo_url VARCHAR(255),
    enrollment_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_students_student_number ON students(student_number);
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_students_id_number ON students(id_number);
CREATE INDEX idx_students_status ON students(status);
```

**Columns**:
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| student_id | UUID | PRIMARY KEY | Unique identifier |
| user_id | UUID | FOREIGN KEY, UNIQUE | Reference to users table |
| student_number | VARCHAR(20) | UNIQUE, NOT NULL | Generated student number (format: YEAR-####) |
| id_number | VARCHAR(50) | UNIQUE, NOT NULL | National ID number |
| phone | VARCHAR(20) | NOT NULL | Student phone number |
| address | TEXT | NOT NULL | Physical address |
| date_of_birth | DATE | NOT NULL | Date of birth |
| program | VARCHAR(100) | NOT NULL | Academic program enrolled in |
| year_of_study | INTEGER | CHECK 1-6 | Current year of study |
| status | VARCHAR(20) | CHECK | Student status (Active, Graduated, Suspended) |
| profile_photo_url | VARCHAR(255) | NULLABLE | URL/path to profile photo |
| enrollment_date | DATE | NOT NULL | When student enrolled |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation date |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update date |

**Relationships**:

- One-to-One with Users
- One-to-Many with Emergency_Contacts
- Many-to-Many with Courses (through Registrations)

---

#### 3. Emergency_Contacts Table

**Purpose**: Stores emergency contact information for students (max 3 per student)

**SQL Schema**:

```sql
CREATE TABLE emergency_contacts (
    contact_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_emergency_contacts_student_id ON emergency_contacts(student_id);
```

**Columns**:
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| contact_id | UUID | PRIMARY KEY | Unique identifier |
| student_id | UUID | FOREIGN KEY | Reference to students table |
| name | VARCHAR(100) | NOT NULL | Contact's full name |
| relationship | VARCHAR(50) | NOT NULL | Relationship to student |
| phone | VARCHAR(20) | NOT NULL | Contact phone number |
| email | VARCHAR(255) | NULLABLE | Contact email (optional) |
| is_primary | BOOLEAN | DEFAULT FALSE | Whether this is the primary contact |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation date |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update date |

**Business Rule**: Maximum 3 emergency contacts per student (enforced in application logic)

---

#### 4. Applications Table

**Purpose**: Stores student applications for admission

**SQL Schema**:

```sql
CREATE TABLE applications (
    application_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    id_number VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    program VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'Submitted' CHECK (status IN ('Submitted', 'Under Review', 'Approved', 'Rejected', 'Withdrawn')),
    rejection_reason TEXT,
    reviewed_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP,
    is_draft BOOLEAN DEFAULT TRUE,
    submitted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_submitted_at ON applications(submitted_at);
```

**Columns**:
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| application_id | UUID | PRIMARY KEY | Unique identifier |
| user_id | UUID | FOREIGN KEY | Reference to users table (applicant) |
| first_name | VARCHAR(100) | NOT NULL | Applicant first name |
| last_name | VARCHAR(100) | NOT NULL | Applicant last name |
| id_number | VARCHAR(50) | NOT NULL | National ID number |
| email | VARCHAR(255) | NOT NULL | Email address |
| phone | VARCHAR(20) | NOT NULL | Phone number |
| address | TEXT | NOT NULL | Physical address |
| date_of_birth | DATE | NOT NULL | Date of birth |
| program | VARCHAR(100) | NOT NULL | Program applying for |
| status | VARCHAR(20) | CHECK | Application status |
| rejection_reason | TEXT | NULLABLE | Reason if rejected |
| reviewed_by | UUID | FOREIGN KEY | Admin who reviewed (nullable) |
| reviewed_at | TIMESTAMP | NULLABLE | When reviewed |
| is_draft | BOOLEAN | DEFAULT TRUE | Whether still in draft |
| submitted_at | TIMESTAMP | NULLABLE | When submitted |
| created_at | TIMESTAMP | DEFAULT NOW() | Application creation date |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update date |

---

#### 5. Application_Documents Table

**Purpose**: Stores documents uploaded with applications (ID, certificates, transcripts)

**SQL Schema**:

```sql
CREATE TABLE application_documents (
    document_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES applications(application_id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('ID', 'Certificate', 'Transcript', 'Other')),
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL CHECK (file_size <= 5242880), -- 5MB max
    mime_type VARCHAR(100) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_application_documents_application_id ON application_documents(application_id);
```

**Columns**:
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| document_id | UUID | PRIMARY KEY | Unique identifier |
| application_id | UUID | FOREIGN KEY | Reference to applications table |
| document_type | VARCHAR(50) | CHECK | Type of document |
| file_name | VARCHAR(255) | NOT NULL | Original filename |
| file_path | VARCHAR(255) | NOT NULL | Storage path |
| file_size | INTEGER | CHECK <= 5MB | File size in bytes |
| mime_type | VARCHAR(100) | NOT NULL | File MIME type (e.g., application/pdf) |
| uploaded_at | TIMESTAMP | DEFAULT NOW() | Upload timestamp |

---

#### 6. Courses Table

**Purpose**: Stores course information

**SQL Schema**:

```sql
CREATE TABLE courses (
    course_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_code VARCHAR(20) UNIQUE NOT NULL,
    course_name VARCHAR(200) NOT NULL,
    description TEXT,
    credits INTEGER NOT NULL CHECK (credits > 0),
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    department VARCHAR(100) NOT NULL,
    semester VARCHAR(50) NOT NULL,
    schedule VARCHAR(100),
    prerequisites TEXT,
    lecturer_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_courses_course_code ON courses(course_code);
CREATE INDEX idx_courses_lecturer_id ON courses(lecturer_id);
CREATE INDEX idx_courses_semester ON courses(semester);
CREATE INDEX idx_courses_is_active ON courses(is_active);
```

**Columns**:
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| course_id | UUID | PRIMARY KEY | Unique identifier |
| course_code | VARCHAR(20) | UNIQUE, NOT NULL | Course code (e.g., CS101) |
| course_name | VARCHAR(200) | NOT NULL | Course name |
| description | TEXT | NULLABLE | Course description |
| credits | INTEGER | CHECK > 0 | Credit hours |
| capacity | INTEGER | CHECK > 0 | Maximum number of students |
| department | VARCHAR(100) | NOT NULL | Department offering course |
| semester | VARCHAR(50) | NOT NULL | Semester (e.g., Fall 2026) |
| schedule | VARCHAR(100) | NULLABLE | Class schedule |
| prerequisites | TEXT | NULLABLE | Prerequisite courses (JSON or comma-separated) |
| lecturer_id | UUID | FOREIGN KEY | Assigned lecturer |
| is_active | BOOLEAN | DEFAULT TRUE | Whether course is active |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation date |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update date |

---

#### 7. Registrations Table

**Purpose**: Junction table for student-course registrations (many-to-many relationship)

**SQL Schema**:

```sql
CREATE TABLE registrations (
    registration_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(student_id) ON DELETE RESTRICT,
    course_id UUID NOT NULL REFERENCES courses(course_id) ON DELETE RESTRICT,
    semester VARCHAR(50) NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'Registered' CHECK (status IN ('Registered', 'Dropped', 'Completed')),
    dropped_at TIMESTAMP,
    grade VARCHAR(5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, course_id, semester) -- Student can't register for same course twice in same semester
);

CREATE INDEX idx_registrations_student_id ON registrations(student_id);
CREATE INDEX idx_registrations_course_id ON registrations(course_id);
CREATE INDEX idx_registrations_semester ON registrations(semester);
CREATE INDEX idx_registrations_status ON registrations(status);
```

**Columns**:
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| registration_id | UUID | PRIMARY KEY | Unique identifier |
| student_id | UUID | FOREIGN KEY | Reference to students table |
| course_id | UUID | FOREIGN KEY | Reference to courses table |
| semester | VARCHAR(50) | NOT NULL | Registration semester |
| registration_date | TIMESTAMP | DEFAULT NOW() | When student registered |
| status | VARCHAR(20) | CHECK | Registration status |
| dropped_at | TIMESTAMP | NULLABLE | When course was dropped |
| grade | VARCHAR(5) | NULLABLE | Final grade (future feature) |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation date |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update date |

**Unique Constraint**: (student_id, course_id, semester) - Prevents duplicate registrations

---

#### 8. System_Settings Table

**Purpose**: Stores system configuration settings (registration periods, etc.)

**SQL Schema**:

```sql
CREATE TABLE system_settings (
    setting_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_system_settings_setting_key ON system_settings(setting_key);
```

**Common Settings**:

- `registration_start_date`: When registration opens
- `registration_end_date`: When registration closes
- `add_drop_deadline`: Last day to add/drop courses
- `current_semester`: Current active semester
- `max_credits_per_semester`: Maximum credits students can register for

---

#### 9. Audit_Logs Table

**Purpose**: Stores audit trail of all system actions for compliance and debugging

**SQL Schema**:

```sql
CREATE TABLE audit_logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    changes JSONB,
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

**Columns**:
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| log_id | UUID | PRIMARY KEY | Unique identifier |
| user_id | UUID | FOREIGN KEY | Who performed the action |
| action | VARCHAR(100) | NOT NULL | Action performed (e.g., 'CREATE_USER', 'APPROVE_APPLICATION') |
| entity_type | VARCHAR(50) | NOT NULL | Type of entity affected (e.g., 'User', 'Application') |
| entity_id | UUID | NULLABLE | ID of affected entity |
| changes | JSONB | NULLABLE | JSON object showing what changed |
| ip_address | VARCHAR(45) | NULLABLE | User's IP address |
| user_agent | VARCHAR(255) | NULLABLE | Browser/device information |
| created_at | TIMESTAMP | DEFAULT NOW() | When action occurred |

---

#### 10. Notifications Table

**Purpose**: Stores in-app notifications for users

**SQL Schema**:

```sql
CREATE TABLE notifications (
    notification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
    is_read BOOLEAN DEFAULT FALSE,
    link_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

**Columns**:
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| notification_id | UUID | PRIMARY KEY | Unique identifier |
| user_id | UUID | FOREIGN KEY | Recipient user |
| title | VARCHAR(200) | NOT NULL | Notification title |
| message | TEXT | NOT NULL | Notification message |
| type | VARCHAR(50) | CHECK | Notification type (info, success, warning, error) |
| is_read | BOOLEAN | DEFAULT FALSE | Whether notification has been read |
| link_url | VARCHAR(255) | NULLABLE | Optional link to related page |
| created_at | TIMESTAMP | DEFAULT NOW() | When notification was created |

---

## Database Relationships Summary

### One-to-One Relationships:

- **Users ↔ Students**: Each student record belongs to one user account

### One-to-Many Relationships:

- **Users → Applications** (as applicant): One user can submit multiple applications
- **Users → Applications** (as reviewer): One admin can review multiple applications
- **Users → Courses**: One lecturer can teach multiple courses
- **Users → Audit_Logs**: One user performs many actions
- **Users → Notifications**: One user receives many notifications
- **Students → Emergency_Contacts**: One student has multiple emergency contacts (max 3)
- **Applications → Application_Documents**: One application has multiple documents
- **Courses → Registrations**: One course has multiple student registrations

### Many-to-Many Relationships:

- **Students ↔ Courses** (through Registrations): Students can register for multiple courses, courses have multiple students

### Database Diagram (ERD):

```
┌──────────────┐         ┌─────────────────┐
│    Users     │◄─────┐  │   Applications  │
│--------------│      │  │-----------------│
│ user_id (PK) │      │  │ application_id  │
│ email        │      └──│ user_id (FK)    │
│ password_hash│         │ status          │
│ role         │         └─────────┬───────┘
│ ...          │                   │
└──────┬───────┘                   │
       │                           │
       │ 1:1                       │ 1:N
       │                           ▼
┌──────▼───────┐         ┌─────────────────────┐
│   Students   │         │ Application_Documents│
│--------------│         │---------------------│
│ student_id   │         │ document_id (PK)    │
│ user_id (FK) │         │ application_id (FK) │
│ student_num  │         │ file_path           │
│ ...          │         └─────────────────────┘
└──────┬───────┘
       │
       │ 1:N
       ▼
┌──────────────────┐       ┌──────────────┐
│Emergency_Contacts│       │ Registrations│
│------------------│       │--------------│
│ contact_id (PK)  │       │ registration_id│
│ student_id (FK)  │◄──────│ student_id (FK)│
│ name             │  N:M  │ course_id (FK) │
│ ...              │       │ semester       │
└──────────────────┘       └───────┬────────┘
                                   │
                                   │ N:1
                                   ▼
                           ┌──────────────┐
                           │   Courses    │
                           │--------------│
                           │ course_id    │
                           │ course_code  │
                           │ lecturer_id  │
                           │ capacity     │
                           └──────────────┘
```

---

# 4.6 Program Design (Pseudocode)

This section shows the logic for key system processes using pseudocode - a human-readable description of how the code will work, without getting into specific programming syntax.

## 4.6.1 User Authentication - Login Process

```pseudocode
FUNCTION loginUser(email, password):
    // Step 1: Validate input
    IF email is empty OR password is empty THEN
        RETURN error "Email and password are required"
    END IF

    IF email is not valid email format THEN
        RETURN error "Invalid email format"
    END IF

    // Step 2: Find user in database
    user = DATABASE.findOne("users", WHERE email = email)

    IF user is null THEN
        LOG_EVENT("Failed login attempt - user not found", email)
        RETURN error "Invalid email or password"
    END IF

    // Step 3: Check if account is active
    IF user.is_active = FALSE THEN
        RETURN error "Account is disabled. Please contact support."
    END IF

    // Step 4: Verify password
    passwordMatches = BCRYPT.compare(password, user.password_hash)

    IF passwordMatches = FALSE THEN
        LOG_EVENT("Failed login attempt - wrong password", email)
        // Increment failed attempts counter
        INCREMENT user.failed_login_attempts
        IF user.failed_login_attempts >= 5 THEN
            user.is_active = FALSE
            DATABASE.update("users", user)
            RETURN error "Account locked due to multiple failed attempts"
        END IF
        RETURN error "Invalid email or password"
    END IF

    // Step 5: Check MFA if enabled
    IF user.mfa_enabled = TRUE THEN
        // Prompt for MFA code (handled separately)
        RETURN "MFA_REQUIRED"
    END IF

    // Step 6: Generate JWT token
    tokenPayload = {
        userId: user.user_id,
        email: user.email,
        role: user.role
    }
    token = JWT.sign(tokenPayload, SECRET_KEY, expiresIn="24h")

    // Step 7: Update last login
    user.last_login = CURRENT_TIMESTAMP()
    user.failed_login_attempts = 0
    DATABASE.update("users", user)

    // Step 8: Log successful login
    LOG_AUDIT("USER_LOGIN", user.user_id, IP_ADDRESS, USER_AGENT)

    // Step 9: Return success with token
    RETURN {
        success: true,
        token: token,
        user: {
            userId: user.user_id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role
        }
    }
END FUNCTION
```

---

## 4.6.2 Application Submission Process

```pseudocode
FUNCTION submitApplication(applicationData, userId):
    // Step 1: Validate user is logged in and is an Applicant
    user = DATABASE.findOne("users", WHERE user_id = userId)

    IF user.role != "Applicant" THEN
        RETURN error "Only applicants can submit applications"
    END IF

    // Step 2: Check if user already has a pending/approved application
    existingApp = DATABASE.findOne("applications",
        WHERE user_id = userId AND status IN ("Submitted", "Under Review", "Approved"))

    IF existingApp exists THEN
        RETURN error "You already have a pending or approved application"
    END IF

    // Step 3: Validate application data
    requiredFields = ["first_name", "last_name", "id_number", "email", "phone",
                      "address", "date_of_birth", "program"]

    FOR EACH field IN requiredFields:
        IF applicationData[field] is empty THEN
            RETURN error "Required field missing: " + field
        END IF
    END FOR

    // Validate ID number format
    IF NOT MATCHES_PATTERN(applicationData.id_number, "^\d{13}$") THEN
        RETURN error "ID number must be 13 digits"
    END IF

    // Validate email format
    IF NOT IS_VALID_EMAIL(applicationData.email) THEN
        RETURN error "Invalid email format"
    END IF

    // Validate age (must be at least 16)
    age = CALCULATE_AGE(applicationData.date_of_birth)
    IF age < 16 THEN
        RETURN error "Applicant must be at least 16 years old"
    END IF

    // Step 4: Create application record
    application = {
        application_id: GENERATE_UUID(),
        user_id: userId,
        first_name: applicationData.first_name,
        last_name: applicationData.last_name,
        id_number: applicationData.id_number,
        email: applicationData.email,
        phone: applicationData.phone,
        address: applicationData.address,
        date_of_birth: applicationData.date_of_birth,
        program: applicationData.program,
        status: "Submitted",
        is_draft: FALSE,
        submitted_at: CURRENT_TIMESTAMP(),
        created_at: CURRENT_TIMESTAMP()
    }

    DATABASE.insert("applications", application)

    // Step 5: Log the action
    LOG_AUDIT("APPLICATION_SUBMITTED", userId, "Application", application.application_id)

    // Step 6: Send confirmation email
    SEND_EMAIL({
        to: application.email,
        subject: "Application Received",
        body: "Your application for " + application.program + " has been received.
               Application ID: " + application.application_id
    })

    // Step 7: Send in-app notification
    CREATE_NOTIFICATION(userId, "Application Submitted",
        "Your application has been submitted successfully!", "success")

    RETURN {
        success: true,
        applicationId: application.application_id,
        message: "Application submitted successfully"
    }
END FUNCTION
```

---

## 4.6.3 Application Approval Process

```pseudocode
FUNCTION approveApplication(applicationId, adminUserId):
    // Step 1: Verify admin permissions
    admin = DATABASE.findOne("users", WHERE user_id = adminUserId)

    IF admin.role != "Admin" THEN
        RETURN error "Only administrators can approve applications"
    END IF

    // Step 2: Fetch application
    application = DATABASE.findOne("applications", WHERE application_id = applicationId)

    IF application is null THEN
        RETURN error "Application not found"
    END IF

    IF application.status != "Submitted" AND application.status != "Under Review" THEN
        RETURN error "Application cannot be approved (current status: " + application.status + ")"
    END IF

    // Step 3: Generate student number
    currentYear = GET_CURRENT_YEAR()

    // Get the last student number for this year
    lastStudent = DATABASE.findOne("students",
        WHERE student_number LIKE currentYear + "-%",
        ORDER BY student_number DESC,
        LIMIT 1)

    IF lastStudent exists THEN
        // Extract sequence number and increment
        lastSequence = EXTRACT_NUMBER(lastStudent.student_number)
        newSequence = lastSequence + 1
    ELSE
        newSequence = 1
    END IF

    studentNumber = currentYear + "-" + PAD_LEFT(newSequence, 4, "0")
    // Example: 2026-0001, 2026-0002, etc.

    // Step 4: Create student record
    studentRecord = {
        student_id: GENERATE_UUID(),
        user_id: application.user_id,
        student_number: studentNumber,
        id_number: application.id_number,
        phone: application.phone,
        address: application.address,
        date_of_birth: application.date_of_birth,
        program: application.program,
        year_of_study: 1,
        status: "Active",
        enrollment_date: CURRENT_DATE(),
        created_at: CURRENT_TIMESTAMP()
    }

    DATABASE.insert("students", studentRecord)

    // Step 5: Update user role from Applicant to Student
    DATABASE.update("users",
        SET role = "Student"
        WHERE user_id = application.user_id)

    // Step 6: Update application status
    DATABASE.update("applications",
        SET status = "Approved",
            reviewed_by = adminUserId,
            reviewed_at = CURRENT_TIMESTAMP()
        WHERE application_id = applicationId)

    // Step 7: Log the action
    LOG_AUDIT("APPLICATION_APPROVED", adminUserId, "Application", applicationId, {
        student_number: studentNumber
    })

    // Step 8: Send approval email to student
    applicant = DATABASE.findOne("users", WHERE user_id = application.user_id)

    SEND_EMAIL({
        to: applicant.email,
        subject: "Application Approved - Welcome to Richfield!",
        body: "Congratulations! Your application has been approved.
               Student Number: " + studentNumber + "
               Program: " + application.program + "
               You can now log in and register for courses."
    })

    // Step 9: Create in-app notification
    CREATE_NOTIFICATION(application.user_id, "Application Approved",
        "Congratulations! Your application has been approved. Student #: " + studentNumber,
        "success", "/dashboard")

    RETURN {
        success: true,
        studentNumber: studentNumber,
        message: "Application approved successfully"
    }
END FUNCTION
```

---

## 4.6.4 Course Registration Process

```pseudocode
FUNCTION registerForCourse(courseId, studentId):
    // Step 1: Fetch student record
    student = DATABASE.findOne("students", WHERE student_id = studentId)

    IF student is null OR student.status != "Active" THEN
        RETURN error "Student not found or not active"
    END IF

    // Step 2: Fetch course
    course = DATABASE.findOne("courses", WHERE course_id = courseId)

    IF course is null OR course.is_active = FALSE THEN
        RETURN error "Course not available"
    END IF

    // Step 3: Check registration period
    settings = GET_SYSTEM_SETTINGS()
    currentDate = CURRENT_DATE()

    IF currentDate < settings.registration_start_date THEN
        RETURN error "Registration has not opened yet"
    END IF

    IF currentDate > settings.registration_end_date THEN
        RETURN error "Registration period has closed"
    END IF

    // Step 4: Check if already registered for this course
    existingReg = DATABASE.findOne("registrations",
        WHERE student_id = studentId
        AND course_id = courseId
        AND semester = settings.current_semester
        AND status = "Registered")

    IF existingReg exists THEN
        RETURN error "Already registered for this course"
    END IF

    // Step 5: Check course capacity
    enrollmentCount = DATABASE.count("registrations",
        WHERE course_id = courseId
        AND semester = settings.current_semester
        AND status = "Registered")

    IF enrollmentCount >= course.capacity THEN
        RETURN error "Course is full (capacity: " + course.capacity + ")"
    END IF

    // Step 6: Check prerequisites
    IF course.prerequisites is not empty THEN
        prerequisiteCourses = PARSE_JSON(course.prerequisites)

        FOR EACH prereqCourseId IN prerequisiteCourses:
            completedPrereq = DATABASE.findOne("registrations",
                WHERE student_id = studentId
                AND course_id = prereqCourseId
                AND status = "Completed"
                AND grade IN ("A", "B", "C", "D"))

            IF completedPrereq is null THEN
                prereqCourse = DATABASE.findOne("courses", WHERE course_id = prereqCourseId)
                RETURN error "Prerequisite not met: " + prereqCourse.course_name
            END IF
        END FOR
    END IF

    // Step 7: Check schedule conflicts
    studentRegistrations = DATABASE.findAll("registrations",
        WHERE student_id = studentId
        AND semester = settings.current_semester
        AND status = "Registered")

    FOR EACH registration IN studentRegistrations:
        existingCourse = DATABASE.findOne("courses", WHERE course_id = registration.course_id)

        IF SCHEDULES_CONFLICT(course.schedule, existingCourse.schedule) THEN
            RETURN error "Schedule conflict with " + existingCourse.course_name
        END IF
    END FOR

    // Step 8: Check maximum credits
    totalCredits = SUM(registrations.course.credits WHERE student_id = studentId
                       AND semester = current_semester AND status = "Registered")
    totalCredits = totalCredits + course.credits

    IF totalCredits > settings.max_credits_per_semester THEN
        RETURN error "Exceeds maximum credits per semester"
    END IF

    // Step 9: Create registration
    registration = {
        registration_id: GENERATE_UUID(),
        student_id: studentId,
        course_id: courseId,
        semester: settings.current_semester,
        registration_date: CURRENT_TIMESTAMP(),
        status: "Registered",
        created_at: CURRENT_TIMESTAMP()
    }

    DATABASE.insert("registrations", registration)

    // Step 10: Log the action
    user = DATABASE.findOne("users", WHERE user_id = (
        SELECT user_id FROM students WHERE student_id = studentId))

    LOG_AUDIT("COURSE_REGISTERED", user.user_id, "Registration", registration.registration_id, {
        course_code: course.course_code,
        course_name: course.course_name
    })

    // Step 11: Send confirmation email
    SEND_EMAIL({
        to: user.email,
        subject: "Course Registration Confirmed",
        body: "You have successfully registered for " + course.course_code +
              " - " + course.course_name
    })

    // Step 12: Create notification
    CREATE_NOTIFICATION(user.user_id, "Registration Successful",
        "Successfully registered for " + course.course_name, "success")

    RETURN {
        success: true,
        registrationId: registration.registration_id,
        message: "Successfully registered for course"
    }
END FUNCTION
```

---

## 4.6.5 Student Number Generation Algorithm

```pseudocode
FUNCTION generateStudentNumber():
    // Get current year
    currentYear = GET_CURRENT_YEAR()  // e.g., 2026

    // Lock table to prevent race condition (multiple approvals at same time)
    DATABASE.BEGIN_TRANSACTION()
    DATABASE.LOCK_TABLE("students")

    TRY:
        // Find the highest student number for current year
        query = "SELECT student_number FROM students
                 WHERE student_number LIKE '" + currentYear + "-%'
                 ORDER BY student_number DESC
                 LIMIT 1"

        lastStudent = DATABASE.execute(query)

        IF lastStudent exists THEN
            // Extract sequence part (e.g., "2026-0042" -> "0042")
            lastNumber = lastStudent.student_number
            sequencePart = SUBSTRING(lastNumber, 5)  // Get characters after "YYYY-"
            sequence = CONVERT_TO_INTEGER(sequencePart)
            newSequence = sequence + 1
        ELSE
            // First student of the year
            newSequence = 1
        END IF

        // Format: YYYY-####
        // Pad sequence to 4 digits with leading zeros
        sequenceStr = PAD_LEFT(newSequence, 4, "0")
        studentNumber = currentYear + "-" + sequenceStr

        // Example outputs:
        // 2026-0001, 2026-0002, ... 2026-0999, 2026-1000

        DATABASE.COMMIT_TRANSACTION()

        RETURN studentNumber

    CATCH error:
        DATABASE.ROLLBACK_TRANSACTION()
        THROW error "Failed to generate student number"
    END TRY
END FUNCTION
```

---

## 4.6.6 Password Hashing and Verification

```pseudocode
FUNCTION hashPassword(plainPassword):
    // Use bcrypt with salt rounds = 10
    // bcrypt automatically generates salt
    saltRounds = 10
    hashedPassword = BCRYPT.hash(plainPassword, saltRounds)

    // Returns something like:
    // "$2b$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGH"

    RETURN hashedPassword
END FUNCTION

FUNCTION verifyPassword(plainPassword, hashedPassword):
    // bcrypt.compare extracts salt from hash and compares
    isMatch = BCRYPT.compare(plainPassword, hashedPassword)

    RETURN isMatch  // true or false
END FUNCTION

FUNCTION validatePasswordStrength(password):
    errors = []

    // Check length
    IF LENGTH(password) < 8 THEN
        ADD errors "Password must be at least 8 characters"
    END IF

    // Check for uppercase
    IF NOT CONTAINS_UPPERCASE(password) THEN
        ADD errors "Password must contain at least one uppercase letter"
    END IF

    // Check for lowercase
    IF NOT CONTAINS_LOWERCASE(password) THEN
        ADD errors "Password must contain at least one lowercase letter"
    END IF

    // Check for number
    IF NOT CONTAINS_NUMBER(password) THEN
        ADD errors "Password must contain at least one number"
    END IF

    // Check for special character (optional)
    IF NOT CONTAINS_SPECIAL_CHAR(password) THEN
        ADD errors "Password should contain at least one special character"
    END IF

    // Check against common passwords list
    commonPasswords = ["password", "123456", "qwerty", "admin", "welcome"]
    IF password IN commonPasswords THEN
        ADD errors "Password is too common"
    END IF

    RETURN errors  // Empty array if valid
END FUNCTION
```

---

## 4.6.7 File Upload Validation

```pseudocode
FUNCTION validateFileUpload(file, maxSizeBytes, allowedTypes):
    // Step 1: Check if file exists
    IF file is null THEN
        RETURN error "No file provided"
    END IF

    // Step 2: Check file size (max 5MB = 5242880 bytes)
    IF file.size > maxSizeBytes THEN
        sizeMB = maxSizeBytes / 1024 / 1024
        RETURN error "File size exceeds maximum allowed size of " + sizeMB + "MB"
    END IF

    // Step 3: Check file type
    fileExtension = GET_FILE_EXTENSION(file.name).toLowerCase()
    mimeType = file.mimeType

    validExtensions = ["pdf", "jpg", "jpeg", "png"]
    validMimeTypes = ["application/pdf", "image/jpeg", "image/png"]

    IF fileExtension NOT IN validExtensions OR mimeType NOT IN validMimeTypes THEN
        RETURN error "Invalid file type. Allowed: PDF, JPG, PNG"
    END IF

    // Step 4: Sanitize filename (remove special characters)
    safeFilename = SANITIZE_FILENAME(file.name)

    // Step 5: Generate unique filename to prevent collisions
    uniqueId = GENERATE_UUID()
    timestamp = CURRENT_TIMESTAMP()
    newFilename = uniqueId + "_" + timestamp + "." + fileExtension

    // Step 6: Determine storage path
    storagePath = "/uploads/" + GET_CURRENT_YEAR() + "/" + GET_CURRENT_MONTH() + "/"
    fullPath = storagePath + newFilename

    // Step 7: Scan file for viruses (optional but recommended)
    IF VIRUS_SCAN_ENABLED THEN
        scanResult = SCAN_FILE_FOR_VIRUSES(file)
        IF scanResult.infected = TRUE THEN
            LOG_SECURITY_EVENT("Malicious file upload attempt", file.name)
            RETURN error "File failed security scan"
        END IF
    END IF

    RETURN {
        valid: true,
        originalFilename: file.name,
        safeFilename: newFilename,
        storagePath: fullPath,
        fileSize: file.size,
        mimeType: mimeType
    }
END FUNCTION
```

---

# 4.7 Interface Design (Menu, Input, Output Design)

This section describes the user interface design - what users will see and interact with.

## 4.7.1 Main Menu Structure

### For Students:

```
┌────────────────────────────────────────────────┐
│  EduHub Logo              [Student Name] ▼     │
├────────────────────────────────────────────────┤
│ 🏠 Dashboard                                   │
│ 📚 Courses                                     │
│    ├─ Available Courses                       │
│    ├─ My Registered Courses                   │
│    └─ Course History                          │
│ 👤 Profile                                     │
│    ├─ Personal Information                    │
│    ├─ Emergency Contacts                      │
│    └─ Change Password                         │
│ 📄 Applications                                │
│    ├─ New Application                         │
│    └─ Application Status                      │
│ 🔔 Notifications (3)                          │
│ 🚪 Logout                                      │
└────────────────────────────────────────────────┘
```

### For Administrators:

```
┌────────────────────────────────────────────────┐
│  EduHub Logo              [Admin Name] ▼       │
├────────────────────────────────────────────────┤
│ 🏠 Dashboard                                   │
│ 📋 Applications                                │
│    ├─ Pending Applications                    │
│    ├─ All Applications                        │
│    └─ Bulk Actions                            │
│ 📚 Course Management                           │
│    ├─ All Courses                             │
│    ├─ Create Course                           │
│    └─ Assign Lecturers                        │
│ 👥 User Management                             │
│    ├─ All Users                               │
│    ├─ Role Management                         │
│    └─ Deactivate Users                        │
│ ⚙️  System Settings                            │
│    ├─ Registration Periods                    │
│    ├─ System Configuration                    │
│    └─ Email Templates                         │
│ 📊 Reports                                     │
│    ├─ Enrollment Reports                      │
│    ├─ Application Statistics                  │
│    └─ System Usage                            │
│ 📜 Audit Logs                                  │
│ 🔔 Notifications                               │
│ 🚪 Logout                                      │
└────────────────────────────────────────────────┘
```

### For Lecturers:

```
┌────────────────────────────────────────────────┐
│  EduHub Logo            [Lecturer Name] ▼      │
├────────────────────────────────────────────────┤
│ 🏠 Dashboard                                   │
│ 📚 My Courses                                  │
│ 👥 Class Rosters                               │
│ 📢 Announcements                               │
│    ├─ Post Announcement                       │
│    └─ View All                                │
│ 👤 Profile                                     │
│ 🔔 Notifications                               │
│ 🚪 Logout                                      │
└────────────────────────────────────────────────┘
```

---

## 4.7.2 Key Screen Designs

### Login Page

```
┌──────────────────────────────────────────────────────────┐
│                     EduHub Logo                          │
│                                                          │
│              Student Management System                   │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │                    Login                           │  │
│  │                                                    │  │
│  │  Email Address                                     │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │ student@example.com                          │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  │                                                    │  │
│  │  Password                                          │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │ ••••••••••••                                 │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  │                                                    │  │
│  │  ☐ Remember me                                    │  │
│  │                                                    │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │           Login                              │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  │                                                    │  │
│  │  Forgot Password?  |  Don't have an account?     │  │
│  │                       Register here               │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│              © 2026 Richfield EduHub                     │
└──────────────────────────────────────────────────────────┘
```

### Student Dashboard

```
┌──────────────────────────────────────────────────────────────────┐
│ EduHub   Dashboard   Courses   Profile   Notifications   Logout  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Welcome back, John Doe (Student #2026-0042)                    │
│                                                                  │
│  ┌────────────────────┐  ┌────────────────────┐  ┌────────────┐ │
│  │  My Courses        │  │  Notifications     │  │  Quick     │ │
│  │  ──────────────    │  │  ──────────────    │  │  Actions   │ │
│  │  CS101: Intro CS   │  │  📢 Registration   │  │            │ │
│  │  MAT201: Calculus  │  │     opens tomorrow │  │  Register  │ │
│  │  ENG101: English   │  │  ✅ Application    │  │  for       │ │
│  │                    │  │     approved!      │  │  Courses   │ │
│  │  Total: 3 courses  │  │                    │  │            │ │
│  │  (12 credits)      │  │  View All (5)      │  │  Update    │ │
│  │                    │  │                    │  │  Profile   │ │
│  └────────────────────┘  └────────────────────┘  └────────────┘ │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Important Dates                                         │   │
│  │  ──────────────────────────────────────────────────────  │   │
│  │  📅 Registration Opens: June 10, 2026                    │   │
│  │  📅 Registration Closes: June 20, 2026                   │   │
│  │  📅 Add/Drop Deadline: July 1, 2026                      │   │
│  │  📅 Semester Starts: July 15, 2026                       │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Course Registration Page

```
┌──────────────────────────────────────────────────────────────────┐
│ EduHub   Dashboard   Courses   Profile   Notifications   Logout  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Available Courses - Fall 2026                                  │
│                                                                  │
│  Search: [___________________]  Department: [All ▼]             │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  CS101 - Introduction to Computer Science               │   │
│  │  ────────────────────────────────────────────────────    │   │
│  │  Credits: 4  |  Capacity: 30/50  |  Lecturer: Dr. Smith │   │
│  │  Schedule: Mon/Wed 9:00-10:30                            │   │
│  │  Prerequisites: None                                      │   │
│  │                                                          │   │
│  │  [View Details]  [ Register ]                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  CS102 - Data Structures                                │   │
│  │  ────────────────────────────────────────────────────    │   │
│  │  Credits: 4  |  Capacity: 50/50  |  Lecturer: Dr. Jones │   │
│  │  Schedule: Tue/Thu 11:00-12:30                           │   │
│  │  Prerequisites: CS101 ⚠️ NOT MET                         │   │
│  │                                                          │   │
│  │  [View Details]  [ Register ] (disabled)                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  MAT201 - Calculus I                                     │   │
│  │  ────────────────────────────────────────────────────    │   │
│  │  Credits: 4  |  Capacity: 15/40  |  Lecturer: Prof. Lee │   │
│  │  Schedule: Mon/Wed 14:00-15:30                           │   │
│  │  Prerequisites: None                                      │   │
│  │                                                          │   │
│  │  [View Details]  [ Register ]                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Currently Registered: 2 courses (8 credits)                    │
│  Remaining Credits Available: 12                                 │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Application Form (Multi-step)

**Step 1: Personal Information**

```
┌──────────────────────────────────────────────────────────┐
│  New Application - Step 1 of 3                          │
│  ════════════════════════════════════════════════════    │
│  ● Personal Information   ○ Program Selection   ○ Upload │
│                                                          │
│  First Name *                                            │
│  ┌────────────────────────────────────────────────────┐  │
│  │ John                                               │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  Last Name *                                             │
│  ┌────────────────────────────────────────────────────┐  │
│  │ Doe                                                │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ID Number *                                             │
│  ┌────────────────────────────────────────────────────┐  │
│  │ 9001015800084                                      │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  Date of Birth *                                         │
│  ┌────────────────────────────────────────────────────┐  │
│  │ 📅 01/15/1990                                      │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  Email *                                                 │
│  ┌────────────────────────────────────────────────────┐  │
│  │ john.doe@example.com                               │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  Phone Number *                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │ +27 12 345 6789                                    │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  Address *                                               │
│  ┌────────────────────────────────────────────────────┐  │
│  │ 123 Main Street, Johannesburg, 2000                │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  [Save as Draft]              [Next: Program Selection] │
└──────────────────────────────────────────────────────────┘
```

---

## 4.7.3 Input Design Standards

### Form Field Standards:

1. **Required Fields**: Marked with red asterisk (\*)
2. **Field Validation**: Real-time validation with error messages below field
3. **Input Formats**:
   - Dates: YYYY-MM-DD or DD/MM/YYYY with date picker
   - Phone: +27 XX XXX XXXX format
   - Email: Standard email format validation
   - ID Number: 13 digits for SA ID numbers
   - Student Number: YYYY-#### format (read-only, generated)

### Error Message Format:

```
❌ Email is required
❌ Invalid email format
❌ ID number must be exactly 13 digits
✅ Valid input
```

### Button States:

- **Primary Action**: Blue background, white text
- **Secondary Action**: Gray background, dark text
- **Disabled**: Gray background, light gray text, no hover
- **Hover**: Slightly darker background
- **Loading**: Show spinner, disable button

---

## 4.7.4 Output Design

### Report Format (Enrollment Report Example):

```
┌──────────────────────────────────────────────────────────┐
│  RICHFIELD EDUHUB - ENROLLMENT REPORT                    │
│  Semester: Fall 2026                                     │
│  Generated: 2026-06-08 14:30                             │
│  Generated by: Admin User                                │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  SUMMARY STATISTICS                                      │
│  ─────────────────────────────────────────────────────   │
│  Total Students: 1,247                                   │
│  Total Courses: 85                                       │
│  Total Registrations: 4,523                              │
│  Average Credits per Student: 15.2                       │
│                                                          │
│  ENROLLMENT BY PROGRAM                                   │
│  ─────────────────────────────────────────────────────   │
│  Computer Science:        287 students (23%)             │
│  Business Administration: 312 students (25%)             │
│  Engineering:             198 students (16%)             │
│  Other Programs:          450 students (36%)             │
│                                                          │
│  TOP 5 MOST ENROLLED COURSES                             │
│  ─────────────────────────────────────────────────────   │
│  1. CS101 - Intro to CS           50/50 (100%)          │
│  2. MAT201 - Calculus I           48/50 (96%)           │
│  3. ENG101 - English              45/50 (90%)           │
│  4. BUS201 - Marketing            42/45 (93%)           │
│  5. PHY101 - Physics              40/40 (100%)          │
│                                                          │
│  [Export to PDF]  [Export to CSV]  [Print]              │
└──────────────────────────────────────────────────────────┘
```

### Notification Formats:

**Success Notification**:

```
┌────────────────────────────────────────┐
│ ✅ Success                             │
│ Application submitted successfully!    │
│ Application ID: APP-2026-1234          │
│ [View Application]  [Dismiss]          │
└────────────────────────────────────────┘
```

**Error Notification**:

```
┌────────────────────────────────────────┐
│ ❌ Error                               │
│ Failed to register for course          │
│ Reason: Course is full                 │
│ [View Available Courses]  [Dismiss]    │
└────────────────────────────────────────┘
```

**Warning Notification**:

```
┌────────────────────────────────────────┐
│ ⚠️  Warning                            │
│ Registration closes in 2 days!         │
│ [Register Now]  [Dismiss]              │
└────────────────────────────────────────┘
```

---

# 4.8 Security and Backup Design

This section describes how we'll keep the system and data secure, and how we'll recover from failures.

## 4.8.1 Security Design

### Authentication Security

**Password Security**:

- Passwords hashed using **bcrypt** with salt rounds = 10
- Never store passwords in plain text
- Password requirements:
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
  - At least 1 special character (recommended)
- Failed login attempts tracked:
  - After 5 failed attempts, account temporarily locked for 15 minutes
  - After 10 failed attempts, account locked until admin unlocks

**Token Security**:

- JWT (JSON Web Tokens) used for session management
- Tokens stored in httpOnly cookies (not accessible via JavaScript)
- Token expiry: 24 hours
- Refresh tokens not implemented in MVP (future enhancement)
- Tokens include:
  - userId
  - email
  - role
  - issued at timestamp
  - expiry timestamp

**Multi-Factor Authentication (MFA)**:

- Optional for users, required for admins
- Uses TOTP (Time-based One-Time Password)
- Compatible with Google Authenticator, Authy
- Backup codes provided (10 single-use codes)

### Authorization Security

**Role-Based Access Control (RBAC)**:

| Role          | Permissions                                                                                                                                                                    |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Applicant** | - Submit applications<br>- View own application status<br>- Upload documents                                                                                                   |
| **Student**   | - All Applicant permissions<br>- Register for courses<br>- View registered courses<br>- Drop courses<br>- Update profile<br>- View notifications                               |
| **Lecturer**  | - View assigned courses<br>- View class rosters<br>- Post announcements<br>- Export student lists                                                                              |
| **Admin**     | - All permissions<br>- Approve/reject applications<br>- Create/edit/delete courses<br>- Manage users<br>- Configure system settings<br>- View audit logs<br>- Generate reports |
| **Alumni**    | - View transcript (future)<br>- Update contact info (future)                                                                                                                   |

**API Endpoint Protection**:

```
Every API request must include:
1. Valid JWT token in Authorization header
2. Role check: Does user's role have permission?
3. Ownership check: Can user access this specific resource?

Example:
GET /api/students/12345/profile
- Check: Is user logged in? (valid token)
- Check: Is user's role Student/Admin?
- Check: Is userId = 12345 OR is user Admin?
```

### Data Security

**Encryption**:

- **Data in Transit**: All communications use HTTPS/TLS 1.3
- **Data at Rest**:
  - Passwords: Bcrypt hashed
  - Sensitive fields (ID numbers): AES-256 encryption (future enhancement)
  - Database backups: Encrypted before storage

**SQL Injection Prevention**:

- Use **Sequelize ORM** - automatically parameterizes queries
- Never concatenate user input into SQL queries
- Example (WRONG):
  ```sql
  query = "SELECT * FROM users WHERE email = '" + userInput + "'"
  ```
- Example (CORRECT):
  ```javascript
  User.findOne({ where: { email: userInput } });
  ```

**XSS (Cross-Site Scripting) Prevention**:

- React automatically escapes output (prevents XSS)
- Sanitize HTML content if allowing rich text
- Set CSP (Content Security Policy) headers
- Validate and sanitize all user inputs

**CSRF (Cross-Site Request Forgery) Prevention**:

- Use CSRF tokens for state-changing operations
- SameSite cookie attribute set to "Strict"
- Verify Origin/Referer headers

**File Upload Security**:

- Validate file type (check MIME type AND extension)
- Limit file size (max 5MB)
- Scan files for viruses (ClamAV integration recommended)
- Store files outside web root
- Generate random filenames to prevent path traversal
- Never execute uploaded files

### Network Security

**Firewall Rules**:

```
ALLOW: Port 443 (HTTPS) from anywhere
ALLOW: Port 80 (HTTP) - redirect to 443
DENY:  Port 5432 (PostgreSQL) from internet
ALLOW: Port 5432 from application servers only
DENY:  All other ports
```

**DDoS Protection**:

- Use Cloudflare or similar CDN
- Rate limiting: Max 100 requests per minute per IP
- Implement request throttling

**Security Headers**:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
```

---

## 4.8.2 Backup Design

### Backup Strategy

**Database Backups**:

1. **Full Backups**:
   - Frequency: Daily at 2:00 AM (low traffic time)
   - Retention: 30 days
   - Storage location: Separate server/cloud storage
   - Encryption: Yes, AES-256
   - Compression: Yes, gzip

2. **Incremental Backups**:
   - Frequency: Every 6 hours
   - Retention: 7 days
   - Only backs up changes since last backup

3. **Transaction Log Backups**:
   - Frequency: Every hour
   - Retention: 24 hours
   - Enables point-in-time recovery

**Backup Script (Pseudocode)**:

```bash
#!/bin/bash
# Daily backup script

# Set variables
DATE=$(date +%Y-%m-%d)
BACKUP_DIR="/backups/database"
DB_NAME="eduhub"
DB_USER="backup_user"

# Create backup
pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/eduhub_$DATE.sql.gz

# Encrypt backup
openssl enc -aes-256-cbc -in $BACKUP_DIR/eduhub_$DATE.sql.gz \
    -out $BACKUP_DIR/eduhub_$DATE.sql.gz.enc -k $ENCRYPTION_KEY

# Upload to cloud storage
aws s3 cp $BACKUP_DIR/eduhub_$DATE.sql.gz.enc s3://eduhub-backups/

# Delete local backup older than 7 days
find $BACKUP_DIR -name "*.enc" -mtime +7 -delete

# Log completion
echo "Backup completed: $DATE" >> /var/log/backup.log
```

**File Storage Backups**:

- Frequency: Daily
- Method: Rsync to backup server
- Retention: 30 days
- Includes: Uploaded documents (applications, profile photos)

**Code Backups**:

- Version control: Git repository
- Remote backup: GitHub/GitLab
- Branch protection: Main branch protected
- Backup frequency: Continuous (every git push)

### Disaster Recovery Plan

**Recovery Time Objective (RTO)**: 4 hours

- Maximum acceptable downtime after disaster

**Recovery Point Objective (RPO)**: 1 hour

- Maximum acceptable data loss

**Disaster Recovery Steps**:

1. **Detect Failure**:
   - Monitoring system alerts (uptime monitoring, error rate spike)
   - Manual notification from users

2. **Assess Damage**:
   - Is it hardware failure, software bug, or data corruption?
   - What data/services are affected?

3. **Activate Disaster Recovery**:
   - Switch to backup server if available
   - Restore from latest backup

4. **Database Restore Procedure**:

```bash
# Step 1: Download encrypted backup from cloud
aws s3 cp s3://eduhub-backups/eduhub_2026-06-07.sql.gz.enc /restore/

# Step 2: Decrypt backup
openssl enc -d -aes-256-cbc -in /restore/eduhub_2026-06-07.sql.gz.enc \
    -out /restore/eduhub_2026-06-07.sql.gz -k $ENCRYPTION_KEY

# Step 3: Decompress
gunzip /restore/eduhub_2026-06-07.sql.gz

# Step 4: Restore to database
psql -U postgres $DB_NAME < /restore/eduhub_2026-06-07.sql

# Step 5: Verify data integrity
# Run verification queries

# Step 6: Bring system online
```

5. **Verify Restore**:
   - Check critical functions (login, registration, etc.)
   - Verify recent data exists
   - Test all major workflows

6. **Communicate**:
   - Notify users system is back online
   - Inform about any data loss (e.g., "Last 2 hours of data recovered from backup")

7. **Post-Mortem**:
   - Document what went wrong
   - Implement measures to prevent recurrence

### Backup Testing

**Monthly Backup Test**:

- Restore latest backup to test environment
- Verify all data intact
- Test application functionality
- Document results
- Time the restore process

**Annual Disaster Recovery Drill**:

- Simulate complete system failure
- Practice full recovery procedure
- Involve all team members
- Update DR plan based on findings

---

# Conclusion

The System Design Phase has provided a complete blueprint for building the EduHub system:

## What We've Designed:

1. **System Architecture** - Three-tier architecture with React frontend, Node.js backend, PostgreSQL database
2. **Technology Stack** - Modern, scalable technologies suitable for Richfield's needs
3. **Database Design** - 10 tables with detailed schemas, relationships, and constraints
4. **Program Logic** - Pseudocode for all critical processes (login, registration, approvals)
5. **User Interface** - Screen designs, menu structures, input/output formats
6. **Security Measures** - Authentication, authorization, encryption, input validation
7. **Backup Strategy** - Daily backups, disaster recovery plan, tested procedures

## Design Principles Applied:

- ✅ **User-centered**: Designed for actual users (students, lecturers, admin)
- ✅ **Secure by design**: Security built in from the start
- ✅ **Scalable**: Can grow from 1,000 to 10,000+ students
- ✅ **Maintainable**: Clear separation of concerns, well-documented
- ✅ **Testable**: Modular design enables thorough testing

## Next Phase:

**Phase 5 (Implementation)** will take these designs and turn them into working code:

- Build the database using the schemas designed
- Implement the backend API using the pseudocode as a guide
- Create the frontend interfaces based on the screen designs
- Implement security measures as specified
- Set up backup systems

The design is complete, tested, and ready for implementation!

---

**Document Status**: System Design Phase Complete
**Next Phase**: Implementation Phase (Due: June 29, 2026)
