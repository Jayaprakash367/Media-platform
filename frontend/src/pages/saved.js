'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { postAPI } from '@/lib/api';
import toast from 'react-hot-toast';

const SavedPage = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSavedPosts();
    }
  }, [isAuthenticated]);

  const fetchSavedPosts = async () => {
    try {
      const response = await postAPI.getSavedPosts(1, 50);
      setSavedPosts(response.data.data.items || []);
    } catch (error) {
      console.error('Error fetching saved posts:', error);
      toast.error('Failed to load saved posts');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (postId) => {
    try {
      await postAPI.toggleSave(postId);
      setSavedPosts(savedPosts.filter(post => post.id !== postId));
      toast.success('Post removed from saved');
      if (selectedPost?.id === postId) {
        setSelectedPost(null);
      }
    } catch (error) {
      toast.error('Failed to unsave post');
    }
  };

  if (isLoading || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen bg-black">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-black">
        <div className="max-w-[935px] mx-auto px-5 py-8">
          <h1 className="text-white text-2xl font-semibold mb-8">Saved Posts</h1>

          {savedPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <svg className="w-24 h-24 text-[#737373] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <polygon fill="none" points="20 21 12 13.44 4 21 4 3 20 3 20 21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polygon>
              </svg>
              <h2 className="text-white text-xl mb-2">Save</h2>
              <p className="text-[#737373] text-center max-w-xs">
                Save photos and videos that you want to see again. No one is notified, and only you can see what you&#39;ve saved.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {savedPosts.map((post) => (
                <div
                  key={post.id}
                  className="relative aspect-square bg-[#1a1a1a] cursor-pointer group overflow-hidden"
                  onClick={() => setSelectedPost(post)}
                >
                  {post.mediaType === 'video' ? (
                    <video
                      src={post.mediaUrl}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={post.mediaUrl}
                      alt={post.caption}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex items-center gap-6 text-white">
                      <div className="flex items-center gap-2">
                        <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                          <path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938m0-2a6.04 6.04 0 0 0-4.797 2.127 6.052 6.052 0 0 0-4.787-2.127A6.985 6.985 0 0 0 .5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 0 0 3.518 3.018 2 2 0 0 0 2.174 0 45.263 45.263 0 0 0 3.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 0 0-6.708-7.218Z"></path>
                        </svg>
                        <span>{post.likesCount || 0}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                          <path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></path>
                        </svg>
                        <span>{post.commentsCount || 0}</span>
                      </div>
                    </div>
                  </div>
                  {post.mediaType === 'video' && (
                    <div className="absolute top-2 right-2">
                      <svg className="w-5 h-5 text-white drop-shadow" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5.888 22.5a3.46 3.46 0 0 1-1.721-.46l-.003-.002a3.451 3.451 0 0 1-1.72-2.982V4.943a3.445 3.445 0 0 1 5.163-2.987l12.226 7.059a3.444 3.444 0 0 1-.001 5.967l-12.22 7.056a3.462 3.462 0 0 1-1.724.462Z"></path>
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Post Detail Modal */}
        {selectedPost && (
          <div
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
            onClick={() => setSelectedPost(null)}
          >
            <div className="relative max-w-5xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setSelectedPost(null)}
                className="absolute -top-10 right-0 text-white"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="bg-black rounded-lg overflow-hidden flex">
                <div className="flex-1 flex items-center justify-center bg-black">
                  {selectedPost.mediaType === 'video' ? (
                    <video src={selectedPost.mediaUrl} controls className="max-h-[80vh] w-auto" />
                  ) : (
                    <img src={selectedPost.mediaUrl} alt={selectedPost.caption} className="max-h-[80vh] w-auto" />
                  )}
                </div>
                
                <div className="w-80 bg-black border-l border-[#262626] flex flex-col">
                  <div className="p-4 border-b border-[#262626] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={selectedPost.user?.profilePicture || `https://ui-avatars.com/api/?name=${selectedPost.user?.fullName}&background=random`}
                        alt={selectedPost.user?.username}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="text-white font-semibold text-sm">{selectedPost.user?.username}</span>
                    </div>
                    <button
                      onClick={() => handleUnsave(selectedPost.id)}
                      className="text-red-500 text-sm font-semibold hover:text-red-400"
                    >
                      Unsave
                    </button>
                  </div>
                  
                  <div className="p-4 flex-1 overflow-y-auto">
                    {selectedPost.caption && (
                      <p className="text-white text-sm">{selectedPost.caption}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SavedPage;
