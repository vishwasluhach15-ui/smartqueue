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

  if (loading) return <div className="loading"><div className="loading-spinner" /></div>;
  if (!office) return <div className="loading">{error}</div>;

  const inQ = Math.max(0, office.lastToken - office.currentToken);
  const wait = inQ * 5;

  return (
    <div className="app-shell">
      <div className="screen">
        <button className="back-btn" onClick={() => navigate('/')}>← Back</button>

        <div className="fade-up" style={{ marginBottom: 20 }}>
          <p style={{ color: 'var(--gray3)', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>{office.city}</p>
          <h1 style={{ fontSize: 22, lineHeight: 1.3, marginBottom: 4 }}>{office.name}</h1>
          <p style={{ color: 'var(--gray3)', fontSize: 13 }}>{office.address}</p>
        </div>

        {/* Stats */}
        <div className="fade-up-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22 }}>
          <div style={{ background: 'var(--white)', borderRadius: 14, padding: '16px 14px', textAlign: 'center' }}>
            <p style={{ color: 'var(--black)', fontSize: 26, fontWeight: 700, fontFamily: 'Playfair Display,serif' }}>#{office.currentToken}</p>
            <p style={{ color: 'rgba(0,0,0,0.4)', fontSize: 10, marginTop: 4, textTransform: 'uppercase', letterSpacing: .8 }}>Now serving</p>
          </div>
          <div style={{ background: 'var(--dark2)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 14px', textAlign: 'center' }}>
            <p style={{ color: 'var(--white)', fontSize: 26, fontWeight: 700, fontFamily: 'Playfair Display,serif' }}>~{wait}m</p>
            <p style={{ color: 'var(--gray3)', fontSize: 10, marginTop: 4, textTransform: 'uppercase', letterSpacing: .8 }}>Est. wait</p>
          </div>
        </div>

        {/* Services */}
        <p className="section-label fade-up-2">Select service</p>
        <div className="fade-up-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22 }}>
          {office.services?.map(svc => (
            <div key={svc.name} onClick={() => setService(svc.name)} style={{
              background: service === svc.name ? 'var(--white)' : 'var(--dark2)',
              border: `1px solid ${service === svc.name ? 'var(--white)' : 'var(--border)'}`,
              borderRadius: 12, padding: '14px 12px', cursor: 'pointer', transition: 'all .15s',
            }}>
              <p style={{ color: service === svc.name ? 'var(--black)' : 'var(--white)', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{svc.name}</p>
              <p style={{ color: service === svc.name ? 'rgba(0,0,0,0.4)' : 'var(--gray3)', fontSize: 10 }}>~{svc.avgMinutes} min</p>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="card fade-up-4" style={{ marginBottom: 20 }}>
          <p style={{ color: 'var(--gray3)', fontSize: 10, textTransform: 'uppercase', letterSpacing: .8, marginBottom: 12 }}>Booking summary</p>
          {[
            { k: 'Office',  v: office.name },
            { k: 'Service', v: service || '—' },
            { k: 'Your token', v: `#${office.lastToken + 1}`, highlight: true },
          ].map(row => (
            <div key={row.k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: 'var(--gray3)', fontSize: 12 }}>{row.k}</span>
              <span style={{ color: row.highlight ? 'var(--white)' : 'var(--gray4)', fontSize: 12, fontWeight: row.highlight ? 700 : 400 }}>{row.v}</span>
            </div>
          ))}
        </div>

        {error && <p className="msg-error" style={{ marginBottom: 12 }}>{error}</p>}

        <button className="btn-primary fade-up-4" onClick={book} disabled={booking || !service}>
          {booking ? 'Getting token...' : 'Confirm & Get Token →'}
        </button>
        <p style={{ color: 'var(--gray3)', fontSize: 11, textAlign: 'center', marginTop: 10 }}>
          SMS alert when 3 people are ahead
        </p>
      </div>
    </div>
  );
}
