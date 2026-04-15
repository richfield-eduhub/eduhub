--
-- PostgreSQL database dump
--

\restrict OfIotr18AsLOYwAiJc2xSWOFPPPeaXQrFSMiEYViQT27h9fmWVILpq7bjJwvFim

-- Dumped from database version 16.13 (Debian 16.13-1.pgdg13+1)
-- Dumped by pg_dump version 16.13 (Debian 16.13-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: enum_Application_Documents_document_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_Application_Documents_document_type" AS ENUM (
    'id_document',
    'matric_certificate',
    'tertiary_transcript',
    'proof_of_payment',
    'passport_photo',
    'study_permit',
    'saqa_evaluation',
    'other'
);


--
-- Name: enum_Applications_admission_for; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_Applications_admission_for" AS ENUM (
    '1st Semester',
    '2nd Semester',
    '1st Year',
    '2nd Year',
    '3rd Year'
);


--
-- Name: enum_Applications_application_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_Applications_application_type" AS ENUM (
    'new',
    'returning',
    'transfer'
);


--
-- Name: enum_Applications_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_Applications_status" AS ENUM (
    'draft',
    'pending',
    'under_review',
    'approved',
    'rejected',
    'cancelled'
);


--
-- Name: enum_Notifications_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_Notifications_type" AS ENUM (
    'info',
    'success',
    'warning',
    'error'
);


--
-- Name: enum_Registrations_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_Registrations_status" AS ENUM (
    'pending',
    'approved',
    'dropped',
    'completed',
    'failed',
    'declined'
);


--
-- Name: enum_Students_academic_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_Students_academic_status" AS ENUM (
    'active',
    'on_leave',
    'completed',
    'withdrawn'
);


--
-- Name: enum_User_Details_gender; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_User_Details_gender" AS ENUM (
    'Male',
    'Female',
    'Non-binary',
    'Prefer not to say'
);


--
-- Name: enum_User_Details_lifecycle_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_User_Details_lifecycle_status" AS ENUM (
    'applicant',
    'applied',
    'enrolled',
    'alumni',
    'dropped_out',
    'rejected'
);


--
-- Name: enum_Users_account_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_Users_account_status" AS ENUM (
    'active',
    'pending_verification',
    'blocked',
    'suspended',
    'terminated'
);


