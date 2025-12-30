'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

const SwitchAccountsPage = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [accounts, setAccounts] = useState([
    { id: user?.id, username: user?.username, profilePicture: user?.profilePicture, fullName: user?.fullName, isActive: true }
  ]);

  const handleLogout = async (accountId) => {
    try {
      await logout();
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const handleAddAccount = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-[#262626] rounded-lg p-6">
          <h1 className="text-white text-2xl font-semibold text-center mb-8">Switch Accounts</h1>

          <div className="space-y-4 mb-6">
            {accounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <img
                    src={account.profilePicture || `https://ui-avatars.com/api/?name=${account.fullName}&background=random`}
                    alt={account.username}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="text-white font-semibold">{account.username}</p>
                    <p className="text-[#737373] text-sm">{account.fullName}</p>
                  </div>
                </div>
                
                {account.isActive && (
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#0095f6]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                    <button
                      onClick={() => handleLogout(account.id)}
                      className="text-[#0095f6] text-sm font-semibold hover:text-white"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={handleAddAccount}
            className="w-full bg-[#0095f6] text-white font-semibold py-3 rounded-lg hover:bg-[#1877f2] transition-colors mb-4"
          >
            Add Account
          </button>

          <button
            onClick={() => router.back()}
            className="w-full text-[#737373] font-semibold py-2 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>

        <div className="text-center mt-6">
          <p className="text-[#737373] text-sm">
            You can manage multiple accounts on Instagram. Switch between them seamlessly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SwitchAccountsPage;
