'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiService, User } from '../lib/api';
import { clearAuthData, isTokenExpired } from '../lib/authUtils';
import { useRouter } from 'next/navigation';
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export const useAuth = () => {
  const router=useRouter()
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true
  });

  // Initialize auth state from localStorage
  useEffect(() => {
    // Check if we're on the client side
    if (typeof window === 'undefined') {
      setAuthState(prev => ({ ...prev, loading: false }));
      return;
    }
    
    try {
      const token = localStorage.getItem('authToken');
      console.log('=== AUTH INIT DEBUG ===');
      console.log('Token from localStorage:', token ? token.substring(0, 20) + '...' : 'No token');
      
      if (token && !isTokenExpired(token)) {
        apiService.setToken(token);
        console.log('Token set in apiService');
        // Try to get user data from localStorage first
        const userData = localStorage.getItem('userData');
        console.log('User data from localStorage:', userData);
        
        if (userData) {
          try {
            const user = JSON.parse(userData);
            console.log('Parsed user data:', user);
            setAuthState({
              user,
              token,
              isAuthenticated: true,
              loading: false
            });
          } catch (error) {
            // If user data is invalid, try to fetch profile
            fetchProfile();
          }
        } else {
          console.log('No user data in localStorage, fetching profile');
          // No user data in localStorage, try to fetch profile
          fetchProfile();
        }
      } else {
        console.log('No token in localStorage or token is expired');
        if (token && isTokenExpired(token)) {
          console.log('Clearing expired token');
          clearAuthData();
        }
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Sign out from Firebase if available
      if (typeof window !== 'undefined') {
        const { auth } = await import('@/lib/firebase');
        const { signOut } = await import('firebase/auth');
        try {
          await signOut(auth);
        } catch (firebaseError) {
          console.log('Firebase sign out error (may not be signed in):', firebaseError);
        }
      }
    } catch (error) {
      console.log('Error signing out from Firebase:', error);
    }
    
    // Clear API service token
    apiService.auth.logout();
    
    // Clear all auth data
    clearAuthData();
    
    // Update auth state
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false
    });
    
    // Redirect to home page
    if (typeof window !== 'undefined') {
      router.push('/');
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await apiService.auth.getProfile();
      
      if (response.success && response.data) {
        setAuthState({
          user: response.data.user,
          token: localStorage.getItem('authToken'),
          isAuthenticated: true,
          loading: false
        });
      } else {
        // Check if it's a token expiration response
        if (response.message && response.message.includes('Token expired')) {
          console.log('Token expired during profile fetch');
          logout();
          // The AuthGuard will handle the redirect
        } else {
          // Other error, clear auth state
          logout();
        }
      }
    } catch (error: unknown) {
      // Don't logout on network errors, just set loading to false
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, [logout]);

  const register = useCallback(async (userData: {
    email: string;
    name: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    firebaseUid?: string;
    referralCode?: string;
  }) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      
      // For Google auth, send object with firebaseUid, email, name, displayName
      // For regular registration, send identifier as string
      const identifier = userData.firebaseUid 
        ? {
            email: userData.email,
            firebaseUid: userData.firebaseUid,
            name: userData.name,
            displayName: userData.name
          }
        : (userData.email || userData.phone || '');
      
      const response = await apiService.auth.register({
        identifier,
        referralCode: userData.referralCode
      });
      
      if (
        response.success &&
        response.data &&
        typeof response.data === 'object' &&
        'user' in response.data &&
        'token' in response.data
      ) {
        const { user, token } = response.data as { user: { id: string; email: string; name: string; role: string; isGuest: boolean }; token: string };
        apiService.setToken(token);
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(user));
        setAuthState({
          user,
          token,
          isAuthenticated: true,
          loading: false
        });
        return { success: true, user };
      } else {
        // Handle error response
        setAuthState(prev => ({ ...prev, loading: false }));
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  }, []);

  const login = useCallback(async (loginData: {
    firebaseUid: string;
    email: string;
    name: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      const response = await apiService.auth.login(loginData);
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        apiService.setToken(token);
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(user));
        setAuthState({
          user,
          token,
          isAuthenticated: true,
          loading: false
        });
        return { success: true, user };
      } else {
        // Handle error response
        setAuthState(prev => ({ ...prev, loading: false }));
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  }, []);

  const createGuest = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      const response = await apiService.auth.createGuest();
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        apiService.setToken(token);
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(user));
        setAuthState({
          user,
          token,
          isAuthenticated: true,
          loading: false
        });
        return { success: true, user };
      } else {
        // Handle error response
        setAuthState(prev => ({ ...prev, loading: false }));
        throw new Error(response.message || 'Failed to create guest account');
      }
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  }, []);

  const updateProfile = useCallback(async (profileData: {
    name?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }) => {
    try {
      const response = await apiService.auth.updateProfile(profileData);
      
      if (response.success && response.data?.user) {
        const user = response.data.user;
        setAuthState(prev => ({
          ...prev,
          user
        }));
        return { success: true, user };
      } else {
        // Handle error response
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      throw error;
    }
  }, []);

  // Helper function to manually set auth state after login
  const setAuthData = useCallback((user: User, token: string) => {
    apiService.setToken(token);
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(user));
    setAuthState({
      user,
      token,
      isAuthenticated: true,
      loading: false
    });
  }, []);

  return {
    user: authState.user,
    token: authState.token,
    isAuthenticated: authState.isAuthenticated,
    loading: authState.loading,
    register,
    login,
    createGuest,
    updateProfile,
    logout,
    refetchProfile: fetchProfile,
    setAuthData
  };
}; 