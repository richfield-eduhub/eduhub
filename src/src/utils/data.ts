import type { Qualification, User } from '../types';

export const QUALIFICATIONS: Qualification[] = [

  // ─── FACULTY OF INFORMATION TECHNOLOGY ──────────────────────────────────────

  {
    code: 'BSCIT',
    name: 'Bachelor of Science in Information Technology',
    faculty: 'Faculty of Information Technology',
    duration: '3 Years',
    fee: 45000,
    modules: [
      { code: 'BSCIT101', name: 'Introduction to Programming', credits: 15, semester: 1, year: 1 },
      { code: 'BSCIT102', name: 'Computer Architecture & Organisation', credits: 15, semester: 1, year: 1 },
      { code: 'BSCIT103', name: 'Mathematics for Computing', credits: 15, semester: 1, year: 1 },
      { code: 'BSCIT104', name: 'Web Development Fundamentals', credits: 15, semester: 2, year: 1 },
      { code: 'BSCIT105', name: 'Database Design & Management', credits: 15, semester: 2, year: 1 },
      { code: 'BSCIT106', name: 'Networking Fundamentals', credits: 15, semester: 2, year: 1 },
      { code: 'BSCIT201', name: 'Object-Oriented Programming', credits: 15, semester: 1, year: 2 },
      { code: 'BSCIT202', name: 'Systems Analysis & Design', credits: 15, semester: 1, year: 2 },
      { code: 'BSCIT203', name: 'Data Structures & Algorithms', credits: 15, semester: 1, year: 2 },
      { code: 'BSCIT204', name: 'Cyber Security Fundamentals', credits: 15, semester: 2, year: 2 },
      { code: 'BSCIT205', name: 'Cloud Computing', credits: 15, semester: 2, year: 2 },
      { code: 'BSCIT206', name: 'Internet of Things', credits: 15, semester: 2, year: 2 },
      { code: 'BSCIT301', name: 'Business Intelligence & Data Analytics', credits: 15, semester: 1, year: 3 },
      { code: 'BSCIT302', name: 'Mobile Computing & Applications', credits: 15, semester: 1, year: 3 },
      { code: 'BSCIT303', name: 'IT Project Management', credits: 15, semester: 1, year: 3 },
      { code: 'BSCIT304', name: 'Digital Applications Development', credits: 15, semester: 2, year: 3 },
      { code: 'BSCIT305', name: 'Work Integrated Learning', credits: 15, semester: 2, year: 3 },
      { code: 'BSCIT306', name: 'IT Research Project', credits: 15, semester: 2, year: 3 },
    ],
  },

  {
    code: 'DIT',
    name: 'Diploma in Information Technology',
    faculty: 'Faculty of Information Technology',
    duration: '3 Years',
    fee: 38000,
    modules: [
      { code: 'DIT101', name: 'Introduction to Information Technology', credits: 15, semester: 1, year: 1 },
      { code: 'DIT102', name: 'Programming Logic & Design', credits: 15, semester: 1, year: 1 },
      { code: 'DIT103', name: 'Computer Hardware & Software', credits: 15, semester: 1, year: 1 },
      { code: 'DIT104', name: 'Database Fundamentals', credits: 15, semester: 2, year: 1 },
      { code: 'DIT105', name: 'Web Design & Development', credits: 15, semester: 2, year: 1 },
      { code: 'DIT106', name: 'Business Communication', credits: 15, semester: 2, year: 1 },
      { code: 'DIT201', name: 'Network Administration', credits: 15, semester: 1, year: 2 },
      { code: 'DIT202', name: 'Application Programming', credits: 15, semester: 1, year: 2 },
      { code: 'DIT203', name: 'Operating Systems Administration', credits: 15, semester: 1, year: 2 },
      { code: 'DIT204', name: 'IT Service Management', credits: 15, semester: 2, year: 2 },
      { code: 'DIT205', name: 'Python Development', credits: 15, semester: 2, year: 2 },
      { code: 'DIT206', name: 'Systems Security', credits: 15, semester: 2, year: 2 },
      { code: 'DIT301', name: 'Advanced Networking & Infrastructure', credits: 15, semester: 1, year: 3 },
      { code: 'DIT302', name: 'Database Administration', credits: 15, semester: 1, year: 3 },
      { code: 'DIT303', name: 'Software Engineering', credits: 15, semester: 1, year: 3 },
      { code: 'DIT304', name: 'Work Integrated Learning', credits: 15, semester: 2, year: 3 },
      { code: 'DIT305', name: 'IT Governance & Compliance', credits: 15, semester: 2, year: 3 },
      { code: 'DIT306', name: 'Emerging Technologies', credits: 15, semester: 2, year: 3 },
    ],
  },

  {
    code: 'HCIT',
    name: 'Higher Certificate in Information Technology',
    faculty: 'Faculty of Information Technology',
    duration: '1 Year',
    fee: 22000,
    modules: [
      { code: 'HCIT101', name: 'IT Fundamentals', credits: 20, semester: 1, year: 1 },
      { code: 'HCIT102', name: 'Introduction to Programming', credits: 20, semester: 1, year: 1 },
      { code: 'HCIT103', name: 'Computer Networks Basics', credits: 20, semester: 1, year: 1 },
      { code: 'HCIT104', name: 'Systems Development', credits: 20, semester: 2, year: 1 },
      { code: 'HCIT105', name: 'Technical Support Fundamentals', credits: 20, semester: 2, year: 1 },
      { code: 'HCIT106', name: 'Web Development Basics', credits: 20, semester: 2, year: 1 },
    ],
  },

  {
    code: 'HCCF',
    name: 'Higher Certificate in Computer Forensics',
    faculty: 'Faculty of Information Technology',
    duration: '1 Year',
    fee: 24000,
    modules: [
      { code: 'HCCF101', name: 'Introduction to Cybercrime & Law', credits: 20, semester: 1, year: 1 },
      { code: 'HCCF102', name: 'Digital Evidence & Acquisition', credits: 20, semester: 1, year: 1 },
      { code: 'HCCF103', name: 'Computer Forensics Fundamentals', credits: 20, semester: 1, year: 1 },
      { code: 'HCCF104', name: 'Information Security Management', credits: 20, semester: 2, year: 1 },
      { code: 'HCCF105', name: 'Cybercrime Investigation Techniques', credits: 20, semester: 2, year: 1 },
      { code: 'HCCF106', name: 'Forensic Reporting & Documentation', credits: 20, semester: 2, year: 1 },
    ],
  },

  {
    code: 'BSCHIT',
    name: 'Bachelor of Science Honours in Information Technology',
    faculty: 'Faculty of Information Technology',
    duration: '1 Year',
    fee: 48000,
    modules: [
      { code: 'BSCHIT101', name: 'Advanced Research Methodology', credits: 30, semester: 1, year: 1 },
      { code: 'BSCHIT102', name: 'IT Leadership & Governance', credits: 30, semester: 1, year: 1 },
      { code: 'BSCHIT103', name: 'Advanced Software Engineering', credits: 30, semester: 2, year: 1 },
      { code: 'BSCHIT104', name: 'Research Project & Dissertation', credits: 30, semester: 2, year: 1 },
    ],
  },

  // ─── FACULTY OF BUSINESS AND MANAGEMENT SCIENCES ────────────────────────────

  {
    code: 'BCOM',
    name: 'Bachelor of Commerce',
    faculty: 'Faculty of Business & Management Sciences',
    duration: '3 Years',
    fee: 42000,
    modules: [
      { code: 'BCOM101', name: 'Business Communication', credits: 15, semester: 1, year: 1 },
      { code: 'BCOM102', name: 'Principles of Management', credits: 15, semester: 1, year: 1 },
      { code: 'BCOM103', name: 'Financial Accounting', credits: 15, semester: 1, year: 1 },
      { code: 'BCOM104', name: 'Economics I', credits: 15, semester: 2, year: 1 },
      { code: 'BCOM105', name: 'Business Mathematics & Statistics', credits: 15, semester: 2, year: 1 },
      { code: 'BCOM106', name: 'Marketing Fundamentals', credits: 15, semester: 2, year: 1 },
      { code: 'BCOM201', name: 'Cost & Management Accounting', credits: 15, semester: 1, year: 2 },
      { code: 'BCOM202', name: 'Human Resource Management', credits: 15, semester: 1, year: 2 },
      { code: 'BCOM203', name: 'Business Law', credits: 15, semester: 1, year: 2 },
      { code: 'BCOM204', name: 'Financial Management', credits: 15, semester: 2, year: 2 },
      { code: 'BCOM205', name: 'Marketing Management', credits: 15, semester: 2, year: 2 },
      { code: 'BCOM206', name: 'Operations Management', credits: 15, semester: 2, year: 2 },
      { code: 'BCOM301', name: 'Strategic Management', credits: 15, semester: 1, year: 3 },
      { code: 'BCOM302', name: 'Entrepreneurship & Innovation', credits: 15, semester: 1, year: 3 },
      { code: 'BCOM303', name: 'Supply Chain Management', credits: 15, semester: 1, year: 3 },
      { code: 'BCOM304', name: 'Corporate Governance & Ethics', credits: 15, semester: 2, year: 3 },
      { code: 'BCOM305', name: 'International Business', credits: 15, semester: 2, year: 3 },
      { code: 'BCOM306', name: 'Business Research Project', credits: 15, semester: 2, year: 3 },
    ],
  },

  {
    code: 'BBA',
    name: 'Bachelor of Business Administration',
    faculty: 'Faculty of Business & Management Sciences',
    duration: '3 Years',
    fee: 40000,
    modules: [
      { code: 'BBA101', name: 'Business Communication', credits: 15, semester: 1, year: 1 },
      { code: 'BBA102', name: 'Organisational Behaviour', credits: 15, semester: 1, year: 1 },
      { code: 'BBA103', name: 'Business Mathematics', credits: 15, semester: 1, year: 1 },
      { code: 'BBA104', name: 'Introduction to Economics', credits: 15, semester: 2, year: 1 },
      { code: 'BBA105', name: 'Business Computing', credits: 15, semester: 2, year: 1 },
      { code: 'BBA106', name: 'Marketing Principles', credits: 15, semester: 2, year: 1 },
      { code: 'BBA201', name: 'Financial Accounting', credits: 15, semester: 1, year: 2 },
      { code: 'BBA202', name: 'Human Resource Management', credits: 15, semester: 1, year: 2 },
      { code: 'BBA203', name: 'Business Law & Ethics', credits: 15, semester: 1, year: 2 },
      { code: 'BBA204', name: 'Project Management', credits: 15, semester: 2, year: 2 },
      { code: 'BBA205', name: 'Operations & Supply Chain', credits: 15, semester: 2, year: 2 },
      { code: 'BBA206', name: 'Entrepreneurship', credits: 15, semester: 2, year: 2 },
      { code: 'BBA301', name: 'Strategic Management', credits: 15, semester: 1, year: 3 },
      { code: 'BBA302', name: 'Leadership & Change Management', credits: 15, semester: 1, year: 3 },
      { code: 'BBA303', name: 'Digital Business & Innovation', credits: 15, semester: 1, year: 3 },
      { code: 'BBA304', name: 'International Business Management', credits: 15, semester: 2, year: 3 },
      { code: 'BBA305', name: 'Corporate Governance', credits: 15, semester: 2, year: 3 },
      { code: 'BBA306', name: 'Business Research Project', credits: 15, semester: 2, year: 3 },
    ],
  },

  {
    code: 'BPM',
    name: 'Bachelor of Public Management',
    faculty: 'Faculty of Business & Management Sciences',
    duration: '3 Years',
    fee: 38000,
    modules: [
      { code: 'BPM101', name: 'Introduction to Public Administration', credits: 15, semester: 1, year: 1 },
      { code: 'BPM102', name: 'Public Policy Fundamentals', credits: 15, semester: 1, year: 1 },
      { code: 'BPM103', name: 'Government & Governance', credits: 15, semester: 1, year: 1 },
      { code: 'BPM104', name: 'Public Sector Economics', credits: 15, semester: 2, year: 1 },
      { code: 'BPM105', name: 'Public Finance & Budgeting', credits: 15, semester: 2, year: 1 },
      { code: 'BPM106', name: 'Communication for Public Sector', credits: 15, semester: 2, year: 1 },
      { code: 'BPM201', name: 'Public Sector HR Management', credits: 15, semester: 1, year: 2 },
      { code: 'BPM202', name: 'Local Government Management', credits: 15, semester: 1, year: 2 },
      { code: 'BPM203', name: 'Public Law & Administration', credits: 15, semester: 1, year: 2 },
      { code: 'BPM204', name: 'Service Delivery Management', credits: 15, semester: 2, year: 2 },
      { code: 'BPM205', name: 'Development Studies', credits: 15, semester: 2, year: 2 },
      { code: 'BPM206', name: 'Research Methods in Public Sector', credits: 15, semester: 2, year: 2 },
      { code: 'BPM301', name: 'Public Sector Strategic Planning', credits: 15, semester: 1, year: 3 },
      { code: 'BPM302', name: 'Performance Management in Public Sector', credits: 15, semester: 1, year: 3 },
      { code: 'BPM303', name: 'Intergovernmental Relations', credits: 15, semester: 1, year: 3 },
      { code: 'BPM304', name: 'Policy Implementation & Evaluation', credits: 15, semester: 2, year: 3 },
      { code: 'BPM305', name: 'Public Sector Entrepreneurship', credits: 15, semester: 2, year: 3 },
      { code: 'BPM306', name: 'Research Project', credits: 15, semester: 2, year: 3 },
    ],
  },

  {
    code: 'DBA',
    name: 'Diploma in Business Administration',
    faculty: 'Faculty of Business & Management Sciences',
    duration: '3 Years',
    fee: 34000,
    modules: [
      { code: 'DBA101', name: 'Business Communication', credits: 15, semester: 1, year: 1 },
      { code: 'DBA102', name: 'Principles of Management', credits: 15, semester: 1, year: 1 },
      { code: 'DBA103', name: 'Business Mathematics', credits: 15, semester: 1, year: 1 },
      { code: 'DBA104', name: 'Introduction to Accounting', credits: 15, semester: 2, year: 1 },
      { code: 'DBA105', name: 'Marketing Basics', credits: 15, semester: 2, year: 1 },
      { code: 'DBA106', name: 'Business Computing', credits: 15, semester: 2, year: 1 },
      { code: 'DBA201', name: 'Financial Management', credits: 15, semester: 1, year: 2 },
      { code: 'DBA202', name: 'Human Resources Fundamentals', credits: 15, semester: 1, year: 2 },
      { code: 'DBA203', name: 'Business Law', credits: 15, semester: 1, year: 2 },
      { code: 'DBA204', name: 'Supply Chain & Procurement', credits: 15, semester: 2, year: 2 },
      { code: 'DBA205', name: 'Entrepreneurship', credits: 15, semester: 2, year: 2 },
      { code: 'DBA206', name: 'Operations Management', credits: 15, semester: 2, year: 2 },
      { code: 'DBA301', name: 'Strategic Business Management', credits: 15, semester: 1, year: 3 },
      { code: 'DBA302', name: 'Leadership & Organisational Development', credits: 15, semester: 1, year: 3 },
      { code: 'DBA303', name: 'Business Research Methods', credits: 15, semester: 1, year: 3 },
      { code: 'DBA304', name: 'Work Integrated Learning', credits: 15, semester: 2, year: 3 },
      { code: 'DBA305', name: 'Digital Business Transformation', credits: 15, semester: 2, year: 3 },
      { code: 'DBA306', name: 'Business Research Project', credits: 15, semester: 2, year: 3 },
    ],
  },

  {
    code: 'DLGM',
    name: 'Diploma in Local Government Management',
    faculty: 'Faculty of Business & Management Sciences',
    duration: '3 Years',
    fee: 32000,
    modules: [
      { code: 'DLGM101', name: 'Introduction to Local Government', credits: 15, semester: 1, year: 1 },
      { code: 'DLGM102', name: 'Public Administration Foundations', credits: 15, semester: 1, year: 1 },
      { code: 'DLGM103', name: 'Municipal Finance Basics', credits: 15, semester: 1, year: 1 },
      { code: 'DLGM104', name: 'Local Government Legislation', credits: 15, semester: 2, year: 1 },
      { code: 'DLGM105', name: 'Integrated Development Planning', credits: 15, semester: 2, year: 1 },
      { code: 'DLGM106', name: 'Community Development', credits: 15, semester: 2, year: 1 },
      { code: 'DLGM201', name: 'Municipal Human Resource Management', credits: 15, semester: 1, year: 2 },
      { code: 'DLGM202', name: 'Service Delivery & Performance', credits: 15, semester: 1, year: 2 },
      { code: 'DLGM203', name: 'Local Government Finance', credits: 15, semester: 1, year: 2 },
      { code: 'DLGM204', name: 'Policy Process & Implementation', credits: 15, semester: 2, year: 2 },
      { code: 'DLGM205', name: 'Ward Committee Systems', credits: 15, semester: 2, year: 2 },
      { code: 'DLGM206', name: 'Municipal Governance', credits: 15, semester: 2, year: 2 },
      { code: 'DLGM301', name: 'Advanced Municipal Management', credits: 15, semester: 1, year: 3 },
      { code: 'DLGM302', name: 'Local Economic Development', credits: 15, semester: 1, year: 3 },
      { code: 'DLGM303', name: 'Environmental Management in LGM', credits: 15, semester: 1, year: 3 },
      { code: 'DLGM304', name: 'Work Integrated Learning', credits: 15, semester: 2, year: 3 },
      { code: 'DLGM305', name: 'Research Methods in Public Management', credits: 15, semester: 2, year: 3 },
      { code: 'DLGM306', name: 'Applied Research Project', credits: 15, semester: 2, year: 3 },
    ],
  },

  {
    code: 'HCBA',
    name: 'Higher Certificate in Business Administration',
    faculty: 'Faculty of Business & Management Sciences',
    duration: '1 Year',
    fee: 20000,
    modules: [
      { code: 'HCBA101', name: 'Business Communication', credits: 20, semester: 1, year: 1 },
      { code: 'HCBA102', name: 'Introduction to Management', credits: 20, semester: 1, year: 1 },
      { code: 'HCBA103', name: 'Basic Financial Literacy', credits: 20, semester: 1, year: 1 },
      { code: 'HCBA104', name: 'Customer Service & Relations', credits: 20, semester: 2, year: 1 },
      { code: 'HCBA105', name: 'Office Technology & Computing', credits: 20, semester: 2, year: 1 },
      { code: 'HCBA106', name: 'Work Integrated Learning', credits: 20, semester: 2, year: 1 },
    ],
  },

  {
    code: 'HCOA',
    name: 'Higher Certificate in Office Administration',
    faculty: 'Faculty of Business & Management Sciences',
    duration: '1 Year',
    fee: 18000,
    modules: [
      { code: 'HCOA101', name: 'Office Administration Principles', credits: 20, semester: 1, year: 1 },
      { code: 'HCOA102', name: 'Business English & Communication', credits: 20, semester: 1, year: 1 },
      { code: 'HCOA103', name: 'Computer Applications & Office Software', credits: 20, semester: 1, year: 1 },
      { code: 'HCOA104', name: 'Records & Information Management', credits: 20, semester: 2, year: 1 },
      { code: 'HCOA105', name: 'Administrative Support Services', credits: 20, semester: 2, year: 1 },
      { code: 'HCOA106', name: 'Work Integrated Learning', credits: 20, semester: 2, year: 1 },
    ],
  },

  {
    code: 'HCLGM',
    name: 'Higher Certificate in Local Government Management',
    faculty: 'Faculty of Business & Management Sciences',
    duration: '1 Year',
    fee: 18000,
    modules: [
      { code: 'HCLGM101', name: 'Introduction to Local Government', credits: 20, semester: 1, year: 1 },
      { code: 'HCLGM102', name: 'Public Sector Administration', credits: 20, semester: 1, year: 1 },
      { code: 'HCLGM103', name: 'Municipal Finance Fundamentals', credits: 20, semester: 1, year: 1 },
      { code: 'HCLGM104', name: 'Community Engagement & Development', credits: 20, semester: 2, year: 1 },
      { code: 'HCLGM105', name: 'Service Delivery Basics', credits: 20, semester: 2, year: 1 },
      { code: 'HCLGM106', name: 'Work Integrated Learning', credits: 20, semester: 2, year: 1 },
    ],
  },

  {
    code: 'HCRPLA',
    name: 'Higher Certificate in Recognition of Prior Learning Activities',
    faculty: 'Faculty of Business & Management Sciences',
    duration: '1 Year',
    fee: 16000,
    modules: [
      { code: 'HCRPLA101', name: 'Principles of RPL in Higher Education', credits: 30, semester: 1, year: 1 },
      { code: 'HCRPLA102', name: 'Portfolio Preparation & Assessment', credits: 30, semester: 1, year: 1 },
      { code: 'HCRPLA103', name: 'RPL Facilitation Practice', credits: 30, semester: 2, year: 1 },
      { code: 'HCRPLA104', name: 'Work Integrated Learning in RPL', credits: 30, semester: 2, year: 1 },
    ],
  },

  {
    code: 'MBA',
    name: 'Master of Business Administration',
    faculty: 'Faculty of Business & Management Sciences',
    duration: '2 Years',
    fee: 72000,
    modules: [
      { code: 'MBA101', name: 'Advanced Business Strategy', credits: 20, semester: 1, year: 1 },
      { code: 'MBA102', name: 'Leadership in the 4th Industrial Revolution', credits: 20, semester: 1, year: 1 },
      { code: 'MBA103', name: 'Advanced Financial Management', credits: 20, semester: 1, year: 1 },
      { code: 'MBA104', name: 'Digital Transformation & Innovation', credits: 20, semester: 2, year: 1 },
      { code: 'MBA105', name: 'Research Methodology', credits: 20, semester: 2, year: 1 },
      { code: 'MBA106', name: 'Advanced Marketing Strategy', credits: 20, semester: 2, year: 1 },
      { code: 'MBA201', name: 'Big Data & Analytics for Managers', credits: 20, semester: 1, year: 2 },
      { code: 'MBA202', name: 'Entrepreneurship & Venture Capital', credits: 20, semester: 1, year: 2 },
      { code: 'MBA203', name: 'Corporate Governance & Business Ethics', credits: 20, semester: 1, year: 2 },
      { code: 'MBA204', name: 'MBA Research Project / Dissertation', credits: 60, semester: 2, year: 2 },
    ],
  },

  {
    code: 'PGDM',
    name: 'Postgraduate Diploma in Management',
    faculty: 'Faculty of Business & Management Sciences',
    duration: '1 Year',
    fee: 45000,
    modules: [
      { code: 'PGDM101', name: 'Management Principles & Practices', credits: 30, semester: 1, year: 1 },
      { code: 'PGDM102', name: 'Organisational Leadership', credits: 30, semester: 1, year: 1 },
      { code: 'PGDM103', name: 'Strategic Human Resource Management', credits: 30, semester: 2, year: 1 },
      { code: 'PGDM104', name: 'Applied Management Research Project', credits: 30, semester: 2, year: 1 },
    ],
  },
];

