# Student Database Table Schema

## Overview
This document outlines the database schema for storing student application data based on the Apply.html form fields.

---

## Table: `students`

### Primary Information

| Field Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| `id` | INT/UUID | PRIMARY KEY, AUTO_INCREMENT | Unique student record ID |
| `student_id` | VARCHAR(20) | UNIQUE, NOT NULL | Student reference number (e.g., "STU-2024-001") |
| `application_type` | ENUM('new', 'returning', 'other') | NOT NULL | Type of application |
| `admission_for` | ENUM('1st Semester', '2nd Semester', '1st Year', '2nd Year', '3rd Year') | NOT NULL | Admission period |
| `study_year` | TINYINT | NOT NULL, DEFAULT 1 | Study year (1, 2, or 3) |
| `application_status` | ENUM('pending', 'under_review', 'approved', 'rejected', 'cancelled') | DEFAULT 'pending' | Current application status |

---

### Personal Details

| Field Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| `first_name` | VARCHAR(100) | NOT NULL | Student's first name |
| `last_name` | VARCHAR(100) | NOT NULL | Student's last name |
| `nationality` | VARCHAR(50) | NOT NULL, DEFAULT 'South African' | Student's nationality |
| `id_number` | VARCHAR(13) | UNIQUE, NULL | SA ID number (13 digits) - required for SA nationals |
| `passport_number` | VARCHAR(20) | UNIQUE, NULL | Passport number - required for foreign nationals |
| `date_of_birth` | DATE | NOT NULL | Student's date of birth |
| `gender` | ENUM('Male', 'Female', 'Non-binary', 'Prefer not to say') | NOT NULL | Student's gender |
| `is_foreign_national` | BOOLEAN | DEFAULT FALSE | Computed: nationality != 'South African' |

---

### Contact Information

| Field Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| `phone` | VARCHAR(20) | NOT NULL | Primary phone number |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | Primary email address |
| `alt_email` | VARCHAR(255) | NULL | Alternative email address |

---

### Residential Address

| Field Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| `street_address` | VARCHAR(255) | NOT NULL | Street address |
| `suburb` | VARCHAR(100) | NULL | Suburb |
| `city` | VARCHAR(100) | NOT NULL | City |
| `province` | VARCHAR(50) | NOT NULL | Province/region |
| `postal_code` | VARCHAR(10) | NULL | Postal/ZIP code |

---

### Education Background

#### High School

| Field Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| `high_school` | VARCHAR(255) | NOT NULL | High school name |
| `high_school_year` | YEAR | NULL | Year completed |
| `highest_grade` | VARCHAR(50) | NOT NULL | Highest grade/qualification (e.g., "Grade 12 / Matric", "Grade 11", "GED", "N3") |

#### Tertiary Education (Optional)

| Field Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| `tertiary_institution` | VARCHAR(255) | NULL | Name of tertiary institution |
| `tertiary_qualification` | VARCHAR(255) | NULL | Qualification obtained |
| `tertiary_year` | YEAR | NULL | Year completed |

---

### Qualification & Programme

| Field Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| `qualification_code` | VARCHAR(20) | NOT NULL | Programme code (e.g., "BCOM-ACC") |
| `qualification_name` | VARCHAR(255) | NOT NULL | Full qualification name |

---

### Payer/Financial Information

| Field Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| `payer_name` | VARCHAR(255) | NOT NULL | Full name of account payer |
| `payer_relation` | ENUM('Self', 'Parent', 'Guardian', 'Sponsor', 'Employer', '') | NULL | Relationship to student |
| `payer_phone` | VARCHAR(20) | NOT NULL | Payer's phone number |
| `payer_email` | VARCHAR(255) | NULL | Payer's email address |
| `payer_address` | TEXT | NULL | Payer's address (if different) |

---

### Documents & Compliance

| Field Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| `docs_uploaded` | JSON/TEXT | NULL | Array of document names marked as ready |
| `tc_accepted` | BOOLEAN | NOT NULL, DEFAULT FALSE | Terms and conditions accepted |
| `tc_accepted_at` | TIMESTAMP | NULL | When T&C were accepted |

---

### Audit & Metadata

| Field Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Application submission timestamp |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Last update timestamp |
| `submitted_at` | TIMESTAMP | NULL | When application was submitted |
| `approved_at` | TIMESTAMP | NULL | When application was approved |
| `approved_by` | INT | NULL, FOREIGN KEY | Admin user who approved |

---

## Indexes

```sql
-- Primary lookup indexes
CREATE INDEX idx_student_id ON students(student_id);
CREATE INDEX idx_email ON students(email);
CREATE INDEX idx_id_number ON students(id_number);
CREATE INDEX idx_passport_number ON students(passport_number);

-- Search and filtering indexes
CREATE INDEX idx_application_status ON students(application_status);
CREATE INDEX idx_application_type ON students(application_type);
CREATE INDEX idx_qualification_code ON students(qualification_code);
CREATE INDEX idx_created_at ON students(created_at);
CREATE INDEX idx_nationality ON students(nationality);

-- Composite indexes for common queries
CREATE INDEX idx_status_created ON students(application_status, created_at);
CREATE INDEX idx_type_status ON students(application_type, application_status);
```

---

## Constraints & Business Rules

### Validation Rules

1. **ID/Passport Validation:**
   - If `nationality = 'South African'`: `id_number` is REQUIRED (13 digits)
   - If `nationality != 'South African'`: `passport_number` is REQUIRED (min 5 chars)
   - First 6 digits of SA ID must match date of birth (YYMMDD format)

2. **Email Validation:**
   - Must be a valid email format
   - Must be unique across all students

