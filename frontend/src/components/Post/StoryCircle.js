'use client';

import React from 'react';
import { motion } from 'framer-motion';

const StoryCircle = ({ user, hasStory, isViewed, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <motion.div
      whileTap={{ scale: 0.95 }}
      className="flex flex-col items-center space-y-1 cursor-pointer flex-shrink-0"
      onClick={handleClick}
    >
      <div className="relative">
        {/* Story ring */}
        <div 
          className={`w-[66px] h-[66px] rounded-full p-[2px] ${
            hasStory && !isViewed
              ? 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600'
              : isViewed
                ? 'bg-gray-600'
                : 'bg-[#262626]'
          }`}
        >
          <div className="bg-black rounded-full p-[2px] w-full h-full">
            {user.profilePicture || user.avatar ? (
              <img
                src={user.profilePicture || user.avatar}
                alt={user.username}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-[#262626] flex items-center justify-center text-white text-lg font-semibold">
                {(user.username || user.fullName || 'U')[0].toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <span className="text-xs text-gray-400 truncate w-[66px] text-center">
        {user.username?.length > 10 ? user.username.slice(0, 10) + '...' : user.username}
      </span>
    </motion.div>
  );
};

export default StoryCircle;