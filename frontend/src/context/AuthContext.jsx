// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create the context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get user data if token exists
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Set authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Fetch current user
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/me`);
        
        if (response.data.status === 'success') {
          setUser(response.data.data.user);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Authentication error:', err);
        // Clear token if invalid
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setError('Authentication failed. Please login again.');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login user
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
        email,
        password
      });
      
      const { token, user } = response.data.data;
      
      // Save token and set user
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      setIsAuthenticated(true);
      
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Register user
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, userData);
      
      const { token, user } = response.data.data;
      
      // Save token and set user
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      setIsAuthenticated(true);
      
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await axios.get(`${import.meta.env.VITE_API_URL}/auth/logout`);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear token and user data regardless of API call success
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/auth/profile`, profileData);
      
      setUser(response.data.data.user);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Profile update failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    setLoading(true);
    setError(null);
    
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/auth/password`, {
        currentPassword,
        newPassword
      });
      
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Password change failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        userType: user?.userType,
        login,
        register,
        logout,
        updateProfile,
        changePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};