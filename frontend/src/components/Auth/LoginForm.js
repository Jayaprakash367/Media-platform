'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const { login, clearError } = useAuth();
  const router = useRouter();

  // Clear any existing errors when component mounts
  useEffect(() => {
    clearError();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear errors when user starts typing
    if (localError) setLocalError('');
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLocalError('');

    const result = await login(formData);
    
    if (result.success) {
      toast.success('Login successful!');
      // Use replace to prevent going back to login page
      router.replace('/');
    } else {
      setLocalError(result.error || 'Login failed. Please try again.');
      toast.error(result.error || 'Login failed. Please try again.');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] py-12 px-4">
      <div className="flex items-center justify-center gap-8 max-w-[935px] w-full">
        
        {/* Left Side - Phone Collage (Hidden on mobile) */}
        <div className="hidden lg:block relative w-[520px] h-[580px]">
          {/* Background collage of phones/images */}
          <div className="relative w-full h-full">
            {/* Main collage container with multiple images */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Stacked phone mockup images */}
              <div className="relative w-[420px] h-[520px]">
                {/* Background image 1 - Orange outfit */}
                <div className="absolute left-0 top-8 w-[180px] h-[320px] rounded-2xl overflow-hidden shadow-2xl transform -rotate-6 z-10">
                  <img 
                    src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=600&fit=crop" 
                    alt="Fashion" 
                    className="w-full h-full object-cover"
                  />
                  {/* Emoji reactions */}
                  <div className="absolute top-4 right-[-20px] flex gap-1">
                    <span className="text-2xl">🔥</span>
                    <span className="text-2xl">💜</span>
                    <span className="text-2xl">❤️</span>
                  </div>
                </div>
                
                {/* Center image - Person with phone */}
                <div className="absolute left-[100px] top-0 w-[200px] h-[360px] rounded-2xl overflow-hidden shadow-2xl z-20">
                  <img 
                    src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop" 
                    alt="Selfie" 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Right image - Couple */}
                <div className="absolute right-0 top-12 w-[180px] h-[300px] rounded-2xl overflow-hidden shadow-2xl transform rotate-3 z-15">
                  <img 
                    src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop" 
                    alt="Couple" 
                    className="w-full h-full object-cover"
                  />
                  {/* Green checkmark badge */}
                  <div className="absolute top-[-10px] right-[-10px] bg-green-500 rounded-full p-2">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                
                {/* Bottom left - Portrait */}
                <div className="absolute left-[40px] bottom-0 w-[160px] h-[260px] rounded-2xl overflow-hidden shadow-2xl transform -rotate-3 z-25">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop" 
                    alt="Portrait" 
                    className="w-full h-full object-cover"
                  />
                  {/* Heart reaction */}
                  <div className="absolute bottom-20 left-[-20px]">
                    <span className="text-4xl">❤️</span>
                  </div>
                </div>
                
                {/* Bottom right - Story circle */}
                <div className="absolute right-[20px] bottom-[80px] z-30">
                  <div className="w-[80px] h-[80px] rounded-full p-[3px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
                    <div className="w-full h-full rounded-full p-[2px] bg-black">
                      <img 
                        src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop" 
                        alt="Story" 
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Instagram UI elements */}
                <div className="absolute bottom-[20px] left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-black/40 backdrop-blur-sm rounded-full px-6 py-2">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2"/>
                  </svg>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                  </svg>
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="max-w-[350px] w-full">
          {/* Main Login Box */}
          <div className="bg-black border border-[#262626] rounded-sm p-10 mb-3">
            {/* Instagram Logo */}
            <div className="flex justify-center mb-8">
              <h1 className="text-5xl text-white font-instagram" style={{ fontFamily: "'Instagram Sans', cursive" }}>
                Instagram
              </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-2">
              <div className="relative">
                <input
                  name="email"
                  type="text"
                  autoComplete="email"
                  required
                  placeholder="Phone number, username or email address"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-[#121212] border border-[#262626] rounded-sm px-2 py-[9px] text-xs text-white placeholder-[#737373] focus:outline-none focus:border-[#a8a8a8]"
                />
              </div>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-[#121212] border border-[#262626] rounded-sm px-2 py-[9px] text-xs text-white placeholder-[#737373] focus:outline-none focus:border-[#a8a8a8] pr-14"
                />
                {formData.password && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white text-sm font-semibold hover:text-gray-400"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                )}
              </div>

              {localError && (
                <p className="text-red-500 text-xs text-center">{localError}</p>
              )}

              <button
                type="submit"
                disabled={isLoading || !formData.email || !formData.password}
                className="w-full bg-[#0095f6] text-white font-semibold py-[7px] rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1877f2] transition-colors mt-2"
              >
                {isLoading ? 'Logging in...' : 'Log in'}
              </button>
            </form>

            <div className="flex items-center my-5">
              <div className="flex-1 h-px bg-[#262626]"></div>
              <span className="px-4 text-[#737373] text-xs font-semibold">OR</span>
              <div className="flex-1 h-px bg-[#262626]"></div>
            </div>

            <button className="w-full flex items-center justify-center space-x-2 text-[#0095f6] font-semibold text-sm hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Log in with Facebook</span>
            </button>

            <p className="text-center text-xs text-[#e0f1ff] mt-4 cursor-pointer hover:text-white">
              Forgotten your password?
            </p>
          </div>

          {/* Sign Up Box */}
          <div className="bg-black border border-[#262626] rounded-sm p-5 text-center">
            <p className="text-sm text-[#f5f5f5]">
              Don't have an account?{' '}
              <Link href="/register" className="text-[#0095f6] font-semibold hover:text-white">
                Sign up
              </Link>
            </p>
          </div>

          {/* Get the app */}
          <div className="mt-5 text-center">
            <p className="text-sm text-[#f5f5f5] mb-4">Get the app.</p>
            <div className="flex justify-center space-x-2">
              <a href="https://play.google.com/store" target="_blank" rel="noopener noreferrer">
                <img 
                  src="https://static.cdninstagram.com/rsrc.php/v3/yz/r/c5Rp7Ym-Klz.png" 
                  alt="Get it on Google Play" 
                  className="h-10"
                />
              </a>
              <a href="https://www.microsoft.com/store" target="_blank" rel="noopener noreferrer">
                <img 
                  src="https://static.cdninstagram.com/rsrc.php/v3/yu/r/EHY6QnZYdNX.png" 
                  alt="Get it from Microsoft" 
                  className="h-10"
                />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 py-6 bg-[#0a0a0a]">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-[#737373] mb-4">
          <a href="#" className="hover:underline">Meta</a>
          <a href="#" className="hover:underline">About</a>
          <a href="#" className="hover:underline">Blog</a>
          <a href="#" className="hover:underline">Jobs</a>
          <a href="#" className="hover:underline">Help</a>
          <a href="#" className="hover:underline">API</a>
          <a href="#" className="hover:underline">Privacy</a>
          <a href="#" className="hover:underline">Terms</a>
          <a href="#" className="hover:underline">Locations</a>
          <a href="#" className="hover:underline">Instagram Lite</a>
          <a href="#" className="hover:underline">Threads</a>
          <a href="#" className="hover:underline">Contact uploading and non-users</a>
          <a href="#" className="hover:underline">Meta Verified</a>
        </div>
        <div className="flex justify-center items-center gap-4 text-xs text-[#737373]">
          <select className="bg-transparent border-none outline-none cursor-pointer">
            <option value="en">English (UK)</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
          </select>
          <span>© 2025 Instagram from Meta</span>
        </div>
      </footer>
    </div>
  );
};

export default LoginForm;