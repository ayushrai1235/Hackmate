import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount or if token in URL
  useEffect(() => {
    const checkAuth = async () => {
      // Check URL for token (from OAuth redirect)
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token');
      
      if (urlToken) {
        localStorage.setItem('token', urlToken);
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
        } catch (error) {
          console.error("Auth check failed:", error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const res = await api.post('/auth/login', credentials);
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        return { success: true, user: res.data.user };
      }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        return { success: true, user: res.data.user };
      }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