--
-- Name: enum_Users_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_Users_role" AS ENUM (
    'student',
    'lecturer',
    'admin'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Application_Documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Application_Documents" (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    application_id uuid NOT NULL,
    document_type public."enum_Application_Documents_document_type" NOT NULL,
    file_name character varying(255) NOT NULL,
    file_path character varying(500) NOT NULL,
    file_size integer,
    mime_type character varying(100),
    is_verified boolean DEFAULT false,
    verified_by uuid,
    verified_at timestamp with time zone,
    uploaded_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: Applications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Applications" (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    reference_number character varying(20),
    qualification_id uuid,
    admission_for public."enum_Applications_admission_for",
    application_type public."enum_Applications_application_type",
    high_school character varying(255),
    high_school_year integer,
    highest_grade character varying(50),
    matric_subjects jsonb,
    tertiary_institution character varying(255),
    tertiary_qualification character varying(255),
    tertiary_year integer,
    payer_name character varying(255),
    payer_relation character varying(50),
    payer_phone character varying(20),
    payer_email character varying(255),
    payer_address text,
    status public."enum_Applications_status" DEFAULT 'draft'::public."enum_Applications_status",
    tc_accepted boolean DEFAULT false NOT NULL,
    tc_accepted_at timestamp with time zone,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    rejection_reason text,
    submitted_at timestamp with time zone,
    approved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: Audit_Logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Audit_Logs" (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    action character varying(100) NOT NULL,
    table_name character varying(100),
    record_id uuid,
    old_data jsonb,
    new_data jsonb,
    ip_address character varying(45),
    user_agent text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: Emergency_Contacts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Emergency_Contacts" (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    name character varying(100) NOT NULL,
    relationship character varying(50) NOT NULL,
    phone character varying(20) NOT NULL,
    alt_phone character varying(20),
    email character varying(255),
    is_primary boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: Lecturers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Lecturers" (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    employee_number character varying(20) NOT NULL,
    department character varying(100),
    title character varying(50),
    specialization text,
    hire_date date,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: Module_Lecturers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Module_Lecturers" (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    module_id uuid NOT NULL,
    lecturer_id uuid NOT NULL,
    semester_id uuid NOT NULL,
    is_primary boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: Modules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Modules" (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    qualification_id uuid NOT NULL,
    code character varying(20) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    credits integer NOT NULL,
    year integer,
    semester integer,
    prerequisites jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: Notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Notifications" (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    title character varying(200) NOT NULL,
    message text NOT NULL,
    type public."enum_Notifications_type",
    is_read boolean DEFAULT false,
    link_url character varying(500),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: Qualifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Qualifications" (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    code character varying(20) NOT NULL,
    name character varying(255) NOT NULL,
    faculty character varying(100),
    duration_years integer,
    total_fee numeric(10,2),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: Registrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Registrations" (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    student_id uuid NOT NULL,
    module_id uuid NOT NULL,
    semester_id uuid NOT NULL,
    status public."enum_Registrations_status" DEFAULT 'pending'::public."enum_Registrations_status",
    quotation_amount numeric(10,2),
    approved_by uuid,
    approved_at timestamp with time zone,
    decline_reason text,
    grade character varying(5),
    marks numeric(5,2),
    registration_date timestamp with time zone DEFAULT now() NOT NULL,
    dropped_at timestamp with time zone,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: Semesters; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Semesters" (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    year integer NOT NULL,
    semester_number integer NOT NULL,
    start_date date,
    end_date date,
    registration_open boolean DEFAULT false,
    registration_start_date date,
    registration_end_date date,
    add_drop_deadline date,
    is_active boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: Students; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Students" (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    student_number character varying(20) NOT NULL,
    qualification_id uuid,
    year_of_study integer DEFAULT 1,
    enrollment_date date NOT NULL,
    academic_status public."enum_Students_academic_status" DEFAULT 'active'::public."enum_Students_academic_status",
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: User_Details; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User_Details" (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    date_of_birth date NOT NULL,
    gender public."enum_User_Details_gender",
    nationality character varying(100) DEFAULT 'South African'::character varying,
    id_number character varying(13),
    passport_number character varying(20),
    phone character varying(20) NOT NULL,
    alt_phone character varying(20),
    alt_email character varying(255),
    street_address character varying(255),
    suburb character varying(100),
    city character varying(100),
    province character varying(50),
    postal_code character varying(10),
    lifecycle_status public."enum_User_Details_lifecycle_status",
    profile_photo_url character varying(500),
    bio text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: Users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Users" (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    member_number character varying(20),
    role public."enum_Users_role" NOT NULL,
    account_status public."enum_Users_account_status" DEFAULT 'pending_verification'::public."enum_Users_account_status",
    status_reason text,
    status_changed_at timestamp with time zone,
    status_changed_by uuid,
    is_verified boolean DEFAULT false,
    verification_token character varying(255),
    verification_expires timestamp with time zone,
    is_default_password boolean DEFAULT true,
    password_reset_token character varying(255),
    password_reset_expires timestamp with time zone,
    last_password_change timestamp with time zone,
    require_password_change boolean DEFAULT false,
    failed_login_attempts integer DEFAULT 0,
    last_failed_login timestamp with time zone,
    last_login timestamp with time zone,
    last_login_ip character varying(45),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: Application_Documents Application_Documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Application_Documents"
    ADD CONSTRAINT "Application_Documents_pkey" PRIMARY KEY (id);


--
-- Name: Applications Applications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Applications"
    ADD CONSTRAINT "Applications_pkey" PRIMARY KEY (id);


--
-- Name: Applications Applications_reference_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Applications"
    ADD CONSTRAINT "Applications_reference_number_key" UNIQUE (reference_number);


--
-- Name: Audit_Logs Audit_Logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Audit_Logs"
    ADD CONSTRAINT "Audit_Logs_pkey" PRIMARY KEY (id);


--
-- Name: Emergency_Contacts Emergency_Contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Emergency_Contacts"
    ADD CONSTRAINT "Emergency_Contacts_pkey" PRIMARY KEY (id);


