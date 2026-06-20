import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user on fill/refresh
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.data);
          }
        } catch (err) {
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success && !res.data.requires2FA) {
      localStorage.setItem('token', res.data.token);
      setUser(res.data.data);
    }
    return res.data;
  };

  const verify2FALogin = async (userId, token) => {
    const res = await api.post('/auth/login/verify-2fa', { userId, token });
    if (res.data.success) {
      localStorage.setItem('token', res.data.token);
      setUser(res.data.data);
    }
    return res.data;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.success) {
      localStorage.setItem('token', res.data.token);
      setUser(res.data.data);
    }
    return res.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.log("Logged out locally");
    }
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUserProfile = async (profileData) => {
    // Only send the fields we actually want to update to prevent wiping out data
    const payload = {};
    const editableFields = ['name', 'password', 'department', 'college', 'dob', 'year', 'linkedin', 'skills'];
    
    editableFields.forEach(field => {
      if (profileData[field] !== undefined) {
        payload[field] = profileData[field];
      }
    });

    const res = await api.patch('/users/profile', payload);
    if (res.data.success) {
      // Re-fetch the full profile after update to ensure we have the complete data
      const meRes = await api.get('/auth/me');
      if (meRes.data.success) {
        setUser(meRes.data.data);
      } else {
        setUser(res.data.data); // Fallback
      }
    }
    return res.data;
  };

  return (
    <UserContext.Provider value={{ user, loading, login, register, logout, setUser, updateUserProfile, verify2FALogin }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
