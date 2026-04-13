Perfect — let’s do the **EduHub ER Diagram breakdown** in a way your team can actually use for:

- **database design**
- **backend API planning**
- **Draw.io ER diagram**
- **system documentation**

This is important because your guideline explicitly expects **database design**, **data models**, and diagrams such as **ER diagrams / class diagrams / use-case diagrams** depending on project requirements.

---

# 1. What the database must support

From your Phase 1 document, the system needs to support at least:

- secure login
- role-based access
- application submission
- admin approval
- automatic student number generation
- student profile management
- online course / module registration

So the database must cover those flows.

---

# 2. Main entities for EduHub

These are the core tables I recommend for your ERD:

```text
Role
User
Applicant
Application
ApplicationDocument
Student
EmergencyContact
Lecturer
Module
Semester
Registration
AdminActionLog
```

That is already enough for a strong student project.
It is not too small, and not too overcomplicated.

---

# 3. Recommended ER structure

## 3.1 Role

Stores system roles.

**Fields**

```text
role_id (PK)
role_name
description
```

**Examples**

```text
Applicant
Student
Lecturer
Admin
```

---

## 3.2 User

Stores login details for all system users.

**Fields**

```text
user_id (PK)
role_id (FK)
first_name
last_name
email
password_hash
phone
status
created_at
updated_at
```

**Relationship**

- One **Role** can have many **Users**
- Each **User** belongs to one **Role**

---

## 3.3 Applicant

Stores applicant-specific info before approval.

**Fields**

```text
applicant_id (PK)
user_id (FK)
id_number
date_of_birth
address
application_status
created_at
```

**Relationship**

- One **User** can be one **Applicant**
- One **Applicant** can have many **Applications**

---

## 3.4 Application

Stores admission applications.

**Fields**

```text
application_id (PK)
applicant_id (FK)
programme_name
application_date
status
reviewed_by_admin_id (FK, nullable)
review_date
remarks
```

**Status examples**

```text
Pending
Approved
Rejected
```

**Relationship**

- One **Applicant** can submit one or many **Applications**
- One **Application** may be reviewed by an admin user

---

## 3.5 ApplicationDocument

Stores uploaded documents.

**Fields**

```text
document_id (PK)
application_id (FK)
document_type
file_name
file_path
uploaded_at
```

**Examples**

```text
ID Copy
Results
Proof of Residence
```

**Relationship**

- One **Application** can have many **ApplicationDocuments**

---

## 3.6 Student

Created after an application is approved.

**Fields**

```text
student_id (PK)
user_id (FK)
application_id (FK)
student_number
admission_date
academic_status
```

**Relationship**

- One approved **Application** creates one **Student**
- One **User** can be one **Student**

---

## 3.7 EmergencyContact

Stores student emergency contacts.

**Fields**

```text
contact_id (PK)
student_id (FK)
full_name
relationship
phone
address
```

**Relationship**

- One **Student** can have many **EmergencyContacts**

---

## 3.8 Lecturer

Stores lecturer information.

**Fields**

```text
lecturer_id (PK)
user_id (FK)
staff_number
department
office_location
```

**Relationship**

- One **User** can be one **Lecturer**

---

## 3.9 Module

Stores academic modules / subjects.

**Fields**

```text
module_id (PK)
module_code
module_name
credits
department
lecturer_id (FK)
```

**Relationship**

- One **Lecturer** can teach many **Modules**
- One **Module** is assigned to one lecturer

---

## 3.10 Semester

Stores semester periods.

**Fields**

```text
semester_id (PK)
semester_name
start_date
end_date
registration_open
registration_close
```

**Examples**

```text
Semester 1 2026
Semester 2 2026
```

---

## 3.11 Registration

Stores module registrations by students.

**Fields**

```text
registration_id (PK)
student_id (FK)
module_id (FK)
semester_id (FK)
registration_date
registration_status
```

**Relationship**

- One **Student** can register many modules
- One **Module** can have many students
- This table resolves the many-to-many relationship between **Student** and **Module**

---

## 3.12 AdminActionLog

Tracks admin decisions.

**Fields**

```text
log_id (PK)
admin_user_id (FK)
action_type
target_type
target_id
action_date
notes
```

**Examples**

```text
Approved Application
Rejected Application
Generated Student Number
```

---

# 4. Main relationships for your ERD

These are the lines you will draw in Draw.io:

