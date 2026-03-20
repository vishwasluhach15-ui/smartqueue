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
  const R=60, C=2*Math.PI*R;

  return (
    <div className="app-shell">
      <div className="screen">
        <button className="back-btn" onClick={() => navigate('/')}>← Home</button>

        {/* Your turn */}
        {isMyTurn && (
          <div className="as" style={{ background:'var(--gold)',borderRadius:16,padding:'16px 20px',textAlign:'center',marginBottom:16 }}>
            <p style={{ color:'var(--bg)',fontSize:17,fontWeight:700,fontFamily:'Space Grotesk,sans-serif' }}>It's your turn!</p>
            <p style={{ color:'rgba(0,0,0,0.6)',fontSize:13,marginTop:4 }}>Please proceed to the counter now</p>
          </div>
        )}

        {/* Ring */}
        <div className="a1" style={{ textAlign:'center',marginBottom:12 }}>
          <p style={{ color:'var(--muted)',fontSize:10,letterSpacing:1.5,textTransform:'uppercase',marginBottom:16 }}>Your Token</p>
          <div style={{ position:'relative',width:160,height:160,margin:'0 auto 16px' }}>
            <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform:'rotate(-90deg)' }}>
              <circle cx="80" cy="80" r={R} fill="none" stroke="var(--bg3)" strokeWidth="8"/>
              <circle cx="80" cy="80" r={R} fill="none"
                stroke={isMyTurn ? 'var(--gold)' : 'rgba(255,255,255,0.7)'}
                strokeWidth="8" strokeLinecap="round"
                strokeDasharray={C} strokeDashoffset={C*(1-pct/100)}
                style={{ transition:'stroke-dashoffset 1.2s ease' }}
              />
            </svg>
            <div style={{ position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center' }}>
              <p style={{ color:'var(--muted)',fontSize:9,letterSpacing:1,textTransform:'uppercase' }}>Token</p>
              <p style={{ color:'var(--white)',fontSize:48,fontWeight:700,fontFamily:'Space Grotesk,sans-serif',letterSpacing:-2,lineHeight:1 }}>
                {String(token.tokenNumber).padStart(3,'0')}
              </p>
              <span className={`badge badge-${token.status}`} style={{ marginTop:6 }}>
                {token.status==='serving' ? 'YOUR TURN' : token.status}
              </span>
            </div>
          </div>
          <p style={{ color:'var(--muted)',fontSize:12 }}>{token.office?.name}</p>
          <p style={{ color:'var(--muted)',fontSize:11,marginTop:2 }}>{token.service}</p>
        </div>

        {/* Stats */}
        {!isDone && (
          <div className="a2" style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:14 }}>
            {[
              {l:'Ahead',v:token.peopleAhead,c:'var(--white)'},
              {l:'Serving',v:`#${String(token.office?.currentToken||0).padStart(3,'0')}`,c:'var(--gold)'},
              {l:'Wait',v:`~${token.estimatedWait}m`,c:'var(--white)'},
            ].map(s => (
              <div key={s.l} className="card" style={{ textAlign:'center',padding:'10px 6px' }}>
                <p style={{ color:s.c,fontSize:16,fontWeight:700,fontFamily:'Space Grotesk,sans-serif' }}>{s.v}</p>
                <p style={{ color:'var(--muted)',fontSize:9,marginTop:3,textTransform:'uppercase',letterSpacing:.5 }}>{s.l}</p>
              </div>
            ))}
          </div>
        )}

        {/* Progress */}
        {!isDone && (
          <div className="a3" style={{ marginBottom:14 }}>
            <div style={{ display:'flex',justifyContent:'space-between',fontSize:10,color:'var(--muted)',marginBottom:6 }}>
              <span>Progress</span><span>{pct}%</span>
            </div>
            <div style={{ background:'var(--bg3)',borderRadius:4,height:3 }}>
              <div style={{ background:'var(--white)',height:3,borderRadius:4,width:`${pct}%`,transition:'width 1s ease' }}/>
            </div>
          </div>
        )}

        {/* SMS notice */}
        {!isDone && !isMyTurn && (
          <div className="a3" style={{ background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:12,padding:'12px 14px',display:'flex',gap:10,alignItems:'flex-start',marginBottom:14 }}>
            <span className="live-dot" style={{ marginTop:4,flexShrink:0 }}/>
            <div>
              <p style={{ color:'var(--white)',fontSize:12 }}>SMS alert when 3 people are ahead</p>
              <p style={{ color:'var(--muted)',fontSize:11,marginTop:3 }}>Page updates automatically in real-time</p>
            </div>
          </div>
        )}

        {isDone && (
          <div className="as card" style={{ textAlign:'center',padding:24,marginBottom:16 }}>
            <p style={{ color:'var(--muted)',fontSize:14 }}>
              {token.status==='done'?'✓ Done. Thank you!':token.status==='cancelled'?'Token cancelled.':'Marked no-show.'}
            </p>
            <button className="btn-primary" style={{ marginTop:16 }} onClick={()=>navigate('/')}>Back to home</button>
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