export const SEED_USERS: User[] = [
  { id: 'admin-001', name: 'Admin User', email: 'admin@eduhub.ac.za', role: 'admin' },
  { id: 'lec-001', name: 'Dr. Sarah Mokoena', email: 'smokoena@eduhub.ac.za', role: 'lecturer' },
];

export const NATIONALITIES = [
  'South African',
  'Zimbabwean', 'Mozambican', 'Zambian', 'Malawian', 'Botswanan', 'Namibian',
  'Swazi', 'Lesothan', 'Congolese (DRC)', 'Nigerian', 'Ghanaian', 'Kenyan',
  'Tanzanian', 'Ugandan', 'Rwandan', 'Ethiopian', 'Somali', 'Sudanese',
  'Cameroonian', 'Senegalese', 'Ivorian', 'Angolan', 'Eritrean',
  'British', 'American', 'Canadian', 'Australian', 'German', 'French',
  'Portuguese', 'Dutch', 'Spanish', 'Italian', 'Chinese', 'Indian',
  'Pakistani', 'Bangladeshi', 'Sri Lankan', 'Filipino', 'Indonesian',
  'Brazilian', 'Argentinian', 'Colombian', 'Other',
];

export const generateStudentId = (): string => {
  const year = new Date().getFullYear();
  const start = year.toString().slice(2);
  const random = Math.floor(1000000 + Math.random() * 9000000);
  return `SD${start}/${year}/${random}`;
};

export const generateRefNumber = (): string => {
  return `APP-${Date.now().toString(36).toUpperCase()}`;
};

export const getModulesForYear = (qualCode: string, year: 1 | 2 | 3, semester?: 1 | 2) => {
  const qual = QUALIFICATIONS.find(q => q.code === qualCode);
  if (!qual) return [];
  return qual.modules.filter(m => m.year === year && (semester ? m.semester === semester : true));
};

export const getCompletedModules = (qualCode: string, completedUpToYear: number) => {
  const qual = QUALIFICATIONS.find(q => q.code === qualCode);
  if (!qual) return [];
  return qual.modules.filter(m => m.year < completedUpToYear);
};
