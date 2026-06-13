#!/usr/bin/env python3
"""
Aggressively trim the document to 35-55 pages by removing generic content
Keep the student-friendly language but focus only on project-specific content
"""

import re

def remove_section(content, start_marker, end_marker):
    """Remove a section between two markers"""
    pattern = re.escape(start_marker) + r'.*?' + re.escape(end_marker)
    return re.sub(pattern, end_marker, content, flags=re.DOTALL)

def trim_document(content):
    """Trim the document by removing/shortening generic sections"""

    print("Starting document trimming...\n")

    # 1. Remove most of the university case studies (keep only brief mention)
    print("1. Cutting university case studies (UNISA, Stellenbosch, UP, UCT, UKZN)...")

    # Remove detailed case studies, keep only the summary
    content = remove_section(
        content,
        '#### **Case Study 1: University of South Africa UNISA**',
        '### Cross-Institutional Analysis'
    )

    # Replace with brief summary
    brief_summary = '''
We looked at six major SA universities (UNISA, Stellenbosch, UP, UCT, UKZN, Richfield) and found they all have the same problem: they use separate systems for learning (Moodle or Blackboard) and administration (custom portals or iEnabler). Students have to juggle 2-3 different systems just to register, access courses, and manage their info. This fragmentation is exactly what EduHub aims to fix.

### Cross-Institutional Analysis'''

    content = content.replace(
        '### Cross-Institutional Analysis',
        brief_summary
    )

    # 2. Remove the "What's an LMS and SIS" explainer section
    print("2. Removing LMS vs SIS explainer section...")
    content = remove_section(
        content,
        '### 2. Quick Explainer: What\'s an LMS and SIS Anyway?',
        '### 3. The Main Players:'
    )
    content = content.replace('### 3. The Main Players:', '### 2. The Main Players:')

    # 3. Remove detailed Moodle vs Blackboard vs iEnabler comparison
    print("3. Cutting Moodle vs Blackboard vs iEnabler detailed comparison...")
    content = remove_section(
        content,
        '#### **Moodle** - Used by 34% of SA universities',
        '### 4. Why Separate Systems Don\'t Work'
    )

    # Replace with brief version
    brief_tech = '''
Most SA universities use either Moodle (free, open-source) or Blackboard (commercial, expensive) for learning, plus a separate system like iEnabler for administration. The problem? These systems don't talk to each other, so students and staff have to use multiple platforms.

### 3. Why Separate Systems Don't Work'''

    content = content.replace('### 4. Why Separate Systems Don\'t Work', brief_tech)

    # 4. Shorten "Why Separate Systems Don't Work"
    print("4. Shortening 'Why Separate Systems Don't Work' section...")
    content = remove_section(
        content,
        '**Technical Challenges**:',
        '**Staff Challenges**:'
    )

    # Replace with shorter version
    shorter_problems = '''
When universities use separate systems:
- Students get confused navigating multiple platforms
- Data doesn't sync properly between systems (register in one, doesn't show up in the other)
- IT staff have to maintain multiple platforms
- Reporting requires combining data from different sources manually

**Staff Challenges**:'''

    content = content.replace('**Staff Challenges**:', shorter_problems)

    # 5. Remove "How EduHub Fixes This" redundancy
    print("5. Trimming 'How EduHub Fixes This' section...")
    content = remove_section(
        content,
        '#### **What You Get**:',
        '#### **The Cost Reality**'
    )

    # 6. Shorten "The Cost Reality" section drastically
    print("6. Shortening cost analysis section...")
    content = remove_section(
        content,
        '#### **The Cost Reality**',
        '### 6. Investigation Conclusion'
    )

    brief_cost = '''
#### **The Cost Reality**

Running multiple systems costs money: commercial licenses (like Blackboard), integration development, hosting for 3+ platforms, and training. EduHub being open-source and unified means lower costs overall.

### 5. Investigation Conclusion'''

    content = content.replace('### 6. Investigation Conclusion', brief_cost)

    # Renumber sections
    content = content.replace('### 5. Investigation Conclusion', '### 4. Investigation Conclusion')

    # 7. Shorten Investigation Conclusion
    print("7. Trimming investigation conclusion...")
    old_conclusion = re.search(
        r'#### \*\*Key Findings\*\*.*?#### \*\*The EduHub Opportunity\*\*',
        content,
        re.DOTALL
    )

    if old_conclusion:
        short_conclusion = '''#### **Key Findings**

1. All surveyed SA universities use fragmented systems (LMS + SIS)
2. Students and staff struggle with multiple logins and platforms
3. No current solution combines learning and administration
4. EduHub's unified approach solves this widespread problem

#### **The EduHub Opportunity**'''
        content = content.replace(old_conclusion.group(0), short_conclusion)

    # 8. Massively trim "Investigation Methods" section
    print("8. Cutting down investigation methods...")

    # Remove detailed literature review
    content = remove_section(
        content,
        '### 2. Literature Review and Research',
        '### 3. Stakeholder Interviews'
    )

    # Shorten stakeholder interviews
    content = remove_section(
        content,
        '**Participants**:',
        '### 4. Competitive Analysis'
    )

    brief_interviews = '''
We interviewed 5 students, 3 admin staff, and 2 lecturers to understand their pain points with the current system.

### 3. Competitive Analysis'''

    content = content.replace('### 4. Competitive Analysis', brief_interviews)
    content = content.replace('### 3. Competitive Analysis', '### 2. Competitive Analysis')

    # 9. Remove competitive analysis table (Canvas, Blackboard, Banner)
    print("9. Removing competitive analysis table...")
    content = remove_section(
        content,
        '### 2. Competitive Analysis\n\nAnalysis of existing systems',
        '### 3. Team Discussions'
    )

    brief_competitive = '''### 2. Research Summary

We researched existing systems and found that commercial solutions (Canvas, Blackboard, Banner) are expensive and still require separate systems for different functions. Open-source options like Moodle only handle learning, not administration. This confirmed the need for EduHub's unified approach.

### 3. Team Discussions'''

    content = content.replace('### 3. Team Discussions', brief_competitive)

    # 10. Shorten Team Discussions
    print("10. Shortening team discussions section...")
    content = remove_section(
        content,
        '**Discussion Topics**:',
        '**Decisions Made**:'
    )

    # 11. Trim Investigation Findings Summary
    print("11. Trimming investigation findings summary...")
    content = remove_section(
        content,
        '### Technology Recommendations',
        '### Lessons Learned from Other Systems'
    )

    brief_tech_rec = '''### Technology Recommendations

From our research, React.js (frontend), Node.js/Express (backend), and PostgreSQL (database) make sense because they're widely used, well-documented, and our team already has experience with JavaScript.

### Lessons Learned from Other Systems'''

    content = content.replace('### Lessons Learned from Other Systems', brief_tech_rec)

    # 12. Shorten "Lessons Learned"
    print("12. Shortening lessons learned...")
    old_lessons = re.search(
        r'### Lessons Learned from Other Systems.*?These findings informed',
        content,
        re.DOTALL
    )

    if old_lessons:
        short_lessons = '''### Lessons Learned from Other Systems

Key takeaways: start with strong authentication, keep the UI simple, automate workflows, plan for scale, and maintain audit logs. These findings informed'''
        content = content.replace(old_lessons.group(0), short_lessons)

    # 13. Trim Technology Stack section
    print("13. Trimming technology stack explanations...")

    # Shorten Frontend Development
    content = re.sub(
        r'\*\*Frontend Development\*\*:.*?\*\*Backend Development\*\*:',
        '''**Frontend Development**: React.js, HTML5/CSS3, JavaScript ES6+, React Router, Axios, Bootstrap/Material-UI

**Backend Development**:''',
        content,
        flags=re.DOTALL
    )

    # Shorten Backend Development
    content = re.sub(
        r'\*\*Backend Development\*\*:.*?\*\*Database\*\*:',
        '''**Backend Development**: Node.js, Express.js, JWT for authentication, Bcrypt for passwords, Nodemailer for emails, Multer for file uploads

**Database**:''',
        content,
        flags=re.DOTALL
    )

    # Shorten Database section
    content = re.sub(
        r'\*\*Database\*\*:.*?\*\*Development Tools\*\*:',
        '''**Database**: PostgreSQL with Sequelize ORM

**Development Tools**:''',
        content,
        flags=re.DOTALL
    )

    # Shorten Development Tools
    content = re.sub(
        r'\*\*Development Tools\*\*:.*?\*\*Testing\*\*:',
        '''**Development Tools**: Git/GitHub for version control, Docker for deployment, VS Code for development, Postman for API testing

**Testing**:''',
        content,
        flags=re.DOTALL
    )

    # 14. Shorten Technical Risks table
    print("14. Simplifying technical risks section...")
    content = re.sub(
        r'\| Risk.*?\| Security vulnerabilities.*?\|.*?\n',
        '',
        content,
        flags=re.DOTALL
    )

    # 15. Trim Scalability Considerations
    print("15. Trimming scalability section...")
    content = remove_section(
        content,
        '### Scalability Considerations',
        '**So:**'
    )

    brief_scalability = '''
**So:**'''
    content = content.replace('**So:**', brief_scalability)

    # 16. Shorten Operational Feasibility examples
    print("16. Shortening operational feasibility examples...")
    content = re.sub(
        r'\*\*Application Processing\*\*:.*?\*\*Course Registration\*\*:',
        '''**Application Processing**: Current manual review takes 30-45 minutes per application. With EduHub's digital system, this drops to 10-15 minutes (67% faster).

**Course Registration**:''',
        content,
        flags=re.DOTALL
    )

    content = re.sub(
        r'\*\*Course Registration\*\*:.*?\*\*Student Information Updates\*\*:',
        '''**Course Registration**: In-person registration with long queues (1-2 hours) becomes online self-service (5-10 minutes).

**Student Information Updates**:''',
        content,
        flags=re.DOTALL
    )

    # 17. Remove redundant benefit sections
    print("17. Trimming redundant benefit descriptions...")
    content = re.sub(
        r'### User Accessibility and Convenience.*?### User Acceptance',
        '''### User Acceptance''',
        content,
        flags=re.DOTALL
    )

    return content

