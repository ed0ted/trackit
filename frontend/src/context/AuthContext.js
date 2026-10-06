import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  // refresh the user from the server on page load (role etc. might have changed)
  useEffect(() => {
    if (localStorage.getItem('token')) {
      api.get('/auth/me')
        .then((res) => {
          localStorage.setItem('user', JSON.stringify(res.data));
          setUser(res.data);
        })
        .catch((err) => console.log('could not refresh user', err));
    }
  }, []);

  const saveSession = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    saveSession(res.data);
  };

  const register = async (form) => {
    const res = await api.post('/auth/register', form);
    saveSession(res.data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
