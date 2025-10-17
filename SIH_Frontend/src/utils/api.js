const API_BASE_URL = 'http://localhost:3000/api/v1';

// Generic API request helper
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    credentials: 'include', // Important for cookies
    headers: {
      // Don't set Content-Type for FormData, let browser set it with boundary
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// Specific HTTP method helpers
export const api = {
  get: (endpoint) => apiRequest(endpoint),
  
  post: (endpoint, data) => 
    apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  put: (endpoint, data) =>
    apiRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    
  delete: (endpoint) =>
    apiRequest(endpoint, {
      method: 'DELETE',
    }),
};

// Blockchain-specific helpers
export const blockchainAPI = {
  // Assign role (admin only)
  assignRole: (account, role) =>
    api.post('/blockchain/roles/assign', { account, role }),

  // Get role for an address
  getRole: (address) => api.get(`/blockchain/roles/get/${address}`),
};

export const bankAPI = {
  listPending: () => api.get('/loan/bank/pending'),
  listActive: () => api.get('/loan/bank/active'),
  approve: (userId, loanIndex) => api.put(`/loan/${userId}/${loanIndex}/approve`),
  reject: (userId, loanIndex) => api.put(`/loan/${userId}/${loanIndex}/reject`),
  markDefault: (userId, loanIndex) => api.put(`/loan/${userId}/${loanIndex}/mark-default`),
};