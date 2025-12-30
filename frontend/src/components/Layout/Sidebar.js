'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { chatAPI } from '@/lib/api';
import SearchPanel from './SearchPanel';
import NotificationsPanel from './NotificationsPanel';
import CreateModal from './CreateModal';
import MoreMenu from './MoreMenu';

// Instagram Icons as SVG components
const InstagramLogo = () => (
  <svg aria-label="Instagram" className="text-white" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24">
    <path d="M12 2.982c2.937 0 3.285.011 4.445.064a6.087 6.087 0 0 1 2.042.379 3.408 3.408 0 0 1 1.265.823 3.408 3.408 0 0 1 .823 1.265 6.087 6.087 0 0 1 .379 2.042c.053 1.16.064 1.508.064 4.445s-.011 3.285-.064 4.445a6.087 6.087 0 0 1-.379 2.042 3.643 3.643 0 0 1-2.088 2.088 6.087 6.087 0 0 1-2.042.379c-1.16.053-1.508.064-4.445.064s-3.285-.011-4.445-.064a6.087 6.087 0 0 1-2.043-.379 3.408 3.408 0 0 1-1.264-.823 3.408 3.408 0 0 1-.823-1.265 6.087 6.087 0 0 1-.379-2.042c-.053-1.16-.064-1.508-.064-4.445s.011-3.285.064-4.445a6.087 6.087 0 0 1 .379-2.042 3.408 3.408 0 0 1 .823-1.265 3.408 3.408 0 0 1 1.265-.823 6.087 6.087 0 0 1 2.042-.379c1.16-.053 1.508-.064 4.445-.064M12 1c-2.987 0-3.362.013-4.535.066a8.074 8.074 0 0 0-2.67.511 5.392 5.392 0 0 0-1.949 1.27 5.392 5.392 0 0 0-1.269 1.948 8.074 8.074 0 0 0-.51 2.67C1.012 8.638 1 9.013 1 12s.013 3.362.066 4.535a8.074 8.074 0 0 0 .511 2.67 5.392 5.392 0 0 0 1.27 1.949 5.392 5.392 0 0 0 1.948 1.269 8.074 8.074 0 0 0 2.67.51C8.638 22.988 9.013 23 12 23s3.362-.013 4.535-.066a8.074 8.074 0 0 0 2.67-.511 5.625 5.625 0 0 0 3.218-3.218 8.074 8.074 0 0 0 .51-2.67C22.988 15.362 23 14.987 23 12s-.013-3.362-.066-4.535a8.074 8.074 0 0 0-.511-2.67 5.392 5.392 0 0 0-1.27-1.949 5.392 5.392 0 0 0-1.948-1.269 8.074 8.074 0 0 0-2.67-.51C15.362 1.012 14.987 1 12 1Zm0 5.351A5.649 5.649 0 1 0 17.649 12 5.649 5.649 0 0 0 12 6.351Zm0 9.316A3.667 3.667 0 1 1 15.667 12 3.667 3.667 0 0 1 12 15.667Zm5.872-10.859a1.32 1.32 0 1 0 1.32 1.32 1.32 1.32 0 0 0-1.32-1.32Z"></path>
  </svg>
);

const HomeIcon = ({ active }) => active ? (
  <svg aria-label="Home" className="text-white" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24">
    <path d="M22 23h-6.001a1 1 0 0 1-1-1v-5.455a2.997 2.997 0 1 0-5.993 0V22a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V11.543a1.002 1.002 0 0 1 .31-.724l10-9.543a1.001 1.001 0 0 1 1.38 0l10 9.543a1.002 1.002 0 0 1 .31.724V22a1 1 0 0 1-1 1Z"></path>
  </svg>
) : (
  <svg aria-label="Home" className="text-white" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24">
    <path d="M9.005 16.545a2.997 2.997 0 0 1 2.997-2.997A2.997 2.997 0 0 1 15 16.545V22h7V11.543L12 2 2 11.543V22h7.005Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></path>
  </svg>
);

