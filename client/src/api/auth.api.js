// client/src/api/auth.api.js
import api from './axios';

export const login = (credentials) => {
  return api.post('/api/auth/login', credentials);
};

export const getMe = () => {
  return api.get('/api/auth/me');
};

export const updateProfile = (data) => {
  return api.put('/api/auth/me', data);
};

export const changePassword = (data) => {
  return api.put('/api/auth/change-password', data);
};

export const forgotPassword = (email) => {
  return api.post('/api/auth/forgot-password', { email });
};

export const resetPassword = (data) => {
  return api.post('/api/auth/reset-password', data);
};

export const createPassword = (data) => {
  return api.post('/api/auth/create-password', data);
};