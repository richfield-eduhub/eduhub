#!/usr/bin/env python3
"""
Final cleanup to remove all remaining librarian references
"""

import re

def final_cleanup(content):
    """Remove all remaining librarian references"""

    # Remove any lines with "Librarian" (case insensitive) except for code library references
    lines = content.split('\n')
    cleaned_lines = []

    skip_next_lines = 0
    for i, line in enumerate(lines):
        # Skip if we're in a skip zone
        if skip_next_lines > 0:
            skip_next_lines -= 1
            continue

        # Keep lines about code libraries
        if any(term in line for term in ['UI library', 'UI component libraries', 'Testing Library', 'Password hashing library', 'library with', 'library for', 'library (', 'Open-source UI library']):
            cleaned_lines.append(line)
            continue

        # Remove lines mentioning librarian
        if re.search(r'\blibrarian', line, re.IGNORECASE):
            # If it's a comment in a diagram, skip it
            if '%% Librarian' in line or '    %% Librarian' in line:
                continue
            # If it's a role definition line
            if '**Librarian**' in line or '- **Librarian**:' in line:
                continue
            # If it's in a mermaid diagram
            if 'LibrarianDash' in line:
                continue
            # If it's a comment
            if '- Handles librarian' in line:
                continue
            cleaned_lines.append(line)
        else:
            cleaned_lines.append(line)

    content = '\n'.join(cleaned_lines)

    # Remove specific patterns
    patterns_to_remove = [
        r'- \*\*Librarian\*\*:.*?\n',
        r'\s*%% Librarian.*?\n',
        r'.*?LibrarianDash.*?\n',
        r'.*?Handles librarian.*?\n',
        r'\|\s*\*\*Librarian\*\*\s*\|.*?\n',
    ]

    for pattern in patterns_to_remove:
        content = re.sub(pattern, '', content, flags=re.IGNORECASE)

    return content

def main():
    with open('planning-phase-submission-rewritten.md', 'r', encoding='utf-8') as f:
        content = f.read()

    print("Performing final cleanup...")

    content = final_cleanup(content)

    # Count remaining references
    remaining = len([line for line in content.split('\n')
                     if re.search(r'\blibrarian', line, re.IGNORECASE)
                     and not any(term in line for term in ['UI library', 'component libraries', 'Testing Library', 'Password hashing library'])])

    print(f"Remaining librarian references: {remaining}")

    with open('planning-phase-submission-rewritten.md', 'w', encoding='utf-8') as f:
        f.write(content)

    print("Final cleanup complete!")

if __name__ == '__main__':
    main()
