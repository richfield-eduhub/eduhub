import { Link } from 'react-router-dom';

export const ALL_PROGRAMMES = [
  {
    slug: 'bsc-it',
    title: 'BSc Information Technology',
    code: 'BSc IT',
    faculty: 'Faculty of Information Technology',
    duration: '3 Years',
    nqf: 'NQF Level 7',
    icon: '💻',
    color: '#123f7a',
    desc: 'Learn programming, networking, cybersecurity and data science. Develop the skills required for careers in software development, IT support and systems administration.',
    overview: `The Bachelor of Science in Information Technology is a comprehensive 3-year degree that prepares students for the ever-evolving IT industry. You will gain solid theoretical knowledge combined with practical skills across a wide range of computing disciplines.`,
    modules: [
      'Introduction to Programming', 'Computer Architecture & Organisation',
      'Mathematics for Computing', 'Web Development', 'Database Design & Management',
      'Networking Fundamentals', 'Object-Oriented Programming', 'Operating Systems',
      'Software Engineering', 'Cloud Computing', 'Cybersecurity Fundamentals', 'Project Management',
    ],
    careers: ['Software Developer', 'Systems Analyst', 'Network Administrator', 'Cybersecurity Analyst', 'IT Project Manager', 'Database Administrator'],
    fee: 45000,
  },
  {
    slug: 'bcom',
    title: 'Bachelor of Commerce',
    code: 'BCom',
    faculty: 'Faculty of Business Science',
    duration: '3 Years',
    nqf: 'NQF Level 7',
    icon: '📊',
    color: '#1e6b3c',
    desc: 'Develop financial, management and business leadership skills for a successful career in the commercial world.',
    overview: `The Bachelor of Commerce is a broad-based business degree that equips students with the analytical and managerial skills to thrive in the business environment. It covers accounting, economics, management and law.`,
    modules: [
      'Financial Accounting', 'Business Economics', 'Commercial Law',
      'Management Principles', 'Marketing Management', 'Business Statistics',
      'Cost & Management Accounting', 'Taxation', 'Auditing', 'Corporate Finance',
      'Strategic Management', 'Entrepreneurship',
    ],
    careers: ['Accountant', 'Financial Analyst', 'Business Analyst', 'Marketing Manager', 'Entrepreneur', 'Management Consultant'],
    fee: 42000,
  },
  {
    slug: 'bba',
    title: 'Bachelor of Business Administration',
    code: 'BBA',
    faculty: 'Faculty of Business Science',
    duration: '3 Years',
    nqf: 'NQF Level 7',
    icon: '🏢',
    color: '#7c3aed',
    desc: 'Build strong management and entrepreneurship knowledge to lead organisations effectively.',
    overview: `The BBA is designed for students who aspire to leadership and management roles. It focuses on core business disciplines, strategic thinking and practical business skills.`,
    modules: [
      'Principles of Management', 'Business Communication', 'Organisational Behaviour',
      'Human Resources Management', 'Operations Management', 'Business Ethics',
      'International Business', 'Leadership Development', 'Project Management',
      'Innovation & Entrepreneurship', 'Strategic Planning', 'Change Management',
    ],
    careers: ['Business Manager', 'Operations Manager', 'HR Manager', 'Entrepreneur', 'Business Consultant', 'General Manager'],
    fee: 40000,
  },
  {
    slug: 'nd-it',
    title: 'National Diploma: Information Technology',
    code: 'ND IT',
    faculty: 'Faculty of Information Technology',
    duration: '3 Years',
    nqf: 'NQF Level 6',
    icon: '🖥️',
    color: '#0369a1',
    desc: 'A practical programme developing core IT skills for the modern workplace.',
    overview: `The National Diploma in IT is a vocationally-oriented qualification that provides students with hands-on technical skills. It emphasises practical application in real-world IT environments.`,
    modules: [
      'Systems Analysis & Design', 'Object-Oriented Programming', 'Operating Systems',
      'Software Engineering', 'Cloud Computing', 'Cybersecurity Fundamentals',
      'Web Technologies', 'Database Administration', 'IT Support & Service Management', 'Networking',
    ],
    careers: ['IT Technician', 'Systems Administrator', 'Web Developer', 'IT Support Specialist', 'Network Technician'],
    fee: 38000,
  },
  {
    slug: 'graphic-design',
    title: 'Higher Certificate: Graphic Design',
    code: 'HC GD',
    faculty: 'Faculty of Creative Arts',
    duration: '1 Year',
    nqf: 'NQF Level 5',
    icon: '🎨',
    color: '#be185d',
    desc: 'Creative design, typography, branding and digital media production for aspiring designers.',
    overview: `This one-year higher certificate introduces students to the world of graphic design. You will learn design principles, digital tools and creative thinking to produce professional visual communication.`,
    modules: [
      'Design Principles & Theory', 'Typography & Layout', 'Digital Illustration',
      'Brand Identity Design', 'Motion Graphics', 'Portfolio Development',
      'Photography Fundamentals', 'Print Production',
    ],
    careers: ['Graphic Designer', 'Visual Artist', 'Brand Designer', 'Social Media Designer', 'Print Designer'],
    fee: 28000,
  },
  {
    slug: 'nd-business',
    title: 'National Diploma: Business Studies',
    code: 'ND BS',
    faculty: 'Faculty of Business Science',
    duration: '3 Years',
    nqf: 'NQF Level 6',
    icon: '📋',
    color: '#b45309',
    desc: 'Core business disciplines: marketing, HR, finance and management for a well-rounded business career.',
    overview: `The National Diploma in Business Studies provides a solid foundation across key business functions. It is ideal for students who want a broad business education with practical focus.`,
    modules: [
      'Business Communication', 'Principles of Management', 'Business Mathematics',
      'Marketing Fundamentals', 'Financial Accounting', 'Human Resources Management',
      'Business Law', 'Entrepreneurship', 'Customer Relations',
    ],
    careers: ['Business Administrator', 'Office Manager', 'Sales Executive', 'HR Assistant', 'Marketing Coordinator'],
    fee: 34000,
  },
];