--
-- Name: Lecturers Lecturers_employee_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Lecturers"
    ADD CONSTRAINT "Lecturers_employee_number_key" UNIQUE (employee_number);


--
-- Name: Lecturers Lecturers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Lecturers"
    ADD CONSTRAINT "Lecturers_pkey" PRIMARY KEY (id);


--
-- Name: Lecturers Lecturers_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Lecturers"
    ADD CONSTRAINT "Lecturers_user_id_key" UNIQUE (user_id);


--
-- Name: Module_Lecturers Module_Lecturers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Module_Lecturers"
    ADD CONSTRAINT "Module_Lecturers_pkey" PRIMARY KEY (id);


--
-- Name: Modules Modules_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Modules"
    ADD CONSTRAINT "Modules_code_key" UNIQUE (code);


--
-- Name: Modules Modules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Modules"
    ADD CONSTRAINT "Modules_pkey" PRIMARY KEY (id);


--
-- Name: Notifications Notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notifications"
    ADD CONSTRAINT "Notifications_pkey" PRIMARY KEY (id);


--
-- Name: Qualifications Qualifications_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Qualifications"
    ADD CONSTRAINT "Qualifications_code_key" UNIQUE (code);


--
-- Name: Qualifications Qualifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Qualifications"
    ADD CONSTRAINT "Qualifications_pkey" PRIMARY KEY (id);


--
-- Name: Registrations Registrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Registrations"
    ADD CONSTRAINT "Registrations_pkey" PRIMARY KEY (id);


--
-- Name: Semesters Semesters_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Semesters"
    ADD CONSTRAINT "Semesters_pkey" PRIMARY KEY (id);


--
-- Name: Students Students_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Students"
    ADD CONSTRAINT "Students_pkey" PRIMARY KEY (id);


--
-- Name: Students Students_student_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Students"
    ADD CONSTRAINT "Students_student_number_key" UNIQUE (student_number);


--
-- Name: Students Students_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Students"
    ADD CONSTRAINT "Students_user_id_key" UNIQUE (user_id);


--
-- Name: User_Details User_Details_id_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User_Details"
    ADD CONSTRAINT "User_Details_id_number_key" UNIQUE (id_number);


--
-- Name: User_Details User_Details_passport_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User_Details"
    ADD CONSTRAINT "User_Details_passport_number_key" UNIQUE (passport_number);


--
-- Name: User_Details User_Details_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User_Details"
    ADD CONSTRAINT "User_Details_pkey" PRIMARY KEY (id);


--
-- Name: User_Details User_Details_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User_Details"
    ADD CONSTRAINT "User_Details_user_id_key" UNIQUE (user_id);


--
-- Name: Users Users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key" UNIQUE (email);


--
-- Name: Users Users_member_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_member_number_key" UNIQUE (member_number);


--
-- Name: Users Users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_pkey" PRIMARY KEY (id);


--
-- Name: idx_application_documents_application_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_application_documents_application_id ON public."Application_Documents" USING btree (application_id);


--
-- Name: idx_application_documents_document_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_application_documents_document_type ON public."Application_Documents" USING btree (document_type);


--
-- Name: idx_applications_qualification_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_applications_qualification_id ON public."Applications" USING btree (qualification_id);


--
-- Name: idx_applications_reference_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_applications_reference_number ON public."Applications" USING btree (reference_number);


--
-- Name: idx_applications_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_applications_status ON public."Applications" USING btree (status);


--
-- Name: idx_applications_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_applications_user_id ON public."Applications" USING btree (user_id);


--
-- Name: idx_audit_logs_action; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_action ON public."Audit_Logs" USING btree (action);


--
-- Name: idx_audit_logs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_created_at ON public."Audit_Logs" USING btree (created_at);


--
-- Name: idx_audit_logs_table_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_table_name ON public."Audit_Logs" USING btree (table_name);


--
-- Name: idx_audit_logs_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_user_id ON public."Audit_Logs" USING btree (user_id);


--
-- Name: idx_emergency_contacts_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_emergency_contacts_user_id ON public."Emergency_Contacts" USING btree (user_id);


