'use client';

declare global {
  interface Window {
    showToast?: (message: string, type: string, duration?: number) => void;
  }
}

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { setTokenExpirationHandler } from '../lib/api';

interface AuthGuardProps {
  children: React.ReactNode;
}

// List of public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/products',
  '/product',
  '/special-offers',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/otp',
  '/auth/reset-password',
  '/auth/otp/set-password'
];

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();

  useEffect(() => {
    // Set up token expiration handler
    const handleTokenExpiration = () => {
      console.log('Token expired, redirecting to login page');
      
      // Don't redirect if already on a public route
      if (PUBLIC_ROUTES.includes(pathname)) {
        console.log('Already on public route, not redirecting');
        return;
      }
      
      // Show a toast notification to the user
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast('Your session has expired. Please login again.', 'warning', 5000);
      }
      
      // Clear auth state
      logout();
      
      // Add a small delay to ensure the logout is processed
      setTimeout(() => {
        router.push('/auth/login');
      }, 100);
    };

    setTokenExpirationHandler(handleTokenExpiration);

    // Cleanup function
    return () => {
      setTokenExpirationHandler(() => {});
    };
  }, [logout, router, pathname]);

  return <>{children}</>;
};
