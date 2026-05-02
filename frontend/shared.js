/**
 * EduHub shared.js  v3 — API-connected
 * Every data operation calls the real REST API at /api/*
 * Auth token stored in localStorage('authToken')
 * User object cached in localStorage('currentUser') for instant UI render
 */

/* ═══════════════════════════════════════════════════
   CONSTANTS  (no server call needed)
   ═══════════════════════════════════════════════════ */
const EDUHUB_LOGO =
  "data:image/png;base64,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";

const QUALIFICATIONS = [
  {
    code: "BSc IT",
    name: "Bachelor of Science in Information Technology",
    faculty: "Faculty of Information Technology",
    duration: "3 Years",
    fee: 45000,
    modules: [
      {
        code: "BSCIT1101",
        name: "Introduction to Programming",
        credits: 15,
        semester: 1,
        year: 1,
      },
      {
        code: "BSCIT1102",
        name: "Computer Architecture & Organisation",
        credits: 15,
        semester: 1,
        year: 1,
      },
      {
        code: "BSCIT1103",
        name: "Mathematics for Computing",
        credits: 15,
        semester: 1,
        year: 1,
      },
      {
        code: "BSCIT1204",
        name: "Web Development Fundamentals",
        credits: 15,
        semester: 2,
        year: 1,
      },
      {
        code: "BSCIT1205",
        name: "Database Design & Management",
        credits: 15,
        semester: 2,
        year: 1,
      },
      {
        code: "BSCIT1206",
        name: "Networking Fundamentals",
        credits: 15,
        semester: 2,
        year: 1,
      },
      {
        code: "BSCIT2107",
        name: "Object-Oriented Programming",
        credits: 15,
        semester: 1,
        year: 2,
      },
      {
        code: "BSCIT2108",
        name: "Systems Analysis & Design",
        credits: 15,
        semester: 1,
        year: 2,
      },
      {
        code: "BSCIT2109",
        name: "Data Structures & Algorithms",
        credits: 15,
        semester: 1,
        year: 2,
      },
      {
        code: "BSCIT2210",
        name: "Cyber Security Fundamentals",
        credits: 15,
        semester: 2,
        year: 2,
      },
      {
        code: "BSCIT2211",
        name: "Cloud Computing",
        credits: 15,
        semester: 2,
        year: 2,
      },
      {
        code: "BSCIT2212",
        name: "Internet of Things",
        credits: 15,
        semester: 2,
        year: 2,
      },
      {
        code: "BSCIT3113",
        name: "Business Intelligence & Data Analytics",
        credits: 15,
        semester: 1,
        year: 3,
      },
      {
        code: "BSCIT3114",
        name: "Mobile Computing & Applications",
        credits: 15,
        semester: 1,
        year: 3,
      },
      {
        code: "BSCIT3115",
        name: "IT Project Management",
        credits: 15,
        semester: 1,
        year: 3,
      },
      {
        code: "BSCIT3216",
        name: "Digital Applications Development",
        credits: 15,
        semester: 2,
        year: 3,
      },
      {
        code: "BSCIT3217",
        name: "Work Integrated Learning",
        credits: 15,
        semester: 2,
        year: 3,
      },
      {
        code: "BSCIT3218",
        name: "IT Research Project",
        credits: 15,
        semester: 2,
        year: 3,
      },
    ],
  },
  {
    code: "Dip IT",
    name: "Diploma in Information Technology",
    faculty: "Faculty of Information Technology",
    duration: "3 Years",
    fee: 42000,
    modules: [
      {
        code: "DIT1101",
        name: "Introduction to IT",
        credits: 15,
        semester: 1,
        year: 1,
      },
      {
        code: "DIT1102",
        name: "Programming Logic & Design",
        credits: 15,
        semester: 1,
        year: 1,
      },
      {
        code: "DIT1103",
        name: "Computer Hardware & Software",
        credits: 15,
        semester: 1,
        year: 1,
      },
      {
        code: "DIT1204",
        name: "Database Fundamentals",
        credits: 15,
        semester: 2,
        year: 1,
      },
      {
        code: "DIT1205",
        name: "Web Design & Development",
        credits: 15,
        semester: 2,
        year: 1,
      },
      {
        code: "DIT1206",
        name: "Business Communication",
        credits: 15,
        semester: 2,
        year: 1,
      },
      {
        code: "DIT2107",
        name: "Network Administration",
        credits: 15,
        semester: 1,
        year: 2,
      },
      {
        code: "DIT2108",
        name: "Application Programming",
        credits: 15,
        semester: 1,
        year: 2,
      },
      {
        code: "DIT2109",
        name: "Operating Systems Administration",
        credits: 15,
        semester: 1,
        year: 2,
      },
      {
        code: "DIT2210",
        name: "IT Service Management",
        credits: 15,
        semester: 2,
        year: 2,
      },
      {
        code: "DIT2211",
        name: "Python Development",
        credits: 15,
        semester: 2,
        year: 2,
      },
      {
        code: "DIT2212",
        name: "Systems Security",
        credits: 15,
        semester: 2,
        year: 2,
      },
      {
        code: "DIT3113",
        name: "Advanced Networking & Infrastructure",
        credits: 15,
        semester: 1,
        year: 3,
      },
      {
        code: "DIT3114",
        name: "Database Administration",
        credits: 15,
        semester: 1,
        year: 3,
      },
      {
        code: "DIT3115",
        name: "Software Engineering",
        credits: 15,
        semester: 1,
        year: 3,
      },
      {
        code: "DIT3216",
        name: "Work Integrated Learning",
        credits: 15,
        semester: 2,
        year: 3,
      },
      {
        code: "DIT3217",
        name: "IT Governance & Compliance",
        credits: 15,
        semester: 2,
        year: 3,
      },
      {
        code: "DIT3218",
        name: "Emerging Technologies",
        credits: 15,
        semester: 2,
        year: 3,
      },
    ],
  },
  {
    code: "HC IT",
    name: "Higher Certificate in Information Technology",
    faculty: "Faculty of Information Technology",
    duration: "1 Year",
    fee: 28000,
    modules: [
      {
        code: "HCIT1101",
        name: "IT Fundamentals",
        credits: 15,
        semester: 1,
        year: 1,
      },
      {
        code: "HCIT1102",
        name: "Introduction to Programming",
        credits: 15,
        semester: 1,
        year: 1,
      },
      {
        code: "HCIT1103",
        name: "Computer Networks Basics",
        credits: 15,
        semester: 1,
        year: 1,
      },
      {
        code: "HCIT1204",
        name: "Systems Development",
        credits: 15,
        semester: 2,
        year: 1,
      },
      {
        code: "HCIT1205",
        name: "Technical Support Fundamentals",
        credits: 15,
        semester: 2,
        year: 1,
      },
      {
        code: "HCIT1206",
        name: "Web Development Basics",
        credits: 15,
        semester: 2,
        year: 1,
      },
    ],
  },
  {
    code: "HC CF",
    name: "Higher Certificate in Computer Forensics",
    faculty: "Faculty of Information Technology",
    duration: "1 Year",
    fee: 28000,
    modules: [
      {
        code: "HCCF1101",
        name: "Introduction to Cybercrime & Law",
        credits: 15,
        semester: 1,
        year: 1,
      },
      {
        code: "HCCF1102",
        name: "Digital Evidence & Acquisition",
        credits: 15,
        semester: 1,
        year: 1,
      },
      {
        code: "HCCF1103",
        name: "Computer Forensics Fundamentals",
        credits: 15,
        semester: 1,
        year: 1,
      },
      {
        code: "HCCF1204",
        name: "Information Security Management",
        credits: 15,
        semester: 2,
        year: 1,
      },
      {
        code: "HCCF1205",
        name: "Cybercrime Investigation Techniques",
        credits: 15,
        semester: 2,
        year: 1,
      },
      {
        code: "HCCF1206",
        name: "Forensic Reporting & Documentation",
        credits: 15,
        semester: 2,
        year: 1,
      },
    ],
  },
  {
    code: "BSc Hons IT",
    name: "BSc Honours in Information Technology",
    faculty: "Faculty of Information Technology",
    duration: "1 Year",
    fee: 48000,
    modules: [
      {
        code: "BSCHIT1101",
        name: "Advanced Research Methodology",
        credits: 15,
        semester: 1,
        year: 1,
      },
      {
        code: "BSCHIT1102",
        name: "IT Leadership & Governance",
        credits: 15,
        semester: 1,
        year: 1,
      },
      {
        code: "BSCHIT1203",
        name: "Advanced Software Engineering",
        credits: 15,
        semester: 2,
        year: 1,
      },
      {
        code: "BSCHIT1204",
        name: "Research Project & Dissertation",
        credits: 15,
        semester: 2,
        year: 1,
      },
    ],
  },
  {
    code: "BCom",
    name: "Bachelor of Commerce",
    faculty: "Faculty of Business & Management Sciences",
    duration: "3 Years",
    fee: 42000,
    modules: [
      {
        code: "BCOM1101",
        name: "Business Communication",
        credits: 15,
        semester: 1,
        year: 1,
      },
      {
        code: "BCOM1102",
        name: "Principles of Management",
        credits: 15,
        semester: 1,
        year: 1,
      },
      {
        code: "BCOM1103",
        name: "Financial Accounting",
        credits: 15,
        semester: 1,
        year: 1,
      },
      {
        code: "BCOM1204",
        name: "Economics I",
        credits: 15,
        semester: 2,
        year: 1,
      },
      {
        code: "BCOM1205",
        name: "Business Mathematics & Statistics",
        credits: 15,
        semester: 2,
        year: 1,
      },
      {
        code: "BCOM1206",
        name: "Marketing Fundamentals",
        credits: 15,
        semester: 2,
        year: 1,
      },
      {
        code: "BCOM2107",
        name: "Cost & Management Accounting",
        credits: 15,
        semester: 1,
        year: 2,
      },
      {
        code: "BCOM2108",
        name: "Human Resource Management",
        credits: 15,
        semester: 1,
        year: 2,
      },
      {
        code: "BCOM2109",
        name: "Business Law",
        credits: 15,
        semester: 1,
        year: 2,
      },
      {
        code: "BCOM2210",
        name: "Financial Management",
        credits: 15,
        semester: 2,
        year: 2,
      },
      {
        code: "BCOM2211",
        name: "Marketing Management",
        credits: 15,
        semester: 2,
        year: 2,
      },
      {
        code: "BCOM2212",
        name: "Operations Management",
        credits: 15,
        semester: 2,
        year: 2,
      },
      {
        code: "BCOM3113",
        name: "Strategic Management",
        credits: 15,
        semester: 1,
        year: 3,
      },
      {
        code: "BCOM3114",
        name: "Entrepreneurship & Innovation",
        credits: 15,
        semester: 1,
        year: 3,
      },
      {
        code: "BCOM3115",
        name: "Supply Chain Management",
        credits: 15,
        semester: 1,
        year: 3,
      },
      {
        code: "BCOM3216",
        name: "Corporate Governance & Ethics",
        credits: 15,
        semester: 2,
        year: 3,
      },
      {
        code: "BCOM3217",
        name: "International Business",
        credits: 15,
        semester: 2,
        year: 3,
      },
      {
        code: "BCOM3218",
        name: "Business Research Project",
        credits: 15,
        semester: 2,
        year: 3,
      },
    ],
  },
  {
    code: "BBA",
    name: "Bachelor of Business Administration",
    faculty: "Faculty of Business & Management Sciences",
    duration: "3 Years",
    fee: 42000,
    modules: [
      {
        code: "BBA1101",
        name: "Business Communication",
        credits: 15,
        semester: 1,
        year: 1,
      },
      {
        code: "BBA1102",
        name: "Organisational Behaviour",
        credits: 15,
        semester: 1,
        year: 1,
      },
      {
        code: "BBA1103",
        name: "Business Mathematics",
        credits: 15,
        semester: 1,
        year: 1,
      },
      {
        code: "BBA1204",
        name: "Introduction to Economics",
        credits: 15,
        semester: 2,
        year: 1,
      },
      {
        code: "BBA1205",
        name: "Business Computing",
        credits: 15,
        semester: 2,
        year: 1,
      },
      {
        code: "BBA1206",
        name: "Marketing Principles",
        credits: 15,
        semester: 2,
        year: 1,
      },
      {
        code: "BBA2107",
        name: "Financial Accounting",
        credits: 15,
        semester: 1,
        year: 2,
      },
      {
        code: "BBA2108",
        name: "Human Resource Management",
        credits: 15,
        semester: 1,
        year: 2,
      },
      {
        code: "BBA2109",
        name: "Business Law & Ethics",
        credits: 15,
        semester: 1,
        year: 2,
      },
      {
        code: "BBA2210",
        name: "Project Management",
        credits: 15,
        semester: 2,
        year: 2,
      },
      {
        code: "BBA2211",
        name: "Operations & Supply Chain",
        credits: 15,
        semester: 2,
        year: 2,
      },
      {
        code: "BBA2212",
        name: "Entrepreneurship",
        credits: 15,
        semester: 2,
        year: 2,
      },
      {
        code: "BBA3113",
        name: "Strategic Management",
        credits: 15,
        semester: 1,
        year: 3,
      },
      {
        code: "BBA3114",
        name: "Leadership & Change Management",
        credits: 15,
        semester: 1,
        year: 3,
      },
      {
        code: "BBA3115",
        name: "Digital Business & Innovation",
        credits: 15,
        semester: 1,
        year: 3,
      },
      {
        code: "BBA3216",
        name: "International Business Management",
        credits: 15,
        semester: 2,
        year: 3,
      },
      {
        code: "BBA3217",
        name: "Corporate Governance",
        credits: 15,
        semester: 2,
        year: 3,
      },
      {
        code: "BBA3218",
        name: "Business Research Project",
        credits: 15,
        semester: 2,
        year: 3,
      },
    ],
  },
  {
    code: "BPM",
    name: "Bachelor of Public Management",
    faculty: "Faculty of Business & Management Sciences",
    duration: "3 Years",
    fee: 38000,
    modules: [
      {
        code: "BPM1101",
        name: "Introduction to Public Administration",
        credits: 15,
        semester: 1,
        year: 1,
      },
      {
        code: "BPM1102",
        name: "Public Policy Fundamentals",
        credits: 15,
        semester: 1,
        year: 1,
      },
      {
        code: "BPM1103",
        name: "Government & Governance",
        credits: 15,
        semester: 1,
        year: 1,
      },
      {
        code: "BPM1204",
        name: "Public Sector Economics",
        credits: 15,
        semester: 2,
        year: 1,
      },
      {
        code: "BPM1205",
        name: "Public Finance & Budgeting",
        credits: 15,
        semester: 2,
        year: 1,
      },
      {
        code: "BPM1206",
        name: "Communication for Public Sector",
        credits: 15,
        semester: 2,
        year: 1,
      },
      {
        code: "BPM2107",
        name: "Public Sector HR Management",
        credits: 15,
        semester: 1,
        year: 2,
      },
      {
        code: "BPM2108",
        name: "Local Government Management",
        credits: 15,
        semester: 1,
        year: 2,
      },
      {
        code: "BPM2109",
        name: "Public Law & Administration",
        credits: 15,
        semester: 1,
        year: 2,
      },
      {
        code: "BPM2210",
        name: "Service Delivery Management",
        credits: 15,
        semester: 2,
        year: 2,
      },
      {
        code: "BPM2211",
        name: "Development Studies",
        credits: 15,
        semester: 2,
        year: 2,
      },
      {
        code: "BPM2212",
        name: "Research Methods in Public Sector",
        credits: 15,
        semester: 2,
        year: 2,
      },
      {
        code: "BPM3113",
        name: "Public Sector Strategic Planning",
        credits: 15,
        semester: 1,
        year: 3,
      },
      {
        code: "BPM3114",
        name: "Performance Management in Public Sector",
        credits: 15,
        semester: 1,
        year: 3,
      },
      {
        code: "BPM3115",
        name: "Intergovernmental Relations",
        credits: 15,
        semester: 1,
        year: 3,
      },
      {
        code: "BPM3216",
        name: "Policy Implementation & Evaluation",
        credits: 15,
        semester: 2,
        year: 3,
      },
      {
        code: "BPM3217",
        name: "Public Sector Entrepreneurship",
        credits: 15,
        semester: 2,
        year: 3,
      },
      {
        code: "BPM3218",
        name: "Research Project",
        credits: 15,
        semester: 2,
        year: 3,
      },
    ],
  },
  {
    code: "DBA",
    name: "Diploma in Business Administration",
    faculty: "Faculty of Business & Management Sciences",
    duration: "3 Years",
    fee: 38000,
    modules: [
      {
        code: "DBA1101",
        name: "Business Communication",
        credits: 15,
        semester: 1,
        year: 1,
      },
      {
        code: "DBA1102",
        name: "Principles of Management",
        credits: 15,
        semester: 1,
        year: 1,
      },
      {
        code: "DBA1103",
        name: "Business Mathematics",
        credits: 15,
        semester: 1,
        year: 1,
      },
      {
        code: "DBA1204",
        name: "Introduction to Accounting",
        credits: 15,
        semester: 2,
        year: 1,
      },
      {
        code: "DBA1205",
        name: "Marketing Basics",
        credits: 15,
        semester: 2,
        year: 1,
      },
      {
        code: "DBA1206",
        name: "Business Computing",
        credits: 15,
        semester: 2,
        year: 1,
      },
      {
        code: "DBA2107",
        name: "Financial Management",
        credits: 15,
        semester: 1,
        year: 2,
      },
      {
        code: "DBA2108",
        name: "Human Resources Fundamentals",
        credits: 15,
        semester: 1,
        year: 2,
      },
      {
        code: "DBA2109",
        name: "Business Law",
        credits: 15,
        semester: 1,
        year: 2,
      },
      {
        code: "DBA2210",
        name: "Supply Chain & Procurement",
        credits: 15,
        semester: 2,
        year: 2,
      },
      {
        code: "DBA2211",
        name: "Entrepreneurship",
        credits: 15,
        semester: 2,
        year: 2,
      },
      {
        code: "DBA2212",
        name: "Operations Management",
        credits: 15,
        semester: 2,
        year: 2,
      },
      {
        code: "DBA3113",
        name: "Strategic Business Management",
        credits: 15,
        semester: 1,
        year: 3,
      },
      {
        code: "DBA3114",
        name: "Leadership & Organisational Development",
        credits: 15,
        semester: 1,
        year: 3,
      },
      {
        code: "DBA3115",
        name: "Business Research Methods",
        credits: 15,
        semester: 1,
        year: 3,
      },
      {
        code: "DBA3216",
        name: "Work Integrated Learning",
        credits: 15,
        semester: 2,
        year: 3,
      },
      {
        code: "DBA3217",
        name: "Digital Business Transformation",
        credits: 15,
        semester: 2,
        year: 3,
      },
      {
        code: "DBA3218",
        name: "Business Research Project",
        credits: 15,
        semester: 2,
        year: 3,
      },
    ],
  },
  {
    code: "DLGM",
    name: "Diploma in Local Government Management",
    faculty: "Faculty of Business & Management Sciences",
    duration: "3 Years",
    fee: 36000,
    modules: [
      {
        code: "DLGM1101",
        name: "Introduction to Local Government",
        credits: 15,
        semester: 1,
        year: 1,
      },
      {
        code: "DLGM1102",
        name: "Public Administration Foundations",
        credits: 15,
        semester: 1,
        year: 1,
      },
      {
        code: "DLGM1103",
        name: "Municipal Finance Basics",
        credits: 15,
        semester: 1,
        year: 1,
      },
      {
        code: "DLGM1204",
        name: "Local Government Legislation",
        credits: 15,
        semester: 2,
        year: 1,
      },
      {
        code: "DLGM1205",
        name: "Integrated Development Planning",
        credits: 15,
        semester: 2,
        year: 1,
      },
      {
        code: "DLGM1206",
        name: "Community Development",
        credits: 15,
        semester: 2,
        year: 1,
      },
      {
        code: "DLGM2107",
        name: "Municipal HR Management",
        credits: 15,
        semester: 1,
        year: 2,
      },
      {
        code: "DLGM2108",
        name: "Service Delivery & Performance",
        credits: 15,
        semester: 1,
        year: 2,
      },
      {
        code: "DLGM2109",
        name: "Local Government Finance",
        credits: 15,
        semester: 1,
        year: 2,
      },
      {
        code: "DLGM2210",
        name: "Policy Process & Implementation",
        credits: 15,
        semester: 2,
        year: 2,
      },
      {
        code: "DLGM2211",
        name: "Ward Committee Systems",
        credits: 15,
        semester: 2,
        year: 2,
      },
      {
        code: "DLGM2212",
        name: "Municipal Governance",
        credits: 15,
        semester: 2,
        year: 2,
      },
      {
        code: "DLGM3113",
        name: "Advanced Municipal Management",
        credits: 15,
        semester: 1,
        year: 3,
      },
      {
        code: "DLGM3114",
        name: "Local Economic Development",
        credits: 15,
        semester: 1,
        year: 3,
      },
      {
        code: "DLGM3115",
        name: "Environmental Management in LGM",
        credits: 15,
        semester: 1,
        year: 3,
      },
      {
        code: "DLGM3216",
        name: "Work Integrated Learning",
        credits: 15,
        semester: 2,
        year: 3,
      },
      {
        code: "DLGM3217",
        name: "Research Methods in Public Management",
        credits: 15,
        semester: 2,
        year: 3,
      },
      {
        code: "DLGM3218",
        name: "Applied Research Project",
        credits: 15,
        semester: 2,
        year: 3,
      },
    ],
  },
  {
    code: "HCBA",
    name: "Higher Certificate in Business Administration",
    faculty: "Faculty of Business & Management Sciences",
    duration: "1 Year",
    fee: 26000,
    modules: [
      {
        code: "HCBA1101",
        name: "Business Communication",
        credits: 15,
        semester: 1,
        year: 1,
      },
      {
        code: "HCBA1102",
        name: "Introduction to Management",
        credits: 15,
        semester: 1,
        year: 1,
      },
      {
        code: "HCBA1103",
        name: "Basic Financial Literacy",
        credits: 15,
        semester: 1,
        year: 1,
      },
      {
        code: "HCBA1204",
        name: "Customer Service & Relations",
        credits: 15,
        semester: 2,
        year: 1,
      },
      {
        code: "HCBA1205",
        name: "Office Technology & Computing",
        credits: 15,
        semester: 2,
        year: 1,
      },
      {
        code: "HCBA1206",
        name: "Work Integrated Learning",
        credits: 15,
        semester: 2,
        year: 1,
      },
    ],
  },
  {
    code: "HCOA",
    name: "Higher Certificate in Office Administration",
    faculty: "Faculty of Business & Management Sciences",
    duration: "1 Year",
    fee: 26000,
    modules: [
      {
        code: "HCOA1101",
        name: "Office Administration Principles",
        credits: 15,
        semester: 1,
        year: 1,
      },
      {
        code: "HCOA1102",
        name: "Business English & Communication",
        credits: 15,
        semester: 1,
        year: 1,
      },
      {
        code: "HCOA1103",
        name: "Computer Applications & Office Software",
        credits: 15,
        semester: 1,
        year: 1,
      },
      {
        code: "HCOA1204",
        name: "Records & Information Management",
        credits: 15,
        semester: 2,
        year: 1,
      },
      {
        code: "HCOA1205",
        name: "Administrative Support Services",
        credits: 15,
        semester: 2,
        year: 1,
      },
      {
        code: "HCOA1206",
        name: "Work Integrated Learning",
        credits: 15,
        semester: 2,
        year: 1,
      },
    ],
  },
  {
    code: "HCLGM",
    name: "Higher Certificate in Local Government Management",
    faculty: "Faculty of Business & Management Sciences",
    duration: "1 Year",
    fee: 26000,
    modules: [
      {
        code: "HCLGM1101",
        name: "Introduction to Local Government",
        credits: 15,
        semester: 1,
        year: 1,
      },
      {
        code: "HCLGM1102",
        name: "Public Sector Administration",
        credits: 15,
        semester: 1,
        year: 1,
      },
      {
        code: "HCLGM1103",
        name: "Municipal Finance Fundamentals",
        credits: 15,
        semester: 1,
        year: 1,
      },
      {
        code: "HCLGM1204",
        name: "Community Engagement & Development",
        credits: 15,
        semester: 2,
        year: 1,
      },
      {
        code: "HCLGM1205",
        name: "Service Delivery Basics",
        credits: 15,
        semester: 2,
        year: 1,
      },
      {
        code: "HCLGM1206",
        name: "Work Integrated Learning",
        credits: 15,
        semester: 2,
        year: 1,
      },
    ],
  },
  {
    code: "HC RPLA",
    name: "Higher Certificate in Recognition of Prior Learning Activities",
    faculty: "Faculty of Business & Management Sciences",
    duration: "1 Year",
    fee: 24000,
    modules: [
      {
        code: "HCRPLA1101",
        name: "Principles of RPL in Higher Education",
        credits: 15,
        semester: 1,
        year: 1,
      },
      {
        code: "HCRPLA1102",
        name: "Portfolio Preparation & Assessment",
        credits: 15,
        semester: 1,
        year: 1,
      },
      {
        code: "HCRPLA1203",
        name: "RPL Facilitation Practice",
        credits: 15,
        semester: 2,
        year: 1,
      },
      {
        code: "HCRPLA1204",
        name: "Work Integrated Learning in RPL",
        credits: 15,
        semester: 2,
        year: 1,
      },
    ],
  },
  {
    code: "MBA",
    name: "Master of Business Administration",
    faculty: "Faculty of Business & Management Sciences",
    duration: "2 Years",
    fee: 68000,
    modules: [
      {
        code: "MBA1101",
        name: "Advanced Business Strategy",
        credits: 15,
        semester: 1,
        year: 1,
      },
      {
        code: "MBA1102",
        name: "Leadership in the 4th Industrial Revolution",
        credits: 15,
        semester: 1,
        year: 1,
      },
      {
        code: "MBA1103",
        name: "Advanced Financial Management",
        credits: 15,
        semester: 1,
        year: 1,
      },
      {
        code: "MBA1204",
        name: "Digital Transformation & Innovation",
        credits: 15,
        semester: 2,
        year: 1,
      },
      {
        code: "MBA1205",
        name: "Research Methodology",
        credits: 15,
        semester: 2,
        year: 1,
      },
      {
        code: "MBA1206",
        name: "Advanced Marketing Strategy",
        credits: 15,
        semester: 2,
        year: 1,
      },
      {
        code: "MBA2107",
        name: "Big Data & Analytics for Managers",
        credits: 15,
        semester: 1,
        year: 2,
      },
      {
        code: "MBA2108",
        name: "Entrepreneurship & Venture Capital",
        credits: 15,
        semester: 1,
        year: 2,
      },
      {
        code: "MBA2109",
        name: "Corporate Governance & Business Ethics",
        credits: 15,
        semester: 1,
        year: 2,
      },
      {
        code: "MBA2210",
        name: "MBA Research Project / Dissertation",
        credits: 15,
        semester: 2,
        year: 2,
      },
    ],
  },
  {
    code: "PGDip Mgt",
    name: "Postgraduate Diploma in Management",
    faculty: "Faculty of Business & Management Sciences",
    duration: "1 Year",
    fee: 48000,
    modules: [
      {
        code: "PGDM1101",
        name: "Management Principles & Practices",
        credits: 15,
        semester: 1,
        year: 1,
      },
      {
        code: "PGDM1102",
        name: "Organisational Leadership",
        credits: 15,
        semester: 1,
        year: 1,
      },
      {
        code: "PGDM1203",
        name: "Strategic Human Resource Management",
        credits: 15,
        semester: 2,
        year: 1,
      },
      {
        code: "PGDM1204",
        name: "Applied Management Research Project",
        credits: 15,
        semester: 2,
        year: 1,
      },
    ],
  },
];

