import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AuthContext } from './authContextDef';

const TOKEN_KEY = 'college_venue_token';
const USER_KEY = 'college_venue_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          // Refresh profile from backend to verify token validity
          const profileRes = await api.getProfile();
          if (profileRes.success && profileRes.data) {
            setUser(profileRes.data);
            localStorage.setItem(USER_KEY, JSON.stringify(profileRes.data));
          }
        } catch (err) {
          console.warn('Session expired or invalid token:', err.message);
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res.success && res.data) {
      const { token: jwtToken, user: userProfile } = res.data;
      setToken(jwtToken);
      setUser(userProfile);
      localStorage.setItem(TOKEN_KEY, jwtToken);
      localStorage.setItem(USER_KEY, JSON.stringify(userProfile));
      return userProfile;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (registrationData) => {
    const res = await api.register(registrationData);
    if (res.success && res.data) {
      const { token: jwtToken, user: userProfile } = res.data;
      setToken(jwtToken);
      setUser(userProfile);
      localStorage.setItem(TOKEN_KEY, jwtToken);
      localStorage.setItem(USER_KEY, JSON.stringify(userProfile));
      return userProfile;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const bootstrapAdmin = async (adminData) => {
    const res = await api.bootstrapAdmin(adminData);
    if (res.success && res.data) {
      const { token: jwtToken, user: userProfile } = res.data;
      setToken(jwtToken);
      setUser(userProfile);
      localStorage.setItem(TOKEN_KEY, jwtToken);
      localStorage.setItem(USER_KEY, JSON.stringify(userProfile));
      return userProfile;
    }
    throw new Error(res.message || 'Admin bootstrap failed');
  };

  const updateProfile = async (profileData) => {
    const res = await api.updateProfile(profileData);
    if (res.success && res.data) {
      setUser(res.data);
      localStorage.setItem(USER_KEY, JSON.stringify(res.data));
      return res.data;
    }
    throw new Error(res.message || 'Profile update failed');
  };

  const changePassword = async (currentPassword, newPassword) => {
    const res = await api.changePassword({ currentPassword, newPassword });
    if (!res.success) {
      throw new Error(res.message || 'Password change failed');
    }
  };

  const loginWithFirebaseToken = async (idToken) => {
    const res = await api.firebaseSync(idToken);
    if (res.success && res.data) {
      const { token: jwtToken, user: userProfile } = res.data;
      setToken(jwtToken);
      setUser(userProfile);
      localStorage.setItem(TOKEN_KEY, jwtToken);
      localStorage.setItem(USER_KEY, JSON.stringify(userProfile));
      return userProfile;
    }
    throw new Error(res.message || 'Firebase synchronization failed');
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  const isAdmin = user?.role === 'ROLE_ADMIN';
  const isFaculty = user?.role === 'ROLE_FACULTY';
  const isAuthenticated = !!token && !!user;

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    isAdmin,
    isFaculty,
    login,
    loginWithFirebaseToken,
    register,
    bootstrapAdmin,
    updateProfile,
    changePassword,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { useAuth } from './useAuth';
