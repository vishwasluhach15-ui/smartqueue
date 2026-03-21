import React,{useEffect,useState} from 'react';
import {useParams,useNavigate} from 'react-router-dom';
import api from '../api';

export default function BookToken(){
  const {officeId}=useParams(),navigate=useNavigate();
  const [office,so]=useState(null);
  const [svc,ss]=useState('');
  const [loading,sl]=useState(true);
  const [booking,sb]=useState(false);
  const [err,se]=useState('');

  useEffect(()=>{
    api.get(`/offices/${officeId}`)
      .then(r=>{so(r.data);if(r.data.services?.[0])ss(r.data.services[0].name);})
      .catch(()=>se('Office not found')).finally(()=>sl(false));
  },[officeId]);

  const book=async()=>{
    se('');sb(true);
    try{const{data}=await api.post('/tokens/book',{officeId,service:svc});navigate(`/token/${data.token._id}`);}
    catch(e){se(e.response?.data?.message||'Booking failed');sb(false);}
  };

  if(loading) return <div className="ld"><div className="sp"/></div>;
  if(!office) return <div className="ld">{err}</div>;

  const inQ=Math.max(0,office.lastToken-office.currentToken);

  return(
    <div className="shell">
      <div style={{position:'fixed',top:0,right:0,width:200,height:200,borderRadius:'50%',background:'radial-gradient(circle,rgba(6,182,212,.09),transparent 70%)',pointerEvents:'none'}}/>
      <div className="scr">
        <button className="bk" onClick={()=>navigate('/')}>← Back</button>

        <div className="a1" style={{marginBottom:20}}>
          <span style={{background:'rgba(99,102,241,.15)',color:'var(--p2)',fontSize:9,fontWeight:800,padding:'4px 10px',borderRadius:8,letterSpacing:1,textTransform:'uppercase'}}>{office.city}</span>
          <h1 style={{fontSize:21,lineHeight:1.3,marginTop:10,marginBottom:4}}>{office.name}</h1>
          <p style={{color:'var(--m)',fontSize:12}}>{office.address}</p>
        </div>

        <div className="a2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:22}}>
          <div style={{background:'linear-gradient(135deg,rgba(99,102,241,.15),rgba(244,63,94,.08))',border:'1px solid rgba(99,102,241,.25)',borderRadius:16,padding:18,textAlign:'center'}}>
            <p className="gt" style={{fontSize:30,fontWeight:800,fontFamily:'Space Grotesk,sans-serif'}}>#{office.currentToken}</p>
            <p style={{color:'var(--m)',fontSize:10,marginTop:4,textTransform:'uppercase',letterSpacing:.8,fontWeight:700}}>Now serving</p>
          </div>
          <div style={{background:'var(--s1)',border:'1px solid var(--b1)',borderRadius:16,padding:18,textAlign:'center'}}>
            <p style={{color:'var(--am)',fontSize:30,fontWeight:800,fontFamily:'Space Grotesk,sans-serif'}}>~{inQ*5}m</p>
            <p style={{color:'var(--m)',fontSize:10,marginTop:4,textTransform:'uppercase',letterSpacing:.8,fontWeight:700}}>Est. wait</p>
          </div>
        </div>

        <p className="lbl a2">Select service</p>
        <div className="a3" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:22}}>
          {office.services?.map(s=>(
            <div key={s.name} onClick={()=>ss(s.name)} style={{
              background:svc===s.name?'linear-gradient(135deg,rgba(99,102,241,.2),rgba(244,63,94,.15))':'var(--s1)',
              border:`1.5px solid ${svc===s.name?'rgba(99,102,241,.5)':'var(--b1)'}`,
              borderRadius:14,padding:'16px 14px',cursor:'pointer',transition:'all .2s',
              boxShadow:svc===s.name?'0 4px 18px rgba(99,102,241,.2)':'none',
            }}>
              <p style={{color:'#fff',fontSize:12,fontWeight:700,marginBottom:5}}>{s.name}</p>
              <p style={{color:'var(--m)',fontSize:11}}>~{s.avgMinutes} min</p>
            </div>
          ))}
        </div>

        <div className="a4" style={{background:'var(--s1)',border:'1px solid var(--b1)',borderRadius:16,padding:20,marginBottom:22}}>
          <p style={{color:'var(--m)',fontSize:10,textTransform:'uppercase',letterSpacing:1.2,marginBottom:14,fontWeight:700}}>Summary</p>
          {[{k:'Office',v:office.name},{k:'Service',v:svc||'—'},{k:'Your token',v:`#${office.lastToken+1}`,sp:true}].map(r=>(
            <div key={r.k} style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
              <span style={{color:'var(--m)',fontSize:13}}>{r.k}</span>
              <span style={r.sp?{background:'var(--g1)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',fontSize:14,fontWeight:800,fontFamily:'Space Grotesk,sans-serif'}:{color:'var(--w2)',fontSize:13}}>{r.v}</span>
            </div>
          ))}
        </div>

        {err&&<p className="er" style={{marginBottom:12}}>{err}</p>}
        <button className="btn btn-p a5" onClick={book} disabled={booking||!svc}>{booking?'Getting token...':'Confirm & Get Token →'}</button>
        <p style={{color:'var(--m)',fontSize:11,textAlign:'center',marginTop:10}}>SMS alert when 3 people are ahead of you</p>
      </div>
    </div>
  );
}
