// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

// Create AuthContext
const AuthContext = createContext();

// Create AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token')); // Get token from localStorage
  const [loading, setLoading] = useState(true); // Loading state for initial auth check

  // Load user from /auth/me
  // const loadUser = async () => {
  //   setLoading(true);
  //   if (token) {
  //     try {
  //       const res = await api.get(`/auth/me`);
  //       setUser(res.data.user);
  //     } catch (error) {
  //       localStorage.removeItem('token');
  //       setToken(null);
  //       setUser(null);
  //     }
  //   }
  //   setLoading(false);
  // };
  const loadUser = async () => {
  setLoading(true);
  const token = localStorage.getItem('token');
  console.log("Token from localStorage:", token);

  if (token) {
    try {
      const res = await api.get('/auth/me');
      console.log("User loaded:", res.data.user);
      setUser(res.data.user);
    } catch (error) {
      console.error("Auth check failed:", error.response?.data || error.message);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }
  } else {
    console.log("No token found.");
  }

  setLoading(false);
};


  // Load user on component mount
  useEffect(() => {
    loadUser();
    // eslint-disable-next-line
  }, [token]);

  // Login with username/password
  const login = async (username, password) => {
    try {
      const res = await api.post(`/auth/login`, { username, password });
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      return true;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Login failed.');
    }
  };

  // Register with username/password/role
  const register = async (username, password, role) => {
    try {
      const res = await api.post(`/auth/register`, { username, password, role });
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      return true;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Registration failed.');
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization']; // Remove auth header
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};
