import { api } from './api';

export const authAPI = {
  // Login user
  login: (email, password) => 
    api.post('/auth/login', { email, password }),

  // Register user
  register: (userData) => 
    api.post('/auth/register', userData),

  // Get current user
  getCurrentUser: () => api.get('/auth/me'),
};