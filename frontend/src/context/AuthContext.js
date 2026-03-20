import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('sq_user');
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  const login = async (phone, password) => {
    const { data } = await api.post('/auth/login', { phone, password });
    localStorage.setItem('sq_token', data.token);
    localStorage.setItem('sq_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (name, phone, password) => {
    const { data } = await api.post('/auth/register', { name, phone, password });
    localStorage.setItem('sq_token', data.token);
    localStorage.setItem('sq_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('sq_token');
    localStorage.removeItem('sq_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
