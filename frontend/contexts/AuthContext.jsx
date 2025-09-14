import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for saved user data on component mount
    const savedUser = localStorage.getItem('meetocure_admin_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // First check if server is reachable
      try {
        await fetch('http://localhost:8000');
      } catch (e) {
        return { 
          success: false, 
          message: 'Cannot connect to server. Please make sure the backend server is running.' 
        };
      }

      const response = await fetch('http://localhost:8000/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        const userData = {
          email: data.user.email,
          role: data.user.role,
        };
        setUser(userData);
        localStorage.setItem('meetocure_admin_user', JSON.stringify(userData));
        navigate('/dashboard');
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.message === 'Failed to fetch') {
        return { 
          success: false, 
          message: 'Cannot connect to server. Please make sure the backend server is running.' 
        };
      }
      return { success: false, message: 'An error occurred during login' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('meetocure_admin_user');
    navigate('/login');
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};