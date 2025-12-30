'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

const MoreMenu = ({ onClose }) => {
  const router = useRouter();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
    onClose();
  };

  const menuItems = [
    {
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" fill="none" r="8.635" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></circle>
          <path d="M14.232 3.656a1.269 1.269 0 0 1-.796-.66L12.93 2h-1.86l-.505.996a1.269 1.269 0 0 1-.796.66m-.001 16.688a1.269 1.269 0 0 1 .796.66l.505.996h1.862l.505-.996a1.269 1.269 0 0 1 .796-.66M3.656 9.768a1.269 1.269 0 0 1-.66.796L2 11.07v1.862l.996.505a1.269 1.269 0 0 1 .66.796m16.688-.001a1.269 1.269 0 0 1 .66-.796L22 12.93v-1.86l-.996-.505a1.269 1.269 0 0 1-.66-.796M7.678 4.522a1.269 1.269 0 0 1-1.03.096l-1.06-.348L4.27 5.587l.348 1.062a1.269 1.269 0 0 1-.096 1.03m11.8 11.799a1.269 1.269 0 0 1 1.03-.096l1.06.348 1.318-1.317-.348-1.062a1.269 1.269 0 0 1 .096-1.03m-14.956.001a1.269 1.269 0 0 1 .096 1.03l-.348 1.06 1.317 1.318 1.062-.348a1.269 1.269 0 0 1 1.03.096m11.799-11.8a1.269 1.269 0 0 1-.096-1.03l.348-1.06-1.317-1.318-1.062.348a1.269 1.269 0 0 1-1.03-.096" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></path>
        </svg>
      ),
      label: 'Settings',
      onClick: () => { router.push('/settings'); onClose(); }
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 1H5a4 4 0 0 0-4 4v14a4 4 0 0 0 4 4h14a4 4 0 0 0 4-4V5a4 4 0 0 0-4-4Zm-3.214 14.956a.996.996 0 0 1-.047 1.41 1.005 1.005 0 0 1-.681.271.998.998 0 0 1-.728-.318l-2.39-2.557-2.39 2.557a.999.999 0 0 1-.681.318.997.997 0 0 1-.681-.271.996.996 0 0 1-.047-1.41l2.37-2.533-2.37-2.533a.997.997 0 0 1 .728-1.681.998.998 0 0 1 .681.271l2.39 2.557 2.39-2.557a.997.997 0 0 1 1.409-.047c.394.368.416.987.047 1.41l-2.37 2.533 2.37 2.533Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></path>
        </svg>
      ),
      label: 'Your activity',
      onClick: () => { router.push('/activity'); onClose(); }
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <polygon fill="none" points="20 21 12 13.44 4 21 4 3 20 3 20 21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polygon>
        </svg>
      ),
      label: 'Saved',
      onClick: () => { router.push('/saved'); onClose(); }
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.00018,4.5a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V3.5A1,1,0,0,0,12.00018,4.5ZM5.28118,6.69l-.35-.35a1,1,0,1,0-1.41,1.42l.35.35a.99676.99676,0,0,0,1.41,0A.99974.99974,0,0,0,5.28118,6.69Zm13.79,1.42.35-.35a1.004,1.004,0,0,0-1.42-1.42l-.35.35a1,1,0,0,0,0,1.42A.99676.99676,0,0,0,19.07118,8.11ZM3.50018,12a1,1,0,0,0-1-1h-.5a1,1,0,0,0,0,2h.5A1,1,0,0,0,3.50018,12Zm17.5-1h-.5a1,1,0,0,0,0,2h.5a1,1,0,0,0,0-2ZM12.00018,6a6,6,0,1,0,6,6A6.00657,6.00657,0,0,0,12.00018,6Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
        </svg>
      ),
      label: 'Switch appearance',
      onClick: toggleTheme,
      extra: theme === 'dark' ? '🌙' : '☀️'
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.001 1h-12a5.006 5.006 0 0 0-5 5v9.005a5.006 5.006 0 0 0 5 5h.586l2.707 2.707a1 1 0 0 0 1.414 0l2.707-2.707h.586a5.006 5.006 0 0 0 5-5V6a5.006 5.006 0 0 0-5-5ZM12.001 14a1.5 1.5 0 1 1 1.5-1.5 1.5 1.5 0 0 1-1.5 1.5Zm1-4.5a1 1 0 0 1-2 0v-3a1 1 0 0 1 2 0Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></path>
        </svg>
      ),
      label: 'Report a problem',
      onClick: () => { router.push('/report-problem'); onClose(); }
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute bottom-full left-0 mb-2 w-[266px] bg-[#262626] rounded-2xl overflow-hidden shadow-xl"
    >
      <div className="py-2">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#3c3c3c] transition-colors text-white text-sm"
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <span>{item.label}</span>
            </div>
            {item.extra && <span>{item.extra}</span>}
          </button>
        ))}
      </div>

      <div className="border-t border-[#363636]" />

      <button
        onClick={() => { router.push('/switch-accounts'); onClose(); }}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#3c3c3c] transition-colors text-white text-sm"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9.032 21H2.998A1 1 0 0 1 2 20V4a1 1 0 0 1 .998-1h6.034A1 1 0 0 1 10 4v16a1 1 0 0 1-.968 1ZM14 16.998v3.004A1 1 0 0 0 15 21h6.002A.999.999 0 0 0 22 20V4a1 1 0 0 0-.998-1H15a1 1 0 0 0-1 1v3.002Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></path>
        </svg>
        <span>Switch accounts</span>
      </button>

      <div className="border-t border-[#363636]" />

      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#3c3c3c] transition-colors text-white text-sm"
      >
        Log out
      </button>
    </motion.div>
  );
};

export default MoreMenu;