const NATIONALITIES = [
  "South African",
  "Zimbabwean",
  "Mozambican",
  "Zambian",
  "Malawian",
  "Botswanan",
  "Namibian",
  "Swazi",
  "Lesothan",
  "Congolese (DRC)",
  "Nigerian",
  "Ghanaian",
  "Kenyan",
  "Tanzanian",
  "British",
  "American",
  "Canadian",
  "Australian",
  "Indian",
  "Pakistani",
  "Other",
];

/* ═══════════════════════════════════════════════════
   API CORE
   ═══════════════════════════════════════════════════ */
function getToken() {
  return localStorage.getItem("authToken") || "";
}
function setToken(t) {
  t
    ? localStorage.setItem("authToken", t)
    : localStorage.removeItem("authToken");
}
function getCachedUser() {
  try {
    return JSON.parse(localStorage.getItem("currentUser") || "null");
  } catch {
    return null;
  }
}
function setCachedUser(u) {
  u
    ? localStorage.setItem("currentUser", JSON.stringify(u))
    : localStorage.removeItem("currentUser");
}
function getCurrentUser() {
  return getCachedUser();
}

async function api(method, path, body) {
  const opts = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
  };
  if (body !== undefined) opts.body = JSON.stringify(body);
  try {
    const res = await fetch(`/api${path}`, opts);
    if (res.status === 401) {
      setToken(null);
      setCachedUser(null);
      window.location.href = "/login";
      return { ok: false, message: "Session expired." };
    }
    const data = await res.json();
    return { ok: res.ok, status: res.status, ...data };
  } catch (err) {
    return { ok: false, message: `Network error: ${err.message}` };
  }
}