def main():
    print("=" * 80)
    print("DOCUMENT TRIMMING - Removing Generic Content")
    print("=" * 80)
    print()

    with open('planning-phase-submission.md', 'r', encoding='utf-8') as f:
        content = f.read()

    original_length = len(content)
    print(f"Original document: {original_length:,} characters\n")

    # Trim the document
    content = trim_document(content)

    new_length = len(content)
    reduction = original_length - new_length
    percentage = (reduction / original_length) * 100

    print()
    print("=" * 80)
    print("TRIMMING COMPLETE")
    print("=" * 80)
    print(f"Original: {original_length:,} characters")
    print(f"Trimmed:  {new_length:,} characters")
    print(f"Removed:  {reduction:,} characters ({percentage:.1f}%)")
    print()

    # Estimate pages (rough: 3000 chars = 1 page)
    original_pages = original_length / 3000
    new_pages = new_length / 3000

    print(f"Estimated original pages: ~{original_pages:.0f}")
    print(f"Estimated new pages: ~{new_pages:.0f}")
    print()

    # Save trimmed version
    with open('planning-phase-submission-trimmed.md', 'w', encoding='utf-8') as f:
        f.write(content)

    print("Saved as: planning-phase-submission-trimmed.md")
    print()
    print("Review the trimmed version, and if it looks good, replace the original.")
    print("=" * 80)

if __name__ == '__main__':
    main()
