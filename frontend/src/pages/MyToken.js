import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { getSocket } from '../api';

export default function MyToken() {
  const { tokenId } = useParams();
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [justUpdated, setJustUpdated] = useState(false);
  const prevAhead = useRef(null);

  const speak = useCallback((text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'en-IN'; utt.rate = 0.9; utt.volume = 1;
    window.speechSynthesis.speak(utt);
  }, []);

  const fetchToken = useCallback(async () => {
    try {
      const { data } = await api.get(`/tokens/${tokenId}`);
      setToken(prev => {
        if (prev && data.status === 'serving' && prev.status !== 'serving') {
          speak('Your token is now being called. Please proceed to the counter immediately.');
          setJustUpdated(true);
          setTimeout(() => setJustUpdated(false), 3000);
        }
        if (prev && data.peopleAhead === 3 && prev.peopleAhead > 3) {
          speak('Alert! Only 3 people are ahead of you. Please make your way to the office now.');
        }
        return data;
      });
    } catch { navigate('/'); }
    finally { setLoading(false); }
  }, [tokenId, navigate, speak]);

  useEffect(() => { fetchToken(); }, [fetchToken]);

  useEffect(() => {
    if (!token?.office?._id) return;
    const socket = getSocket();
    socket.emit('join_office', token.office._id);
    socket.on('queue_update', d => {
      if (d.type === 'next_called') {
        fetchToken();
        setJustUpdated(true);
        setTimeout(() => setJustUpdated(false), 2000);
      }
    });
    return () => socket.off('queue_update');
  }, [token?.office?._id, fetchToken]);

  const cancel = async () => {
    if (!window.confirm('Cancel your token?')) return;
    setCancelling(true);
    try { await api.patch(`/tokens/${tokenId}/cancel`); navigate('/'); }
    catch (err) { alert(err.response?.data?.message || 'Cannot cancel'); setCancelling(false); }
  };

  if (loading) return (
    <div className="loading">
      <div className="spin"/>
      <p style={{ color:'var(--muted)',fontSize:13,marginTop:0 }}>Loading your token...</p>
    </div>
  );
  if (!token) return <div className="loading">Not found</div>;

  const isMyTurn = token.status === 'serving';
  const isDone   = ['done','cancelled','no_show'].includes(token.status);
  const pct      = token.office ? Math.min(100,Math.round((token.office.currentToken/token.tokenNumber)*100)) : 0;
  const R=65, C=2*Math.PI*R;
  const ahead = token.peopleAhead;

  // Position label
  const posLabel = ahead === 0 ? '🎉 You\'re next!' : ahead <= 3 ? `⚡ Almost there!` : `#${ahead + 1} in queue`;
  const posColor = ahead === 0 ? '#f59e0b' : ahead <= 3 ? '#8b5cf6' : 'var(--muted)';

  return (
    <div className="app-shell">
      {/* Animated background */}
      <div style={{ position:'fixed',top:0,left:0,right:0,bottom:0,pointerEvents:'none',zIndex:0 }}>
        <div style={{ position:'absolute',top:-150,right:-150,width:400,height:400,borderRadius:'50%',background:`radial-gradient(circle,${isMyTurn?'rgba(245,158,11,0.12)':'rgba(139,92,246,0.08)'},transparent 70%)`,transition:'background 1s' }}/>
        <div style={{ position:'absolute',bottom:-100,left:-100,width:300,height:300,borderRadius:'50%',background:'radial-gradient(circle,rgba(236,72,153,0.06),transparent 70%)' }}/>
      </div>

      <div className="screen" style={{ position:'relative',zIndex:1 }}>
        <button className="back-btn" onClick={() => navigate('/')}>← Home</button>

        {/* YOUR TURN BANNER */}
        {isMyTurn && (
          <div style={{
            borderRadius:20,padding:'20px 24px',textAlign:'center',marginBottom:20,
            background:'linear-gradient(135deg,#f59e0b,#ef4444)',
            boxShadow:'0 8px 40px rgba(245,158,11,0.45)',
            animation:'flashIn .5s cubic-bezier(.4,0,.2,1)',
          }}>
            <p style={{ color:'#fff',fontSize:22,fontWeight:800,fontFamily:'Syne,sans-serif',marginBottom:4 }}>🎉 It's Your Turn!</p>
            <p style={{ color:'rgba(255,255,255,0.85)',fontSize:14 }}>Please proceed to the counter immediately</p>
          </div>
        )}

        {/* 3 AHEAD ALERT */}
        {!isDone && !isMyTurn && ahead <= 3 && ahead > 0 && (
          <div style={{
            borderRadius:16,padding:'14px 18px',textAlign:'center',marginBottom:16,
            background:'rgba(139,92,246,0.12)',border:'1px solid rgba(139,92,246,0.35)',
          }}>
            <p style={{ color:'#a78bfa',fontSize:14,fontWeight:700 }}>⚡ Only {ahead} {ahead===1?'person':'people'} ahead — Head to the office now!</p>
          </div>
        )}

        {/* TOKEN RING */}
        <div style={{ textAlign:'center',marginBottom:10 }}>
          <p style={{ color:'var(--muted)',fontSize:10,letterSpacing:2,textTransform:'uppercase',marginBottom:18,fontWeight:700 }}>Your Token</p>

          <div style={{ position:'relative',width:180,height:180,margin:'0 auto 16px' }}>
            {/* Pulse rings when updated */}
            {justUpdated && (
              <>
                <div style={{ position:'absolute',inset:-20,borderRadius:'50%',border:'2px solid rgba(139,92,246,0.4)',animation:'ripple 1s ease-out' }}/>
                <div style={{ position:'absolute',inset:-20,borderRadius:'50%',border:'2px solid rgba(236,72,153,0.3)',animation:'ripple 1s .25s ease-out' }}/>
              </>
            )}

            <svg width="180" height="180" viewBox="0 0 180 180" style={{ transform:'rotate(-90deg)',position:'relative',zIndex:1 }}>
              <circle cx="90" cy="90" r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12"/>
              {/* Background track segments */}
              <circle cx="90" cy="90" r={R} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="12" strokeDasharray="4 8" strokeLinecap="round"/>
              <circle cx="90" cy="90" r={R} fill="none"
                stroke={isMyTurn ? 'url(#fireGrad)' : 'url(#violetGrad)'}
                strokeWidth="12" strokeLinecap="round"
                strokeDasharray={C} strokeDashoffset={C*(1-pct/100)}
                style={{ transition:'stroke-dashoffset 1.4s cubic-bezier(.4,0,.2,1)', filter:`drop-shadow(0 0 8px ${isMyTurn?'rgba(245,158,11,0.6)':'rgba(139,92,246,0.5)'})` }}
              />
              <defs>
                <linearGradient id="violetGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8b5cf6"/>
                  <stop offset="100%" stopColor="#ec4899"/>
                </linearGradient>
                <linearGradient id="fireGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f59e0b"/>
                  <stop offset="100%" stopColor="#ef4444"/>
                </linearGradient>
              </defs>
            </svg>

            <div style={{ position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',zIndex:2 }}>
              <p style={{ color:'var(--muted)',fontSize:9,letterSpacing:1.5,textTransform:'uppercase',fontWeight:700 }}>Token No.</p>
              <p style={{
                fontSize:52,fontWeight:800,fontFamily:'Syne,sans-serif',letterSpacing:-3,lineHeight:1,
                background:isMyTurn?'linear-gradient(135deg,#f59e0b,#ef4444)':'linear-gradient(135deg,#8b5cf6,#ec4899)',
                WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',
              }}>
                {String(token.tokenNumber).padStart(3,'0')}
              </p>
              <span className={`badge badge-${token.status}`} style={{ marginTop:5,fontSize:9,fontWeight:800 }}>
                {token.status==='serving'?'● YOUR TURN':token.status.toUpperCase().replace('_',' ')}
              </span>
            </div>
          </div>

          <p style={{ color:'var(--muted)',fontSize:13,fontWeight:500 }}>{token.office?.name}</p>
          <p style={{ color:'var(--dim)',fontSize:11,marginTop:3 }}>{token.service}</p>
        </div>

        {/* POSITION INDICATOR */}
        {!isDone && (
          <div style={{ textAlign:'center',marginBottom:16 }}>
            <p style={{ color:posColor,fontSize:16,fontWeight:800,fontFamily:'Syne,sans-serif' }}>{posLabel}</p>
          </div>
        )}

        {/* STATS */}
        {!isDone && (
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:16 }}>
            {[
              {l:'People ahead',v:ahead,grad:'linear-gradient(135deg,#8b5cf6,#ec4899)'},
              {l:'Now serving', v:`#${String(token.office?.currentToken||0).padStart(3,'0')}`,grad:'linear-gradient(135deg,#06b6d4,#8b5cf6)'},
              {l:'Est. wait',   v:`~${token.estimatedWait}m`,grad:'linear-gradient(135deg,#f59e0b,#ef4444)'},
            ].map(s => (
              <div key={s.l} style={{ background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:14,padding:'12px 6px',textAlign:'center' }}>
                <p style={{ background:s.grad,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',fontSize:18,fontWeight:800,fontFamily:'Syne,sans-serif' }}>{s.v}</p>
                <p style={{ color:'var(--muted)',fontSize:9,marginTop:4,textTransform:'uppercase',letterSpacing:.8,fontWeight:700 }}>{s.l}</p>
              </div>
            ))}
          </div>
        )}

        {/* PROGRESS BAR */}
        {!isDone && (
          <div style={{ marginBottom:14 }}>
            <div style={{ display:'flex',justifyContent:'space-between',fontSize:10,color:'var(--muted)',marginBottom:7,fontWeight:700,letterSpacing:.5 }}>
              <span>QUEUE PROGRESS</span>
              <span style={{ color:'var(--violet2)' }}>{pct}%</span>
            </div>
            <div style={{ background:'var(--bg3)',borderRadius:6,height:6,overflow:'hidden',position:'relative' }}>
              <div style={{
                background:'linear-gradient(90deg,#8b5cf6,#ec4899)',
                height:6,borderRadius:6,width:`${pct}%`,
                transition:'width 1.4s cubic-bezier(.4,0,.2,1)',
                boxShadow:'0 0 12px rgba(139,92,246,0.6)',
              }}/>
            </div>
            {/* Milestones */}
            <div style={{ display:'flex',justifyContent:'space-between',marginTop:6 }}>
              {[25,50,75,100].map(m => (
                <p key={m} style={{ fontSize:9,color:pct>=m?'var(--violet2)':'var(--dim)',fontWeight:700 }}>{m}%</p>
              ))}
            </div>
          </div>
        )}

        {/* NOTIFICATION */}
        {!isDone && !isMyTurn && (
          <div style={{ background:'rgba(139,92,246,0.07)',border:'1px solid rgba(139,92,246,0.2)',borderRadius:14,padding:'13px 16px',display:'flex',gap:10,alignItems:'flex-start',marginBottom:14 }}>
            <div style={{ width:8,height:8,borderRadius:'50%',background:'#22c55e',animation:'pulse 2s infinite',marginTop:4,flexShrink:0 }}/>
            <div>
              <p style={{ color:'var(--white)',fontSize:12,fontWeight:700 }}>Real-time updates active</p>
              <p style={{ color:'var(--muted)',fontSize:11,marginTop:3 }}>SMS + voice alert when it's your turn • Page auto-updates</p>
            </div>
          </div>
        )}

        {/* DONE */}
        {isDone && (
          <div style={{ background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:18,padding:28,textAlign:'center',marginBottom:16 }}>
            <p style={{ color:'var(--muted)',fontSize:15 }}>
              {token.status==='done'?'✅ Service completed. Thank you!':token.status==='cancelled'?'Token cancelled.':'Marked as no-show.'}
            </p>
            <button className="btn-grad" style={{ marginTop:20 }} onClick={() => navigate('/')}>Back to Home</button>
          </div>
        )}

        {token.status==='waiting' && (
          <button className="btn-danger" onClick={cancel} disabled={cancelling}>
            {cancelling?'Cancelling...':'Cancel Token'}
          </button>
        )}
      </div>
    </div>
  );
}