/* ═══════════════════════════════════════════════════
   AUTH  →  /api/auth/*
   ═══════════════════════════════════════════════════ */
async function login(email, password) {
  const res = await api("POST", "/auth/login", { email, password });
  if (!res.ok)
    return { success: false, message: res.message || "Login failed." };
  setToken(res.data.accessToken);
  setCachedUser(res.data.user);
  return { success: true, user: res.data.user };
}

async function logout() {
  await api("POST", "/auth/logout");
  setToken(null);
  setCachedUser(null);
  localStorage.removeItem("_unreadCount");
}

async function registerAccount(data) {
  return api("POST", "/auth/register", data);
}
async function forgotPassword(email) {
  return api("POST", "/auth/forgot-password", { email });
}
async function resetPassword(token, password) {
  return api("POST", "/auth/reset-password", { token, password });
}

function requireAuth(role) {
  const user = getCachedUser();
  if (!user || !getToken()) {
    window.location.href = "/login";
    return null;
  }
  if (role && user.role !== role) {
    window.location.href = `/${user.role}`;
    return null;
  }
  return user;
}

/* ═══════════════════════════════════════════════════
   USERS  →  /api/users/*
   ═══════════════════════════════════════════════════ */
async function getProfile() {
  return api("GET", "/users/profile");
}
async function updateProfile(data) {
  const res = await api("PUT", "/users/profile", data);
  if (res.ok && res.user) setCachedUser(res.user);
  return res;
}
async function changePassword(currentPassword, newPassword) {
  const res = await api("PUT", "/users/password", {
    currentPassword,
    newPassword,
  });
  if (res.ok) {
    const u = getCachedUser();
    if (u) {
      u.tempPassword = false;
      setCachedUser(u);
    }
  }
  return res;
}

