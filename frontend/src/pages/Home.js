import React,{useEffect,useState} from 'react';
import {useNavigate,Link} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
import api from '../api';

export default function Home(){
  const {user,logout}=useAuth(),navigate=useNavigate();
  const [offices,so]=useState([]);
  const [tokens,st]=useState([]);
  const [loading,sl]=useState(true);
  const [city,sc]=useState('All');

  useEffect(()=>{
    Promise.all([api.get('/offices'),api.get('/tokens/my')])
      .then(([o,t])=>{so(o.data);st(t.data.filter(x=>['waiting','serving'].includes(x.status)));})
      .catch(()=>{}).finally(()=>sl(false));
  },[]);

  if(loading) return <div className="ld"><div className="sp"/></div>;

  const active=tokens[0];
  const cities=['All',...new Set(offices.map(o=>o.city))];
  const filtered=city==='All'?offices:offices.filter(o=>o.city===city);

  return(
    <div className="shell">
      <div style={{position:'fixed',top:0,right:0,width:220,height:220,borderRadius:'50%',background:'radial-gradient(circle,rgba(99,102,241,.07),transparent 70%)',pointerEvents:'none'}}/>
      <div className="scr">

        {/* Header */}
        <div className="a1" style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'22px 0 8px'}}>
          <div>
            <p style={{color:'var(--m)',fontSize:10,letterSpacing:2,textTransform:'uppercase',marginBottom:4,fontWeight:700}}>Smart Queue</p>
            <h2>Hey, {user?.name?.split(' ')[0]} 👋</h2>
          </div>
          <button onClick={logout} style={{width:40,height:40,borderRadius:'50%',background:'var(--g1)',border:'none',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:800,fontSize:15,cursor:'pointer',boxShadow:'0 4px 14px rgba(99,102,241,.4)',fontFamily:'Space Grotesk,sans-serif'}}>
            {user?.name?.[0]?.toUpperCase()}
          </button>
        </div>

        {/* Active token */}
        {active?(
          <div className="a2" onClick={()=>navigate(`/token/${active._id}`)} style={{borderRadius:22,padding:22,marginBottom:16,cursor:'pointer',background:'linear-gradient(135deg,#12173d,#1e1040)',border:'1px solid rgba(99,102,241,.3)',position:'relative',overflow:'hidden',boxShadow:'0 8px 30px rgba(99,102,241,.18)',transition:'transform .2s'}}>
            <div style={{position:'absolute',top:-50,right:-50,width:160,height:160,borderRadius:'50%',background:'radial-gradient(circle,rgba(99,102,241,.25),transparent 70%)'}}/>
            <div style={{position:'absolute',bottom:-30,left:-30,width:120,height:120,borderRadius:'50%',background:'radial-gradient(circle,rgba(244,63,94,.15),transparent 70%)'}}/>
            <div style={{position:'relative',zIndex:1}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}}>
                <div>
                  <p style={{color:'rgba(255,255,255,.45)',fontSize:9,letterSpacing:2,textTransform:'uppercase',marginBottom:5,fontWeight:700}}>Active Token</p>
                  <p className="gt" style={{fontSize:62,fontWeight:800,fontFamily:'Space Grotesk,sans-serif',lineHeight:1,letterSpacing:-3}}>
                    {String(active.tokenNumber).padStart(3,'0')}
                  </p>
                  <p style={{color:'rgba(255,255,255,.55)',fontSize:12,marginTop:6,maxWidth:190}}>{active.office?.name}</p>
                </div>
                <div style={{background:active.status==='serving'?'var(--g3)':'rgba(255,255,255,.1)',color:'#fff',fontSize:9,fontWeight:800,padding:'6px 13px',borderRadius:20,letterSpacing:1,flexShrink:0,boxShadow:active.status==='serving'?'0 4px 14px rgba(245,158,11,.4)':'none'}}>
                  {active.status==='serving'?'● YOUR TURN':'○ WAITING'}
                </div>
              </div>
              <div style={{display:'flex',gap:8}}>
                {[{l:'Ahead',v:active.peopleAhead},{l:'Wait',v:`~${active.estimatedWait}m`},{l:'Service',v:active.service?.split(' ')[0]}].map(i=>(
                  <div key={i.l} style={{background:'rgba(0,0,0,.3)',borderRadius:10,padding:'9px 10px',flex:1}}>
                    <p style={{color:'rgba(255,255,255,.35)',fontSize:8,textTransform:'uppercase',letterSpacing:1,fontWeight:700}}>{i.l}</p>
                    <p style={{color:'#fff',fontSize:13,fontWeight:700,marginTop:3}}>{i.v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ):(
          <div className="a2" style={{border:'1px dashed rgba(99,102,241,.3)',borderRadius:20,padding:22,textAlign:'center',marginBottom:16,background:'rgba(99,102,241,.03)'}}>
            <p style={{color:'var(--m)',fontSize:13}}>No active token — tap an office below to book</p>
          </div>
        )}

        {/* City filter */}
        <div className="a3" style={{display:'flex',gap:8,overflowX:'auto',paddingBottom:4,scrollbarWidth:'none',marginBottom:0}}>
          {cities.map(c=><button key={c} className={`fp ${city===c?'on':''}`} onClick={()=>sc(c)}>{c}</button>)}
        </div>

        <p className="lbl a3">{filtered.length} {city!=='All'?city+' ':''}offices</p>

        {offices.length===0&&(
          <div style={{textAlign:'center',padding:'28px 0'}}>
            <p style={{color:'var(--m)',fontSize:13,marginBottom:14}}>No offices loaded</p>
            <button className="btn btn-o" style={{width:'auto',padding:'10px 22px'}} onClick={()=>api.post('/offices/seed/demo').then(()=>window.location.reload())}>Load demo data</button>
          </div>
        )}

        {filtered.map((o,i)=>{
          const inQ=Math.max(0,o.lastToken-o.currentToken),wait=inQ*5;
          const wc=wait<15?'#10b981':wait<40?'#f59e0b':'#ef4444';
          const bgs={Rohtak:'rgba(99,102,241,.06)',Delhi:'rgba(6,182,212,.06)',Gurugram:'rgba(245,158,11,.05)'};
          return(
            <div key={o._id} className="card card-i a3" style={{animationDelay:`${i*.05}s`,background:bgs[o.city]||'var(--s1)',border:'1px solid rgba(255,255,255,.08)'}} onClick={()=>navigate(`/book/${o._id}`)}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div style={{flex:1,minWidth:0,paddingRight:12}}>
                  <div style={{marginBottom:7}}>
                    <span style={{background:'rgba(99,102,241,.18)',color:'#a5b4fc',fontSize:9,fontWeight:800,padding:'3px 9px',borderRadius:6,letterSpacing:.8,textTransform:'uppercase'}}>{o.city}</span>
                  </div>
                  <h3 style={{fontSize:14,marginBottom:5,fontWeight:700,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{o.name}</h3>
                  <p style={{color:'var(--m)',fontSize:11,marginBottom:10}}>{o.address}</p>
                  <div style={{display:'flex',alignItems:'center',gap:7}}>
                    <span style={{width:6,height:6,borderRadius:'50%',background:'#10b981',display:'inline-block',flexShrink:0}}/>
                    <span style={{color:'#10b981',fontSize:11,fontWeight:700}}>Serving #{o.currentToken}</span>
                    <span style={{color:'var(--m)',fontSize:11}}>· {inQ} waiting</span>
                  </div>
                </div>

                {/* Wait time — bold colored number */}
                <div style={{textAlign:'right',flexShrink:0}}>
                  <p style={{color:wc,fontSize:32,fontWeight:800,fontFamily:'Space Grotesk,sans-serif',letterSpacing:-1,lineHeight:1}}>
                    {wait}
                    <span style={{fontSize:12,color:'var(--m)',fontWeight:500,fontFamily:'DM Sans,sans-serif'}}> min</span>
                  </p>
                  <div style={{marginTop:10,background:'linear-gradient(135deg,#6366f1,#f43f5e)',borderRadius:10,padding:'7px 16px',fontSize:12,color:'#fff',fontWeight:700,textAlign:'center',boxShadow:'0 4px 12px rgba(99,102,241,.35)',cursor:'pointer'}}>
                    Book →
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div style={{height:10}}/>
      </div>

      {/* Bottom nav — clean icons with active indicator */}
      <nav style={{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:430,background:'rgba(7,8,10,.97)',backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',display:'flex',borderTop:'1px solid rgba(255,255,255,.07)',zIndex:100}}>
        {[
          {to:'/',label:'Home',active:true,icon:<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M2 9L10 2l8 7v9a1 1 0 01-1 1H3a1 1 0 01-1-1V9z" stroke="white" strokeWidth="1.8" fill="none"/><path d="M7 22v-6h6v6" stroke="white" strokeWidth="1.8"/></svg>},
          {to:active?`/token/${active._id}`:'/token-empty',label:'My Token',active:false,icon:<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="1" width="14" height="18" rx="2.5" stroke="white" strokeWidth="1.8"/><path d="M7 7h6M7 11h4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>},
          {to:'/profile',label:'Profile',active:false,icon:<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="3.5" stroke="white" strokeWidth="1.8"/><path d="M3 18c0-3.866 3.134-6 7-6s7 2.134 7 6" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>},
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
