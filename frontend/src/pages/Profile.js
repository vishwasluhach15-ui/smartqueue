import React from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';

export default function Profile(){
  const {user,logout}=useAuth(),navigate=useNavigate();
  return(
    <div className="shell">
      <div style={{position:'fixed',top:0,left:0,right:0,height:260,background:'radial-gradient(ellipse at 50% -20%,rgba(99,102,241,.12),transparent 70%)',pointerEvents:'none'}}/>
      <div className="scr" style={{position:'relative'}}>
        <button className="bk" onClick={()=>navigate('/')}>← Back</button>
        <div className="a1" style={{textAlign:'center',padding:'12px 0 26px'}}>
          <div className="fl" style={{width:74,height:74,borderRadius:'50%',margin:'0 auto 16px',background:'var(--g1)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:800,fontSize:28,fontFamily:'Space Grotesk,sans-serif',boxShadow:'0 8px 28px rgba(99,102,241,.4)'}}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <h2 style={{fontSize:20}}>{user?.name}</h2>
          <p style={{color:'var(--m)',fontSize:13,marginTop:4}}>{user?.phone}</p>
          <span style={{display:'inline-block',marginTop:10,background:'rgba(99,102,241,.15)',color:'var(--p2)',fontSize:10,fontWeight:700,padding:'5px 14px',borderRadius:20,letterSpacing:1,textTransform:'uppercase',border:'1px solid rgba(99,102,241,.3)'}}>{user?.role==='admin'?'Administrator':'Citizen'}</span>
        </div>
        <div className="hr a2"/>
        <p className="lbl a2">Account Details</p>
        {[{l:'Name',v:user?.name},{l:'Phone',v:user?.phone},{l:'Role',v:user?.role==='admin'?'Office Admin':'Citizen'}].map((r,i)=>(
          <div key={r.l} className={`a${i+2}`} style={{background:'var(--s1)',border:'1px solid var(--b1)',borderRadius:14,padding:'14px 18px',marginBottom:8,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{color:'var(--m)',fontSize:13}}>{r.l}</span>
            <span style={{color:'#fff',fontSize:13,fontWeight:600}}>{r.v}</span>
          </div>
        ))}
        <div className="hr a3"/>
        <button className="a3" onClick={()=>navigate('/forgot-password')} style={{width:'100%',background:'var(--s1)',border:'1px solid var(--b1)',borderRadius:14,padding:'14px 18px',marginBottom:10,display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer',transition:'background .2s',fontFamily:'DM Sans,sans-serif'}}>
          <span style={{color:'#fff',fontSize:13,fontWeight:600}}>Change Password</span>
          <span className="gt" style={{fontSize:18,fontWeight:800}}>›</span>
        </button>
        <button className="btn btn-r a4" onClick={()=>{logout();navigate('/login');}}>Logout</button>
        <p style={{color:'var(--d)',fontSize:11,textAlign:'center',marginTop:22}}>Smart Queue v2.0 · India Innovates 2026</p>
      </div>
    </div>
  );
}
