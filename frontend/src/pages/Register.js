import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('citizen');
  const [form, setForm] = useState({ name: '', phone: '', password: '', officeId: '', secretKey: '' });
  const [offices, setOffices] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const switchMode = async m => {
    setMode(m);
    if (m === 'admin' && offices.length === 0) {
      try {
        const { data } = await api.get('/offices');
        setOffices(data);
        if (data[0]) setForm(f => ({ ...f, officeId: data[0]._id }));
      } catch {}
    }
  };

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
      if (mode === 'citizen') {
        await register(form.name, form.phone, form.password);
        navigate('/');
      } else {
        const { data } = await api.post('/auth/register-admin', {
          name: form.name, phone: form.phone,
          password: form.password, officeId: form.officeId, secretKey: form.secretKey,
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
      <div className="screen" style={{ display: 'flex', flexDirection: 'column', paddingBottom: 30 }}>
        <button className="back-btn" onClick={() => navigate('/login')}>← Back</button>

        <div className="fade-up" style={{ marginBottom: 28 }}>
          <h1>{mode === 'citizen' ? 'Create Account' : 'Admin Registration'}</h1>
          <p style={{ color: 'var(--gray3)', marginTop: 6, fontSize: 14 }}>
            {mode === 'citizen' ? 'Join Smart Queue — free for citizens' : 'Office administrator registration'}
          </p>
        </div>

        {/* Toggle */}
        <div className="fade-up-2" style={{ display: 'flex', background: 'var(--dark2)', borderRadius: 12, padding: 4, marginBottom: 24, border: '1px solid var(--border)' }}>
          {['citizen', 'admin'].map(m => (
            <button key={m} onClick={() => switchMode(m)} style={{
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
            <label>Full name</label>
            <input name="name" value={form.name} onChange={handle} placeholder="Your full name" required />
          </div>
          <div className="form-group">
            <label>Phone number</label>
            <input
              name="phone" value={form.phone} onChange={handle}
              placeholder="10-digit number" required
              inputMode="numeric" pattern="[0-9]*" maxLength={10}
            />
            {form.phone && form.phone.length < 10 && (
              <p style={{ color: 'var(--gray3)', fontSize: 11, marginTop: 4 }}>{10 - form.phone.length} more digits needed</p>
            )}
          </div>
          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" value={form.password} onChange={handle} placeholder="Min 6 characters" required minLength={6} />
          </div>

          {mode === 'admin' && (
            <>
              <div className="divider" />
              <p style={{ color: 'var(--gray3)', fontSize: 10, fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 14 }}>Admin Verification</p>
              <div className="form-group">
                <label>Assigned office</label>
                <select name="officeId" value={form.officeId} onChange={handle} required>
                  {offices.map(o => (
                    <option key={o._id} value={o._id}>{o.name} — {o.city}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Admin secret key</label>
                <input name="secretKey" value={form.secretKey} onChange={handle} placeholder="Key provided by administrator" required />
              </div>
              <div style={{ background: 'rgba(224,82,82,0.06)', border: '1px solid rgba(224,82,82,0.15)', borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>
                <p style={{ color: 'var(--red)', fontSize: 11 }}>Admin accounts require a secret key from the Smart Queue administrator.</p>
              </div>
            </>
          )}

          {error && <p className="msg-error" style={{ marginBottom: 12 }}>{error}</p>}
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Creating...' : mode === 'citizen' ? 'Register →' : 'Register as Admin →'}
          </button>
        </form>

        <p style={{ color: 'var(--gray3)', fontSize: 13, textAlign: 'center', marginTop: 20 }}>
          Already registered?{' '}
          <Link to="/login" style={{ color: 'var(--white)', textDecoration: 'none', fontWeight: 600 }}>Login</Link>
        </p>
      </div>
    </div>
  );
}
