import React,{useState} from 'react';
import {useNavigate} from 'react-router-dom';
import api from '../api';

export default function ForgotPassword(){
  const navigate=useNavigate();
  const [step,ss]=useState(1);
  const [phone,sp]=useState('');
  const [otp,so]=useState('');
  const [pass,sa]=useState('');
  const [ld,sl]=useState(false);
  const [err,se]=useState('');
  const [suc,su]=useState('');

  const sendOtp=async e=>{
    e.preventDefault();se('');sl(true);
    try{await api.post('/auth/send-otp',{phone});ss(2);}
    catch(e){se(e.response?.data?.message||'Failed');}
    finally{sl(false);}
  };
  const reset=async e=>{
    e.preventDefault();
    if(otp.length!==6){se('Enter complete 6-digit OTP');return;}
    se('');sl(true);
    try{await api.post('/auth/reset-password',{phone,otp,newPassword:pass});su('Password reset!');setTimeout(()=>navigate('/login'),2000);}
    catch(e){se(e.response?.data?.message||'Invalid OTP.');}
    finally{sl(false);}
  };

  return(
    <div className="shell">
      <div className="scr" style={{display:'flex',flexDirection:'column',paddingBottom:30}}>
        <button className="bk" onClick={()=>navigate('/login')}>← Back</button>
        <div className="a1" style={{marginBottom:28}}>
          <h1>Reset Password</h1>
          <p style={{color:'var(--m)',marginTop:6,fontSize:14}}>{step===1?'Enter your phone to receive OTP':`OTP sent to ${phone}`}</p>
        </div>
        <div className="a2" style={{display:'flex',gap:8,marginBottom:32}}>
          {[1,2].map(s=><div key={s} style={{flex:1,height:3,borderRadius:3,background:step>=s?'var(--g1)':'var(--s2)',transition:'background .3s',boxShadow:step>=s?'0 0 8px rgba(99,102,241,.4)':'none'}}/>)}
        </div>
        {step===1&&<form onSubmit={sendOtp} className="a3">
          <div className="fg"><label>Phone number</label>
            <input value={phone} onChange={e=>sp(e.target.value.replace(/\D/g,'').slice(0,10))} placeholder="10-digit number" required inputMode="numeric" maxLength={10}/>
          </div>
          {err&&<p className="er" style={{marginBottom:12}}>{err}</p>}
          <button className="btn btn-p" type="submit" disabled={ld||phone.length<10}>{ld?'Sending...':'Send OTP →'}</button>
        </form>}
        {step===2&&<form onSubmit={reset} className="a3">
          <div className="fg"><label>6-digit OTP</label>
            <input value={otp} onChange={e=>so(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="0  0  0  0  0  0" required inputMode="numeric" maxLength={6} style={{letterSpacing:14,fontSize:28,textAlign:'center',fontFamily:'Space Grotesk,sans-serif',fontWeight:800}}/>
            <p style={{color:'var(--m)',fontSize:11,marginTop:6,textAlign:'center'}}>{otp.length}/6 digits</p>
          </div>
          <div className="fg"><label>New password</label><input type="password" value={pass} onChange={e=>sa(e.target.value)} placeholder="Min 6 characters" required minLength={6}/></div>
          {err&&<p className="er" style={{marginBottom:12}}>{err}</p>}
          {suc&&<p className="ok" style={{marginBottom:12}}>{suc}</p>}
          <button className="btn btn-p" type="submit" disabled={ld||otp.length!==6}>{ld?'Resetting...':'Reset Password →'}</button>
          <button type="button" className="btn btn-o" style={{marginTop:10}} onClick={()=>{ss(1);se('');so('');}}>Resend OTP</button>
        </form>}
      </div>
    </div>
  );
}
