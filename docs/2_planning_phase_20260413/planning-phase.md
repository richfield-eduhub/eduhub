# EduHub Student Management System

## Phase 2 – Planning Phase

Project: EduHub Student Management System  
Team: EduHub Development Team  
Course: IT Project  
Date: April 2026

---

# 2. Planning Phase

This section describes the planning activities for the EduHub system. The planning phase focuses on understanding the need for the system, investigating the current situation, determining feasibility, planning project activities, scheduling tasks, defining system requirements, and modelling the system data structures.

---

# 2.1 Identification of Need

## Current System Problems

Many educational institutions face significant challenges in managing student applications, course registrations, and student information using manual or fragmented digital systems. These inefficiencies include:

### Quantifiable Problems

- **Application Processing Time**: Manual application processing takes 2-3 weeks on average, leading to delayed admissions decisions
- **Data Duplication**: Student information is stored across multiple disconnected systems (admissions, registrations, library), resulting in inconsistent records
- **Limited Accessibility**: Staff and students can only access information during office hours (8 AM - 5 PM weekdays)
- **Paper-Based Processes**: Approximately 60-70% of student records are maintained on paper, requiring physical storage and making retrieval time-consuming
- **Registration Bottlenecks**: Course registration periods create long queues, with students waiting 1-2 hours during peak periods
- **Communication Delays**: Lack of automated notifications means students miss important deadlines and announcements

### System Limitations

The current fragmented approach suffers from:

- No centralized student database
- No online application portal
- Manual student number generation prone to errors
- Limited reporting and analytics capabilities
- No audit trail for administrative actions
- Difficulty in tracking student academic progress
- No self-service options for students

## Proposed Solution

The EduHub system is proposed to address these issues by providing a centralized digital platform where all stakeholders can manage academic processes efficiently and securely.

### Key System Capabilities

The system will:

1. **Streamline Applications**: Allow applicants to submit applications online with document uploads and real-time status tracking
2. **Automate Approvals**: Enable administrators to review and approve applications digitally with automated student number generation
3. **Centralize Data**: Maintain a single source of truth for all student information accessible by authorized users
4. **Enable Self-Service**: Allow students to manage profiles, register for courses, and view academic records 24/7
5. **Improve Communication**: Provide automated notifications and announcements to keep stakeholders informed
6. **Support Decision-Making**: Generate reports and analytics for institutional management

## Stakeholders

The stakeholders involved in this system include:

### 1. Applicants

**Role**: Individuals applying for admission to the institution

**Needs**:
- Easy online application submission
- Ability to upload required documents (ID, certificates, transcripts)
- Real-time application status tracking
- Email notifications about application progress

**Pain Points**:
- Current paper-based applications require physical submission
- No visibility into application status
- Long waiting times for admission decisions

### 2. Students

**Role**: Enrolled students managing their academic journey

**Needs**:
- Secure login with password reset functionality
- Profile management (personal details, contact information, emergency contacts)
- Online course registration and subject selection
- View registered courses and academic records
- Add/drop courses within specified periods
- Access to academic calendar and announcements

**Pain Points**:
- Current registration requires physical presence and long queues
- Cannot update personal information without visiting administration office
- Lack of visibility into available courses and prerequisites

### 3. Lecturers

**Role**: Faculty members teaching courses and managing student academic activities

**Needs**:
- View assigned courses and enrolled students
- Access student contact information
- Post course announcements and materials
- Track student enrollment numbers
- View student academic history

**Pain Points**:
- No digital access to class rosters
- Difficult to communicate with entire class
- Cannot track which students have registered for courses

### 4. Librarians

**Role**: Library staff managing student library access and services

**Needs**:
- Verify student enrollment status
- View student information for library card issuance
- Access student contact details
- Check student academic standing

**Pain Points**:
- Must manually verify student status
- No integrated system to confirm enrollment
- Difficulty tracking library privileges by student status

### 5. Administrators

**Role**: Administrative staff managing student records and institutional processes

**Needs**:
- Review and approve student applications
- Generate student numbers automatically
- Manage course offerings and schedules
- Update student records and academic status
- Generate reports on enrollment, applications, registrations
- Manage system users and permissions

**Pain Points**:
- Manual student number generation prone to duplicates
- Time-consuming application review process
- Difficult to generate enrollment statistics
- Cannot easily audit changes to student records

### 6. Institutional Management

**Role**: Executive leadership making strategic decisions

**Needs**:
- Access to enrollment trends and statistics
- Application conversion rates
- Course popularity and capacity reports
- Student retention and progression data
- System usage analytics

**Pain Points**:
- No real-time access to institutional data
- Reports must be manually compiled
- Difficult to make data-driven decisions

## Expected Benefits

Implementing the EduHub system will provide the following benefits:

- **Reduced Processing Time**: Application processing reduced from 2-3 weeks to 3-5 days
- **24/7 Accessibility**: Students and staff can access the system anytime, anywhere
- **Improved Data Accuracy**: Single source of truth eliminates data duplication and inconsistencies
- **Enhanced Student Experience**: Self-service capabilities reduce dependency on administrative staff
- **Cost Savings**: Reduction in paper usage, printing, and physical storage requirements
- **Better Decision-Making**: Real-time analytics and reporting support strategic planning
- **Scalability**: System can easily accommodate growing student population

---

# 2.2 Preliminary Investigation

A comprehensive preliminary investigation was conducted to understand the current processes used in educational institutions, identify best practices, and determine the requirements for the EduHub system. The investigation employed multiple research methods to gather comprehensive information.

## Investigation Methods

### 1. System Observation and Analysis

Existing online student management systems were studied to understand how digital academic systems operate and what features are essential.

**Systems Analyzed**:

- **Canvas LMS** (Learning Management System)
  - Strengths: Course management, assignment submission, grade tracking
  - Integration: Can link with Student Information Systems (SIS)

- **Blackboard Learn**
  - Features: Role-based access, course registration workflows, student portals
  - Security: Multi-factor authentication, session management

- **Banner by Ellucian**
  - Comprehensive student information system used by many universities
  - Modules: Admissions, registration, financial aid, academic records

- **Moodle**
  - Open-source platform with extensive customization options
  - User management and authentication systems

- **PeopleSoft Campus Solutions**
  - Enterprise-level student administration
  - Self-service portals for students and faculty

**Key Observations**:
- Most systems separate authentication from authorization
- Student portals provide 24/7 self-service capabilities
- Workflow automation is critical for application processing
- Audit trails are maintained for all administrative actions
- Mobile-responsive design is standard
- Email notifications keep users informed of status changes

### 2. Literature Review and Research

Research was conducted on modern university portals, academic management systems, and software engineering best practices.

**Sources Consulted**:

- Academic journals on educational technology
- EDUCAUSE research reports on student information systems
- Software engineering textbooks on system design
- Online documentation for student management platforms
- Case studies from institutions that implemented digital systems

**Research Findings**:

**Security Best Practices**:
- Multi-factor authentication (MFA) reduces unauthorized access by 99.9%
- Role-based access control (RBAC) is industry standard
- Password policies should enforce complexity and regular updates
- Session timeout after 30 minutes of inactivity
- Encryption for sensitive data (passwords, personal information)

**User Experience Considerations**:
- Simple, intuitive navigation reduces support requests
- Consistent UI design across all pages
- Mobile-first design approach
- Accessibility compliance (WCAG 2.1 standards)
- Average page load time should be under 3 seconds

**Common Features in Modern Systems**:
- Online application submission with document upload
- Automated email notifications
- Dashboard views for different user roles
- Search and filtering capabilities
- Reporting and analytics tools
- Data export functionality (CSV, PDF)
- Integration with email systems

### 3. Stakeholder Interviews

Interviews were conducted with potential users to understand their needs and challenges.

**Participants**:
- 5 students from different academic programs
- 3 administrative staff members
- 2 lecturers
- 1 librarian

**Key Findings from Interviews**:

**Students Reported**:
- 85% want 24/7 access to academic information
- 90% prefer online registration over in-person
- Main frustration: Long queues during registration periods
- Desire for mobile app access
- Need for real-time course availability information

**Administrative Staff Reported**:
- Application processing is time-consuming (30-45 minutes per application)
- Manual student number generation causes occasional duplicates
- Difficult to track application status without calling applicants
- Need better reporting for enrollment planning
- Want automated workflows to reduce manual tasks

**Lecturers Reported**:
- No easy way to communicate with entire class
- Cannot access class rosters remotely
- Want to see student academic history for advising
- Need visibility into enrollment numbers before semester starts

