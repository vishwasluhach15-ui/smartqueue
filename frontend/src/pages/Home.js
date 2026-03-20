import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [offices, setOffices] = useState([]);
  const [myTokens, setMyTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState('All');

  useEffect(() => {
    const load = async () => {
      try {
        const [offRes, tokRes] = await Promise.all([api.get('/offices'), api.get('/tokens/my')]);
        setOffices(offRes.data);
        setMyTokens(tokRes.data.filter(t => ['waiting', 'serving'].includes(t.status)));
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <div className="loading"><div className="loading-spinner" /></div>;

  const active = myTokens[0];
  const cities = ['All', ...new Set(offices.map(o => o.city))];
  const filtered = cityFilter === 'All' ? offices : offices.filter(o => o.city === cityFilter);

  return (
    <div className="app-shell">
      <div className="screen">

        {/* Header */}
        <div className="fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px 0 8px' }}>
          <div>
            <p style={{ color: 'var(--gray3)', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Smart Queue</p>
            <h2 style={{ fontSize: 20 }}>Hey, {user?.name?.split(' ')[0]}</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'var(--dark2)', border: '1px solid var(--border2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--white)', fontWeight: 700, fontSize: 14,
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <button onClick={logout} style={{ background: 'none', border: 'none', color: 'var(--gray3)', fontSize: 11, cursor: 'pointer' }}>
              Logout
            </button>
          </div>
        </div>

        {/* Active token */}
        {active ? (
          <div className="fade-up-2" onClick={() => navigate(`/token/${active._id}`)} style={{
            background: 'var(--white)', borderRadius: 18, padding: 20,
            marginBottom: 16, cursor: 'pointer',
            position: 'relative', overflow: 'hidden',
            transition: 'transform .2s',
          }}>
            {/* Decorative circle */}
            <div style={{ position: 'absolute', right: -30, top: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(0,0,0,0.04)' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <p style={{ color: 'rgba(0,0,0,0.4)', fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>Active token</p>
                  <p style={{ color: 'var(--black)', fontSize: 58, fontWeight: 700, fontFamily: 'Playfair Display,serif', lineHeight: 1 }}>
                    {String(active.tokenNumber).padStart(3, '0')}
                  </p>
                  <p style={{ color: 'rgba(0,0,0,0.5)', fontSize: 11, marginTop: 6 }}>{active.office?.name}</p>
                </div>
                <span style={{
                  background: active.status === 'serving' ? 'var(--black)' : 'rgba(0,0,0,0.06)',
                  color: active.status === 'serving' ? 'var(--white)' : 'rgba(0,0,0,0.5)',
                  fontSize: 9, fontWeight: 700, padding: '5px 12px',
                  borderRadius: 20, letterSpacing: .8,
                }}>
                  {active.status === 'serving' ? '● YOUR TURN' : '○ WAITING'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { l: 'Ahead', v: active.peopleAhead },
                  { l: 'Wait',  v: `~${active.estimatedWait}m` },
                  { l: 'Service', v: active.service?.split(' ')[0] },
                ].map(i => (
                  <div key={i.l} style={{ background: 'rgba(0,0,0,0.05)', borderRadius: 10, padding: '8px 10px', flex: 1 }}>
                    <p style={{ color: 'rgba(0,0,0,0.35)', fontSize: 8, textTransform: 'uppercase', letterSpacing: .8 }}>{i.l}</p>
                    <p style={{ color: 'var(--black)', fontSize: 11, fontWeight: 600, marginTop: 3 }}>{i.v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="fade-up-2" style={{
            border: '1px dashed var(--border2)', borderRadius: 18,
            padding: '20px', textAlign: 'center', marginBottom: 16,
          }}>
            <p style={{ color: 'var(--gray3)', fontSize: 13 }}>No active token — book one below</p>
          </div>
        )}

        {/* City filter */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 2, scrollbarWidth: 'none' }}>
          {cities.map((c, i) => (
            <button key={c} onClick={() => setCityFilter(c)} className={i === 0 ? 'fade-up-2' : 'fade-up-3'} style={{
              flexShrink: 0, padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
              background: cityFilter === c ? 'var(--white)' : 'var(--dark2)',
              color: cityFilter === c ? 'var(--black)' : 'var(--gray3)',
              fontSize: 12, fontWeight: 600, fontFamily: 'Inter,sans-serif', transition: 'all .15s',
            }}>
              {c}
            </button>
          ))}
        </div>

        <p className="section-label fade-up-3">{filtered.length} offices {cityFilter !== 'All' ? `in ${cityFilter}` : 'nearby'}</p>

        {offices.length === 0 && (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <p style={{ color: 'var(--gray3)', fontSize: 13, marginBottom: 14 }}>No offices loaded</p>
            <button className="btn-ghost" style={{ width: 'auto', padding: '9px 22px' }}
              onClick={() => api.post('/offices/seed/demo').then(() => window.location.reload())}>
              Load demo offices
            </button>
          </div>
        )}

        {filtered.map((o, i) => {
          const inQ = Math.max(0, o.lastToken - o.currentToken);
          const wait = inQ * 5;
          return (
            <div key={o._id} className={`card card-click fade-up-${Math.min(i + 3, 4)}`}
              style={{ animationDelay: `${i * .06}s` }}
              onClick={() => navigate(`/book/${o._id}`)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: 'var(--gray3)', fontSize: 9, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>
                    {o.city}
                  </p>
                  <h3 style={{ fontSize: 13, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.name}</h3>
                  <p style={{ color: 'var(--gray3)', fontSize: 11, marginBottom: 8 }}>{o.address}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="dot-live" />
                    <span style={{ color: 'var(--green)', fontSize: 10, fontWeight: 500 }}>#{o.currentToken}</span>
                    <span style={{ color: 'var(--gray3)', fontSize: 10 }}>· {inQ} waiting</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 14 }}>
                  <p style={{
                    color: wait < 15 ? 'var(--green)' : wait < 45 ? 'var(--gold)' : 'var(--red)',
                    fontSize: 22, fontWeight: 700, fontFamily: 'Playfair Display,serif',
                  }}>
                    {wait}<span style={{ fontSize: 11, color: 'var(--gray3)', fontWeight: 400, fontFamily: 'Inter,sans-serif' }}> min</span>
                  </p>
                  <p style={{ color: 'var(--gray3)', fontSize: 10, marginTop: 4 }}>Tap to book</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <nav className="bottom-nav">
        <Link to="/" className="bnav-item active">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 8.5L9 2l7 6.5V16a1 1 0 01-1 1H3a1 1 0 01-1-1V8.5z" stroke="white" strokeWidth="1.5" fill="none"/><path d="M6 17v-5h6v5" stroke="white" strokeWidth="1.5"/></svg>
          <span className="bnav-label">Home</span>
        </Link>
        <Link to={active ? `/token/${active._id}` : '/'} className="bnav-item">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="3" y="1" width="12" height="16" rx="2" stroke="white" strokeWidth="1.5"/><path d="M6 6h6M6 9.5h4" stroke="white" strokeWidth="1.2" strokeLinecap="round"/></svg>
          <span className="bnav-label">My Token</span>
        </Link>
        <Link to="/profile" className="bnav-item">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="6" r="3.5" stroke="white" strokeWidth="1.5"/><path d="M2 16c0-3.866 3.134-6 7-6s7 2.134 7 6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
          <span className="bnav-label">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
