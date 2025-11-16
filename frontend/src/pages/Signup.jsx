import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup } from '../api';
import { setToken, setUser } from '../auth';

function Signup(){
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [assigned, setAssigned] = useState(null);

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try{
      // send username if provided, backend will validate/ensure uniqueness
      const payload = username ? { username: username.trim().toLowerCase(), password } : { password };
      const res = await signup(payload);
      setToken(res.data.token);
      setUser(res.data.user);
      // show assigned username so user can note it
      setAssigned(res.data.user.username);
      // optionally navigate after short delay
      setTimeout(() => navigate('/'), 1800);
    }catch(err){
      console.error(err);
      setError(err?.response?.data?.error || 'Signup failed');
    }finally{setLoading(false)}
  }

  return (
    <div>
      <h2 className="page-title">Sign Up</h2>
      <form onSubmit={handle} style={{ display:'flex', flexDirection:'column', gap:8 }}>
        <input placeholder="Choose a username (optional)" value={username} onChange={e=>setUsername(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button disabled={loading}>{loading? 'Signing...' : 'Create account'}</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
      <p style={{ color: 'var(--muted)', marginTop: 10 }}>You may choose a unique username now, or leave blank to have one generated for you.</p>
      {assigned && (
        <div style={{ marginTop: 12 }}>
          <p>Your username: <strong>{assigned}</strong></p>
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>You will be redirected shortly. Use this username with your password to login in future.</p>
        </div>
      )}
    </div>
  )
}

export default Signup;
