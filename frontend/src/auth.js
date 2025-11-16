// Simple auth helper using localStorage
const TOKEN_KEY = 'blog_token';
const USER_KEY = 'blog_user';

export function setToken(token){
  if(token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function getToken(){
  return localStorage.getItem(TOKEN_KEY);
}

export function setUser(user){
  if(user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
}

export function getUser(){
  const raw = localStorage.getItem(USER_KEY);
  if(!raw) return null;
  try{ return JSON.parse(raw); }catch(e){ return null }
}

export function logout(){
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export default { setToken, getToken, setUser, getUser, logout };