/* ═══════════════════════════════════════════════════
   APPLICATIONS  →  /api/applications/*
   ═══════════════════════════════════════════════════ */
async function getApplications() {
  const res = await api("GET", "/applications");
  return res.ok ? res.applications : [];
}
async function submitApplication(appData) {
  return api("POST", "/applications", appData);
}
async function getApplication(id) {
  return api("GET", `/applications/${id}`);
}
async function approveApplication(id) {
  return api("PUT", `/applications/${id}/approve`);
}
async function rejectApplication(id, reason) {
  return api("PUT", `/applications/${id}/reject`, { reason });
}
async function uploadDocument(appId, documentName) {
  return api("POST", `/applications/${appId}/documents`, { documentName });
}

/* ═══════════════════════════════════════════════════
   REGISTRATIONS  →  /api/registrations/*
   ═══════════════════════════════════════════════════ */
async function getRegistrations() {
  const res = await api("GET", "/registrations");
  return res.ok ? res.registrations : [];
}
async function allocateModules(applicationId, modules, semester, studyYear) {
  return api("POST", "/registrations", {
    applicationId,
    modules,
    semester,
    studyYear,
  });
}
async function dropRegistration(id) {
  return api("DELETE", `/registrations/${id}`);
}
async function getEligibleModules() {
  const res = await api("GET", "/registrations/eligible");
  return res.ok ? res : { eligible: [] };
}

