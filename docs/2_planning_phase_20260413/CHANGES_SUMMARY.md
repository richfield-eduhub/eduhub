# Planning Phase Document - Changes Summary

## Overview
The planning-phase-submission.md document has been completely rewritten to:
1. Remove all Library/Librarian references
2. Simplify language to sound more student-written
3. Add helpful diagrams and visualizations
4. Maintain all technical content and existing diagrams

---

## Changes Made

### 1. Library/Librarian References Removed ✓

**Total references removed: ~40+**

#### Sections Removed:
- ✓ Librarian stakeholder section (complete section)
- ✓ Librarian interview participants and findings
- ✓ Librarian use cases from use case diagrams
- ✓ Librarian features from requirements
- ✓ Librarian role from system roles (Student, Lecturer, Administrator only)
- ✓ Librarian data flows from DFD diagrams
- ✓ Librarian dashboards from authentication flows
- ✓ All table rows mentioning librarian features

#### What Was Kept:
- ✓ References to code libraries (React library, Testing Library, etc.) - these are technical terms, not library staff

---

### 2. Language Simplified ✓

**Changed from formal/corporate to student-friendly language:**

#### Before → After Examples:

| Before (Formal/AI-like) | After (Student-friendly) |
|------------------------|-------------------------|
| "comprehensive" | "thorough" |
| "stakeholders" → | "people involved" (in some contexts, kept "stakeholders" where appropriate) |
| "ecosystem" | "environment" / "setup" |
| "facilitate" | "help" |
| "utilize" | "use" |
| "implement" | "build" |
| "Furthermore," | "Also," |
| "In order to" | "To" |
| "This section describes the planning activities..." | "This section covers the planning phase. We'll look at..." |
| "Technical feasibility examines whether..." | "Can we actually build this thing with the technology we have? That's what..." |
| "**Assessment:**" | "**Bottom line:**" |
| "**Conclusion:**" | "**So:**" |

#### Section Heading Changes:
- "Operational Benefits" → "How Operations Get Better"
- "Student Benefits" → "What Students Get Out of It"
- "Administrative Benefits" → "How It Helps Admin Staff"
- "Financial Benefits" → "Money Saved"
- "Strategic Benefits" → "Big Picture Benefits"
- "Technical Risks and Mitigation" → "Potential Technical Problems & How We'll Handle Them"

---

### 3. New Diagrams Added ✓

Added **4 major diagrams** to improve visual understanding:

#### **Diagram 1: High-Level System Architecture**
```
┌─────────────────────────────────────────────────────────┐
│                  EduHub System                           │
│  (Everything in one place - no more juggling systems!)  │
└───────────┬─────────────────────────────────────────────┘
            │
    ┌───────┴────────┐
    │                │
    ▼                ▼
┌─────────┐    ┌──────────────┐
│ Students│    │ Staff/Admin  │
│         │    │              │
│ - Apply │    │ - Review     │
│ - Register│  │ - Approve    │
│ - Update  │  │ - Manage     │
└─────────┘    └──────────────┘
```
*Location: After "How EduHub Fixes This" section*

#### **Diagram 2: Current vs Proposed Workflow**
Shows the painful current process (PDF forms, printing, scanning, manual entry) vs the streamlined EduHub process (web form, upload, submit, review).
*Location: In "Expected Benefits" section*

#### **Diagram 3: Technology Stack Visualization**
```
┌─────────────────────────────────────┐
│         Frontend (React)            │
│  What users see and interact with   │
└───────────────┬─────────────────────┘
                │
                │ HTTP Requests (REST API)
                │
┌───────────────▼─────────────────────┐
│      Backend (Node.js/Express)      │
│   Handles business logic & auth     │
└───────────────┬─────────────────────┘
                │
                │ SQL Queries
                │
┌───────────────▼─────────────────────┐
│        Database (PostgreSQL)        │
│      Stores all the data            │
└─────────────────────────────────────┘
```
*Location: Technical Feasibility - Technology Stack section*

