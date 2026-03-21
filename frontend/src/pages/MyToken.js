import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { getSocket } from '../api';

export default function MyToken() {
  const { tokenId } = useParams();
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const fetchToken = useCallback(async () => {
    try { const { data } = await api.get(`/tokens/${tokenId}`); setToken(data); }
    catch { navigate('/'); }
    finally { setLoading(false); }
  }, [tokenId, navigate]);

  useEffect(() => { fetchToken(); }, [fetchToken]);
  useEffect(() => {
    if (!token?.office?._id) return;
    const socket = getSocket();
    socket.emit('join_office', token.office._id);
    socket.on('queue_update', d => { if (d.type==='next_called') fetchToken(); });
    return () => socket.off('queue_update');
  }, [token?.office?._id, fetchToken]);

  const cancel = async () => {
    if (!window.confirm('Cancel your token?')) return;
    setCancelling(true);
    try { await api.patch(`/tokens/${tokenId}/cancel`); navigate('/'); }
    catch (err) { alert(err.response?.data?.message||'Cannot cancel'); setCancelling(false); }
  };

  if (loading) return <div className="loading"><div className="spin"/></div>;
  if (!token)  return <div className="loading">Not found</div>;

  const isMyTurn = token.status === 'serving';
  const isDone   = ['done','cancelled','no_show'].includes(token.status);
  const pct      = token.office ? Math.min(100,Math.round((token.office.currentToken/token.tokenNumber)*100)) : 0;
  const R=62, C=2*Math.PI*R;

  return (
    <div className="app-shell">
      <div style={{ position:'fixed',top:0,left:0,right:0,height:300,background:'radial-gradient(ellipse at 50% 0%,rgba(139,92,246,0.12),transparent 70%)',pointerEvents:'none' }}/>

      <div className="screen">
        <button className="back-btn" onClick={() => navigate('/')}>← Home</button>

        {isMyTurn && (
          <div className="as" style={{ borderRadius:18,padding:'18px 20px',textAlign:'center',marginBottom:18,background:'linear-gradient(135deg,#f59e0b,#ef4444)',boxShadow:'0 8px 32px rgba(245,158,11,0.4)' }}>
            <p style={{ color:'var(--white)',fontSize:18,fontWeight:800,fontFamily:'Syne,sans-serif' }}>🎉 It's your turn!</p>
            <p style={{ color:'rgba(255,255,255,0.8)',fontSize:13,marginTop:4 }}>Please proceed to the counter now</p>
          </div>
        )}

        {/* Ring */}
        <div className="a1" style={{ textAlign:'center',marginBottom:14 }}>
          <p style={{ color:'var(--muted)',fontSize:10,letterSpacing:2,textTransform:'uppercase',marginBottom:18,fontWeight:700 }}>Your Token</p>
          <div className="ar" style={{ position:'relative',width:170,height:170,margin:'0 auto 16px' }}>
            {/* Glow behind ring */}
            <div style={{ position:'absolute',inset:0,borderRadius:'50%',background:`radial-gradient(circle,${isMyTurn?'rgba(245,158,11,0.15)':'rgba(139,92,246,0.15)'},transparent 70%)` }}/>
            <svg width="170" height="170" viewBox="0 0 170 170" style={{ transform:'rotate(-90deg)',position:'relative',zIndex:1 }}>
              <circle cx="85" cy="85" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10"/>
              <circle cx="85" cy="85" r={R} fill="none"
                stroke={isMyTurn ? 'url(#goldGrad)' : 'url(#violetGrad)'}
                strokeWidth="10" strokeLinecap="round"
                strokeDasharray={C} strokeDashoffset={C*(1-pct/100)}
                style={{ transition:'stroke-dashoffset 1.4s cubic-bezier(.4,0,.2,1)' }}
              />
              <defs>
                <linearGradient id="violetGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8b5cf6"/>
                  <stop offset="100%" stopColor="#ec4899"/>
                </linearGradient>
                <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f59e0b"/>
                  <stop offset="100%" stopColor="#ef4444"/>
                </linearGradient>
              </defs>
            </svg>
            <div style={{ position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',zIndex:2 }}>
              <p style={{ color:'var(--muted)',fontSize:9,letterSpacing:1.5,textTransform:'uppercase',fontWeight:700 }}>Token</p>
              <p className={isMyTurn?'grad-text3':'grad-text'} style={{ fontSize:50,fontWeight:800,fontFamily:'Syne,sans-serif',letterSpacing:-2,lineHeight:1 }}>
                {String(token.tokenNumber).padStart(3,'0')}
              </p>
              <span className={`badge badge-${token.status}`} style={{ marginTop:6,fontSize:9 }}>
                {token.status==='serving' ? '● YOUR TURN' : token.status.toUpperCase()}
              </span>
            </div>
          </div>
          <p style={{ color:'var(--muted)',fontSize:13,fontWeight:500 }}>{token.office?.name}</p>
          <p style={{ color:'var(--dim)',fontSize:11,marginTop:3 }}>{token.service}</p>
        </div>

        {/* Stats */}
        {!isDone && (
          <div className="a2" style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:14 }}>
            {[
              {l:'Ahead',v:token.peopleAhead,grad:'var(--grad1)'},
              {l:'Serving',v:`#${String(token.office?.currentToken||0).padStart(3,'0')}`,grad:'var(--grad2)'},
              {l:'Wait',v:`~${token.estimatedWait}m`,grad:'var(--grad3)'},
            ].map(s => (
              <div key={s.l} className="card" style={{ textAlign:'center',padding:'12px 6px',background:'var(--bg2)' }}>
                <p style={{ background:s.grad,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',fontSize:18,fontWeight:800,fontFamily:'Syne,sans-serif' }}>{s.v}</p>
                <p style={{ color:'var(--muted)',fontSize:9,marginTop:4,textTransform:'uppercase',letterSpacing:.8,fontWeight:700 }}>{s.l}</p>
              </div>
            ))}
          </div>
        )}

        {/* Progress */}
        {!isDone && (
          <div className="a3" style={{ marginBottom:14 }}>
            <div style={{ display:'flex',justifyContent:'space-between',fontSize:10,color:'var(--muted)',marginBottom:7,fontWeight:700,letterSpacing:.5 }}>
              <span>PROGRESS</span><span>{pct}%</span>
            </div>
            <div style={{ background:'var(--bg3)',borderRadius:6,height:4,overflow:'hidden' }}>
              <div style={{ background:'linear-gradient(90deg,#8b5cf6,#ec4899)',height:4,borderRadius:6,width:`${pct}%`,transition:'width 1.4s cubic-bezier(.4,0,.2,1)',boxShadow:'0 0 8px rgba(139,92,246,0.5)' }}/>
            </div>
          </div>
        )}

        {/* Notification card */}
        {!isDone && !isMyTurn && (
          <div className="a3" style={{ background:'rgba(139,92,246,0.08)',border:'1px solid rgba(139,92,246,0.2)',borderRadius:14,padding:'13px 16px',display:'flex',gap:10,alignItems:'flex-start',marginBottom:14 }}>
            <span className="dot" style={{ marginTop:4 }}/>
            <div>
              <p style={{ color:'var(--white)',fontSize:12,fontWeight:600 }}>SMS alert coming when 3 people are ahead</p>
              <p style={{ color:'var(--muted)',fontSize:11,marginTop:3 }}>This page updates live via real-time socket</p>
            </div>
          </div>
        )}

        {isDone && (
          <div className="as card" style={{ textAlign:'center',padding:26,marginBottom:16 }}>
            <p style={{ color:'var(--muted)',fontSize:14 }}>
              {token.status==='done'?'✓ Service completed. Thank you!':token.status==='cancelled'?'Token cancelled.':'Marked no-show.'}
            </p>
            <button className="btn-grad" style={{ marginTop:18 }} onClick={() => navigate('/')}>Back to home</button>
          </div>
        )}

        {token.status==='waiting' && (
          <button className="btn-danger a4" onClick={cancel} disabled={cancelling}>
            {cancelling?'Cancelling...':'Cancel token'}
          </button>
        )}
      </div>
    </div>
  );
}
