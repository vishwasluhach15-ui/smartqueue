import React,{useState} from 'react';
import {useNavigate,Link} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
import api from '../api';

export default function Register(){
  const {register}=useAuth(),navigate=useNavigate();
  const [mode,sm]=useState('citizen');
  const [f,sf]=useState({name:'',phone:'',password:'',officeId:'',secretKey:''});
  const [offices,so]=useState([]);
  const [err,se]=useState('');
  const [ld,sl]=useState(false);

  const sw=async m=>{
    sm(m);
    if(m==='admin'&&offices.length===0){
      try{const{data}=await api.get('/offices');so(data);if(data[0])sf(p=>({...p,officeId:data[0]._id}));}catch{}
    }
  };
  const ch=e=>{const{name,value}=e.target;sf(p=>({...p,[name]:name==='phone'?value.replace(/\D/g,'').slice(0,10):value}));};
  const sub=async e=>{
    e.preventDefault();se('');sl(true);
    try{
      if(mode==='citizen'){await register(f.name,f.phone,f.password);navigate('/');}
      else{const{data}=await api.post('/auth/register-admin',{name:f.name,phone:f.phone,password:f.password,officeId:f.officeId,secretKey:f.secretKey});localStorage.setItem('sq_token',data.token);localStorage.setItem('sq_user',JSON.stringify(data.user));navigate('/admin');}
    }catch(e){se(e.response?.data?.message||'Registration failed');}
    finally{sl(false);}
  };

  return(
    <div className="shell">
      <div style={{position:'fixed',top:-100,right:-100,width:300,height:300,borderRadius:'50%',background:'radial-gradient(circle,rgba(99,102,241,.1),transparent 70%)',pointerEvents:'none'}}/>
      <div className="scr" style={{display:'flex',flexDirection:'column',paddingBottom:30}}>
        <button className="bk" onClick={()=>navigate('/login')}>← Back</button>
        <div className="a1" style={{marginBottom:24}}>
          <h1 style={{fontSize:26}}>{mode==='citizen'?'Create Account':'Admin Setup'}</h1>
          <p style={{color:'var(--m)',marginTop:6,fontSize:14}}>{mode==='citizen'?'Free for all citizens':'For office administrators only'}</p>
        </div>
        <div className="tw a2">
          {['citizen','admin'].map(m=>(
            <button key={m} className="tb" onClick={()=>sw(m)} style={{background:mode===m?'#fff':'transparent',color:mode===m?'var(--bg)':'var(--m)',boxShadow:mode===m?'0 2px 8px rgba(0,0,0,.3)':'none'}}>
              {m==='citizen'?'Citizen':'Office Admin'}
            </button>
          ))}
        </div>
        <form onSubmit={sub} className="a3">
          <div className="fg"><label>Full name</label><input name="name" value={f.name} onChange={ch} placeholder="Your name" required/></div>
          <div className="fg"><label>Phone number</label>
            <input name="phone" value={f.phone} onChange={ch} placeholder="10-digit number" required inputMode="numeric" maxLength={10}/>
            {f.phone.length>0&&f.phone.length<10&&<p style={{color:'var(--m)',fontSize:11,marginTop:5}}>{10-f.phone.length} more digits needed</p>}
          </div>
          <div className="fg"><label>Password</label><input name="password" type="password" value={f.password} onChange={ch} placeholder="Min 6 characters" required minLength={6}/></div>
          {mode==='admin'&&<>
            <div className="hr"/>
            <div className="fg"><label>Assigned office</label>
              <select name="officeId" value={f.officeId} onChange={ch} required>
                {offices.map(o=><option key={o._id} value={o._id}>{o.name} — {o.city}</option>)}
              </select>
            </div>
            <div className="fg"><label>Admin secret key</label><input name="secretKey" value={f.secretKey} onChange={ch} placeholder="Key from administrator" required/></div>
          </>}
          {err&&<p className="er" style={{marginBottom:12}}>{err}</p>}
          <button className="btn btn-p" type="submit" disabled={ld}>{ld?'Creating...':mode==='citizen'?'Create Account →':'Register as Admin →'}</button>
        </form>
        <p style={{color:'var(--m)',fontSize:13,textAlign:'center',marginTop:20}}>
          Have an account? <Link to="/login" style={{color:'var(--p2)',textDecoration:'none',fontWeight:600}}>Login</Link>
        </p>
      </div>
    </div>
  );
}
