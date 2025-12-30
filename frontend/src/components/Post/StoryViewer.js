'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const StoryViewer = ({ stories, currentStoryIndex, currentStoryUserIndex, onClose, onView }) => {
  const [currentStoryIdx, setCurrentStoryIdx] = useState(currentStoryIndex);
  const [currentUserIdx, setCurrentUserIdx] = useState(currentStoryUserIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const currentStories = stories[currentUserIdx]?.stories || [];
  const currentStory = currentStories[currentStoryIdx];
  const storyDuration = 5000; // 5 seconds per story
  const progressInterval = 100; // Update progress every 100ms

  // Auto-advance story
  useEffect(() => {
    if (!currentStory || isPaused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextStory();
          return 0;
        }
        return prev + (progressInterval / storyDuration) * 100;
      });
    }, progressInterval);

    return () => clearInterval(interval);
  }, [currentStory, isPaused, currentStoryIdx]);

  const nextStory = useCallback(() => {
    if (currentStoryIdx < currentStories.length - 1) {
      setCurrentStoryIdx(currentStoryIdx + 1);
      setProgress(0);
      onView?.(currentStories[currentStoryIdx + 1]);
    } else if (currentUserIdx < stories.length - 1) {
      setCurrentUserIdx(currentUserIdx + 1);
      setCurrentStoryIdx(0);
      setProgress(0);
      onView?.(stories[currentUserIdx + 1]?.stories?.[0]);
    } else {
      onClose();
    }
  }, [currentStoryIdx, currentStories, currentUserIdx, stories, onView, onClose]);

  const previousStory = useCallback(() => {
    if (currentStoryIdx > 0) {
      setCurrentStoryIdx(currentStoryIdx - 1);
      setProgress(0);
      onView?.(currentStories[currentStoryIdx - 1]);
    } else if (currentUserIdx > 0) {
      setCurrentUserIdx(currentUserIdx - 1);
      const prevStories = stories[currentUserIdx - 1]?.stories || [];
      setCurrentStoryIdx(prevStories.length - 1);
      setProgress(0);
      onView?.(prevStories[prevStories.length - 1]);
    }
  }, [currentStoryIdx, currentStories, currentUserIdx, stories, onView, onClose]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'ArrowRight') nextStory();
    if (e.key === 'ArrowLeft') previousStory();
    if (e.key === 'Escape') onClose();
  }, [nextStory, previousStory, onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  if (!currentStory) return null;

  const currentUser = stories[currentUserIdx]?.user;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black z-50 flex items-center justify-center"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Progress Bars */}
        <div className="absolute top-4 left-4 right-4 flex space-x-1 z-10">
          {currentStories.map((_, index) => (
            <div key={index} className="flex-1 bg-gray-700 rounded-full h-1">
              <motion.div
                className="bg-white h-full rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: index === currentStoryIdx ? `${progress}%` : index < currentStoryIdx ? '100%' : '0%' }}
                transition={{ duration: 0.1 }}
              />
            </div>
          ))}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white z-10 p-2 rounded-full hover:bg-gray-800 transition-colors"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        {/* User Info */}
        <div className="absolute top-4 left-4 text-white z-10 flex items-center space-x-3">
          <img
            src={currentUser?.profilePicture || `https://ui-avatars.com/api/?name=${currentUser?.fullName}`}
            alt={currentUser?.username}
            className="w-10 h-10 rounded-full object-cover border-2 border-white"
          />
          <div>
            <p className="font-semibold">{currentUser?.username}</p>
            <p className="text-sm opacity-75">{new Date(currentStory.createdAt).toLocaleTimeString()}</p>
          </div>
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={previousStory}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-2 rounded-full hover:bg-gray-800 transition-colors z-10"
        >
          <ChevronLeftIcon className="w-8 h-8" />
        </button>

        <button
          onClick={nextStory}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-2 rounded-full hover:bg-gray-800 transition-colors z-10"
        >
          <ChevronRightIcon className="w-8 h-8" />
        </button>

        {/* Story Content */}
        <div className="w-full h-full flex items-center justify-center">
          {currentStory.mediaType === 'image' ? (
            <img
              src={currentStory.mediaUrl}
              alt="Story"
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <video
              src={currentStory.mediaUrl}
              autoPlay
              className="max-w-full max-h-full object-contain"
            />
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default StoryViewer;