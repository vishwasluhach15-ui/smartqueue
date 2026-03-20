import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="app-shell">
      <div className="screen">
        <button className="back-btn" onClick={() => navigate('/')}>← Back</button>

        {/* Avatar */}
        <div className="fade-up" style={{ textAlign: 'center', padding: '16px 0 28px' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'var(--white)', margin: '0 auto 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--black)', fontWeight: 700, fontSize: 28,
            fontFamily: 'Playfair Display,serif',
          }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <h2 style={{ fontSize: 20 }}>{user?.name}</h2>
          <p style={{ color: 'var(--gray3)', fontSize: 13, marginTop: 4 }}>{user?.phone}</p>
          <span style={{
            display: 'inline-block', marginTop: 10,
            background: 'var(--dark2)', color: 'var(--gray4)',
            fontSize: 10, fontWeight: 600, padding: '5px 14px',
            borderRadius: 20, letterSpacing: .8, textTransform: 'uppercase',
            border: '1px solid var(--border2)',
          }}>
            {user?.role === 'admin' ? 'Administrator' : 'Citizen'}
          </span>
        </div>

        <div className="divider fade-up-2" />

        <p className="section-label fade-up-2">Account details</p>

        {[
          { label: 'Full name', val: user?.name },
          { label: 'Phone', val: user?.phone },
          { label: 'Account type', val: user?.role === 'admin' ? 'Office Administrator' : 'Citizen' },
        ].map((row, i) => (
          <div key={row.label} className={`card fade-up-${i + 2}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 16px' }}>
            <span style={{ color: 'var(--gray3)', fontSize: 13 }}>{row.label}</span>
            <span style={{ color: 'var(--white)', fontSize: 13, fontWeight: 500 }}>{row.val}</span>
          </div>
        ))}

        <div className="divider fade-up-3" />

        <p className="section-label fade-up-3">Settings</p>

        <button className="card card-click fade-up-3"
          onClick={() => navigate('/forgot-password')}
          style={{ width: '100%', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', border: '1px solid var(--border)' }}>
          <span style={{ color: 'var(--white)', fontSize: 13 }}>Change Password</span>
          <span style={{ color: 'var(--gray3)', fontSize: 16 }}>›</span>
        </button>

        <div style={{ marginTop: 12 }}>
          <button className="btn-danger fade-up-4" onClick={handleLogout}>Logout</button>
        </div>

        <p style={{ color: 'var(--gray3)', fontSize: 11, textAlign: 'center', marginTop: 24 }}>
          Smart Queue v2.0 · India Innovates 2026
        </p>
      </div>
    </div>
  );
}
