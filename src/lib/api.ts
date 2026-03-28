import { API_CONFIG } from './config';
import { clearAuthData, isTokenExpired } from './authUtils';
import { SetStateAction } from 'react';

const API_BASE_URL = API_CONFIG.BASE_URL;

// Add token expiration handler
let tokenExpirationHandler: (() => void) | null = null;

export const setTokenExpirationHandler = (handler: () => void) => {
  tokenExpirationHandler = handler;
};

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: unknown[];
}

export interface User {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: string;
  isGuest: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Product {
  _id: string;
  productName: string;
  productTitle?: string;
  productDescription: string;
  price: number;
  discountPrice?: number;
  stock: number;
  // Stock alert settings
  lowStockThreshold?: number;
  stockAlertEnabled?: boolean;
  lastStockAlertSent?: string;
  sku: string;
  unit: string;
  images: string[];
  splineModelUrl?: string; // 3D model URL
  youtubeVideoUrls?: string[]; // Array of YouTube video URLs
  productVideos?: string[]; // Array of uploaded video file URLs
  category: {
    _id: string;
    name: string;
  };
  subcategory?: {
    _id: string;
    name: string;
  };
  variants: Array<{
    variantName: string;
    price: number;
    discountPrice?: number;
    stock: number;
    sku: string;
    image?: string;
    attributes?: Record<string, string>;
  }>;
  keyFeatures?: string[];
  whatsInBox?: string[];
  specifications?: Array<{
    key: string;
    value: string;
  }>;
  variantAttributeConfig?: string[];
  reviews?: Review[];
  averageRating?: number;
  totalReviews?: number;
  ratingDistribution?: {
    fiveStar: number;
    fourStar: number;
    threeStar: number;
    twoStar: number;
    oneStar: number;
  };
  isActive: boolean;
  isPreOrder?: boolean;
  shipmentWeight?: number;
  shipmentLength?: number;
  shipmentWidth?: number;
  shipmentHeight?: number;
  // Price scraper fields
  modelNumber?: string;
  brandName?: string;
  manufacturerPartNumber?: string;
  suggestedPricing?: {
    amazonPrice?: number;
    flipkartPrice?: number;
    suggestedPrice?: number;
  };
  frequentlyBoughtTogether?: Product[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  data: Product[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface Warranty {
  _id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  coverage: string[];
  termsAndConditions?: string;
  image?: string;
}

export interface CartItem {
  _id: string;
  product: Product;
  quantity: number;
  variant?: unknown;
  price: number;
  warranty?: Warranty | string | null;
}

export interface Cart {
  id: string;
  items: CartItem[];
  savedForLater: CartItem[];
  itemCount: number;
  subtotal: number;
  discountAmount: number;
  total: number;
  coupon?: {
    code: string;
    discount: number;
    type: string;
  };
  lastUpdated: string;
}

export interface CartResponse {
  cart: Cart;
}

export interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  rating: number;
  title: string;
  comment: string;
  images: string[];
  isVerified: boolean;
  helpful: string[];
  helpfulCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  _id: string;
  user: string;
  name: string;
  mobile: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  addressType: 'Home' | 'Work';
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddressFormData {
  name: string;
  mobile: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  addressType: 'Home' | 'Work';
  isDefault: boolean;
}

export interface PaymentMethod {
  _id: string;
  name: string;
  description: string;
  icon: string;
  isActive: boolean;
  isPopular: boolean;
  order: number;
  config: {
    razorpayKeyId?: string;
    razorpayKeySecret?: string;
    codCharges?: number;
    codMinAmount?: number;
    codMaxAmount?: number;
    minAmount: number;
    maxAmount: number;
    processingFee: number;
    processingFeeType: 'fixed' | 'percentage';
  };
  restrictions: {
    minOrderValue: number;
    maxOrderValue: number;
  };
  processingFee?: number;
  totalAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  _id: string;
  user: string;
  items: Array<{
    product: string;
    quantity: number;
    price: number;
    variant?: string;
  }>;
  address: {
    name: string;
    mobile: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  orderStatus: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  shippingCharges: number;
  codCharges?: number;
  total: number;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  addressId: string;
  paymentMethodId: string;
  frequentlyBoughtTogether?: { [cartItemId: string]: string[] };
}

export interface RazorpayOrderRequest {
  amount: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrderResponse {
  order: {
    id: string;
    amount: number;
    currency: string;
    receipt: string;
    key_id: string;
  };
}

export interface ProductStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    fiveStar: number;
    fourStar: number;
    threeStar: number;
    twoStar: number;
    oneStar: number;
  };
}

export interface ReviewsResponse {
  reviews: Review[];
  productStats: ProductStats;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ReviewResponse {
  review: Review;
  productStats: ProductStats;
}

export interface WishlistItem {
  _id: string;
  product: Product;
  addedAt: string;
}

export interface WishlistResponse {
  wishlist: WishlistItem[];
}

export interface WishlistStatusResponse {
  isWishlisted: boolean;
}

export interface Rating {
  comment: string;
  ratings: { overall: number; valueForMoney: number; quality: number; delivery: number; packaging: number; customerService: number; };
  _id: string;
  orderId: string;
  productId: string;
  rating: number;
  review: string;
  images?: string[];
  videos?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProductStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    fiveStar: number;
    fourStar: number;
    threeStar: number;
    twoStar: number;
    oneStar: number;
  };
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };


export interface ProductReview {
  _id: string;
  orderId: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  review: string;
  images?: string[];
  videos?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RewardPointsHistoryItem {
  _id: string;
  userId: string;
  points: number;
  type: 'earned' | 'redeemed' | 'expired';
  description: string;
  orderId?: string;
  expiryDate?: string;
  createdAt: string;
}

export interface DeliveryTracking {
  status: string;
  location: string;
  timestamp: string;
  description?: string;
}

export interface TrackingData {
  awbNumber: string;
  status: string;
  currentLocation: string;
  estimatedDelivery: string;
  trackingHistory: Array<{
    status: string;
    location: string;
    timestamp: string;
    description?: string;
  }>;
}

// Global error handler for API responses
export const handleApiError = (error: unknown, endpoint?: string): ApiResponse<never> => {
  
  // Check if it's a token expiration error
  if (error && typeof error === 'object' && 'message' in error && 
      typeof error.message === 'string' && error.message.includes('Token expired')) {
    // Clear auth data
    clearAuthData();
    
    // Call token expiration handler if set
    if (tokenExpirationHandler) {
      tokenExpirationHandler();
    }
    
    return {
      success: false,
      message: 'Token expired. Please login again.',
      data: undefined
    };
  }
  
  // Handle network errors
  if (error && typeof error === 'object' && 'name' in error && 
      error.name === 'TypeError' && 'message' in error && 
      typeof error.message === 'string' && error.message.includes('fetch')) {
    return {
      success: false,
      message: 'Network error. Please check your connection.',
      data: undefined
    };
  }
  
  // Handle other errors
  return {
    success: false,
    message: (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') 
      ? error.message 
      : 'An unexpected error occurred.',
    data: undefined
  };
};

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('authToken');
    }
  }

  setToken(token: string) {
    console.log('=== SET TOKEN DEBUG ===');
    console.log('Setting token:', token.substring(0, 20) + '...');
    this.token = token;
    console.log('Token set in apiService instance');
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
      console.log('Token also saved to localStorage');
    }
  }

  hasToken(): boolean {
    return !!this.token;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
      console.log('Setting Authorization header with token:', this.token.substring(0, 20) + '...');
    } else {
      console.log('No token available for request');
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Check if token is expired before making request
    if (this.token && isTokenExpired(this.token)) {
      console.log('Token is expired, clearing auth data');
      this.clearToken();
      clearAuthData();
      if (tokenExpirationHandler) {
        tokenExpirationHandler();
      }
      return {
        success: false,
        message: 'Token expired. Please login again.',
        data: null
      } as ApiResponse<T>;
    }
    
    // Handle FormData differently - don't set Content-Type for FormData
    let headers: HeadersInit;
    if (options.body instanceof FormData) {
      // For FormData, only set Authorization header, let browser set Content-Type with boundary
      headers = {};
      if (this.token) {
        headers.Authorization = `Bearer ${this.token}`;
        console.log('Setting Authorization header for FormData with token:', this.token.substring(0, 20) + '...');
      }
    } else {
      // For regular requests, use all headers including Content-Type
      headers = this.getHeaders();
    }
    
    const config: RequestInit = {
      headers: { ...headers, ...options.headers },
      ...options,
    };

    console.log('=== API REQUEST DEBUG ===');
    console.log('URL:', url);
    console.log('Method:', config.method || 'GET');
    console.log('Headers:', config.headers);
    console.log('Body:', config.body);
    console.log('Token available:', !!this.token);

    // Check for Authorization header presence in a type-safe way
    let authHeaderPresent = false;
    if (config.headers) {
      if (config.headers instanceof Headers) {
        authHeaderPresent = config.headers.has('Authorization');
      } else if (Array.isArray(config.headers)) {
        authHeaderPresent = config.headers.some(([key]) => key.toLowerCase() === 'authorization');
      } else if (typeof config.headers === 'object') {
        authHeaderPresent = Object.keys(config.headers).some(
          (key) => key.toLowerCase() === 'authorization'
        );
      }
    }
    console.log('Authorization header:', authHeaderPresent ? 'Present' : 'Missing');

    try {
      const response = await fetch(url, config);
      
      // Get response as text first to check if it's HTML
      const text = await response.text();
      
      // Check if response is HTML (error page)
      if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
        throw new Error(`Server error: ${response.status} ${response.statusText} - Endpoint not found or server error`);
      }
      
      let data: ApiResponse<T>;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
      }
      
      // Check if response is ok (status 200-299) - but first read the response body to get error messages
      if (!response.ok && response.status !== 401 && response.status !== 403) {
        // If backend sent a proper error response with message, return it instead of throwing
        if (data && typeof data === 'object' && 'success' in data && 'message' in data) {
          return {
            success: false,
            message: data.message || `API request failed with status ${response.status}`,
            data: null
          } as ApiResponse<T>;
        }
        // Otherwise throw error for unexpected responses
        throw new Error(data?.message || `HTTP error! status: ${response.status}`);
      }

      // Check for token expiration (401 Unauthorized)
      if (response.status === 401) {
        console.log('Token expired, clearing auth data and redirecting to login');
        this.clearToken();
        clearAuthData();
        // Call the token expiration handler if set
        if (tokenExpirationHandler) {
          tokenExpirationHandler();
        }
        // Don't throw error, let the handler manage the flow
        return {
          success: false,
          message: 'Token expired. Please login again.',
          data: null
        } as ApiResponse<T>;
      }

      // Check for forbidden access (403 Forbidden)
      if (response.status === 403) {
        console.log('Access forbidden, clearing auth data and redirecting to login');
        this.clearToken();
        clearAuthData();
        // Call the token expiration handler if set
        if (tokenExpirationHandler) {
          tokenExpirationHandler();
        }
        // Don't throw error, let the handler manage the flow
        return {
          success: false,
          message: 'Access forbidden. Please login again.',
          data: null
        } as ApiResponse<T>;
      }

      // Handle error responses (4xx, 5xx) - return error response instead of throwing
      if (!response.ok) {
        // If backend sent a proper error response with message, return it
        if (data && typeof data === 'object' && 'success' in data && 'message' in data) {
          return {
            success: false,
            message: data.message || 'API request failed',
            data: null
          } as ApiResponse<T>;
        }
        // Otherwise throw error for unexpected responses
        throw new Error(data?.message || `API request failed with status ${response.status}`);
      }

      return data;
    } catch (error: unknown) {
      
      // Handle network errors specifically (Failed to fetch)
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        
        return {
          success: false,
          message: 'Network error: Unable to connect to server. Please check if the backend server is running.',
          data: null
        } as ApiResponse<T>;
      }
      
      // Use the global error handler for other errors
      return handleApiError(error, endpoint);
    }
  }

  private async requestFormData<T>(
    endpoint: string,
    formData: FormData
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Check if token is expired before making request
    if (this.token && isTokenExpired(this.token)) {
      console.log('Token is expired, clearing auth data');
      this.clearToken();
      clearAuthData();
      if (tokenExpirationHandler) {
        tokenExpirationHandler();
      }
      return {
        success: false,
        message: 'Token expired. Please login again.',
        data: null
      } as ApiResponse<T>;
    }
    
    // For FormData, only set Authorization header, let browser set Content-Type with boundary
    const headers: HeadersInit = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
      console.log('Setting Authorization header for FormData with token:', this.token.substring(0, 20) + '...');
    }

    console.log('=== API FORMDATA REQUEST DEBUG ===');
    console.log('URL:', url);
    console.log('Method: POST');
    console.log('Headers:', headers);
    console.log('Body: FormData');
    console.log('Token available:', !!this.token);
    console.log('Authorization header:', headers.Authorization ? 'Present' : 'Missing');

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers,
      });
      
      // Get response as text first to check if it's HTML
      const text = await response.text();
      
      // Check if response is HTML (error page)
      if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
        throw new Error(`Server error: ${response.status} ${response.statusText} - Endpoint not found or server error`);
      }
      
      let data: ApiResponse<T>;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
      }

      // Check for token expiration (401 Unauthorized)
      if (response.status === 401) {
        console.log('Token expired, clearing auth data and redirecting to login');
        this.clearToken();
        clearAuthData();
        // Call the token expiration handler if set
        if (tokenExpirationHandler) {
          tokenExpirationHandler();
        }
        return {
          success: false,
          message: 'Token expired. Please login again.',
          data: null
        } as ApiResponse<T>;
      }

      // Check for forbidden access (403 Forbidden)
      if (response.status === 403) {
        console.log('Access forbidden, clearing auth data and redirecting to login');
        this.clearToken();
        clearAuthData();
        // Call the token expiration handler if set
        if (tokenExpirationHandler) {
          tokenExpirationHandler();
        }
        return {
          success: false,
          message: 'Access forbidden. Please login again.',
          data: null
        } as ApiResponse<T>;
      }

      // Check for server errors (500+)
      if (response.status >= 500) {
        return {
          success: false,
          message: `Server error: ${response.status} ${response.statusText}`,
          data: null
        } as ApiResponse<T>;
      }

      // Check for client errors (400-499)
      if (response.status >= 400) {
        return {
          success: false,
          message: data.message || `Client error: ${response.status} ${response.statusText}`,
          data: null
        } as ApiResponse<T>;
      }

      return data;
    } catch (error: unknown) {
      return handleApiError(error, endpoint);
    }
  }

  auth = {
    login: async (loginData: {
      firebaseUid: string;
      email: string;
      name: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
    }): Promise<ApiResponse<AuthResponse>> => {
      return this.request<AuthResponse>('/web/login', {
        method: 'POST',
        body: JSON.stringify(loginData),
      });
    },

    createGuest: async (): Promise<ApiResponse<AuthResponse>> => {
      return this.request<AuthResponse>('/web/guest', {
        method: 'POST',
      });
    },

    getProfile: async (): Promise<ApiResponse<{ user: User }>> => {
      return this.request<{ user: User }>('/auth/profile');
    },

    updateProfile: async (profileData: {
      name?: string;
      phone?: string;
    }): Promise<ApiResponse<{ user: User }>> => {
      return this.request<{ user: User }>('/web/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
    },

    logout: () => {
      this.clearToken();
    },

    register: async (data: { identifier: string | { email?: string; firebaseUid?: string; name?: string; displayName?: string }; referralCode?: string }): Promise<ApiResponse<{ message: string }>> => {
      return this.request<{ message: string }>('/web/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    verifyOtp: async (identifier: string, otp: string): Promise<ApiResponse<{ message: string }>> => {
      return this.request<{ message: string }>('/web/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ identifier, otp }),
      });
    },
    sendPhoneOtp: async (phone: string): Promise<ApiResponse<{ message: string }>> => {
      return this.request<{ message: string }>('/web/send-phone-otp', {
        method: 'POST',
        body: JSON.stringify({ phone }),
      });
    },
    verifyPhoneOtp: async (phone: string, otp: string): Promise<ApiResponse<{ message: string }>> => {
      return this.request<{ message: string }>('/web/verify-phone-otp', {
        method: 'POST',
        body: JSON.stringify({ phone, otp }),
      });
    },
    setPassword: async (identifier: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> => {
      return this.request<{ user: User; token: string }>('/web/set-password', {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
      });
    },
    forgotPassword: async (identifier: string): Promise<ApiResponse<{ message: string }>> => {
      return this.request<{ message: string }>('/web/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ identifier }),
      });
    },
    resetPassword: async (identifier: string, resetToken: string, newPassword: string): Promise<ApiResponse<{ message: string }>> => {
      return this.request<{ message: string }>('/web/reset-password', {
        method: 'POST',
        body: JSON.stringify({ identifier, resetToken, newPassword }),
      });
    },
  };

  products = {
    getAll: async (params?: {
      page?: number;
      limit?: number;
      category?: string;
      search?: string;
      minPrice?: number;
      maxPrice?: number;
      brand?: string;
      sort?: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'rating_desc' | 'newest' | 'ram_asc' | 'ram_desc' | 'rom_asc' | 'rom_desc' | 'battery_asc' | 'battery_desc';
      inStock?: boolean;
      ram?: string;
      rom?: string;
      battery?: string;
      processor?: string;
      camera?: string;
      resolution?: string;
      screenSize?: string;
    }): Promise<ApiResponse<ProductsResponse>> => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== '' && value !== null) {
            searchParams.append(key, value.toString());
          }
        });
      }

      const queryString = searchParams.toString();
      const endpoint = queryString ? `/web/products?${queryString}` : '/web/products';
      
      return this.request<ProductsResponse>(endpoint);
    },

    getFeatured: async (limit?: number): Promise<ApiResponse<{ data: Product[] }>> => {
      const endpoint = limit ? `/web/products?limit=${limit}` : '/web/products';
      return this.request<{ data: Product[] }>(endpoint);
    },

    search: async (query: string, limit?: number): Promise<ApiResponse<Product[]>> => {
      const searchParams = new URLSearchParams({ search: query });
      if (limit) {
        searchParams.append('limit', limit.toString());
      }
      
      return this.request<Product[]>(`/web/products?${searchParams.toString()}`);
    },

    getById: async (id: string): Promise<ApiResponse<Product>> => {
      return this.request<Product>(`/web/products/${id}`);
    },

    getByCategory: async (categoryId: string, params?: {
      page?: number;
      limit?: number;
      sort?: string;
    }): Promise<ApiResponse<ProductsResponse>> => {
      const searchParams = new URLSearchParams({ category: categoryId });
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, value.toString());
          }
        });
      }

      return this.request<ProductsResponse>(`/web/products?${searchParams.toString()}`);
    },

    // Review-related methods
    getReviews: async (productId: string, params?: {
      page?: number;
      limit?: number;
      rating?: number;
      sort?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';
    }): Promise<ApiResponse<ReviewsResponse>> => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, value.toString());
          }
        });
      }

      const queryString = searchParams.toString();
      const endpoint = queryString 
        ? `/web/products/${productId}/reviews?${queryString}` 
        : `/web/products/${productId}/reviews`;
      
      return this.request<ReviewsResponse>(endpoint);
    },

    getMyReview: async (productId: string): Promise<ApiResponse<Review>> => {
      return this.request<Review>(`/web/products/${productId}/my-review`);
    },

    addReview: async (productId: string, reviewData: FormData): Promise<ApiResponse<ReviewResponse>> => {
      return this.request<ReviewResponse>(`/web/products/${productId}/reviews`, {
        method: 'POST',
        body: reviewData,
        headers: {
          // Don't set Content-Type for FormData, let the browser set it
          Authorization: this.token ? `Bearer ${this.token}` : '',
        },
      });
    },

    updateReview: async (productId: string, reviewId: string, reviewData: FormData): Promise<ApiResponse<ReviewResponse>> => {
      return this.request<ReviewResponse>(`/web/products/${productId}/reviews/${reviewId}`, {
        method: 'PUT',
        body: reviewData,
        headers: {
          Authorization: this.token ? `Bearer ${this.token}` : '',
        },
      });
    },

    deleteReview: async (productId: string, reviewId: string): Promise<ApiResponse<{ message: string; productStats: ProductStats }>> => {
      return this.request<{ message: string; productStats: ProductStats }>(`/web/products/${productId}/reviews/${reviewId}`, {
        method: 'DELETE',
      });
    },

    markReviewHelpful: async (productId: string, reviewId: string): Promise<ApiResponse<{ helpfulCount: number; isHelpful: boolean }>> => {
      return this.request<{ helpfulCount: number; isHelpful: boolean }>(`/web/products/${productId}/reviews/${reviewId}/helpful`, {
        method: 'POST',
      });
    },

    getRelatedProducts: async (productId: string, limit?: number): Promise<ApiResponse<{ data: Product[] }>> => {
      const params = limit ? `?limit=${limit}` : '';
      return this.request<{ data: Product[] }>(`/web/products/${productId}/related${params}`);
    },
  };

  cart = {
    getUserCart: async (): Promise<ApiResponse<CartResponse>> => {
      return this.request<CartResponse>('/web/cart');
    },

    getGuestCart: async (guestId: string): Promise<ApiResponse<CartResponse>> => {
      return this.request<CartResponse>(`/web/cart/guest/${guestId}`);
    },

    addToCart: async (data: {
      productId: string;
      quantity: number;
      variant?: unknown;
    }): Promise<ApiResponse<CartResponse>> => {
      return this.request<CartResponse>('/web/cart/add', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    addToGuestCart: async (data: {
      guestId: string;
      productId: string;
      quantity: number;
      variant?: unknown;
    }): Promise<ApiResponse<CartResponse>> => {
      return this.request<CartResponse>('/web/cart/guest/add', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    updateCartItem: async (productId: string, quantity?: number, warranty?: string | null): Promise<ApiResponse<CartResponse>> => {
      console.log('🚨 updateCartItem API called with:', { productId, quantity, warranty });
      const body: { quantity?: number; warranty?: string | null } = {};
      if (quantity !== undefined) body.quantity = parseInt(quantity.toString());
      if (warranty !== undefined) body.warranty = warranty;
      return this.request<CartResponse>(`/web/cart/update/${productId}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
    },

    removeFromCart: async (itemId: string): Promise<ApiResponse<CartResponse>> => {
      return this.request<CartResponse>(`/web/cart/remove/${itemId}`, {
        method: 'DELETE',
      });
    },

    saveForLater: async (itemId: string): Promise<ApiResponse<CartResponse>> => {
      return this.request<CartResponse>(`/web/cart/save-for-later/${itemId}`, {
        method: 'POST',
      });
    },

    moveToCart: async (itemId: string): Promise<ApiResponse<CartResponse>> => {
      return this.request<CartResponse>(`/web/cart/move-to-cart/${itemId}`, {
        method: 'POST',
      });
    },

    removeFromSaved: async (itemId: string): Promise<ApiResponse<CartResponse>> => {
      return this.request<CartResponse>(`/web/cart/remove-from-saved/${itemId}`, {
        method: 'DELETE',
      });
    },

    clearCart: async (): Promise<ApiResponse<CartResponse>> => {
      return this.request<CartResponse>('/web/cart/clear', {
        method: 'POST',
      });
    },

    applyCoupon: async (code: string): Promise<ApiResponse<CartResponse>> => {
      return this.request<CartResponse>('/web/cart/apply-coupon', {
        method: 'POST',
        body: JSON.stringify({ code }),
      });
    },

    removeCoupon: async (): Promise<ApiResponse<CartResponse>> => {
      return this.request<CartResponse>('/web/cart/remove-coupon', {
        method: 'POST',
      });
    },

    applyPromoCode: async (code: string): Promise<ApiResponse<CartResponse>> => {
      console.log('🌐 API: Calling applyPromoCode with code:', code);
      const response = await this.request<CartResponse>('/web/cart/apply-promo', {
        method: 'POST',
        body: JSON.stringify({ code }),
      });
      console.log('🌐 API: applyPromoCode response:', response);
      return response;
    },

    removePromoCode: async (): Promise<ApiResponse<CartResponse>> => {
      return this.request<CartResponse>('/web/cart/remove-promo', {
        method: 'POST',
      });
    },

    applyGiftVoucher: async (code: string): Promise<ApiResponse<CartResponse>> => {
      return this.request<CartResponse>('/web/cart/apply-gift-voucher', {
        method: 'POST',
        body: JSON.stringify({ code }),
      });
    },

    removeGiftVoucher: async (): Promise<ApiResponse<CartResponse>> => {
      return this.request<CartResponse>('/web/cart/remove-gift-voucher', {
        method: 'POST',
      });
    },

    mergeCart: async (guestId: string): Promise<ApiResponse<CartResponse>> => {
      return this.request<CartResponse>('/web/cart/merge', {
        method: 'POST',
        body: JSON.stringify({ guestId }),
      });
    },
  };

  address = {
    testAuth: async (): Promise<ApiResponse<{ user: unknown; hasUser: boolean; userId: string }>> => {
      return this.request<{ user: unknown; hasUser: boolean; userId: string }>('/web/test-auth');
    },
    
    addAddress: async (addressData: AddressFormData): Promise<{ success: boolean; address: Address; message?: string }> => {
      const response = await this.request<{ address: Address }>('/web/address', {
        method: 'POST',
        body: JSON.stringify(addressData),
      });
      return {
        success: response.success,
        address: response.data?.address || {} as Address,
        message: response.message
      };
    },
    getAddresses: async (): Promise<{ success: boolean; addresses: Address[]; message?: string }> => {
      console.log('🔍 API: Calling getAddresses...');
      const response = await this.request<{ addresses: Address[] }>('/web/address') as any;
      console.log('🔍 API: Raw response:', response);
      console.log('🔍 API: Response addresses:', response.addresses);
      console.log('🔍 API: Response success:', response.success);
      
      // The backend returns { success: true, addresses: [...] } directly
      const result = {
        success: response.success,
        addresses: response.addresses || [],
        message: response.message
      };
      console.log('🔍 API: Final result:', result);
      return result;
    },
    updateAddress: async (id: string, addressData: Partial<AddressFormData>): Promise<ApiResponse<{ address: Address }>> => {
      return this.request<{ address: Address }>(`/web/address/${id}`, {
        method: 'PUT',
        body: JSON.stringify(addressData),
      });
    },
    deleteAddress: async (id: string): Promise<ApiResponse<{ message: string }>> => {
      return this.request<{ message: string }>(`/web/address/${id}`, {
        method: 'DELETE',
      });
    },
    setDefaultAddress: async (id: string): Promise<ApiResponse<{ address: Address }>> => {
      return this.request<{ address: Address }>(`/web/address/${id}/default`, {
        method: 'PATCH',
      });
    },
  };

  payment = {
    getPaymentMethods: async (): Promise<ApiResponse<{ paymentMethods: PaymentMethod[] }>> => {
      return this.request<{ paymentMethods: PaymentMethod[] }>('/web/payment-methods');
    },

    createOrder: async (orderData: CreateOrderRequest): Promise<ApiResponse<{ order: Order }>> => {
      return this.request<{ order: Order }>('/web/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });
    },

    createRazorpayOrder: async (orderData: RazorpayOrderRequest): Promise<ApiResponse<RazorpayOrderResponse>> => {
      return this.request<RazorpayOrderResponse>('/web/razorpay/create-order', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });
    },

    verifyPayment: async (paymentData: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      addressId: string;
    }): Promise<ApiResponse<{ order: Order }>> => {
      return this.request<{ order: Order }>('/web/razorpay/verify', {
        method: 'POST',
        body: JSON.stringify(paymentData),
      });
    },

    getOrder: async (orderId: string): Promise<ApiResponse<{ order: Order }>> => {
      return this.request<{ order: Order }>(`/web/orders/${orderId}`);
    },

    getUserOrders: async (params?: {
      page?: number;
      limit?: number;
      status?: 'upcoming' | 'delivered';
    }): Promise<ApiResponse<{ orders: Order[]; pagination: {
      pages: number; page: number; limit: number; total: number; totalPages: number 
} }>> => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, value.toString());
          }
        });
      }

      const queryString = searchParams.toString();
      const endpoint = queryString ? `/web/orders?${queryString}` : '/web/orders';
      
      return this.request<{ orders: Order[]; pagination: { pages: number; page: number; limit: number; total: number; totalPages: number } }>(endpoint);
    },

    cancelOrder: async (orderId: string): Promise<ApiResponse<{ order: Order }>> => {
      return this.request<{ order: Order }>(`/web/orders/${orderId}/cancel`, {
        method: 'POST',
      });
    },

    returnOrder: async (orderId: string, returnData: {
      reason: string;
      description: string;
    }): Promise<ApiResponse<{ order: Order }>> => {
      return this.request<{ order: Order }>(`/web/orders/${orderId}/return`, {
        method: 'POST',
        body: JSON.stringify(returnData),
      });
    },
  };

  rating = {
    createRating: async (orderId: string, ratingData: {
      ratings: {
        overall: number;
        valueForMoney?: number;
        quality?: number;
        delivery?: number;
        packaging?: number;
        customerService?: number;
      };
      title?: string;
      comment: string;
      images?: string[];
      videos?: string[];
    }): Promise<ApiResponse<{ rating: Rating }>> => {
      return this.request<{ rating: Rating }>(`/web/orders/${orderId}/rating`, {
        method: 'POST',
        body: JSON.stringify(ratingData),
      });
    },

    createRatingWithFiles: async (orderId: string, formData: FormData): Promise<ApiResponse<{ rating: Rating }>> => {
      return this.requestFormData<{ rating: Rating }>(`/web/orders/${orderId}/rating`, formData);
    },

    getOrderRating: async (orderId: string): Promise<ApiResponse<{ rating: Rating | null; hasRated: boolean }>> => {
      return this.request<{ rating: Rating | null; hasRated: boolean }>(`/web/orders/${orderId}/rating`);
    },

    getUserRatings: async (): Promise<ApiResponse<{ ratings: Rating[]; pagination: Pagination }>> => {
      return this.request<{ ratings: Rating[]; pagination: Pagination }>('/web/ratings');
    },

    getProductOrderReviews: async (productId: string, page = 1, limit = 10): Promise<ApiResponse<{ reviews: ProductReview[]; productStats: ProductStats; pagination: Pagination }>> => {
      return this.request<{ reviews: ProductReview[]; productStats: ProductStats; pagination: Pagination }>(`/web/products/${productId}/order-reviews?page=${page}&limit=${limit}`);
    },

    updateRating: async (ratingId: string, ratingData: {
      ratings?: {
        overall?: number;
        valueForMoney?: number;
        quality?: number;
        delivery?: number;
        packaging?: number;
        customerService?: number;
      };
      title?: string;
      comment?: string;
      images?: string[];
      videos?: string[];
    }): Promise<ApiResponse<{ rating: Rating }>> => {
      return this.request<{ rating: Rating }>(`/web/ratings/${ratingId}`, {
        method: 'PUT',
        body: JSON.stringify(ratingData),
      });
    },

    deleteRating: async (ratingId: string): Promise<ApiResponse<{ message: string }>> => {
      return this.request<{ message: string }>(`/web/ratings/${ratingId}`, {
        method: 'DELETE',
      });
    },
  };

  wishlist = {
    getWishlist: async (): Promise<ApiResponse<WishlistResponse>> => {
      return this.request<WishlistResponse>('/web/wishlist');
    },

    addToWishlist: async (productId: string): Promise<ApiResponse<WishlistResponse>> => {
      return this.request<WishlistResponse>('/web/wishlist/add', {
        method: 'POST',
        body: JSON.stringify({ productId }),
      });
    },

    removeFromWishlist: async (productId: string): Promise<ApiResponse<WishlistResponse>> => {
      return this.request<WishlistResponse>(`/web/wishlist/remove/${productId}`, {
        method: 'DELETE',
      });
    },

    checkWishlistStatus: async (productId: string): Promise<ApiResponse<WishlistStatusResponse>> => {
      return this.request<WishlistStatusResponse>(`/web/wishlist/check/${productId}`);
    },
  };

  rewardPoints = {
    getUserRewardPoints: async (): Promise<ApiResponse<{
      points: number;
      totalEarned: number;
      totalRedeemed: number;
      expiryDate: string;
      isActive: boolean;
    }>> => {
      return this.request<{
        points: number;
        totalEarned: number;
        totalRedeemed: number;
        expiryDate: string;
        isActive: boolean;
      }>('/web/reward-points');
    },

    addRewardPoints: async (data: { orderId: string; orderAmount: number }): Promise<ApiResponse<{
      pointsAdded: number;
      totalPoints: number;
      expiryDate: string;
    }>> => {
      return this.request<{
        pointsAdded: number;
        totalPoints: number;
        expiryDate: string;
      }>('/web/reward-points/add', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    redeemRewardPoints: async (data: { pointsToRedeem: number }): Promise<ApiResponse<{
      pointsRedeemed: number;
      remainingPoints: number;
      discountAmount: number;
    }>> => {
      return this.request<{
        pointsRedeemed: number;
        remainingPoints: number;
        discountAmount: number;
      }>('/web/reward-points/redeem', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    getRewardPointsHistory: async (): Promise<ApiResponse<{
      history: RewardPointsHistoryItem[];
      pagination: Pagination;
    }>> => {
      return this.request<{
        history: RewardPointsHistoryItem[];
        pagination: Pagination;
      }>('/web/reward-points/history');
    },
  };

  referral = {
    getUserReferralCode: async (): Promise<ApiResponse<{
      referralCode: string;
      userName: string;
    }>> => {
      return this.request<{
        referralCode: string;
        userName: string;
      }>('/web/referral/code');
    },

    validateReferralCode: async (data: { referralCode: string }): Promise<ApiResponse<{
      referrerName: string;
      referralCode: string;
    }>> => {
      return this.request<{
        referrerName: string;
        referralCode: string;
      }>('/web/referral/validate', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    awardReferralPoints: async (data: { userId: string; orderId: string; orderAmount: number }): Promise<ApiResponse<{
      pointsAwarded: number;
      referrerName: string;
      expiryDate: string;
    }>> => {
      return this.request<{
        pointsAwarded: number;
        referrerName: string;
        expiryDate: string;
      }>('/web/referral/award', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    getReferralStats: async (): Promise<ApiResponse<{
      totalReferred: number;
      activeReferrals: number;
      potentialEarnings: number;
    }>> => {
      return this.request<{
        totalReferred: number;
        activeReferrals: number;
        potentialEarnings: number;
      }>('/web/referral/stats');
    },
  };

  profile = {
    getUserProfile: async (): Promise<ApiResponse<{ user: User }>> => {
      return this.request<{ user: User }>('/web/profile');
    },

    updateUserProfile: async (data: {
      name?: string;
      phone?: string;
    }): Promise<ApiResponse<{ user: User }>> => {
      return this.request<{ user: User }>('/web/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    changePassword: async (data: {
      currentPassword: string;
      newPassword: string;
    }): Promise<ApiResponse<{ message: string }>> => {
      return this.request<{ message: string }>('/web/profile/change-password', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    deleteUserAccount: async (data: { password?: string }): Promise<ApiResponse<{ message: string }>> => {
      return this.request<{ message: string }>('/web/profile/delete', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    getUserStats: async (): Promise<ApiResponse<{
      totalOrders: number;
      totalAddresses: number;
      totalReviews: number;
      rewardPoints: {
        currentPoints: number;
        totalEarned: number;
        totalRedeemed: number;
      };
    }>> => {
      return this.request<{
        totalOrders: number;
        totalAddresses: number;
        totalReviews: number;
        rewardPoints: {
          currentPoints: number;
          totalEarned: number;
          totalRedeemed: number;
        };
      }>('/web/profile/stats');
    },
  };

  logistics = {
    checkDeliveryAvailability: async (pincode: string): Promise<ApiResponse<{
      isAvailable: boolean;
      message?: string;
      estimatedDelivery?: string;
      shippingRate?: number;
    }>> => {
      return this.request<{
        isAvailable: boolean;
        message?: string;
        estimatedDelivery?: string;
        shippingRate?: number;
      }>(`/web/logistics/check-pincode/${pincode}`);
    },

    calculateShippingCharges: async (data: {
      pincode: string;
      weight?: number;
      orderValue?: number;
    }): Promise<ApiResponse<{
      shippingOptions: Array<{
        partner: {
          _id: string;
          name: string;
          displayName: string;
          code: string;
          logo?: string;
          rating: number;
          successRate: number;
        };
        cost: number;
        deliveryTime: {
          min: number;
          max: number;
          unit: string;
        };
        deliveryTimeDisplay: string;
        isPopular: boolean;
        estimatedDelivery: string;
      }>;
    }>> => {
      return this.request<{
        shippingOptions: Array<{
          partner: {
            _id: string;
            name: string;
            displayName: string;
            code: string;
            logo?: string;
            rating: number;
            successRate: number;
          };
          cost: number;
          deliveryTime: {
            min: number;
            max: number;
            unit: string;
          };
          deliveryTimeDisplay: string;
          isPopular: boolean;
          estimatedDelivery: string;
        }>;
      }>('/web/logistics/shipping-charges', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    getTrackingDetails: async (trackingNumber: string): Promise<ApiResponse<{
      tracking: {
        trackingNumber: string;
        status: string;
        statusDisplay: string;
        progressPercentage: number;
        estimatedDelivery: string;
        actualDelivery?: string;
        currentLocation?: string;
        timeline: Array<{
          status: string;
          description: string;
          timestamp: string;
          location?: string;
        }>;
        partner: {
          name: string;
          displayName: string;
          trackingUrl: string;
        };
        order: {
          id: string;
          status: string;
          total: number;
        };
      };
    }>> => {
      return this.request<{
        tracking: {
          trackingNumber: string;
          status: string;
          statusDisplay: string;
          progressPercentage: number;
          estimatedDelivery: string;
          actualDelivery?: string;
          currentLocation?: string;
          timeline: Array<{
            status: string;
            description: string;
            timestamp: string;
            location?: string;
          }>;
          partner: {
            name: string;
            displayName: string;
            trackingUrl: string;
          };
          order: {
            id: string;
            status: string;
            total: number;
          };
        };
      }>(`/web/logistics/tracking/${trackingNumber}`);
    },

    createShipment: async (data: {
      orderId: string;
      partnerId: string;
      packageDetails?: {
        weight?: number;
        dimensions?: {
          length: number;
          width: number;
          height: number;
          unit: string;
        };
      };
    }): Promise<ApiResponse<{
      shipment: {
        trackingNumber: string;
        estimatedDelivery: string;
        partner: {
          name: string;
          displayName: string;
          trackingUrl: string;
        };
      };
    }>> => {
      return this.request<{
        shipment: {
          trackingNumber: string;
          estimatedDelivery: string;
          partner: {
            name: string;
            displayName: string;
            trackingUrl: string;
          };
        };
      }>('/web/logistics/shipment', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    updateShipmentStatus: async (trackingNumber: string, data: {
      status: string;
      location?: string;
      description?: string;
    }): Promise<ApiResponse<{
      deliveryTracking: DeliveryTracking;
    }>> => {
      return this.request<{
        deliveryTracking: DeliveryTracking;
      }>(`/web/logistics/shipment/${trackingNumber}/status`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    addDeliveryNote: async (trackingNumber: string, data: {
      note: string;
      addedBy: string;
    }): Promise<ApiResponse<{
      deliveryTracking: DeliveryTracking;
    }>> => {
      return this.request<{
        deliveryTracking: DeliveryTracking;
      }>(`/web/logistics/shipment/${trackingNumber}/note`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    getDeliveryTimeline: async (trackingNumber: string): Promise<ApiResponse<{
      timeline: Array<{
        status: string;
        location?: string;
        description: string;
        timestamp: string;
        updatedBy: string;
      }>;
      notes: Array<{
        note: string;
        addedBy: string;
        timestamp: string;
      }>;
      status: string;
      estimatedDelivery: string;
      actualDelivery?: string;
      partner: {
        name: string;
        displayName: string;
        trackingUrl: string;
      };
      order: {
        id: string;
        status: string;
        total: number;
      };
      deliveryBoy?: {
        name: string;
        phone: string;
        id: string;
        assignedAt: string;
      };
      deliveryProof?: {
        photo?: string;
        signature?: string;
        timestamp: string;
      };
    }>> => {
      return this.request<{
        timeline: Array<{
          status: string;
          location?: string;
          description: string;
          timestamp: string;
          updatedBy: string;
        }>;
        notes: Array<{
          note: string;
          addedBy: string;
          timestamp: string;
        }>;
        status: string;
        estimatedDelivery: string;
        actualDelivery?: string;
        partner: {
          name: string;
          displayName: string;
          trackingUrl: string;
        };
        order: {
          id: string;
          status: string;
          total: number;
        };
        deliveryBoy?: {
          name: string;
          phone: string;
          id: string;
          assignedAt: string;
        };
        deliveryProof?: {
          photo?: string;
          signature?: string;
          timestamp: string;
        };
      }>(`/web/logistics/shipment/${trackingNumber}/timeline`);
    },

    assignDeliveryBoy: async (trackingNumber: string, data: {
      name: string;
      phone: string;
      id: string;
    }): Promise<ApiResponse<{
      deliveryTracking: DeliveryTracking;
    }>> => {
      return this.request<{
        deliveryTracking: DeliveryTracking;
      }>(`/web/logistics/shipment/${trackingNumber}/assign-delivery-boy`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    markAsDelivered: async (trackingNumber: string, data: {
      photo?: string;
      signature?: string;
    }): Promise<ApiResponse<{
      deliveryTracking: DeliveryTracking;
    }>> => {
      return this.request<{
        deliveryTracking: DeliveryTracking;
      }>(`/web/logistics/shipment/${trackingNumber}/mark-delivered`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    getDeliveryBoyDashboard: async (deliveryBoyId: string): Promise<ApiResponse<{
      deliveries: Array<{
        _id: string;
        trackingNumber: string;
        status: string;
        estimatedDelivery: string;
        actualDelivery?: string;
        order: {
          _id: string;
          orderStatus: string;
          total: number;
        };
        shippingPartner: {
          _id: string;
          name: string;
          displayName: string;
        };
        recipientDetails: {
          name: string;
          mobile: string;
          address: string;
          pincode: string;
        };
      }>;
      stats: {
        totalAssigned: number;
        delivered: number;
        pending: number;
      };
    }>> => {
      return this.request<{
        deliveries: Array<{
          _id: string;
          trackingNumber: string;
          status: string;
          estimatedDelivery: string;
          actualDelivery?: string;
          order: {
            _id: string;
            orderStatus: string;
            total: number;
          };
          shippingPartner: {
            _id: string;
            name: string;
            displayName: string;
          };
          recipientDetails: {
            name: string;
            mobile: string;
            address: string;
            pincode: string;
          };
        }>;
        stats: {
          totalAssigned: number;
          delivered: number;
          pending: number;
        };
      }>(`/web/logistics/delivery-boy/${deliveryBoyId}/dashboard`);
    },

    getDeliveryAnalytics: async (params?: {
      partnerId?: string;
      startDate?: string;
      endDate?: string;
    }): Promise<ApiResponse<{
      analytics: {
        totalDeliveries: number;
        deliveredCount: number;
        successRate: number;
        statusBreakdown: Array<{
          _id: string;
          count: number;
          totalValue: number;
        }>;
        averageDeliveryTime: number;
      };
    }>> => {
      const queryParams = new URLSearchParams();
      if (params?.partnerId) queryParams.append('partnerId', params.partnerId);
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      
      return this.request<{
        analytics: {
          totalDeliveries: number;
          deliveredCount: number;
          successRate: number;
          statusBreakdown: Array<{
            _id: string;
            count: number;
            totalValue: number;
          }>;
          averageDeliveryTime: number;
        };
      }>(`/web/logistics/analytics?${queryParams.toString()}`);
    },

    getActiveDeliveries: async (params?: {
      partnerId?: string;
    }): Promise<ApiResponse<{
      deliveries: Array<{
        _id: string;
        trackingNumber: string;
        status: string;
        estimatedDelivery: string;
        order: {
          _id: string;
          orderStatus: string;
          total: number;
          items: Array<{
            product: {
              _id: string;
              productName: string;
            };
            quantity: number;
            price: number;
          }>;
        };
        shippingPartner: {
          _id: string;
          name: string;
          displayName: string;
        };
        recipientDetails: {
          name: string;
          mobile: string;
          address: string;
          pincode: string;
        };
        deliveryBoy?: {
          name: string;
          phone: string;
          id: string;
          assignedAt: string;
        };
      }>;
    }>> => {
      const queryParams = new URLSearchParams();
      if (params?.partnerId) queryParams.append('partnerId', params.partnerId);
      
      return this.request<{
        deliveries: Array<{
          _id: string;
          trackingNumber: string;
          status: string;
          estimatedDelivery: string;
          order: {
            _id: string;
            orderStatus: string;
            total: number;
            items: Array<{
              product: {
                _id: string;
                productName: string;
              };
              quantity: number;
              price: number;
            }>;
          };
          shippingPartner: {
            _id: string;
            name: string;
            displayName: string;
          };
          recipientDetails: {
            name: string;
            mobile: string;
            address: string;
            pincode: string;
          };
          deliveryBoy?: {
            name: string;
            phone: string;
            id: string;
            assignedAt: string;
          };
        }>;
      }>(`/web/logistics/active-deliveries?${queryParams.toString()}`);
    },

    // iThink Logistics Integration
    syncOrderToIThinkLogistics: async (data: {
      orderId: string;
      partnerId: string;
    }): Promise<ApiResponse<{
      success: boolean;
      awbNumber?: string;
      trackingNumber?: string;
      message: string;
    }>> => {
      return this.request<{
        success: boolean;
        awbNumber?: string;
        trackingNumber?: string;
        message: string;
      }>('/web/logistics/sync-ithink', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    getIThinkLogisticsTracking: async (awbNumber: string): Promise<ApiResponse<{
      success: boolean;
      tracking: TrackingData;
    }>> => {
      return this.request<{
        success: boolean;
        tracking: TrackingData;
      }>(`/web/logistics/ithink-tracking/${awbNumber}`);
    },

    // Check pincode availability with iThink Logistics
    checkPincodeAvailability: async (pincode: string): Promise<ApiResponse<{
      pincode: string;
      isAvailable: boolean;
      message: string;
    }>> => {
      return this.request<{
        pincode: string;
        isAvailable: boolean;
        message: string;
      }>(`/web/logistics/check-pincode/${pincode}`);
    },
  };

  warranty = {
    getProductWarranties: async (productId: string): Promise<ApiResponse<Warranty[]>> => {
      return this.request<Warranty[]>(`/web/warranty/product/${productId}`);
    },

    getWarrantiesForProducts: async (productIds: string[]): Promise<ApiResponse<{ [productId: string]: Warranty[] }>> => {
      return this.request<{ [productId: string]: Warranty[] }>('/web/warranty/products', {
        method: 'POST',
        body: JSON.stringify({ productIds }),
      });
    },

    getUserWarranties: async (): Promise<ApiResponse<Array<{
      warrantyId: string;
      warrantyName: string;
      warrantyDescription: string;
      duration: number;
      price: number;
      coverage: string[];
      productId: string;
      productName: string;
      productImage: string | null;
      orderId: string;
      orderNumber: string;
      purchaseDate: string;
      expiryDate: string;
      status: 'active' | 'expired';
      daysRemaining: number;
    }>>> => {
      return this.request<Array<{
        warrantyId: string;
        warrantyName: string;
        warrantyDescription: string;
        duration: number;
        price: number;
        coverage: string[];
        productId: string;
        productName: string;
        productImage: string | null;
        orderId: string;
        orderNumber: string;
        purchaseDate: string;
        expiryDate: string;
        status: 'active' | 'expired';
        daysRemaining: number;
      }>>('/web/warranty/user');
    },
  };

  categories = {
    getAll: async (): Promise<ApiResponse<Array<{
      _id: string;
      name: string;
      image?: string;
      description?: string;
      productCount?: number;
    }>>> => {
      return this.request<Array<{
        _id: string;
        name: string;
        image?: string;
        description?: string;
        productCount?: number;
      }>>('/web/categories');
    },
  };

  // Promo Codes, Gift Vouchers, Digital Wallets, and Bank Offers
  promo = {
    getActivePromoCodes: async (): Promise<ApiResponse<Array<{
      _id: string;
      code: string;
      name: string;
      description?: string;
      type: string;
      value: number;
      minimumAmount: number;
      maximumDiscount?: number;
      validFrom?: string;
      validUntil?: string;
      image?: string;
      priority?: number;
    }>>> => {
      return this.request('/web/promo-codes');
    },
  };

  giftVoucher = {
    getActiveGiftVouchers: async (): Promise<ApiResponse<Array<{
      _id: string;
      code: string;
      name: string;
      description?: string;
      type: string;
      value: number;
      minimumAmount: number;
      maximumDiscount?: number;
      validFrom?: string;
      validUntil?: string;
      image?: string;
    }>>> => {
      return this.request('/web/gift-vouchers');
    },
  };

  wallet = {
    getDigitalWallets: async (): Promise<ApiResponse<Array<{
      id: string;
      name: string;
      icon: string;
      description: string;
      isActive: boolean;
    }>>> => {
      return this.request('/web/digital-wallets');
    },
  };

  bankOffer = {
    getBankOffers: async (amount?: number): Promise<ApiResponse<Array<{
      id: string;
      bank: string;
      offer: string;
      discount: number;
      discountType: string;
      minAmount: number;
      maxDiscount: number;
      description: string;
      isActive: boolean;
      validUntil?: string | null;
    }>>> => {
      const url = amount ? `/web/bank-offers?amount=${amount}` : '/web/bank-offers';
      return this.request(url);
    },
  };
}

export const apiService = new ApiService(); 