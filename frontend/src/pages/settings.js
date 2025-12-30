'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI, userAPI } from '@/lib/api';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const router = useRouter();
  const { user, updateProfile, isAuthenticated, isLoading } = useAuth();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    username: user?.username || '',
    bio: user?.bio || '',
    website: user?.website || '',
    email: user?.email || '',
  });
  const [saving, setSaving] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Update form when user changes
  React.useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        username: user.username || '',
        bio: user.bio || '',
        website: user.website || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Handle profile picture upload separately if provided
      if (profilePicture) {
        const formDataToSend = new FormData();
        formDataToSend.append('profilePicture', profilePicture);

        try {
          const result = await userAPI.uploadProfilePicture(formDataToSend);
          toast.success('Profile picture updated successfully!');
          
          // Update user context with new profile picture
          if (result.data?.data?.profilePicture) {
            const updatedUser = { ...user, profilePicture: result.data.data.profilePicture };
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
          
          setProfilePicture(null);
          setPreviewUrl(null);
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to upload profile picture. Please check your Cloudinary configuration.';
          toast.error(errorMessage);
          setSaving(false);
          return;
        }
      }

      // Update other profile fields
      const result = await updateProfile(formData);
      
      if (result.success) {
        toast.success('Profile updated successfully!');
      } else {
        toast.error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen bg-black">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white"></div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-black">
        <div className="max-w-[935px] mx-auto px-5 py-8">
          <div className="flex">
            {/* Sidebar */}
            <div className="hidden md:block w-[236px] border-r border-[#262626] pr-8">
              <nav className="space-y-1">
                <button className="w-full text-left px-4 py-3 text-white font-semibold bg-transparent hover:bg-[#1a1a1a] rounded-lg border-l-2 border-white">
                  Edit profile
                </button>
                <button 
                  onClick={() => router.push('/settings')}
                  className="w-full text-left px-4 py-3 text-[#a8a8a8] hover:bg-[#1a1a1a] rounded-lg"
                >
                  Professional account
                </button>
                <button 
                  onClick={() => router.push('/settings')}
                  className="w-full text-left px-4 py-3 text-[#a8a8a8] hover:bg-[#1a1a1a] rounded-lg"
                >
                  Notifications
                </button>
                <button 
                  onClick={() => router.push('/privacy')}
                  className="w-full text-left px-4 py-3 text-[#a8a8a8] hover:bg-[#1a1a1a] rounded-lg"
                >
                  Privacy and security
                </button>
                <button 
                  onClick={() => router.push('/settings')}
                  className="w-full text-left px-4 py-3 text-[#a8a8a8] hover:bg-[#1a1a1a] rounded-lg"
                >
                  Ads
                </button>
                <button 
                  onClick={() => router.push('/settings')}
                  className="w-full text-left px-4 py-3 text-[#a8a8a8] hover:bg-[#1a1a1a] rounded-lg"
                >
                  Supervision
                </button>
                <button 
                  onClick={() => router.push('/login-activity')}
                  className="w-full text-left px-4 py-3 text-[#a8a8a8] hover:bg-[#1a1a1a] rounded-lg"
                >
                  Login activity
                </button>
                <button 
                  onClick={() => router.push('/settings')}
                  className="w-full text-left px-4 py-3 text-[#a8a8a8] hover:bg-[#1a1a1a] rounded-lg"
                >
                  Emails from Instagram
                </button>
                <button 
                  onClick={() => router.push('/help')}
                  className="w-full text-left px-4 py-3 text-[#a8a8a8] hover:bg-[#1a1a1a] rounded-lg"
                >
                  Help
                </button>
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 md:pl-8 max-w-[500px]">
              <h1 className="text-white text-xl font-semibold mb-6">Edit profile</h1>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center gap-4 bg-[#262626] rounded-2xl p-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0">
                    <img
                      src={previewUrl || user.profilePicture || `https://ui-avatars.com/api/?name=${user.fullName}&background=random`}
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold">{user.username}</p>
                    <p className="text-[#a8a8a8] text-sm">{user.fullName}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-[#0095f6] hover:bg-[#1877f2] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                  >
                    Change photo
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>

                {/* Website */}
                <div>
                  <label className="block text-white font-semibold mb-2">Website</label>
                  <input
                    name="website"
                    type="url"
                    placeholder="Website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full bg-black border border-[#363636] rounded-xl px-4 py-3 text-white placeholder-[#737373] focus:outline-none focus:border-[#a8a8a8]"
                  />
                  <p className="text-[#737373] text-xs mt-2">
                    Editing your links is only available on mobile. Visit the Instagram app and edit your profile to change the websites in your bio.
                  </p>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-white font-semibold mb-2">Bio</label>
                  <textarea
                    name="bio"
                    placeholder="Bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={3}
                    maxLength={150}
                    className="w-full bg-black border border-[#363636] rounded-xl px-4 py-3 text-white placeholder-[#737373] focus:outline-none focus:border-[#a8a8a8] resize-none"
                  />
                  <p className="text-[#737373] text-xs mt-1 text-right">
                    {formData.bio.length}/150
                  </p>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-white font-semibold mb-2">Gender</label>
                  <select
                    className="w-full bg-black border border-[#363636] rounded-xl px-4 py-3 text-[#737373] focus:outline-none focus:border-[#a8a8a8]"
                  >
                    <option value="">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="custom">Custom</option>
                  </select>
                  <p className="text-[#737373] text-xs mt-2">
                    This won't be part of your public profile.
                  </p>
                </div>

                {/* Show account suggestions */}
                <div className="flex items-center justify-between py-4">
                  <div>
                    <p className="text-white font-semibold">Show account suggestions on profiles</p>
                    <p className="text-[#737373] text-xs mt-1">
                      Choose whether people can see similar account suggestions on your profile, and whether your account can be suggested on other profiles.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-[#363636] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0095f6]"></div>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#0095f6] hover:bg-[#1877f2] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-2 rounded-lg transition-colors"
                >
                  {saving ? 'Saving...' : 'Submit'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SettingsPage;
