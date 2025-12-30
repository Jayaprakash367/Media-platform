'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { userAPI } from '@/lib/api';

const SearchPanel = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('recentSearches') : null;
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse recentSearches from localStorage', e);
      return [];
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchUsers = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const response = await userAPI.searchUsers(query);
        setResults(response.data?.data?.users || []);
      } catch (error) {
        console.error('Search error:', error);
      }
      setLoading(false);
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleUserClick = (user) => {
    // Add to recent searches
    const updated = [user, ...recentSearches.filter(u => u.id !== user.id)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
    onClose();
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const removeRecentSearch = (userId) => {
    const updated = recentSearches.filter(u => u.id !== userId);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  return (
    <motion.div
      initial={{ x: -400, opacity: 0 }}
      animate={{ x: 72, opacity: 1 }}
      exit={{ x: -400, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed left-0 top-0 h-full w-[397px] bg-black border-r border-[#262626] z-40 shadow-2xl"
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 pb-4">
          <h2 className="text-2xl font-semibold text-white mb-8">Search</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-[#262626] text-white rounded-lg px-4 py-3 pl-4 pr-10 outline-none placeholder-gray-500 text-[15px]"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-gray-500 rounded-full flex items-center justify-center"
              >
                <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="border-b border-[#262626]" />

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {query.length < 2 ? (
            // Recent Searches
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white font-semibold">Recent</span>
                {recentSearches.length > 0 && (
                  <button onClick={clearRecentSearches} className="text-[#0095f6] text-sm font-semibold hover:text-white">
                    Clear all
                  </button>
                )}
              </div>
              {recentSearches.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No recent searches.</p>
              ) : (
                <div className="space-y-1">
                  {recentSearches.map((user) => (
                    <div key={user.id} className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-[#1a1a1a]">
                      <Link href={`/profile/${user.username}`} onClick={() => handleUserClick(user)} className="flex items-center gap-3 flex-1">
                        <img
                          src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.fullName}&background=random`}
                          alt={user.username}
                          className="w-11 h-11 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-white text-sm font-semibold">{user.username}</p>
                          <p className="text-gray-500 text-sm">{user.fullName}</p>
                        </div>
                      </Link>
                      <button onClick={() => removeRecentSearch(user.id)} className="p-2 text-gray-500 hover:text-white">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Search Results
            <div className="p-2">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin w-6 h-6 border-2 border-gray-600 border-t-white rounded-full" />
                </div>
              ) : results.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No results found.</p>
              ) : (
                <div className="space-y-1">
                  {results.map((user) => (
                    <Link
                      key={user.id}
                      href={`/profile/${user.username}`}
                      onClick={() => handleUserClick(user)}
                      className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-[#1a1a1a]"
                    >
                      <img
                        src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.fullName}&background=random`}
                        alt={user.username}
                        className="w-11 h-11 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-white text-sm font-semibold">{user.username}</p>
                        <p className="text-gray-500 text-sm">{user.fullName}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SearchPanel;
