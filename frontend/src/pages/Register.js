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
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  // Load offices when admin tab selected
  const switchMode = async (m) => {
    setMode(m);
    if (m === 'admin' && offices.length === 0) {
      try {
        const { data } = await api.get('/offices');
        setOffices(data);
        if (data[0]) setForm(f => ({ ...f, officeId: data[0]._id }));
      } catch { }
    }
  };

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (mode === 'citizen') {
        await register(form.name, form.phone, form.password);
        navigate('/');
      } else {
        // Admin registration
        const { data } = await api.post('/auth/register-admin', {
          name: form.name,
          phone: form.phone,
          password: form.password,
          officeId: form.officeId,
          secretKey: form.secretKey,
        });
        localStorage.setItem('sq_token', data.token);
        localStorage.setItem('sq_user', JSON.stringify(data.user));
        navigate('/admin');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="app-shell">
      <div className="screen" style={{justifyContent:'center',minHeight:'100vh'}}>
        <button className="back-btn" onClick={() => navigate('/login')}>← Back</button>

        <div style={{marginBottom:24}}>
          <h1>{mode === 'citizen' ? 'Create Account' : 'Admin Registration'}</h1>
          <p style={{color:'var(--muted)',marginTop:6,fontSize:14}}>
            {mode === 'citizen' ? 'Join Smart Queue — free for citizens' : 'Register as office administrator'}
          </p>
        </div>

        {/* Toggle */}
        <div style={{display:'flex',background:'var(--dark2)',borderRadius:12,padding:4,marginBottom:24,border:'1px solid var(--border)'}}>
          {['citizen','admin'].map(m => (
            <button key={m} onClick={() => switchMode(m)} style={{
              flex:1,padding:'9px 0',border:'none',cursor:'pointer',borderRadius:9,
              fontSize:13,fontWeight:600,fontFamily:'DM Sans,sans-serif',transition:'all .2s',
              background:mode===m?'var(--mint)':'transparent',
              color:mode===m?'var(--dark)':'var(--muted)',
            }}>
              {m==='citizen' ? 'Citizen' : 'Office Admin'}
            </button>
          ))}
        </div>

        <form onSubmit={submit}>
          <div className="form-group">
            <label>Full name</label>
            <input name="name" value={form.name} onChange={handle} placeholder="Your full name" required />
          </div>
          <div className="form-group">
            <label>Phone number</label>
            <input name="phone" value={form.phone} onChange={handle} placeholder="+91 98765 43210" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" value={form.password} onChange={handle} placeholder="Min 6 characters" required minLength={6} />
          </div>

          {/* Admin only fields */}
          {mode === 'admin' && (
            <>
              <div style={{height:1,background:'var(--border)',margin:'4px 0 16px'}}/>
              <p style={{color:'var(--muted)',fontSize:11,marginBottom:14,letterSpacing:.5}}>
                ADMIN VERIFICATION
              </p>

              <div className="form-group">
                <label>Assigned office</label>
                <select name="officeId" value={form.officeId} onChange={handle} required>
                  {offices.map(o => (
                    <option key={o._id} value={o._id}>{o.name} — {o.address}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Admin secret key</label>
                <input
                  name="secretKey"
                  value={form.secretKey}
                  onChange={handle}
                  placeholder="Enter key provided by administrator"
                  required
                  style={{letterSpacing: form.secretKey ? 2 : 0}}
                />
              </div>

              <div style={{
                background:'rgba(240,84,79,0.08)',border:'1px solid rgba(240,84,79,0.2)',
                borderRadius:10,padding:'10px 14px',marginBottom:16,
              }}>
                <p style={{color:'var(--coral)',fontSize:11}}>
                  ⚠️ Admin accounts require a secret key issued by the Smart Queue system administrator. Contact your supervisor if you don't have one.
                </p>
              </div>
            </>
          )}

          {error && <p className="msg-error" style={{marginBottom:12}}>{error}</p>}

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : mode==='citizen' ? 'Register →' : 'Register as Admin →'}
          </button>
        </form>

        <p style={{color:'var(--muted)',fontSize:13,textAlign:'center',marginTop:20}}>
          Already registered?{' '}
          <Link to="/login" style={{color:'var(--mint)',textDecoration:'none',fontWeight:500}}>Login</Link>
        </p>
      </div>
    </div>
  );
}