--
-- Name: idx_lecturers_department; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lecturers_department ON public."Lecturers" USING btree (department);


--
-- Name: idx_lecturers_employee_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lecturers_employee_number ON public."Lecturers" USING btree (employee_number);


--
-- Name: idx_lecturers_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lecturers_user_id ON public."Lecturers" USING btree (user_id);


--
-- Name: idx_module_lecturers_lecturer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_module_lecturers_lecturer_id ON public."Module_Lecturers" USING btree (lecturer_id);


--
-- Name: idx_module_lecturers_module_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_module_lecturers_module_id ON public."Module_Lecturers" USING btree (module_id);


--
-- Name: idx_module_lecturers_semester_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_module_lecturers_semester_id ON public."Module_Lecturers" USING btree (semester_id);


--
-- Name: idx_module_lecturers_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_module_lecturers_unique ON public."Module_Lecturers" USING btree (module_id, lecturer_id, semester_id);


--
-- Name: idx_modules_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_modules_code ON public."Modules" USING btree (code);


--
-- Name: idx_modules_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_modules_is_active ON public."Modules" USING btree (is_active);


--
-- Name: idx_modules_qualification_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_modules_qualification_id ON public."Modules" USING btree (qualification_id);


--
-- Name: idx_notifications_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_created_at ON public."Notifications" USING btree (created_at);


--
-- Name: idx_notifications_is_read; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_is_read ON public."Notifications" USING btree (is_read);


--
-- Name: idx_notifications_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_user_id ON public."Notifications" USING btree (user_id);


--
-- Name: idx_qualifications_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_qualifications_code ON public."Qualifications" USING btree (code);


--
-- Name: idx_qualifications_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_qualifications_is_active ON public."Qualifications" USING btree (is_active);


--
-- Name: idx_registrations_module_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_registrations_module_id ON public."Registrations" USING btree (module_id);


--
-- Name: idx_registrations_semester_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_registrations_semester_id ON public."Registrations" USING btree (semester_id);


--
-- Name: idx_registrations_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_registrations_status ON public."Registrations" USING btree (status);


--
-- Name: idx_registrations_student_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_registrations_student_id ON public."Registrations" USING btree (student_id);


--
-- Name: idx_registrations_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_registrations_unique ON public."Registrations" USING btree (student_id, module_id, semester_id);


--
-- Name: idx_semesters_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_semesters_is_active ON public."Semesters" USING btree (is_active);


--
-- Name: idx_semesters_year; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_semesters_year ON public."Semesters" USING btree (year);


--
-- Name: idx_semesters_year_semester_number; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_semesters_year_semester_number ON public."Semesters" USING btree (year, semester_number);


--
-- Name: idx_students_qualification_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_students_qualification_id ON public."Students" USING btree (qualification_id);


--
-- Name: idx_students_student_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_students_student_number ON public."Students" USING btree (student_number);


--
-- Name: idx_students_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_students_user_id ON public."Students" USING btree (user_id);


--
-- Name: idx_user_details_id_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_details_id_number ON public."User_Details" USING btree (id_number);


--
-- Name: idx_user_details_lifecycle_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_details_lifecycle_status ON public."User_Details" USING btree (lifecycle_status);


--
-- Name: idx_user_details_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_details_user_id ON public."User_Details" USING btree (user_id);


--
-- Name: idx_users_account_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_account_status ON public."Users" USING btree (account_status);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_email ON public."Users" USING btree (email);


--
-- Name: idx_users_member_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_member_number ON public."Users" USING btree (member_number);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_role ON public."Users" USING btree (role);


--
-- Name: Application_Documents Application_Documents_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Application_Documents"
    ADD CONSTRAINT "Application_Documents_application_id_fkey" FOREIGN KEY (application_id) REFERENCES public."Applications"(id) ON DELETE CASCADE;


--
-- Name: Application_Documents Application_Documents_verified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Application_Documents"
    ADD CONSTRAINT "Application_Documents_verified_by_fkey" FOREIGN KEY (verified_by) REFERENCES public."Users"(id) ON DELETE SET NULL;