/* ═══════════════════════════════════════════════════
   COURSES  →  /api/courses/*
   ═══════════════════════════════════════════════════ */
async function getCourses() {
  return api("GET", "/courses");
}
async function getCourseRoster(moduleCode) {
  return api("GET", `/courses/${moduleCode}/roster`);
}

/* ═══════════════════════════════════════════════════
   ADMIN  →  /api/admin/*
   ═══════════════════════════════════════════════════ */
async function getUsers() {
  const res = await api("GET", "/admin/users");
  return res.ok ? res.users : [];
}
async function getAdminUsers() {
  return getUsers();
}
async function getStatistics() {
  return api("GET", "/admin/statistics");
}
async function getAuditLogs(limit) {
  return api("GET", `/admin/audit-logs?limit=${limit || 50}`);
}
async function changeUserRole(userId, role) {
  return api("PUT", `/admin/users/${userId}/role`, { role });
}
async function changeUserStatus(userId, status) {
  return api("PUT", `/admin/users/${userId}/status`, { status });
}

/* ═══════════════════════════════════════════════════
   NOTIFICATIONS & INBOX (Stubs for old dashboard code)
   ═══════════════════════════════════════════════════ */
function getInboxFor(userId) {
  // Stub function - returns empty array until inbox API is implemented
  return [];
}
function getSentBy(userId) {
  // Stub function - returns empty array until messaging API is implemented
  return [];
}

