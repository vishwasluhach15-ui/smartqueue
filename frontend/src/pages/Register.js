import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('citizen');
  const [form, setForm] = useState({ name:'', phone:'', password:'', officeId:'', secretKey:'' });
  const [offices, setOffices] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const switchMode = async m => {
    setMode(m);
    if (m==='admin' && offices.length===0) {
      try { const { data } = await api.get('/offices'); setOffices(data); if (data[0]) setForm(f=>({...f,officeId:data[0]._id})); } catch {}
    }
  };

  const handle = e => {
    const { name, value } = e.target;
    if (name==='phone') setForm(f=>({...f,phone:value.replace(/\D/g,'').slice(0,10)}));
    else setForm(f=>({...f,[name]:value}));
  };

  const submit = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      if (mode==='citizen') { await register(form.name, form.phone, form.password); navigate('/'); }
      else {
        const { data } = await api.post('/auth/register-admin', { name:form.name, phone:form.phone, password:form.password, officeId:form.officeId, secretKey:form.secretKey });
        localStorage.setItem('sq_token', data.token);
        localStorage.setItem('sq_user', JSON.stringify(data.user));
        navigate('/admin');
      }
    } catch (err) { setError(err.response?.data?.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="app-shell">
      <div style={{ position:'fixed',top:-100,right:-100,width:300,height:300,borderRadius:'50%',background:'radial-gradient(circle,rgba(139,92,246,0.12),transparent 70%)',pointerEvents:'none' }}/>
      <div className="screen" style={{ display:'flex',flexDirection:'column',paddingBottom:30 }}>
        <button className="back-btn" onClick={() => navigate('/login')}>← Back</button>
        <div className="a1" style={{ marginBottom:24 }}>
          <h1 style={{ fontSize:28 }}>{mode==='citizen'?'Create Account':'Admin Setup'}</h1>
          <p style={{ color:'var(--muted)',marginTop:6,fontSize:14 }}>{mode==='citizen'?'Free for all citizens':'Office administrator only'}</p>
        </div>

        <div className="pill-wrap a2">
          {['citizen','admin'].map(m => (
            <button key={m} className="pill-btn" onClick={()=>switchMode(m)} style={{
              background:mode===m?'var(--white)':'transparent',
              color:mode===m?'var(--bg)':'var(--muted)',
              boxShadow:mode===m?'0 2px 8px rgba(0,0,0,0.3)':'none',
            }}>{m==='citizen'?'Citizen':'Office Admin'}</button>
          ))}
        </div>

        <form onSubmit={submit} className="a3">
          <div className="form-group">
            <label>Full name</label>
            <input name="name" value={form.name} onChange={handle} placeholder="Your name" required/>
          </div>
          <div className="form-group">
            <label>Phone number</label>
            <input name="phone" value={form.phone} onChange={handle} placeholder="10-digit number" required inputMode="numeric" maxLength={10}/>
            {form.phone.length>0&&form.phone.length<10&&<p style={{ color:'var(--muted)',fontSize:11,marginTop:5 }}>{10-form.phone.length} more digits</p>}
          </div>
          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" value={form.password} onChange={handle} placeholder="Min 6 characters" required minLength={6}/>
          </div>

          {mode==='admin' && (
            <>
              <div className="divider"/>
              <div className="form-group">
                <label>Assigned office</label>
                <select name="officeId" value={form.officeId} onChange={handle} required>
                  {offices.map(o=><option key={o._id} value={o._id}>{o.name} — {o.city}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Admin secret key</label>
                <input name="secretKey" value={form.secretKey} onChange={handle} placeholder="Key from administrator" required/>
              </div>
            </>
          )}

          {error && <p className="err" style={{ marginBottom:12 }}>{error}</p>}
          <button className="btn-grad" type="submit" disabled={loading}>
            {loading?'Creating...':mode==='citizen'?'Create Account →':'Register as Admin →'}
          </button>
        </form>

        <p style={{ color:'var(--muted)',fontSize:13,textAlign:'center',marginTop:20 }}>
          Have an account?{' '}
          <Link to="/login" style={{ background:'var(--grad1)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',textDecoration:'none',fontWeight:700 }}>Login</Link>
        </p>
      </div>
    </div>
  );
}
