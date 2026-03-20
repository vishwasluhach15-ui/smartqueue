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

  const handlePhone = e => {
    const nums = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(nums);
  };

  const handleOtp = e => {
    const nums = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(nums);
  };

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
    if (otp.length !== 6) { setError('Enter complete 6-digit OTP'); return; }
    setError(''); setLoading(true);
    try {
      await api.post('/auth/reset-password', { phone, otp, newPassword: newPass });
      setSuccess('Password reset successful!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. Check your OTP.');
    } finally { setLoading(false); }
  };

  return (
    <div className="app-shell">
      <div className="screen" style={{ display: 'flex', flexDirection: 'column', paddingBottom: 30 }}>
        <button className="back-btn" onClick={() => navigate('/login')}>← Back to Login</button>

        <div className="fade-up" style={{ marginBottom: 28 }}>
          <h1>Reset Password</h1>
          <p style={{ color: 'var(--gray3)', marginTop: 6, fontSize: 14 }}>
            {step === 1 ? 'Enter your registered phone number' : `OTP sent to ${phone}`}
          </p>
        </div>

        {/* Step bar */}
        <div className="fade-up-2" style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
          {[1, 2].map(s => (
            <div key={s} style={{
              flex: 1, height: 3, borderRadius: 3,
              background: step >= s ? 'var(--white)' : 'var(--dark2)',
              transition: 'background .3s',
            }} />
          ))}
        </div>

        {step === 1 && (
          <form onSubmit={sendOtp} className="fade-up-3">
            <div className="form-group">
              <label>Phone number</label>
              <input
                value={phone} onChange={handlePhone}
                placeholder="10-digit number" required
                inputMode="numeric" pattern="[0-9]*" maxLength={10}
              />
            </div>
            {error && <p className="msg-error" style={{ marginBottom: 12 }}>{error}</p>}
            <button className="btn-primary" type="submit" disabled={loading || phone.length < 10}>
              {loading ? 'Sending OTP...' : 'Send OTP →'}
            </button>
            <p style={{ color: 'var(--gray3)', fontSize: 11, textAlign: 'center', marginTop: 10 }}>OTP valid for 10 minutes</p>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={resetPassword} className="fade-up-3">
            <div className="form-group">
              <label>6-digit OTP</label>
              <input
                value={otp} onChange={handleOtp}
                placeholder="______" required
                inputMode="numeric" pattern="[0-9]*" maxLength={6}
                style={{ letterSpacing: 10, fontSize: 22, textAlign: 'center' }}
              />
              {otp && <p style={{ color: 'var(--gray3)', fontSize: 11, marginTop: 4, textAlign: 'center' }}>{otp.length}/6 digits</p>}
            </div>
            <div className="form-group">
              <label>New password</label>
              <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Min 6 characters" required minLength={6} />
            </div>
            {error   && <p className="msg-error"   style={{ marginBottom: 12 }}>{error}</p>}
            {success && <p className="msg-success" style={{ marginBottom: 12 }}>{success}</p>}
            <button className="btn-primary" type="submit" disabled={loading || otp.length !== 6}>
              {loading ? 'Resetting...' : 'Reset Password →'}
            </button>
            <button type="button" className="btn-ghost" style={{ marginTop: 10 }}
              onClick={() => { setStep(1); setError(''); setOtp(''); }}>
              Resend OTP
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
