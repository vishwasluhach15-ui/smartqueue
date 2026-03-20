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
    if (name === 'phone') setForm(f => ({ ...f, phone: value.replace(/\D/g, '').slice(0, 10) }));
    else setForm(f => ({ ...f, [name]: value }));
  };

  const submit = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const user = await login(form.phone, form.password);
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  return (
    <div className="app-shell">
      <div className="screen" style={{ display:'flex',flexDirection:'column',justifyContent:'center',minHeight:'100vh',paddingBottom:0 }}>

        {/* Logo */}
        <div className="a1" style={{ marginBottom:40,textAlign:'center' }}>
          <div style={{
            width:60,height:60,borderRadius:18,margin:'0 auto 20px',
            background:'var(--bg3)',border:'1px solid var(--border2)',
            display:'flex',alignItems:'center',justifyContent:'center',
          }}>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <path d="M4 7h18M4 13h12M4 19h8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 style={{ fontSize:30,marginBottom:8 }}>Smart Queue</h1>
          <p style={{ color:'var(--muted)',fontSize:14,fontWeight:400 }}>Zero wait. Just your turn.</p>
        </div>

        {/* Mode toggle */}
        <div className="toggle-wrap a2">
          {['citizen','admin'].map(m => (
            <button key={m} className="toggle-btn" onClick={() => setMode(m)} style={{
              background: mode===m ? 'var(--white)' : 'transparent',
              color: mode===m ? 'var(--bg)' : 'var(--muted)',
            }}>
              {m === 'citizen' ? 'Citizen' : 'Office Admin'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="a3">
          <div className="form-group">
            <label>Phone number</label>
            <input name="phone" value={form.phone} onChange={handle}
              placeholder="10-digit number" required
              inputMode="numeric" maxLength={10} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" value={form.password}
              onChange={handle} placeholder="••••••••" required />
          </div>
          {error && <p className="err">{error}</p>}
          <div style={{ marginTop:22 }}>
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : `Continue →`}
            </button>
          </div>
        </form>

        <div className="a4" style={{ textAlign:'center',marginTop:18 }}>
          <Link to="/forgot-password" style={{ color:'var(--muted)',fontSize:13,textDecoration:'none' }}>
            Forgot password?
          </Link>
        </div>
        {mode === 'citizen' && (
          <p className="a4" style={{ color:'var(--muted)',fontSize:13,textAlign:'center',marginTop:12 }}>
            No account?{' '}
            <Link to="/register" style={{ color:'var(--white)',textDecoration:'none',fontWeight:600 }}>Sign up</Link>
          </p>
        )}
      </div>
    </div>
  );
}
