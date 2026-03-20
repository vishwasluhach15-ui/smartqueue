import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <div className="screen">
        <button className="back-btn" onClick={() => navigate('/')}>← Back</button>

        {/* Avatar */}
        <div style={{textAlign:'center',padding:'20px 0 28px'}}>
          <div style={{
            width:72,height:72,borderRadius:'50%',
            background:'var(--mint-dim)',border:'2px solid rgba(2,195,154,0.3)',
            display:'flex',alignItems:'center',justifyContent:'center',
            color:'var(--mint)',fontWeight:700,fontSize:28,
            fontFamily:'Syne,sans-serif',margin:'0 auto 14px',
          }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <h2>{user?.name}</h2>
          <p style={{color:'var(--muted)',fontSize:13,marginTop:4}}>{user?.phone}</p>
          <span style={{
            display:'inline-block',marginTop:8,
            background:'var(--mint-dim)',color:'var(--mint)',
            fontSize:10,fontWeight:600,padding:'4px 12px',
            borderRadius:20,letterSpacing:.8,textTransform:'uppercase',
          }}>
            {user?.role === 'admin' ? '⚙️ Admin' : '👤 Citizen'}
          </span>
        </div>

        <div className="divider"/>

        {/* Info cards */}
        <p className="section-label">Account details</p>
        {[
          {label:'Full name',  val: user?.name},
          {label:'Phone',      val: user?.phone},
          {label:'Account type', val: user?.role === 'admin' ? 'Office Administrator' : 'Citizen'},
        ].map(row => (
          <div key={row.label} className="card" style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'13px 16px'}}>
            <span style={{color:'var(--muted)',fontSize:13}}>{row.label}</span>
            <span style={{color:'var(--white)',fontSize:13,fontWeight:500}}>{row.val}</span>
          </div>
        ))}

        <div className="divider"/>

        {/* Actions */}
        <p className="section-label">Actions</p>

        <button
          className="card"
          onClick={() => navigate('/forgot-password')}
          style={{
            width:'100%',textAlign:'left',cursor:'pointer',
            display:'flex',justifyContent:'space-between',alignItems:'center',
            padding:'13px 16px',border:'1px solid var(--border)',background:'var(--dark2)',
          }}
        >
          <span style={{color:'var(--white)',fontSize:13}}>🔒 Change Password</span>
          <span style={{color:'var(--muted)'}}>→</span>
        </button>

        <div style={{marginTop:10}}>
          <button className="btn-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <p style={{color:'var(--muted)',fontSize:11,textAlign:'center',marginTop:20}}>
          Smart Queue v1.0 · India Innovates 2026
        </p>
      </div>
    </div>
  );
}