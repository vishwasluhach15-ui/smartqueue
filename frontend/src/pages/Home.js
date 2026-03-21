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
      {/* Ambient glow */}
      <div style={{ position:'fixed',top:0,right:0,width:200,height:200,borderRadius:'50%',background:'radial-gradient(circle,rgba(139,92,246,0.08),transparent 70%)',pointerEvents:'none' }}/>

      <div className="screen">
        {/* Header */}
        <div className="a1" style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'24px 0 8px' }}>
          <div>
            <p style={{ color:'var(--muted)',fontSize:10,letterSpacing:2,textTransform:'uppercase',marginBottom:5,fontWeight:700 }}>Smart Queue</p>
            <h2 style={{ fontSize:22 }}>Hey, {user?.name?.split(' ')[0]} 👋</h2>
          </div>
          <button onClick={logout} style={{
            width:40,height:40,borderRadius:'50%',
            background:'linear-gradient(135deg,#8b5cf6,#ec4899)',
            border:'none',display:'flex',alignItems:'center',justifyContent:'center',
            color:'var(--white)',fontWeight:800,fontSize:15,cursor:'pointer',
            fontFamily:'Syne,sans-serif',boxShadow:'0 4px 16px rgba(139,92,246,0.4)',
          }}>
            {user?.name?.[0]?.toUpperCase()}
          </button>
        </div>

        {/* Active token */}
        {active ? (
          <div className="a2" onClick={() => navigate(`/token/${active._id}`)} style={{
            borderRadius:24,padding:24,marginBottom:18,cursor:'pointer',
            background:'linear-gradient(135deg,#1a1040,#2d1b4e)',
            border:'1px solid rgba(139,92,246,0.3)',
            position:'relative',overflow:'hidden',
            boxShadow:'0 8px 32px rgba(139,92,246,0.2)',
            transition:'transform .2s,box-shadow .2s',
          }}>
            {/* Glow orb */}
            <div style={{ position:'absolute',top:-40,right:-40,width:140,height:140,borderRadius:'50%',background:'radial-gradient(circle,rgba(139,92,246,0.3),transparent 70%)' }}/>
            <div style={{ position:'absolute',bottom:-20,left:-20,width:100,height:100,borderRadius:'50%',background:'radial-gradient(circle,rgba(236,72,153,0.2),transparent 70%)' }}/>

            <div style={{ position:'relative',zIndex:1 }}>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:18 }}>
                <div>
                  <p style={{ color:'rgba(255,255,255,0.5)',fontSize:9,letterSpacing:2,textTransform:'uppercase',marginBottom:6,fontWeight:700 }}>Active Token</p>
                  <p style={{ color:'var(--white)',fontSize:64,fontWeight:800,fontFamily:'Syne,sans-serif',lineHeight:1,letterSpacing:-3 }}>
                    {String(active.tokenNumber).padStart(3,'0')}
                  </p>
                  <p style={{ color:'rgba(255,255,255,0.6)',fontSize:12,marginTop:8 }}>{active.office?.name}</p>
                </div>
                <div style={{
                  background: active.status==='serving' ? 'linear-gradient(135deg,#f59e0b,#ef4444)' : 'rgba(255,255,255,0.1)',
                  color: 'var(--white)',
                  fontSize:9,fontWeight:800,padding:'7px 14px',
                  borderRadius:20,letterSpacing:1,
                  boxShadow: active.status==='serving' ? '0 4px 16px rgba(245,158,11,0.4)' : 'none',
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
                  <div key={i.l} style={{ background:'rgba(0,0,0,0.3)',borderRadius:12,padding:'10px 12px',flex:1 }}>
                    <p style={{ color:'rgba(255,255,255,0.4)',fontSize:8,textTransform:'uppercase',letterSpacing:1,fontWeight:700 }}>{i.l}</p>
                    <p style={{ color:'var(--white)',fontSize:13,fontWeight:700,marginTop:4 }}>{i.v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="a2" style={{ border:'1px dashed rgba(139,92,246,0.3)',borderRadius:20,padding:22,textAlign:'center',marginBottom:18,background:'rgba(139,92,246,0.03)' }}>
            <p style={{ color:'var(--muted)',fontSize:13 }}>No active token — tap an office to book</p>
          </div>
        )}

        {/* City filter */}
        <div className="a3" style={{ display:'flex',gap:8,overflowX:'auto',paddingBottom:4,scrollbarWidth:'none',marginBottom:2 }}>
          {cities.map(c => (
            <button key={c} className={`fpill ${city===c?'on':''}`} onClick={() => setCity(c)}>{c}</button>
          ))}
        </div>

        <p className="label a3">{filtered.length} {city!=='All'?city+' ':''} offices</p>

        {offices.length===0 && (
          <div style={{ textAlign:'center',padding:'28px 0' }}>
            <p style={{ color:'var(--muted)',fontSize:13,marginBottom:14 }}>No offices loaded</p>
            <button className="btn-outline" style={{ width:'auto',padding:'10px 24px' }}
              onClick={() => api.post('/offices/seed/demo').then(()=>window.location.reload())}>
              Load demo data
            </button>
          </div>
        )}

        {filtered.map((o, i) => {
          const inQ = Math.max(0, o.lastToken - o.currentToken);
          const wait = inQ * 5;
          const waitColor = wait<15?'var(--green)':wait<40?'var(--amber)':'var(--red)';
          const gradMap = { Rohtak:'linear-gradient(135deg,rgba(139,92,246,0.08),rgba(236,72,153,0.05))', Delhi:'linear-gradient(135deg,rgba(6,182,212,0.08),rgba(139,92,246,0.05))', Gurugram:'linear-gradient(135deg,rgba(245,158,11,0.08),rgba(239,68,68,0.05))' };
          return (
            <div key={o._id} className="card card-hover a3" style={{ animationDelay:`${i*.06}s`, background:gradMap[o.city]||'var(--bg2)' }}
              onClick={() => navigate(`/book/${o._id}`)}>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start' }}>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ display:'flex',alignItems:'center',gap:6,marginBottom:6 }}>
                    <span style={{ background:'rgba(139,92,246,0.15)',color:'var(--violet2)',fontSize:9,fontWeight:800,padding:'3px 8px',borderRadius:6,letterSpacing:.8,textTransform:'uppercase' }}>{o.city}</span>
                  </div>
                  <h3 style={{ fontSize:14,marginBottom:6,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontWeight:700 }}>{o.name}</h3>
                  <p style={{ color:'var(--muted)',fontSize:11,marginBottom:10 }}>{o.address}</p>
                  <div style={{ display:'flex',alignItems:'center',gap:7 }}>
                    <span className="dot"/>
                    <span style={{ color:'var(--green)',fontSize:10,fontWeight:700 }}>Serving #{o.currentToken}</span>
                    <span style={{ color:'var(--muted)',fontSize:10 }}>· {inQ} waiting</span>
                  </div>
                </div>
                <div style={{ textAlign:'right',flexShrink:0,marginLeft:14 }}>
                  <p style={{ color:waitColor,fontSize:26,fontWeight:800,fontFamily:'Syne,sans-serif',letterSpacing:-1 }}>
                    {wait}<span style={{ fontSize:11,color:'var(--muted)',fontWeight:500 }}> min</span>
                  </p>
                  <div style={{ marginTop:8,background:'linear-gradient(135deg,#8b5cf6,#ec4899)',borderRadius:10,padding:'6px 14px',fontSize:11,color:'var(--white)',fontWeight:700,cursor:'pointer',boxShadow:'0 4px 12px rgba(139,92,246,0.3)' }}>
                    Book →
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div style={{ height:10 }}/>
      </div>

      <nav className="bottom-nav">
        <Link to="/" className="bnav-item active">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M2 9.5L10 3l8 6.5V17a1 1 0 01-1 1H3a1 1 0 01-1-1V9.5z" stroke="white" strokeWidth="1.8" fill="none"/><path d="M7 18v-5h6v5" stroke="white" strokeWidth="1.8"/></svg>
          <span className="bnav-label">Home</span>
        </Link>
        <Link to={active?`/token/${active._id}`:'/'}  className="bnav-item">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="1" width="14" height="18" rx="2.5" stroke="white" strokeWidth="1.8"/><path d="M7 7h6M7 11h4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
          <span className="bnav-label">Token</span>
        </Link>
        <Link to="/profile" className="bnav-item">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="3.5" stroke="white" strokeWidth="1.8"/><path d="M3 17c0-3.866 3.134-6 7-6s7 2.134 7 6" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
          <span className="bnav-label">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
