import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { getSocket } from '../api';
import '../admin.css';

function MiniBar({ data, labels, color='#8b5cf6' }) {
  const ref = useRef();
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !data.length) return;
    const W = canvas.offsetWidth, H = canvas.offsetHeight;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,W,H);
    const max = Math.max(...data,1);
    const bW = (W/data.length)*0.55, gap = (W/data.length)*0.45;
    data.forEach((v,i) => {
      const x = i*(bW+gap)+gap/2;
      const h = (v/max)*(H-28);
      const grad = ctx.createLinearGradient(x,H-h-20,x,H-20);
      grad.addColorStop(0, color);
      grad.addColorStop(1, color+'44');
      ctx.fillStyle = grad;
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.roundRect(x, H-h-20, bW, h, 4);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#666';
      ctx.font = '9px Inter,sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(labels[i], x+bW/2, H-4);
      if (v>0) {
        ctx.fillStyle = '#aaa';
        ctx.font = '10px Inter,sans-serif';
        ctx.fillText(v, x+bW/2, H-h-24);
      }
    });
  }, [data, labels, color]);
  return <canvas ref={ref} style={{ width:'100%',height:'100%',display:'block' }}/>;
}

export default function AdminDash() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calling, setCalling] = useState(false);
  const [page, setPage] = useState('dashboard');
  const [callAnim, setCallAnim] = useState(false);

  const speak = useCallback((text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'en-IN'; utt.rate = 0.85; utt.volume = 1;
    window.speechSynthesis.speak(utt);
  }, []);

  const fetchDash = useCallback(async () => {
    try {
      const { data: res } = await api.get('/admin/dashboard');
      setData(res);
    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 401) navigate('/login');
    } finally { setLoading(false); }
  }, [navigate]);

  useEffect(() => { fetchDash(); }, [fetchDash]);

  useEffect(() => {
    if (!user?.officeId) return;
    const socket = getSocket();
    socket.emit('join_admin', user.officeId);
    socket.on('dashboard_update', fetchDash);
    socket.on('queue_update', fetchDash);
    return () => { socket.off('dashboard_update', fetchDash); socket.off('queue_update', fetchDash); };
  }, [user?.officeId, fetchDash]);

  const callNext = async () => {
    setCalling(true); setCallAnim(true);
    setTimeout(() => setCallAnim(false), 1000);
    try {
      const { data: res } = await api.post('/admin/call-next');
      if (res.called) {
        speak(`Now calling token number ${res.called.tokenNumber}. Token ${res.called.tokenNumber}, please proceed to the counter.`);
      }
      await fetchDash();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
    finally { setCalling(false); }
  };

  const markNoShow = async (id) => {
    try { await api.patch(`/admin/token/${id}/no-show`); await fetchDash(); }
    catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const toggleOffice = async () => {
    try { await api.patch('/admin/office/toggle'); await fetchDash(); }
    catch { alert('Error'); }
  };

  if (loading) return <div className="admin-loading"><div className="admin-spinner"/><span style={{color:'#666',fontSize:13}}>Loading dashboard...</span></div>;
  if (!data)   return <div className="admin-loading">No data</div>;

  const { office, stats, queue } = data;
  const serving = queue.find(t => t.status==='serving');
  const waiting = queue.filter(t => t.status==='waiting');

  const hours   = ['9am','10am','11am','12pm','1pm','2pm','3pm','4pm'];
  const hourlyQ = [4,12,18,22,15,9,14,stats.waiting||6];
  const hourlyD = [2,8,14,19,12,7,11,stats.done||4];

  const navItems = [
    { id:'dashboard', label:'Dashboard', icon:<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor"/><rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".5"/><rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".5"/><rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor"/></svg> },
    { id:'queue',     label:'Live Queue', icon:<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h8M2 12h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> },
    { id:'analytics', label:'Analytics',  icon:<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 14l4-5 3 3 5-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
    { id:'display',   label:'Display Board', icon:<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="2" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M5 14h6M8 12v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> },
  ];

  return (
    <div className="admin-root" style={{ display:'flex' }}>

      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <div style={{ width:38,height:38,borderRadius:11,background:'linear-gradient(135deg,#8b5cf6,#ec4899)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:12 }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 5h12M3 9h8M3 13h5" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
          </div>
          <h1>SmartQueue</h1>
          <p>ADMIN PORTAL</p>
        </div>

        <nav className="admin-nav">
          <p className="admin-nav-label">Navigation</p>
          {navItems.map(nav => (
            <button key={nav.id} className={`admin-nav-item ${page===nav.id?'active':''}`}
              onClick={() => nav.id==='display' ? window.open(`/display/${user.officeId}`,'_blank') : setPage(nav.id)}
              style={{ border:'none',width:'100%',textAlign:'left',cursor:'pointer' }}>
              {nav.icon}{nav.label}
              {nav.id==='display' && <span style={{ marginLeft:'auto',fontSize:9,opacity:.5 }}>↗</span>}
            </button>
          ))}

          <p className="admin-nav-label" style={{ marginTop:16 }}>Office</p>
          <div style={{ padding:'8px 12px' }}>
            <div style={{ background:'rgba(255,255,255,0.04)',borderRadius:10,padding:12 }}>
              <p style={{ color:'#fff',fontSize:12,fontWeight:600,marginBottom:4 }}>{office.name}</p>
              <p style={{ color:'rgba(255,255,255,0.35)',fontSize:10 }}>{office.city}</p>
              <div style={{ display:'flex',alignItems:'center',gap:6,marginTop:10 }}>
                <div style={{ width:6,height:6,borderRadius:'50%',background:office.isOpen?'#22c55e':'#ef4444',animation:'pulse 2s infinite' }}/>
                <span style={{ color:office.isOpen?'#22c55e':'#ef4444',fontSize:11,fontWeight:600 }}>{office.isOpen?'Open':'Closed'}</span>
                <button onClick={toggleOffice} style={{ marginLeft:'auto',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.4)',fontSize:10,padding:'3px 9px',borderRadius:6,cursor:'pointer' }}>Toggle</button>
              </div>
            </div>
          </div>
        </nav>

        <div className="admin-sidebar-footer">
          <div style={{ display:'flex',alignItems:'center',gap:8,padding:'4px 8px' }}>
            <div style={{ width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#8b5cf6,#ec4899)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:800,fontSize:13,flexShrink:0 }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ minWidth:0 }}>
              <p style={{ color:'#fff',fontSize:12,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{user?.name}</p>
              <p style={{ color:'rgba(255,255,255,0.3)',fontSize:10 }}>Admin</p>
            </div>
            <button onClick={logout} style={{ marginLeft:'auto',background:'none',border:'none',color:'rgba(255,255,255,0.3)',cursor:'pointer',fontSize:11,flexShrink:0 }}>Out</button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="admin-main" style={{ flex:1 }}>

        {/* DASHBOARD */}
        {page==='dashboard' && (
          <>
            <div className="admin-topbar">
              <div>
                <h2 style={{ fontFamily:'Syne,sans-serif' }}>Dashboard</h2>
                <p>{new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}</p>
              </div>
              <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                <div className="admin-status-pill">
                  <div className="admin-status-dot" style={{ background:office.isOpen?'#22c55e':'#ef4444' }}/>
                  {office.isOpen?'Office Open':'Office Closed'}
                </div>
                <button className="admin-btn-ghost" onClick={fetchDash}>↻ Refresh</button>
              </div>
            </div>

            {/* Stats */}
            <div className="admin-stats">
              {[
                { label:'Now Serving', val:office.currentToken, sub:'Current token', color:'#8b5cf6' },
                { label:'In Queue',    val:stats.waiting,        sub:'Waiting',       color:'#ec4899' },
                { label:'Served Today',val:stats.done,           sub:'Completed',     color:'#22c55e' },
                { label:'No-shows',    val:stats.noShow,         sub:'Today',         color:'#ef4444' },
              ].map(s => (
                <div className="admin-stat" key={s.label}>
                  <div className="admin-stat-accent" style={{ background:s.color }}/>
                  <p className="admin-stat-label">{s.label}</p>
                  <p className="admin-stat-val" style={{ color:s.color,fontFamily:'Syne,sans-serif' }}>{s.val}</p>
                  <p className="admin-stat-sub">{s.sub}</p>
                </div>
              ))}
            </div>

            <div className="admin-grid">
              <div>
                {/* CALL NEXT BUTTON */}
                <button
                  onClick={callNext}
                  disabled={calling||stats.waiting===0}
                  style={{
                    width:'100%',border:'none',borderRadius:14,padding:18,
                    background: calling||stats.waiting===0 ? '#1a1a1a' : 'linear-gradient(135deg,#8b5cf6,#ec4899)',
                    color:'#fff',fontSize:16,fontWeight:800,cursor:calling||stats.waiting===0?'not-allowed':'pointer',
                    fontFamily:'Syne,sans-serif',marginBottom:16,
                    boxShadow: calling||stats.waiting===0?'none':'0 8px 32px rgba(139,92,246,0.4)',
                    transition:'all .2s',transform:callAnim?'scale(0.97)':'scale(1)',
                    display:'flex',alignItems:'center',justifyContent:'center',gap:10,
                  }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10h12M10 4l6 6-6 6" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
                  {calling ? 'Calling...' : `Call Next Token →`}
                </button>

                {/* Serving */}
                {serving ? (
                  <div style={{ border:'2px solid rgba(139,92,246,0.4)',borderRadius:16,padding:18,background:'rgba(139,92,246,0.05)',marginBottom:16 }}>
                    <p style={{ color:'#666',fontSize:10,textTransform:'uppercase',letterSpacing:.8,marginBottom:10,fontWeight:700 }}>Currently Serving</p>
                    <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start' }}>
                      <div>
                        <p style={{ fontFamily:'Syne,sans-serif',color:'#8b5cf6',fontSize:40,fontWeight:800,lineHeight:1 }}>#{String(serving.tokenNumber).padStart(3,'0')}</p>
                        <p style={{ fontSize:14,fontWeight:600,marginTop:6 }}>{serving.user?.name||'Citizen'}</p>
                        <p style={{ color:'#6b7280',fontSize:12,marginTop:3 }}>{serving.service}</p>
                      </div>
                      <button className="admin-btn-danger" onClick={()=>markNoShow(serving._id)}>No-show</button>
                    </div>
                  </div>
                ) : (
                  <div className="admin-panel" style={{ padding:20,textAlign:'center',marginBottom:16 }}>
                    <p style={{ color:'#9ca3af',fontSize:13 }}>No token currently serving</p>
                  </div>
                )}

                {/* Next up */}
                {waiting.length>0 && (
                  <div className="admin-panel">
                    <div className="admin-panel-header">
                      <p className="admin-panel-title">Next in queue</p>
                      <span className="ab ab-waiting">{waiting.length} waiting</span>
                    </div>
                    {waiting.slice(0,4).map((t,i)=>(
                      <div key={t._id} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 20px',borderBottom:i<3?'1px solid #e2e6ea':'none' }}>
                        <div style={{ display:'flex',alignItems:'center',gap:12 }}>
                          <p style={{ fontFamily:'Syne,sans-serif',color:i===0?'#8b5cf6':'#374151',fontSize:18,fontWeight:800,minWidth:44 }}>#{String(t.tokenNumber).padStart(3,'0')}</p>
                          <div>
                            <p style={{ fontSize:13,fontWeight:600 }}>{t.user?.name||'Citizen'}</p>
                            <p style={{ color:'#9ca3af',fontSize:11 }}>{t.service}</p>
                          </div>
                        </div>
                        <span className={`ab ${i===0?'ab-serving':'ab-waiting'}`}>{i===0?'Next':'#'+(i+1)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right column */}
              <div>
                <div className="admin-panel" style={{ marginBottom:16 }}>
                  <div className="admin-panel-header">
                    <p className="admin-panel-title">Today's breakdown</p>
                  </div>
                  <div className="admin-panel-body" style={{ display:'flex',alignItems:'center',gap:20 }}>
                    <svg width="120" height="120" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="44" fill="none" stroke="#e2e6ea" strokeWidth="14"/>
                      {[
                        {v:stats.done,    c:'#8b5cf6'},
                        {v:stats.waiting, c:'#ec4899'},
                        {v:stats.noShow,  c:'#ef4444'},
                      ].reduce((acc,sl,i,arr) => {
                        const total = arr.reduce((s,x)=>s+x.v,0)||1;
                        const C2 = 2*Math.PI*44;
                        const pct = sl.v/total;
                        const offset = -acc.offset*C2/(2*Math.PI)*(2*Math.PI);
                        acc.els.push(
                          <circle key={i} cx="60" cy="60" r="44" fill="none" stroke={sl.c} strokeWidth="14"
                            strokeDasharray={`${C2*pct} ${C2*(1-pct)}`}
                            strokeDashoffset={-acc.offset*C2}
                            strokeLinecap="round"
                            style={{ transform:`rotate(${acc.offset*360-90}deg)`,transformOrigin:'60px 60px',transition:'stroke-dasharray .8s ease' }}
                          />
                        );
                        acc.offset += pct;
                        return acc;
                      },{els:[],offset:0}).els}
                      <text x="60" y="55" textAnchor="middle" fontSize="20" fontFamily="Syne,sans-serif" fontWeight="800" fill="#111827">{stats.done+stats.waiting+stats.noShow}</text>
                      <text x="60" y="70" textAnchor="middle" fontSize="9" fill="#6b7280" fontFamily="Inter,sans-serif">TOTAL</text>
                    </svg>
                    <div style={{ flex:1 }}>
                      {[
                        {l:'Served',  v:stats.done,    c:'#8b5cf6'},
                        {l:'Waiting', v:stats.waiting, c:'#ec4899'},
                        {l:'No-show', v:stats.noShow,  c:'#ef4444'},
                      ].map(s=>(
                        <div key={s.l} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10 }}>
                          <div style={{ display:'flex',alignItems:'center',gap:7 }}>
                            <div style={{ width:8,height:8,borderRadius:'50%',background:s.c }}/>
                            <span style={{ fontSize:12,color:'#374151' }}>{s.l}</span>
                          </div>
                          <span style={{ fontSize:14,fontWeight:700,color:'#111827',fontFamily:'Syne,sans-serif' }}>{s.v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="admin-panel">
                  <div className="admin-panel-header"><p className="admin-panel-title">Performance</p></div>
                  <div className="admin-panel-body">
                    {[
                      {k:'Avg service time', v:`${stats.avgServiceMin||5} min`},
                      {k:'Queue length',      v:`${stats.waiting} people`},
                      {k:'Tokens issued',     v:`${office.lastToken}`},
                      {k:'Completion rate',   v:stats.done+stats.noShow>0?`${Math.round((stats.done/(stats.done+stats.noShow))*100)}%`:'—'},
                    ].map(row=>(
                      <div key={row.k} style={{ display:'flex',justifyContent:'space-between',padding:'9px 0',borderBottom:'1px solid #f3f4f6' }}>
                        <span style={{ color:'#6b7280',fontSize:13 }}>{row.k}</span>
                        <span style={{ fontSize:13,fontWeight:700,fontFamily:'Syne,sans-serif' }}>{row.v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* QUEUE PAGE */}
        {page==='queue' && (
          <>
            <div className="admin-topbar">
              <div><h2 style={{ fontFamily:'Syne,sans-serif' }}>Live Queue</h2><p>{stats.waiting} waiting · serving #{office.currentToken}</p></div>
              <button onClick={callNext} disabled={calling||stats.waiting===0} style={{
                background:calling||stats.waiting===0?'#ddd':'linear-gradient(135deg,#8b5cf6,#ec4899)',
                color:calling||stats.waiting===0?'#999':'#fff',border:'none',borderRadius:12,
                padding:'11px 24px',fontSize:13,fontWeight:700,cursor:calling||stats.waiting===0?'not-allowed':'pointer',fontFamily:'Syne,sans-serif',
              }}>
                {calling?'Calling...':'Call Next →'}
              </button>
            </div>
            {serving && (
              <div style={{ border:'2px solid rgba(139,92,246,0.4)',borderRadius:16,padding:18,background:'rgba(139,92,246,0.04)',marginBottom:20,display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                <div style={{ display:'flex',alignItems:'center',gap:16 }}>
                  <p style={{ fontFamily:'Syne,sans-serif',color:'#8b5cf6',fontSize:44,fontWeight:800,lineHeight:1 }}>#{String(serving.tokenNumber).padStart(3,'0')}</p>
                  <div>
                    <p style={{ fontSize:15,fontWeight:600 }}>{serving.user?.name||'Citizen'}</p>
                    <p style={{ color:'#6b7280',fontSize:13,marginTop:2 }}>{serving.service}</p>
                  </div>
                </div>
                <button className="admin-btn-danger" style={{ padding:'9px 18px' }} onClick={()=>markNoShow(serving._id)}>No-show</button>
              </div>
            )}
            <div className="admin-panel">
              <div className="admin-panel-header"><p className="admin-panel-title">Queue list</p><span style={{ color:'#6b7280',fontSize:12 }}>{waiting.length} waiting</span></div>
              {waiting.length===0?<p className="admin-empty">Queue is empty</p>:(
                <table className="admin-table">
                  <thead><tr><th>Token</th><th>Name</th><th>Service</th><th>Status</th></tr></thead>
                  <tbody>
                    {waiting.map((t,i)=>(
                      <tr key={t._id}>
                        <td style={{ fontFamily:'Syne,sans-serif',color:'#8b5cf6',fontWeight:800,fontSize:16 }}>#{String(t.tokenNumber).padStart(3,'0')}</td>
                        <td style={{ fontWeight:600 }}>{t.user?.name||'Citizen'}</td>
                        <td style={{ color:'#6b7280' }}>{t.service}</td>
                        <td><span className={`ab ${i===0?'ab-serving':'ab-waiting'}`}>{i===0?'Next':'Waiting'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* ANALYTICS */}
        {page==='analytics' && (
          <>
            <div className="admin-topbar"><div><h2 style={{ fontFamily:'Syne,sans-serif' }}>Analytics</h2><p>Today's performance overview</p></div></div>
            <div className="admin-grid" style={{ marginBottom:20 }}>
              <div className="admin-panel">
                <div className="admin-panel-header"><p className="admin-panel-title">Hourly queue load</p></div>
                <div className="admin-panel-body"><div style={{ height:180 }}><MiniBar data={hourlyQ} labels={hours} color="#8b5cf6"/></div></div>
              </div>
              <div className="admin-panel">
                <div className="admin-panel-header"><p className="admin-panel-title">Tokens served per hour</p></div>
                <div className="admin-panel-body"><div style={{ height:180 }}><MiniBar data={hourlyD} labels={hours} color="#ec4899"/></div></div>
              </div>
            </div>
            <div className="admin-panel">
              <div className="admin-panel-header"><p className="admin-panel-title">Performance summary</p></div>
              <table className="admin-table">
                <thead><tr><th>Metric</th><th>Value</th><th>Target</th><th>Status</th></tr></thead>
                <tbody>
                  {[
                    {m:'Avg wait time',    v:`${(stats.waiting*5)||12} min`, b:'< 20 min',  ok:(stats.waiting*5||12)<20},
                    {m:'Tokens served',    v:stats.done,                     b:'> 20/day',  ok:stats.done>=20},
                    {m:'No-show rate',     v:`${stats.noShow}/${stats.done+stats.noShow||1}`, b:'< 10%', ok:stats.noShow/(stats.done+stats.noShow||1)<0.1},
                    {m:'Avg service time', v:`${stats.avgServiceMin||5} min`, b:'< 15 min',  ok:(stats.avgServiceMin||5)<15},
                  ].map(r=>(
                    <tr key={r.m}>
                      <td style={{ fontWeight:600 }}>{r.m}</td>
                      <td style={{ fontFamily:'Syne,sans-serif',fontWeight:700 }}>{r.v}</td>
                      <td style={{ color:'#9ca3af',fontSize:12 }}>{r.b}</td>
                      <td><span className={`ab ${r.ok?'ab-done':'ab-nshow'}`}>{r.ok?'✓ Good':'⚠ Check'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
