import { Link } from 'react-router-dom';
import { EDUHUB_LOGO } from '../utils/logo';

const PROGRAMMES = [
  {
    title: 'BSc Information Technology',
    desc: 'Learn programming, networking, cybersecurity and data science.',
    url: 'https://www.eduhub.ac.za/programmes/degrees/faculty-of-information-technology/bachelor-of-science-in-information-technology-bsc-it',
    internalPath: '/programmes/bsc-it',
    icon: '💻',
  },
  {
    title: 'Bachelor of Commerce',
    desc: 'Develop financial, management and business leadership skills.',
    url: 'https://www.eduhub.ac.za/programmes/degrees/business-science/bachelor-of-commerce-bcom',
    internalPath: '/programmes/bcom',
    icon: '📊',
  },
  {
    title: 'Business Administration',
    desc: 'Build strong management and entrepreneurship knowledge.',
    url: 'https://www.eduhub.ac.za/programmes/degrees/business-science/bachelor-of-business-administration-bba',
    internalPath: '/programmes/bba',
    icon: '🏢',
  },
  {
    title: 'National Diploma: IT',
    desc: 'A practical programme developing core IT skills for the modern workplace.',
    url: 'https://www.eduhub.ac.za',
    internalPath: '/programmes/nd-it',
    icon: '🖥️',
  },
  {
    title: 'Higher Certificate: Graphic Design',
    desc: 'Creative design, typography, branding and digital media production.',
    url: 'https://www.eduhub.ac.za',
    internalPath: '/programmes/graphic-design',
    icon: '🎨',
  },
  {
    title: 'National Diploma: Business Studies',
    desc: 'Core business disciplines: marketing, HR, finance and management.',
    url: 'https://www.eduhub.ac.za',
    internalPath: '/programmes/nd-business',
    icon: '📋',
  },
];