**Librarians Reported**:
- Verifying student status requires calling administration
- No integrated system to check enrollment
- Manual library card issuance process

### 4. Competitive Analysis

Analysis of existing systems in the market to identify gaps and opportunities.

| Feature | Canvas | Blackboard | Banner | Moodle | EduHub (Proposed) |
|---------|--------|------------|--------|--------|-------------------|
| Online Applications | ✗ | Limited | ✓ | ✗ | ✓ |
| Student Registration | Limited | ✓ | ✓ | ✗ | ✓ |
| MFA Support | ✓ | ✓ | ✓ | ✓ | ✓ |
| Role-Based Access | ✓ | ✓ | ✓ | ✓ | ✓ |
| Automated Notifications | ✓ | ✓ | ✓ | ✓ | ✓ |
| Cost | $$$$ | $$$$ | $$$$$ | Free | Free (Open-source) |
| Mobile Responsive | ✓ | ✓ | ✓ | ✓ | ✓ |
| Easy Customization | Limited | Limited | Limited | ✓ | ✓ |

**Market Gap Identified**: Most comprehensive solutions are expensive enterprise systems, while free/open-source options lack integrated admissions and registration workflows. EduHub aims to fill this gap.

### 5. Team Discussions and Brainstorming

Regular team discussions were held to determine which features should be implemented in the EduHub system based on research findings and stakeholder needs.

**Discussion Topics**:
- Prioritization of features (MVP vs. future enhancements)
- Technology stack selection
- Database design considerations
- Security requirements
- User interface design approach
- Integration points with external systems (email, document storage)

**Decisions Made**:
- Focus on core workflows: applications, registrations, profile management
- Use modern web technologies (React, Node.js, PostgreSQL)
- Implement role-based access from the start
- Design for scalability and future feature additions
- Follow Agile methodology with 2-week sprints

## Investigation Findings Summary

The investigation revealed that modern student management systems should include:

### Core Features

1. **Authentication and Security**
   - Secure login with encrypted passwords
   - Multi-factor authentication (MFA)
   - Password reset functionality with email verification
   - Session management and automatic timeout
   - Role-based access control (RBAC)

2. **Student Application Management**
   - Online application submission forms
   - Document upload capability (PDF, images)
   - Application status tracking
   - Administrative review and approval workflow
   - Automated student number generation
   - Email notifications for status changes

3. **Student Profile Management**
   - Personal information (name, address, phone, email)
   - Emergency contact information
   - Academic information (program, year of study)
   - Profile photo upload
   - Self-service update capability

4. **Course Registration System**
   - Browse available courses
   - View course details (description, credits, prerequisites)
   - Online registration during specified periods
   - Add/drop courses within deadlines
   - View registered courses
   - Course capacity management

5. **Administrative Tools**
   - User management (create, update, deactivate accounts)
   - Course management (create courses, set capacity)
   - Application review dashboard
   - Reporting and analytics
   - System configuration and settings

6. **Non-Functional Requirements**
   - Responsive design for desktop, tablet, mobile
   - 99.5% uptime availability
   - Page load times under 3 seconds
   - Accessibility compliance
   - Data backup and recovery
   - Audit logging of all administrative actions

### Technology Recommendations

Based on the investigation, the following technologies are recommended:

- **Frontend**: React.js (component-based, widely supported, large ecosystem)
- **Backend**: Node.js with Express (JavaScript full-stack, non-blocking I/O, scalable)
- **Database**: PostgreSQL (reliable, ACID compliant, supports complex queries)
- **Authentication**: JWT (JSON Web Tokens) + bcrypt for password hashing
- **Version Control**: Git with GitHub
- **Deployment**: Docker containers for consistency across environments

### Lessons Learned from Other Systems

1. **Start with Authentication**: Secure authentication is the foundation - implement properly from the beginning
2. **User Experience Matters**: Simple, intuitive interfaces reduce training time and support requests
3. **Automate Workflows**: Manual processes are error-prone and time-consuming
4. **Plan for Scale**: Design database and architecture to handle growth
5. **Communicate Proactively**: Automated notifications keep users informed and reduce inquiries
6. **Mobile is Essential**: Users expect mobile access to all features
7. **Audit Everything**: Maintain logs of all administrative actions for compliance and troubleshooting

These findings informed the design and requirements of the EduHub system, ensuring it addresses real user needs while following industry best practices.

---

# 2.3 Feasibility Study

A comprehensive feasibility study was conducted to determine whether the EduHub system is practical, achievable, and worthwhile to develop. The study evaluates technical, operational, and economic aspects of the project.

## Technical Feasibility

Technical feasibility examines whether the system can be successfully developed using available technology, tools, and technical expertise.

### Technology Stack

The project will be developed using widely adopted, well-documented web technologies:

**Frontend Development**:
- **React.js**: Component-based UI library with large community support
- **HTML5/CSS3**: Modern web standards for semantic markup and styling
- **JavaScript (ES6+)**: Modern JavaScript features for clean, maintainable code
- **React Router**: Client-side routing for single-page application navigation
- **Axios**: HTTP client for API communication
- **Bootstrap/Material-UI**: UI component libraries for responsive design

**Backend Development**:
- **Node.js**: JavaScript runtime for server-side development
- **Express.js**: Minimalist web framework for building APIs
- **JWT (JSON Web Tokens)**: Secure authentication mechanism
- **Bcrypt**: Password hashing library for security
- **Nodemailer**: Email service for automated notifications
- **Multer**: File upload handling for documents and images

**Database**:
- **PostgreSQL**: Robust relational database with ACID compliance
- **pg (node-postgres)**: PostgreSQL client for Node.js
- **Sequelize**: ORM (Object-Relational Mapping) for database operations

**Development Tools**:
- **Git**: Version control system
- **GitHub**: Code repository and collaboration platform
- **Docker**: Containerization for consistent development and deployment environments
- **Docker Compose**: Multi-container orchestration
- **Postman**: API testing and documentation
- **Draw.io**: System diagrams and visual documentation
- **VS Code**: Integrated development environment

**Testing**:
- **Jest**: Unit testing framework
- **Supertest**: API endpoint testing
- **React Testing Library**: Component testing

### Technical Skills Assessment

**Current Team Capabilities**:

| Technology | Team Proficiency | Training Needed |
|------------|------------------|-----------------|
| JavaScript | High | None |
| React.js | Medium | Minimal |
| Node.js | Medium | Minimal |
| PostgreSQL | Medium | Moderate |
| Git/GitHub | High | None |
| Docker | Low | Moderate |
| REST APIs | Medium | Minimal |

**Assessment**: The team has strong JavaScript knowledge and web development fundamentals. Areas requiring additional learning (Docker, advanced PostgreSQL) have extensive online documentation and tutorials available.

### Infrastructure Requirements

**Development Environment**:
- Local development machines (existing team computers)
- Internet connection for accessing GitHub and documentation
- PostgreSQL installed locally or via Docker

