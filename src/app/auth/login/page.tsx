'use client';

import { useState } from 'react';
import { useEffect } from 'react';
import Link from 'next/link';
import { signInWithPopup } from 'firebase/auth';
import { auth as firebaseAuth, googleProvider } from '@/lib/firebase';
import { API_CONFIG } from '@/lib/config';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';

export default function LoginPage() {
  const router = useRouter();
  const { auth } = useAppContext();
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        router.push('/');
      }
    }
  }, []);
  
  const [formData, setFormData] = useState({
    identifier: '', // can be email or phone
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // For normal email/password login, call the API directly
      const response = await fetch(`${API_CONFIG.BASE_URL}/web/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.identifier,
          password: formData.password,
        }),
      });
      
      const data = await response.json();
      
      if (data.success && data.data?.token && data.data?.user) {
        // Use auth context to update state properly
        auth.setAuthData(data.data.user, data.data.token);
        
        // Show success toast
        if (typeof window !== 'undefined' && window.showToast) {
          window.showToast('Login successful! Welcome back!', 'success', 3000);
        }
        
        // Small delay to show toast before redirect
        setTimeout(() => {
          router.push('/');
        }, 500);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error: any) {
      setError(error.message || 'Login failed');
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      const user = result.user;
      
      // Use auth context's login function for Google login
      const loginResult = await auth.login({
        firebaseUid: user.uid,
        email: user.email || '',
        name: user.displayName || user.email?.split('@')[0] || 'User',
      });
      
      if (loginResult.success) {
        // Show success toast
        if (typeof window !== 'undefined' && window.showToast) {
          window.showToast('Google login successful! Welcome!', 'success', 3000);
        }
        
        // Small delay to show toast before redirect
        setTimeout(() => {
          router.push('/');
        }, 500);
      } else {
        setError('Google login failed');
      }
    } catch (error: any) {
      setError(error.message || 'Google login failed');
    }
    setGoogleLoading(false);
  };

  const handleGuestSignIn = async () => {
    setGuestLoading(true);
    setError(null);
    try {
      // Use auth context's createGuest function to properly update state
      const result = await auth.createGuest();
      
      if (result.success) {
        // Show success toast
        if (typeof window !== 'undefined' && window.showToast) {
          window.showToast('Guest login successful! Welcome!', 'success', 3000);
        }
        
        // Small delay to show toast before redirect
        setTimeout(() => {
          router.push('/');
        }, 500);
      } else {
        setError('Guest login failed');
      }
    } catch (error: any) {
      setError(error.message || 'Guest login failed');
    }
    setGuestLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };




  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg px-8 py-10">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-8">
            Sign In
          </h2>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md  -space-y-px">
              <div className="mb-4">
                <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1">
                  Email or Phone Number
                </label>
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  autoComplete="username"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your email or phone number"
                  value={formData.identifier}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="flex justify-end mb-4">
              <Link href="/auth/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-500 font-medium">
                Forgot your password?
              </Link>
            </div>
            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
            <div className="mt-8 space-y-3">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {googleLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in with Google...
                  </div>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48"><g><path d="M44.5 20H24v8.5h11.7C34.7 33.1 29.8 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.4l6.4-6.4C33.5 6.5 28.1 4 22 4 11.5 4 3 12.5 3 23s8.5 19 19 19c10.5 0 19-8.5 19-19 0-1.3-.1-2.7-.5-4z" fill="#FFC107"/><path d="M6.3 14.7l7 5.1C15.5 17.1 19.4 14 24 14c2.7 0 5.2.9 7.2 2.4l6.4-6.4C33.5 6.5 28.1 4 22 4c-7.2 0-13.3 4.1-16.7 10.7z" fill="#FF3D00"/><path d="M24 44c5.6 0 10.7-1.9 14.7-5.1l-6.8-5.6C29.9 34.7 27.1 36 24 36c-5.7 0-10.6-2.9-13.5-7.2l-7 5.4C7.1 41.1 14.9 44 24 44z" fill="#4CAF50"/><path d="M44.5 20H24v8.5h11.7c-1.2 3.2-4.1 5.5-7.7 5.5-2.2 0-4.2-.7-5.7-2l-7 5.4C17.1 41.1 20.4 44 24 44c10.5 0 19-8.5 19-19 0-1.3-.1-2.7-.5-4z" fill="#1976D2"/></g></svg>
                    Continue with Google
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleGuestSignIn}
                disabled={guestLoading}
                className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {guestLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in as Guest...
                  </div>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Continue as Guest
                  </>
                )}
              </button>
            </div>
            <div className="flex justify-between items-center mt-6">
              <span className="text-sm text-gray-600">New User?</span>
              <Link href="/auth/register" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">Create an account</Link>
            </div>
          </form>
        </div>
        </div>
    </div>
  );
} 