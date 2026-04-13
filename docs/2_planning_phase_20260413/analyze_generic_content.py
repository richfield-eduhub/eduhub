#!/usr/bin/env python3
"""
Analyze the document to identify generic/textbook content vs project-specific content
"""

import re

def analyze_document():
    """Identify sections that are too generic"""

    with open('planning-phase-submission.md', 'r', encoding='utf-8') as f:
        content = f.read()

    print("=" * 80)
    print("DOCUMENT ANALYSIS: Generic vs Project-Specific Content")
    print("=" * 80)

    print("\n🚨 SECTIONS THAT ARE TOO GENERIC (Need to Cut or Reduce):\n")

    generic_sections = [
        {
            'title': '2.2 Preliminary Investigation - University Case Studies',
            'issue': 'Long sections about UNISA, Stellenbosch, UP, UCT, UKZN',
            'recommendation': 'Cut to 1-2 paragraphs max. Focus on Richfield only.',
            'pages': '~8-12 pages',
            'keep': '1 page'
        },
        {
            'title': 'LMS vs SIS Explainer Section',
            'issue': 'Textbook explanation of what LMS and SIS mean',
            'recommendation': 'Remove entirely or reduce to 2-3 sentences',
            'pages': '~2 pages',
            'keep': '2 sentences'
        },
        {
            'title': 'Moodle vs Blackboard vs iEnabler Comparison',
            'issue': 'Generic product comparison not specific to your project',
            'recommendation': 'Cut. Only mention why YOU chose your tech stack',
            'pages': '~3-4 pages',
            'keep': '0 pages'
        },
        {
            'title': 'Industry Statistics Section',
            'issue': 'Generic stats about SA universities (34% use Moodle, etc.)',
            'recommendation': 'Remove. Not about YOUR project',
            'pages': '~1 page',
            'keep': '0 pages'
        },
        {
            'title': 'Generic Literature Review',
            'issue': 'Standard best practices (MFA reduces access by 99.9%, etc.)',
            'recommendation': 'Cut heavily. Only keep what YOU actually used/did',
            'pages': '~2-3 pages',
            'keep': '0.5 pages'
        },
        {
            'title': 'Competitive Analysis Table (Canvas, Blackboard, Banner)',
            'issue': 'Generic comparison of commercial products',
            'recommendation': 'Remove. Not relevant to YOUR implementation',
            'pages': '~1 page',
            'keep': '0 pages'
        },
        {
            'title': 'Technology Stack Explanations',
            'issue': 'Generic descriptions of React, Node.js, PostgreSQL',
            'recommendation': 'Keep only WHY you chose them for EduHub specifically',
            'pages': '~2 pages',
            'keep': '0.5 pages'
        }
    ]

    total_generic = 0
    total_keep = 0

    for i, section in enumerate(generic_sections, 1):
        print(f"{i}. {section['title']}")
        print(f"   Issue: {section['issue']}")
        print(f"   Currently: ~{section['pages']}")
        print(f"   Should be: {section['keep']}")
        print(f"   Action: {section['recommendation']}")
        print()

        # Extract numeric pages
        current = re.search(r'(\d+)', section['pages'])
        keep = re.search(r'(\d+\.?\d*)', section['keep'])
        if current:
            total_generic += float(current.group(1))
        if keep:
            total_keep += float(keep.group(1))

    print("=" * 80)
    print(f"\n📊 ESTIMATED PAGE COUNT:")
    print(f"   Generic content to remove: ~{total_generic:.0f} pages")
    print(f"   Should keep: ~{total_keep:.1f} pages")
    print(f"   Pages to cut: ~{total_generic - total_keep:.0f} pages")
    print()

    print("=" * 80)
    print("\n✅ SECTIONS THAT ARE GOOD (Project-Specific):\n")

    good_sections = [
        '2.1 Identification of Need - Richfield Context (specific problems)',
        'Expected Benefits (specific to Richfield)',
        'Feasibility Study (your team\'s skills assessment)',
        'Technical Skills Assessment (YOUR team)',
        'Infrastructure Requirements (YOUR setup)',
        'Requirements (YOUR system features)',
        'Data Models (YOUR database design)',
    ]

    for section in good_sections:
        print(f"✓ {section}")

    print("\n" + "=" * 80)
    print("\n🎯 WHAT YOU NEED TO ADD (Project-Specific Content):\n")

    needed_sections = [
        {
            'section': 'YOUR Actual Analysis Process',
            'details': 'How YOU analyzed Richfield\'s problems (interviews YOU conducted, observations YOU made)'
        },
        {
            'section': 'YOUR Design Decisions',
            'details': 'Why YOU chose React/Node.js for THIS project (not generic benefits)'
        },
        {
            'section': 'YOUR Database Design',
            'details': 'YOUR ERD with YOUR tables, YOUR relationships, YOUR design choices'
        },
        {
            'section': 'YOUR System Architecture',
            'details': 'How YOUR system is structured (YOUR components, YOUR API endpoints)'
        },
        {
            'section': 'YOUR Prototype/Wireframes',
            'details': 'Screenshots of YOUR actual UI, YOUR mockups, YOUR designs'
        },
        {
            'section': 'YOUR Implementation Details',
            'details': 'Key code snippets from YOUR project, YOUR algorithms, YOUR solutions'
        },
        {
            'section': 'YOUR Testing Approach',
            'details': 'Tests YOU wrote, bugs YOU found, how YOU tested YOUR features'
        },
        {
            'section': 'YOUR Challenges & Solutions',
            'details': 'Problems YOU faced and how YOU solved them in YOUR project'
        }
    ]

    for i, item in enumerate(needed_sections, 1):
        print(f"{i}. {item['section']}")
        print(f"   Add: {item['details']}\n")

    print("=" * 80)
    print("\n💡 BOTTOM LINE:\n")
    print("Your document is currently ~40-50% generic textbook content.")
    print("It should be ~95% about YOUR specific EduHub project.")
    print()
    print("ACTIONS NEEDED:")
    print("1. Cut ~15-20 pages of generic industry analysis")
    print("2. Cut ~5-10 pages of textbook theory")
    print("3. Add 10-15 pages of YOUR specific implementation")
    print("4. Add screenshots of YOUR actual system")
    print("5. Add YOUR code samples")
    print("6. Add YOUR test results")
    print()
    print("=" * 80)

if __name__ == '__main__':
    analyze_document()