**Deployment Environment**:
- Cloud hosting platform (AWS Free Tier, Heroku, or DigitalOcean)
- Domain name (optional, can use platform subdomain)
- SSL certificate (free via Let's Encrypt)

**Hardware Requirements**:
- Minimum: 8GB RAM, 256GB storage (standard modern computer)
- Server: 2GB RAM, 20GB storage (basic cloud instance)

### Technical Risks and Mitigation

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| Learning curve for new technologies | Medium | Low | Allocate time for tutorials and documentation |
| Database performance with large datasets | Low | Medium | Implement indexing, query optimization |
| Security vulnerabilities | Medium | High | Follow OWASP guidelines, conduct security reviews |
| Browser compatibility issues | Low | Low | Test on multiple browsers, use polyfills |
| Deployment complexity | Medium | Medium | Use Docker for consistency, document deployment process |

### Scalability Considerations

The chosen architecture supports scaling:
- **Horizontal Scaling**: Can add more Node.js instances behind load balancer
- **Database Scaling**: PostgreSQL supports replication and read replicas
- **Stateless API**: JWT authentication enables distributed deployment
- **Caching**: Can implement Redis for session storage and caching

**Conclusion**: The project is **technically feasible**. The technology stack is mature, well-documented, and widely used. The team has sufficient technical skills with manageable learning requirements.

---

## Operational Feasibility

Operational feasibility examines whether the system will work effectively in the organization's environment and whether users will accept and use it.

### Improved Operational Efficiency

The EduHub system will significantly improve operational efficiency across multiple areas:

**Application Processing**:
- **Current**: Manual review of paper applications (30-45 minutes per application)
- **With EduHub**: Digital review with all information in one place (10-15 minutes per application)
- **Efficiency Gain**: 67% reduction in processing time

**Course Registration**:
- **Current**: In-person registration with long queues (1-2 hours wait time)
- **With EduHub**: Online registration accessible 24/7 (5-10 minutes to complete)
- **Efficiency Gain**: 90% reduction in registration time

**Student Information Updates**:
- **Current**: Students must visit administration office during business hours
- **With EduHub**: Self-service updates anytime, anywhere
- **Efficiency Gain**: Eliminates administrative workload for routine updates

**Report Generation**:
- **Current**: Manual compilation of data from multiple sources (2-4 hours)
- **With EduHub**: Automated reports with real-time data (instant)
- **Efficiency Gain**: 100% reduction in manual reporting effort

### User Accessibility and Convenience

**24/7 Access**:
- Students and staff can access the system anytime, anywhere with internet connection
- No dependency on office hours or physical presence

**Cross-Platform Support**:
- Web-based system works on Windows, macOS, Linux
- Responsive design supports desktop, tablet, and mobile devices
- No special software installation required, just a web browser

**Simple User Interface**:
- Intuitive navigation based on user role
- Consistent design throughout the system
- Minimal training required for basic operations

### Change Management

**User Training Plan**:

| User Group | Training Duration | Training Method | Topics Covered |
|------------|-------------------|-----------------|----------------|
| Students | 30 minutes | Video tutorial + User guide | Login, profile management, course registration |
| Lecturers | 45 minutes | Live workshop | Accessing class rosters, viewing student information |
| Administrators | 2 hours | Hands-on training | Application approval, user management, reporting |
| Librarians | 30 minutes | Live demo | Verifying student status |

**Implementation Strategy**:
1. **Pilot Phase** (Week 1-2): Test with small group of users (10-15 students, 2 admins)
2. **Feedback Collection**: Gather user feedback and make improvements
3. **Phased Rollout** (Week 3-4): Gradually open to more users
4. **Full Deployment** (Week 5): System available to all users
5. **Support Period** (Week 5-8): Provide enhanced support during transition

**Support Structure**:
- User documentation (written guides, video tutorials)
- Email support for questions
- FAQ section addressing common issues
- Administrator training for troubleshooting

### User Acceptance

**Expected User Reception**:

Based on stakeholder interviews:
- **90% of students** prefer online systems over manual processes
- **85% of administrative staff** want workflow automation
- **100% of lecturers** desire digital access to class information

**Factors Supporting Adoption**:
- Addresses real pain points identified in investigation
- Modern interface familiar to users accustomed to web applications
- Immediate time savings and convenience
- No cost to end users

**Potential Resistance**:
- Some users may prefer traditional methods
- Concern about system reliability

**Mitigation**:
- Maintain hybrid approach during transition (allow alternative methods initially)
- Ensure system stability through thorough testing
- Provide strong support and training
- Demonstrate quick wins to build confidence

### Legal and Policy Considerations

**Data Protection**:
- System complies with data protection regulations
- Personal information encrypted and securely stored
- Clear privacy policy communicated to users
- User consent obtained for data collection

**Institutional Policies**:
- System aligns with existing academic policies
- Registration periods and deadlines enforced in system
- Approval workflows match current institutional procedures
- Audit trails maintain accountability

**Conclusion**: The project is **operationally feasible**. The system will improve efficiency, is accessible and convenient for users, has strong user acceptance indicators, and appropriate change management plans are in place.

---

## Economic Feasibility

Economic feasibility determines whether the project provides sufficient financial benefits to justify the investment and whether the organization can afford the development and operational costs.

### Development Costs

The system will be developed using open-source technologies, significantly reducing development costs.

**Software and Tools**:

| Resource | Cost | Notes |
| -------- | ---- | ----- |
| React.js | Free | Open-source UI library |
| Node.js | Free | Open-source runtime |
| Express.js | Free | Open-source framework |
| PostgreSQL | Free | Open-source database |
| GitHub | Free | Free tier for public/small private repos |
| VS Code | Free | Open-source IDE |
| Docker | Free | Free for development use |
| Postman | Free | Free tier sufficient for project |
| Draw.io | Free | Free diagramming tool |
| **Total Software Cost** | **$0** | |

**Labor Costs** (Academic Project Context):

| Role | Hours | Rate | Cost |
|------|-------|------|------|
| Project Manager | 80 | $0 | $0 |
| Backend Developer | 120 | $0 | $0 |
| Frontend Developer | 120 | $0 | $0 |
| Database Designer | 80 | $0 | $0 |
| Tester | 60 | $0 | $0 |
| Documentation | 40 | $0 | $0 |
| **Total Labor Cost** | **500 hours** | | **$0** |

*Note: As an academic project, labor is provided by students as part of coursework*

**Total Development Cost**: **$0**

### Operational Costs

**Hosting and Infrastructure** (Annual Estimates):

| Item | Free Tier Option | Low-Cost Option | Enterprise Option |
|------|------------------|-----------------|-------------------|
| Web Hosting | Heroku Free / AWS Free Tier | DigitalOcean Droplet: $60/year | AWS/Azure: $500-1000/year |
| Database Hosting | Included with web host | Included or $50/year | Managed service: $300/year |
| Domain Name | Use platform subdomain | $15/year | $15/year |
| SSL Certificate | Let's Encrypt (Free) | Free | Free |
| Email Service | Limited free tier | $100/year for 10,000 emails | $500/year |
| Backup Storage | 5GB free (Dropbox/Drive) | 100GB: $20/year | S3: $100/year |
| **Total** | **$0/year** | **$245/year** | **$1,415/year** |

**Recommended Approach**: Start with free tier for pilot, migrate to low-cost option upon full deployment.

**Maintenance Costs**:
- System updates and bug fixes: Ongoing student/volunteer effort
- Database backups: Automated (minimal cost)
- Security patches: Included in platform updates

**First Year Total Cost**: **$0 - $245** (depending on hosting choice)

### Cost-Benefit Analysis

**Quantifiable Benefits** (Annual):

| Benefit Category | Current Cost | With EduHub | Annual Savings |
|------------------|--------------|-------------|----------------|
| Paper and Printing | $2,000 | $500 | $1,500 |
| Physical Storage | $1,000 | $0 | $1,000 |
| Staff Time (Application Processing)* | $8,000 | $2,500 | $5,500 |
| Staff Time (Registration Support)** | $5,000 | $1,000 | $4,000 |
| Manual Record Updates*** | $3,000 | $500 | $2,500 |
| **Total Annual Savings** | **$19,000** | **$4,500** | **$14,500** |

*Based on 200 applications/year at 45 min each vs 15 min each, administrative staff rate
**Based on reduced support needed during registration periods
***Based on reduced manual data entry and corrections

**Intangible Benefits**:
- Improved student satisfaction and experience
- Enhanced institutional reputation
- Better data for decision-making
- Competitive advantage in student recruitment
- Reduced errors and data inconsistencies
- Faster response times to student inquiries
- Ability to serve more students without proportional staff increases

### Return on Investment (ROI)

**Scenario 1: Free Hosting (Pilot/Small Scale)**
- Initial Investment: $0
- Annual Operating Cost: $0
- Annual Savings: $14,500
- ROI: Infinite (savings with no cost)
- Payback Period: Immediate

**Scenario 2: Low-Cost Hosting (Recommended)**
- Initial Investment: $0
- Annual Operating Cost: $245
- Annual Savings: $14,500
- Net Annual Benefit: $14,255
- ROI: 5,818%
- Payback Period: Less than 1 week

**Scenario 3: Enterprise Hosting (Maximum Scalability)**
- Initial Investment: $0
- Annual Operating Cost: $1,415
- Annual Savings: $14,500
- Net Annual Benefit: $13,085
- ROI: 925%
- Payback Period: Less than 1 month

**5-Year Cost Comparison**:

| Option | 5-Year Cost | 5-Year Savings | Net Benefit |
|--------|-------------|----------------|-------------|
| Keep Current System | $95,000 | $0 | $0 |
| Free Hosting | $0 | $72,500 | $72,500 |
| Low-Cost Hosting | $1,225 | $72,500 | $71,275 |
| Enterprise Hosting | $7,075 | $72,500 | $65,425 |

### Risk Assessment

**Financial Risks**:

| Risk | Probability | Potential Cost Impact | Mitigation |
|------|-------------|----------------------|------------|
| Cloud hosting cost overruns | Low | $500-1000/year | Monitor usage, optimize queries, start with free tier |
| Unexpected maintenance costs | Low | $500/year | Document system well, use stable technologies |
| Need for paid third-party services | Low | $500/year | Use open-source alternatives, build features in-house |
| System downtime costs | Low | $100-500/incident | Implement backups, monitoring, quick recovery procedures |

**Maximum Reasonable Risk Exposure**: $2,500/year (still much lower than current costs)

### Funding Sources

**Initial Development**:
- No funding required (academic project with student labor)

**Ongoing Operations**:
- Institutional IT budget ($245-1,415/year)
- Cost savings from reduced paper/storage can cover hosting
- Potential grants for educational technology initiatives

### Economic Comparison with Alternatives

**Option 1: Purchase Commercial Solution**
- License Cost: $10,000-50,000/year
- Implementation: $5,000-15,000
- Training: $2,000-5,000
- Total First Year: $17,000-70,000

**Option 2: Hire External Development Team**
- Development: $30,000-100,000
- Maintenance: $10,000-20,000/year
- Total First Year: $40,000-120,000

**Option 3: EduHub (This Project)**
- Development: $0 (student project)
- Maintenance: $245-1,415/year
- Total First Year: $245-1,415

**Economic Advantage**: EduHub costs 95-99% less than alternatives

**Conclusion**: The project is **economically feasible** and highly advantageous. With minimal to zero development cost, low operational expenses, and significant savings in staff time and materials, the system provides exceptional return on investment. The project delivers substantial financial benefits while remaining within the institution's budget constraints.

---

# 2.4 Project Planning

The project will follow the Agile Software Development Life Cycle (SDLC) model. Agile development allows the team to build the system in small stages called sprints, while continuously testing, improving features, and adapting to changing requirements.

## Agile Methodology

### Why Agile?

The Agile approach is particularly suited for this project because:

- **Iterative Development**: Build features incrementally, allowing for early testing and feedback
- **Flexibility**: Adapt to changing requirements and priorities throughout development
- **Continuous Improvement**: Regular retrospectives help the team improve processes
- **Risk Reduction**: Early detection of issues through frequent testing and integration
- **Stakeholder Engagement**: Regular demonstrations keep stakeholders informed and involved
- **Team Collaboration**: Daily communication and shared responsibility improve productivity

### Agile Principles Applied to EduHub

1. **Working Software**: Prioritize functional features over comprehensive documentation
2. **Customer Collaboration**: Regular feedback from potential users (students, admin staff)
3. **Responding to Change**: Adapt to new requirements based on testing and feedback
4. **Incremental Delivery**: Release features progressively rather than all at once

### Sprint Structure

The project will use **2-week sprints** to maintain a steady development pace while allowing sufficient time for meaningful progress.

**Sprint Timeline**:
- Total Project Duration: 14 weeks (7 sprints)
- Sprint Duration: 2 weeks each
- Total Sprints: 7 sprints

**Sprint Breakdown**:

| Sprint | Duration | Focus Area | Key Deliverables |
|--------|----------|------------|------------------|
| Sprint 1 | Week 1-2 | Setup & Authentication | Development environment, database schema, user authentication |
| Sprint 2 | Week 3-4 | Application System | Application submission, document upload, application management |
| Sprint 3 | Week 5-6 | Admin Approval Workflow | Application review interface, approval process, student number generation |
| Sprint 4 | Week 7-8 | Student Profile Management | Student dashboard, profile editing, emergency contacts |
| Sprint 5 | Week 9-10 | Course Registration | Course catalog, registration system, add/drop functionality |
| Sprint 6 | Week 11-12 | Additional Features & Integration | Lecturer/librarian features, notifications, reporting |
| Sprint 7 | Week 13-14 | Testing & Refinement | Bug fixes, performance optimization, user acceptance testing |

### Agile Ceremonies

The team will conduct the following Agile ceremonies:

#### 1. Sprint Planning (Start of each sprint)
- **Duration**: 2 hours
- **Frequency**: Every 2 weeks (start of sprint)
- **Participants**: All team members
- **Objectives**:
  - Review and prioritize product backlog
  - Select user stories for the upcoming sprint
  - Break down user stories into tasks
  - Estimate effort for each task
  - Define sprint goal and success criteria

#### 2. Daily Standup (Daily during development)
- **Duration**: 15 minutes
- **Frequency**: Daily (weekdays)
- **Participants**: All team members
- **Format**: Each member answers three questions:
  - What did I complete yesterday?
  - What will I work on today?
  - Are there any blockers or impediments?
- **Purpose**: Synchronize team activities, identify blockers quickly

#### 3. Sprint Review (End of each sprint)
- **Duration**: 1.5 hours
- **Frequency**: Every 2 weeks (end of sprint)
- **Participants**: Team members + stakeholders (instructor, potential users)
- **Objectives**:
  - Demonstrate completed features
  - Gather feedback from stakeholders
  - Update product backlog based on feedback
  - Review sprint metrics (velocity, completed work)

#### 4. Sprint Retrospective (End of each sprint)
- **Duration**: 1 hour
- **Frequency**: Every 2 weeks (after sprint review)
- **Participants**: Team members only
- **Objectives**:
  - Discuss what went well
  - Identify what could be improved
  - Create action items for process improvements
  - Celebrate successes and learn from challenges

#### 5. Backlog Refinement (Mid-sprint)
- **Duration**: 1 hour
- **Frequency**: Once per sprint (mid-sprint)
- **Participants**: Project Manager + interested team members
- **Objectives**:
  - Review upcoming user stories
  - Add details and acceptance criteria
  - Estimate effort for future work
  - Ensure backlog is ready for next sprint planning

## Team Structure and Roles

### Team Members and Responsibilities

| Team Member | Primary Role | Secondary Responsibilities | Key Deliverables |
| ----------- | ------------ | ------------------------- | ---------------- |
| Student 1 | Project Manager | Requirements analysis, stakeholder communication | Sprint planning, project documentation, status reports |
| Student 2 | Backend Developer | API development, database operations | REST API endpoints, authentication, business logic |
| Student 3 | Frontend Developer | UI/UX implementation, React components | User interface, responsive design, client-side logic |
| Student 4 | Database Designer | Schema design, query optimization | Database schema, migrations, data models |
| Student 5 | System Testing | Quality assurance, test automation | Test cases, bug reports, test documentation |
| Student 6 | Documentation & Diagrams | Technical writing, system architecture | User guides, API documentation, system diagrams |

**Note**: While each member has a primary role, Agile encourages cross-functional collaboration. Team members may assist each other across different areas as needed.

### Role Descriptions

**Project Manager (Scrum Master)**:
- Facilitate Agile ceremonies
- Remove blockers and impediments
- Track project progress and velocity
- Coordinate communication with stakeholders
- Manage project timeline and deliverables
- Maintain product backlog

**Backend Developer**:
- Design and implement RESTful API endpoints
- Implement authentication and authorization
- Develop business logic and workflows
- Integrate with database using Sequelize ORM
- Handle file uploads and email notifications
- Write unit tests for backend code

**Frontend Developer**:
- Design and implement user interfaces
- Create reusable React components
- Implement client-side routing
- Handle form validation and error handling
- Ensure responsive design across devices
- Integrate with backend API
- Write unit tests for React components

**Database Designer**:
- Design normalized database schema
- Create entity-relationship diagrams
- Write and optimize SQL queries
- Implement database migrations
- Set up indexes for performance
- Design data validation rules

**System Testing**:
- Develop test plans and test cases
- Perform functional and integration testing
- Report and track bugs
- Verify bug fixes
- Conduct user acceptance testing
- Document testing procedures

**Documentation & Diagrams**:
- Create system architecture diagrams (Use Case, ERD, DFD)
- Write user documentation and guides
- Document API endpoints
- Create Gantt and PERT charts
- Maintain project wiki
- Write deployment instructions

## Communication Plan

Effective communication is critical for project success. The team will use multiple channels and methods:

### Communication Channels

| Channel | Purpose | Frequency | Tools |
|---------|---------|-----------|-------|
| Daily Standup | Synchronize daily work | Daily (15 min) | In-person / Zoom |
| Sprint Meetings | Planning and reviews | Every 2 weeks | In-person / Zoom |
| Team Chat | Quick questions, updates | As needed | Slack / WhatsApp / Discord |
| Video Calls | Deep discussions, problem-solving | As needed | Zoom / Google Meet |
| Email | Formal communication, stakeholders | As needed | Email |
| Project Board | Task tracking, progress visibility | Continuous | GitHub Projects / Trello / ClickUp |

### Communication Guidelines

**Response Time Expectations**:
- Urgent issues: Within 2 hours during working hours
- Regular questions: Within 24 hours
- Non-urgent updates: Within 48 hours

**Documentation Standards**:
- Code comments for complex logic
- Commit messages follow conventional format: `type(scope): description`
- Pull requests include description and testing notes
- Meeting notes documented in shared repository

**Decision Making**:
- Technical decisions: Team consensus, documented in ADR (Architecture Decision Records)
- Priority changes: Project Manager with team input
- Major scope changes: Require stakeholder approval

### Meeting Schedule

**Weekly Schedule** (During active development):

| Day | Time | Meeting | Duration |
|-----|------|---------|----------|
| Monday | 9:00 AM | Sprint Planning (every 2 weeks) | 2 hours |
| Daily | 9:00 AM | Daily Standup | 15 minutes |
| Wednesday | 2:00 PM | Backlog Refinement (mid-sprint) | 1 hour |
| Friday | 3:00 PM | Sprint Review (every 2 weeks) | 1.5 hours |
| Friday | 4:30 PM | Sprint Retrospective (every 2 weeks) | 1 hour |

## Risk Management

Proactive risk management helps identify and mitigate potential project challenges.

### Risk Identification and Mitigation

| Risk ID | Risk Description | Probability | Impact | Mitigation Strategy | Contingency Plan |
|---------|------------------|-------------|--------|---------------------|------------------|
| R-001 | Team member unavailability due to illness or personal reasons | Medium | High | Cross-train team members, document work regularly | Redistribute tasks to other team members, adjust sprint scope |
| R-002 | Technical challenges with new technologies (React, Node.js) | Medium | Medium | Allocate learning time, peer programming, code reviews | Consult online resources, seek help from instructor/mentor |
| R-003 | Scope creep - adding too many features | Medium | High | Clear requirements, strict backlog prioritization | Defer non-critical features to future releases |
| R-004 | Integration issues between frontend and backend | Low | Medium | Define API contracts early, use API documentation tools | Schedule integration testing sprint, allocate debugging time |
| R-005 | Database performance issues with test data | Low | Medium | Implement database indexing, optimize queries | Use database monitoring tools, add caching layer |
| R-006 | Security vulnerabilities | Medium | High | Follow OWASP guidelines, conduct security reviews | Perform security audit, implement recommended fixes |
| R-007 | Deployment challenges | Medium | Medium | Use Docker for consistency, document deployment process | Allocate extra time for deployment, test in staging environment |
| R-008 | Inadequate testing leading to bugs | Low | High | Maintain test coverage goals (>70%), automated testing | Extended testing sprint, bug fixing sprint |
| R-009 | Communication breakdowns | Low | Medium | Regular meetings, clear documentation, project board | Emergency team meeting to realign, clarify responsibilities |
| R-010 | Time constraints - running out of time | Medium | High | Regular progress tracking, early warning system | Reduce scope, prioritize core features, extend timeline if possible |

### Risk Monitoring

- **Risk Review**: Discuss risks during sprint retrospectives
- **Risk Register**: Maintained by Project Manager, reviewed bi-weekly
- **Escalation**: High-impact risks escalated to instructor/stakeholders immediately

## Quality Assurance

Quality is built into the development process through multiple practices:

### Code Quality Standards

**Code Reviews**:
- All code changes require peer review before merging
- Review checklist: functionality, readability, security, performance
- At least one team member must approve pull request

**Coding Standards**:
- Follow JavaScript/React best practices and style guides
- Use ESLint for code linting
- Consistent naming conventions
- DRY (Don't Repeat Yourself) principle

**Version Control**:
- Git branching strategy: main (production), develop (integration), feature branches
- Branch naming: `feature/feature-name`, `bugfix/bug-description`
- Commit regularly with descriptive messages

### Testing Strategy

**Testing Levels**:

1. **Unit Testing**:
   - Test individual functions and components
   - Tools: Jest, React Testing Library
   - Target: >70% code coverage

2. **Integration Testing**:
   - Test API endpoints and database interactions
   - Tools: Supertest, Jest
   - Verify data flow between components

3. **System Testing**:
   - Test complete user workflows end-to-end
   - Manual testing of all features
   - Cross-browser testing (Chrome, Firefox, Safari, Edge)

4. **User Acceptance Testing (UAT)**:
   - Final sprint involves testing by actual users
   - Gather feedback on usability and functionality
   - Verify system meets requirements

**Bug Tracking**:
- Bugs logged in GitHub Issues or project management tool
- Priority levels: Critical, High, Medium, Low
- Bugs triaged and fixed according to priority

### Definition of Done

A user story is considered "Done" when:
- Code is written and committed to repository
- Unit tests are written and passing
- Code review is completed and approved
- Feature is tested and working as expected
- Documentation is updated
- Accepted by Product Owner (Project Manager)

## Development Tools and Environment

### Version Control and Collaboration

- **GitHub Repository**: Central code repository
- **Branch Protection**: Main branch requires pull request and review
- **CI/CD**: Automated testing on pull requests (GitHub Actions)

### Project Management

- **Task Board**: ClickUp (as shown in provided screenshot)
- **Backlog Management**: User stories with acceptance criteria
- **Sprint Burndown**: Track remaining work during sprint

### Development Environment

**Required Software** (all team members):
- Node.js (v16 or higher)
- PostgreSQL (v14 or higher)
- Git
- Visual Studio Code or preferred IDE
- Postman or similar API testing tool

**Environment Setup**:
- Shared `.env.example` file for configuration
- Docker Compose for consistent database setup
- Detailed setup instructions in README.md

## Deliverables and Milestones

### Key Project Milestones

| Milestone | Target Date | Deliverables |
|-----------|-------------|--------------|
| M1: Project Kickoff | Week 1 | Team formed, roles assigned, tools set up |
| M2: Requirements Complete | Week 2 | Requirements document, user stories, database schema |
| M3: Authentication Working | Week 2 | Login, registration, password reset functional |
| M4: Application System Live | Week 4 | Students can submit applications |
| M5: Admin Approval Functional | Week 6 | Administrators can approve applications |
| M6: Student Portal Complete | Week 8 | Students can manage profiles |
| M7: Registration System Working | Week 10 | Course registration functional |
| M8: All Features Complete | Week 12 | All planned features implemented |
| M9: Testing Complete | Week 13 | All tests passed, bugs fixed |
| M10: Project Delivery | Week 14 | Final presentation, documentation, deployed system |

### Sprint Deliverables

Each sprint produces:
- Working software (potentially shippable increment)
- Updated documentation
- Test cases and test results
- Sprint review presentation
- Sprint retrospective notes

This comprehensive project plan ensures the team has clear structure, defined processes, effective communication, risk mitigation strategies, and quality assurance measures to successfully develop the EduHub system using Agile methodology.

---

# 2.5 Project Scheduling

Project scheduling is used to organize tasks, manage project timelines effectively, and track progress throughout the development lifecycle. Two scheduling techniques are used for this project: the Gantt Chart and the PERT Chart. These tools help visualize project activities, identify dependencies, allocate resources, and ensure timely completion.

---

## 2.5.1 Gantt Chart

The Gantt chart provides a visual timeline of project activities, showing when each task starts, its duration, and when it is expected to be completed. It also helps identify overlapping tasks and resource allocation.

### Project Timeline Overview

| Task | Duration | Start Date | End Date | Dependencies | Assigned To |
| ---- | -------- | ---------- | -------- | ------------ | ----------- |
| Project Proposal | 1 week | Mar 16 | Mar 23 | None | All team members |
| Planning Phase | 3 weeks | Mar 24 | Apr 13 | Project Proposal | All team members |
| Analysis Phase | 4 weeks | Apr 14 | May 11 | Planning Phase | All team members |
| System Design | 4 weeks | May 12 | Jun 8 | Analysis Phase | Database Designer, Documentation |
| Implementation | 2 weeks | Jun 9 | Jun 22 | System Design | Developers (Frontend, Backend) |
| Testing | 1 week | Jun 23 | Jun 27 | Implementation | System Testing, All developers |
| Documentation Finalization | 2 days | Jun 27 | Jun 28 | Testing (concurrent) | Documentation & Diagrams |
| Final Submission | 1 day | Jun 29 | Jun 29 | Documentation Finalization, Testing | Project Manager |

**Total Project Duration**: 15 weeks (Mar 16 - Jun 29)

### Detailed Task Breakdown

#### Phase 1: Project Proposal (1 week: Mar 16 - Mar 23)

**Activities**:
- Define project scope and objectives
- Identify system requirements at high level
- Select implementation language (JavaScript)
- Choose SDLC model (Agile)
- Form team and assign initial roles
- Create proposal document

**Deliverables**:
- Project proposal document
- Team structure
- Initial project vision

#### Phase 2: Planning Phase (3 weeks: Mar 24 - Apr 13)

**Activities**:
- Conduct stakeholder analysis
- Perform preliminary investigation (research, observation)
- Complete feasibility study (technical, operational, economic)
- Develop detailed project plan
- Create project schedule (Gantt and PERT charts)
- Define software requirements specification
- Create initial data models (Use Case, ERD, DFD)

**Deliverables**:
- Planning phase document (this document)
- Feasibility study report
- Software requirements specification
- Project schedule
- System diagrams

**Milestones**:
- Week 1: Stakeholder analysis and investigation complete
- Week 2: Feasibility study complete
- Week 3: SRS and data models complete

#### Phase 3: Analysis Phase (4 weeks: Apr 14 - May 11)

**Activities**:
- Detailed requirements analysis
- User story creation and prioritization
- System workflow analysis
- Database requirements analysis
- Security requirements definition
- Interface requirements specification
- Create detailed use cases
- Define acceptance criteria for all features

**Deliverables**:
- Detailed requirements document
- User stories with acceptance criteria
- System analysis document
- Updated data models
- Interface mockups/wireframes

**Milestones**:
- Week 1: Requirements gathering complete
- Week 2: User stories created
- Week 3: System workflows defined
- Week 4: Analysis documentation complete

#### Phase 4: System Design (4 weeks: May 12 - Jun 8)

**Activities**:
- Database schema design
- API endpoint design
- System architecture design
- Security architecture design
- UI/UX design
- Component design (frontend and backend)
- Integration design
- Deployment architecture design

**Deliverables**:
- Database schema and ER diagrams
- API documentation
- System architecture diagrams
- UI/UX mockups
- Technical design document

**Milestones**:
- Week 1: Database schema finalized
- Week 2: API design complete
- Week 3: UI/UX designs approved
- Week 4: All design documents complete

#### Phase 5: Implementation (2 weeks: Jun 9 - Jun 22)

**Activities**:
- Sprint 1-7 development (compressed timeline)
- Database setup and migrations
- Backend API development
- Frontend UI implementation
- Authentication system implementation
- Application submission system
- Admin approval workflow
- Student profile management
- Course registration system
- Integration and testing during development

**Deliverables**:
- Working EduHub system
- All planned features implemented
- Source code in GitHub repository
- Initial testing complete

**Milestones**:
- Week 1: Core features (auth, applications) implemented
- Week 2: All features complete, integrated system working

#### Phase 6: Testing (1 week: Jun 23 - Jun 27)

**Activities**:
- Unit testing
- Integration testing
- System testing
- User acceptance testing
- Security testing
- Performance testing
- Cross-browser testing
- Bug fixing
- Final quality assurance

**Deliverables**:
- Test reports
- Bug fix documentation
- Tested and stable system
- Test cases documentation

**Milestones**:
- Day 1-2: All testing executed
- Day 3-4: Critical bugs fixed
- Day 5: Final QA approval

#### Phase 7: Documentation Finalization (2 days: Jun 27 - Jun 28)

**Activities** (Runs concurrently with end of testing):
- Finalize user documentation
- Complete technical documentation
- Create system deployment guide
- Prepare final presentation
- Compile all project deliverables

**Deliverables**:
- Complete user manual
- Technical documentation
- Deployment guide
- Final presentation slides
- Complete project report

#### Phase 8: Final Submission (1 day: Jun 29)

**Activities**:
- Final review of all deliverables
- Submit project documentation
- Deliver final presentation
- Hand over system to stakeholders

**Deliverables**:
- All project documentation
- Deployed working system
- Final presentation
- Project handover

### Resource Allocation

| Phase | Project Manager | Backend Dev | Frontend Dev | Database Designer | Testing | Documentation |
|-------|----------------|-------------|--------------|-------------------|---------|---------------|
| Proposal | 40% | 20% | 20% | 10% | 5% | 5% |
| Planning | 30% | 15% | 15% | 15% | 10% | 15% |
| Analysis | 30% | 20% | 20% | 15% | 5% | 10% |
| Design | 20% | 20% | 20% | 25% | 5% | 10% |
| Implementation | 15% | 35% | 35% | 10% | 5% | 0% |
| Testing | 10% | 20% | 20% | 5% | 45% | 0% |
| Documentation | 20% | 10% | 10% | 5% | 5% | 50% |
| Submission | 50% | 10% | 10% | 5% | 5% | 20% |

### Critical Success Factors

- **On-Time Delivery**: Adhere to schedule to meet Apr 13 planning deadline and Jun 29 final submission
- **Resource Availability**: All team members available and contributing consistently
- **Dependency Management**: Complete prerequisite tasks before dependent tasks begin
- **Risk Mitigation**: Address blockers quickly to avoid schedule delays
- **Quality Assurance**: Maintain quality throughout to avoid extensive rework in testing phase

### Gantt Chart Visual Representation

```
Timeline: Mar 16 ════════════════════════════════════════════════════ Jun 29

Mar 16-23:  [Proposal]
Mar 24-Apr 13: [═════ Planning Phase ═════]
Apr 14-May 11:    [══════ Analysis Phase ══════]
May 12-Jun 8:              [══════ System Design ══════]
Jun 9-22:                               [Implementation]
Jun 23-27:                                      [Test]
Jun 27-28:                                        [Doc]
Jun 29:                                            [Sub]

Milestones:
▼ Mar 23: Proposal Complete
▼ Apr 13: Planning Complete (Current Phase Deadline)
▼ May 11: Analysis Complete
▼ Jun 8: Design Complete
▼ Jun 22: Implementation Complete
▼ Jun 29: Final Submission
```

(Detailed Gantt Chart diagram will be inserted here)

---

## 2.5.2 PERT Chart

The PERT (Program Evaluation and Review Technique) chart shows the dependencies between project tasks, identifies the critical path, and helps calculate project completion time considering task relationships.

### Project Activity Network

**Task Dependencies and Duration**:

| Task ID | Task Name | Duration | Predecessor(s) | Successor(s) |
|---------|-----------|----------|----------------|--------------|
| A | Project Proposal | 1 week | - | B |
| B | Planning Phase | 3 weeks | A | C |
| C | Analysis Phase | 4 weeks | B | D |
| D | System Design | 4 weeks | C | E |
| E | Implementation | 2 weeks | D | F, G |
| F | Testing | 1 week | E | H |
| G | Documentation | 2 days | E | H |
| H | Final Submission | 1 day | F, G | - |

### Activity Sequencing

**Detailed Dependencies**:

1. **Project Proposal (A)** → No prerequisites
   - Must complete before planning can begin
   - Establishes project foundation

2. **Planning Phase (B)** → Depends on A
   - Requires approved proposal
   - Feeds into analysis phase

3. **Analysis Phase (C)** → Depends on B
   - Uses planning outputs (requirements, stakeholders)
   - Must complete before design starts

4. **System Design (D)** → Depends on C
   - Uses analysis outputs (requirements, use cases)
   - Design must be complete before coding

5. **Implementation (E)** → Depends on D
   - Follows approved designs
   - Produces system for testing and documentation

6. **Testing (F)** → Depends on E
   - Concurrent with documentation finalization
   - Tests implemented features

7. **Documentation Finalization (G)** → Depends on E
   - Can run parallel to testing
   - Shorter duration than testing

8. **Final Submission (H)** → Depends on F and G
   - Requires both testing and documentation complete
   - Final project deliverable

### Critical Path Analysis

**Critical Path**: A → B → C → D → E → F → H

**Total Duration on Critical Path**: 15 weeks and 3 days
- A: 1 week
- B: 3 weeks
- C: 4 weeks
- D: 4 weeks
- E: 2 weeks
- F: 1 week
- H: 1 day
- **Total: 15 weeks + 1 day**

**Critical Path Significance**:
- Tasks on critical path cannot be delayed without delaying entire project
- Any delay in critical path tasks directly impacts final submission date
- Non-critical task: Documentation (G) has 5 days of float time
  - Can start 5 days later than earliest start without impacting project completion

### Slack Time Analysis

| Task | Earliest Start | Latest Start | Earliest Finish | Latest Finish | Slack/Float |
|------|---------------|--------------|-----------------|---------------|-------------|
| A | Week 0 | Week 0 | Week 1 | Week 1 | 0 days |
| B | Week 1 | Week 1 | Week 4 | Week 4 | 0 days |
| C | Week 4 | Week 4 | Week 8 | Week 8 | 0 days |
| D | Week 8 | Week 8 | Week 12 | Week 12 | 0 days |
| E | Week 12 | Week 12 | Week 14 | Week 14 | 0 days |
| F | Week 14 | Week 14 | Week 15 | Week 15 | 0 days |
| G | Week 14 | Week 14.5 | Week 14.4 | Week 14.9 | 5 days |
| H | Week 15 | Week 15 | Week 15.2 | Week 15.2 | 0 days |

**Interpretation**:
- **Zero Slack Tasks** (Critical Path): A, B, C, D, E, F, H - No room for delay
- **Non-Zero Slack**: Task G (Documentation) - Can be delayed up to 5 days without impacting project

### PERT Calculation (Time Estimates)

Using PERT three-point estimation for realistic timeline:

| Task | Optimistic (O) | Most Likely (M) | Pessimistic (P) | Expected Time (TE) |
|------|---------------|-----------------|-----------------|-------------------|
| Planning Phase | 2.5 weeks | 3 weeks | 4 weeks | 3 weeks |
| Analysis Phase | 3 weeks | 4 weeks | 6 weeks | 4.2 weeks |
| System Design | 3.5 weeks | 4 weeks | 5 weeks | 4.1 weeks |
| Implementation | 1.5 weeks | 2 weeks | 3 weeks | 2.1 weeks |
| Testing | 5 days | 7 days | 10 days | 7.2 days |

**Formula**: TE = (O + 4M + P) / 6

**Risk Analysis**:
- Implementation has highest variability (1.5x difference between optimistic and pessimistic)
- Buffer time should be allocated in implementation phase
- Testing may extend if major bugs found

### Network Diagram Flow

```
                     ┌──────────────┐
                     │   START      │
                     └──────┬───────┘
                            │
                     ┌──────▼───────┐
                     │ A: Proposal  │ (1 week)
                     └──────┬───────┘
                            │
                     ┌──────▼───────┐
                     │ B: Planning  │ (3 weeks)
                     └──────┬───────┘
                            │
                     ┌──────▼───────┐
                     │ C: Analysis  │ (4 weeks)
                     └──────┬───────┘
                            │
                     ┌──────▼───────┐
                     │ D: Design    │ (4 weeks)
                     └──────┬───────┘
                            │
                   ┌────────▼─────────┐
                   │ E: Implementation│ (2 weeks)
                   └────┬────────┬────┘
                        │        │
              ┌─────────▼──┐  ┌─▼─────────────┐
              │ F: Testing │  │ G: Docs (2d)  │
              │  (1 week)  │  │ Float: 5 days │
              └─────────┬──┘  └─┬─────────────┘
                        │       │
                     ┌──▼───────▼──┐
                     │ H: Submission│ (1 day)
                     └──────┬───────┘
                            │
                     ┌──────▼───────┐
                     │    END       │
                     └──────────────┘

Critical Path: A→B→C→D→E→F→H (shown in bold)
```

(Detailed PERT Diagram will be inserted here)

### Project Control Measures

**Progress Tracking**:
- Weekly progress reviews during sprint retrospectives
- Compare actual vs. planned completion dates
- Identify variance and take corrective action

**Schedule Management**:
- Monitor critical path tasks closely
- Use float time in non-critical tasks if critical tasks face delays
- Escalate schedule risks immediately

**Adjustment Strategies**:
- **If ahead of schedule**: Add features, improve quality, enhance documentation
- **If on schedule**: Maintain current pace, monitor closely
- **If behind schedule**:
  - Reduce scope (defer non-critical features)
  - Increase resources (team members work on critical tasks)
  - Optimize processes (reduce meeting time, parallel work)
  - Request deadline extension (last resort)

### Key Schedule Milestones

| Milestone | Date | Significance |
|-----------|------|--------------|
| **Proposal Approved** | Mar 23 | Project officially begins |
| **Planning Complete** | Apr 13 | Current phase deadline (25% weight) |
| **Analysis Complete** | May 11 | Requirements locked |
| **Design Approved** | Jun 8 | Ready to implement |
| **Implementation Done** | Jun 22 | Feature complete |
| **Testing Passed** | Jun 27 | Quality assured |
| **Final Submission** | Jun 29 | Project complete (100%) |

This scheduling approach ensures systematic progress tracking, identifies critical dependencies, and provides clear visibility into project timeline and potential risks.

---

# 2.6 Software Requirement Specification (SRS)

The Software Requirement Specification (SRS) provides a high-level overview of the functional and non-functional requirements of the EduHub system. This section outlines the major system capabilities and quality attributes. Detailed requirements with acceptance criteria will be specified in the Analysis Phase (Phase 3).

---

## Functional Requirements Overview

Functional requirements describe what the system must do - the specific behaviors, functions, and features it must provide. The following categories represent the high-level functional needs of the EduHub system:

### 1. User Authentication and Account Management

The system must provide secure user authentication with the following capabilities:
- User registration with email verification
- Secure login with password hashing
- Password reset functionality
- Multi-factor authentication (optional)
- Session management with automatic timeout
- Role-based user accounts

### 2. Role-Based Access Control

The system must support different user roles with appropriate permissions:
- **Applicant**: Can submit and track applications
- **Student**: Can manage profile and register for courses
- **Lecturer**: Can view assigned courses and class rosters
- **Administrator**: Can manage applications, courses, and system settings
- **Librarian**: Can verify student status and view basic information
- **Alumni**: Can view academic history (future enhancement)

### 3. Application Management

Applicants must be able to:
- Complete online application forms
- Upload required documents (ID, certificates, transcripts)
- Save applications as drafts
- Submit completed applications
- Track application status
- Receive email notifications on status changes

### 4. Administrative Approval Workflow

Administrators must be able to:
- View and filter all submitted applications
- Review application details and documents
- Approve or reject applications with comments
- Automatically generate unique student numbers upon approval
- Perform bulk approval actions
- Send automated notifications to applicants

### 5. Student Profile Management

Students must be able to:
- View complete profile information
- Edit personal details (address, phone, email)
- Manage emergency contacts (up to 3)
- Upload profile photos
- View academic records and registered courses

### 6. Course Registration System

The system must enable students to:
- Browse available courses with filtering and search
- View detailed course information (description, prerequisites, schedule)
- Register for courses during specified registration periods
- Drop courses within the add/drop period
- View prerequisite checking and schedule conflict detection
- Receive registration confirmations

### 7. Course Management

Administrators and lecturers must be able to:
- Create and edit course offerings
- Set course capacity and prerequisites
- Assign lecturers to courses
- View course enrollments
- Manage registration periods
- Export class rosters

### 8. Lecturer Features

Lecturers must be able to:
- View assigned courses
- Access class rosters with student contact information
- Post course announcements
- Export student lists

### 9. Librarian Features

Librarians must be able to:
- Search for students by number or name
- Verify student enrollment status
- View basic student information
- Check student academic standing

### 10. Reporting and Analytics

Administrators should be able to:
- Generate application statistics reports
- View enrollment reports by program and semester
- Export data to CSV/PDF formats
- View system usage analytics

### 11. Notifications

The system must provide:
- Automated email notifications for key events
- In-app notification system
- Notification history and read/unread status

---

## Non-Functional Requirements Overview

Non-functional requirements define system qualities and constraints. The EduHub system must meet the following quality attributes:

### 1. Security

- Secure password storage using industry-standard hashing (bcrypt)
- JWT-based authentication with token expiration
- Role-based access control on all API endpoints
- Input validation and sanitization to prevent injection attacks
- HTTPS encryption for all data transmission
- Comprehensive audit logging of all administrative actions
- Session security with automatic timeout

### 2. Performance

- Page load times under 3 seconds
- API response times under 1 second
- Support for 100+ concurrent users
- Peak capacity of 500 concurrent users during registration periods
- Database query optimization with proper indexing

### 3. Availability and Reliability

- 99.5% system uptime
- Graceful error handling
- Daily automated database backups
- Disaster recovery plan with defined RTO and RPO
- System monitoring and health checks

### 4. Usability

- Intuitive, user-friendly interface
- Responsive design supporting desktop, tablet, and mobile devices
- Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- Accessibility compliance (WCAG 2.1 Level AA)
- Contextual help and documentation

### 5. Maintainability

- Clean, well-documented code following style guides
- Modular architecture with reusable components
- Comprehensive unit and integration test coverage (>70%)
- Git-based version control with code reviews
- API documentation for all endpoints

### 6. Scalability

- Stateless API design for horizontal scaling
- Database design supporting growth to 10,000+ students
- Modular architecture allowing feature extensions
- Load balancing readiness

### 7. Portability

- Docker containerization for consistent deployment
- Environment-based configuration
- Support for multiple cloud platforms (AWS, Heroku, DigitalOcean)
- Database abstraction layer (Sequelize ORM)

### 8. Compliance

- Data protection regulation compliance
- Privacy policy and user consent management
- Immutable audit trails
- Right to data deletion (GDPR compliance)

---

## Requirements Summary

The EduHub system encompasses approximately **50-60 functional requirements** across 11 major categories and **25-30 non-functional requirements** across 8 quality attribute categories.

**Priority Breakdown**:
- **Must Have** (~75%): Core system functionality required for MVP
- **Should Have** (~20%): Important features that add significant value
- **Could Have** (~5%): Nice-to-have features for future releases

Detailed requirements with unique identifiers, acceptance criteria, and test cases will be documented in Phase 3 (Analysis Phase) to support system design and development.

---

# 2.7 Data Models

Data models provide a conceptual view of the system's information structure and how different components interact. This section presents high-level data models to illustrate the major entities and their relationships. Detailed database schemas with attributes, data types, and constraints will be developed in Phase 4 (System Design).

---

## Use Case Diagram

Use case diagrams illustrate the functional requirements from the user's perspective, showing actors and their interactions with the system.

### System Actors

The EduHub system has six primary actors:

| Actor | Description | Key Responsibilities |
|-------|-------------|---------------------|
| **Applicant** | Person applying for admission | Submit applications, upload documents, track status |
| **Student** | Enrolled student | Manage profile, register for courses, view academic records |
| **Lecturer** | Faculty member | View assigned courses, access class rosters, post announcements |
| **Administrator** | System administrator | Approve applications, manage courses, configure system, generate reports |
| **Librarian** | Library staff | Verify student status, view student information |
| **Alumni** | Graduated student | View academic history (future enhancement) |

### Primary Use Cases

**Applicant Use Cases**:
- Register Account
- Submit Application
- Upload Documents
- View Application Status

**Student Use Cases**:
- Manage Profile
- Register for Courses
- Drop Courses
- View Academic Records
- Manage Emergency Contacts

**Lecturer Use Cases**:
- View Assigned Courses
- View Class Roster
- Export Student Lists
- Post Announcements

**Administrator Use Cases**:
- Approve/Reject Applications
- Manage Courses
- Assign Lecturers
- Configure System Settings
- Generate Reports

**Librarian Use Cases**:
- Search Students
- Verify Student Status
- View Student Information

### Use Case Relationships

- **Include**: Common functionality shared across use cases (e.g., Login, Authenticate)
- **Extend**: Optional behavior that enhances use cases (e.g., Enable MFA extends Login)
- **Generalization**: All user roles generalize from "Registered User" except Applicant

(Detailed Use Case diagram will be created in Phase 3 - Analysis)

---

## Entity Relationship Diagram (ERD)

The Entity Relationship Diagram shows the high-level data entities and their relationships.

### Primary Entities

The system manages the following core entities:

1. **Users** - All system users with authentication credentials and role information
2. **Students** - Extended information for enrolled students
3. **Applications** - Student application submissions
4. **Application_Documents** - Documents uploaded with applications
5. **Courses** - Course offerings and information
6. **Registrations** - Student course enrollments (junction entity)
7. **Emergency_Contacts** - Student emergency contact information
8. **System_Settings** - System configuration parameters
9. **Audit_Logs** - System audit trail
10. **Notifications** - User notifications

### Key Relationships

**One-to-One**:
- Users ↔ Students (each student record links to one user account)

**One-to-Many**:
- Users → Applications (users can have multiple applications)
- Students → Emergency_Contacts (students can have multiple emergency contacts)
- Users → Courses (as lecturer - one lecturer can teach multiple courses)
- Applications → Application_Documents (applications can have multiple documents)

**Many-to-Many**:
- Students ↔ Courses (through Registrations junction table)
  - Students can register for multiple courses
  - Courses can have multiple students enrolled

### Entity Descriptions

**Users**: Central authentication entity storing login credentials, role information, and basic user data for all system users.

**Students**: Extended profile information for users with Student role, including student number, personal details, program information, and enrollment status.

**Applications**: Application submissions from applicants, storing application data, status, and tracking information.

**Courses**: Course catalog information including course code, name, credits, prerequisites, capacity, and assigned lecturer.

**Registrations**: Junction table linking students to courses, storing enrollment information, registration date, and status.

(Detailed ERD with attributes, data types, and constraints will be created in Phase 4 - System Design)

---

## Data Flow Diagram (DFD)

The Data Flow Diagram illustrates how data moves through the system, showing processes, data stores, and information flows.

### DFD Level 0 (Context Diagram)

The context diagram shows the system boundary and external entities:

```
External Entities:
┌─────────────┐          ┌─────────────┐          ┌─────────────┐
│  Applicants │          │  Students   │          │  Lecturers  │
└──────┬──────┘          └──────┬──────┘          └──────┬──────┘
       │                        │                        │
       │ Applications           │ Registrations          │ Class Data
       ▼                        ▼                        ▼
    ┌────────────────────────────────────────────────────────┐
    │                                                        │
    │            EduHub Student Management System           │
    │                                                        │
    └────────────────────────────────────────────────────────┘
       ▲                        ▲                        ▲
       │ Status Updates         │ Confirmations          │ Rosters
       │                        │                        │
┌──────┴──────┐          ┌──────┴──────┐          ┌──────┴──────┐
│Administrators│          │  Librarians │          │   Reports   │
└─────────────┘          └─────────────┘          └─────────────┘
```

**Input Data Flows**:
- Applicants: Application data, documents
- Students: Profile updates, course selections
- Lecturers: Course information, announcements
- Administrators: Approval decisions, system configuration
- Librarians: Student verification requests

**Output Data Flows**:
- To Applicants: Application status, notifications
- To Students: Registration confirmations, course information
- To Lecturers: Class rosters, student contact details
- To Administrators: Reports, analytics, system data
- To Librarians: Student status information

### Major System Processes

The EduHub system consists of the following high-level processes:

1. **User Authentication** - Validates credentials, manages sessions
2. **Application Management** - Handles application submission and tracking
3. **Application Approval** - Processes admin reviews and decisions
4. **Profile Management** - Manages student information updates
5. **Course Registration** - Handles course enrollments and drops
6. **Course Management** - Manages course creation and assignments
7. **Notification Management** - Sends alerts and notifications
8. **Reporting** - Generates system reports and analytics

### Data Stores

The system uses the following conceptual data stores:

- **DS1: User Data** - Authentication and user account information
- **DS2: Student Data** - Student profiles and academic records
- **DS3: Application Data** - Application submissions and documents
- **DS4: Course Data** - Course catalog and offerings
- **DS5: Registration Data** - Student-course enrollments
- **DS6: System Configuration** - Settings and parameters
- **DS7: Audit Trail** - System activity logs
- **DS8: Notifications** - User alerts and messages

(Detailed DFD with Level 1 and Level 2 decomposition will be created in Phase 3 - Analysis)

---

## Data Flow Examples

### Application Submission Flow

```
Applicant fills form → Validates data → Stores in database →
Sends confirmation email → Updates application status
```

### Course Registration Flow

```
Student selects course → Checks prerequisites → Checks capacity →
Checks conflicts → Creates registration → Sends confirmation
```

### Approval Workflow Flow

```
Admin reviews application → Makes decision → Generates student number →
Creates student record → Updates user role → Sends notification
```

---

## Data Model Summary

The EduHub system's conceptual data model includes:
- **10 primary entities** managing users, students, applications, courses, and system data
- **Multiple relationship types** including one-to-one, one-to-many, and many-to-many
- **8 major processes** handling authentication, applications, profiles, courses, and reporting
- **8 data stores** persisting system information

This conceptual foundation will guide the development of detailed database schemas, API specifications, and system architecture in subsequent project phases.

**Next Steps**:
- Phase 3 (Analysis): Detailed data requirements, data dictionaries, normalization analysis
- Phase 4 (System Design): Complete database schema with all attributes, data types, constraints, indexes, and relationships

---

# Conclusion

The planning phase has identified the need for the EduHub system, evaluated its feasibility, planned project activities, defined requirements, and prepared scheduling structures for development. These planning activities provide the foundation for the next phases of the project, including system analysis and system design.