/* ═══════════════════════════════════════════════════
   ASSIGNMENTS (Stubs for old dashboard code)
   ═══════════════════════════════════════════════════ */
function getAssignments() {
  // Stub function - returns empty array until assignments API is implemented
  return [];
}
function getStudentAssignments(studentId) {
  // Stub function - returns empty array until assignments API is implemented
  return [];
}

/* ═══════════════════════════════════════════════════
   EVENTS (Stubs for old dashboard code)
   ═══════════════════════════════════════════════════ */
function getUpcomingEvents(role) {
  // Stub function - returns empty array until events API is implemented
  return [];
}

/* ═══════════════════════════════════════════════════
   EMAIL (Stubs for old dashboard code)
   ═══════════════════════════════════════════════════ */
function getSchoolEmails(studentId) {
  // Stub function - returns empty array until email API is implemented
  return [];
}

/* ═══════════════════════════════════════════════════
   NOTIFICATIONS  →  /api/notifications/*
   ═══════════════════════════════════════════════════ */
async function getNotifications() {
  const res = await api("GET", "/notifications");
  return res.ok ? res.notifications : [];
}
async function markNotifRead(id) {
  return api("PUT", `/notifications/${id}/read`);
}
async function deleteNotif(id) {
  return api("DELETE", `/notifications/${id}`);
}

