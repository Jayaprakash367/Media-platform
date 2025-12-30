'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

const PrivacyPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    accountPrivacy: false,
    activityStatus: true,
    storySharing: true,
    allowComments: 'everyone',
    allowMessageRequests: 'everyone',
    allowTagging: 'everyone',
    allowMentions: 'everyone',
    hideLikesCount: false,
    sensitiveContentControl: 'limited'
  });
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleToggle = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const handleSelectChange = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleSave = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      toast.success('Privacy settings updated');
      setLoading(false);
    }, 1000);
  };

  const handleUnblock = (userId) => {
    setBlockedUsers(blockedUsers.filter(u => u.id !== userId));
    toast.success('User unblocked');
  };

  return (
    <Layout>
      <div className="min-h-screen bg-black">
        <div className="max-w-3xl mx-auto px-5 py-8">
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="text-white mb-4 flex items-center gap-2 hover:text-[#737373]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h1 className="text-white text-3xl font-semibold mb-2">Privacy and Security</h1>
            <p className="text-[#737373]">Manage your privacy and security settings</p>
          </div>

          <div className="space-y-6">
            {/* Account Privacy */}
            <div className="bg-[#262626] rounded-xl p-6">
              <h2 className="text-white font-semibold text-lg mb-4">Account Privacy</h2>
              
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-white font-medium">Private Account</p>
                  <p className="text-[#737373] text-sm">Only approved followers can see your posts</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.accountPrivacy}
                    onChange={() => handleToggle('accountPrivacy')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#363636] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0095f6]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Activity Status</p>
                  <p className="text-[#737373] text-sm">Show when you&apos;re active</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.activityStatus}
                    onChange={() => handleToggle('activityStatus')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#363636] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0095f6]"></div>
                </label>
              </div>
            </div>

            {/* Story Settings */}
            <div className="bg-[#262626] rounded-xl p-6">
              <h2 className="text-white font-semibold text-lg mb-4">Story Settings</h2>
              
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-white font-medium">Allow Story Sharing</p>
                  <p className="text-[#737373] text-sm">Let people share your stories as messages</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.storySharing}
                    onChange={() => handleToggle('storySharing')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#363636] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0095f6]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Hide Likes Count</p>
                  <p className="text-[#737373] text-sm">Hide like counts on posts</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.hideLikesCount}
                    onChange={() => handleToggle('hideLikesCount')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#363636] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0095f6]"></div>
                </label>
              </div>
            </div>

            {/* Interactions */}
            <div className="bg-[#262626] rounded-xl p-6">
              <h2 className="text-white font-semibold text-lg mb-4">Interactions</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-white font-medium block mb-2">Who can comment</label>
                  <select
                    value={settings.allowComments}
                    onChange={(e) => handleSelectChange('allowComments', e.target.value)}
                    className="w-full bg-black border border-[#363636] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#a8a8a8]"
                  >
                    <option value="everyone">Everyone</option>
                    <option value="following">People You Follow</option>
                    <option value="followers">Your Followers</option>
                    <option value="off">Off</option>
                  </select>
                </div>

                <div>
                  <label className="text-white font-medium block mb-2">Who can tag you</label>
                  <select
                    value={settings.allowTagging}
                    onChange={(e) => handleSelectChange('allowTagging', e.target.value)}
                    className="w-full bg-black border border-[#363636] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#a8a8a8]"
                  >
                    <option value="everyone">Everyone</option>
                    <option value="following">People You Follow</option>
                    <option value="off">No One</option>
                  </select>
                </div>

                <div>
                  <label className="text-white font-medium block mb-2">Who can mention you</label>
                  <select
                    value={settings.allowMentions}
                    onChange={(e) => handleSelectChange('allowMentions', e.target.value)}
                    className="w-full bg-black border border-[#363636] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#a8a8a8]"
                  >
                    <option value="everyone">Everyone</option>
                    <option value="following">People You Follow</option>
                    <option value="off">No One</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="bg-[#262626] rounded-xl p-6">
              <h2 className="text-white font-semibold text-lg mb-4">Messages</h2>
              
              <div>
                <label className="text-white font-medium block mb-2">Message Requests</label>
                <select
                  value={settings.allowMessageRequests}
                  onChange={(e) => handleSelectChange('allowMessageRequests', e.target.value)}
                  className="w-full bg-black border border-[#363636] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#a8a8a8]"
                >
                  <option value="everyone">Everyone</option>
                  <option value="following">People You Follow</option>
                  <option value="off">No One</option>
                </select>
              </div>
            </div>

            {/* Sensitive Content */}
            <div className="bg-[#262626] rounded-xl p-6">
              <h2 className="text-white font-semibold text-lg mb-4">Sensitive Content Control</h2>
              
              <div>
                <label className="text-white font-medium block mb-2">Control how much sensitive content you see</label>
                <select
                  value={settings.sensitiveContentControl}
                  onChange={(e) => handleSelectChange('sensitiveContentControl', e.target.value)}
                  className="w-full bg-black border border-[#363636] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#a8a8a8]"
                >
                  <option value="allow">Allow</option>
                  <option value="limited">Limit (Recommended)</option>
                  <option value="strict">Limit Even More</option>
                </select>
                <p className="text-[#737373] text-sm mt-2">
                  This helps filter sensitive content from places like Explore
                </p>
              </div>
            </div>

            {/* Blocked Accounts */}
            <div className="bg-[#262626] rounded-xl p-6">
              <h2 className="text-white font-semibold text-lg mb-4">Blocked Accounts</h2>
              {blockedUsers.length > 0 ? (
                <div className="space-y-3">
                  {blockedUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.profilePicture}
                          alt={user.username}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <p className="text-white font-medium">{user.username}</p>
                          <p className="text-[#737373] text-sm">{user.fullName}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleUnblock(user.id)}
                        className="text-[#0095f6] font-semibold text-sm hover:text-white"
                      >
                        Unblock
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#737373]">You haven&#39;t blocked anyone</p>
              )}
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-[#0095f6] text-white font-semibold py-3 rounded-lg hover:bg-[#1877f2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPage;
