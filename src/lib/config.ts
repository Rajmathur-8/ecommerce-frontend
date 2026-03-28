// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'https://e-commerce-backend-gw8o.onrender.com/api',
  TIMEOUT: 10000, // 10 seconds
};

// API Helper Functions
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

export const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const getFormDataHeaders = (): HeadersInit => {
  const token = localStorage.getItem('authToken');
  return {
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Environment Configuration
export const ENV_CONFIG = {
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
};

// Format number with K (thousands) and M (millions) notation
// Only show K/M notation when value is 99K or more
export const formatNumber = (value: number): string => {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0';
  }
  
  if (value >= 1000000) {
    // For 1 Million and above, show in Millions (M)
    return `${(value / 1000000).toFixed(2)}M`;
  } else if (value >= 99000) {
    // For 99K and above, show in Thousands (K)
    return `${(value / 1000).toFixed(2)}K`;
  } else {
    // For values less than 99K, show full number with Indian number format
    return new Intl.NumberFormat('en-IN').format(value);
  }
};

// Format currency with professional full price format
export const formatCurrency = (amount: number): string => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '₹0';
  }
  
  // Always show full amount in professional format
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
}; 