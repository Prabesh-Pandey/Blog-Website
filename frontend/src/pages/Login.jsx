import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api';
import { setToken, setUser } from '../auth';

function Login(){
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try{
      const payload = { username: username.trim().toLowerCase(), password };
      const res = await login(payload);
      setToken(res.data.token);
      setUser(res.data.user);
      navigate('/');
    }catch(err){
      console.error(err);
      setError(err?.response?.data?.error || 'Login failed');
    }finally{setLoading(false)}
  }

  return (
    <div>
      <h2 className="page-title">Login</h2>
      <form onSubmit={handle} style={{ display:'flex', flexDirection:'column', gap:8 }}>
        <input placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button disabled={loading}>{loading? 'Signing...' : 'Login'}</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
      <p style={{ color: 'var(--muted)', marginTop: 10 }}>Use the username you received after signing up.</p>
    </div>
  )
}

export default Login;
