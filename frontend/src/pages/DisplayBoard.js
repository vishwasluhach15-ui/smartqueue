import React,{useEffect,useState,useRef,useCallback} from 'react';
import {useParams} from 'react-router-dom';
import api,{getSocket} from '../api';

export default function DisplayBoard(){
  const {officeId}=useParams();
  const [office,so]=useState(null);
  const [offices,sos]=useState([]);
  const [sel,ss]=useState('');
  const [flash,sf]=useState(false);
  const [time,st]=useState(new Date());
  const [lastCalled,slc]=useState(null);

  const speak=useCallback(txt=>{
    if(!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(txt);
    u.lang='en-IN';u.rate=0.82;u.pitch=1.05;u.volume=1;
    window.speechSynthesis.speak(u);
  },[]);

  const fetch_=useCallback(async()=>{
    try{const id=officeId||localStorage.getItem('sq_db_office');if(!id) return;const{data}=await api.get(`/offices/${id}`);so(data);}catch{}
  },[officeId]);

  useEffect(()=>{fetch_();const i=setInterval(fetch_,8000);return()=>clearInterval(i);},[fetch_]);
  useEffect(()=>{const t=setInterval(()=>st(new Date()),1000);return()=>clearInterval(t);},[]);

  useEffect(()=>{
    if(!officeId) api.get('/offices').then(r=>sos(r.data)).catch(()=>{});
  },[officeId]);

  useEffect(()=>{
    if(!office) return;
    const id=officeId||localStorage.getItem('sq_db_office');
    const s=getSocket();
    s.emit('join_office',id);
    s.on('queue_update',d=>{
      if(d.type==='next_called'){
        fetch_();sf(true);slc(d.calledToken);setTimeout(()=>sf(false),4000);
        speak(`Attention please. Now calling token number ${d.calledToken}. Token number ${d.calledToken}, please proceed to the service counter. Thank you.`);
      }
    });
    return()=>s.off('queue_update');
  },[office,officeId,fetch_,speak]);

  const fmt=d=>d.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:true});
  const fmtD=d=>d.toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'});

  if(!officeId&&!localStorage.getItem('sq_db_office')){
    return(
      <div style={{minHeight:'100vh',background:'#07080a',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:24,fontFamily:'Space Grotesk,sans-serif'}}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700;800&display=swap')`}</style>
        <h1 style={{color:'#fff',fontSize:32,fontWeight:800,background:'linear-gradient(135deg,#6366f1,#f43f5e)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Select Office for Display</h1>
        <select value={sel} onChange={e=>ss(e.target.value)} style={{background:'#161b23',color:'#fff',border:'1px solid rgba(255,255,255,.15)',borderRadius:14,padding:'14px 22px',fontSize:15,minWidth:340,outline:'none'}}>
          <option value="">Choose office...</option>
          {offices.map(o=><option key={o._id} value={o._id}>{o.name} — {o.city}</option>)}
        </select>
        <button onClick={()=>{localStorage.setItem('sq_db_office',sel);window.location.reload();}}
          style={{background:'linear-gradient(135deg,#6366f1,#f43f5e)',color:'#fff',border:'none',borderRadius:14,padding:'14px 36px',fontSize:16,fontWeight:700,cursor:'pointer',boxShadow:'0 4px 20px rgba(99,102,241,.4)'}}>
          Open Display Board →
        </button>
      </div>
    );
  }

  if(!office) return(
    <div style={{minHeight:'100vh',background:'#07080a',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{width:40,height:40,border:'3px solid rgba(99,102,241,.3)',borderTopColor:'#6366f1',borderRadius:'50%',animation:'sp .8s linear infinite'}}/>
      <style>{`@keyframes sp{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const next=[];
  for(let i=1;i<=4;i++) next.push(office.currentToken+i);

  return(
    <div style={{minHeight:'100vh',background:'#07080a',fontFamily:'Space Grotesk,sans-serif',overflow:'hidden',position:'relative'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700;800&family=DM+Sans:wght@400;500&display=swap');
        @keyframes sp{to{transform:rotate(360deg)}}
        @keyframes pu{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes fi{0%{opacity:0;transform:scale(.85)}40%{opacity:1;transform:scale(1.03)}100%{transform:scale(1)}}
        @keyframes rp{0%{transform:scale(1);opacity:.6}100%{transform:scale(3);opacity:0}}
        @keyframes gm{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        .tok{font-size:min(20vw,220px);font-weight:800;letter-spacing:-6px;line-height:1;animation:${flash?'fi .7s cubic-bezier(.4,0,.2,1)':'none'}}
      `}</style>

      {/* Ambient bg */}
      <div style={{position:'fixed',top:-200,left:-200,width:600,height:600,borderRadius:'50%',background:'radial-gradient(circle,rgba(99,102,241,.06),transparent 70%)',pointerEvents:'none'}}/>
      <div style={{position:'fixed',bottom:-200,right:-200,width:500,height:500,borderRadius:'50%',background:'radial-gradient(circle,rgba(244,63,94,.05),transparent 70%)',pointerEvents:'none'}}/>

      {/* Top bar */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'20px 44px',borderBottom:'1px solid rgba(255,255,255,.06)',backdropFilter:'blur(12px)'}}>
        <div style={{display:'flex',alignItems:'center',gap:14}}>
          <div style={{width:42,height:42,borderRadius:13,background:'linear-gradient(135deg,#6366f1,#f43f5e)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 5h14M3 10h10M3 15h6" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
          </div>
          <div>
            <p style={{color:'rgba(255,255,255,.4)',fontSize:10,letterSpacing:2,textTransform:'uppercase',fontWeight:700}}>Smart Queue</p>
            <p style={{color:'#fff',fontSize:17,fontWeight:700}}>{office.name}</p>
          </div>
        </div>
        <div style={{textAlign:'center'}}>
          <p style={{color:'#fff',fontSize:30,fontWeight:800,letterSpacing:-1}}>{fmt(time)}</p>
          <p style={{color:'rgba(255,255,255,.35)',fontSize:12,marginTop:2}}>{fmtD(time)}</p>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8,background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:20,padding:'8px 16px'}}>
          <div style={{width:7,height:7,borderRadius:'50%',background:'#10b981',animation:'pu 2s infinite'}}/>
          <span style={{color:'#10b981',fontSize:12,fontWeight:700}}>{office.isOpen?'LIVE · OPEN':'CLOSED'}</span>
        </div>
      </div>

      {/* Main grid */}
      <div style={{display:'grid',gridTemplateColumns:'3fr 2fr',height:'calc(100vh - 85px)'}}>

        {/* LEFT — Now Serving */}
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'32px 48px',borderRight:'1px solid rgba(255,255,255,.05)',background:flash?'rgba(99,102,241,.04)':'transparent',transition:'background 1.5s'}}>
          <p style={{color:'rgba(255,255,255,.35)',fontSize:12,letterSpacing:3,textTransform:'uppercase',fontWeight:700,marginBottom:20}}>NOW SERVING</p>

          <div style={{position:'relative',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16}}>
            {flash&&<>
              <div style={{position:'absolute',width:'70vw',maxWidth:500,height:'70vw',maxHeight:500,borderRadius:'50%',border:'2px solid rgba(99,102,241,.3)',animation:'rp 1.4s ease-out',pointerEvents:'none'}}/>
              <div style={{position:'absolute',width:'70vw',maxWidth:500,height:'70vw',maxHeight:500,borderRadius:'50%',border:'2px solid rgba(244,63,94,.2)',animation:'rp 1.4s .35s ease-out',pointerEvents:'none'}}/>
            </>}
            <p className="tok" style={{background:'linear-gradient(135deg,#6366f1,#f43f5e,#f59e0b)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',backgroundSize:'200% 200%',animation:(flash?'fi .7s cubic-bezier(.4,0,.2,1), ':'')+'gm 4s ease infinite'}}>
              {String(office.currentToken).padStart(3,'0')}
            </p>
          </div>

          <p style={{color:'rgba(255,255,255,.45)',fontSize:18,fontWeight:400,marginBottom:12,fontFamily:'DM Sans,sans-serif'}}>Please proceed to the service counter</p>

          {lastCalled&&flash&&(
            <div style={{background:'rgba(99,102,241,.15)',border:'1px solid rgba(99,102,241,.3)',borderRadius:16,padding:'10px 24px',marginBottom:16}}>
              <p style={{color:'#818cf8',fontSize:14,fontWeight:700,textAlign:'center'}}>🔔 Just called: Token #{String(lastCalled).padStart(3,'0')}</p>
            </div>
          )}

          <div style={{display:'flex',gap:16,marginTop:20}}>
            {[
              {l:'In Queue',v:Math.max(0,office.lastToken-office.currentToken),c:'#6366f1'},
              {l:'Est. Wait', v:`~${Math.max(0,office.lastToken-office.currentToken)*5}m`,c:'#f43f5e'},
              {l:'Issued Today',v:office.lastToken,c:'#f59e0b'},
            ].map(s=>(
              <div key={s.l} style={{background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)',borderRadius:16,padding:'14px 22px',textAlign:'center',minWidth:110}}>
                <p style={{color:s.c,fontSize:26,fontWeight:800}}>{s.v}</p>
                <p style={{color:'rgba(255,255,255,.35)',fontSize:10,fontWeight:700,letterSpacing:1,textTransform:'uppercase',marginTop:4}}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Up Next */}
        <div style={{display:'flex',flexDirection:'column',padding:'32px 36px',justifyContent:'center'}}>
          <p style={{color:'rgba(255,255,255,.35)',fontSize:12,letterSpacing:3,textTransform:'uppercase',fontWeight:700,marginBottom:24}}>UP NEXT</p>

          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {next.map((tok,i)=>(
              <div key={tok} style={{
                background:i===0?'linear-gradient(135deg,rgba(99,102,241,.15),rgba(244,63,94,.08))':'rgba(255,255,255,.03)',
                border:`1px solid ${i===0?'rgba(99,102,241,.4)':'rgba(255,255,255,.06)'}`,
                borderRadius:18,padding:'18px 24px',
                display:'flex',alignItems:'center',justifyContent:'space-between',
                transition:'all .3s',
                boxShadow:i===0?'0 4px 20px rgba(99,102,241,.15)':'none',
              }}>
                <div style={{display:'flex',alignItems:'center',gap:14}}>
                  <div style={{width:10,height:10,borderRadius:'50%',background:i===0?'linear-gradient(135deg,#6366f1,#f43f5e)':'rgba(255,255,255,.15)'}}/>
                  <p style={{color:i===0?'#fff':'rgba(255,255,255,.4)',fontSize:34,fontWeight:800,letterSpacing:-1}}>
                    {String(tok).padStart(3,'0')}
                  </p>
                </div>
                <div style={{textAlign:'right'}}>
                  <p style={{color:'rgba(255,255,255,.3)',fontSize:13,fontWeight:500}}>~{(i+1)*5} min</p>
                  {i===0&&<span style={{background:'rgba(99,102,241,.2)',color:'#818cf8',fontSize:9,fontWeight:800,padding:'3px 10px',borderRadius:20,letterSpacing:1,display:'block',marginTop:4}}>NEXT</span>}
                </div>
              </div>
            ))}
          </div>

          <div style={{marginTop:'auto',paddingTop:28,borderTop:'1px solid rgba(255,255,255,.05)'}}>
            <p style={{color:'rgba(255,255,255,.25)',fontSize:12,textAlign:'center',fontFamily:'DM Sans,sans-serif'}}>
              Book your token at{' '}
              <span style={{color:'#818cf8',fontWeight:700}}>frontend-three-green-27.vercel.app</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
