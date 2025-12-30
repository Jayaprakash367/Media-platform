'use client';

import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children, fullWidth = false, hideRightSidebar = false }) => {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex">
        {/* Left Sidebar - Fixed */}
        <Sidebar />
        
        {/* Main Content Area */}
        <main className={`flex-1 ml-[72px] xl:ml-[244px] min-h-screen transition-all duration-300 ${fullWidth ? '' : 'max-w-[935px] mx-auto'}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;