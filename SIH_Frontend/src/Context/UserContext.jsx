import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingEmail, setPendingEmail] = useState(null); // Store email during OTP flow

  // ✅ Configure axios defaults (so we don't repeat baseURL & credentials everywhere)
  axios.defaults.baseURL = 'http://localhost:3000/api/v1';
  axios.defaults.withCredentials = true;

  // 🔹 Check if user is logged in on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('/me');
      setUser(response.data);
    } catch (err) {
      console.error('Auth check failed:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Expose a public refresher so other parts of the app can update user state
  const refreshUser = async () => {
    try {
      const response = await axios.get('/me');
      setUser(response.data);
      return { success: true };
    } catch (err) {
      console.error('Refresh user failed:', err);
      return { success: false };
    }
  };

  // 🔹 Login function - First step of 2FA
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await axios.post('/login', { email, password });

      // Store email for OTP verification step
      setPendingEmail(email);
      
      return { 
        success: true, 
        message: data.message || 'OTP sent to your email'
      };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Verify OTP function - Second step of 2FA
  const verifyOtp = async (email, otp) => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await axios.post('/verify-otp', { email, otp });

      // Set user after successful OTP verification
      setUser(data.user);
      setPendingEmail(null); // Clear pending email

      return { 
        success: true, 
        user: data.user,
        message: data.message || 'Login successful'
      };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'OTP verification failed. Please try again.';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Resend OTP function (optional but recommended)
  const resendOtp = async (email) => {
    try {
      setLoading(true);
      setError(null);

      // You'll need to create this endpoint in your backend
      const { data } = await axios.post('/resend-otp', { email });

      return { 
        success: true, 
        message: data.message || 'OTP resent successfully'
      };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to resend OTP. Please try again.';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await axios.post('/register', userData);

      return { success: true, user: data.user };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Logout function (calls backend /logout route)
  const logout = async () => {
    try {
      await axios.post('/logout');
      setUser(null);
      setPendingEmail(null);
      setError(null);
      return { success: true };
    } catch (err) {
      console.error('Logout error:', err);
      return { success: false, error: 'Logout failed' };
    }
  };

  // Clear error
  const clearError = () => setError(null);

  // Clear pending email (useful when going back to login)
  const clearPendingEmail = () => setPendingEmail(null);

  console.log("user", user);

  const value = {
    user,
    loading,
    error,
    pendingEmail,
    login,
    verifyOtp,
    resendOtp,
    register,
    logout,
    clearError,
    clearPendingEmail,
    refreshUser,
    isAuthenticated: user,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};