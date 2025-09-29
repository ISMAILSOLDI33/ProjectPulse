// src/contexts/AuthContexts.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../Services/Api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const verifyAuth = async () => {
    const token = localStorage.getItem('Token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/verify-token');
      setUser(response.user);
    } catch (error) {
      console.error('Verification error:', error);
      localStorage.removeItem('Token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    verifyAuth();
  }, []);

  const login = async (credentials, isAdmin = false) => {
    try {
      const response = await api.post('/login', credentials);
      localStorage.setItem('Token', response.token);
      setUser(response.user);
      return response.user;
    } catch (error) {
      console.error('Login error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Login failed. Please try again.');
      }
    }
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.warn("Logout error (ignored):", error.message);
    } finally {
      localStorage.removeItem('Token');
      setUser(null);
    }
  };

  const register = async (credentials) => {
    try {
      const response = await api.post('/register', credentials);
      return response;
    } catch (error) {
      console.error('Register error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error.response?.data || error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      register,
      isAuthenticated: !!user,
      isAdmin: user?.is_admin || false
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}