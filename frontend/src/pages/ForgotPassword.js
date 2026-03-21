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
    catch(e){se(e.response?.data?.message||'Failed to send OTP');}
    finally{sl(false);}
  };

  const reset=async e=>{
    e.preventDefault();
    if(otp.length!==6){se('Enter complete 6-digit OTP');return;}
    se('');sl(true);
    try{
      await api.post('/auth/reset-password',{phone,otp,newPassword:pass});
      su('Password reset successfully!');
      setTimeout(()=>navigate('/login'),2000);
    }
    catch(e){se(e.response?.data?.message||'Invalid OTP. Please try again.');}
    finally{sl(false);}
  };

  return(
    <div className="shell">
      <div style={{position:'fixed',top:-120,right:-120,width:320,height:320,borderRadius:'50%',background:'radial-gradient(circle,rgba(99,102,241,.1),transparent 70%)',pointerEvents:'none'}}/>
      <div className="scr" style={{display:'flex',flexDirection:'column',paddingBottom:30}}>
        <button className="bk" onClick={()=>navigate('/login')}>← Back to Login</button>

        {/* Header */}
        <div className="a1" style={{marginBottom:30}}>
          <div style={{width:52,height:52,borderRadius:16,background:'rgba(99,102,241,.15)',border:'1px solid rgba(99,102,241,.25)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,marginBottom:16}}>
            🔐
          </div>
          <h1 style={{fontSize:26}}>Reset Password</h1>
          <p style={{color:'var(--m)',marginTop:6,fontSize:14}}>
            {step===1?'Enter your registered phone number':'Enter the OTP sent to your phone'}
          </p>
        </div>

        {/* Step indicators */}
        <div className="a2" style={{display:'flex',gap:8,marginBottom:30,alignItems:'center'}}>
          {[{n:1,l:'Phone'},{n:2,l:'Verify'}].map((s,i)=>(
            <React.Fragment key={s.n}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <div style={{width:28,height:28,borderRadius:'50%',background:step>=s.n?'var(--g1)':'var(--s2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color:step>=s.n?'#fff':'var(--m)',boxShadow:step>=s.n?'0 2px 10px rgba(99,102,241,.4)':'none',transition:'all .3s'}}>
                  {step>s.n?'✓':s.n}
                </div>
                <span style={{color:step>=s.n?'#a5b4fc':'var(--m)',fontSize:12,fontWeight:600}}>{s.l}</span>
              </div>
              {i===0&&<div style={{flex:1,height:2,background:step>=2?'var(--g1)':'var(--s2)',borderRadius:2,transition:'background .3s'}}/>}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1 — Phone */}
        {step===1&&(
          <form onSubmit={sendOtp} className="a3">
            <div className="fg">
              <label>Phone number</label>
              <input value={phone} onChange={e=>sp(e.target.value.replace(/\D/g,'').slice(0,10))}
                placeholder="10-digit number" required inputMode="numeric" maxLength={10}/>
              {phone.length>0&&<p style={{color:'var(--m)',fontSize:11,marginTop:5}}>{phone.length}/10 digits</p>}
            </div>
            {err&&<p className="er" style={{marginBottom:14}}>{err}</p>}
            <button className="btn btn-p" type="submit" disabled={ld||phone.length<10}>
              {ld?'Sending OTP...':'Send OTP →'}
            </button>
            <p style={{color:'var(--m)',fontSize:11,textAlign:'center',marginTop:12}}>OTP valid for 10 minutes · Check server logs if SMS not received</p>
          </form>
        )}

        {/* Step 2 — OTP + New Password */}
        {step===2&&(
          <form onSubmit={reset} className="a3">
            {/* OTP display — big and clear */}
            <div className="fg">
              <label>6-Digit OTP</label>
              <input value={otp} onChange={e=>so(e.target.value.replace(/\D/g,'').slice(0,6))}
                placeholder="000000" required inputMode="numeric" maxLength={6}
                style={{letterSpacing:18,fontSize:30,textAlign:'center',fontFamily:'Space Grotesk,sans-serif',fontWeight:800,background:'rgba(99,102,241,.08)',border:`1.5px solid ${otp.length===6?'rgba(99,102,241,.5)':'rgba(255,255,255,.08)'}`,transition:'all .2s'}}/>
              {/* Visual progress dots */}
              <div style={{display:'flex',justifyContent:'center',gap:8,marginTop:10}}>
                {[...Array(6)].map((_,i)=>(
                  <div key={i} style={{width:10,height:10,borderRadius:'50%',background:i<otp.length?'linear-gradient(135deg,#6366f1,#f43f5e)':'var(--s2)',transition:'background .2s',boxShadow:i<otp.length?'0 0 6px rgba(99,102,241,.5)':'none'}}/>
                ))}
              </div>
              <p style={{color:'var(--m)',fontSize:11,textAlign:'center',marginTop:8}}>{otp.length}/6 entered</p>
            </div>

            <div className="fg">
              <label>New Password</label>
              <input type="password" value={pass} onChange={e=>sa(e.target.value)} placeholder="Min 6 characters" required minLength={6}/>
            </div>

            {err&&<p className="er" style={{marginBottom:12}}>{err}</p>}
            {suc&&<p className="ok" style={{marginBottom:12}}>✅ {suc}</p>}

            <button className="btn btn-p" type="submit" disabled={ld||otp.length!==6}>
              {ld?'Resetting...':'Reset Password →'}
            </button>
            <button type="button" className="btn btn-o" style={{marginTop:10}} onClick={()=>{ss(1);se('');so('');}}>
              ← Change phone / Resend OTP
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
