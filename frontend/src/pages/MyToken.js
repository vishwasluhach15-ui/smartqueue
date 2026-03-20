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
    try {
      const { data } = await api.get(`/tokens/${tokenId}`);
      setToken(data);
    } catch { navigate('/'); }
    finally { setLoading(false); }
  }, [tokenId, navigate]);

  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  // Real-time socket updates
  useEffect(() => {
    if (!token?.office?._id) return;
    const socket = getSocket();
    socket.emit('join_office', token.office._id);
    socket.on('queue_update', (data) => {
      if (data.type === 'next_called') fetchToken();
    });
    return () => socket.off('queue_update');
  }, [token?.office?._id, fetchToken]);

  const cancel = async () => {
    if (!window.confirm('Cancel your token?')) return;
    setCancelling(true);
    try {
      await api.patch(`/tokens/${tokenId}/cancel`);
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Could not cancel');
      setCancelling(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!token)  return <div className="loading">Token not found</div>;

  const pct = token.office
    ? Math.min(100, Math.round(((token.office.currentToken) / (token.tokenNumber)) * 100))
    : 0;

  const isMyTurn = token.status === 'serving';
  const isDone   = ['done', 'cancelled', 'no_show'].includes(token.status);

  return (
    <div className="app-shell">
      <div className="screen">
        <button className="back-btn" onClick={() => navigate('/')}>← Home</button>

        {/* Big token number */}
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <p style={{ color: '#5A8A93', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
            Your token
          </p>

          {/* Animated ring */}
          <div style={{ position: 'relative', width: 150, height: 150, margin: '0 auto 16px' }}>
            <svg width="150" height="150" viewBox="0 0 150 150">
              <circle cx="75" cy="75" r="65" fill="none" stroke="#0D3D4A" strokeWidth="6" />
              <circle
                cx="75" cy="75" r="65"
                fill="none"
                stroke={isMyTurn ? '#F0544F' : '#02C39A'}
                strokeWidth="6"
                strokeDasharray={`${2 * Math.PI * 65}`}
                strokeDashoffset={`${2 * Math.PI * 65 * (1 - pct / 100)}`}
                strokeLinecap="round"
                transform="rotate(-90 75 75)"
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: '#5A8A93', fontSize: 9, letterSpacing: 1, textTransform: 'uppercase' }}>Token no.</p>
              <p style={{ color: '#fff', fontSize: 40, fontWeight: 700, fontFamily: 'monospace', lineHeight: 1 }}>
                {String(token.tokenNumber).padStart(3, '0')}
              </p>
              <span className={`badge badge-${token.status}`} style={{ marginTop: 4 }}>
                {token.status === 'serving' ? 'YOUR TURN!' : token.status}
              </span>
            </div>
          </div>

          <p style={{ color: '#5A8A93', fontSize: 12 }}>{token.office?.name}</p>
          <p style={{ color: '#5A8A93', fontSize: 11, marginTop: 2 }}>{token.service}</p>
        </div>

        {/* Stats row */}
        {!isDone && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
            <div className="card" style={{ textAlign: 'center', padding: 10 }}>
              <p style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>{token.peopleAhead}</p>
              <p style={{ color: '#5A8A93', fontSize: 9, marginTop: 2 }}>Ahead of you</p>
            </div>
            <div className="card" style={{ textAlign: 'center', padding: 10 }}>
              <p style={{ color: '#02C39A', fontSize: 18, fontWeight: 700 }}>
                {String(token.office?.currentToken || 0).padStart(3, '0')}
              </p>
              <p style={{ color: '#5A8A93', fontSize: 9, marginTop: 2 }}>Now serving</p>
            </div>
            <div className="card" style={{ textAlign: 'center', padding: 10 }}>
              <p style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>~{token.estimatedWait}</p>
              <p style={{ color: '#5A8A93', fontSize: 9, marginTop: 2 }}>min wait</p>
            </div>
          </div>
        )}

        {/* Progress bar */}
        {!isDone && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#5A8A93', fontSize: 11, marginBottom: 6 }}>
              <span>Queue progress</span>
              <span>{pct}%</span>
            </div>
            <div style={{ background: '#0D3D4A', borderRadius: 4, height: 8 }}>
              <div style={{ background: '#02C39A', height: 8, borderRadius: 4, width: `${pct}%`, transition: 'width 1s ease' }} />
            </div>
          </div>
        )}

        {/* Your turn banner */}
        {isMyTurn && (
          <div style={{ background: '#F0544F', borderRadius: 12, padding: 16, textAlign: 'center', marginBottom: 16 }}>
            <p style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>It's your turn!</p>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 4 }}>Please proceed to the counter now</p>
          </div>
        )}

        {/* SMS notification note */}
        {!isDone && !isMyTurn && (
          <div className="card" style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 16 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#02C39A', flexShrink: 0, marginTop: 4 }} className="pulse" />
            <div>
              <p style={{ color: '#fff', fontSize: 12 }}>You'll get an SMS when 3 people remain ahead of you.</p>
              <p style={{ color: '#5A8A93', fontSize: 11, marginTop: 4 }}>SMS sent to your registered number</p>
            </div>
          </div>
        )}

        {/* Done state */}
        {isDone && (
          <div className="card" style={{ textAlign: 'center', padding: 24, marginBottom: 16 }}>
            <p style={{ color: '#5A8A93', fontSize: 14 }}>
              {token.status === 'done' ? 'Service completed. Thank you!' :
               token.status === 'cancelled' ? 'Token was cancelled.' : 'Marked as no-show.'}
            </p>
            <button className="btn-primary" style={{ marginTop: 14 }} onClick={() => navigate('/')}>
              Back to home
            </button>
          </div>
        )}

        {/* Cancel button */}
        {token.status === 'waiting' && (
          <button className="btn-danger" onClick={cancel} disabled={cancelling}>
            {cancelling ? 'Cancelling...' : 'Cancel token'}
          </button>
        )}
      </div>
    </div>
  );
}
