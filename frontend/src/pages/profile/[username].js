'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/Layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { userAPI, postAPI } from '@/lib/api';
import toast from 'react-hot-toast';

// Icons
const GridIcon = ({ active }) => (
  <svg aria-label="Posts" className={active ? 'text-white' : 'text-[#a8a8a8]'} fill="currentColor" height="12" role="img" viewBox="0 0 24 24" width="12">
    <rect fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" width="18" x="3" y="3"></rect>
    <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="9.015" x2="9.015" y1="3" y2="21"></line>
    <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="14.985" x2="14.985" y1="3" y2="21"></line>
    <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="21" x2="3" y1="9.015" y2="9.015"></line>
    <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="21" x2="3" y1="14.985" y2="14.985"></line>
  </svg>
);

const ReelsIcon = ({ active }) => (
  <svg aria-label="Reels" className={active ? 'text-white' : 'text-[#a8a8a8]'} fill="currentColor" height="12" role="img" viewBox="0 0 24 24" width="12">
    <line fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" x1="2.049" x2="21.95" y1="7.002" y2="7.002"></line>
    <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="13.504" x2="16.362" y1="2.001" y2="7.002"></line>
    <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="7.207" x2="10.002" y1="2.11" y2="7.002"></line>
    <path d="M2 12.001v3.449c0 2.849.698 4.006 1.606 4.945.94.908 2.098 1.607 4.946 1.607h6.896c2.848 0 4.006-.699 4.946-1.607.908-.939 1.606-2.096 1.606-4.945V8.552c0-2.848-.698-4.006-1.606-4.945C19.454 2.699 18.296 2 15.448 2H8.552c-2.848 0-4.006.699-4.946 1.607C2.698 4.546 2 5.704 2 8.552Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
    <path d="M9.763 17.664a.908.908 0 0 1-.454-.787V11.63a.909.909 0 0 1 1.364-.788l4.545 2.624a.909.909 0 0 1 0 1.575l-4.545 2.624a.91.91 0 0 1-.91 0Z" fillRule="evenodd"></path>
  </svg>
);

const TaggedIcon = ({ active }) => (
  <svg aria-label="Tagged" className={active ? 'text-white' : 'text-[#a8a8a8]'} fill="currentColor" height="12" role="img" viewBox="0 0 24 24" width="12">
    <path d="M10.201 3.797 12 1.997l1.799 1.8a1.59 1.59 0 0 0 1.124.465h5.259A1.818 1.818 0 0 1 22 6.08v14.104a1.818 1.818 0 0 1-1.818 1.818H3.818A1.818 1.818 0 0 1 2 20.184V6.08a1.818 1.818 0 0 1 1.818-1.818h5.26a1.59 1.59 0 0 0 1.123-.465Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
    <path d="M18.598 22.002V21.4a3.949 3.949 0 0 0-3.948-3.949H9.495A3.949 3.949 0 0 0 5.546 21.4v.603" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
    <circle cx="12.072" cy="11.075" fill="none" r="3.556" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></circle>
  </svg>
);

const SettingsIcon = () => (
  <svg aria-label="Options" className="text-white" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24">
    <circle cx="12" cy="12" fill="none" r="8.635" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></circle>
    <path d="M14.232 3.656a1.269 1.269 0 0 1-.796-.66L12.93 2h-1.86l-.505.996a1.269 1.269 0 0 1-.796.66m-.001 16.688a1.269 1.269 0 0 1 .796.66l.505.996h1.862l.505-.996a1.269 1.269 0 0 1 .796-.66M3.656 9.768a1.269 1.269 0 0 1-.66.796L2 11.07v1.862l.996.505a1.269 1.269 0 0 1 .66.796m16.688-.001a1.269 1.269 0 0 1 .66-.796L22 12.93v-1.86l-.996-.505a1.269 1.269 0 0 1-.66-.796M7.678 4.522a1.269 1.269 0 0 1-1.03.096l-1.06-.348L4.27 5.587l.348 1.062a1.269 1.269 0 0 1-.096 1.03m11.8 11.799a1.269 1.269 0 0 1 1.03-.096l1.06.348 1.318-1.317-.348-1.062a1.269 1.269 0 0 1 .096-1.03m-14.956.001a1.269 1.269 0 0 1 .096 1.03l-.348 1.06 1.317 1.318 1.062-.348a1.269 1.269 0 0 1 1.03.096m11.799-11.8a1.269 1.269 0 0 1-.096-1.03l.348-1.06-1.317-1.318-1.062.348a1.269 1.269 0 0 1-1.03-.096" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></path>
  </svg>
);