export default function ProgrammesPage() {
  return (
    <div style={{ background: '#f4f4f4', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #123f7a 0%, #1a5fa8 100%)',
        color: 'white', padding: '60px 40px', textAlign: 'center',
      }}>
        <h1 style={{ fontSize: 44, fontWeight: 900, marginBottom: 12, letterSpacing: 1 }}>Our Programmes</h1>
        <p style={{ fontSize: 18, opacity: 0.85, maxWidth: 560, margin: '0 auto' }}>
          Nationally accredited qualifications designed to launch your career
        </p>
      </div>

      {/* Faculty tabs area */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 40 }}>
          {['All', 'Information Technology', 'Business Science', 'Creative Arts'].map(f => (
            <div key={f} style={{
              padding: '8px 20px', borderRadius: 99,
              background: f === 'All' ? '#123f7a' : 'white',
              color: f === 'All' ? 'white' : '#123f7a',
              border: '1.5px solid #123f7a',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}>{f}</div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
          {ALL_PROGRAMMES.map(p => (
            <div key={p.slug} style={{
              background: 'white', width: 320, borderRadius: 10,
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)', overflow: 'hidden',
              border: '1px solid #e5e7eb', transition: 'transform 0.2s, box-shadow 0.2s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(18,63,122,0.15)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)'; }}>
              <div style={{ background: p.color, padding: '20px 24px', color: 'white' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{p.icon}</div>
                <div style={{ fontWeight: 800, fontSize: 16 }}>{p.title}</div>
                <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>{p.faculty}</div>
              </div>
              <div style={{ padding: '20px 24px' }}>
                <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6, marginBottom: 16 }}>{p.desc}</p>
                <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                  <span style={{ background: '#EEF2FF', color: '#3730a3', fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 99 }}>{p.nqf}</span>
                  <span style={{ background: '#FEF3C7', color: '#92400e', fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 99 }}>⏱ {p.duration}</span>
                  <span style={{ background: '#D1FAE5', color: '#065f46', fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 99 }}>R{p.fee.toLocaleString()}/yr</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link to={`/programmes/${p.slug}`} style={{
                    flex: 1, textAlign: 'center',
                    background: '#123f7a', color: 'white',
                    padding: '9px 0', borderRadius: 6, fontSize: 13, fontWeight: 600, textDecoration: 'none',
                  }}>Learn More</Link>
                  <Link to="/apply" style={{
                    flex: 1, textAlign: 'center',
                    background: '#ffc72c', color: '#123f7a',
                    padding: '9px 0', borderRadius: 6, fontSize: 13, fontWeight: 700, textDecoration: 'none',
                  }}>Apply Now</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: '#123f7a', color: 'white', padding: '48px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 12 }}>Ready to start your journey?</h2>
        <p style={{ opacity: 0.85, marginBottom: 24, fontSize: 16 }}>Apply online today — it only takes a few minutes.</p>
        <Link to="/apply" style={{
          background: '#ffc72c', color: '#123f7a', padding: '14px 36px',
          fontSize: 16, fontWeight: 800, borderRadius: 4, textDecoration: 'none',
        }}>Apply Now →</Link>
      </div>
    </div>
  );
}
