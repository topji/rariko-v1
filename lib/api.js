const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

// Helper function to handle API responses
async function handleResponse(response) {
  const data = await response.json();
  
  if (!response.ok) {
    throw new ApiError(
      data.error || 'API request failed',
      response.status,
      data
    );
  }
  
  return data;
}

// Helper function to make API requests
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Network error', 0, { message: error.message });
  }
}

// User API functions
export const userApi = {
  // Check if user exists
  isUser: async (walletAddress) => {
    return apiRequest(`/users/isUser?walletAddress=${walletAddress}`);
  },

  // Create new user
  createUser: async (userData) => {
    return apiRequest('/users/createUser', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Check username uniqueness
  isUniqueUsername: async (username) => {
    return apiRequest(`/users/isUniqueUserName?username=${username}`);
  },

  // Get user profile
  getProfile: async (walletAddress) => {
    return apiRequest(`/users/profile/${walletAddress}`);
  },

  // Update user profile
  updateProfile: async (walletAddress, profileData) => {
    return apiRequest(`/users/profile/${walletAddress}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  // Get user referrals
  getReferrals: async (walletAddress) => {
    return apiRequest(`/users/referrals/${walletAddress}`);
  },
};

// Order API functions
export const orderApi = {
  // Create buy order
  createBuyOrder: async (orderData) => {
    return apiRequest('/orders/createBuyOrder', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  // Create sell order
  createSellOrder: async (orderData) => {
    return apiRequest('/orders/createSellOrder', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  // Get user orders
  getUserOrders: async (walletAddress, options = {}) => {
    const params = new URLSearchParams({ walletAddress, ...options });
    return apiRequest(`/orders/getUserOrders?${params}`);
  },

  // Get user volume
  getUserVolume: async (walletAddress, options = {}) => {
    const params = new URLSearchParams({ walletAddress, ...options });
    return apiRequest(`/orders/getUserVolume?${params}`);
  },

  // Mark order as completed
  completeOrder: async (orderId, transactionData) => {
    return apiRequest(`/orders/${orderId}/complete`, {
      method: 'PUT',
      body: JSON.stringify(transactionData),
    });
  },

  // Mark order as failed
  failOrder: async (orderId, errorData) => {
    return apiRequest(`/orders/${orderId}/fail`, {
      method: 'PUT',
      body: JSON.stringify(errorData),
    });
  },

  // Get token volume
  getTokenVolume: async (tokenSymbol, options = {}) => {
    const params = new URLSearchParams(options);
    return apiRequest(`/orders/tokenVolume/${tokenSymbol}?${params}`);
  },

  // Get trading stats
  getStats: async (options = {}) => {
    const params = new URLSearchParams(options);
    return apiRequest(`/orders/stats?${params}`);
  },
};

// Health check
export const healthApi = {
  check: async () => {
    return apiRequest('/health');
  },
};

export { ApiError }; 