'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { postAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from '@/lib/utils';

// Custom Instagram-style icons
const HeartIcon = ({ filled }) => (
  <svg className={`w-6 h-6 ${filled ? 'text-red-500 fill-current' : ''}`} fill={filled ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={filled ? 0 : 2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const CommentIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const ShareIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" transform="rotate(-45 12 12)" />
  </svg>
);

const BookmarkIcon = ({ filled }) => (
  <svg className="w-6 h-6" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
);

const MoreIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="6" cy="12" r="1.5" />
    <circle cx="18" cy="12" r="1.5" />
  </svg>
);

const PostCard = ({ post, onUpdate }) => {
  const postUser = post.user || post.userId || {};
  const postId = post._id || post.id;
  
  const [isLiked, setIsLiked] = useState(post.isLikedByUser || false);
  const [isSaved, setIsSaved] = useState(post.isSavedByUser || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [comment, setComment] = useState('');
  const [showMore, setShowMore] = useState(false);

  const handleLike = async (e) => {
    e?.preventDefault();
    if (isLiking) return;

    setIsLiking(true);
    try {
      const response = await postAPI.toggleLike(postId);
      const data = response.data?.data || response.data;
      const newIsLiked = data.isLiked ?? !isLiked;
      const newLikesCount = data.likesCount ?? (newIsLiked ? likesCount + 1 : likesCount - 1);
      
      setIsLiked(newIsLiked);
      setLikesCount(newLikesCount);
      
      if (onUpdate) {
        onUpdate({ ...post, isLikedByUser: newIsLiked, likesCount: newLikesCount });
      }
    } catch (error) {
      toast.error('Failed to like post');
    }
    setIsLiking(false);
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    try {
      const response = await postAPI.toggleSave(postId);
      const data = response.data?.data || response.data;
      const newIsSaved = data.isSaved ?? !isSaved;
      
      setIsSaved(newIsSaved);
      
      if (onUpdate) {
        onUpdate({ ...post, isSavedByUser: newIsSaved });
      }
    } catch (error) {
      toast.error('Failed to save post');
    }
    setIsSaving(false);
  };

  const handleDoubleClick = async () => {
    if (!isLiked) {
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 1000);
      await handleLike();
    } else {
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 1000);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    try {
      await postAPI.addComment(postId, comment);
      setComment('');
      toast.success('Comment added');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  return (
    <div className="bg-black border-b border-[#262626] mb-3">
      {/* Post Header */}
      <div className="flex items-center justify-between px-3 py-2">
        <Link href={`/profile/${postUser.username || 'unknown'}`}>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
              <div className="bg-black rounded-full p-[1px]">
                {postUser.profilePicture || postUser.avatar ? (
                  <img
                    src={postUser.profilePicture || postUser.avatar}
                    alt={postUser.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-[#262626] flex items-center justify-center text-white text-xs">
                    {(postUser.username || 'U')[0].toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <span className="font-semibold text-white text-sm">
                {postUser.username || 'Unknown'}
              </span>
              {post.location && (
                <>
                  <span className="text-gray-400 text-sm">•</span>
                  <span className="text-sm text-gray-400">{post.location}</span>
                </>
              )}
            </div>
          </div>
        </Link>
        <button className="text-white hover:text-gray-400 transition-colors">
          <MoreIcon />
        </button>
      </div>

      {/* Post Media */}
      <div className="relative" onDoubleClick={handleDoubleClick}>
        {post.mediaType === 'video' ? (
          <video
            src={post.mediaUrl}
            controls
            className="w-full aspect-square object-cover"
          />
        ) : (
          <img
            src={post.mediaUrl}
            alt={post.caption}
            className="w-full aspect-square object-cover"
          />
        )}
        
        {/* Double-tap heart animation */}
        <AnimatePresence>
          {showHeart && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <svg className="w-24 h-24 text-white drop-shadow-2xl" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Post Actions */}
      <div className="px-3 pt-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              disabled={isLiking}
              className="text-white hover:text-gray-400 transition-colors"
            >
              <HeartIcon filled={isLiked} />
            </motion.button>

            <Link href={`/post/${postId}`}>
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="text-white hover:text-gray-400 transition-colors"
              >
                <CommentIcon />
              </motion.button>
            </Link>

            <motion.button
              whileTap={{ scale: 0.9 }}
              className="text-white hover:text-gray-400 transition-colors"
            >
              <ShareIcon />
            </motion.button>
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleSave}
            disabled={isSaving}
            className="text-white hover:text-gray-400 transition-colors"
          >
            <BookmarkIcon filled={isSaved} />
          </motion.button>
        </div>

        {/* Likes Count */}
        <div className="mb-1">
          <p className="font-semibold text-white text-sm">
            {likesCount.toLocaleString()} {likesCount === 1 ? 'like' : 'likes'}
          </p>
        </div>

        {/* Caption */}
        {post.caption && (
          <div className="mb-1">
            <p className="text-white text-sm">
              <Link href={`/profile/${postUser.username || 'unknown'}`}>
                <span className="font-semibold mr-1">{postUser.username || 'Unknown'}</span>
              </Link>
              {post.caption.length > 100 && !showMore ? (
                <>
                  {post.caption.slice(0, 100)}...
                  <button 
                    onClick={() => setShowMore(true)}
                    className="text-gray-400 ml-1"
                  >
                    more
                  </button>
                </>
              ) : (
                post.caption
              )}
            </p>
          </div>
        )}

        {/* Comments Link */}
        {(post.commentsCount > 0 || (post.comments && post.comments.length > 0)) && (
          <Link href={`/post/${postId}`}>
            <p className="text-gray-400 text-sm mb-1">
              View all {post.commentsCount || post.comments?.length} comments
            </p>
          </Link>
        )}

        {/* Timestamp */}
        <p className="text-gray-500 text-[10px] uppercase mb-2">
          {formatDistanceToNow(post.createdAt)}
        </p>
      </div>

      {/* Add Comment */}
      <div className="px-3 py-2 border-t border-[#262626]">
        <form onSubmit={handleComment} className="flex items-center space-x-3">
          <button type="button" className="text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <input
            type="text"
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="flex-1 bg-transparent text-white text-sm placeholder-gray-500 outline-none"
          />
          {comment.trim() && (
            <button type="submit" className="text-[#0095f6] font-semibold text-sm hover:text-white">
              Post
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default PostCard;