export default function HomePage() {
  return (
    <div style={{ fontFamily: 'Arial, Helvetica, sans-serif', background: '#f4f4f4' }}>

      {/* HERO */}
      <div style={{
        background: 'url("https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1600&q=80") center/cover',
        height: 420,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        color: 'white', textAlign: 'center',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(18,63,122,0.62)',
        }} />
        <div style={{ position: 'relative', zIndex: 1, padding: '0 20px' }}>
          <h1 style={{ fontSize: 'clamp(32px,6vw,56px)', marginBottom: 10, fontWeight: 900, letterSpacing: 1 }}>
            Start Here. Go Anywhere.
          </h1>
          <p style={{ fontSize: 20, marginBottom: 24, opacity: 0.95 }}>
            Begin your study journey with EduHub.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/apply" style={{
              padding: '13px 30px', fontSize: 16, background: '#ffc72c',
              border: 'none', cursor: 'pointer', fontWeight: 700,
              color: '#123f7a', borderRadius: 4, textDecoration: 'none',
              transition: 'background 0.15s',
            }}>Apply Now</Link>
            <Link to="/programmes" style={{
              padding: '13px 30px', fontSize: 16,
              background: 'rgba(255,255,255,0.15)',
              border: '2px solid rgba(255,255,255,0.6)',
              cursor: 'pointer', fontWeight: 700,
              color: 'white', borderRadius: 4, textDecoration: 'none',
            }}>View Programmes</Link>
          </div>
        </div>
      </div>

      {/* WHY EDUHUB STATS */}
      <div style={{ background: 'white', padding: '28px 40px', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24, textAlign: 'center' }}>
          {[
            { value: '25+', label: 'Years of Excellence' },
            { value: '50,000+', label: 'Alumni Worldwide' },
            { value: '40+', label: 'Qualifications' },
            { value: '8', label: 'Campus Locations' },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: 34, fontWeight: 900, color: '#123f7a' }}>{s.value}</div>
              <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* POPULAR PROGRAMMES */}
      <div style={{ padding: '50px 40px', textAlign: 'center', maxWidth: 1100, margin: '0 auto' }} id="programmes">
        <h2 style={{ fontSize: 32, color: '#123f7a', marginBottom: 8, fontWeight: 900 }}>Popular Programmes</h2>
        <p style={{ color: '#6b7280', marginBottom: 36, fontSize: 15 }}>Choose from our nationally accredited qualifications</p>
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap',
        }}>
          {PROGRAMMES.map(p => (
            <div key={p.title} style={{
              background: 'white', padding: 24, width: 280,
              borderRadius: 8, boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
              textAlign: 'center', transition: 'transform 0.2s, box-shadow 0.2s',
              border: '1px solid #e5e7eb',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(18,63,122,0.15)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.10)'; }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>{p.icon}</div>
              <h3 style={{ color: '#123f7a', marginBottom: 10, fontSize: 16, fontWeight: 700 }}>{p.title}</h3>
              <p style={{ color: '#374151', fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>{p.desc}</p>
              <Link to={p.internalPath} style={{
                display: 'inline-block',
                background: '#123f7a', color: 'white', border: 'none',
                padding: '10px 20px', cursor: 'pointer', fontSize: 14,
                fontWeight: 600, borderRadius: 4, textDecoration: 'none',
                transition: 'background 0.15s',
              }}>Learn More</Link>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 40 }}>
          <Link to="/apply" style={{
            display: 'inline-block', background: '#ffc72c', color: '#123f7a',
            padding: '14px 36px', fontSize: 16, fontWeight: 800, borderRadius: 4,
            textDecoration: 'none', boxShadow: '0 4px 14px rgba(255,199,44,0.4)',
          }}>Start Your Application →</Link>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div style={{ background: 'white', padding: '50px 40px', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 30, color: '#123f7a', marginBottom: 8, fontWeight: 900 }}>How It Works</h2>
          <p style={{ color: '#6b7280', marginBottom: 44, fontSize: 15 }}>Your path to enrolment in 4 simple steps</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 28 }}>
            {[
              { step: '01', icon: '📝', title: 'Apply Online', desc: 'Fill in your application form with personal, educational and qualification details.' },
              { step: '02', icon: '✅', title: 'Get Approved', desc: 'Our admissions team reviews your application and notifies you via email within 3–5 days.' },
              { step: '03', icon: '🔑', title: 'Set Password', desc: 'Receive your Student ID and temporary password, then log in to set your own.' },
              { step: '04', icon: '📚', title: 'Register Modules', desc: 'Select and register for your modules to start your academic journey.' },
            ].map(s => (
              <div key={s.step}>
                <div style={{
                  width: 64, height: 64, background: '#EEF2FF', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28, margin: '0 auto 12px',
                }}>{s.icon}</div>
                <div style={{ fontSize: 12, color: '#ffc72c', fontWeight: 800, marginBottom: 6, letterSpacing: 1 }}>STEP {s.step}</div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8, color: '#123f7a' }}>{s.title}</div>
                <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER — exact match to HTML original */}
      <div style={{ background: '#173f77', color: 'white', padding: '60px 40px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 32 }}>

          {/* Left: logo + text + buttons */}
          <div style={{ width: 260 }}>
            <div style={{
              width: 180, height: 170, border: '1px solid white',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
            }}>
              <img src={EDUHUB_LOGO} style={{ width: 140 }} alt="EduHub" />
            </div>
            <p style={{ fontSize: 15, marginBottom: 20, lineHeight: 1.6, opacity: 0.9 }}>
              Your path to a brighter future, offering quality education that's accessible to all.
              We're committed to empowering your career success.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {['Enquire Now', 'Visit', 'Apply'].map(b => (
                <button key={b} onClick={b === 'Apply' ? () => window.location.href = '/apply' : undefined} style={{
                  padding: '8px 16px', borderRadius: 20, border: '1px solid white',
                  background: 'transparent', color: 'white', cursor: 'pointer', fontSize: 13,
                  transition: 'background 0.15s',
                }}>{b}</button>
              ))}
            </div>
            <div style={{ fontSize: 22, display: 'flex', gap: 14, marginTop: 8 }}>
              <a href="https://facebook.com/eduhubgit" target="_blank" rel="noreferrer" style={{ color: 'white' }}>💻</a>
              <a href="https://instagram.com/eduhubgit" target="_blank" rel="noreferrer" style={{ color: 'white' }}>📷</a>
              <a href="https://twitter.com/eduhubgit" target="_blank" rel="noreferrer" style={{ color: 'white' }}>✖</a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" style={{ color: 'white' }}>▶</a>
              <a href="https://tiktok.com" target="_blank" rel="noreferrer" style={{ color: 'white' }}>🎵</a>
            </div>
          </div>

          {/* Footer columns */}
          <FooterCol title="STUDY WITH US" links={['Postgraduate', 'Faculty of Information Technology', 'Faculty of Business Science', 'Online Learning', 'On-campus Learning', 'Corporate Education']} />
          <FooterCol title="WHY EDUHUB?" links={['Graduate Success', 'Accreditation & Recognition', 'Prospectus']} />
          <FooterCol title="STUDENT LIFE" links={['Campus Life', 'Support & Community', 'Culture', 'Career Readiness']} />
          <FooterCol title="ADMISSIONS" links={['Application Process', 'Financial Info', 'FAQ & Help', 'Fees']} internalLinks={{ 'Application Process': '/apply' }} />
        </div>
        <div style={{ textAlign: 'center', marginTop: 40, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.2)', fontSize: 12, opacity: 0.55 }}>
          © {new Date().getFullYear()} EduHub · All rights reserved
        </div>
      </div>
    </div>
  );
}

function FooterCol({ title, links, internalLinks = {} }: { title: string; links: string[]; internalLinks?: Record<string, string> }) {
  return (
    <div style={{ width: 200 }}>
      <h3 style={{ marginBottom: 15, fontSize: 15, fontWeight: 800 }}>{title}</h3>
      {links.map(l => (
        internalLinks[l]
          ? <Link key={l} to={internalLinks[l]} style={{ display: 'block', color: 'white', textDecoration: 'none', marginBottom: 8, fontSize: 14, opacity: 0.85 }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.textDecoration = 'underline'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.textDecoration = 'none'}
            >{l}</Link>
          : <a key={l} href="#" style={{ display: 'block', color: 'white', textDecoration: 'none', marginBottom: 8, fontSize: 14, opacity: 0.85 }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.textDecoration = 'underline'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.textDecoration = 'none'}
            >{l}</a>
      ))}
    </div>
  );
}
