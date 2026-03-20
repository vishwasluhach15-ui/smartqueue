import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]   = useState({ phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode]   = useState('citizen');

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

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
    <div className="app-shell" style={{background:'var(--dark)'}}>
      <div className="screen" style={{justifyContent:'center',minHeight:'100vh'}}>
        <div style={{marginBottom:36,textAlign:'center'}}>
          <div style={{width:60,height:60,borderRadius:18,background:'var(--mint)',margin:'0 auto 20px',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M6 8h16M6 14h10M6 20h7" stroke="#061a1f" strokeWidth="2.5" strokeLinecap="round"/></svg>
          </div>
          <h1 style={{fontSize:28}}>Smart Queue</h1>
          <p style={{color:'var(--muted)',marginTop:6,fontSize:14}}>Zero wait. Just your turn.</p>
        </div>

        <div style={{display:'flex',background:'var(--dark2)',borderRadius:12,padding:4,marginBottom:24,border:'1px solid var(--border)'}}>
          {['citizen','admin'].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{flex:1,padding:'9px 0',border:'none',cursor:'pointer',borderRadius:9,fontSize:13,fontWeight:600,fontFamily:'DM Sans,sans-serif',transition:'all .2s',background:mode===m?'var(--mint)':'transparent',color:mode===m?'var(--dark)':'var(--muted)'}}>
              {m==='citizen' ? 'Citizen' : 'Office Admin'}
            </button>
          ))}
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
          <div style={{marginTop:22}}>
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : `Login as ${mode==='admin'?'Admin':'Citizen'} →`}
            </button>
          </div>
        </form>

        {mode === 'citizen' && (
          <p style={{color:'var(--muted)',fontSize:13,textAlign:'center',marginTop:20}}>
            New here?{' '}
            <Link to="/register" style={{color:'var(--mint)',textDecoration:'none'}}>Create account</Link>
          </p>
        )}
      </div>
    </div>
  );
}