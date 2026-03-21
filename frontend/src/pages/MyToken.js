import React,{useEffect,useState,useCallback} from 'react';
import {useParams,useNavigate,Link} from 'react-router-dom';
import api,{getSocket} from '../api';

export default function MyToken(){
  const {tokenId}=useParams(),navigate=useNavigate();
  const [token,st]=useState(null);
  const [loading,sl]=useState(true);
  const [cancelling,sc]=useState(false);
  const [flash,sf]=useState(false);

  const speak=useCallback(txt=>{
    if(!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(txt);
    u.lang='en-IN';u.rate=0.88;u.volume=1;
    window.speechSynthesis.speak(u);
  },[]);

  const fetch_=useCallback(async()=>{
    try{
      const{data}=await api.get(`/tokens/${tokenId}`);
      st(prev=>{
        if(prev&&data.status==='serving'&&prev.status!=='serving'){speak('Your token is now being called. Please proceed to the counter.');sf(true);setTimeout(()=>sf(false),3000);}
        if(prev&&data.peopleAhead===3&&prev.peopleAhead>3) speak('Alert! Only 3 people ahead. Head to the office now.');
        return data;
      });
    }catch{navigate('/');}
    finally{sl(false);}
  },[tokenId,navigate,speak]);

  useEffect(()=>{fetch_();},[fetch_]);
  useEffect(()=>{
    if(!token?.office?._id) return;
    const s=getSocket();
    s.emit('join_office',token.office._id);
    s.on('queue_update',d=>{if(d.type==='next_called'){fetch_();sf(true);setTimeout(()=>sf(false),2500);}});
    return()=>s.off('queue_update');
  },[token?.office?._id,fetch_]);

  const cancel=async()=>{
    if(!window.confirm('Cancel your token?')) return;
    sc(true);
    try{await api.patch(`/tokens/${tokenId}/cancel`);navigate('/');}
    catch(e){alert(e.response?.data?.message||'Error');sc(false);}
  };

  if(loading) return <div className="ld"><div className="sp"/><p style={{color:'var(--m)',fontSize:12,marginTop:0}}>Loading...</p></div>;
  if(!token) return <div className="ld">Not found</div>;

  const isMyTurn=token.status==='serving';
  const isDone=['done','cancelled','no_show'].includes(token.status);
  const pct=token.office?Math.min(100,Math.round((token.office.currentToken/token.tokenNumber)*100)):0;
  const R=62,C=2*Math.PI*R;
  const ahead=token.peopleAhead;
  const posLabel=ahead===0?'🎉 You\'re next!':ahead<=3?`⚡ Only ${ahead} ahead!`:`#${ahead+1} in queue`;
  const posColor=ahead===0?'#f59e0b':ahead<=3?'#a5b4fc':'#64748b';
  // Color for people ahead number — always visible
  const aheadColor=ahead===0?'#10b981':ahead<=5?'#f59e0b':ahead<=15?'#fb923c':'#ef4444';

  return(
    <div className="shell">
      <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,pointerEvents:'none',zIndex:0}}>
        <div style={{position:'absolute',top:-150,right:-150,width:400,height:400,borderRadius:'50%',background:`radial-gradient(circle,${isMyTurn?'rgba(245,158,11,.1)':'rgba(99,102,241,.08)'},transparent 70%)`,transition:'background 1s'}}/>
      </div>
      <div className="scr" style={{position:'relative',zIndex:1}}>
        <button className="bk" onClick={()=>navigate('/')}>← Home</button>

        {/* YOUR TURN */}
        {isMyTurn&&(
          <div className="as" style={{borderRadius:18,padding:'18px 20px',textAlign:'center',marginBottom:18,background:'var(--g3)',boxShadow:'0 8px 36px rgba(245,158,11,.4)'}}>
            <p style={{color:'#fff',fontSize:20,fontWeight:800,fontFamily:'Space Grotesk,sans-serif'}}>🎉 It's Your Turn!</p>
            <p style={{color:'rgba(255,255,255,.8)',fontSize:13,marginTop:4}}>Please proceed to the counter immediately</p>
          </div>
        )}

        {/* ALMOST THERE */}
        {!isDone&&!isMyTurn&&ahead<=3&&ahead>0&&(
          <div style={{borderRadius:14,padding:'12px 16px',textAlign:'center',marginBottom:14,background:'rgba(99,102,241,.1)',border:'1px solid rgba(99,102,241,.3)'}}>
            <p style={{color:'#a5b4fc',fontSize:13,fontWeight:700}}>⚡ Only {ahead} {ahead===1?'person':'people'} ahead — Head to office now!</p>
          </div>
        )}

        {/* RING */}
        <div className="a1" style={{textAlign:'center',marginBottom:8}}>
          <p style={{color:'var(--m)',fontSize:10,letterSpacing:2,textTransform:'uppercase',marginBottom:18,fontWeight:700}}>Your Token</p>
          <div style={{position:'relative',width:180,height:180,margin:'0 auto 14px'}}>
            {flash&&<>
              <div style={{position:'absolute',inset:-16,borderRadius:'50%',border:'2px solid rgba(99,102,241,.4)',animation:'rp 1s ease-out'}}/>
              <div style={{position:'absolute',inset:-16,borderRadius:'50%',border:'2px solid rgba(244,63,94,.25)',animation:'rp 1s .25s ease-out'}}/>
            </>}
            <svg width="180" height="180" viewBox="0 0 180 180" style={{transform:'rotate(-90deg)',position:'relative',zIndex:1}}>
              <circle cx="90" cy="90" r={R} fill="none" stroke="rgba(255,255,255,.05)" strokeWidth="12"/>
              <circle cx="90" cy="90" r={R} fill="none" stroke={`url(#${isMyTurn?'gf':'gv'})`} strokeWidth="12" strokeLinecap="round"
                strokeDasharray={C} strokeDashoffset={C*(1-pct/100)}
                style={{transition:'stroke-dashoffset 1.4s cubic-bezier(.4,0,.2,1)',filter:`drop-shadow(0 0 8px ${isMyTurn?'rgba(245,158,11,.5)':'rgba(99,102,241,.5)'})`}}/>
              <defs>
                <linearGradient id="gv" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#6366f1"/><stop offset="100%" stopColor="#f43f5e"/></linearGradient>
                <linearGradient id="gf" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#f59e0b"/><stop offset="100%" stopColor="#ef4444"/></linearGradient>
              </defs>
            </svg>
            <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',zIndex:2}}>
              <p style={{color:'var(--m)',fontSize:9,letterSpacing:1.5,textTransform:'uppercase',fontWeight:700}}>Token</p>
              <p className={isMyTurn?'gt3':'gt'} style={{fontSize:50,fontWeight:800,fontFamily:'Space Grotesk,sans-serif',letterSpacing:-3,lineHeight:1}}>
                {String(token.tokenNumber).padStart(3,'0')}
              </p>
              <span className={`tag tag-${token.status}`} style={{marginTop:5,fontSize:9,fontWeight:800}}>
                {token.status==='serving'?'● YOUR TURN':token.status.toUpperCase().replace('_',' ')}
              </span>
            </div>
          </div>

          {/* Position label */}
          {!isDone&&<p style={{color:posColor,fontSize:15,fontWeight:800,fontFamily:'Space Grotesk,sans-serif',marginBottom:4}}>{posLabel}</p>}
          <p style={{color:'var(--m)',fontSize:12,fontWeight:500}}>{token.office?.name}</p>
          <p style={{color:'var(--d)',fontSize:11,marginTop:2}}>{token.service}</p>
        </div>

        {/* STATS — people ahead in bold colored number */}
        {!isDone&&(
          <div className="a2" style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:14}}>
            <div className="card" style={{textAlign:'center',padding:'14px 8px',background:'var(--s1)'}}>
              <p style={{color:aheadColor,fontSize:22,fontWeight:800,fontFamily:'Space Grotesk,sans-serif'}}>{ahead}</p>
              <p style={{color:'var(--m)',fontSize:9,marginTop:4,textTransform:'uppercase',letterSpacing:.8,fontWeight:700}}>Ahead</p>
            </div>
            <div className="card" style={{textAlign:'center',padding:'14px 8px',background:'var(--s1)'}}>
              <p className="gt2" style={{fontSize:22,fontWeight:800,fontFamily:'Space Grotesk,sans-serif'}}>#{String(token.office?.currentToken||0).padStart(3,'0')}</p>
              <p style={{color:'var(--m)',fontSize:9,marginTop:4,textTransform:'uppercase',letterSpacing:.8,fontWeight:700}}>Serving</p>
            </div>
            <div className="card" style={{textAlign:'center',padding:'14px 8px',background:'var(--s1)'}}>
              <p className="gt3" style={{fontSize:22,fontWeight:800,fontFamily:'Space Grotesk,sans-serif'}}>~{token.estimatedWait}m</p>
              <p style={{color:'var(--m)',fontSize:9,marginTop:4,textTransform:'uppercase',letterSpacing:.8,fontWeight:700}}>Wait</p>
            </div>
          </div>
        )}

        {/* PROGRESS */}
        {!isDone&&(
          <div className="a3" style={{marginBottom:14}}>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:'var(--m)',marginBottom:6,fontWeight:700,letterSpacing:.5}}>
              <span>QUEUE PROGRESS</span><span style={{color:'#a5b4fc'}}>{pct}%</span>
            </div>
            <div style={{background:'var(--s2)',borderRadius:8,height:8,overflow:'hidden'}}>
              <div style={{background:'var(--g1)',height:8,borderRadius:8,width:`${pct}%`,transition:'width 1.4s cubic-bezier(.4,0,.2,1)',boxShadow:'0 0 12px rgba(99,102,241,.5)'}}/>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',marginTop:5}}>
              {[25,50,75,100].map(m=><p key={m} style={{fontSize:9,color:pct>=m?'#a5b4fc':'var(--d)',fontWeight:700}}>{m}%</p>)}
            </div>
          </div>
        )}

        {/* LIVE NOTICE */}
        {!isDone&&!isMyTurn&&(
          <div className="a3" style={{background:'rgba(99,102,241,.07)',border:'1px solid rgba(99,102,241,.2)',borderRadius:14,padding:'12px 16px',display:'flex',gap:10,alignItems:'center',marginBottom:14}}>
            <span style={{width:7,height:7,borderRadius:'50%',background:'#10b981',flexShrink:0,animation:'pu 2s infinite',display:'inline-block'}}/>
            <p style={{color:'#94a3b8',fontSize:12}}>Live updates · Voice alert when your turn comes</p>
          </div>
        )}

        {/* DONE */}
        {isDone&&(
          <div className="as card" style={{textAlign:'center',padding:26,marginBottom:16}}>
            <p style={{color:'var(--m)',fontSize:14}}>
              {token.status==='done'?'✅ Service completed. Thank you!':token.status==='cancelled'?'Token cancelled.':'Marked no-show.'}
            </p>
            <button className="btn btn-p" style={{marginTop:18}} onClick={()=>navigate('/')}>Back to Home</button>
          </div>
        )}

        {token.status==='waiting'&&<button className="btn btn-r a4" onClick={cancel} disabled={cancelling}>{cancelling?'Cancelling...':'Cancel Token'}</button>}
      </div>

      {/* Bottom nav */}
      <nav style={{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:430,background:'rgba(7,8,10,.97)',backdropFilter:'blur(20px)',display:'flex',borderTop:'1px solid rgba(255,255,255,.07)',zIndex:100}}>
        {[
          {to:'/',label:'Home',icon:<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M2 9L10 2l8 7v9a1 1 0 01-1 1H3a1 1 0 01-1-1V9z" stroke="white" strokeWidth="1.8" fill="none"/><path d="M7 22v-6h6v6" stroke="white" strokeWidth="1.8"/></svg>},
          {to:`/token/${tokenId}`,label:'My Token',active:true,icon:<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="1" width="14" height="18" rx="2.5" stroke="white" strokeWidth="1.8"/><path d="M7 7h6M7 11h4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>},
          {to:'/profile',label:'Profile',icon:<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="3.5" stroke="white" strokeWidth="1.8"/><path d="M3 18c0-3.866 3.134-6 7-6s7 2.134 7 6" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>},
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