/* ═══════════════════════════════════════════════════
   UI HELPERS
   ═══════════════════════════════════════════════════ */
function showAlert(containerId, msg, type) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const icons = { success: "✅", error: "❌", warning: "⚠️", info: "ℹ️" };
  el.innerHTML = `<div class="alert alert-${type || "error"}" style="margin-bottom:16px"><span>${icons[type] || "ℹ️"}</span><span>${msg}</span></div>`;
  el.scrollIntoView({ behavior: "smooth", block: "nearest" });
}
function clearAlert(id) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = "";
}

function setLoading(btnId, loading, text) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = loading;
  if (loading) {
    btn._orig = btn.innerHTML;
    btn.innerHTML = text || "Loading...";
  } else {
    btn.innerHTML = btn._orig || text || btn.innerHTML;
  }
}

function badge(status) {
  const map = {
    pending: "badge-pending",
    approved: "badge-approved",
    declined: "badge-declined",
    allocated: "badge-allocated",
  };
  return `<span class="badge ${map[status] || "badge-info"}">${status}</span>`;
}

function fmtDate(d) {
  return d
    ? new Date(d).toLocaleDateString("en-ZA", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";
}
function timeAgo(d) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return m + "m ago";
  const h = Math.floor(m / 60);
  if (h < 24) return h + "h ago";
  return fmtDate(d);
}

function openModal(id) {
  document.getElementById(id)?.classList.remove("hidden");
}
function closeModal(id) {
  document.getElementById(id)?.classList.add("hidden");
}

function showToast(msg, type, ms) {
  let t = document.getElementById("_toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "_toast";
    t.className = "toast hidden";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.className = `toast toast-${type || "success"}`;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.add("hidden"), ms || 4000);
}

/* ═══════════════════════════════════════════════════
   NAVBAR
   ═══════════════════════════════════════════════════ */
