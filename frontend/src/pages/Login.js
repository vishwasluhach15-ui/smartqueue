import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]   = useState({ phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.phone, form.password);
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <div className="screen" style={{ justifyContent: 'center' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, background: '#02C39A', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <span style={{ color: '#0A2E36', fontSize: 24, fontWeight: 700 }}>SQ</span>
          </div>
          <h1>Smart Queue</h1>
          <p style={{ color: '#5A8A93', marginTop: 6, fontSize: 14 }}>Zero wait. Just your turn.</p>
        </div>

        <form onSubmit={submit}>
          <div className="form-group">
            <label>Phone number</label>
            <input name="phone" value={form.phone} onChange={handle} placeholder="+91 98765 43210" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" value={form.password} onChange={handle} placeholder="••••••••" required />
          </div>
          {error && <p className="msg-error">{error}</p>}
          <div style={{ marginTop: 20 }}>
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login →'}
            </button>
          </div>
        </form>
        <p style={{color:'var(--muted)',fontSize:13,textAlign:'center',marginTop:14}}>
          <Link to="/forgot-password" style={{color:'var(--mint)',textDecoration:'none'}}>
    Forgot password?
          </Link>
        </p>
        

        <p style={{ color: '#5A8A93', fontSize: 13, textAlign: 'center', marginTop: 20 }}>
          New here?{' '}
          <Link to="/register" style={{ color: '#02C39A', textDecoration: 'none' }}>Create account</Link>
        </p>
      </div>
    </div>
  );
}
