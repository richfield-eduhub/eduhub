#!/usr/bin/env python3
"""
Sync the .docx changes back to the .md file
This reads the text-converted .docx and creates a proper markdown version
"""

import re

def convert_txt_to_md():
    """Convert the textutil output to proper markdown"""

    with open('planning-phase-submission-temp.txt', 'r', encoding='utf-8') as f:
        content = f.read()

    # The content is already mostly plain text, we need to add markdown formatting

    # Split into lines
    lines = content.split('\n')
    md_lines = []

    in_table = False
    skip_toc = False
    line_num = 0

    while line_num < len(lines):
        line = lines[line_num]

        # Skip the table of contents section (we'll regenerate it or keep manual)
        if 'Table of Contents' in line:
            skip_toc = True
            md_lines.append('## Table of Contents\n')
            line_num += 1
            continue

        # End of TOC when we hit the main content
        if skip_toc and ('2. Planning Phase' in line or '# 2. Planning Phase' in line) and 'Planning Phase\t' not in line:
            skip_toc = False

        if skip_toc:
            # Keep TOC lines as-is for now
            md_lines.append(line)
            line_num += 1
            continue

        # Convert headings based on patterns
        # Main section (# 2. Planning Phase)
        if re.match(r'^2\. Planning Phase$', line):
            md_lines.append('# 2. Planning Phase')
        # Subsection (## 2.1 ...)
        elif re.match(r'^2\.\d+ ', line):
            md_lines.append(f'# {line}')
        # Sub-subsection (### 2.1.1 ...)
        elif re.match(r'^2\.\d+\.\d+ ', line):
            md_lines.append(f'## {line}')
        # Numbered sections like "1. Applicants"
        elif re.match(r'^\d+\. [A-Z]', line) and len(line) < 80:
            md_lines.append(f'### {line}')
        # Detect tables (Institution, LMS Technology, etc.)
        elif line.strip() in ['Institution', 'Feature', 'Technology', 'Activity']:
            in_table = True
            # Start markdown table
            md_lines.append(f'| {line.strip()} |')
        # Table rows
        elif in_table and line.strip() and not line.startswith('\t'):
            # End of table if we hit a non-table line
            if re.match(r'^[A-Z][a-z]+ [A-Z]', line):  # Like "Key Observation"
                in_table = False
                md_lines.append(f'\n**{line}**')
            else:
                md_lines.append(line)
        # Bullet points
        elif line.strip().startswith('•\t'):
            content_line = line.replace('•\t', '').strip()
            md_lines.append(f'- {content_line}')
        elif line.strip().startswith('•'):
            content_line = line.replace('•', '').strip()
            md_lines.append(f'- {content_line}')
        # Regular content
        else:
            md_lines.append(line)

        line_num += 1

    # Join lines
    md_content = '\n'.join(md_lines)

    # Clean up multiple newlines
    md_content = re.sub(r'\n{4,}', '\n\n\n', md_content)

    return md_content

def main():
    print("=" * 80)
    print("SYNCING .DOCX CHANGES TO .MD FILE")
    print("=" * 80)
    print()

    print("Reading converted .docx content...")
    md_content = convert_txt_to_md()

    # Save the synchronized version
    output_file = 'planning-phase-submission-synced.md'
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(md_content)

    print(f"✓ Created: {output_file}")
    print()
    print("=" * 80)
    print("NEXT STEPS:")
    print("=" * 80)
    print()
    print("1. Review planning-phase-submission-synced.md")
    print("2. If it looks good, run:")
    print("   mv planning-phase-submission-synced.md planning-phase-submission.md")
    print()
    print("Note: The conversion from .docx to text loses some formatting.")
    print("You may need to manually fix:")
    print("  - Tables (convert to markdown table format)")
    print("  - Code blocks (add ``` markers)")
    print("  - Diagrams (add ``` markers)")
    print("  - Bold/italic formatting")
    print()
    print("=" * 80)

if __name__ == '__main__':
    main()
