--
-- PostgreSQL database dump
--

\restrict FmUVce9RIZk2PWdNGhm8VSDPn5GxHgOLAOp60Kj3Fht3pdb443ApGkCIuqqUQFp

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
-- Name: enum_Applications_gender; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_Applications_gender" AS ENUM (
    'male',
    'female',
    'other'
);


--
-- Name: enum_Applications_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_Applications_status" AS ENUM (
    'pending',
    'approved',
    'declined'
);


--
-- Name: enum_AuditLogs_action; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_AuditLogs_action" AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE'
);


--
-- Name: enum_Registrations_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_Registrations_status" AS ENUM (
    'pending',
    'approved',
    'declined'
);


--
-- Name: enum_Users_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_Users_role" AS ENUM (
    'admin',
    'student',
    'lecturer'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Applications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Applications" (
    id integer NOT NULL,
    "referenceNumber" character varying(255),
    "firstName" character varying(255) NOT NULL,
    "lastName" character varying(255) NOT NULL,
    "idNumber" character varying(255) NOT NULL,
    "dateOfBirth" date NOT NULL,
    gender public."enum_Applications_gender" NOT NULL,
    nationality character varying(255) NOT NULL,
    phone character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    "addressStreet" character varying(255),
    "addressCity" character varying(255),
    "addressProvince" character varying(255),
    "addressPostalCode" character varying(255),
    "highSchool" character varying(255),
    "matricYear" integer,
    "matricSubjects" jsonb,
    "previousTertiary" jsonb,
    "payerName" character varying(255),
    "payerRelation" character varying(255),
    "payerPhone" character varying(255),
    "payerEmail" character varying(255),
    "qualificationId" integer,
    "qualificationName" character varying(255),
    documents jsonb,
    "termsAccepted" boolean DEFAULT false,
    status public."enum_Applications_status" DEFAULT 'pending'::public."enum_Applications_status",
    "declineReason" text,
    "userId" integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: Applications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Applications_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Applications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Applications_id_seq" OWNED BY public."Applications".id;


--
-- Name: AuditLogs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AuditLogs" (
    id integer NOT NULL,
    "tableName" character varying(100) NOT NULL,
    action public."enum_AuditLogs_action" NOT NULL,
    "recordId" integer,
    "userId" integer,
    "oldData" jsonb,
    "newData" jsonb,
    "ipAddress" character varying(45),
    "userAgent" text,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: COLUMN "AuditLogs"."tableName"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."AuditLogs"."tableName" IS 'Name of the table being audited';


--
-- Name: COLUMN "AuditLogs".action; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."AuditLogs".action IS 'Type of database action';


--
-- Name: COLUMN "AuditLogs"."recordId"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."AuditLogs"."recordId" IS 'ID of the record that was modified';


--
-- Name: COLUMN "AuditLogs"."userId"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."AuditLogs"."userId" IS 'User who performed the action';


--
-- Name: COLUMN "AuditLogs"."oldData"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."AuditLogs"."oldData" IS 'Previous state of the record (for UPDATE and DELETE)';


--
-- Name: COLUMN "AuditLogs"."newData"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."AuditLogs"."newData" IS 'New state of the record (for INSERT and UPDATE)';


--
-- Name: COLUMN "AuditLogs"."ipAddress"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."AuditLogs"."ipAddress" IS 'IP address of the client';


--
-- Name: COLUMN "AuditLogs"."userAgent"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."AuditLogs"."userAgent" IS 'Browser/client user agent';


--
-- Name: AuditLogs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."AuditLogs_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: AuditLogs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."AuditLogs_id_seq" OWNED BY public."AuditLogs".id;


--
-- Name: Modules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Modules" (
    id integer NOT NULL,
    code character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    credits integer,
    year integer,
    semester integer,
    "qualificationId" integer NOT NULL,
    "isActive" boolean DEFAULT true,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: Modules_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Modules_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Modules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Modules_id_seq" OWNED BY public."Modules".id;


--
-- Name: Qualifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Qualifications" (
    id integer NOT NULL,
    code character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    faculty character varying(255),
    "durationYears" integer,
    "totalFee" numeric(10,2),
    "isActive" boolean DEFAULT true,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: Qualifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Qualifications_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Qualifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Qualifications_id_seq" OWNED BY public."Qualifications".id;


