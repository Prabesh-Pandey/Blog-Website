import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getUser, logout } from '../auth';


function Navbar() {
  
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setUser(getUser());
  }, []);

  return (
    <nav className="navbar">
      <div className="nav-left">
        <NavLink to="/" className="logo">My Blog</NavLink>
      </div>

      <div className={`nav-right`}>
        <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setOpen(false)}>Home</NavLink>
        {user ? (
          <>
            <NavLink to="/create" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setOpen(false)}>Create</NavLink>
            <NavLink to="/profile" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setOpen(false)}>Profile</NavLink>
            <span style={{ color: 'var(--muted)', padding: '8px 12px' }}>@{user.username}</span>
            <button className="nav-link" onClick={() => { logout(); setUser(null); navigate('/'); }}>Logout</button>
          </>
        ) : (
          <>
            <NavLink to="/login" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setOpen(false)}>Login</NavLink>
            <NavLink to="/signup" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setOpen(false)}>Sign Up</NavLink>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