function renderNavbar(activePage) {
  const user = getCachedUser();
  const links = {
    public: [
      { href: "/", label: "Home", key: "home" },
      { href: "/programmes", label: "Programmes", key: "programmes" },
      {
        href: "/apply",
        label: "New Application",
        key: "apply",
        highlight: true,
      },
      { href: "/login", label: "Login", key: "login" },
    ],
    admin: [
      { href: "/admin", label: "Dashboard", key: "dashboard" },
      {
        href: "/admin/applications",
        label: "Applications",
        key: "applications",
      },
      {
        href: "/admin/registrations",
        label: "Registrations",
        key: "registrations",
      },
      {
        href: "/admin/allocations",
        label: "Allocate Modules",
        key: "allocations",
        highlight: true,
      },
      { href: "/admin/students", label: "Students", key: "students" },
    ],
    student: [
      { href: "/student", label: "Dashboard", key: "dashboard" },
      { href: "/student/register", label: "Register Modules", key: "register" },
      { href: "/student/modules", label: "My Modules", key: "modules" },
    ],
    lecturer: [{ href: "/lecturer", label: "Dashboard", key: "dashboard" }],
  };
  const role = user ? user.role : "public";
  const navLinks = links[role] || links.public;
  const linksHtml = navLinks
    .map(
      (l) =>
        `<a href="${l.href}" class="nav-link${activePage === l.key ? " active" : ""}${l.highlight ? " highlight" : ""}">${l.label}</a>`,
    )
    .join("");
  const cachedCount = parseInt(localStorage.getItem("_unreadCount") || "0");
  const userHtml = user
    ? `
    <div style="position:relative;margin-left:8px">
      <button class="notif-btn" id="notif-btn" onclick="toggleNotifs(event)">🔔
        <span id="notif-badge" style="position:absolute;top:4px;right:4px;width:16px;height:16px;background:#e8192c;border-radius:50%;font-size:10px;font-weight:700;display:${cachedCount > 0 ? "flex" : "none"};align-items:center;justify-content:center">${cachedCount}</span>
      </button>
    </div>
    <div style="display:flex;align-items:center;gap:10px;margin-left:12px">
      <div style="text-align:right"><div style="font-size:13px;font-weight:600">${user.first_name || user.email.split('@')[0]}</div><div style="font-size:11px;opacity:.7;text-transform:capitalize">${user.role}</div></div>
      <button onclick="doLogout()" style="background:rgba(255,255,255,.15);color:white;border:1px solid rgba(255,255,255,.3);padding:6px 14px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s" onmouseover="this.style.background='rgba(255,255,255,.25)'" onmouseout="this.style.background='rgba(255,255,255,.15)'">Logout</button>
    </div>`
    : "";
  const notifHtml = user
    ? `
    <div id="notif-dropdown" class="hidden" style="position:fixed;top:64px;right:20px;width:360px;background:white;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.2);z-index:200;overflow:hidden;border:1px solid #e5e7eb">
      <div style="padding:14px 16px;border-bottom:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center">
        <span style="font-weight:700;color:var(--rf-navy);font-size:15px">Notifications</span>
        <span id="notif-unread-label" style="font-size:12px;color:#123f7a"></span>
      </div>
      <div id="notif-list" style="max-height:340px;overflow-y:auto">
        <div style="padding:20px;text-align:center;color:var(--rf-gray);font-size:13px">Loading...</div>
      </div>
    </div>`
    : "";
  const ph = document.getElementById("navbar-placeholder");
  if (ph) {
    ph.innerHTML = `
      <nav class="navbar">
        <a href="${user ? "/" + user.role : "/"}" style="display:flex;align-items:center;gap:8px">
          <img src="${EDUHUB_LOGO}" alt="EduHub" style="height:36px" onerror="this.style.display='none'">
          <span class="navbar-logo-text" style="color:white">EDUHUB</span>
        </a>
        <div class="navbar-links">${linksHtml}${userHtml}</div>
      </nav>${notifHtml}`;
  }
  document.addEventListener("click", (e) => {
    const d = document.getElementById("notif-dropdown"),
      b = document.getElementById("notif-btn");
    if (d && b && !d.contains(e.target) && !b.contains(e.target))
      d.classList.add("hidden");
  });
  if (user)
    getNotifications().then((notifs) => {
      const unread = notifs.filter((n) => !n.read).length;
      localStorage.setItem("_unreadCount", String(unread));
      const b = document.getElementById("notif-badge");
      if (b) {
        b.textContent = unread;
        b.style.display = unread > 0 ? "flex" : "none";
      }
    });
}

function toggleNotifs(event) {
  if (event) event.stopPropagation();
  const d = document.getElementById("notif-dropdown");
  if (!d) return;
  const wasHidden = d.classList.contains("hidden");
  d.classList.toggle("hidden");
  if (wasHidden) loadNotifDropdown();
}

async function loadNotifDropdown() {
  const list = document.getElementById("notif-list"),
    label = document.getElementById("notif-unread-label");
  if (!list) return;
  const notifs = await getNotifications();
  const unread = notifs.filter((n) => !n.read).length;
  if (label) label.textContent = unread > 0 ? `${unread} unread` : "";
  const b = document.getElementById("notif-badge");
  if (b) {
    b.textContent = unread;
    b.style.display = unread > 0 ? "flex" : "none";
  }
  if (notifs.length === 0) {
    list.innerHTML =
      '<div style="padding:24px;text-align:center;color:var(--rf-gray);font-size:14px">No notifications yet</div>';
    return;
  }
  list.innerHTML = notifs
    .map(
      (n) => `
    <div onclick="doMarkRead('${n.id}')" style="padding:12px 16px;border-bottom:1px solid #e5e7eb;cursor:pointer;background:${n.read ? "white" : "#EEF2FF"}">
      <div style="font-weight:600;font-size:13px;color:var(--rf-navy);margin-bottom:3px">${n.title}</div>
      <div style="font-size:12px;color:var(--rf-gray);line-height:1.5">${n.message}</div>
      <div style="font-size:11px;color:#9CA3AF;margin-top:4px">${timeAgo(n.createdAt)}</div>
    </div>`,
    )
    .join("");
}

async function doMarkRead(id) {
  await markNotifRead(id);
  loadNotifDropdown();
}
async function doLogout() {
  await logout();
  window.location.href = "/";
}

/* ═══════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════ */
function renderFooter() {
  const ph = document.getElementById("footer-placeholder");
  if (!ph) return;
  ph.innerHTML = `<footer class="footer"><div class="footer-inner">
    <div style="width:260px">
      <div style="width:180px;height:100px;border:1px solid white;display:flex;align-items:center;justify-content:center;margin-bottom:20px"><img src="${EDUHUB_LOGO}" style="width:140px" alt="EduHub"></div>
      <p style="font-size:14px;margin-bottom:20px;line-height:1.7;opacity:.9">Your path to a brighter future, offering quality education that's accessible to all.</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-sm" style="border:1px solid white;background:transparent;color:white;border-radius:20px">Enquire Now</button>
        <a href="/apply" class="btn btn-sm" style="border:1px solid white;background:transparent;color:white;border-radius:20px">Apply</a>
      </div>
    </div>
    <div class="footer-col"><h3>STUDY WITH US</h3><a href="#">Postgraduate</a><a href="#">Faculty of IT</a><a href="#">Faculty of Business</a><a href="#">Online Learning</a></div>
    <div class="footer-col"><h3>WHY EDUHUB?</h3><a href="#">Graduate Success</a><a href="#">Accreditation</a><a href="#">Prospectus</a></div>
    <div class="footer-col"><h3>ADMISSIONS</h3><a href="/apply">Apply</a><a href="#">Financial Info</a><a href="#">FAQ & Help</a></div>
  </div>
  <div class="footer-bottom">© ${new Date().getFullYear()} EduHub — A Learning Experience of a Lifetime · All rights reserved</div>
  </footer>`;
}