const ProfilePage = () => {
  const router = useRouter();
  const { username } = router.query;
  const { user: currentUser, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [stats, setStats] = useState({ posts: 0, followers: 0, following: 0 });

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    if (username) {
      fetchProfileData();
    }
  }, [username]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile
      const userResponse = await userAPI.getProfile(username);
      if (userResponse.data?.success) {
        const userData = userResponse.data.data.user;
        setProfileUser(userData);
        setIsFollowing(userData.isFollowing || false);
        setStats({
          posts: userData.postsCount || 0,
          followers: userData.followersCount || 0,
          following: userData.followingCount || 0,
        });
      }

      // Fetch user posts
      const postsResponse = await postAPI.getUserPosts(username);
      if (postsResponse.data?.success) {
        setPosts(postsResponse.data.data.posts || []);
        setStats(prev => ({ ...prev, posts: postsResponse.data.data.posts?.length || 0 }));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    try {
      if (isFollowing) {
        await userAPI.unfollowUser(profileUser.id);
        setIsFollowing(false);
        setStats(prev => ({ ...prev, followers: prev.followers - 1 }));
        toast.success('Unfollowed');
      } else {
        await userAPI.followUser(profileUser.id);
        setIsFollowing(true);
        setStats(prev => ({ ...prev, followers: prev.followers + 1 }));
        toast.success('Following');
      }
    } catch (error) {
      toast.error('Action failed');
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString() || '0';
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen bg-black">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white"></div>
        </div>
      </Layout>
    );
  }

  if (!profileUser) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
          <h2 className="text-2xl font-semibold mb-2">User not found</h2>
          <p className="text-[#a8a8a8]">The user you&#39;re looking for doesn&#39;t exist.</p>
          <Link href="/" className="mt-4 text-[#0095f6] hover:text-white">
            Go back home
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-black">
        <div className="max-w-[935px] mx-auto px-5 pt-8">
          {/* Profile Header */}
          <div className="flex gap-8 md:gap-20 mb-11">
            {/* Profile Picture */}
            <div className="flex-shrink-0">
              <div className="w-[150px] h-[150px] rounded-full overflow-hidden border-2 border-[#262626]">
                <img
                  src={profileUser.profilePicture || `https://ui-avatars.com/api/?name=${profileUser.fullName}&background=random&size=300`}
                  alt={profileUser.username}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              {/* Username and Actions */}
              <div className="flex items-center gap-4 mb-5 flex-wrap">
                <h1 className="text-white text-xl">{profileUser.username}</h1>
                
                {isOwnProfile ? (
                  <>
                    <Link
                      href="/settings"
                      className="bg-[#363636] hover:bg-[#262626] text-white text-sm font-semibold px-4 py-[7px] rounded-lg transition-colors"
                    >
                      Edit profile
                    </Link>
                    <Link
                      href="/archive"
                      className="bg-[#363636] hover:bg-[#262626] text-white text-sm font-semibold px-4 py-[7px] rounded-lg transition-colors"
                    >
                      View archive
                    </Link>
                    <button className="p-2 hover:opacity-70 transition-opacity">
                      <SettingsIcon />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleFollow}
                      className={`${
                        isFollowing
                          ? 'bg-[#363636] hover:bg-[#262626] text-white'
                          : 'bg-[#0095f6] hover:bg-[#1877f2] text-white'
                      } text-sm font-semibold px-6 py-[7px] rounded-lg transition-colors`}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                    <Link
                      href={`/messages?user=${profileUser.username}`}
                      className="bg-[#363636] hover:bg-[#262626] text-white text-sm font-semibold px-4 py-[7px] rounded-lg transition-colors"
                    >
                      Message
                    </Link>
                  </>
                )}
              </div>

              {/* Stats */}
              <div className="flex gap-10 mb-5">
                <div className="text-white">
                  <span className="font-semibold">{formatNumber(stats.posts)}</span>{' '}
                  <span className="text-[#a8a8a8]">posts</span>
                </div>
                <button className="text-white hover:opacity-70">
                  <span className="font-semibold">{formatNumber(stats.followers)}</span>{' '}
                  <span className="text-[#a8a8a8]">followers</span>
                </button>
                <button className="text-white hover:opacity-70">
                  <span className="font-semibold">{formatNumber(stats.following)}</span>{' '}
                  <span className="text-[#a8a8a8]">following</span>
                </button>
              </div>

              {/* Bio */}
              <div className="text-white">
                <p className="font-semibold">{profileUser.fullName}</p>
                {profileUser.bio && (
                  <p className="whitespace-pre-wrap mt-1">{profileUser.bio}</p>
                )}
                {profileUser.website && (
                  <a
                    href={profileUser.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#e0f1ff] hover:text-white font-semibold"
                  >
                    {profileUser.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Highlights (placeholder for now) */}
          <div className="flex gap-4 mb-11 overflow-x-auto pb-2">
            {isOwnProfile && (
              <div className="flex flex-col items-center gap-2 flex-shrink-0">
                <div className="w-[77px] h-[77px] rounded-full border border-[#262626] flex items-center justify-center">
                  <svg className="w-11 h-11 text-[#737373]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="text-white text-xs">New</span>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="border-t border-[#262626]">
            <div className="flex justify-center gap-16">
              <button
                onClick={() => setActiveTab('posts')}
                className={`flex items-center gap-2 py-4 border-t ${
                  activeTab === 'posts'
                    ? 'border-white text-white'
                    : 'border-transparent text-[#a8a8a8]'
                } -mt-px transition-colors`}
              >
                <GridIcon active={activeTab === 'posts'} />
                <span className="text-xs font-semibold tracking-wider uppercase">Posts</span>
              </button>
              <button
                onClick={() => setActiveTab('reels')}
                className={`flex items-center gap-2 py-4 border-t ${
                  activeTab === 'reels'
                    ? 'border-white text-white'
                    : 'border-transparent text-[#a8a8a8]'
                } -mt-px transition-colors`}
              >
                <ReelsIcon active={activeTab === 'reels'} />
                <span className="text-xs font-semibold tracking-wider uppercase">Reels</span>
              </button>
              <button
                onClick={() => setActiveTab('tagged')}
                className={`flex items-center gap-2 py-4 border-t ${
                  activeTab === 'tagged'
                    ? 'border-white text-white'
                    : 'border-transparent text-[#a8a8a8]'
                } -mt-px transition-colors`}
              >
                <TaggedIcon active={activeTab === 'tagged'} />
                <span className="text-xs font-semibold tracking-wider uppercase">Tagged</span>
              </button>
            </div>
          </div>

          {/* Posts Grid */}
          <div className="pb-16">
            {posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                {isOwnProfile ? (
                  <>
                    <div className="w-20 h-20 rounded-full border-2 border-white flex items-center justify-center mb-4">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <circle cx="12" cy="13" r="3" />
                      </svg>
                    </div>
                    <h2 className="text-white text-3xl font-bold mb-2">Share Photos</h2>
                    <p className="text-[#a8a8a8] text-sm mb-4">When you share photos, they will appear on your profile.</p>
                    <Link href="/create" className="text-[#0095f6] text-sm font-semibold hover:text-white">
                      Share your first photo
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 rounded-full border-2 border-white flex items-center justify-center mb-4">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <circle cx="12" cy="13" r="3" />
                      </svg>
                    </div>
                    <h2 className="text-white text-3xl font-bold">No Posts Yet</h2>
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1">
                {posts.map((post) => (
                  <Link
                    key={post.id || post._id}
                    href={`/p/${post.id || post._id}`}
                    className="relative aspect-square group"
                  >
                    <img
                      src={post.images?.[0] || post.image}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-8">
                      <div className="flex items-center gap-2 text-white font-bold">
                        <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                        <span>{post.likesCount || post.likes?.length || 0}</span>
                      </div>
                      <div className="flex items-center gap-2 text-white font-bold">
                        <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z"/>
                        </svg>
                        <span>{post.commentsCount || post.comments?.length || 0}</span>
                      </div>
                    </div>
                    {/* Multiple images indicator */}
                    {post.images?.length > 1 && (
                      <div className="absolute top-2 right-2">
                        <svg className="w-5 h-5 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M10 3H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zm10 0h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zM10 13H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1zm10 0h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1z"/>
                        </svg>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
