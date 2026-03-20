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
      .then((r) => { setOffice(r.data); if (r.data.services?.[0]) setService(r.data.services[0].name); })
      .catch(() => setError('Office not found'))
      .finally(() => setLoading(false));
  }, [officeId]);

  const book = async () => {
    setError('');
    setBooking(true);
    try {
      const { data } = await api.post('/tokens/book', { officeId, service });
      navigate(`/token/${data.token._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
      setBooking(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!office)  return <div className="loading">{error || 'Not found'}</div>;

  return (
    <div className="app-shell">
      <div className="screen">
        <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
        <h1 style={{ marginBottom: 6 }}>Book a Token</h1>
        <p style={{ color: '#5A8A93', fontSize: 13, marginBottom: 20 }}>{office.address}</p>

        {/* Office stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <p style={{ color: '#02C39A', fontSize: 22, fontWeight: 700 }}>{office.currentToken}</p>
            <p style={{ color: '#5A8A93', fontSize: 11, marginTop: 4 }}>Now serving</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <p style={{ color: '#fff', fontSize: 22, fontWeight: 700 }}>
              ~{Math.max(0, office.lastToken - office.currentToken) * 5} min
            </p>
            <p style={{ color: '#5A8A93', fontSize: 11, marginTop: 4 }}>Est. wait</p>
          </div>
        </div>

        {/* Service selection */}
        <p className="section-label">Select service</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
          {office.services?.map((svc) => (
            <div
              key={svc.name}
              onClick={() => setService(svc.name)}
              style={{
                background: service === svc.name ? '#0f4a3c' : '#0D3D4A',
                border: `1.5px solid ${service === svc.name ? '#02C39A' : 'transparent'}`,
                borderRadius: 12,
                padding: '12px 10px',
                cursor: 'pointer',
                transition: 'all .15s',
              }}
            >
              <p style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>{svc.name}</p>
              <p style={{ color: '#5A8A93', fontSize: 10, marginTop: 4 }}>~{svc.avgMinutes} min</p>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="card" style={{ marginBottom: 20 }}>
          <p style={{ color: '#5A8A93', fontSize: 11, marginBottom: 6 }}>Booking summary</p>
          <p style={{ color: '#fff', fontSize: 13 }}><span style={{ color: '#5A8A93' }}>Office: </span>{office.name}</p>
          <p style={{ color: '#fff', fontSize: 13, marginTop: 4 }}><span style={{ color: '#5A8A93' }}>Service: </span>{service}</p>
          <p style={{ color: '#fff', fontSize: 13, marginTop: 4 }}>
            <span style={{ color: '#5A8A93' }}>Your token will be: </span>
            <span style={{ color: '#02C39A', fontWeight: 700 }}>#{office.lastToken + 1}</span>
          </p>
        </div>

        {error && <p className="msg-error" style={{ marginBottom: 12 }}>{error}</p>}

        <button className="btn-primary" onClick={book} disabled={booking || !service}>
          {booking ? 'Getting your token...' : 'Confirm & Get Token →'}
        </button>

        <p style={{ color: '#5A8A93', fontSize: 11, textAlign: 'center', marginTop: 12 }}>
          You'll get an SMS when your turn is 3 people away
        </p>
      </div>
    </div>
  );
}