const SearchIcon = () => (
  <svg aria-label="Search" className="text-white" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24">
    <path d="M19 10.5A8.5 8.5 0 1 1 10.5 2a8.5 8.5 0 0 1 8.5 8.5Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
    <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="16.511" x2="22" y1="16.511" y2="22"></line>
  </svg>
);

const ExploreIcon = ({ active }) => active ? (
  <svg aria-label="Explore" className="text-white" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24">
    <path d="m13.173 13.164 1.491-3.829-3.83 1.49ZM12.001.5a11.5 11.5 0 1 0 11.5 11.5A11.513 11.513 0 0 0 12.001.5Zm5.35 7.443-2.478 6.369a1 1 0 0 1-.57.569l-6.36 2.47a1 1 0 0 1-1.294-1.294l2.48-6.369a1 1 0 0 1 .57-.569l6.359-2.47a1 1 0 0 1 1.294 1.294Z"></path>
  </svg>
) : (
  <svg aria-label="Explore" className="text-white" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24">
    <polygon fill="none" points="13.941 13.953 7.581 16.424 10.06 10.056 16.42 7.585 13.941 13.953" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polygon>
    <polygon fillRule="evenodd" points="10.06 10.056 13.949 13.945 7.581 16.424 10.06 10.056"></polygon>
    <circle cx="12.001" cy="12.005" fill="none" r="10.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></circle>
  </svg>
);

const ReelsIcon = ({ active }) => active ? (
  <svg aria-label="Reels" className="text-white" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24">
    <path d="m12.823 1 2.974 5.002h-5.58l-2.65-4.971c.206-.013.419-.022.642-.027L8.55 1Zm2.327 0h.298c3.06 0 4.468.754 5.64 1.887a6.007 6.007 0 0 1 1.596 2.996l.016.067h-7.26L12.823 1Zm-9.667.377L7.95 6.002H1.244a6.01 6.01 0 0 1 3.942-4.53Zm9.735 12.834-4.545-2.624a.909.909 0 0 0-1.356.668l-.008.12v5.248a.91.91 0 0 0 1.255.84l.109-.053 4.545-2.624a.909.909 0 0 0 .1-1.507l-.1-.068-4.545-2.624Zm-14.2-6.209h21.964v12.017a5.98 5.98 0 0 1-5.98 5.981H6.999a5.98 5.98 0 0 1-5.98-5.981V8.002Z"></path>
  </svg>
) : (
  <svg aria-label="Reels" className="text-white" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24">
    <line fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" x1="2.049" x2="21.95" y1="7.002" y2="7.002"></line>
    <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="13.504" x2="16.362" y1="2.001" y2="7.002"></line>
    <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="7.207" x2="10.002" y1="2.11" y2="7.002"></line>
    <path d="M2 12.001v3.449c0 2.849.698 4.006 1.606 4.945.94.908 2.098 1.607 4.946 1.607h6.896c2.848 0 4.006-.699 4.946-1.607.908-.939 1.606-2.096 1.606-4.945V8.552c0-2.848-.698-4.006-1.606-4.945C19.454 2.699 18.296 2 15.448 2H8.552c-2.848 0-4.006.699-4.946 1.607C2.698 4.546 2 5.704 2 8.552Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
    <path d="M9.763 17.664a.908.908 0 0 1-.454-.787V11.63a.909.909 0 0 1 1.364-.788l4.545 2.624a.909.909 0 0 1 0 1.575l-4.545 2.624a.91.91 0 0 1-.91 0Z" fillRule="evenodd"></path>
  </svg>
);

