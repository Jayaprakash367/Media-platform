'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import './globals.css';

// Auth wrapper component to handle redirects
const AuthWrapper = ({ children }) => {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  
  // Public pages that don't require authentication
  const publicPages = ['/login', '/register', '/forgot-password'];
  const isPublicPage = publicPages.includes(router.pathname);

  useEffect(() => {
    if (!isLoading) {
      // If not authenticated and trying to access protected page, redirect to login
      if (!isAuthenticated && !isPublicPage) {
        router.replace('/login');
      }
      // If authenticated and on login/register page, redirect to home
      if (isAuthenticated && isPublicPage) {
        router.replace('/');
      }
    }
  }, [isAuthenticated, isLoading, isPublicPage, router]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white"></div>
      </div>
    );
  }

  // If not authenticated and not on public page, show loading (will redirect)
  if (!isAuthenticated && !isPublicPage) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white"></div>
      </div>
    );
  }

  return children;
};

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthWrapper>
          <Component {...pageProps} />
        </AuthWrapper>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}