import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="app-shell">
      <div className="screen">
        <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
        <div className="a1" style={{ textAlign:'center',padding:'16px 0 28px' }}>
          <div style={{ width:72,height:72,borderRadius:'50%',background:'var(--bg3)',border:'1px solid var(--border2)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--white)',fontWeight:700,fontSize:28,fontFamily:'Space Grotesk,sans-serif',margin:'0 auto 16px' }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <h2 style={{ fontSize:20 }}>{user?.name}</h2>
          <p style={{ color:'var(--muted)',fontSize:13,marginTop:4 }}>{user?.phone}</p>
          <div style={{ display:'inline-block',marginTop:10,background:'var(--bg3)',color:'var(--muted)',fontSize:10,fontWeight:600,padding:'5px 14px',borderRadius:20,letterSpacing:.8,textTransform:'uppercase',border:'1px solid var(--border)' }}>
            {user?.role==='admin'?'Administrator':'Citizen'}
          </div>
        </div>
        <div className="divider a2"/>
        <p className="section-label a2">Account</p>
        {[{l:'Name',v:user?.name},{l:'Phone',v:user?.phone},{l:'Type',v:user?.role==='admin'?'Office Admin':'Citizen'}].map((r,i)=>(
          <div key={r.l} className={`a${i+2}`} style={{ background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:12,padding:'13px 16px',marginBottom:8,display:'flex',justifyContent:'space-between' }}>
            <span style={{ color:'var(--muted)',fontSize:13 }}>{r.l}</span>
            <span style={{ color:'var(--white)',fontSize:13,fontWeight:500 }}>{r.v}</span>
          </div>
        ))}
        <div className="divider a3"/>
        <button className="a3" onClick={() => navigate('/forgot-password')} style={{ width:'100%',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:12,padding:'14px 16px',marginBottom:10,display:'flex',justifyContent:'space-between',cursor:'pointer',color:'var(--white)',fontSize:13,fontFamily:'Outfit,sans-serif',transition:'background .2s' }}>
          <span>Change Password</span><span style={{ color:'var(--muted)' }}>›</span>
        </button>
        <button className="btn-danger a4" onClick={() => { logout(); navigate('/login'); }}>Logout</button>
        <p style={{ color:'var(--muted)',fontSize:11,textAlign:'center',marginTop:24 }}>Smart Queue v2.0 · India Innovates 2026</p>
      </div>
    </div>
  );
}
