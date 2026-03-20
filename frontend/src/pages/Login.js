import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('citizen');

  const handle = e => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const nums = value.replace(/\D/g, '').slice(0, 10);
      setForm(f => ({ ...f, phone: nums }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const submit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await login(form.phone, form.password);
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  return (
    <div className="app-shell" style={{ background: 'var(--dark)' }}>
      <div className="screen" style={{ justifyContent: 'center', display: 'flex', flexDirection: 'column', minHeight: '100vh', paddingBottom: 0 }}>

        {/* Logo */}
        <div className="fade-up" style={{ marginBottom: 40, textAlign: 'center' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20,
            background: 'var(--white)', margin: '0 auto 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
              <path d="M5 8h20M5 15h14M5 22h9" stroke="#0a0a0a" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 32, marginBottom: 6 }}>Smart Queue</h1>
          <p style={{ color: 'var(--gray3)', fontSize: 14 }}>Zero wait. Just your turn.</p>
        </div>

        {/* Toggle */}
        <div className="fade-up-2" style={{ display: 'flex', background: 'var(--dark2)', borderRadius: 12, padding: 4, marginBottom: 24, border: '1px solid var(--border)' }}>
          {['citizen', 'admin'].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex: 1, padding: '9px 0', border: 'none', cursor: 'pointer',
              borderRadius: 9, fontSize: 13, fontWeight: 600,
              fontFamily: 'Inter,sans-serif', transition: 'all .2s',
              background: mode === m ? 'var(--white)' : 'transparent',
              color: mode === m ? 'var(--black)' : 'var(--gray3)',
            }}>
              {m === 'citizen' ? 'Citizen' : 'Office Admin'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="fade-up-3">
          <div className="form-group">
            <label>Phone number</label>
            <input
              name="phone" value={form.phone} onChange={handle}
              placeholder="10-digit number" required
              inputMode="numeric" pattern="[0-9]*"
              maxLength={10}
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" value={form.password} onChange={handle} placeholder="••••••••" required />
          </div>
          {error && <p className="msg-error">{error}</p>}
          <div style={{ marginTop: 22 }}>
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : `Login as ${mode === 'admin' ? 'Admin' : 'Citizen'} →`}
            </button>
          </div>
        </form>

        <p style={{ color: 'var(--gray3)', fontSize: 12, textAlign: 'center', marginTop: 16 }}>
          <Link to="/forgot-password" style={{ color: 'var(--gray4)', textDecoration: 'none' }}>Forgot password?</Link>
        </p>

        {mode === 'citizen' && (
          <p style={{ color: 'var(--gray3)', fontSize: 13, textAlign: 'center', marginTop: 12 }}>
            New here?{' '}
            <Link to="/register" style={{ color: 'var(--white)', textDecoration: 'none', fontWeight: 600 }}>Create account</Link>
          </p>
        )}
      </div>
    </div>
  );
}
