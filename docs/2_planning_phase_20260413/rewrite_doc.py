#!/usr/bin/env python3
"""
Script to rewrite the planning document by:
1. Removing all library/librarian references
2. Simplifying language to sound more student-written
3. Preserving all diagrams
"""

import re

def remove_librarian_stakeholder(content):
    """Remove the entire Librarian stakeholder section"""
    # Remove the librarian stakeholder section (### 4. Librarians ... ### 5. Administrators)
    pattern = r'### 4\. Librarians.*?(?=### 5\. Administrators)'
    content = re.sub(pattern, '', content, flags=re.DOTALL)

    # Renumber subsequent stakeholders
    content = content.replace('### 5. Administrators', '### 4. Administrators')
    content = content.replace('### 6. Institutional Management', '### 5. Institutional Management')

    return content

def remove_librarian_interview_data(content):
    """Remove librarian interview data from preliminary investigation"""
    # Remove "- 1 librarian" from participants
    content = content.replace('- 1 librarian\n', '')

    # Remove librarian interview findings section
    pattern = r'\*\*Librarians Reported\*\*:.*?(?=\n### |\n\*\*[A-Z]|\Z)'
    content = re.sub(pattern, '', content, flags=re.DOTALL)

    return content

def remove_librarian_from_tables(content):
    """Remove librarian rows from tables"""
    # Remove rows containing "Librarian" or "librarian"
    lines = content.split('\n')
    filtered_lines = []

    for line in lines:
        # Skip table rows that mention librarian
        if '|' in line and ('librarian' in line.lower() or 'library' in line.lower()):
            # Check if it's actually about library (not library as in code library)
            if 'UI library' in line or 'component library' in line or 'Testing Library' in line:
                filtered_lines.append(line)
            elif 'library staff' in line.lower() or 'verify student' in line.lower():
                continue  # Skip library-related rows
            else:
                filtered_lines.append(line)
        else:
            filtered_lines.append(line)

    return '\n'.join(filtered_lines)

def remove_librarian_use_cases(content):
    """Remove librarian from use case diagrams and lists"""
    # Remove librarian actor from mermaid diagrams
    content = re.sub(r'\s+Librarian\[.*?\]\n', '\n', content)
    content = re.sub(r'\s+Librarian -->.*?\n', '\n', content)
    content = re.sub(r'.*?Librarian.*?fill:#E6E6FA.*?\n', '', content)

    # Remove librarian use cases
    content = re.sub(r'\*\*Librarian Use Cases\*\*:.*?(?=\n\*\*|\n###|\Z)', '', content, flags=re.DOTALL)
    content = re.sub(r'\|\s*UC-09\s*\|.*?Librarian.*?\|.*?\n', '', content)

    return content

def remove_librarian_from_dfd(content):
    """Remove librarian from data flow diagrams"""
    content = re.sub(r'.*?Librarian.*?\[📚 Librarian\].*?\n', '', content)
    content = re.sub(r'.*?Librarian -->.*?\n', '', content)
    content = re.sub(r'.*?-->.*?Librarian.*?\n', '', content)
    content = re.sub(r'.*?Librarians.*?\n', '', content)
    content = re.sub(r'.*?To Librarians:.*?\n', '', content)

    return content

def remove_librarian_requirements(content):
    """Remove librarian feature requirements"""
    # Remove sections titled with librarian
    content = re.sub(r'###\s+\d+\.\s+Librarian Features.*?(?=\n###|\Z)', '', content, flags=re.DOTALL)
    content = re.sub(r'│   │   ├── 5\.6\.2 Librarian Features.*?\n', '', content)
    content = re.sub(r'Lecturer/librarian features', 'Lecturer features', content)

    return content

def remove_librarian_roles(content):
    """Remove librarian from role definitions"""
    content = re.sub(r',\s*Librarian(?=["\']|\))', '', content)
    content = re.sub(r'Librarian,\s*', '', content)
    content = re.sub(r'\|\s*\*\*Librarian\*\*.*?\|.*?\|.*?\n', '', content)
    content = re.sub(r'"Student, Lecturer, Administrator, Librarian"', '"Student, Lecturer, Administrator"', content)
    content = re.sub(r'User role \(Student, Lecturer, Administrator, Librarian\)', 'User role (Student, Lecturer, Administrator)', content)

    return content

def simplify_language(content):
    """Simplify overly formal language to sound more student-written"""

    replacements = {
        # Overly formal phrases
        'comprehensive': 'thorough',
        'facilitate': 'help',
        'utilize': 'use',
        'implement': 'build',
        'Furthermore,': 'Also,',
        'Additionally,': 'Also,',
        'Moreover,': 'Plus,',
        'Subsequently,': 'Then,',
        'In addition,': 'Also,',
        'With regards to': 'For',
        'In order to': 'To',
        'For the purpose of': 'To',
        'In the event that': 'If',
        'At this point in time': 'Now',
        'Due to the fact that': 'Because',
        'In light of the fact that': 'Since',
        'Has the ability to': 'Can',
        'Is able to': 'Can',
        'In a timely manner': 'Quickly',
        'At the present time': 'Currently',
        'Prior to': 'Before',
        'Subsequent to': 'After',

        # Corporate speak
        'stakeholders': 'people involved',
        'deliverables': 'outputs',
        'synergize': 'work together',
        'leverage': 'use',
        'bandwidth': 'capacity',
        'touch base': 'check in',
        'circle back': 'follow up',
        'take offline': 'discuss later',
        'paradigm': 'approach',
        'ecosystem': 'environment',
    }

    for old, new in replacements.items():
        # Only replace whole words, not parts of words
        content = re.sub(r'\b' + old + r'\b', new, content, flags=re.IGNORECASE)

    return content

def add_simple_diagrams(content):
    """Add simple ASCII diagrams where helpful"""

    # Add system architecture diagram after "How EduHub Fixes This"
    arch_diagram = """

Here's what the system looks like at a high level:

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

"""

    # Find "Simple: **Everything in one place**." and add diagram after
    content = content.replace(
        'Simple: **Everything in one place**.',
        'Simple: **Everything in one place**.' + arch_diagram
    )

    return content

def main():
    # Read the original document
    with open('planning-phase-submission.md', 'r', encoding='utf-8') as f:
        content = f.read()

    print("Original document length:", len(content), "characters")

    # Step 1: Remove all librarian references
    print("\n1. Removing librarian stakeholder section...")
    content = remove_librarian_stakeholder(content)

    print("2. Removing librarian interview data...")
    content = remove_librarian_interview_data(content)

    print("3. Removing librarian from tables...")
    content = remove_librarian_from_tables(content)

    print("4. Removing librarian use cases...")
    content = remove_librarian_use_cases(content)

    print("5. Removing librarian from DFDs...")
    content = remove_librarian_from_dfd(content)

    print("6. Removing librarian requirements...")
    content = remove_librarian_requirements(content)

    print("7. Removing librarian roles...")
    content = remove_librarian_roles(content)

    # Step 2: Simplify language
    print("\n8. Simplifying language...")
    content = simplify_language(content)

    # Step 3: Add diagrams
    print("9. Adding diagrams...")
    content = add_simple_diagrams(content)

    # Write the updated document
    with open('planning-phase-submission-rewritten.md', 'w', encoding='utf-8') as f:
        f.write(content)

    print("\nNew document length:", len(content), "characters")
    print("\nRewritten document saved as: planning-phase-submission-rewritten.md")
    print("\nDone! Review the new file and if it looks good, you can replace the original.")

if __name__ == '__main__':
    main()