const MessagesIcon = ({ active }) => active ? (
  <svg aria-label="Messenger" className="text-white" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24">
    <path d="M12.003 1.131a10.487 10.487 0 0 0-10.87 10.57 10.194 10.194 0 0 0 3.412 7.771l.054 1.78a1.67 1.67 0 0 0 2.342 1.476l1.935-.872a11.767 11.767 0 0 0 3.127.416 10.488 10.488 0 0 0 10.87-10.57 10.487 10.487 0 0 0-10.87-10.57Zm5.786 9.001-2.566 3.983a1.577 1.577 0 0 1-2.278.42l-2.452-1.84a.63.63 0 0 0-.759.002l-2.556 2.049a.63.63 0 0 1-.913-.18L3.7 10.583a.63.63 0 0 1 .836-.857l2.783 1.586a.63.63 0 0 0 .758-.002l2.094-1.58a1.576 1.576 0 0 1 2.277.418l1.256 1.893a.63.63 0 0 0 1.085-.085Z"></path>
  </svg>
) : (
  <svg aria-label="Messenger" className="text-white" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24">
    <path d="M12.003 2.001a9.705 9.705 0 1 1 0 19.4 10.876 10.876 0 0 1-2.895-.384.798.798 0 0 0-.533.04l-1.984.876a.801.801 0 0 1-1.123-.708l-.054-1.78a.806.806 0 0 0-.27-.569 9.49 9.49 0 0 1-3.14-7.175 9.65 9.65 0 0 1 10-9.7Z" fill="none" stroke="currentColor" strokeMiterlimit="10" strokeWidth="1.739"></path>
    <path d="M17.79 10.132a.659.659 0 0 0-.962-.873l-2.556 2.05a.63.63 0 0 1-.758.002L11.06 9.47a1.576 1.576 0 0 0-2.277.42l-2.567 3.98a.659.659 0 0 0 .961.875l2.556-2.049a.63.63 0 0 1 .759-.002l2.452 1.84a1.576 1.576 0 0 0 2.278-.42Z" fillRule="evenodd"></path>
  </svg>
);

const NotificationsIcon = ({ active }) => active ? (
  <svg aria-label="Notifications" className="text-white" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24">
    <path d="M17.075 1.987a5.852 5.852 0 0 0-5.07 2.9l-.01.019-.01-.02a5.852 5.852 0 0 0-5.07-2.9 6.142 6.142 0 0 0-5.87 6.386c0 4.153 3.882 8.212 9.28 12.39l.17.126a2.5 2.5 0 0 0 3.01 0l.17-.126c5.398-4.178 9.28-8.237 9.28-12.39a6.142 6.142 0 0 0-5.88-6.385Z"></path>
  </svg>
) : (
  <svg aria-label="Notifications" className="text-white" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24">
    <path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 6.042-5.006 8.334-1.15 1.116-2.349 2.115-3.34 2.895a22.114 22.114 0 0 1-1.15.865 22.114 22.114 0 0 1-1.15-.865c-.99-.78-2.189-1.779-3.34-2.895-2.354-2.292-5.006-5.262-5.006-8.334A4.989 4.989 0 0 1 7.208 3.904a5.055 5.055 0 0 1 4.13 2.382l.666 1.045.666-1.045a5.055 5.055 0 0 1 4.122-2.382Z" fill="none" stroke="currentColor" strokeWidth="2"></path>
  </svg>
);

const CreateIcon = () => (
  <svg aria-label="New post" className="text-white" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24">
    <path d="M2 12v3.45c0 2.849.698 4.005 1.606 4.944.94.909 2.098 1.608 4.946 1.608h6.896c2.848 0 4.006-.7 4.946-1.608C21.302 19.455 22 18.3 22 15.45V8.552c0-2.849-.698-4.006-1.606-4.945C19.454 2.7 18.296 2 15.448 2H8.552c-2.848 0-4.006.699-4.946 1.607C2.698 4.547 2 5.703 2 8.552Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
    <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="6.545" x2="17.455" y1="12.001" y2="12.001"></line>
    <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="12.003" x2="12.003" y1="6.545" y2="17.455"></line>
  </svg>
);

const MoreIcon = () => (
  <svg aria-label="Settings" className="text-white" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24">
    <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="3" x2="21" y1="4" y2="4"></line>
    <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="3" x2="21" y1="12" y2="12"></line>
    <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="3" x2="21" y1="20" y2="20"></line>
  </svg>
);

