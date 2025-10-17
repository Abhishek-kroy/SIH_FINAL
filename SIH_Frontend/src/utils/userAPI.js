import { api, apiRequest } from './api';

export const userAPI = {
  // Get user profile
  getProfile: () => api.get('/users/profile'),

  // Get user loans
  getUserLoans: () => api.get('/users/loan-history'),

  // Update user profile
  updateProfile: (profileData) =>
    api.put('/users/profile', profileData),

  // Get dashboard stats
  getDashboardStats: () => api.get('/users/dashboard/stats'),

  // Calculate credit score
  calculateCreditScore: () => 
    api.post('/users/calculate-credit-score'),

  // Get all users (admin only)
  getAllUsers: () => api.get('/users'),

  // Get user by ID (admin only)
  getUserById: (userId) => api.get(`/users/${userId}`),

  // Update user by ID (admin only)
  updateUserById: (userId, userData) =>
    api.put(`/users/${userId}`, userData),

  // Delete user (admin only)
  deleteUser: (userId) => api.delete(`/users/${userId}`),

  // Loan repayment APIs
  repayLoan: (loanId, repaymentData) => 
    api.post(`/users/loans/${loanId}/repay`, repaymentData),

  // Setup autodebit for loan
  setupAutodebit: (loanId, mandateId) => 
    api.post(`/users/loans/${loanId}/autodebit`, { mandateId }),

  // Upload payment proof for manual repayment
  uploadPaymentProof: (loanId, proofData) =>
    api.post(`/users/loans/${loanId}/proof`, proofData),

  // Submit manual repayment with payment proof
  submitManualRepayment: (formData) => {
    // Extract loanId from formData
    const loanId = formData.get('loanId');
    return apiRequest(`/users/loans/${loanId}/proof`, {
      method: 'POST',
      body: formData,
    });
  },

  // Verify payment proof using backend proxy
  verifyProof: ({ base64, mimeType, loanDetails, expectedAmount }) => {
    return api.post('/users/verify-proof', {
      base64,
      mimeType,
      loanDetails,
      expectedAmount,
    });
  },

  // Verify user profile using backend proxy
  verifyProfile: ({ base64, mimeType, userData }) => {
    return api.post('/users/verify-profile', {
      base64,
      mimeType,
      userData,
    });
  },

  // Get pending loans for admin dashboard
  getPendingLoans: () => api.get('/loan/bank/pending'),

  // Approve loan (admin only)
  approve: (userId, loanIndex) => api.put(`/loan/${userId}/${loanIndex}/approve`),
};
