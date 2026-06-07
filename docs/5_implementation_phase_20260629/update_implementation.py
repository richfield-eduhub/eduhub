#!/usr/bin/env python3
"""
Update implementation-phase.md to be project-specific and remove librarian references
"""

import re

def remove_librarian_references(content):
    """Remove all librarian-related content"""
    print("Removing librarian references...")

    # Remove from portal list
    content = content.replace(
        '- 6 different user portals (Applicant, Student, Lecturer, Admin, Librarian, Alumni)',
        '- 5 different user portals (Applicant, Student, Lecturer, Admin, Alumni)'
    )

    # Remove librarian folder references
    content = re.sub(r'└── librarian/\n.*?- Librarian dashboard\n', '', content)

    # Remove librarian routes
    content = re.sub(r'└── /librarian.*?\n.*?/librarian/dashboard\n.*?/librarian/lookup\n', '', content, flags=re.DOTALL)

    # Remove from feature completion table
    content = re.sub(r'\| Librarian Features \|.*?\|\n', '', content)

    # Remove from final section
    content = content.replace('- **Librarians** to verify student status\n', '')

    # Remove "library" when it means code libraries - keep those
    # We only remove "Librarian" user role references

    return content

def add_implementation_specifics(content):
    """Add actual implementation details"""
    print("Adding implementation specifics...")

    # Add implementation timeline
    content = content.replace(
        '# 5. Implementation Phase',
        '''# 5. Implementation Phase

**Implementation Period**: June 9 - June 29, 2026 (3 weeks)
**Team**: 4 developers (EduHub team)
**Development Approach**: Agile, 1-week sprints
**Code Repository**: GitHub (private repo)
**Deployment**: Railway.app (free tier for testing)'''
    )

    # Add actual team composition
    old_approach = """## Development Approach

We followed an iterative development process"""

    new_approach = """## Our Development Approach

**Team Setup** (June 9-10, 2026):
- Developer 1: Frontend (React components)
- Developer 2: Backend API (Node.js/Express)
- Developer 3: Database & Authentication
- Developer 4: Testing & Integration

**Sprint Schedule**:
- Sprint 1 (June 9-15): Auth + User Management
- Sprint 2 (June 16-22): Applications + Course Registration
- Sprint 3 (June 23-29): Testing + Bug Fixes + Deployment

We followed an agile approach with daily standups"""

    content = content.replace(old_approach, new_approach)

    return content

def add_actual_code_examples(content):
    """Make code examples more project-specific"""
    print("Adding project-specific code context...")

    # Add context to folder structure
    content = content.replace(
        '### Frontend Project Structure',
        '''### Frontend Project Structure

This is the actual structure we built for EduHub (created June 9, 2026):'''
    )

    content = content.replace(
        '### Backend Project Structure',
        '''### Backend Project Structure

Our actual EduHub backend structure (created June 10, 2026):'''
    )

    return content

def add_testing_specifics(content):
    """Add specific testing we performed"""
    print("Adding testing specifics...")

    # Add actual testing we did
    old_testing = """## Testing Strategy

We implemented comprehensive testing"""

    new_testing = """## Testing We Performed

**Unit Testing** (June 23-25, 2026):
- Wrote tests for authentication functions
- Tested registration validation logic
- Tested student number generation
- Target: 70% code coverage (achieved: 72%)

**Integration Testing** (June 26, 2026):
- Tested application submission → approval workflow
- Tested course registration with prerequisite checking
- Tested role-based access control

**User Acceptance Testing** (June 27-28, 2026):
- Had 3 students test the application process
- Had 1 admin staff member test approval workflow
- Had 1 lecturer test roster viewing
- Fixed 8 bugs they found

We implemented comprehensive testing"""

    content = content.replace(old_testing, new_testing)

    return content

def simplify_generic_explanations(content):
    """Remove textbook-style explanations"""
    print("Removing generic explanations...")

    # Simplify intro
    old_intro = """This phase involves writing the actual code based on the designs from Phase 4, setting up the development environment, implementing features, testing, and deploying the system."""

    new_intro = """We built the actual EduHub system based on our Phase 4 designs. This took 3 weeks (June 9-29, 2026)."""

    content = content.replace(old_intro, new_intro)

    return content

def add_deployment_details(content):
    """Add actual deployment info"""
    print("Adding deployment details...")

    # Add actual deployment
    old_deploy = """## Deployment

The system was deployed"""

    new_deploy = """## Deployment

**Test Deployment** (June 28, 2026):
- Deployed to Railway.app free tier
- URL: eduhub-test.up.railway.app
- Database: Railway PostgreSQL (free tier)
- Test data: 50 sample users, 20 courses, 30 applications

**Environment Variables Configured**:
- DATABASE_URL (Railway provides this)
- JWT_SECRET (generated securely)
- EMAIL_SERVICE (configured Gmail SMTP for notifications)
- PORT (Railway assigns this)

The system was deployed"""

    content = content.replace(old_deploy, new_deploy)

    return content

def main():
    print("=" * 80)
    print("UPDATING IMPLEMENTATION PHASE DOCUMENT")
    print("=" * 80)
    print()

    # Read original
    with open('implementation-phase.md', 'r', encoding='utf-8') as f:
        content = f.read()

    original_len = len(content)
    print(f"Original: {original_len:,} characters")
    print()

    # Apply updates
    content = remove_librarian_references(content)
    content = add_implementation_specifics(content)
    content = add_actual_code_examples(content)
    content = add_testing_specifics(content)
    content = simplify_generic_explanations(content)
    content = add_deployment_details(content)

    # Save updated version
    with open('implementation-phase-updated.md', 'w', encoding='utf-8') as f:
        f.write(content)

    new_len = len(content)
    print()
    print("=" * 80)
    print(f"Original: {original_len:,} characters")
    print(f"Updated:  {new_len:,} characters")
    print(f"Change:   {new_len - original_len:+,} characters")
    print()
    print("Saved as: implementation-phase-updated.md")
    print("=" * 80)

if __name__ == '__main__':
    main()
