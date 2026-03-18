# EduHub Process Flowcharts - Draw.io Files

This directory contains 3 comprehensive process flowcharts for the EduHub Student Management System, created for the Planning Phase documentation.

## 📁 Files Included

### 1. **flowchart-1-application-approval.drawio**
- **Process**: Application Submission & Approval Workflow
- **Complexity**: High (5 major decision points)
- **Shows**: Complete lifecycle from student application submission through admin review to approval/rejection
- **Key Features**:
  - User authentication check
  - Form and document validation
  - Admin review process with 3 outcomes (approve/reject/request info)
  - Student number generation on approval
  - Database operations and email notifications

### 2. **flowchart-2-course-registration.drawio**
- **Process**: Course Registration Workflow
- **Complexity**: Very High (8 major decision points)
- **Shows**: Complete course registration process with comprehensive validation
- **Key Features**:
  - Authentication and authorization checks
  - Registration period validation
  - Prerequisites verification
  - Course capacity management
  - Schedule conflict detection
  - Duplicate registration prevention
  - Waitlist functionality
  - Option to register for multiple courses

### 3. **flowchart-3-user-authentication.drawio**
- **Process**: User Authentication & Authorization Workflow
- **Complexity**: High (7 major decision points)
- **Shows**: Complete login process with security features
- **Key Features**:
  - Input validation
  - Email format verification
  - Password hash verification (bcrypt)
  - Failed login attempt tracking
  - Account locking after 5 failed attempts
  - Role-based routing (5 user types)
  - Session management with JWT tokens

## 🎨 How to Edit These Files

### Option 1: Using draw.io Desktop App
1. Download draw.io from https://www.diagrams.net/
2. Install the application
3. Open the `.drawio` file in draw.io
4. Edit as needed
5. Save or export as PNG/PDF/SVG

### Option 2: Using draw.io Online
1. Go to https://app.diagrams.net/
2. Click "Open Existing Diagram"
3. Upload one of the `.drawio` files
4. Edit directly in browser
5. Download when finished

### Option 3: Using VS Code
1. Install the "Draw.io Integration" extension
2. Open the `.drawio` file in VS Code
3. Edit in the integrated viewer
4. Save changes

## 📊 Flowchart Legend

### Colors Used
- 🟢 **Green (#90EE90)**: Start/End success nodes
- 🔴 **Pink (#FFB6C1)**: Error nodes, rejection paths, end failures
- 🟡 **Peach (#FFE4B5)**: Decision diamonds (if/else logic)
- 🔵 **Light Blue (#87CEEB)**: Special processes (waitlist, token generation)
- 🟣 **Lavender (#E6E6FA)**: Database operations (read/write/log)
- 🟢 **Light Green (#E0FFE0)**: Regular process steps

### Shapes Used
- **Rounded Rectangle**: Start/End nodes
- **Rectangle**: Process steps
- **Diamond**: Decision points (Yes/No, multiple options)
- **Cylinder**: Database operations
- **Arrows**: Process flow direction

## ✏️ Editing Tips

### To Add a New Step:
1. Select any shape from the left toolbar
2. Drag onto canvas
3. Double-click to edit text
4. Use the connector tool to link shapes

### To Change Colors:
1. Select the shape
2. Click "Fill" in the toolbar
3. Choose new color
4. Apply

### To Rearrange:
1. Select shape(s)
2. Drag to new position
3. Connectors will auto-adjust

### To Export:
1. File → Export As
2. Choose format (PNG, PDF, SVG, etc.)
3. Select quality/size options
4. Download

## 📝 Integration with Planning Document

These flowcharts have been integrated into the main planning-phase.md document using Mermaid syntax. The `.drawio` files provide:

1. **Easier Editing**: Visual drag-and-drop interface
2. **Better Formatting**: Professional styling and colors
3. **Flexible Export**: Can export as images for presentations
4. **Collaboration**: Easy to share and edit with team members

## 🎯 Best Practices for Editing

### DO:
- ✅ Keep consistent colors for similar node types
- ✅ Use clear, concise labels
- ✅ Maintain logical flow (top to bottom, left to right)
- ✅ Add decision labels on arrows (Yes/No)
- ✅ Group related processes visually

### DON'T:
- ❌ Cross too many connector lines (confusing)
- ❌ Use too many colors (reduces clarity)
- ❌ Make text too small to read
- ❌ Create circular flows without clear exit points
- ❌ Skip error handling paths

## 🔄 Updating the Markdown Document

After editing the `.drawio` files, you can:

1. **Export as PNG/SVG** and reference in markdown:
   ```markdown
   ![Application Approval Flowchart](./flowchart-1-application-approval.png)
   ```

2. **Or keep using Mermaid** (already in the document):
   - The Mermaid versions render automatically in GitHub/GitLab
   - Draw.io files serve as editable source files
   - Both approaches are valid

## 📚 Additional Resources

- **Draw.io Documentation**: https://www.diagrams.net/doc/
- **Flowchart Best Practices**: https://www.lucidchart.com/pages/flowchart-best-practices
- **Mermaid Flowchart Syntax**: https://mermaid.js.org/syntax/flowchart.html

## 🎓 Academic Context

**Purpose**: These flowcharts demonstrate:
- ✅ Deep understanding of system processes
- ✅ Comprehensive error handling design
- ✅ Attention to business logic and validation
- ✅ Security considerations (authentication, authorization)
- ✅ Professional documentation quality

**Value**: Adding these flowcharts to your Planning Phase documentation shows:
- Thorough process analysis
- Implementation-ready specifications
- Developer-friendly documentation
- Professional project management skills

## 💡 Tips for Presentation

When presenting these flowcharts:
1. **Walk through the happy path first** (successful flow)
2. **Then explain error handling** (what goes wrong and how system responds)
3. **Highlight security features** (authentication, validation, audit logging)
4. **Emphasize business value** (why each validation matters)

---

**Created for**: EduHub Student Management System - Planning Phase
**Date**: March 2026
**Team**: EduHub Development Team
**Course**: IT Project
