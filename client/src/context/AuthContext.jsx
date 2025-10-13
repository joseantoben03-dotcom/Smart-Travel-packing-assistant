import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('AuthContext init - Token exists:', !!token);
    
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      console.log('Loading user...');
      const response = await api.get('/auth/me');
      console.log('User loaded:', response.data);
      setUser(response.data);
    } catch (error) {
      console.error('Error loading user:', error.response?.data || error.message);
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      console.log('Attempting login for:', email);
      
      if (!email || !password) {
        return { 
          success: false, 
          message: 'Please provide email and password' 
        };
      }

      const response = await api.post('/auth/login', { 
        email: email.trim().toLowerCase(), 
        password 
      });
      
      const { token, user } = response.data;
      console.log('Login successful:', user);
      
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      return { 
        success: false, 
        message: error.response?.data?.msg || 'Login failed' 
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      console.log('Attempting registration for:', { name, email });
      
      if (!name || !email || !password) {
        return { 
          success: false, 
          message: 'Please provide name, email and password' 
        };
      }

      if (password.length < 6) {
        return { 
          success: false, 
          message: 'Password must be at least 6 characters long' 
        };
      }

      const response = await api.post('/auth/register', { 
        name: name.trim(), 
        email: email.trim().toLowerCase(), 
        password 
      });
      
      const { token, user } = response.data;
      console.log('Registration successful:', user);
      
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      return { 
        success: false, 
        message: error.response?.data?.msg || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    console.log('Logging out user:', user?.email);
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};