3. **Contact Validation:**
   - Phone number is required
   - Email is required

4. **Document Submission:**
   - All documents must be submitted within 3-5 business days of approval
   - Document requirements vary based on nationality:
     - **SA Nationals:** SA ID, Matric certificate, Tertiary qualifications, Proof of payment, Passport photo
     - **Foreign Nationals:** Passport (all pages), Study permit/visa, Highest qualification, Proof of payment, Passport photo, SAQA evaluation letter

5. **Terms & Conditions:**
   - `tc_accepted` must be TRUE before submission

---

## Sample SQL Table Creation (PostgreSQL)

```sql
CREATE TABLE students (
    -- Primary Information
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(20) UNIQUE NOT NULL,
    application_type VARCHAR(10) NOT NULL CHECK (application_type IN ('new', 'returning', 'other')),
    admission_for VARCHAR(20) NOT NULL CHECK (admission_for IN ('1st Semester', '2nd Semester', '1st Year', '2nd Year', '3rd Year')),
    study_year SMALLINT NOT NULL DEFAULT 1 CHECK (study_year BETWEEN 1 AND 3),
    application_status VARCHAR(20) DEFAULT 'pending' CHECK (application_status IN ('pending', 'under_review', 'approved', 'rejected', 'cancelled')),

    -- Personal Details
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    nationality VARCHAR(50) NOT NULL DEFAULT 'South African',
    id_number VARCHAR(13) UNIQUE,
    passport_number VARCHAR(20) UNIQUE,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20) NOT NULL CHECK (gender IN ('Male', 'Female', 'Non-binary', 'Prefer not to say')),
    is_foreign_national BOOLEAN GENERATED ALWAYS AS (nationality != 'South African') STORED,

    -- Contact Information
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    alt_email VARCHAR(255),

    -- Residential Address
    street_address VARCHAR(255) NOT NULL,
    suburb VARCHAR(100),
    city VARCHAR(100) NOT NULL,
    province VARCHAR(50) NOT NULL,
    postal_code VARCHAR(10),

    -- Education Background
    high_school VARCHAR(255) NOT NULL,
    high_school_year INTEGER,
    highest_grade VARCHAR(50) NOT NULL,
    tertiary_institution VARCHAR(255),
    tertiary_qualification VARCHAR(255),
    tertiary_year INTEGER,

    -- Qualification & Programme
    qualification_code VARCHAR(20) NOT NULL,
    qualification_name VARCHAR(255) NOT NULL,

    -- Payer Information
    payer_name VARCHAR(255) NOT NULL,
    payer_relation VARCHAR(20) CHECK (payer_relation IN ('Self', 'Parent', 'Guardian', 'Sponsor', 'Employer', '')),
    payer_phone VARCHAR(20) NOT NULL,
    payer_email VARCHAR(255),
    payer_address TEXT,

    -- Documents & Compliance
    docs_uploaded JSONB,
    tc_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    tc_accepted_at TIMESTAMP,

    -- Audit & Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP,
    approved_at TIMESTAMP,
    approved_by INTEGER,

    -- Constraints
    CONSTRAINT chk_id_or_passport CHECK (
        (nationality = 'South African' AND id_number IS NOT NULL AND LENGTH(id_number) = 13) OR
        (nationality != 'South African' AND passport_number IS NOT NULL AND LENGTH(passport_number) >= 5)
    )
);

-- Triggers for auto-updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## Related Tables (Recommended)

### 1. `student_documents` Table
Store individual document records with upload status and file paths.

```sql
CREATE TABLE student_documents (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id),
    document_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    file_path VARCHAR(500),
    is_ready BOOLEAN DEFAULT FALSE,
    uploaded_at TIMESTAMP,
    verified_by INTEGER,
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. `qualifications` Table
Store available programmes/qualifications.

```sql
CREATE TABLE qualifications (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    faculty VARCHAR(100),
    duration VARCHAR(50),
    fee DECIMAL(10,2),
    is_active BOOLEAN DEFAULT TRUE
);
```

### 3. `modules` Table
Store modules for each qualification.

```sql
CREATE TABLE modules (
    id SERIAL PRIMARY KEY,
    qualification_id INTEGER REFERENCES qualifications(id),
    code VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    year SMALLINT,
    semester SMALLINT,
    credits INTEGER
);
```

### 4. `student_modules` Table
Track which modules a student is enrolled in.

```sql
CREATE TABLE student_modules (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id),
    module_id INTEGER REFERENCES modules(id),
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'enrolled'
);
```

---

## Notes

1. **Nationality List:** The system supports 26+ nationalities including South African, Zimbabwean, Mozambican, Zambian, Malawian, Botswanan, Namibian, Swazi, Lesothan, Congolese (DRC), Nigerian, Ghanaian, Kenyan, Tanzanian, Ugandan, Rwandan, British, American, Canadian, Australian, German, French, Indian, Pakistani, Brazilian, and Other.

2. **Province List (SA):** Gauteng, Western Cape, KwaZulu-Natal, Eastern Cape, Limpopo, Mpumalanga, North West, Free State, Northern Cape.

3. **Document Storage:** The `docs_uploaded` field stores a JSON array of document names. Consider creating a separate `student_documents` table for better document management.

4. **Data Privacy:** Ensure POPIA compliance (South African data protection law) by:
   - Encrypting sensitive fields (ID numbers, passport numbers)
   - Implementing access controls
   - Maintaining audit logs
   - Allowing students to request data deletion

5. **Foreign Key Relationships:** Create foreign keys to related tables for:
   - Qualifications
   - Modules
   - Documents
   - Administrative users (for approval tracking)
