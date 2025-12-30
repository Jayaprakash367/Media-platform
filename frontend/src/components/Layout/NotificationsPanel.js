'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { authAPI } from '@/lib/api';
import { formatDistanceToNow } from '@/lib/utils';

const NotificationsPanel = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadNotifications = async () => {
      try {
        const response = await authAPI.getNotifications();
        if (!isMounted) return;
        setNotifications(response.data?.data?.notifications || []);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadNotifications();

    return () => {
      isMounted = false;
    };
  }, []);

  // Group notifications by time period
  const groupNotifications = (notifications) => {
    const now = new Date();
    const today = [];
    const thisMonth = [];
    const earlier = [];

    notifications.forEach((notif) => {
      const date = new Date(notif.createdAt);
      const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        today.push(notif);
      } else if (diffDays < 30) {
        thisMonth.push(notif);
      } else {
        earlier.push(notif);
      }
    });

    return { today, thisMonth, earlier };
  };

  const grouped = groupNotifications(notifications);

  const NotificationItem = ({ notification }) => {
    const sender = notification.sender || {};
    
    const getMessage = () => {
      switch (notification.type) {
        case 'follow':
          return 'started following you.';
        case 'like':
          return 'liked your photo.';
        case 'comment':
          return `commented: ${notification.message?.substring(0, 30)}...`;
        case 'mention':
          return 'mentioned you in a comment.';
        default:
          return notification.message;
      }
    };

    return (
      <div className="flex items-center gap-3 py-2 px-4 hover:bg-[#1a1a1a]">
        <Link href={`/profile/${sender.username}`}>
          <img
            src={sender.profilePicture || `https://ui-avatars.com/api/?name=${sender.fullName || 'User'}&background=random`}
            alt={sender.username}
            className="w-11 h-11 rounded-full object-cover"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm">
            <Link href={`/profile/${sender.username}`} className="font-semibold hover:underline">
              {sender.username}
            </Link>
            {' '}{sender.fullName && <span className="text-gray-500">({sender.fullName})</span>} {getMessage()}
            {' '}<span className="text-gray-500">{formatDistanceToNow(notification.createdAt)}</span>
          </p>
        </div>
        {notification.type === 'follow' && (
          <button className="bg-[#0095f6] text-white text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-[#1877f2]">
            Follow Back
          </button>
        )}
        {notification.relatedPost?.mediaUrl && (
          <img
            src={notification.relatedPost.mediaUrl}
            alt=""
            className="w-11 h-11 object-cover"
          />
        )}
      </div>
    );
  };

  const NotificationGroup = ({ title, items }) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-4">
        <h3 className="text-white font-semibold px-4 py-2">{title}</h3>
        {items.map((notif) => (
          <NotificationItem key={notif.id || notif._id} notification={notif} />
        ))}
      </div>
    );
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
          <h2 className="text-2xl font-semibold text-white">Notifications</h2>
        </div>

        <div className="border-b border-[#262626]" />

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-gray-600 border-t-white rounded-full" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 border-2 border-white rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <p className="text-white font-semibold">Activity On Your Posts</p>
              <p className="text-gray-500 text-sm">When someone likes or comments on one of your posts, you&apos;ll see it here.</p>
            </div>
          ) : (
            <div className="py-2">
              <NotificationGroup title="Today" items={grouped.today} />
              <NotificationGroup title="This Month" items={grouped.thisMonth} />
              <NotificationGroup title="Earlier" items={grouped.earlier} />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationsPanel;
