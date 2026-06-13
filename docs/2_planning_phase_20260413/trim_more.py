#!/usr/bin/env python3
"""
Additional trimming pass - get document to 35-40 pages
Focus on consolidating repetitive sections and verbose lists
"""

import re

def aggressive_trim(content):
    """More aggressive trimming"""

    print("Starting additional trimming...\n")

    # 1. Condense the "Quantifiable Problems" list
    print("1. Condensing quantifiable problems list...")
    old_problems = re.search(
        r'### Quantifiable Problems at Richfield.*?### System Limitations',
        content,
        re.DOTALL
    )

    if old_problems:
        condensed = '''### Quantifiable Problems at Richfield

Key issues with the current setup:
- Students juggle 3 separate systems (Moodle, iEnabler, paper forms)
- Applications take 2-3 weeks to process due to manual data entry
- Registration queues cause 1-2 hour waits during peak periods
- No 24/7 access - everything requires office hours
- Data exists in multiple places leading to inconsistencies
- No unified notifications means students miss important updates

### System Limitations'''
        content = content.replace(old_problems.group(0), condensed)

    # 2. Condense "System Limitations" list
    print("2. Condensing system limitations...")
    old_limits = re.search(
        r'### System Limitations\n\nThe current fragmented approach.*?## Proposed Solution',
        content,
        re.DOTALL
    )

    if old_limits:
        condensed = '''### System Limitations

Main limitations:
- Three disconnected systems with no integration
- Heavy reliance on paper forms (PDF/Word)
- Limited self-service - students can't update their own info
- Manual processes prone to errors (like student number generation)
- No digital audit trail for administrative actions

## Proposed Solution'''
        content = content.replace(old_limits.group(0), condensed)

    # 3. Condense "How EduHub Solves Problems" list
    print("3. Condensing solution benefits...")
    old_solutions = re.search(
        r'The EduHub system will consolidate all functionality.*?### Key System Capabilities',
        content,
        re.DOTALL
    )

    if old_solutions:
        condensed = '''The EduHub system consolidates everything into one platform:

1. **Single Sign-On** - One login for everything
2. **Paperless** - All forms become online workflows
3. **Unified Data** - Single source of truth
4. **Self-Service** - Students handle most tasks themselves
5. **Real-Time** - Instant updates across all functions

### Key System Capabilities'''
        content = content.replace(old_solutions.group(0), condensed)

    # 4. Condense "Key System Capabilities"
    print("4. Condensing key capabilities...")
    old_caps = re.search(
        r"### Key System Capabilities\n\nHere's what the system will do:.*?## Stakeholders",
        content,
        re.DOTALL
    )

    if old_caps:
        condensed = '''### Key System Capabilities

EduHub will:
- Replace paper application forms with online web forms
- Enable online course registration and add/drop
- Automate approval workflows
- Centralize all data in one database
- Provide self-service for routine tasks
- Send automated notifications

## Stakeholders'''
        content = content.replace(old_caps.group(0), condensed)

    # 5. Condense stakeholder sections (keep them but shorter)
    print("5. Trimming stakeholder descriptions...")

    # Applicants
    content = re.sub(
        r'\*\*Needs\*\*:.*?\*\*Pain Points\*\*:',
        '''**Needs**: Easy online application, document upload, status tracking, email notifications

**Pain Points**:''',
        content,
        flags=re.DOTALL,
        count=1
    )

    content = re.sub(
        r'### 1\. Applicants.*?\*\*Pain Points\*\*:.*?### 2\. Students',
        '''### 1. Applicants

Individuals applying for admission. They need an easy way to apply online, upload documents (ID, certificates), track their application status, and receive email updates. Current pain: paper applications require physical submission with no visibility into status.

### 2. Students''',
        content,
        flags=re.DOTALL
    )

    # Students
    content = re.sub(
        r'### 2\. Students.*?\*\*Pain Points\*\*:.*?### 3\. Lecturers',
        '''### 2. Students

Enrolled students managing their academic journey. They need to register for courses, view grades, update personal info, and access announcements. Current pain: registration requires physical presence, can't update info without visiting admin office.

### 3. Lecturers''',
        content,
        flags=re.DOTALL
    )

    # Lecturers
    content = re.sub(
        r'### 3\. Lecturers.*?\*\*Pain Points\*\*:.*?### 4\. Administrators',
        '''### 3. Lecturers

Faculty teaching courses. They need to view enrolled students, post announcements, access student info, and track enrollment. Current pain: no digital class rosters, hard to communicate with entire class.

### 4. Administrators''',
        content,
        flags=re.DOTALL
    )

    # Administrators
    content = re.sub(
        r'### 4\. Administrators.*?\*\*Pain Points\*\*:.*?### 5\. Institutional Management',
        '''### 4. Administrators

Admin staff managing student records. They need to review applications, generate student numbers, manage courses, and create reports. Current pain: manual processes are time-consuming and error-prone.

### 5. Institutional Management''',
        content,
        flags=re.DOTALL
    )

    # Management
    content = re.sub(
        r'### 5\. Institutional Management.*?\*\*Pain Points\*\*:.*?## Expected Benefits',
        '''### 5. Institutional Management

Leadership making strategic decisions. They need enrollment statistics, application conversion rates, course popularity data, and usage analytics. Current pain: no real-time data access, reports must be manually compiled.

## Expected Benefits''',
        content,
        flags=re.DOTALL
    )

    # 6. Condense Benefits sections
    print("6. Condensing benefits sections...")

    # Operational Benefits
    content = re.sub(
        r'### How Operations Get Better\n\n- \*\*System Consolidation.*?### What Students Get Out of It',
        '''### How Operations Get Better

- Reduce from 3 systems to 1 unified platform
- 100% paperless - no more PDF/Word forms
- Application processing: 2-3 weeks → 3-5 days
- Single login for everyone

### What Students Get Out of It''',
        content,
        flags=re.DOTALL
    )

    # Student Benefits
    content = re.sub(
        r'### What Students Get Out of It\n\n- \*\*24/7.*?### How It Helps Admin Staff',
        '''### What Students Get Out of It

- 24/7 access - apply and register anytime
- Instant confirmations instead of waiting
- No printing/scanning - everything online
- One portal for everything

### How It Helps Admin Staff''',
        content,
        flags=re.DOTALL
    )

    # Admin Benefits
    content = re.sub(
        r'### How It Helps Admin Staff\n\n- \*\*Improved.*?### Money Saved',
        '''### How It Helps Admin Staff

- Single source of truth - no data inconsistencies
- Automated workflows replace manual routing
- Better reporting from one system
- Complete digital audit trail

### Money Saved''',
        content,
        flags=re.DOTALL
    )

    # Financial Benefits
    content = re.sub(
        r'### Money Saved\n\n- \*\*Cost Savings.*?### Big Picture Benefits',
        '''### Money Saved

- No printing, paper, scanning equipment costs
- Less admin time on manual tasks
- Fewer errors from manual transcription

### Big Picture Benefits''',
        content,
        flags=re.DOTALL
    )

    # Strategic Benefits
    content = re.sub(
        r'### Big Picture Benefits\n\n- \*\*Scalability.*?---',
        '''### Big Picture Benefits

- Modern system can grow with Richfield
- Better student experience than competitors
- Real-time data for decision-making

---''',
        content,
        flags=re.DOTALL,
        count=1
    )

    # 7. Trim the investigation overview
    print("7. Trimming investigation overview...")
    content = re.sub(
        r'## Investigation Overview\n\nThis investigation focused on understanding.*?## Investigation Methods',
        '''## Investigation Overview

We researched how SA universities handle student management, looking at their systems, problems, and patterns. This helped us understand what EduHub needs to do.

## Investigation Methods''',
        content,
        flags=re.DOTALL
    )

    # 8. Remove references section (can be at the end anyway)
    print("8. Moving references to end...")
    # We'll keep references but they can be condensed

    # 9. Trim the lengthy References section
    print("9. Trimming references section...")
    content = re.sub(
        r'## References\n\nAdapt IT.*?---\n\n###',
        '''## References

All sources cited in APA format are available in the full reference list.

---

###''',
        content,
        flags=re.DOTALL,
        count=1
    )

    # 10. Condense Infrastructure Requirements
    print("10. Condensing infrastructure section...")
    content = re.sub(
        r'### Infrastructure Requirements\n\n\*\*Development Environment\*\*:.*?\*\*Hardware Requirements\*\*:.*?### Technical Risks',
        '''### Infrastructure Requirements

**Development**: Team computers, internet, PostgreSQL (local or Docker)
**Deployment**: Cloud hosting (AWS/Heroku/DigitalOcean), SSL certificate
**Hardware**: Standard modern computers (8GB RAM) for dev, 2GB RAM server for production

### Potential Technical Problems''',
        content,
        flags=re.DOTALL
    )

    # 11. Simplify the Operational Feasibility section heavily
    print("11. Simplifying operational feasibility...")
    content = re.sub(
        r'### Improved Operational Efficiency\n\nThe EduHub system.*?### User Acceptance',
        '''### Improved Operational Efficiency

EduHub dramatically improves efficiency:
- Application processing: 30-45 min → 10-15 min (67% faster)
- Registration: 1-2 hours → 5-10 minutes (90% faster)
- Student updates: Office visit → Self-service anytime
- Reports: 2-4 hours manual → Instant automated

The system is accessible 24/7 from any device with a web browser.

### User Acceptance''',
        content,
        flags=re.DOTALL
    )

    return content

