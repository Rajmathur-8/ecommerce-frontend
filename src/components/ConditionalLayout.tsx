'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import ChatSupportWidget from './ChatSupportWidget';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  
  // List of paths that should not have header and footer
  const authPaths = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/otp',
    '/auth/reset-password',
    '/auth/otp/set-password'
  ];
  
  // Check if current path is an auth path
  const isAuthPath = authPaths.some(path => pathname.startsWith(path));
  
  if (isAuthPath) {
    // For auth pages, render only the children without header and footer
    return <>{children}</>;
  }
  
  // For all other pages, render with header and footer
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      {/* Chat Support Widget - shows on all non-auth pages */}
      <ChatSupportWidget />
    </div>
  );
}
