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
      {/* Decorative blobs */}
      <div style={{ position:'fixed',top:-100,right:-100,width:300,height:300,borderRadius:'50%',background:'radial-gradient(circle,rgba(139,92,246,0.15),transparent 70%)',pointerEvents:'none',zIndex:0 }}/>
      <div style={{ position:'fixed',bottom:-80,left:-80,width:250,height:250,borderRadius:'50%',background:'radial-gradient(circle,rgba(236,72,153,0.1),transparent 70%)',pointerEvents:'none',zIndex:0 }}/>

      <div className="screen" style={{ display:'flex',flexDirection:'column',justifyContent:'center',minHeight:'100vh',paddingBottom:0,position:'relative',zIndex:1 }}>

        {/* Logo area */}
        <div className="a1" style={{ marginBottom:44,textAlign:'center' }}>
          <div className="float" style={{
            width:68,height:68,borderRadius:22,margin:'0 auto 22px',
            background:'linear-gradient(135deg,#8b5cf6,#ec4899)',
            display:'flex',alignItems:'center',justifyContent:'center',
            boxShadow:'0 8px 32px rgba(139,92,246,0.4)',
          }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M4 7h20M4 14h14M4 21h9" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="grad-text" style={{ fontSize:34,marginBottom:8 }}>Smart Queue</h1>
          <p style={{ color:'var(--muted)',fontSize:14,fontWeight:400 }}>Zero wait. Just your turn.</p>
        </div>

        {/* Toggle */}
        <div className="pill-wrap a2">
          {['citizen','admin'].map(m => (
            <button key={m} className="pill-btn" onClick={() => setMode(m)} style={{
              background: mode===m ? 'var(--white)' : 'transparent',
              color: mode===m ? 'var(--bg)' : 'var(--muted)',
              boxShadow: mode===m ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
            }}>
              {m === 'citizen' ? 'Citizen' : 'Office Admin'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="a3">
          <div className="form-group">
            <label>Phone number</label>
            <input name="phone" value={form.phone} onChange={handle} placeholder="10-digit number" required inputMode="numeric" maxLength={10}/>
          </div>
          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" value={form.password} onChange={handle} placeholder="••••••••" required/>
          </div>
          {error && <p className="err">{error}</p>}
          <div style={{ marginTop:22 }}>
            <button className="btn-grad" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Continue →'}
            </button>
          </div>
        </form>

        <div className="a4" style={{ textAlign:'center',marginTop:18 }}>
          <Link to="/forgot-password" style={{ color:'var(--muted)',fontSize:13,textDecoration:'none' }}>Forgot password?</Link>
        </div>
        {mode === 'citizen' && (
          <p className="a4" style={{ color:'var(--muted)',fontSize:13,textAlign:'center',marginTop:12 }}>
            No account?{' '}
            <Link to="/register" style={{ background:'var(--grad1)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',textDecoration:'none',fontWeight:700 }}>Sign up free</Link>
          </p>
        )}
      </div>
    </div>
  );
}