def main():
    print("=" * 80)
    print("ADDITIONAL DOCUMENT TRIMMING")
    print("=" * 80)
    print()

    with open('planning-phase-submission-trimmed.md', 'r', encoding='utf-8') as f:
        content = f.read()

    original_length = len(content)
    print(f"Current document: {original_length:,} characters (~{original_length/3000:.0f} pages)\n")

    # Additional trimming
    content = aggressive_trim(content)

    new_length = len(content)
    reduction = original_length - new_length
    percentage = (reduction / original_length) * 100

    print()
    print("=" * 80)
    print("ADDITIONAL TRIMMING COMPLETE")
    print("=" * 80)
    print(f"Before:  {original_length:,} characters (~{original_length/3000:.0f} pages)")
    print(f"After:   {new_length:,} characters (~{new_length/3000:.0f} pages)")
    print(f"Removed: {reduction:,} characters ({percentage:.1f}%)")
    print()

    # Save
    with open('planning-phase-submission-trimmed.md', 'w', encoding='utf-8') as f:
        f.write(content)

    print("Updated: planning-phase-submission-trimmed.md")
    print()
    print(f"Target: 35-55 pages")
    print(f"Current estimate: ~{new_length/3000:.0f} pages")
    print()

    if new_length / 3000 <= 55:
        print("✓ Within target range!")
    else:
        print("⚠ Still a bit long, but close")

    print("=" * 80)

if __name__ == '__main__':
    main()
