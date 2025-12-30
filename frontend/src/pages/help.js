'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout/Layout';

const HelpPage = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const helpCategories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: '🚀',
      topics: [
        'How to create an account',
        'How to set up your profile',
        'Understanding the Instagram interface',
        'How to connect with friends'
      ]
    },
    {
      id: 'posts-stories',
      title: 'Posts & Stories',
      icon: '📸',
      topics: [
        'How to create a post',
        'How to add a story',
        'Editing photos and videos',
        'Using filters and effects',
        'Tagging people in posts'
      ]
    },
    {
      id: 'privacy-safety',
      title: 'Privacy & Safety',
      icon: '🔒',
      topics: [
        'Making your account private',
        'Blocking and reporting accounts',
        'Managing your privacy settings',
        'Two-factor authentication',
        'Data download and account deletion'
      ]
    },
    {
      id: 'messaging',
      title: 'Messaging',
      icon: '💬',
      topics: [
        'Sending direct messages',
        'Creating group chats',
        'Unsending messages',
        'Managing message requests',
        'Video calling'
      ]
    },
    {
      id: 'account-settings',
      title: 'Account Settings',
      icon: '⚙️',
      topics: [
        'Changing your password',
        'Updating email or phone',
        'Managing notifications',
        'Switching to professional account',
        'Deactivating your account'
      ]
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: '🔧',
      topics: [
        'Can\'t log in to my account',
        'App is crashing or freezing',
        'Posts not uploading',
        'Notifications not working',
        'Account hacked or compromised'
      ]
    }
  ];

  const popularQuestions = [
    'How do I delete my Instagram account?',
    'How do I report a problem?',
    'How do I change my username?',
    'How do I make my account private?',
    'How do I unblock someone?',
    'How do I download my data?'
  ];

  const filteredCategories = searchQuery
    ? helpCategories.filter(cat =>
        cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : helpCategories;

  return (
    <Layout>
      <div className="min-h-screen bg-black">
        <div className="max-w-4xl mx-auto px-5 py-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="text-white mb-4 flex items-center gap-2 hover:text-[#737373]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h1 className="text-white text-3xl font-semibold mb-2">Help Center</h1>
            <p className="text-[#737373]">Get help with your Instagram account</p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for help..."
                className="w-full bg-[#262626] border border-[#363636] rounded-full px-6 py-4 pl-14 text-white placeholder-[#737373] focus:outline-none focus:border-[#a8a8a8]"
              />
              <svg
                className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#737373]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {!selectedCategory ? (
            <>
              {/* Popular Questions */}
              {!searchQuery && (
                <div className="mb-10">
                  <h2 className="text-white text-xl font-semibold mb-4">Popular Questions</h2>
                  <div className="space-y-2">
                    {popularQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedCategory({ title: question, isQuestion: true })}
                        className="w-full text-left bg-[#262626] hover:bg-[#363636] rounded-lg px-5 py-4 text-white transition-colors"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Help Categories */}
              <div>
                <h2 className="text-white text-xl font-semibold mb-4">Browse by Category</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredCategories.map((category) => (
                    <div
                      key={category.id}
                      onClick={() => setSelectedCategory(category)}
                      className="bg-[#262626] hover:bg-[#363636] rounded-lg p-6 cursor-pointer transition-colors"
                    >
                      <div className="text-4xl mb-3">{category.icon}</div>
                      <h3 className="text-white font-semibold mb-2">{category.title}</h3>
                      <p className="text-[#737373] text-sm">{category.topics.length} topics</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Support */}
              <div className="mt-10 bg-[#262626] rounded-xl p-6">
                <h2 className="text-white font-semibold mb-3">Still need help?</h2>
                <p className="text-[#737373] mb-4">
                  Can&apos;t find what you&apos;re looking for? Contact our support team
                </p>
                <button
                  onClick={() => router.push('/report-problem')}
                  className="bg-[#0095f6] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[#1877f2] transition-colors"
                >
                  Contact Support
                </button>
              </div>
            </>
          ) : (
            /* Category Detail View */
            <div>
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-white mb-6 flex items-center gap-2 hover:text-[#737373]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Back to categories
              </button>

              <div className="bg-[#262626] rounded-xl p-6">
                {!selectedCategory.isQuestion && (
                  <div className="text-4xl mb-4">{selectedCategory.icon}</div>
                )}
                <h2 className="text-white text-2xl font-semibold mb-6">{selectedCategory.title}</h2>

                {selectedCategory.isQuestion ? (
                  <div className="text-[#a8a8a8] space-y-4">
                    <p>To delete your Instagram account:</p>
                    <ol className="list-decimal list-inside space-y-2 ml-4">
                      <li>Go to the Delete Your Account page</li>
                      <li>Select a reason for deleting your account from the menu</li>
                      <li>Re-enter your password</li>
                      <li>Click &quot;Permanently delete my account&quot;</li>
                    </ol>
                    <p className="text-yellow-500 bg-yellow-500 bg-opacity-10 p-4 rounded-lg mt-4">
                      ⚠️ Warning: Once you delete your account, you can&apos;t get it back. Be certain before you proceed.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedCategory.topics.map((topic, index) => (
                      <div
                        key={index}
                        className="bg-black hover:bg-[#1a1a1a] rounded-lg px-5 py-4 text-white cursor-pointer transition-colors flex items-center justify-between"
                      >
                        <span>{topic}</span>
                        <svg className="w-5 h-5 text-[#737373]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default HelpPage;