const ThreadsIcon = () => (
  <svg aria-label="Threads" className="text-white" fill="currentColor" height="24" role="img" viewBox="0 0 192 192" width="24">
    <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 125.084 64.8569 132.827 72.0132 138.001C78.0194 142.323 85.7525 144.522 93.8498 144.099C104.645 143.545 113.139 139.403 119.083 131.788C123.469 126.257 126.414 119.122 128.003 110.326C132.252 112.706 135.65 115.718 138.135 119.348C142.84 126.102 144.576 135.359 141.945 145.669C138.818 157.837 130.203 167.416 118.025 172.469C107.048 177.014 94.2234 177.723 82.227 176.555C68.4512 175.214 55.8203 170.074 45.4193 161.525C34.1232 152.252 26.1868 139.558 21.9258 124.112C17.8509 109.339 17.7045 93.1498 21.4979 78.116C26.4101 58.8632 37.2954 42.6571 53.8144 30.8356C67.9619 20.8068 84.4925 15.2735 101.766 14.9772C119.345 14.6774 136.219 19.6341 150.15 29.4605C163.294 38.7325 173.321 51.9154 179.354 67.9608L196 60.9537C188.756 42.1614 176.631 26.6309 160.789 15.4956C143.837 3.5825 123.711 -2.3887 102.102 2.14214e-05C81.4219 0.374008 61.5582 7.08658 45.0116 18.4673C25.8198 32.0148 12.6899 51.3906 6.56764 74.3819C2.09609 92.1304 2.27254 111.337 7.22799 129.193C12.4529 148.024 22.0737 163.809 35.4656 175.334C49.7759 187.647 67.012 194.366 85.0574 196.08C98.1967 197.326 112.022 196.309 125.107 191.124C141.522 184.731 154.028 172.084 158.576 155.516C162.308 142.051 161.123 128.133 154.066 117.017C148.95 108.857 141.154 102.678 130.727 98.6459C130.727 98.6459 130.727 98.6459 130.727 98.6459C131.508 93.5561 131.834 88.6762 131.685 83.9913C146.395 84.8713 158.219 89.5156 166.131 97.5584C172.674 104.214 176.335 112.956 176.335 122.545C176.335 132.135 172.674 140.876 166.131 147.533C156.673 157.147 142.125 162.581 124.674 162.581C107.223 162.581 92.6751 157.147 83.2168 147.533C74.6666 138.841 70.0718 126.968 70.0718 112.545C70.0718 98.1224 74.6666 86.2492 83.2168 77.5575C92.6751 67.9435 107.223 62.5093 124.674 62.5093C126.009 62.5093 127.327 62.5398 128.629 62.6003L128.629 79.4698C127.339 79.3964 126.018 79.3588 124.674 79.3588C112.183 79.3588 102.112 82.9456 95.1SEfgb 89.9773C89.1619 96.0149 85.9213 104.041 85.9213 112.545C85.9213 121.048 89.1619 129.075 95.1459 135.112C102.112 142.144 112.183 145.731 124.674 145.731C137.165 145.731 147.236 142.144 154.202 135.112C160.187 129.075 163.427 121.048 163.427 112.545C163.427 104.041 160.187 96.0149 154.202 89.9773C148.183 83.9058 139.713 79.9328 129.361 78.6011L141.537 88.9883Z"></path>
  </svg>
);

