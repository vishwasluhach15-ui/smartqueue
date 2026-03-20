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
      <div className="screen">
        <button className="back-btn" onClick={() => navigate('/')}>← Back</button>

        <div className="a1" style={{ marginBottom:22 }}>
          <p style={{ color:'var(--muted)',fontSize:10,letterSpacing:1.2,textTransform:'uppercase',marginBottom:6 }}>{office.city}</p>
          <h1 style={{ fontSize:20,lineHeight:1.3,marginBottom:4 }}>{office.name}</h1>
          <p style={{ color:'var(--muted)',fontSize:12 }}>{office.address}</p>
        </div>

        {/* Stats */}
        <div className="a2" style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:24 }}>
          <div style={{ background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:14,padding:'16px',textAlign:'center' }}>
            <p style={{ color:'var(--gold)',fontSize:28,fontWeight:700,fontFamily:'Space Grotesk,sans-serif',letterSpacing:-1 }}>#{office.currentToken}</p>
            <p style={{ color:'var(--muted)',fontSize:10,marginTop:5,textTransform:'uppercase',letterSpacing:.8 }}>Now serving</p>
          </div>
          <div style={{ background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:14,padding:'16px',textAlign:'center' }}>
            <p style={{ color:'var(--white)',fontSize:28,fontWeight:700,fontFamily:'Space Grotesk,sans-serif',letterSpacing:-1 }}>~{inQ*5}m</p>
            <p style={{ color:'var(--muted)',fontSize:10,marginTop:5,textTransform:'uppercase',letterSpacing:.8 }}>Est. wait</p>
          </div>
        </div>

        <p className="section-label a2">Select service</p>
        <div className="a3" style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:24 }}>
          {office.services?.map(svc => (
            <div key={svc.name} onClick={() => setService(svc.name)} style={{
              background: service===svc.name ? 'var(--white)' : 'var(--bg2)',
              border:`1px solid ${service===svc.name ? 'var(--white)' : 'var(--border)'}`,
              borderRadius:12,padding:'16px 14px',cursor:'pointer',transition:'all .15s',
            }}>
              <p style={{ color:service===svc.name?'var(--bg)':'var(--white)',fontSize:12,fontWeight:600,marginBottom:5 }}>{svc.name}</p>
              <p style={{ color:service===svc.name?'rgba(0,0,0,0.4)':'var(--muted)',fontSize:11 }}>~{svc.avgMinutes} min</p>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="a4" style={{ background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:14,padding:18,marginBottom:22 }}>
          <p style={{ color:'var(--muted)',fontSize:10,textTransform:'uppercase',letterSpacing:1,marginBottom:14 }}>Summary</p>
          {[
            {k:'Office',v:office.name},
            {k:'Service',v:service||'—'},
            {k:'Your token',v:`#${office.lastToken+1}`,gold:true},
          ].map(row => (
            <div key={row.k} style={{ display:'flex',justifyContent:'space-between',marginBottom:10 }}>
              <span style={{ color:'var(--muted)',fontSize:13 }}>{row.k}</span>
              <span style={{ color:row.gold?'var(--gold)':'var(--off)',fontSize:13,fontWeight:row.gold?700:400 }}>{row.v}</span>
            </div>
          ))}
        </div>

        {error && <p className="err" style={{ marginBottom:12 }}>{error}</p>}
        <button className="btn-primary a5" onClick={book} disabled={booking||!service}>
          {booking ? 'Getting token...' : 'Confirm & Get Token →'}
        </button>
        <p style={{ color:'var(--muted)',fontSize:11,textAlign:'center',marginTop:10 }}>SMS alert when 3 people ahead</p>
      </div>
    </div>
  );
}