```text
Role 1 --- M User

User 1 --- 0..1 Applicant
User 1 --- 0..1 Student
User 1 --- 0..1 Lecturer

Applicant 1 --- M Application
Application 1 --- M ApplicationDocument

Application 1 --- 0..1 Student

Student 1 --- M EmergencyContact
Student 1 --- M Registration

Lecturer 1 --- M Module

Module 1 --- M Registration
Semester 1 --- M Registration
```

That gives you a clean academic system ERD.

---

# 5. Simple ERD logic in plain English

Here’s the full flow:

1. A **user** with role **Applicant** logs in.
2. The applicant submits an **application**.
3. The application may have many **documents**.
4. An **admin** reviews and approves it.
5. Once approved, the system creates a **student** record and generates a student number.
6. The student can add **emergency contacts**.
7. The student registers for **modules** in a specific **semester**.
8. A **lecturer** is attached to modules.
9. Registrations link students to modules.

That matches your project purpose very well.

---

# 6. Suggested normalization

For your report, you can say the design avoids redundancy by:

- separating **users** from **roles**
- separating **applications** from **documents**
- separating **students** from **registrations**
- using **registration** as a linking table between student and module

That sounds solid academically and supports normalization discussion.

---

# 7. Best way to split this among your team

With 6 students, I’d divide the ERD work like this:

- **Database owner**: creates final ERD
- **Backend owner**: checks fields match API needs
- **Frontend owner**: checks fields match form inputs
- **Documentation owner**: writes ERD explanation in report
- **QA owner**: checks business rules
- **PM/reviewer**: reviews completeness

So everyone touches it, but one person owns it.

---

# 8. Draw.io layout suggestion

Put the ERD in 4 zones:

### Security / Access

```text
Role
User
```

### Admissions

```text
Applicant
Application
ApplicationDocument
```

### Academic Core

```text
Student
Module
Semester
Registration
```

### Staff / Control

```text
Lecturer
AdminActionLog
EmergencyContact
```

This makes the diagram cleaner and easier to explain.

---

# 9. Business rules you can mention in the report

These help a lot in documentation:

```text
A user must have one role.
An applicant can submit an application.
An application can have many supporting documents.
Only approved applications can become student records.
A student can register for many modules.
A module can have many students.
A lecturer can teach many modules.
Registrations happen within a semester.
```

These rules make your ERD look intentional, not random.

---

# 10. Minimal version vs fuller version

## Minimal version

Use only:

```text
Role, User, Applicant, Application, Student, Lecturer, Module, Registration
```

## Better version

Use:

```text
Role, User, Applicant, Application, ApplicationDocument, Student, EmergencyContact, Lecturer, Module, Semester, Registration, AdminActionLog
```

I recommend the **better version**.
It is still manageable, but it looks much stronger for marks.

---

# 11. Ready-to-draw ERD text

You can paste this into your team chat or docs:

```text
Role(role_id PK, role_name, description)

User(user_id PK, role_id FK, first_name, last_name, email, password_hash, phone, status, created_at, updated_at)

Applicant(applicant_id PK, user_id FK, id_number, date_of_birth, address, application_status, created_at)

Application(application_id PK, applicant_id FK, programme_name, application_date, status, reviewed_by_admin_id FK, review_date, remarks)

ApplicationDocument(document_id PK, application_id FK, document_type, file_name, file_path, uploaded_at)

Student(student_id PK, user_id FK, application_id FK, student_number, admission_date, academic_status)

EmergencyContact(contact_id PK, student_id FK, full_name, relationship, phone, address)

Lecturer(lecturer_id PK, user_id FK, staff_number, department, office_location)

Module(module_id PK, module_code, module_name, credits, department, lecturer_id FK)

Semester(semester_id PK, semester_name, start_date, end_date, registration_open, registration_close)

Registration(registration_id PK, student_id FK, module_id FK, semester_id FK, registration_date, registration_status)

AdminActionLog(log_id PK, admin_user_id FK, action_type, target_type, target_id, action_date, notes)
```

---

# 12. What to do next

Your team should now do this in order:

1. Draw the **ER diagram** in Draw.io
2. Review the fields as a team
3. Convert tables into **database schema tasks**
4. Convert relationships into **backend issues**
5. Add the ERD screenshot to the **Planning / Design documentation**

This lines up nicely with your guideline’s requirement for **data models**, **database design**, and **system design artifacts**.

Next, I can do the **Use Case Diagram breakdown** in the same way, with actors, use cases, and system boundaries, so your Draw.io person can build it fast.
