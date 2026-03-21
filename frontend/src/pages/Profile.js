import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="app-shell">
      <div style={{ position:'fixed',top:0,left:0,right:0,height:250,background:'radial-gradient(ellipse at 50% -20%,rgba(139,92,246,0.15),transparent 70%)',pointerEvents:'none' }}/>
      <div className="screen" style={{ position:'relative' }}>
        <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
        <div className="a1" style={{ textAlign:'center',padding:'12px 0 28px' }}>
          <div className="float" style={{
            width:76,height:76,borderRadius:'50%',margin:'0 auto 16px',
            background:'linear-gradient(135deg,#8b5cf6,#ec4899)',
            display:'flex',alignItems:'center',justifyContent:'center',
            color:'var(--white)',fontWeight:800,fontSize:30,fontFamily:'Syne,sans-serif',
            boxShadow:'0 8px 32px rgba(139,92,246,0.4)',
          }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <h2 style={{ fontSize:22 }}>{user?.name}</h2>
          <p style={{ color:'var(--muted)',fontSize:13,marginTop:4 }}>{user?.phone}</p>
          <span style={{ display:'inline-block',marginTop:10,background:'rgba(139,92,246,0.15)',color:'var(--violet2)',fontSize:10,fontWeight:700,padding:'5px 14px',borderRadius:20,letterSpacing:1,textTransform:'uppercase',border:'1px solid rgba(139,92,246,0.3)' }}>
            {user?.role==='admin'?'Administrator':'Citizen'}
          </span>
        </div>

        <div className="divider a2"/>
        <p className="label a2">Account</p>
        {[{l:'Name',v:user?.name},{l:'Phone',v:user?.phone},{l:'Role',v:user?.role==='admin'?'Office Admin':'Citizen'}].map((r,i)=>(
          <div key={r.l} className={`a${i+2}`} style={{ background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:14,padding:'14px 18px',marginBottom:8,display:'flex',justifyContent:'space-between',alignItems:'center' }}>
            <span style={{ color:'var(--muted)',fontSize:13 }}>{r.l}</span>
            <span style={{ color:'var(--white)',fontSize:13,fontWeight:600 }}>{r.v}</span>
          </div>
        ))}

        <div className="divider a3"/>
        <button className="a3" onClick={()=>navigate('/forgot-password')} style={{ width:'100%',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:14,padding:'14px 18px',marginBottom:10,display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer',transition:'background .2s' }}>
          <span style={{ color:'var(--white)',fontSize:13,fontFamily:'Plus Jakarta Sans,sans-serif',fontWeight:600 }}>Change Password</span>
          <span style={{ background:'var(--grad1)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',fontSize:18 }}>›</span>
        </button>
        <button className="btn-danger a4" onClick={()=>{ logout(); navigate('/login'); }}>Logout</button>
        <p style={{ color:'var(--dim)',fontSize:11,textAlign:'center',marginTop:24 }}>Smart Queue v2.0 · India Innovates 2026</p>
      </div>
    </div>
  );
}