--
-- Name: Applications Applications_qualification_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Applications"
    ADD CONSTRAINT "Applications_qualification_id_fkey" FOREIGN KEY (qualification_id) REFERENCES public."Qualifications"(id) ON DELETE SET NULL;


--
-- Name: Applications Applications_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Applications"
    ADD CONSTRAINT "Applications_reviewed_by_fkey" FOREIGN KEY (reviewed_by) REFERENCES public."Users"(id) ON DELETE SET NULL;


--
-- Name: Applications Applications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Applications"
    ADD CONSTRAINT "Applications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."Users"(id) ON DELETE CASCADE;


--
-- Name: Audit_Logs Audit_Logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Audit_Logs"
    ADD CONSTRAINT "Audit_Logs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."Users"(id) ON DELETE SET NULL;


--
-- Name: Emergency_Contacts Emergency_Contacts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Emergency_Contacts"
    ADD CONSTRAINT "Emergency_Contacts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."Users"(id) ON DELETE CASCADE;


--
-- Name: Lecturers Lecturers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Lecturers"
    ADD CONSTRAINT "Lecturers_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."Users"(id) ON DELETE CASCADE;


--
-- Name: Module_Lecturers Module_Lecturers_lecturer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Module_Lecturers"
    ADD CONSTRAINT "Module_Lecturers_lecturer_id_fkey" FOREIGN KEY (lecturer_id) REFERENCES public."Lecturers"(id) ON DELETE CASCADE;


--
-- Name: Module_Lecturers Module_Lecturers_module_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Module_Lecturers"
    ADD CONSTRAINT "Module_Lecturers_module_id_fkey" FOREIGN KEY (module_id) REFERENCES public."Modules"(id) ON DELETE CASCADE;


--
-- Name: Module_Lecturers Module_Lecturers_semester_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Module_Lecturers"
    ADD CONSTRAINT "Module_Lecturers_semester_id_fkey" FOREIGN KEY (semester_id) REFERENCES public."Semesters"(id) ON DELETE CASCADE;


--
-- Name: Modules Modules_qualification_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Modules"
    ADD CONSTRAINT "Modules_qualification_id_fkey" FOREIGN KEY (qualification_id) REFERENCES public."Qualifications"(id) ON DELETE CASCADE;


--
-- Name: Notifications Notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notifications"
    ADD CONSTRAINT "Notifications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."Users"(id) ON DELETE CASCADE;


--
-- Name: Registrations Registrations_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Registrations"
    ADD CONSTRAINT "Registrations_approved_by_fkey" FOREIGN KEY (approved_by) REFERENCES public."Users"(id) ON DELETE SET NULL;


--
-- Name: Registrations Registrations_module_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Registrations"
    ADD CONSTRAINT "Registrations_module_id_fkey" FOREIGN KEY (module_id) REFERENCES public."Modules"(id) ON DELETE RESTRICT;


--
-- Name: Registrations Registrations_semester_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Registrations"
    ADD CONSTRAINT "Registrations_semester_id_fkey" FOREIGN KEY (semester_id) REFERENCES public."Semesters"(id) ON DELETE RESTRICT;


--
-- Name: Registrations Registrations_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Registrations"
    ADD CONSTRAINT "Registrations_student_id_fkey" FOREIGN KEY (student_id) REFERENCES public."Students"(id) ON DELETE RESTRICT;


--
-- Name: Students Students_qualification_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Students"
    ADD CONSTRAINT "Students_qualification_id_fkey" FOREIGN KEY (qualification_id) REFERENCES public."Qualifications"(id) ON DELETE SET NULL;


--
-- Name: Students Students_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Students"
    ADD CONSTRAINT "Students_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."Users"(id) ON DELETE CASCADE;


--
-- Name: User_Details User_Details_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User_Details"
    ADD CONSTRAINT "User_Details_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."Users"(id) ON DELETE CASCADE;


--
-- Name: Users fk_users_status_changed_by; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT fk_users_status_changed_by FOREIGN KEY (status_changed_by) REFERENCES public."Users"(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict OfIotr18AsLOYwAiJc2xSWOFPPPeaXQrFSMiEYViQT27h9fmWVILpq7bjJwvFim

