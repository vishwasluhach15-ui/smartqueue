import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep]     = useState(1); // 1=phone, 2=otp+newpass
  const [phone, setPhone]   = useState('');
  const [otp, setOtp]       = useState('');
  const [newPass, setNewPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');

  const sendOtp = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await api.post('/auth/send-otp', { phone });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  const resetPassword = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await api.post('/auth/reset-password', { phone, otp, newPassword: newPass });
      setSuccess('Password reset successful!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="app-shell">
      <div className="screen" style={{justifyContent:'center',minHeight:'100vh'}}>
        <button className="back-btn" onClick={() => navigate('/login')}>← Back to Login</button>

        <div style={{marginBottom:28}}>
          <h1>Reset Password</h1>
          <p style={{color:'var(--muted)',marginTop:6,fontSize:14}}>
            {step === 1 ? 'Enter your phone number to receive OTP' : `OTP sent to ${phone}`}
          </p>
        </div>

        {/* Step indicators */}
        <div style={{display:'flex',gap:8,marginBottom:28}}>
          {[1,2].map(s => (
            <div key={s} style={{
              flex:1,height:4,borderRadius:4,
              background: step >= s ? 'var(--mint)' : 'var(--dark2)',
              transition:'background .3s',
            }}/>
          ))}
        </div>

        {/* Step 1 — Phone */}
        {step === 1 && (
          <form onSubmit={sendOtp}>
            <div className="form-group">
              <label>Phone number</label>
              <input
                value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="+91 98765 43210" required
              />
            </div>
            {error && <p className="msg-error" style={{marginBottom:12}}>{error}</p>}
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send OTP →'}
            </button>
            <p style={{color:'var(--muted)',fontSize:11,textAlign:'center',marginTop:12}}>
              OTP valid for 10 minutes
            </p>
          </form>
        )}

        {/* Step 2 — OTP + New Password */}
        {step === 2 && (
          <form onSubmit={resetPassword}>
            <div className="form-group">
              <label>Enter OTP</label>
              <input
                value={otp} onChange={e => setOtp(e.target.value)}
                placeholder="6-digit OTP" required maxLength={6}
                style={{letterSpacing:6,fontSize:20,textAlign:'center'}}
              />
            </div>
            <div className="form-group">
              <label>New password</label>
              <input
                type="password" value={newPass} onChange={e => setNewPass(e.target.value)}
                placeholder="Min 6 characters" required minLength={6}
              />
            </div>

            {error   && <p className="msg-error"   style={{marginBottom:12}}>{error}</p>}
            {success && <p className="msg-success" style={{marginBottom:12}}>{success}</p>}

            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password →'}
            </button>

            <button
              type="button"
              className="btn-ghost"
              style={{marginTop:10}}
              onClick={() => { setStep(1); setError(''); setOtp(''); }}
            >
              Resend OTP
            </button>
          </form>
        )}
      </div>
    </div>
  );
}