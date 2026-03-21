import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api, { getSocket } from '../api';

export default function DisplayBoard() {
  const { officeId } = useParams();
  const [office, setOffice] = useState(null);
  const [queue, setQueue] = useState([]);
  const [prevToken, setPrevToken] = useState(null);
  const [flash, setFlash] = useState(false);
  const [time, setTime] = useState(new Date());
  const synthRef = useRef(null);

  const speak = useCallback((text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'en-IN';
    utt.rate = 0.85;
    utt.pitch = 1.1;
    utt.volume = 1;
    window.speechSynthesis.speak(utt);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const id = officeId || localStorage.getItem('sq_display_office');
      if (!id) return;
      const { data } = await api.get(`/offices/${id}`);
      setOffice(data);
    } catch {}
  }, [officeId]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!office) return;
    const socket = getSocket();
    const id = officeId || localStorage.getItem('sq_display_office');
    socket.emit('join_office', id);
    socket.on('queue_update', (data) => {
      if (data.type === 'next_called') {
        fetchData();
        setFlash(true);
        setTimeout(() => setFlash(false), 3000);
        speak(`Now serving token number ${data.calledToken}. Token number ${data.calledToken}, please proceed to the counter.`);
      }
    });
    return () => socket.off('queue_update');
  }, [office, officeId, fetchData, speak]);

  useEffect(() => {
    if (office && prevToken !== null && office.currentToken !== prevToken) {
      setPrevToken(office.currentToken);
    } else if (office && prevToken === null) {
      setPrevToken(office.currentToken);
    }
  }, [office, prevToken]);

  const formatTime = (d) => d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  const formatDate = (d) => d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  // Office selector if no officeId
  const [offices, setOffices] = useState([]);
  const [selected, setSelected] = useState('');
  useEffect(() => {
    if (!officeId) api.get('/offices').then(r => setOffices(r.data)).catch(() => {});
  }, [officeId]);

  if (!officeId && !localStorage.getItem('sq_display_office')) {
    return (
      <div style={{ minHeight:'100vh',background:'#050505',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:24,fontFamily:'Syne,sans-serif' }}>
        <h1 style={{ color:'#fff',fontSize:32,fontWeight:800 }}>Select Office</h1>
        <select value={selected} onChange={e => setSelected(e.target.value)} style={{ background:'#1a1a1a',color:'#fff',border:'1px solid #333',borderRadius:12,padding:'12px 20px',fontSize:16,minWidth:300 }}>
          <option value="">Choose office...</option>
          {offices.map(o => <option key={o._id} value={o._id}>{o.name}</option>)}
        </select>
        <button onClick={() => { localStorage.setItem('sq_display_office', selected); window.location.reload(); }}
          style={{ background:'linear-gradient(135deg,#8b5cf6,#ec4899)',color:'#fff',border:'none',borderRadius:12,padding:'13px 32px',fontSize:16,fontWeight:700,cursor:'pointer' }}>
          Open Display Board →
        </button>
      </div>
    );
  }

  if (!office) return (
    <div style={{ minHeight:'100vh',background:'#050505',display:'flex',alignItems:'center',justifyContent:'center' }}>
      <div style={{ width:40,height:40,border:'3px solid rgba(139,92,246,0.3)',borderTopColor:'#8b5cf6',borderRadius:'50%',animation:'spin .8s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const nextTokens = [];
  for (let i = 1; i <= 4; i++) {
    nextTokens.push(office.currentToken + i);
  }

  return (
    <div style={{
      minHeight:'100vh',background:'#050505',
      fontFamily:'Syne,sans-serif',overflow:'hidden',
      position:'relative',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes flashIn{0%{opacity:0;transform:scale(0.85)}30%{opacity:1;transform:scale(1.05)}100%{transform:scale(1);opacity:1}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes gradMove{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        @keyframes ripple{0%{transform:scale(1);opacity:.6}100%{transform:scale(2.5);opacity:0}}
        .token-num{font-size:22vw;font-weight:800;line-height:1;letter-spacing:-4px;animation:${flash?'flashIn .6s cubic-bezier(.4,0,.2,1)':'none'}}
        .next-card{transition:all .3s cubic-bezier(.4,0,.2,1)}
        .next-card:hover{transform:scale(1.03)}
      `}</style>

      {/* Ambient background blobs */}
      <div style={{ position:'fixed',top:-200,left:-200,width:600,height:600,borderRadius:'50%',background:'radial-gradient(circle,rgba(139,92,246,0.08),transparent 70%)',pointerEvents:'none' }}/>
      <div style={{ position:'fixed',bottom:-200,right:-200,width:500,height:500,borderRadius:'50%',background:'radial-gradient(circle,rgba(236,72,153,0.06),transparent 70%)',pointerEvents:'none' }}/>

      {/* Top bar */}
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'24px 48px',borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display:'flex',alignItems:'center',gap:16 }}>
          <div style={{ width:44,height:44,borderRadius:14,background:'linear-gradient(135deg,#8b5cf6,#ec4899)',display:'flex',alignItems:'center',justifyContent:'center' }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M3 6h16M3 11h11M3 16h7" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
          </div>
          <div>
            <p style={{ color:'rgba(255,255,255,0.5)',fontSize:11,letterSpacing:2,textTransform:'uppercase',fontWeight:600 }}>Smart Queue</p>
            <p style={{ color:'#fff',fontSize:18,fontWeight:700 }}>{office.name}</p>
          </div>
        </div>
        <div style={{ textAlign:'right' }}>
          <p style={{ color:'#fff',fontSize:28,fontWeight:800,fontFamily:'Syne,sans-serif',letterSpacing:-1 }}>{formatTime(time)}</p>
          <p style={{ color:'rgba(255,255,255,0.4)',fontSize:13,marginTop:2 }}>{formatDate(time)}</p>
        </div>
        <div style={{ display:'flex',alignItems:'center',gap:8 }}>
          <div style={{ width:8,height:8,borderRadius:'50%',background:'#22c55e',animation:'pulse 2s infinite' }}/>
          <span style={{ color:'#22c55e',fontSize:13,fontWeight:700 }}>{office.isOpen ? 'OPEN' : 'CLOSED'}</span>
        </div>
      </div>

      {/* Main content */}
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:0,height:'calc(100vh - 97px)' }}>

        {/* LEFT — Now Serving */}
        <div style={{
          display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
          padding:'40px',borderRight:'1px solid rgba(255,255,255,0.06)',
          background: flash ? 'rgba(139,92,246,0.05)' : 'transparent',
          transition:'background 1s',
        }}>
          <p style={{ color:'rgba(255,255,255,0.4)',fontSize:13,letterSpacing:3,textTransform:'uppercase',fontWeight:700,marginBottom:24 }}>NOW SERVING</p>

          {/* Ripple rings */}
          <div style={{ position:'relative',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:20 }}>
            {flash && (
              <>
                <div style={{ position:'absolute',width:300,height:300,borderRadius:'50%',border:'2px solid rgba(139,92,246,0.4)',animation:'ripple 1.2s ease-out' }}/>
                <div style={{ position:'absolute',width:300,height:300,borderRadius:'50%',border:'2px solid rgba(236,72,153,0.3)',animation:'ripple 1.2s .3s ease-out' }}/>
              </>
            )}
            <p className="token-num" style={{
              background:'linear-gradient(135deg,#8b5cf6,#ec4899,#f59e0b)',
              WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
              backgroundClip:'text',backgroundSize:'200% 200%',
              animation: flash ? 'flashIn .6s cubic-bezier(.4,0,.2,1), gradMove 3s ease infinite' : 'gradMove 3s ease infinite',
            }}>
              {String(office.currentToken).padStart(3, '0')}
            </p>
          </div>

          <p style={{ color:'rgba(255,255,255,0.5)',fontSize:20,fontWeight:500,marginBottom:8 }}>Please proceed to the counter</p>
          <div style={{ display:'flex',alignItems:'center',gap:10,marginTop:8 }}>
            <div style={{ width:8,height:8,borderRadius:'50%',background:'#22c55e',animation:'pulse 1.5s infinite' }}/>
            <span style={{ color:'#22c55e',fontSize:14,fontWeight:700,letterSpacing:1 }}>LIVE</span>
          </div>

          {/* Stats row */}
          <div style={{ display:'flex',gap:20,marginTop:40 }}>
            {[
              {l:'In Queue', v:Math.max(0,office.lastToken-office.currentToken), c:'#8b5cf6'},
              {l:'Est. Wait', v:`~${Math.max(0,office.lastToken-office.currentToken)*5}m`, c:'#ec4899'},
              {l:'Tokens Today', v:office.lastToken, c:'#f59e0b'},
            ].map(s => (
              <div key={s.l} style={{ background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16,padding:'16px 24px',textAlign:'center',minWidth:120 }}>
                <p style={{ color:s.c,fontSize:28,fontWeight:800 }}>{s.v}</p>
                <p style={{ color:'rgba(255,255,255,0.4)',fontSize:11,fontWeight:600,letterSpacing:1,textTransform:'uppercase',marginTop:4 }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Up Next */}
        <div style={{ display:'flex',flexDirection:'column',padding:'40px',justifyContent:'center' }}>
          <p style={{ color:'rgba(255,255,255,0.4)',fontSize:13,letterSpacing:3,textTransform:'uppercase',fontWeight:700,marginBottom:28 }}>UP NEXT</p>

          <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
            {nextTokens.map((tok, i) => (
              <div key={tok} className="next-card" style={{
                background: i===0 ? 'rgba(139,92,246,0.12)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${i===0?'rgba(139,92,246,0.35)':'rgba(255,255,255,0.07)'}`,
                borderRadius:18,padding:'20px 28px',
                display:'flex',alignItems:'center',justifyContent:'space-between',
              }}>
                <div style={{ display:'flex',alignItems:'center',gap:16 }}>
                  <div style={{ width:10,height:10,borderRadius:'50%',background:i===0?'#8b5cf6':'rgba(255,255,255,0.2)' }}/>
                  <p style={{ color: i===0?'#fff':'rgba(255,255,255,0.5)',fontSize:32,fontWeight:800,letterSpacing:-1 }}>
                    {String(tok).padStart(3,'0')}
                  </p>
                </div>
                <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                  <p style={{ color:'rgba(255,255,255,0.3)',fontSize:13,fontWeight:600 }}>~{(i+1)*5} min</p>
                  {i===0 && <span style={{ background:'rgba(139,92,246,0.2)',color:'#a78bfa',fontSize:10,fontWeight:800,padding:'4px 12px',borderRadius:20,letterSpacing:1 }}>NEXT</span>}
                </div>
              </div>
            ))}
          </div>

          {/* QR hint */}
          <div style={{ marginTop:'auto',paddingTop:32,borderTop:'1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ color:'rgba(255,255,255,0.3)',fontSize:13,fontWeight:500,textAlign:'center' }}>
              📱 Book your token at{' '}
              <span style={{ color:'#a78bfa',fontWeight:700 }}>frontend-three-green-27.vercel.app</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