const Sidebar = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread message count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!user) return;
      try {
        const response = await chatAPI.getUnreadCount();
        if (response.data?.success) {
          setUnreadCount(response.data.data.unreadCount);
        }
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnreadCount();
    // Poll for new messages every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const isActive = (path) => router.pathname === path;
  const isCollapsed = showSearch || showNotifications;

  const handleNavClick = (item) => {
    if (item === 'search') {
      setShowSearch(!showSearch);
      setShowNotifications(false);
    } else if (item === 'notifications') {
      setShowNotifications(!showNotifications);
      setShowSearch(false);
    } else if (item === 'create') {
      setShowCreate(true);
      setShowSearch(false);
      setShowNotifications(false);
    } else {
      setShowSearch(false);
      setShowNotifications(false);
    }
  };

  const navItems = [
    { id: 'home', label: 'Home', href: '/', Icon: HomeIcon },
    { id: 'search', label: 'Search', Icon: SearchIcon, onClick: () => handleNavClick('search') },
    { id: 'explore', label: 'Explore', href: '/explore', Icon: ExploreIcon },
    { id: 'reels', label: 'Reels', href: '/reels', Icon: ReelsIcon },
    { id: 'messages', label: 'Messages', href: '/messages', Icon: MessagesIcon, badge: unreadCount > 0 ? unreadCount : null },
    { id: 'notifications', label: 'Notifications', Icon: NotificationsIcon, onClick: () => handleNavClick('notifications') },
    { id: 'create', label: 'Create', Icon: CreateIcon, onClick: () => handleNavClick('create') },
    { id: 'profile', label: 'Profile', href: `/profile/${user?.username}`, isProfile: true },
  ];

  return (
    <>
      <aside className={`fixed left-0 top-0 h-full bg-black border-r border-[#262626] z-50 transition-all duration-300 ${isCollapsed ? 'w-[72px]' : 'w-[220px] xl:w-[244px]'}`}>
        <div className="flex flex-col h-full px-3 pt-2 pb-5">
          {/* Logo */}
          <Link href="/" className="px-3 pt-6 pb-4 mb-2 block">
            {isCollapsed ? (
              <InstagramLogo />
            ) : (
              <span className="text-white text-2xl font-instagram tracking-tight">Instagram</span>
            )}
          </Link>

          {/* Navigation */}
          <nav className="flex-1">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const active = item.href && (item.href === '/' ? router.pathname === '/' : router.pathname.startsWith(item.href));

                const content = (
                  <div className={`flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-[#1a1a1a] transition-all group cursor-pointer ${active ? 'font-bold' : ''}`}>
                    {item.isProfile ? (
                      <div className={`w-6 h-6 rounded-full overflow-hidden ${active ? 'ring-2 ring-white' : ''}`}>
                        <img
                          src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.fullName || 'User'}&background=random`}
                          alt={user?.username}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="relative">
                        <item.Icon active={active} />
                        {item.badge && (
                          <span className="absolute -top-1.5 -right-1.5 bg-[#ff3040] text-white text-[11px] font-semibold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                    {!isCollapsed && (
                      <span className={`text-white text-[15px] ${active ? 'font-bold' : 'font-normal'}`}>
                        {item.label}
                      </span>
                    )}
                  </div>
                );

                if (item.onClick) {
                  return (
                    <li key={item.id}>
                      <button onClick={item.onClick} className="w-full text-left">
                        {content}
                      </button>
                    </li>
                  );
                }

                return (
                  <li key={item.id}>
                    <Link href={item.href} onClick={() => handleNavClick(item.id)}>
                      {content}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Bottom Section */}
          <div className="space-y-1">
            {/* Threads */}
            <Link href="https://threads.net" target="_blank" className="block">
              <div className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-[#1a1a1a] transition-all cursor-pointer">
                <ThreadsIcon />
                {!isCollapsed && <span className="text-white text-[15px]">Threads</span>}
              </div>
            </Link>

            {/* More Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMore(!showMore)}
                className="w-full flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-[#1a1a1a] transition-all"
              >
                <MoreIcon />
                {!isCollapsed && <span className="text-white text-[15px]">More</span>}
              </button>
              <AnimatePresence>
                {showMore && <MoreMenu onClose={() => setShowMore(false)} />}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </aside>

      {/* Search Panel */}
      <AnimatePresence>
        {showSearch && <SearchPanel onClose={() => setShowSearch(false)} />}
      </AnimatePresence>

      {/* Notifications Panel */}
      <AnimatePresence>
        {showNotifications && <NotificationsPanel onClose={() => setShowNotifications(false)} />}
      </AnimatePresence>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && <CreateModal onClose={() => setShowCreate(false)} />}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
