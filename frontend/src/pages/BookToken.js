import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

export default function BookToken() {
  const { officeId } = useParams();
  const navigate = useNavigate();
  const [office, setOffice] = useState(null);
  const [service, setService] = useState('');
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/offices/${officeId}`)
      .then(r => { setOffice(r.data); if (r.data.services?.[0]) setService(r.data.services[0].name); })
      .catch(() => setError('Office not found'))
      .finally(() => setLoading(false));
  }, [officeId]);

  const book = async () => {
    setError(''); setBooking(true);
    try {
      const { data } = await api.post('/tokens/book', { officeId, service });
      navigate(`/token/${data.token._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
      setBooking(false);
    }
  };

  if (loading) return <div className="loading"><div className="spin"/></div>;
  if (!office) return <div className="loading">{error}</div>;

  const inQ = Math.max(0, office.lastToken - office.currentToken);

  return (
    <div className="app-shell">
      <div style={{ position:'fixed',top:0,right:0,width:200,height:200,borderRadius:'50%',background:'radial-gradient(circle,rgba(6,182,212,0.1),transparent 70%)',pointerEvents:'none' }}/>
      <div className="screen">
        <button className="back-btn" onClick={() => navigate('/')}>← Back</button>

        <div className="a1" style={{ marginBottom:22 }}>
          <span style={{ background:'rgba(139,92,246,0.15)',color:'var(--violet2)',fontSize:9,fontWeight:800,padding:'4px 10px',borderRadius:8,letterSpacing:1,textTransform:'uppercase' }}>{office.city}</span>
          <h1 style={{ fontSize:22,lineHeight:1.3,marginTop:10,marginBottom:4 }}>{office.name}</h1>
          <p style={{ color:'var(--muted)',fontSize:12 }}>{office.address}</p>
        </div>

        {/* Stats */}
        <div className="a2" style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:24 }}>
          <div style={{ background:'linear-gradient(135deg,rgba(139,92,246,0.15),rgba(236,72,153,0.08))',border:'1px solid rgba(139,92,246,0.25)',borderRadius:16,padding:18,textAlign:'center' }}>
            <p className="grad-text" style={{ fontSize:30,fontWeight:800,fontFamily:'Syne,sans-serif' }}>#{office.currentToken}</p>
            <p style={{ color:'var(--muted)',fontSize:10,marginTop:5,textTransform:'uppercase',letterSpacing:1,fontWeight:700 }}>Now serving</p>
          </div>
          <div style={{ background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:16,padding:18,textAlign:'center' }}>
            <p style={{ color:'var(--amber)',fontSize:30,fontWeight:800,fontFamily:'Syne,sans-serif' }}>~{inQ*5}m</p>
            <p style={{ color:'var(--muted)',fontSize:10,marginTop:5,textTransform:'uppercase',letterSpacing:1,fontWeight:700 }}>Est. wait</p>
          </div>
        </div>

        <p className="label a2">Select service</p>
        <div className="a3" style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:24 }}>
          {office.services?.map(svc => (
            <div key={svc.name} onClick={() => setService(svc.name)} style={{
              background: service===svc.name ? 'linear-gradient(135deg,rgba(139,92,246,0.2),rgba(236,72,153,0.15))' : 'var(--bg2)',
              border:`1.5px solid ${service===svc.name?'rgba(139,92,246,0.5)':'var(--border)'}`,
              borderRadius:14,padding:'16px 14px',cursor:'pointer',transition:'all .2s',
              boxShadow: service===svc.name?'0 4px 20px rgba(139,92,246,0.2)':'none',
            }}>
              <p style={{ color:'var(--white)',fontSize:12,fontWeight:700,marginBottom:5 }}>{svc.name}</p>
              <p style={{ color:'var(--muted)',fontSize:11 }}>~{svc.avgMinutes} min</p>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="a4" style={{ background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:16,padding:20,marginBottom:24 }}>
          <p style={{ color:'var(--muted)',fontSize:10,textTransform:'uppercase',letterSpacing:1.2,marginBottom:14,fontWeight:700 }}>Booking Summary</p>
          {[
            {k:'Office',v:office.name},
            {k:'Service',v:service||'—'},
            {k:'Your token',v:`#${office.lastToken+1}`,special:true},
          ].map(row => (
            <div key={row.k} style={{ display:'flex',justifyContent:'space-between',marginBottom:10 }}>
              <span style={{ color:'var(--muted)',fontSize:13 }}>{row.k}</span>
              <span style={row.special?{ background:'var(--grad1)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',fontSize:14,fontWeight:800,fontFamily:'Syne,sans-serif' }:{ color:'var(--off)',fontSize:13 }}>{row.v}</span>
            </div>
          ))}
        </div>

        {error && <p className="err" style={{ marginBottom:12 }}>{error}</p>}
        <button className="btn-grad a5" onClick={book} disabled={booking||!service}>
          {booking ? 'Getting your token...' : 'Confirm & Get Token →'}
        </button>
        <p style={{ color:'var(--muted)',fontSize:11,textAlign:'center',marginTop:12 }}>SMS alert when 3 people ahead of you</p>
      </div>
    </div>
  );
}
