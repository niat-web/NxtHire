// client/src/contexts/AuthContext.jsx
import { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../api/axios';
import { useAlert } from '../hooks/useAlert';

// Create context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Hydrate user from localStorage immediately (no flash)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const cached = localStorage.getItem('cachedUser');
      return cached ? JSON.parse(cached) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(() => {
    // If we have a cached user + valid token, skip the loading spinner
    const token = localStorage.getItem('token');
    const cached = localStorage.getItem('cachedUser');
    if (token && cached) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp > Date.now() / 1000) return false;
      } catch {}
    }
    return true;
  });
  const [error, setError] = useState(null);
  const { showError } = useAlert();

  // Initialize auth state — verify with server in background
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');

        if (token) {
          const decodedToken = jwtDecode(token);
          const currentTime = Date.now() / 1000;

          if (decodedToken.exp < currentTime) {
            logout();
          } else {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            const response = await api.get('/api/auth/me');
            const userData = response.data.data;
            setCurrentUser(userData);
            // Cache user for instant hydration on next load
            localStorage.setItem('cachedUser', JSON.stringify(userData));
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('cachedUser');
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setError(null);
      const response = await api.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      
      // Save token and set auth header
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setCurrentUser(user);
      return user;
    } catch (err) {
      throw err;
    }
  };

  // Google login
  const googleLogin = async (credential) => {
    try {
      setError(null);
      const response = await api.post('/api/auth/google', { credential });
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setCurrentUser(user);
      return user;
    } catch (err) {
      throw err;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('cachedUser');
    delete api.defaults.headers.common['Authorization'];
    setCurrentUser(null);
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setError(null);
      const response = await api.put('/api/auth/me', userData);
      setCurrentUser(prev => ({ ...prev, ...response.data.data }));
      return response.data.data;
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Failed to update profile. Please try again.'
      );
      throw err;
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword, confirmPassword) => {
    try {
      setError(null);
      const response = await api.put('/api/auth/change-password', {
        currentPassword,
        newPassword,
        confirmPassword
      });
      return response.data;
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Failed to change password. Please try again.'
      );
      throw err;
    }
  };

  // Reset password request
  const requestPasswordReset = async (email) => {
    try {
      setError(null);
      const response = await api.post('/api/auth/forgot-password', { email });
      return response.data;
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Failed to request password reset. Please try again.'
      );
      throw err;
    }
  };

  // Reset password with token
  const resetPassword = async (token, password, confirmPassword) => {
    try {
      setError(null);
      const response = await api.post('/api/auth/reset-password', {
        token,
        password,
        confirmPassword
      });
      return response.data;
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Failed to reset password. Please try again.'
      );
      throw err;
    }
  };

  // Create password for new users
  const createPassword = async (token, password, confirmPassword) => {
    try {
      setError(null);
      const response = await api.post('/api/auth/create-password', {
        token,
        password,
        confirmPassword
      });
      return response.data;
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Failed to set password. Please try again.'
      );
      throw err;
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    googleLogin,
    logout,
    updateProfile,
    changePassword,
    requestPasswordReset,
    resetPassword,
    createPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
