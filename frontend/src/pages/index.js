'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout/Layout';
import PostCard from '@/components/Post/PostCard';
import StoryCircle from '@/components/Post/StoryCircle';
import StoryViewer from '@/components/Post/StoryViewer';
import { useAuth } from '@/contexts/AuthContext';
import { postAPI, storyAPI, userAPI } from '@/lib/api';
import toast from 'react-hot-toast';

const HomePage = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storyViewerOpen, setStoryViewerOpen] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [currentStoryUserIndex, setCurrentStoryUserIndex] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch stories
  const fetchStories = async () => {
    try {
      const response = await storyAPI.getStories();
      setStories(response.data?.data?.stories || []);
    } catch (error) {
      console.error('Failed to fetch stories:', error);
    }
  };

  // Fetch suggestions
  const fetchSuggestions = async () => {
    try {
      const response = await userAPI.getSuggestions();
      setSuggestions(response.data?.data?.users || response.data?.users || []);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    }
  };

  // Fetch feed posts
  const fetchPosts = async (pageNum = 1, reset = false) => {
    try {
      setLoading(true);
      const response = await postAPI.getFeedPosts(pageNum, 10);
      const responseData = response.data?.data;
      const newPosts = responseData?.data || responseData?.posts || [];
      
      if (reset) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }
      
      setHasMore(responseData?.pagination?.hasNextPage || false);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      if (error.response?.status !== 401) {
        toast.error('Failed to load posts');
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (user) {
      fetchStories();
      fetchPosts(1, true);
      fetchSuggestions();
    }
  }, [user]);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000 &&
        hasMore &&
        !loading
      ) {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchPosts(nextPage, false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [page, hasMore, loading]);

  // Handle post updates
  const handlePostUpdate = (updatedPost) => {
    setPosts(prev => 
      prev.map(post => 
        post._id === updatedPost._id ? updatedPost : post
      )
    );
  };

  // Handle story view
  const handleStoryView = async (story) => {
    if (!story) return;
    
    try {
      await storyAPI.viewStory(story._id);
      setStories(prev => 
        prev.map(userStory => ({
          ...userStory,
          stories: userStory.stories.map(s => 
            s._id === story._id ? { ...s, isViewed: true } : s
          )
        }))
      );
    } catch (error) {
      console.error('Failed to mark story as viewed:', error);
    }
  };

  // Open story viewer
  const openStoryViewer = (userIndex, storyIndex = 0) => {
    setCurrentStoryUserIndex(userIndex);
    setCurrentStoryIndex(storyIndex);
    setStoryViewerOpen(true);
    
    const initialStory = stories[userIndex]?.stories?.[storyIndex];
    if (initialStory) {
      handleStoryView(initialStory);
    }
  };

  // Handle follow
  const handleFollow = async (userId) => {
    try {
      await userAPI.followUser(userId);
      setSuggestions(prev => prev.filter(u => u._id !== userId));
      toast.success('Following!');
    } catch (error) {
      toast.error('Failed to follow');
    }
  };

  // Loading skeleton
  const PostSkeleton = () => (
    <div className="bg-black border border-[#262626] rounded-lg mb-4">
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-[#262626] animate-pulse"></div>
          <div className="w-24 h-3 bg-[#262626] rounded animate-pulse"></div>
        </div>
      </div>
      <div className="w-full aspect-square bg-[#262626] animate-pulse"></div>
      <div className="p-3 space-y-2">
        <div className="flex space-x-4">
          <div className="w-6 h-6 bg-[#262626] rounded animate-pulse"></div>
          <div className="w-6 h-6 bg-[#262626] rounded animate-pulse"></div>
          <div className="w-6 h-6 bg-[#262626] rounded animate-pulse"></div>
        </div>
        <div className="w-20 h-3 bg-[#262626] rounded animate-pulse"></div>
      </div>
    </div>
  );

  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex justify-center pt-6">
        {/* Main Feed */}
        <div className="w-full max-w-[470px] px-2">
          {/* Stories Section */}
          <div className="mb-6 overflow-x-auto scrollbar-hide">
            <div className="flex space-x-4 py-2">
              {/* Your story */}
              <div className="flex flex-col items-center space-y-1 cursor-pointer flex-shrink-0">
                <div className="relative">
                  <div className="w-[66px] h-[66px] rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
                    <div className="bg-black rounded-full p-[2px] w-full h-full">
                      {user?.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt="Your story" 
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-[#262626] flex items-center justify-center text-white">
                          {user?.username?.[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="absolute bottom-0 right-0 w-5 h-5 bg-[#0095f6] rounded-full border-2 border-black flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <span className="text-xs text-gray-400">Your story</span>
              </div>

              {/* User stories */}
              {stories.map((userStory, userIndex) => (
                <div key={userStory.user._id} onClick={() => openStoryViewer(userIndex)}>
                  <StoryCircle
                    user={userStory.user}
                    hasStory={userStory.stories.length > 0}
                    isViewed={userStory.stories.every(story => story.isViewed)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Posts Section */}
          <div>
            {loading && posts.length === 0 ? (
              Array.from({ length: 3 }).map((_, index) => (
                <PostSkeleton key={index} />
              ))
            ) : posts.length === 0 ? (
              <div className="bg-black border border-[#262626] rounded-lg p-12 text-center">
                <div className="text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-lg font-medium mb-2">No posts yet</p>
                  <p className="text-sm">Follow people to see their posts!</p>
                </div>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onUpdate={handlePostUpdate}
                />
              ))
            )}

            {loading && posts.length > 0 && (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              </div>
            )}

            {!hasMore && posts.length > 0 && (
              <div className="text-center py-8 text-gray-500 text-sm">
                <span className="inline-flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  You&apos;re all caught up
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Suggestions */}
        <div className="hidden lg:block w-[319px] ml-16 mt-8">
          {/* Current User */}
          {user && (
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-full overflow-hidden">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#262626] flex items-center justify-center text-white text-lg">
                      {user.username?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{user.username}</p>
                  <p className="text-sm text-gray-400">{user.name || user.username}</p>
                </div>
              </div>
              <button className="text-xs font-semibold text-[#0095f6] hover:text-white">
                Switch
              </button>
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-gray-400">Suggested for you</span>
                <button className="text-xs font-semibold text-white hover:text-gray-400">
                  See All
                </button>
              </div>

              <div className="space-y-3">
                {suggestions.slice(0, 5).map((suggestedUser) => (
                  <div key={suggestedUser._id} className="flex items-center justify-between">
                    <div 
                      className="flex items-center space-x-3 cursor-pointer"
                      onClick={() => router.push(`/profile/${suggestedUser.username}`)}
                    >
                      <div className="w-11 h-11 rounded-full overflow-hidden">
                        {suggestedUser.avatar ? (
                          <img src={suggestedUser.avatar} alt={suggestedUser.username} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-[#262626] flex items-center justify-center text-white text-lg">
                            {suggestedUser.username?.[0]?.toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{suggestedUser.username}</p>
                        <p className="text-xs text-gray-400">Suggested for you</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleFollow(suggestedUser._id)}
                      className="text-xs font-semibold text-[#0095f6] hover:text-white"
                    >
                      Follow
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Links */}
          <div className="mt-8">
            <div className="flex flex-wrap gap-x-1 text-xs text-gray-500">
              <a href="#" className="hover:underline">About</a>
              <span>·</span>
              <a href="#" className="hover:underline">Help</a>
              <span>·</span>
              <a href="#" className="hover:underline">Press</a>
              <span>·</span>
              <a href="#" className="hover:underline">API</a>
              <span>·</span>
              <a href="#" className="hover:underline">Jobs</a>
              <span>·</span>
              <a href="#" className="hover:underline">Privacy</a>
              <span>·</span>
              <a href="#" className="hover:underline">Terms</a>
              <span>·</span>
              <a href="#" className="hover:underline">Locations</a>
            </div>
            <p className="text-xs text-gray-500 mt-4">© 2024 INSTAGRAM FROM META</p>
          </div>
        </div>
      </div>

      {/* Story Viewer */}
      {storyViewerOpen && (
        <StoryViewer
          stories={stories}
          currentStoryIndex={currentStoryIndex}
          currentStoryUserIndex={currentStoryUserIndex}
          onClose={() => setStoryViewerOpen(false)}
          onView={handleStoryView}
        />
      )}
    </Layout>
  );
};

export default HomePage;