#### **Diagram 4: Role-Based Dashboard Concept**
```
                    EduHub Login
                         │
      ┌──────────────────┼──────────────────┐
      │                  │                  │
      ▼                  ▼                  ▼
  Student           Lecturer           Admin
  Dashboard         Dashboard          Dashboard
      │                  │                  │
  - Register         - View classes    - Review apps
  - View grades      - Post announcements  - Manage courses
  - Update profile   - See rosters     - Generate reports
  - Apply for courses    - Contact students   - Manage users
```
*Location: After Role-Based Access Control (RBAC) in Core Features*

---

### 4. Existing Diagrams Preserved ✓

All existing diagrams were kept:
- ✓ Mermaid use case diagrams
- ✓ ERD (Entity Relationship Diagram)
- ✓ Data Flow Diagrams (DFDs)
- ✓ System architecture diagrams
- ✓ Authentication flow diagrams
- ✓ All tables and comparisons

---

## File Statistics

| Metric | Original | Rewritten | Change |
|--------|----------|-----------|--------|
| Lines | 3,981 | 4,024 | +43 lines |
| Characters | 165,618 | 164,006 | -1,612 chars |
| Librarian refs | ~40 | 0 | -40 refs |
| Diagrams | Original count | +4 new | +4 diagrams |

---

## Files Created

1. **planning-phase-submission.md** - The cleaned and rewritten document (replaced original)
2. **planning-phase-submission-original-backup.md** - Backup of the original document
3. **planning-phase-submission.html** - HTML version for Word conversion
4. **CHANGES_SUMMARY.md** - This summary document

---

## How to Create Word Document

You have two options:

### Option 1: Open HTML in Word (Recommended)
1. Open `planning-phase-submission.html` in Microsoft Word
2. Word will automatically import it
3. Go to File → Save As
4. Choose "Word Document (.docx)" as the format
5. Save as `planning-phase-submission.docx`

### Option 2: Print to PDF, then Convert
1. Open `planning-phase-submission.html` in a web browser
2. Press Cmd+P (Mac) or Ctrl+P (Windows)
3. Select "Save as PDF"
4. Open the PDF in Microsoft Word
5. Word will convert it to .docx
6. Save as `planning-phase-submission.docx`

---

## Language Improvements - Detailed Examples

### Introduction Changes
**Before:**
> "This section describes the planning activities for the EduHub system. The planning phase focuses on understanding the need for the system, investigating the current situation, determining feasibility, planning project activities, scheduling tasks, defining system requirements, and modelling the system data structures."

**After:**
> "This section covers the planning phase for EduHub. We'll look at why we need this system, what the current problems are, whether it's feasible to build, how we'll build it, and what requirements it needs to meet."

### Investigation Changes
**Before:**
> "A comprehensive preliminary investigation was conducted to understand the current state of student management systems in South African tertiary institutions, identify industry-wide patterns and challenges, and determine requirements for the EduHub system."

**After:**
> "We did thorough research into how South African universities currently handle student management. We looked at what systems they use, what problems they face, and what patterns we could identify."

### Technical Section Changes
**Before:**
> "Technical feasibility examines whether the system can be successfully developed using available technology, tools, and technical expertise."

**After:**
> "Can we actually build this thing with the technology and skills we have? That's what technical feasibility is all about."

### Technical Explanations Added
**Before:**
> "- **Sequelize**: ORM (Object-Relational Mapping) for database operations"

**After:**
> "- **Sequelize**: ORM - basically a way to talk to the database using JavaScript objects instead of SQL"

---

## Quality Checks Performed

✓ All librarian references removed (verified with grep)
✓ Language simplified throughout document
✓ All existing diagrams preserved
✓ New diagrams added in logical locations
✓ Technical content maintained
✓ Formatting and structure preserved
✓ References and citations intact
✓ All sections present and complete

---

## Notes

- The document now reads much more naturally, like it was written by a final year student rather than AI
- All technical details and academic rigor are preserved
- The simplified language makes the document more accessible without losing professionalism
- New diagrams help visualize complex concepts
- The document is still comprehensive and meets academic standards

---

Generated: April 13, 2026
Project: EduHub Student Management System
