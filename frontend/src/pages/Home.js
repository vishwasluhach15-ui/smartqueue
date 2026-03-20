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
  const [city, setCity] = useState('All');

  useEffect(() => {
    Promise.all([api.get('/offices'), api.get('/tokens/my')])
      .then(([o, t]) => {
        setOffices(o.data);
        setMyTokens(t.data.filter(x => ['waiting','serving'].includes(x.status)));
      }).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spin"/></div>;

  const active = myTokens[0];
  const cities = ['All', ...new Set(offices.map(o => o.city))];
  const filtered = city === 'All' ? offices : offices.filter(o => o.city === city);

  return (
    <div className="app-shell">
      <div className="screen">

        {/* Header */}
        <div className="a1" style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'22px 0 6px' }}>
          <div>
            <p style={{ color:'var(--muted)',fontSize:10,letterSpacing:1.5,textTransform:'uppercase',marginBottom:5 }}>Smart Queue</p>
            <h2 style={{ fontSize:20 }}>Hey, {user?.name?.split(' ')[0]}</h2>
          </div>
          <div style={{ width:38,height:38,borderRadius:'50%',background:'var(--bg3)',border:'1px solid var(--border2)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--white)',fontWeight:700,fontSize:14,cursor:'pointer' }}
            onClick={logout}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
        </div>

        {/* Active token card */}
        {active ? (
          <div className="a2" onClick={() => navigate(`/token/${active._id}`)} style={{
            background:'linear-gradient(135deg, var(--bg3) 0%, var(--bg4) 100%)',
            border:'1px solid var(--border2)',borderRadius:20,padding:22,
            marginBottom:16,cursor:'pointer',position:'relative',overflow:'hidden',
            transition:'transform .2s',
          }}>
            {/* Gold accent line top */}
            <div style={{ position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,var(--gold),transparent)' }}/>
            {/* Decorative */}
            <div style={{ position:'absolute',right:-40,bottom:-40,width:120,height:120,borderRadius:'50%',background:'rgba(212,168,67,0.05)' }}/>

            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:18 }}>
              <div>
                <p style={{ color:'var(--muted)',fontSize:9,letterSpacing:1.5,textTransform:'uppercase',marginBottom:6 }}>Active Token</p>
                <p style={{ color:'var(--white)',fontSize:60,fontWeight:700,fontFamily:'Space Grotesk,sans-serif',lineHeight:1,letterSpacing:-2 }}>
                  {String(active.tokenNumber).padStart(3,'0')}
                </p>
                <p style={{ color:'var(--muted)',fontSize:11,marginTop:8,maxWidth:200 }}>{active.office?.name}</p>
              </div>
              <div style={{
                background: active.status==='serving' ? 'var(--gold)' : 'var(--bg4)',
                color: active.status==='serving' ? 'var(--bg)' : 'var(--muted)',
                fontSize:9,fontWeight:700,padding:'6px 12px',
                borderRadius:20,letterSpacing:.8,flexShrink:0,
                border: active.status==='serving' ? 'none' : '1px solid var(--border)',
              }}>
                {active.status==='serving' ? '● YOUR TURN' : '○ WAITING'}
              </div>
            </div>
            <div style={{ display:'flex',gap:8 }}>
              {[
                {l:'People ahead',v:active.peopleAhead},
                {l:'Est. wait',v:`~${active.estimatedWait}m`},
                {l:'Service',v:active.service?.split(' ')[0]},
              ].map(i => (
                <div key={i.l} style={{ background:'rgba(0,0,0,0.25)',borderRadius:10,padding:'9px 10px',flex:1 }}>
                  <p style={{ color:'var(--muted)',fontSize:8,textTransform:'uppercase',letterSpacing:.8 }}>{i.l}</p>
                  <p style={{ color:'var(--white)',fontSize:12,fontWeight:600,marginTop:3 }}>{i.v}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="a2" style={{ border:'1px dashed var(--border)',borderRadius:18,padding:20,textAlign:'center',marginBottom:16 }}>
            <p style={{ color:'var(--muted)',fontSize:13 }}>No active token — tap an office to book</p>
          </div>
        )}

        {/* City filter */}
        <div className="a3" style={{ display:'flex',gap:8,overflowX:'auto',paddingBottom:4,scrollbarWidth:'none',marginBottom:0 }}>
          {cities.map(c => (
            <button key={c} className={`pill ${city===c?'active':''}`} onClick={() => setCity(c)}>{c}</button>
          ))}
        </div>

        <p className="section-label a3">{filtered.length} {city!=='All'?city:''} offices</p>

        {offices.length===0 && (
          <div style={{ textAlign:'center',padding:'28px 0' }}>
            <p style={{ color:'var(--muted)',fontSize:13,marginBottom:14 }}>No offices loaded</p>
            <button className="btn-outline" style={{ width:'auto',padding:'9px 22px' }}
              onClick={() => api.post('/offices/seed/demo').then(()=>window.location.reload())}>
              Load demo data
            </button>
          </div>
        )}

        {filtered.map((o, i) => {
          const inQ = Math.max(0, o.lastToken - o.currentToken);
          const wait = inQ * 5;
          const waitColor = wait<15 ? 'var(--success)' : wait<40 ? 'var(--gold)' : 'var(--red)';
          return (
            <div key={o._id} className="card card-interactive a3"
              style={{ animationDelay:`${i*.05}s` }}
              onClick={() => navigate(`/book/${o._id}`)}>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start' }}>
                <div style={{ flex:1,minWidth:0 }}>
                  <p style={{ color:'var(--muted)',fontSize:9,fontWeight:600,letterSpacing:1.2,textTransform:'uppercase',marginBottom:5 }}>{o.city}</p>
                  <h3 style={{ fontSize:13,marginBottom:6,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontWeight:500 }}>{o.name}</h3>
                  <p style={{ color:'var(--muted)',fontSize:11,marginBottom:10 }}>{o.address}</p>
                  <div style={{ display:'flex',alignItems:'center',gap:7 }}>
                    <span className="live-dot"/>
                    <span style={{ color:'var(--gold)',fontSize:10,fontWeight:500 }}>Serving #{o.currentToken}</span>
                    <span style={{ color:'var(--muted)',fontSize:10 }}>· {inQ} in queue</span>
                  </div>
                </div>
                <div style={{ textAlign:'right',flexShrink:0,marginLeft:14 }}>
                  <p style={{ color:waitColor,fontSize:24,fontWeight:700,fontFamily:'Space Grotesk,sans-serif',letterSpacing:-1 }}>
                    {wait}<span style={{ fontSize:11,color:'var(--muted)',fontWeight:400 }}> min</span>
                  </p>
                  <div style={{ marginTop:8,background:'var(--bg4)',border:'1px solid var(--border2)',borderRadius:8,padding:'5px 12px',fontSize:11,color:'var(--white)',fontWeight:500 }}>
                    Book →
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <nav className="bottom-nav">
        <Link to="/" className="bnav-item active">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 8.5L9 2l7 6.5V16a1 1 0 01-1 1H3a1 1 0 01-1-1V8.5z" stroke="white" strokeWidth="1.5" fill="none"/><path d="M6 17v-4h6v4" stroke="white" strokeWidth="1.5"/></svg>
          <span className="bnav-label">Home</span>
        </Link>
        <Link to={active?`/token/${active._id}`:'/'}  className="bnav-item">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="3" y="1" width="12" height="16" rx="2" stroke="white" strokeWidth="1.5"/><path d="M6 6h6M6 9.5h4" stroke="white" strokeWidth="1.2" strokeLinecap="round"/></svg>
          <span className="bnav-label">My Token</span>
        </Link>
        <Link to="/profile" className="bnav-item">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="6" r="3" stroke="white" strokeWidth="1.5"/><path d="M2 16c0-3.314 2.686-5 7-5s7 1.686 7 5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
          <span className="bnav-label">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
