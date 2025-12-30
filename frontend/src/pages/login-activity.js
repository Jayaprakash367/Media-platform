'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout/Layout';
import toast from 'react-hot-toast';

const LoginActivityPage = () => {
  const router = useRouter();
  const [sessions, setSessions] = useState([
 
  ]);
  const [loginHistory, setLoginHistory] = useState([
    
  ]);

  useEffect(() => {
    const fetchLoginHistory = async () => {
      try {
        const response = await fetch('/api/login-history');
        const data = await response.json();
        setLoginHistory(data);
      } catch (error) {
        console.error('Error fetching login history:', error);
      }
    };

    fetchLoginHistory();
  }, []);



  const handleLogoutSession = (sessionId) => {
    if (sessions.find(s => s.id === sessionId)?.isCurrent) {
      toast.error("Can't log out current session");
      return;
    }
    
    setSessions(sessions.filter(s => s.id !== sessionId));
    toast.success('Session logged out successfully');
  };

  const handleLogoutAll = () => {
    setSessions(sessions.filter(s => s.isCurrent));
    toast.success('All other sessions logged out');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-black">
        <div className="max-w-4xl mx-auto px-5 py-8">
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="text-white mb-4 flex items-center gap-2 hover:text-[#737373]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h1 className="text-white text-3xl font-semibold mb-2">Login Activity</h1>
            <p className="text-[#737373]">Manage your active sessions and login history</p>
          </div>

          {/* Active Sessions */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-xl font-semibold">Active Sessions</h2>
              {sessions.length > 1 && (
                <button
                  onClick={handleLogoutAll}
                  className="text-[#ed4956] font-semibold text-sm hover:text-white"
                >
                  Log out all other sessions
                </button>
              )}
            </div>

            <div className="space-y-4">
              {sessions.map((session) => (
                <div key={session.id} className="bg-[#262626] rounded-xl p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-[#363636] rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {session.device.includes('Phone') ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          )}
                        </svg>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-semibold">{session.device}</h3>
                          {session.isCurrent && (
                            <span className="bg-[#0095f6] text-white text-xs px-2 py-1 rounded">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-[#737373] text-sm mb-1">{session.browser} · {session.location}</p>
                        <p className="text-[#737373] text-sm">IP: {session.ipAddress}</p>
                        <p className="text-[#a8a8a8] text-sm mt-2">
                          {session.isCurrent ? session.lastActive : `Last active ${session.lastActive}`}
                        </p>
                      </div>
                    </div>

                    {!session.isCurrent && (
                      <button
                        onClick={() => handleLogoutSession(session.id)}
                        className="text-[#ed4956] font-semibold text-sm hover:text-white"
                      >
                        Log out
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Login History */}
          <div>
            <h2 className="text-white text-xl font-semibold mb-4">Login History</h2>
            
            <div className="bg-[#262626] rounded-xl divide-y divide-[#363636]">
              {loginHistory.map((login, index) => (
                <div key={index} className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${login.success ? 'bg-green-500 bg-opacity-20' : 'bg-red-500 bg-opacity-20'}`}>
                      {login.success ? (
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                    
                    <div>
                      <p className="text-white font-medium">{login.location}</p>
                      <p className="text-[#737373] text-sm">{login.device} · {login.date} at {login.time}</p>
                    </div>
                  </div>

                  <span className={`text-sm font-medium ${login.success ? 'text-green-500' : 'text-red-500'}`}>
                    {login.success ? 'Success' : 'Failed'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Security Alert */}
          <div className="mt-8 bg-[#262626] rounded-xl p-6 border border-yellow-500 border-opacity-30">
            <div className="flex gap-4">
              <div className="text-yellow-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-2">Secure Your Account</h3>
                <p className="text-[#a8a8a8] text-sm mb-3">
                  If you see any suspicious login activity, change your password immediately and enable two-factor authentication.
                </p>
                <button
                  onClick={() => router.push('/settings')}
                  className="text-[#0095f6] font-semibold text-sm hover:text-white"
                >
                  Go to Security Settings →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LoginActivityPage;