--
-- Name: Registrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Registrations" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "semesterId" integer NOT NULL,
    modules jsonb NOT NULL,
    "quotationAmount" numeric(10,2),
    status public."enum_Registrations_status" DEFAULT 'pending'::public."enum_Registrations_status",
    "declineReason" text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: Registrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Registrations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Registrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Registrations_id_seq" OWNED BY public."Registrations".id;


--
-- Name: Semesters; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Semesters" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    year integer NOT NULL,
    "semesterNumber" integer NOT NULL,
    "startDate" date,
    "endDate" date,
    "isActive" boolean DEFAULT false,
    "registrationOpen" boolean DEFAULT false,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: Semesters_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Semesters_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Semesters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Semesters_id_seq" OWNED BY public."Semesters".id;


--
-- Name: Users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Users" (
    id integer NOT NULL,
    "studentNumber" character varying(255),
    "firstName" character varying(255) NOT NULL,
    "lastName" character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    role public."enum_Users_role" DEFAULT 'student'::public."enum_Users_role",
    "isPasswordChanged" boolean DEFAULT false,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: Users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Users_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Users_id_seq" OWNED BY public."Users".id;


--
-- Name: Applications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Applications" ALTER COLUMN id SET DEFAULT nextval('public."Applications_id_seq"'::regclass);


--
-- Name: AuditLogs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AuditLogs" ALTER COLUMN id SET DEFAULT nextval('public."AuditLogs_id_seq"'::regclass);


--
-- Name: Modules id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Modules" ALTER COLUMN id SET DEFAULT nextval('public."Modules_id_seq"'::regclass);


--
-- Name: Qualifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Qualifications" ALTER COLUMN id SET DEFAULT nextval('public."Qualifications_id_seq"'::regclass);


--
-- Name: Registrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Registrations" ALTER COLUMN id SET DEFAULT nextval('public."Registrations_id_seq"'::regclass);


--
-- Name: Semesters id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Semesters" ALTER COLUMN id SET DEFAULT nextval('public."Semesters_id_seq"'::regclass);


--
-- Name: Users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users" ALTER COLUMN id SET DEFAULT nextval('public."Users_id_seq"'::regclass);


--
-- Name: Applications Applications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Applications"
    ADD CONSTRAINT "Applications_pkey" PRIMARY KEY (id);


--
-- Name: Applications Applications_referenceNumber_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Applications"
    ADD CONSTRAINT "Applications_referenceNumber_key" UNIQUE ("referenceNumber");


--
-- Name: AuditLogs AuditLogs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AuditLogs"
    ADD CONSTRAINT "AuditLogs_pkey" PRIMARY KEY (id);


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
-- Name: Users Users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key" UNIQUE (email);


--
-- Name: Users Users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_pkey" PRIMARY KEY (id);


--
-- Name: Users Users_studentNumber_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_studentNumber_key" UNIQUE ("studentNumber");


--
-- Name: audit_logs_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_logs_created_at_idx ON public."AuditLogs" USING btree ("createdAt");


--
-- Name: audit_logs_table_action_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_logs_table_action_date_idx ON public."AuditLogs" USING btree ("tableName", action, "createdAt");


--
-- Name: audit_logs_table_name_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_logs_table_name_idx ON public."AuditLogs" USING btree ("tableName");


--
-- Name: audit_logs_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_logs_user_id_idx ON public."AuditLogs" USING btree ("userId");


--
-- Name: Applications Applications_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Applications"
    ADD CONSTRAINT "Applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: AuditLogs AuditLogs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AuditLogs"
    ADD CONSTRAINT "AuditLogs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON DELETE SET NULL;


--
-- Name: Modules Modules_qualificationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Modules"
    ADD CONSTRAINT "Modules_qualificationId_fkey" FOREIGN KEY ("qualificationId") REFERENCES public."Qualifications"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Registrations Registrations_semesterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Registrations"
    ADD CONSTRAINT "Registrations_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES public."Semesters"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Registrations Registrations_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Registrations"
    ADD CONSTRAINT "Registrations_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict FmUVce9RIZk2PWdNGhm8VSDPn5GxHgOLAOp60Kj3Fht3pdb443ApGkCIuqqUQFp

