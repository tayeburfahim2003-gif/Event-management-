import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API, { getErrorMessage } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await API.get('/auth/me');
      setUser(res.data.data);
      localStorage.setItem('user', JSON.stringify(res.data.data));
    } catch (err) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password, rememberMe = false) => {
    try {
      const res = await API.post('/auth/login', { email, password, rememberMe });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.data));
      setUser(res.data.data);
      return { success: true };
    } catch (err) {
      return { success: false, error: getErrorMessage(err, 'Login failed') };
    }
  };

  const register = async (formData) => {
    try {
      const res = await API.post('/auth/register', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.data));
      setUser(res.data.data);
      return { success: true };
    } catch (err) {
      return { success: false, error: getErrorMessage(err, 'Registration failed') };
    }
  };

  const logout = () => {
    API.post('/auth/logout').catch(() => {}); // clears the httpOnly cookie server-side
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (data) => {
    setUser((prev) => ({ ...prev, ...data }));
    localStorage.setItem('user', JSON.stringify({ ...user, ...data }));
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isOrganizer: user && (user.role === 'organizer' || user.role === 'admin'),
    isAdmin: user && user.role === 'admin',
    login,
    register,
    logout,
    updateUser,
    refreshUser: loadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

export default AuthContext;
