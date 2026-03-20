import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPass, setNewPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const sendOtp = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await api.post('/auth/send-otp', { phone }); setStep(2); }
    catch (err) { setError(err.response?.data?.message || 'Failed to send OTP'); }
    finally { setLoading(false); }
  };

  const reset = async e => {
    e.preventDefault();
    if (otp.length !== 6) { setError('Enter complete 6-digit OTP'); return; }
    setError(''); setLoading(true);
    try {
      await api.post('/auth/reset-password', { phone, otp, newPassword: newPass });
      setSuccess('Password reset! Redirecting...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) { setError(err.response?.data?.message || 'Invalid OTP. Try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="app-shell">
      <div className="screen" style={{ display:'flex',flexDirection:'column',paddingBottom:30 }}>
        <button className="back-btn" onClick={() => navigate('/login')}>← Back</button>
        <div className="a1" style={{ marginBottom:28 }}>
          <h1>Reset Password</h1>
          <p style={{ color:'var(--muted)',marginTop:6,fontSize:14 }}>
            {step===1 ? 'Enter your phone to receive OTP' : `OTP sent to ${phone}`}
          </p>
        </div>

        <div className="a2" style={{ display:'flex',gap:8,marginBottom:32 }}>
          {[1,2].map(s => (
            <div key={s} style={{ flex:1,height:2,borderRadius:2,background:step>=s?'var(--white)':'var(--bg3)',transition:'background .3s' }}/>
          ))}
        </div>

        {step===1 && (
          <form onSubmit={sendOtp} className="a3">
            <div className="form-group">
              <label>Phone number</label>
              <input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g,'').slice(0,10))}
                placeholder="10-digit number" required inputMode="numeric" maxLength={10}/>
            </div>
            {error && <p className="err" style={{ marginBottom:12 }}>{error}</p>}
            <button className="btn-primary" type="submit" disabled={loading||phone.length<10}>
              {loading?'Sending OTP...':'Send OTP →'}
            </button>
          </form>
        )}

        {step===2 && (
          <form onSubmit={reset} className="a3">
            <div className="form-group">
              <label>6-digit OTP</label>
              <input value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g,'').slice(0,6))}
                placeholder="0  0  0  0  0  0" required inputMode="numeric" maxLength={6}
                style={{ letterSpacing:12,fontSize:24,textAlign:'center',fontFamily:'Space Grotesk,sans-serif' }}/>
              <p style={{ color:'var(--muted)',fontSize:11,marginTop:6,textAlign:'center' }}>{otp.length}/6 entered</p>
            </div>
            <div className="form-group">
              <label>New password</label>
              <input type="password" value={newPass} onChange={e=>setNewPass(e.target.value)}
                placeholder="Min 6 characters" required minLength={6}/>
            </div>
            {error   && <p className="err" style={{ marginBottom:12 }}>{error}</p>}
            {success && <p className="suc" style={{ marginBottom:12 }}>{success}</p>}
            <button className="btn-primary" type="submit" disabled={loading||otp.length!==6}>
              {loading?'Resetting...':'Reset Password →'}
            </button>
            <button type="button" className="btn-outline" style={{ marginTop:10 }}
              onClick={() => { setStep(1); setError(''); setOtp(''); }}>
              Resend OTP
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
