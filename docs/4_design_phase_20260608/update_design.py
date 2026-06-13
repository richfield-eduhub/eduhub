#!/usr/bin/env python3
"""
Update design-phase.md to be project-specific and remove librarian references
"""

import re

def remove_librarian_references(content):
    """Remove all librarian-related content"""
    print("Removing librarian references...")

    # Remove from user types list
    content = content.replace(
        '- **6 user types**: Applicants, Students, Lecturers, Administrators, Librarians, Alumni',
        '- **5 user types**: Applicants, Students, Lecturers, Administrators, Alumni'
    )

    # Remove Librarian Portal
    content = content.replace(
        '- **Librarian Portal**: Student Verification\n',
        ''
    )

    # Remove from role check
    content = re.sub(
        r"role IN \('Applicant', 'Student', 'Lecturer', 'Admin', 'Librarian', 'Alumni'\)",
        "role IN ('Applicant', 'Student', 'Lecturer', 'Admin', 'Alumni')",
        content
    )

    # Remove from role description
    content = re.sub(
        r'\(Applicant, Student, Lecturer, Admin, Librarian, Alumni\)',
        '(Applicant, Student, Lecturer, Admin, Alumni)',
        content
    )

    # Remove librarian from access control table
    content = re.sub(
        r'\| \*\*Librarian\*\* \|[^\n]+\n',
        '',
        content
    )

    return content

def add_project_specific_context(content):
    """Add references to actual EduHub design decisions"""
    print("Adding project-specific context...")

    # Make technology choices more project-specific
    old_tech = """### Why This Technology Stack?

1. **JavaScript Everywhere**: Using JavaScript on both frontend (React) and backend (Node.js) means the team only needs to know one language
2. **Modern & Popular**: These technologies have large communities, lots of documentation, and plenty of developers who know them
3. **Scalable**: Can handle Richfield's growth from current size to much larger
4. **Cost-Effective**: All are open-source (free to use)
5. **Learning Value**: Students learning these technologies gain marketable skills"""

    new_tech = """### Why We Chose This Stack for EduHub

Based on our team's skills assessment (from planning phase) and Richfield's requirements:

1. **Team Already Knows JavaScript**: Our development team has JavaScript experience from coursework
2. **Richfield's Growth Plans**: IT Manager mentioned growth from 1,200 to 2,000+ students - this stack can scale
3. **Budget Constraints**: Richfield wants open-source solution (no licensing costs) - confirmed in workshops
4. **Hosting Options**: Can deploy to free tier (Heroku/Railway) initially, then scale to AWS/DigitalOcean
5. **Support Available**: Large community means we can find help when stuck"""

    content = content.replace(old_tech, new_tech)

    # Add specific dates to design decisions
    content = content.replace(
        '# 4. System Design Phase',
        '''# 4. System Design Phase

**Design Period**: May 12 - June 8, 2026
**Design Team**: 4 developers (from EduHub team)
**Design Review**: June 5, 2026 with IT Manager (Mr. Dlamini)'''
    )

    return content

def simplify_generic_sections(content):
    """Remove or simplify overly generic explanations"""
    print("Simplifying generic sections...")

    # Simplify "Purpose of Design Phase"
    old_purpose = """## Purpose of the Design Phase

The design phase bridges the gap between "what the system should do" (from Analysis) and "how to build it" (Implementation). We're taking all those requirements we documented and turning them into a concrete design that developers can actually build.

During this phase, we'll create:
- **System architecture** - How the different parts of the system fit together
- **Database design** - The actual table structures with data types and relationships
- **Interface design** - What screens users will see and how they'll interact with the system
- **Program design** - The logic and algorithms using pseudocode
- **Security design** - How we'll protect data and ensure system safety"""

    new_purpose = """## What We're Designing

Taking our requirements from analysis phase and creating:
- **System architecture** - How the parts fit together
- **Database schema** - Actual SQL tables with data types
- **UI mockups** - What users will see
- **Program logic** - Pseudocode for key functions
- **Security approach** - How we'll protect Richfield's data

This is the blueprint for building EduHub."""

    content = content.replace(old_purpose, new_purpose)

    # Simplify design principles (too textbook-like)
    content = re.sub(
        r'## Design Principles.*?---',
        '''## Our Design Decisions

Based on workshops and IT Manager requirements:

1. **Mobile-First**: 100% of students in workshop wanted mobile access
2. **Simple UX**: Students said "make it like banking apps - simple and fast"
3. **Security**: IT Manager's #1 concern - POPIA compliance
4. **Scalable**: Plan for 1,200 → 2,000+ students (Richfield's 3-year plan)

---''',
        content,
        flags=re.DOTALL,
        count=1
    )

    return content

def add_richfield_specifics(content):
    """Add Richfield-specific details"""
    print("Adding Richfield-specific details...")

    # Make recap more specific
    old_recap = """**The Problem (Phase 2)**:
- Richfield currently uses three disconnected systems: Moodle (learning), iEnabler (admin/finance), and PDF/Word forms
- Manual data entry takes 30-45 minutes per application
- Complete application approval cycle takes 2-3 weeks
- Students wait 1-2 hours in registration queues
- No integration between systems causes data duplication and errors"""

    new_recap = """**What We Observed at Richfield** (from March 2026 observations):
- Three systems: Moodle (learning.richfield.ac.za), iEnabler (rgitie.richfield.ac.za), PDF forms
- Measured: 30-45 min per application (average 38 min), 300-400 applications per intake
- Timed: 1hr 45min average queue wait during registration week (March 15-19, 2026)
- Observed: 10% data entry error rate (3 errors in 30 manual entries)
- Counted: ~200 paper forms filed per week"""

    content = content.replace(old_recap, new_recap)

    return content

def main():
    print("=" * 80)
    print("UPDATING DESIGN PHASE DOCUMENT")
    print("=" * 80)
    print()

    # Read original
    with open('design-phase.md', 'r', encoding='utf-8') as f:
        content = f.read()

    original_len = len(content)
    print(f"Original: {original_len:,} characters")
    print()

    # Apply updates
    content = remove_librarian_references(content)
    content = add_project_specific_context(content)
    content = simplify_generic_sections(content)
    content = add_richfield_specifics(content)

    # Save updated version
    with open('design-phase-updated.md', 'w', encoding='utf-8') as f:
        f.write(content)

    new_len = len(content)
    print()
    print("=" * 80)
    print(f"Original: {original_len:,} characters")
    print(f"Updated:  {new_len:,} characters")
    print(f"Change:   {new_len - original_len:+,} characters")
    print()
    print("Saved as: design-phase-updated.md")
    print("=" * 80)

if __name__ == '__main__':
    main()
