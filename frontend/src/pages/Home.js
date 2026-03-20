import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const CITY_ICONS = { Rohtak: '🏙️', Delhi: '🏛️', Gurugram: '🌆' };

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [offices, setOffices]   = useState([]);
  const [myTokens, setMyTokens] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [cityFilter, setCityFilter] = useState('All');

  useEffect(() => {
    const load = async () => {
      try {
        const [offRes, tokRes] = await Promise.all([api.get('/offices'), api.get('/tokens/my')]);
        setOffices(offRes.data);
        setMyTokens(tokRes.data.filter(t => ['waiting','serving'].includes(t.status)));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <div className="loading"><div className="loading-spinner"/></div>;

  const active  = myTokens[0];
  const cities  = ['All', ...new Set(offices.map(o => o.city))];
  const filtered = cityFilter === 'All' ? offices : offices.filter(o => o.city === cityFilter);

  return (
    <div className="app-shell">
      <div className="screen">

        {/* Header */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'20px 0 16px'}}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
              <div style={{width:28,height:28,borderRadius:8,background:'var(--mint)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 5h10M2 8h7" stroke="#061a1f" strokeWidth="1.8" strokeLinecap="round"/></svg>
              </div>
              <p style={{color:'var(--mint)',fontSize:11,fontWeight:600,letterSpacing:1}}>SMART QUEUE</p>
            </div>
            <h2 style={{marginTop:0}}>Hey, {user?.name?.split(' ')[0]}!</h2>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{
              width:40,height:40,borderRadius:'50%',background:'var(--mint-dim)',
              border:'1.5px solid rgba(2,195,154,0.3)',display:'flex',
              alignItems:'center',justifyContent:'center',
              color:'var(--mint)',fontWeight:700,fontSize:15,fontFamily:'Syne,sans-serif',
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <button onClick={logout} style={{background:'none',border:'none',color:'var(--muted)',fontSize:11,cursor:'pointer'}}>Logout</button>
          </div>
        </div>

        {/* Active token hero */}
        {active ? (
          <div style={{
            background:'linear-gradient(135deg, #028090 0%, #00a896 100%)',
            borderRadius:22,padding:22,marginBottom:16,cursor:'pointer',
            position:'relative',overflow:'hidden',
          }} onClick={() => navigate(`/token/${active._id}`)}>
            <div style={{position:'absolute',right:-30,top:-30,width:130,height:130,borderRadius:'50%',background:'rgba(255,255,255,0.07)'}}/>
            <div style={{position:'absolute',left:-20,bottom:-40,width:100,height:100,borderRadius:'50%',background:'rgba(0,0,0,0.06)'}}/>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',position:'relative',zIndex:1}}>
              <div>
                <p style={{color:'rgba(255,255,255,0.55)',fontSize:9,letterSpacing:1.5,textTransform:'uppercase',marginBottom:4}}>Active token</p>
                <p style={{color:'#fff',fontSize:58,fontWeight:800,fontFamily:'Syne,sans-serif',lineHeight:1}}>
                  {String(active.tokenNumber).padStart(3,'0')}
                </p>
                <p style={{color:'rgba(255,255,255,0.75)',fontSize:11,marginTop:6,maxWidth:180}}>{active.office?.name}</p>
              </div>
              <span style={{
                background: active.status==='serving' ? '#f0544f' : 'rgba(255,255,255,0.2)',
                color:'#fff',fontSize:9,fontWeight:700,padding:'5px 12px',
                borderRadius:20,letterSpacing:.8,flexShrink:0,
              }}>
                {active.status==='serving' ? '🔴 YOUR TURN' : '⏳ WAITING'}
              </span>
            </div>
            <div style={{display:'flex',gap:8,marginTop:16,position:'relative',zIndex:1}}>
              {[
                {l:'People ahead', v:active.peopleAhead},
                {l:'Est. wait',    v:`~${active.estimatedWait}m`},
                {l:'Service',      v:active.service?.split(' ')[0]},
              ].map(i => (
                <div key={i.l} style={{background:'rgba(0,0,0,0.18)',borderRadius:10,padding:'8px 10px',flex:1}}>
                  <p style={{color:'rgba(255,255,255,0.45)',fontSize:8,textTransform:'uppercase',letterSpacing:.8}}>{i.l}</p>
                  <p style={{color:'#fff',fontSize:11,fontWeight:600,marginTop:3}}>{i.v}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{
            border:'1.5px dashed rgba(2,195,154,0.2)',borderRadius:18,
            padding:'20px',textAlign:'center',marginBottom:16,
          }}>
            <p style={{color:'var(--muted)',fontSize:13}}>No active token — book one below 👇</p>
          </div>
        )}

        {/* City filter pills */}
        <div style={{display:'flex',gap:8,overflowX:'auto',paddingBottom:4,marginBottom:4,scrollbarWidth:'none'}}>
          {cities.map(c => (
            <button key={c} onClick={() => setCityFilter(c)} style={{
              flexShrink:0,padding:'6px 14px',borderRadius:20,border:'none',cursor:'pointer',
              background: cityFilter===c ? 'var(--mint)' : 'var(--dark2)',
              color: cityFilter===c ? 'var(--dark)' : 'var(--muted)',
              fontSize:12,fontWeight:600,fontFamily:'DM Sans,sans-serif',transition:'all .15s',
            }}>
              {CITY_ICONS[c] || ''} {c}
            </button>
          ))}
        </div>

        {/* Offices */}
        <p className="section-label">{filtered.length} offices {cityFilter !== 'All' ? `in ${cityFilter}` : 'nearby'}</p>

        {offices.length === 0 && (
          <div style={{textAlign:'center',padding:'20px 0'}}>
            <p style={{color:'var(--muted)',fontSize:13,marginBottom:14}}>No offices found</p>
            <button className="btn-ghost" style={{width:'auto',padding:'9px 22px'}}
              onClick={() => api.post('/offices/seed/demo').then(() => window.location.reload())}>
              Load demo offices
            </button>
          </div>
        )}

        {filtered.map((o, i) => {
          const inQ  = Math.max(0, o.lastToken - o.currentToken);
          const wait = inQ * 5;
          const col  = wait < 15 ? 'var(--mint)' : wait < 45 ? '#f5a623' : 'var(--coral)';
          return (
            <div key={o._id} style={{
              background:'var(--dark2)',border:'1px solid var(--border)',
              borderRadius:16,padding:'14px 16px',marginBottom:10,
              display:'flex',justifyContent:'space-between',alignItems:'center',
              animationDelay:`${i*.06}s`,
            }}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
                  <span style={{fontSize:13}}>{CITY_ICONS[o.city] || '🏢'}</span>
                  <span style={{color:'var(--muted)',fontSize:9,fontWeight:600,letterSpacing:.8,textTransform:'uppercase'}}>{o.city}</span>
                </div>
                <h3 style={{fontSize:13,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',marginBottom:3}}>{o.name}</h3>
                <p style={{color:'var(--muted)',fontSize:10,marginBottom:7}}>{o.address}</p>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <div style={{width:5,height:5,borderRadius:'50%',background:'var(--mint)',flexShrink:0}} className="pulse"/>
                  <span style={{color:'var(--mint)',fontSize:10,fontWeight:500}}>Serving #{o.currentToken}</span>
                  <span style={{color:'var(--muted)',fontSize:10}}>· {inQ} in queue</span>
                </div>
              </div>
              <div style={{textAlign:'right',flexShrink:0,marginLeft:12}}>
                <p style={{color:col,fontSize:20,fontWeight:700,fontFamily:'Syne,sans-serif'}}>
                  {wait}<span style={{fontSize:10,color:'var(--muted)',fontWeight:400}}> min</span>
                </p>
                <button onClick={() => navigate(`/book/${o._id}`)} style={{
                  marginTop:6,background:'var(--mint)',color:'var(--dark)',border:'none',
                  borderRadius:9,padding:'6px 14px',fontSize:11,fontWeight:700,
                  cursor:'pointer',fontFamily:'Syne,sans-serif',
                }}>Book →</button>
              </div>
            </div>
          );
        })}

        <div style={{height:10}}/>
      </div>

      {/* Bottom Nav */}
      <nav className="bottom-nav">
        <Link to="/" className="bnav-item active">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 9.5L10 3l7 6.5V17a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke="white" strokeWidth="1.5" fill="none"/><path d="M7 18v-5h6v5" stroke="white" strokeWidth="1.5"/></svg>
          <span className="bnav-label">Home</span>
        </Link>
        <Link to={active ? `/token/${active._id}` : '/'} className="bnav-item">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="4" y="2" width="12" height="16" rx="2" stroke="white" strokeWidth="1.5"/><path d="M7 7h6M7 10.5h4" stroke="white" strokeWidth="1.3" strokeLinecap="round"/></svg>
          <span className="bnav-label">My Token</span>
        </Link>
        <Link to="/profile" className="bnav-item">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="3.5" stroke="white" strokeWidth="1.5"/><path d="M3 17c0-3.866 3.134-6 7-6s7 2.134 7 6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
          <span className="bnav-label">Account</span>
        </Link>
      </nav>
    </div>
  );
}
