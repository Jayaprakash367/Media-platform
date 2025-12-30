'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { postAPI } from '@/lib/api';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

const ExplorePage = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'users'
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      if (activeTab === 'posts') {
        fetchPosts();
      } else {
        searchUsers();
      }
    }
  }, [user, activeTab, searchQuery]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await postAPI.getExplorePosts(1, 30);
      const postsData = response.data?.data?.posts || response.data?.data || [];
      setPosts(postsData);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users/search', { params: { q: searchQuery, limit: 50 } });
      const usersData = response.data?.data?.items || response.data?.data || [];
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to search users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId) => {
    try {
      const response = await api.put(`/users/${userId}/follow`);
      const { isFollowing, requestStatus } = response.data.data || {};
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, isFollowing, requestStatus } : u
      ));
      if (requestStatus === 'pending') {
        toast.success('Follow request sent');
      } else {
        toast.success(isFollowing ? 'Following' : 'Unfollowed');
      }
    } catch (error) {
      toast.error('Action failed');
    }
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="max-w-[935px] mx-auto px-5 py-6">
          {/* Tab Navigation */}
          <div className="flex mb-6 space-x-4">
            <button className="px-4 py-2 bg-[#262626] rounded-lg animate-pulse w-20 h-10"></button>
            <button className="px-4 py-2 bg-[#262626] rounded-lg animate-pulse w-20 h-10"></button>
          </div>
          {/* Grid skeleton */}
          <div className="grid grid-cols-3 gap-1">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-square bg-[#262626] animate-pulse"></div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-[935px] mx-auto px-5 py-6">
        {/* Tab Navigation */}
        <div className="flex mb-6 space-x-2 border-b border-gray-700 pb-4">
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'posts'
                ? 'bg-blue-500 text-white'
                : 'bg-[#262626] text-gray-400 hover:bg-[#363636]'
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'users'
                ? 'bg-blue-500 text-white'
                : 'bg-[#262626] text-gray-400 hover:bg-[#363636]'
            }`}
          >
            People
          </button>
          {activeTab === 'users' && (
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 ml-4 px-4 py-2 bg-[#262626] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          )}
        </div>

        {/* Content */}
        {activeTab === 'posts' ? (
          posts.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              <p className="text-xl mb-2">No posts to explore</p>
              <p className="text-sm">Start following people to see their posts</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {posts.map((post) => (
                <motion.div
                  key={post.id}
                  className="aspect-square cursor-pointer group relative overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedPost(post)}
                >
                  <img
                    src={post.mediaUrl}
                    alt={post.caption || ''}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
                    <div className="flex items-center gap-2 text-white">
                      <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                      <span className="font-semibold">{post.likesCount || 0}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white">
                      <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                      </svg>
                      <span className="font-semibold">{post.commentsCount || 0}</span>
                    </div>
                  </div>
                  {post.mediaType === 'video' && (
                    <div className="absolute top-3 right-3">
                      <svg className="w-6 h-6 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )
        ) : (
          <div className="space-y-2">
            {users.length === 0 ? (
              <div className="text-center text-gray-400 py-12">
                <p className="text-xl mb-2">No users found</p>
                <p className="text-sm">Try searching for someone</p>
              </div>
            ) : (
              users.map((u) => (
                <div
                  key={u.id}
                  className="bg-[#262626] p-4 rounded-lg flex items-center justify-between hover:bg-[#363636] transition-colors"
                >
                  <div className="flex items-center space-x-3 flex-1 cursor-pointer" onClick={() => router.push(`/profile/${u.username}`)}>
                    <img
                      src={u.profilePicture || '/default-avatar.png'}
                      alt={u.username}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-medium text-white flex items-center">
                        {u.username}
                        {u.isVerified && (
                          <svg className="w-4 h-4 ml-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                          </svg>
                        )}
                      </div>
                      <div className="text-sm text-gray-400">{u.fullName}</div>
                      {u.bio && <div className="text-xs text-gray-500 mt-1 line-clamp-1">{u.bio}</div>}
                    </div>
                  </div>
                  <button
                    onClick={() => handleFollow(u.id)}
                    className={`px-6 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      u.isFollowing
                        ? 'bg-[#363636] text-white hover:bg-[#404040]'
                        : u.requestStatus === 'pending'
                        ? 'bg-gray-600 text-white'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                    disabled={u.requestStatus === 'pending'}
                  >
                    {u.isFollowing ? 'Unfollow' : u.requestStatus === 'pending' ? 'Requested' : 'Follow'}
                  </button>
                </div>
              ))
            )}
          </div>
        )}
        </div>
      </Layout>
    );
};

export default ExplorePage;
