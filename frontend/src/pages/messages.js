'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '@/components/Layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { chatAPI, userAPI } from '@/lib/api';
import { formatDistanceToNow } from '@/lib/utils';
import toast from 'react-hot-toast';

// Icons
const ChevronDownIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const SendIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" transform="rotate(-45 12 12)" />
  </svg>
);

const ImageIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const HeartIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const InfoIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const VideoIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const MessagesPage = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [activeTab, setActiveTab] = useState('messages');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await chatAPI.getChats();
        setChats(response.data?.data?.chats || response.data?.chats || []);
      } catch (error) {
        console.error('Failed to fetch chats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchChats();
    }
  }, [user]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat) return;
      
      try {
        const response = await chatAPI.getMessages(selectedChat._id || selectedChat.id);
        setMessages(response.data?.data?.messages || response.data?.messages || []);
        await chatAPI.markMessagesAsRead(selectedChat._id || selectedChat.id);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      }
    };

    fetchMessages();
  }, [selectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length > 0) {
      try {
        const response = await userAPI.searchUsers(query);
        setSearchResults(response.data?.data?.users || response.data?.users || []);
      } catch (error) {
        console.error('Search failed:', error);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleStartChat = async (userId) => {
    try {
      const response = await chatAPI.getOrCreateChat(userId);
      const chat = response.data?.data?.chat || response.data?.chat;
      setSelectedChat(chat);
      setShowNewChat(false);
      setSearchQuery('');
      
      if (!chats.find(c => (c._id || c.id) === (chat._id || chat.id))) {
        setChats(prev => [chat, ...prev]);
      }
    } catch (error) {
      toast.error('Failed to start chat');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedChat) return;

    try {
      const response = await chatAPI.sendMessage(selectedChat._id || selectedChat.id, {
        text: messageInput,
        type: 'text'
      });
      const newMessage = response.data?.data?.message || response.data?.message;
      setMessages(prev => [...prev, newMessage]);
      setMessageInput('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const getOtherUser = (chat) => {
    const participants = chat.participants || [];
    return participants.find(p => (p._id || p.id) !== (user?._id || user?.id)) || {};
  };

  if (authLoading) {
    return (
      <Layout fullWidth>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout fullWidth>
      <div className="flex h-screen">
        {/* Left Panel - Chat List */}
        <div className="w-[397px] border-r border-[#262626] flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-[#262626]">
            <div className="flex items-center justify-between mb-6">
              <button className="flex items-center space-x-2">
                <span className="text-white font-bold text-xl">{user?.username}</span>
                <ChevronDownIcon />
              </button>
              <button 
                onClick={() => setShowNewChat(true)}
                className="text-white hover:text-gray-400"
              >
                <EditIcon />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center">
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full bg-[#262626] rounded-lg py-2 pl-10 pr-4 text-white text-sm placeholder-gray-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Notes Section */}
          <div className="p-4 border-b border-[#262626]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white font-semibold">Notes</span>
            </div>
            <div className="flex space-x-4 overflow-x-auto pb-2">
              {/* Your Note */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="" className="w-14 h-14 rounded-full object-cover" />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-[#262626] flex items-center justify-center text-white text-xl">
                        {user?.username?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[#262626] px-2 py-0.5 rounded-full border border-[#363636]">
                    <span className="text-xs text-gray-400">Note...</span>
                  </div>
                </div>
                <span className="text-xs text-white mt-3">Your note</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[#262626]">
            <button
              onClick={() => setActiveTab('messages')}
              className={`flex-1 py-3 text-sm font-semibold ${activeTab === 'messages' ? 'text-white border-b border-white' : 'text-gray-400'}`}
            >
              Messages
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 py-3 text-sm font-semibold ${activeTab === 'requests' ? 'text-white border-b border-white' : 'text-gray-400'}`}
            >
              Requests
            </button>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              </div>
            ) : chats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4">
                <p className="text-center">No messages yet</p>
                <p className="text-sm text-center mt-2">Start a conversation!</p>
              </div>
            ) : (
              chats.map((chat) => {
                const otherUser = getOtherUser(chat);
                const isSelected = selectedChat && (selectedChat._id || selectedChat.id) === (chat._id || chat.id);
                
                return (
                  <button
                    key={chat._id || chat.id}
                    onClick={() => setSelectedChat(chat)}
                    className={`w-full p-4 flex items-center space-x-3 hover:bg-[#121212] transition-colors ${isSelected ? 'bg-[#121212]' : ''}`}
                  >
                    <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0">
                      {otherUser.avatar || otherUser.profilePicture ? (
                        <img src={otherUser.avatar || otherUser.profilePicture} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-[#262626] flex items-center justify-center text-white text-xl">
                          {(otherUser.username || 'U')[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-white font-semibold text-sm truncate">{otherUser.username || 'Unknown'}</p>
                      <p className="text-gray-400 text-sm truncate">
                        {chat.lastMessage?.text || 'Start a conversation'} · {chat.lastMessage ? formatDistanceToNow(chat.lastMessage.createdAt) : ''}
                      </p>
                    </div>
                    {chat.unreadCount > 0 && (
                      <div className="w-2 h-2 rounded-full bg-[#0095f6]"></div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel - Chat View */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-[#262626] flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-full overflow-hidden">
                    {getOtherUser(selectedChat).avatar || getOtherUser(selectedChat).profilePicture ? (
                      <img src={getOtherUser(selectedChat).avatar || getOtherUser(selectedChat).profilePicture} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#262626] flex items-center justify-center text-white">
                        {(getOtherUser(selectedChat).username || 'U')[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-white font-semibold">{getOtherUser(selectedChat).username}</p>
                    <p className="text-gray-400 text-xs">Active now</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <button className="text-white hover:text-gray-400">
                    <PhoneIcon />
                  </button>
                  <button className="text-white hover:text-gray-400">
                    <VideoIcon />
                  </button>
                  <button className="text-white hover:text-gray-400">
                    <InfoIcon />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => {
                  const isOwn = (message.sender?._id || message.sender?.id || message.senderId) === (user?._id || user?.id);
                  
                  return (
                    <div
                      key={message._id || message.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isOwn && (
                        <div className="w-6 h-6 rounded-full overflow-hidden mr-2 flex-shrink-0">
                          {getOtherUser(selectedChat).avatar ? (
                            <img src={getOtherUser(selectedChat).avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-[#262626] flex items-center justify-center text-white text-xs">
                              {(getOtherUser(selectedChat).username || 'U')[0].toUpperCase()}
                            </div>
                          )}
                        </div>
                      )}
                      <div
                        className={`max-w-[60%] px-4 py-2 rounded-3xl ${
                          isOwn 
                            ? 'bg-[#3797f0] text-white' 
                            : 'bg-[#262626] text-white'
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-[#262626]">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-4">
                  <div className="flex-1 bg-[#262626] rounded-full px-4 py-2 flex items-center">
                    <button type="button" className="text-white mr-3">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    <input
                      type="text"
                      placeholder="Message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none"
                    />
                    {messageInput.trim() ? (
                      <button type="submit" className="text-[#0095f6] font-semibold text-sm">
                        Send
                      </button>
                    ) : (
                      <>
                        <button type="button" className="text-white mx-2">
                          <ImageIcon />
                        </button>
                        <button type="button" className="text-white">
                          <HeartIcon />
                        </button>
                      </>
                    )}
                  </div>
                </form>
              </div>
            </>
          ) : (
            /* No Chat Selected */
            <div className="flex-1 flex flex-col items-center justify-center text-white">
              <div className="w-24 h-24 rounded-full border-2 border-white flex items-center justify-center mb-4">
                <SendIcon />
              </div>
              <h2 className="text-xl font-semibold mb-2">Your messages</h2>
              <p className="text-gray-400 text-sm mb-4">Send private photos and messages to a friend or group</p>
              <button
                onClick={() => setShowNewChat(true)}
                className="bg-[#0095f6] text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#1877f2]"
              >
                Send message
              </button>
            </div>
          )}
        </div>

        {/* New Chat Modal */}
        <AnimatePresence>
          {showNewChat && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
              onClick={() => setShowNewChat(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#262626] rounded-xl w-[400px] max-h-[500px] overflow-hidden"
              >
                <div className="p-4 border-b border-[#363636] flex items-center justify-between">
                  <button onClick={() => setShowNewChat(false)} className="text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <span className="text-white font-semibold">New message</span>
                  <button className="text-[#0095f6] font-semibold text-sm">Next</button>
                </div>

                <div className="p-4 border-b border-[#363636]">
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-semibold">To:</span>
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="max-h-[300px] overflow-y-auto">
                  {searchResults.length > 0 ? (
                    searchResults.map((searchUser) => (
                      <button
                        key={searchUser._id || searchUser.id}
                        onClick={() => handleStartChat(searchUser._id || searchUser.id)}
                        className="w-full p-4 flex items-center space-x-3 hover:bg-[#363636]"
                      >
                        <div className="w-11 h-11 rounded-full overflow-hidden">
                          {searchUser.avatar || searchUser.profilePicture ? (
                            <img src={searchUser.avatar || searchUser.profilePicture} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-[#363636] flex items-center justify-center text-white">
                              {(searchUser.username || 'U')[0].toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="text-left">
                          <p className="text-white font-semibold text-sm">{searchUser.username}</p>
                          <p className="text-gray-400 text-sm">{searchUser.name || searchUser.fullName}</p>
                        </div>
                      </button>
                    ))
                  ) : searchQuery ? (
                    <div className="p-4 text-gray-400 text-center">No users found</div>
                  ) : (
                    <div className="p-4 text-gray-400 text-center">Search for users</div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default MessagesPage;
