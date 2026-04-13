#!/usr/bin/env python3
"""
Further improve the language to sound more student-written
"""

import re

def improve_language(content):
    """Make language more natural and student-like"""

    # Fix double "people involved"
    content = content.replace('## people involved\n\nThe people involved involved in', '## Stakeholders\n\nThe stakeholders in')

    # Simplify introductory paragraphs
    content = content.replace(
        'This section describes the planning activities for the EduHub system. The planning phase focuses on understanding the need for the system, investigating the current situation, determining feasibility, planning project activities, scheduling tasks, defining system requirements, and modelling the system data structures.',
        'This section covers the planning phase for EduHub. We\'ll look at why we need this system, what the current problems are, whether it\'s feasible to build, how we\'ll build it, and what requirements it needs to meet.'
    )

    content = content.replace(
        'A thorough preliminary investigation was conducted to understand the current state of student management systems in South African tertiary institutions, identify industry-wide patterns and challenges, and determine requirements for the EduHub system. The investigation employed multiple research methods including institutional case studies, system analysis, and stakeholder consultations to gather thorough information.',
        'We did thorough research into how South African universities currently handle student management. We looked at what systems they use, what problems they face, and what patterns we could identify. This helped us figure out what EduHub needs to do.'
    )

    # Make case study language more casual
    content = content.replace(
        'The problem: Students navigate between three separate systems.',
        'The problem: Students have to juggle three different systems.'
    )

    content = content.replace(
        'This is the fragmentation problem every single surveyed institution faces.',
        'This fragmentation issue affects literally every university we looked at.'
    )

    # Simplify technical sections
    content = content.replace(
        'Technical feasibility examines whether the system can be successfully developed using available technology, tools, and technical expertise.',
        'Can we actually build this thing with the technology and skills we have? That\'s what technical feasibility is all about.'
    )

    content = content.replace(
        'Operational feasibility examines whether the system will work effectively in the organization\'s environment and whether users will accept and use it.',
        'Will this system actually work in a real university environment? Will people want to use it? That\'s what we need to figure out here.'
    )

    # Make benefit lists sound less corporate
    content = content.replace('### Operational Benefits', '### How Operations Get Better')
    content = content.replace('### Student Benefits', '### What Students Get Out of It')
    content = content.replace('### Administrative Benefits', '### How It Helps Admin Staff')
    content = content.replace('### Financial Benefits', '### Money Saved')
    content = content.replace('### Strategic Benefits', '### Big Picture Benefits')

    # Simplify "ecosystem" to "environment"
    content = content.replace('fragmented digital ecosystem', 'fragmented digital setup')
    content = content.replace('Eliminate the fragmented environment', 'Get rid of the fragmented setup')

    # More casual transitions
    content = content.replace('Based on the investigation', 'From our research')
    content = content.replace('The investigation revealed that', 'Our research showed that')
    content = content.replace('Analysis of existing systems', 'Looking at existing systems')

    # Simplify technical jargon where possible
    content = content.replace('ACID compliant', 'ACID compliant (ensures data integrity)')
    content = content.replace('non-blocking I/O', 'non-blocking I/O (handles many requests at once)')
    content = content.replace('ORM (Object-Relational Mapping)', 'ORM - basically a way to talk to the database using JavaScript objects instead of SQL')

    # Make recommendations sound less formal
    content = content.replace('are recommended:', 'make sense for this project:')
    content = content.replace('is recommended', 'makes sense')
    content = content.replace('The following technologies are recommended', 'Here\'s what we should use for tech stack')

    # Simplify assessment language
    content = content.replace('**Assessment**:', '**Bottom line**:')
    content = content.replace('**Conclusion**:', '**So:**')

    # Make warnings/risks sound more natural
    content = content.replace('Technical Risks and Mitigation', 'Potential Technical Problems & How We\'ll Handle Them')
    content = content.replace('Mitigation Strategy', 'How We\'ll Handle It')

    # Simplify "participants" and formal interview language
    content = content.replace('**Participants**:', '**Who we talked to**:')
    content = content.replace('**Key Findings from Interviews**:', '**What we learned**:')

    # Make feature descriptions less formal
    content = content.replace('The system will:', 'Here\'s what the system will do:')
    content = content.replace('should include:', 'needs:')

    return content

def add_more_diagrams(content):
    """Add helpful diagrams throughout the document"""

    # Add current vs proposed workflow diagram
    workflow_diagram = """

**Current Workflow (The Painful Way)**:
```
Application
   ↓
Download PDF form
   ↓
Print it out
   ↓
Fill it in by hand
   ↓
Scan it
   ↓
Email or bring to office
   ↓
Admin manually types it into iEnabler
   ↓
Wait 2-3 weeks
```

**EduHub Workflow (The Easy Way)**:
```
Application
   ↓
Fill out web form
   ↓
Upload documents
   ↓
Submit
   ↓
Admin reviews online
   ↓
Approved in 3-5 days
```

See the difference? No printing, no scanning, no manual data entry!

"""

    # Add after "Expected Benefits" section
    content = content.replace(
        '## Expected Benefits\n\n',
        '## Expected Benefits\n\n' + workflow_diagram
    )

    # Add tech stack visualization
    tech_stack = """

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

"""

    # Add after "Technology Stack" heading
    content = content.replace(
        '### Technology Stack\n\nThe project will be developed',
        '### Technology Stack\n\n' + tech_stack + '\nThe project will be developed'
    )

    # Add role-based dashboard concept
    dashboard_diagram = """

Here's how different users see different things when they log in:

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

Everyone uses the same system, but sees different features based on their role.

"""

    # Add after discussing role-based access
    content = content.replace(
        '- Role-based access control (RBAC)\n\n2. **Student Application Management**',
        '- Role-based access control (RBAC)\n\n' + dashboard_diagram + '2. **Student Application Management**'
    )

    return content

def main():
    # Read the rewritten document
    with open('planning-phase-submission-rewritten.md', 'r', encoding='utf-8') as f:
        content = f.read()

    print("Starting language improvements...")

    # Improve language
    print("1. Making language more natural...")
    content = improve_language(content)

    print("2. Adding more diagrams...")
    content = add_more_diagrams(content)

    # Write the improved document
    with open('planning-phase-submission-rewritten.md', 'w', encoding='utf-8') as f:
        f.write(content)

    print("\nImproved! The file has been updated.")

if __name__ == '__main__':
    main()
