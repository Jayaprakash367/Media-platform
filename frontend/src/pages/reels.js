'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '@/components/Layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { postAPI } from '@/lib/api';
import toast from 'react-hot-toast';

// Custom Icons
const HeartIcon = ({ filled }) => (
  <svg className={`w-7 h-7 ${filled ? 'text-red-500 fill-current' : 'text-white'}`} fill={filled ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const CommentIcon = () => (
  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const ShareIcon = () => (
  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" transform="rotate(-45 12 12)" />
  </svg>
);

const BookmarkIcon = ({ filled }) => (
  <svg className="w-7 h-7 text-white" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
);

const MoreIcon = () => (
  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="6" cy="12" r="1.5" />
    <circle cx="18" cy="12" r="1.5" />
  </svg>
);

const MuteIcon = ({ muted }) => (
  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    {muted ? (
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
    ) : (
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    )}
  </svg>
);

const MusicIcon = () => (
  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
  </svg>
);

const ReelCard = ({ reel, isActive, onLike, onSave }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLiked, setIsLiked] = useState(reel.isLikedByUser || false);
  const [isSaved, setIsSaved] = useState(reel.isSavedByUser || false);
  const [likesCount, setLikesCount] = useState(reel.likesCount || 0);
  const [showHeart, setShowHeart] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isActive]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleDoubleClick = async () => {
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 1000);
    if (!isLiked) {
      setIsLiked(true);
      setLikesCount(prev => prev + 1);
      onLike(reel._id || reel.id);
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleLike = async () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    onLike(reel._id || reel.id);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    onSave(reel._id || reel.id);
  };

  const user = reel.user || reel.userId || {};

  return (
    <div className="relative h-full w-full bg-black flex items-center justify-center">
      {/* Video */}
      <video
        ref={videoRef}
        src={reel.mediaUrl}
        className="h-full w-full object-cover"
        loop
        muted={isMuted}
        playsInline
        onClick={handleVideoClick}
        onDoubleClick={handleDoubleClick}
      />

      {/* Double tap heart animation */}
      <AnimatePresence>
        {showHeart && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
          >
            <svg className="w-32 h-32 text-white drop-shadow-2xl" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Play/Pause indicator */}
      <AnimatePresence>
        {!isPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="w-20 h-20 bg-black/30 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gradient overlay */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

      {/* Mute button */}
      <button
        onClick={toggleMute}
        className="absolute top-4 right-4 w-8 h-8 bg-black/40 rounded-full flex items-center justify-center"
      >
        <MuteIcon muted={isMuted} />
      </button>

      {/* Right side actions */}
      <div className="absolute right-3 bottom-24 flex flex-col items-center space-y-5">
        <button onClick={handleLike} className="flex flex-col items-center">
          <HeartIcon filled={isLiked} />
          <span className="text-white text-xs mt-1">{likesCount}</span>
        </button>

        <button className="flex flex-col items-center">
          <CommentIcon />
          <span className="text-white text-xs mt-1">{reel.commentsCount || 0}</span>
        </button>

        <button className="flex flex-col items-center">
          <ShareIcon />
        </button>

        <button onClick={handleSave} className="flex flex-col items-center">
          <BookmarkIcon filled={isSaved} />
        </button>

        <button className="flex flex-col items-center">
          <MoreIcon />
        </button>

        {/* Audio disc */}
        <div className="w-8 h-8 rounded-lg overflow-hidden border border-gray-600 animate-spin-slow">
          {user.avatar || user.profilePicture ? (
            <img src={user.avatar || user.profilePicture} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500" />
          )}
        </div>
      </div>

      {/* Bottom info */}
      <div className="absolute left-3 right-16 bottom-6">
        {/* User info */}
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-8 h-8 rounded-full overflow-hidden">
            {user.avatar || user.profilePicture ? (
              <img src={user.avatar || user.profilePicture} alt={user.username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[#262626] flex items-center justify-center text-white text-xs">
                {(user.username || 'U')[0].toUpperCase()}
              </div>
            )}
          </div>
          <span className="text-white font-semibold text-sm">{user.username || 'Unknown'}</span>
          <button className="px-3 py-1 border border-white rounded text-white text-xs font-semibold">
            Follow
          </button>
        </div>

        {/* Caption */}
        {reel.caption && (
          <p className="text-white text-sm mb-2 line-clamp-2">{reel.caption}</p>
        )}

        {/* Audio info */}
        <div className="flex items-center space-x-2">
          <MusicIcon />
          <div className="overflow-hidden">
            <p className="text-white text-xs whitespace-nowrap animate-marquee">
              {reel.audio || `${user.username} • Original audio`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReelsPage = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    const fetchReels = async () => {
      try {
        // Try dedicated reels endpoint first, fallback to explore
        let posts = [];
        try {
          const response = await postAPI.getReels(1, 20);
          posts = response.data?.data?.data || response.data?.data?.posts || [];
        } catch {
          const response = await postAPI.getExplorePosts(1, 20);
          posts = response.data?.data?.posts || response.data?.data?.data || [];
        }
        // Prefer video posts, but show all if no videos available
        const videoReels = posts.filter(p => p.mediaType === 'video' || p.isReel);
        setReels(videoReels.length > 0 ? videoReels : posts.slice(0, 10));
      } catch (error) {
        console.error('Failed to fetch reels:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchReels();
    }
  }, [user]);

  const handleScroll = (direction) => {
    if (direction === 'up' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (direction === 'down' && currentIndex < reels.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleWheel = (e) => {
    if (e.deltaY > 0) {
      handleScroll('down');
    } else {
      handleScroll('up');
    }
  };

  const handleLike = async (reelId) => {
    try {
      await postAPI.toggleLike(reelId);
    } catch (error) {
      console.error('Failed to like:', error);
    }
  };

  const handleSave = async (reelId) => {
    try {
      await postAPI.toggleSave(reelId);
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <Layout fullWidth>
        <div className="flex items-center justify-center h-screen bg-black">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout fullWidth>
      <div 
        ref={containerRef}
        className="h-screen overflow-hidden bg-black"
        onWheel={handleWheel}
      >
        {/* Navigation arrows */}
        <div className="fixed right-20 top-1/2 -translate-y-1/2 z-20 flex flex-col space-y-4">
          <button
            onClick={() => handleScroll('up')}
            disabled={currentIndex === 0}
            className={`w-10 h-10 rounded-full bg-[#262626] flex items-center justify-center transition-opacity ${currentIndex === 0 ? 'opacity-30' : 'hover:bg-[#363636]'}`}
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            onClick={() => handleScroll('down')}
            disabled={currentIndex === reels.length - 1}
            className={`w-10 h-10 rounded-full bg-[#262626] flex items-center justify-center transition-opacity ${currentIndex === reels.length - 1 ? 'opacity-30' : 'hover:bg-[#363636]'}`}
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Reels container */}
        <div className="h-full flex items-center justify-center">
          <div className="w-[420px] h-[calc(100vh-40px)] max-h-[800px] rounded-lg overflow-hidden relative">
            <AnimatePresence mode="wait">
              {reels[currentIndex] && (
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -100 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  <ReelCard
                    reel={reels[currentIndex]}
                    isActive={true}
                    onLike={handleLike}
                    onSave={handleSave}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Empty state */}
        {reels.length === 0 && !loading && (
          <div className="h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <p className="text-lg">No reels available</p>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 10s linear infinite;
        }
      `}</style>
    </Layout>
  );
};

export default ReelsPage;
