'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

const RegisterForm = () => {
  const [step, setStep] = useState(1); // 1: form, 2: OTP verification
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    username: '',
    password: '',
    phone: '',
  });
  const [otp, setOtp] = useState('');
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const { register: registerAuth, login } = useAuth();
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please provide a valid email';
    }

    // Full name validation
    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    } else if (formData.fullName.length > 50) {
      newErrors.fullName = 'Full name cannot exceed 50 characters';
    }

    // Username validation
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (formData.username.length > 30) {
      newErrors.username = 'Username cannot exceed 30 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        // Check if phone verification is required
        if (result.data.phoneVerificationRequired && result.data.userId) {
          setUserId(result.data.userId);
          setStep(2);
          toast.success('OTP sent to your phone. Please verify.');
        } else {
          toast.success('Account created successfully!');
          router.replace('/');
        }
      } else {
        toast.error(result.message || 'Registration failed');
      }
    } catch (error) {
      toast.error('Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, otp })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Phone verified! Logging in...');
        // Auto-login
        await login({ identifier: formData.username, password: formData.password });
        router.replace('/');
      } else {
        toast.error(result.message || 'OTP verification failed');
      }
    } catch (error) {
      toast.error('Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const result = await response.json();
      if (result.success) {
        toast.success('OTP resent successfully');
      } else {
        toast.error(result.message || 'Failed to resend OTP');
      }
    } catch (error) {
      toast.error('Failed to resend OTP');
    }
  };

  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] py-12 px-4">
        <div className="max-w-[350px] w-full">
          <div className="bg-black border border-[#262626] rounded-sm px-10 py-8 mb-3">
            <div className="flex justify-center mb-4">
              <h1 className="text-5xl text-white font-instagram">Instagram</h1>
            </div>
            <p className="text-center text-[#737373] font-semibold text-[17px] mb-6">
              Enter the 6-digit OTP sent to your phone
            </p>

            <form onSubmit={handleVerifyOTP} className="space-y-3">
              <input
                type="text"
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="000000"
                className="w-full px-3 py-[9px] text-center text-2xl tracking-widest bg-[#121212] border border-[#363636] rounded-sm text-white placeholder-[#737373] text-xs focus:outline-none focus:border-[#a8a8a8]"
              />

              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full bg-[#0095f6] text-white py-[7px] rounded-lg font-semibold text-sm disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#1877f2] transition-colors"
              >
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <button
                type="button"
                onClick={handleResendOTP}
                className="w-full text-[#0095f6] text-sm font-semibold hover:text-white transition-colors"
              >
                Resend OTP
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] py-12 px-4">
      <div className="max-w-[350px] w-full">
        {/* Main Sign Up Box */}
        <div className="bg-black border border-[#262626] rounded-sm px-10 py-8 mb-3">
          {/* Instagram Logo */}
          <div className="flex justify-center mb-4">
            <h1 className="text-5xl text-white font-instagram" style={{ fontFamily: "'Instagram Sans', cursive" }}>
              Instagram
            </h1>
          </div>

          {/* Sign up description */}
          <p className="text-center text-[#737373] font-semibold text-[17px] mb-4 leading-5">
            Sign up to see photos and videos from your friends.
          </p>

          {/* Facebook Sign Up Button */}
          <button className="w-full flex items-center justify-center space-x-2 bg-[#0095f6] hover:bg-[#1877f2] text-white font-semibold py-[7px] rounded-lg text-sm transition-colors mb-4">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span>Log in with Facebook</span>
          </button>

          {/* OR Divider */}
          <div className="flex items-center my-4">
            <div className="flex-1 h-px bg-[#262626]"></div>
            <span className="px-4 text-[#737373] text-xs font-semibold">OR</span>
            <div className="flex-1 h-px bg-[#262626]"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-2">
            <div>
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                className={`w-full bg-[#121212] border ${errors.email ? 'border-red-500' : 'border-[#262626]'} rounded-sm px-2 py-[9px] text-xs text-white placeholder-[#737373] focus:outline-none focus:border-[#a8a8a8]`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <input
                name="phone"
                type="tel"
                placeholder="Phone number (optional for OTP)"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full bg-[#121212] border ${errors.phone ? 'border-red-500' : 'border-[#262626]'} rounded-sm px-2 py-[9px] text-xs text-white placeholder-[#737373] focus:outline-none focus:border-[#a8a8a8]`}
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            <div>
              <input
                name="fullName"
                type="text"
                autoComplete="name"
                required
                placeholder="Full name"
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full bg-[#121212] border ${errors.fullName ? 'border-red-500' : 'border-[#262626]'} rounded-sm px-2 py-[9px] text-xs text-white placeholder-[#737373] focus:outline-none focus:border-[#a8a8a8]`}
              />
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
            </div>

            <div>
              <input
                name="username"
                type="text"
                autoComplete="username"
                required
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                className={`w-full bg-[#121212] border ${errors.username ? 'border-red-500' : 'border-[#262626]'} rounded-sm px-2 py-[9px] text-xs text-white placeholder-[#737373] focus:outline-none focus:border-[#a8a8a8]`}
              />
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
              {!errors.username && <p className="text-[#737373] text-xs mt-1">Letters, numbers, underscores only</p>}
            </div>

            <div>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full bg-[#121212] border ${errors.password ? 'border-red-500' : 'border-[#262626]'} rounded-sm px-2 py-[9px] text-xs text-white placeholder-[#737373] focus:outline-none focus:border-[#a8a8a8] pr-14`}
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
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Terms and Privacy Notice */}
            <p className="text-[#737373] text-xs text-center py-2 leading-4">
              People who use our service may have uploaded your contact information to Instagram.{' '}
              <a href="#" className="text-[#e0f1ff] hover:text-white">Learn more</a>
            </p>
            <p className="text-[#737373] text-xs text-center pb-2 leading-4">
              By signing up, you agree to our{' '}
              <a href="#" className="text-[#e0f1ff] hover:text-white">Terms</a>,{' '}
              <a href="#" className="text-[#e0f1ff] hover:text-white">Privacy Policy</a> and{' '}
              <a href="#" className="text-[#e0f1ff] hover:text-white">Cookies Policy</a>.
            </p>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0095f6] text-white font-semibold py-[7px] rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1877f2] transition-colors mt-4"
            >
              {isLoading ? 'Signing up...' : 'Sign up'}
            </button>
          </form>
        </div>

        {/* Log In Box */}
        <div className="bg-black border border-[#262626] rounded-sm p-5 text-center">
          <p className="text-sm text-[#f5f5f5]">
            Have an account?{' '}
            <Link href="/login" className="text-[#0095f6] font-semibold hover:text-white">
              Log in
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

export default RegisterForm;
