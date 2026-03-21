import React from 'react';
import {useNavigate,Link} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';

export default function Profile(){
  const {user,logout}=useAuth(),navigate=useNavigate();

  const items=[
    {icon:'👤',label:'Full Name',value:user?.name},
    {icon:'📱',label:'Phone',value:user?.phone},
    {icon:'🏷️',label:'Account Type',value:user?.role==='admin'?'Office Administrator':'Citizen'},
  ];

  return(
    <div className="shell">
      <div style={{position:'fixed',top:0,left:0,right:0,height:280,background:'radial-gradient(ellipse at 50% -10%,rgba(99,102,241,.14),transparent 70%)',pointerEvents:'none'}}/>
      <div className="scr" style={{position:'relative'}}>
        <button className="bk" onClick={()=>navigate('/')}>← Back</button>

        {/* Avatar section */}
        <div className="a1" style={{textAlign:'center',padding:'8px 0 30px'}}>
          <div className="fl" style={{width:78,height:78,borderRadius:'50%',margin:'0 auto 16px',background:'var(--g1)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:800,fontSize:30,fontFamily:'Space Grotesk,sans-serif',boxShadow:'0 8px 28px rgba(99,102,241,.5)'}}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <h2 style={{fontSize:22,marginBottom:5}}>{user?.name}</h2>
          <p style={{color:'var(--m)',fontSize:14,marginBottom:12}}>{user?.phone}</p>
          <div style={{display:'inline-flex',alignItems:'center',gap:6,background:'rgba(99,102,241,.12)',border:'1px solid rgba(99,102,241,.25)',borderRadius:20,padding:'6px 16px'}}>
            <div style={{width:7,height:7,borderRadius:'50%',background:'#10b981'}}/>
            <span style={{color:'#a5b4fc',fontSize:11,fontWeight:700,letterSpacing:.8,textTransform:'uppercase'}}>{user?.role==='admin'?'Administrator':'Citizen'}</span>
          </div>
        </div>

        {/* Info cards */}
        <p className="lbl a2">Account Info</p>
        <div className="a2">
          {items.map((item,i)=>(
            <div key={item.label} style={{background:'var(--s1)',border:'1px solid rgba(255,255,255,.07)',borderRadius:14,padding:'16px 18px',marginBottom:8,display:'flex',alignItems:'center',gap:14}}>
              <div style={{width:38,height:38,borderRadius:10,background:'rgba(99,102,241,.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>
                {item.icon}
              </div>
              <div>
                <p style={{color:'var(--m)',fontSize:11,fontWeight:600,letterSpacing:.8,textTransform:'uppercase',marginBottom:3}}>{item.label}</p>
                <p style={{color:'#fff',fontSize:14,fontWeight:600}}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <p className="lbl a3">Settings</p>
        <div className="a3">
          <button onClick={()=>navigate('/forgot-password')} style={{width:'100%',background:'var(--s1)',border:'1px solid rgba(255,255,255,.07)',borderRadius:14,padding:'16px 18px',marginBottom:8,display:'flex',alignItems:'center',gap:14,cursor:'pointer',transition:'background .2s',textAlign:'left'}}>
            <div style={{width:38,height:38,borderRadius:10,background:'rgba(245,158,11,.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>🔑</div>
            <div style={{flex:1}}>
              <p style={{color:'#fff',fontSize:14,fontWeight:600,fontFamily:'DM Sans,sans-serif'}}>Change Password</p>
              <p style={{color:'var(--m)',fontSize:11,marginTop:2}}>Update your account password</p>
            </div>
            <span style={{color:'var(--m)',fontSize:20}}>›</span>
          </button>

          {user?.role==='admin'&&(
            <button onClick={()=>navigate('/admin')} style={{width:'100%',background:'var(--s1)',border:'1px solid rgba(255,255,255,.07)',borderRadius:14,padding:'16px 18px',marginBottom:8,display:'flex',alignItems:'center',gap:14,cursor:'pointer',textAlign:'left'}}>
              <div style={{width:38,height:38,borderRadius:10,background:'rgba(99,102,241,.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>⚙️</div>
              <div style={{flex:1}}>
                <p style={{color:'#fff',fontSize:14,fontWeight:600,fontFamily:'DM Sans,sans-serif'}}>Admin Dashboard</p>
                <p style={{color:'var(--m)',fontSize:11,marginTop:2}}>Manage office queue</p>
              </div>
              <span style={{color:'var(--m)',fontSize:20}}>›</span>
            </button>
          )}
        </div>

        <div className="a4" style={{marginTop:8}}>
          <button onClick={()=>{logout();navigate('/login');}} style={{width:'100%',background:'rgba(239,68,68,.07)',border:'1px solid rgba(239,68,68,.2)',borderRadius:14,padding:'15px 18px',display:'flex',alignItems:'center',gap:14,cursor:'pointer',textAlign:'left'}}>
            <div style={{width:38,height:38,borderRadius:10,background:'rgba(239,68,68,.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>🚪</div>
            <span style={{color:'#ef4444',fontSize:14,fontWeight:700,fontFamily:'DM Sans,sans-serif'}}>Logout</span>
          </button>
        </div>

        <p style={{color:'var(--d)',fontSize:11,textAlign:'center',marginTop:26}}>Smart Queue v2.0 · India Innovates 2026 · UIET MDU Rohtak</p>
      </div>

      {/* Bottom nav */}
      <nav style={{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:430,background:'rgba(7,8,10,.97)',backdropFilter:'blur(20px)',display:'flex',borderTop:'1px solid rgba(255,255,255,.07)',zIndex:100}}>
        {[
          {to:'/',label:'Home',icon:<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M2 9L10 2l8 7v9a1 1 0 01-1 1H3a1 1 0 01-1-1V9z" stroke="white" strokeWidth="1.8" fill="none"/><path d="M7 22v-6h6v6" stroke="white" strokeWidth="1.8"/></svg>},
          {to:'/',label:'My Token',icon:<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="1" width="14" height="18" rx="2.5" stroke="white" strokeWidth="1.8"/><path d="M7 7h6M7 11h4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>},
          {to:'/profile',label:'Profile',active:true,icon:<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="3.5" stroke="white" strokeWidth="1.8"/><path d="M3 18c0-3.866 3.134-6 7-6s7 2.134 7 6" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>},
        ].map((item,idx)=>(
          <Link key={idx} to={item.to} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',padding:'10px 4px 12px',textDecoration:'none',opacity:item.active?1:.35,transition:'opacity .2s',gap:4,position:'relative'}}>
            {item.active&&<div style={{position:'absolute',top:0,left:'50%',transform:'translateX(-50%)',width:24,height:3,background:'linear-gradient(90deg,#6366f1,#f43f5e)',borderRadius:'0 0 4px 4px'}}/>}
            {item.icon}
            <span style={{color:item.active?'#a5b4fc':'#fff',fontSize:9,fontWeight:700,letterSpacing:.8,textTransform:'uppercase'}}>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
