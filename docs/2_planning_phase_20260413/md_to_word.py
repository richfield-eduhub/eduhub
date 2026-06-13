#!/usr/bin/env python3
"""
Convert markdown to HTML that can be opened and saved as .docx in Word
"""

import re

def markdown_to_html(md_content):
    """Convert markdown to HTML"""
    html = md_content

    # Convert headers
    html = re.sub(r'^# (.*?)$', r'<h1>\1</h1>', html, flags=re.MULTILINE)
    html = re.sub(r'^## (.*?)$', r'<h2>\1</h2>', html, flags=re.MULTILINE)
    html = re.sub(r'^### (.*?)$', r'<h3>\1</h3>', html, flags=re.MULTILINE)
    html = re.sub(r'^#### (.*?)$', r'<h4>\1</h4>', html, flags=re.MULTILINE)

    # Convert bold
    html = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', html)

    # Convert italic
    html = re.sub(r'\*(.*?)\*', r'<em>\1</em>', html)

    # Convert code blocks
    html = re.sub(r'```(.*?)```', r'<pre>\1</pre>', html, flags=re.DOTALL)
    html = re.sub(r'`(.*?)`', r'<code>\1</code>', html)

    # Convert links
    html = re.sub(r'\[(.*?)\]\((.*?)\)', r'<a href="\2">\1</a>', html)

    # Convert bullet lists
    lines = html.split('\n')
    in_list = False
    new_lines = []

    for line in lines:
        if line.strip().startswith('- '):
            if not in_list:
                new_lines.append('<ul>')
                in_list = True
            new_lines.append(f'<li>{line.strip()[2:]}</li>')
        else:
            if in_list:
                new_lines.append('</ul>')
                in_list = False
            new_lines.append(line)

    if in_list:
        new_lines.append('</ul>')

    html = '\n'.join(new_lines)

    # Convert horizontal rules
    html = re.sub(r'^---$', '<hr/>', html, flags=re.MULTILINE)

    # Wrap paragraphs
    lines = html.split('\n')
    new_lines = []
    in_tag = False

    for line in lines:
        stripped = line.strip()
        if not stripped:
            new_lines.append('<br/>')
        elif stripped.startswith('<') or stripped.startswith('|'):
            new_lines.append(line)
        else:
            new_lines.append(f'<p>{line}</p>')

    html = '\n'.join(new_lines)

    return html

def create_html_document(md_file, html_file):
    """Create a full HTML document from markdown"""

    with open(md_file, 'r', encoding='utf-8') as f:
        md_content = f.read()

    html_content = markdown_to_html(md_content)

    # Create full HTML document with styling
    full_html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>EduHub Planning Phase Submission</title>
    <style>
        body {{
            font-family: 'Calibri', 'Arial', sans-serif;
            line-height: 1.6;
            max-width: 900px;
            margin: 40px auto;
            padding: 20px;
            color: #333;
        }}
        h1 {{
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
            font-size: 28px;
        }}
        h2 {{
            color: #2980b9;
            margin-top: 30px;
            font-size: 24px;
            border-bottom: 2px solid #ecf0f1;
            padding-bottom: 8px;
        }}
        h3 {{
            color: #34495e;
            margin-top: 20px;
            font-size: 20px;
        }}
        h4 {{
            color: #7f8c8d;
            font-size: 16px;
        }}
        pre {{
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            border-left: 4px solid #3498db;
            padding: 15px;
            overflow-x: auto;
            font-family: 'Courier New', monospace;
            white-space: pre-wrap;
        }}
        code {{
            background-color: #f8f9fa;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            color: #e74c3c;
        }}
        table {{
            border-collapse: collapse;
            width: 100%;
            margin: 20px 0;
        }}
        th, td {{
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }}
        th {{
            background-color: #3498db;
            color: white;
        }}
        tr:nth-child(even) {{
            background-color: #f8f9fa;
        }}
        ul {{
            margin: 10px 0;
        }}
        li {{
            margin: 5px 0;
        }}
        hr {{
            border: none;
            border-top: 2px solid #ecf0f1;
            margin: 30px 0;
        }}
        strong {{
            color: #2c3e50;
        }}
        .page-break {{
            page-break-after: always;
        }}
        @media print {{
            body {{
                margin: 0;
                padding: 20px;
            }}
        }}
    </style>
</head>
<body>
{html_content}
</body>
</html>
"""

    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(full_html)

    print(f"HTML file created: {html_file}")
    print(f"\nTo create a Word document:")
    print(f"1. Open {html_file} in your web browser")
    print(f"2. Right-click and select 'Print' or press Cmd+P (Mac) / Ctrl+P (Windows)")
    print(f"3. Select 'Save as PDF' as the printer")
    print(f"4. Save the PDF")
    print(f"5. Open the PDF in Microsoft Word")
    print(f"6. Word will convert it to a .docx document")
    print(f"7. Save as .docx")
    print(f"\nAlternatively:")
    print(f"1. Open {html_file} in Microsoft Word directly")
    print(f"2. Go to File > Save As")
    print(f"3. Choose 'Word Document (.docx)' as the format")

def main():
    md_file = 'planning-phase-submission.md'
    html_file = 'planning-phase-submission.html'

    print("Converting markdown to HTML...")
    create_html_document(md_file, html_file)
    print("\nDone!")

if __name__ == '__main__':
    main()
