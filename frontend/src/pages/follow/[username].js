import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

export default function FollowPage() {
  const router = useRouter();
  const { username, tab = 'followers' } = router.query;
  const [activeTab, setActiveTab] = useState(tab);
  const [users, setUsers] = useState([]);
  const [followRequests, setFollowRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (username) {
      loadData();
    }
  }, [username, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'requests') {
        const response = await api.get('/users/follow-requests');
        setFollowRequests(response.data.data.items || response.data.data);
      } else {
        const endpoint = activeTab === 'followers' 
          ? `/users/${username}/followers`
          : `/users/${username}/following`;
        const response = await api.get(endpoint);
        setUsers(response.data.data.items || response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId) => {
    try {
      await api.put(`/users/${userId}/follow`);
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, isFollowing: !u.isFollowing } : u
      ));
      toast.success('Success');
    } catch (error) {
      toast.error('Action failed');
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await api.put(`/users/follow-requests/${requestId}/accept`);
      setFollowRequests(prev => prev.filter(r => r.id !== requestId));
      toast.success('Request accepted');
    } catch (error) {
      toast.error('Failed to accept request');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await api.put(`/users/follow-requests/${requestId}/reject`);
      setFollowRequests(prev => prev.filter(r => r.id !== requestId));
      toast.success('Request rejected');
    } catch (error) {
      toast.error('Failed to reject request');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => { setActiveTab('followers'); router.push(`/follow/${username}?tab=followers`); }}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
              activeTab === 'followers'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Followers
          </button>
          <button
            onClick={() => { setActiveTab('following'); router.push(`/follow/${username}?tab=following`); }}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
              activeTab === 'following'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Following
          </button>
          <button
            onClick={() => { setActiveTab('requests'); router.push(`/follow/${username}?tab=requests`); }}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
              activeTab === 'requests'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Requests
          </button>
        </div>

        {/* Content */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : activeTab === 'requests' ? (
            followRequests.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No pending requests</div>
            ) : (
              followRequests.map((request) => (
                <div key={request.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex items-center space-x-3">
                    <img
                      src={request.sender?.profilePicture || '/default-avatar.png'}
                      alt={request.sender?.username}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {request.sender?.username}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {request.sender?.fullName}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAcceptRequest(request.id)}
                      className="px-4 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request.id)}
                      className="px-4 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))
            )
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No {activeTab} yet
            </div>
          ) : (
            users.map((user) => (
              <div key={user.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex items-center space-x-3 flex-1 cursor-pointer" onClick={() => router.push(`/profile/${user.username}`)}>
                  <img
                    src={user.profilePicture || '/default-avatar.png'}
                    alt={user.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white flex items-center">
                      {user.username}
                      {user.isVerified && (
                        <svg className="w-4 h-4 ml-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                        </svg>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {user.fullName}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleFollow(user.id)}
                  className={`px-6 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    user.isFollowing
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {user.isFollowing ? 'Unfollow' : 'Follow'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
