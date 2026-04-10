import { useParams, Link, useNavigate } from 'react-router-dom';
import { ALL_PROGRAMMES } from './ProgrammesPage';

export default function ProgrammeDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const prog = ALL_PROGRAMMES.find(p => p.slug === slug);

  if (!prog) {
    return (
      <div style={{ padding: '60px 40px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
        <h2 style={{ color: '#123f7a' }}>Programme not found</h2>
        <button onClick={() => navigate('/programmes')} style={{ marginTop: 16, background: '#123f7a', color: 'white', border: 'none', padding: '10px 24px', borderRadius: 6, cursor: 'pointer', fontSize: 15 }}>← Back to Programmes</button>
      </div>
    );
  }

  return (
    <div style={{ background: '#f4f4f4', minHeight: '100vh', fontFamily: 'Arial, Helvetica, sans-serif' }}>
      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${prog.color} 0%, #123f7a 100%)`, color: 'white', padding: '56px 40px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <Link to="/programmes" style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
            ← Back to Programmes
          </Link>
          <div style={{ fontSize: 48, marginBottom: 12 }}>{prog.icon}</div>
          <h1 style={{ fontSize: 'clamp(28px,5vw,44px)', fontWeight: 900, marginBottom: 8 }}>{prog.title}</h1>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
            {[prog.faculty, prog.nqf, prog.duration].map(t => (
              <span key={t} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', padding: '4px 14px', borderRadius: 99, fontSize: 13, fontWeight: 600 }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>
        {/* Main content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Overview */}
          <div style={{ background: 'white', borderRadius: 10, padding: '28px', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h2 style={{ color: '#123f7a', fontWeight: 800, fontSize: 20, marginBottom: 14 }}>Programme Overview</h2>
            <p style={{ color: '#374151', lineHeight: 1.8, fontSize: 15 }}>{prog.overview}</p>
          </div>

          {/* Modules */}
          <div style={{ background: 'white', borderRadius: 10, padding: '28px', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h2 style={{ color: '#123f7a', fontWeight: 800, fontSize: 20, marginBottom: 16 }}>Modules Covered</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {prog.modules.map((m, i) => (
                <div key={m} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#F4F6FB', borderRadius: 8 }}>
                  <span style={{ width: 24, height: 24, background: prog.color, borderRadius: 6, color: 'white', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
                  <span style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>{m}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Career Outcomes */}
          <div style={{ background: 'white', borderRadius: 10, padding: '28px', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h2 style={{ color: '#123f7a', fontWeight: 800, fontSize: 20, marginBottom: 16 }}>Career Outcomes</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {prog.careers.map(c => (
                <span key={c} style={{ background: '#D1FAE5', color: '#065f46', padding: '7px 16px', borderRadius: 99, fontSize: 14, fontWeight: 600 }}>✓ {c}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 80 }}>
          <div style={{ background: 'white', borderRadius: 10, padding: '24px', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Annual Fee</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: '#123f7a' }}>R{prog.fee.toLocaleString()}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20, fontSize: 14 }}>
              {[['Duration', prog.duration], ['NQF Level', prog.nqf], ['Faculty', prog.faculty]].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ color: '#6b7280' }}>{k}</span>
                  <span style={{ fontWeight: 600, color: '#123f7a', textAlign: 'right', maxWidth: 140 }}>{v}</span>
                </div>
              ))}
            </div>
            <Link to="/apply" style={{
              display: 'block', textAlign: 'center',
              background: '#ffc72c', color: '#123f7a',
              padding: '13px', borderRadius: 6, fontSize: 15, fontWeight: 800, textDecoration: 'none',
              marginBottom: 10,
            }}>Apply for this Programme</Link>
            <Link to="/programmes" style={{
              display: 'block', textAlign: 'center',
              background: '#EEF2FF', color: '#123f7a',
              padding: '10px', borderRadius: 6, fontSize: 14, fontWeight: 600, textDecoration: 'none',
            }}>← View All Programmes</Link>
          </div>

          <div style={{ background: '#123f7a', color: 'white', borderRadius: 10, padding: '20px 24px' }}>
            <div style={{ fontWeight: 800, marginBottom: 8, fontSize: 15 }}>Need more info?</div>
            <p style={{ fontSize: 13, opacity: 0.85, lineHeight: 1.6, marginBottom: 12 }}>Contact our admissions team for detailed information about this programme.</p>
            <a href="mailto:admissions@eduhub.ac.za" style={{ color: '#ffc72c', fontSize: 13, fontWeight: 700 }}>admissions@eduhub.ac.za</a>
            <div style={{ fontSize: 13, opacity: 0.75, marginTop: 6 }}>0860 EDUHUB</div>
          </div>
        </div>
      </div>
    </div>
  );
}
