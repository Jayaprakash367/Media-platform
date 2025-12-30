'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout/Layout';
import toast from 'react-hot-toast';

const ReportProblemPage = () => {
  const router = useRouter();
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [includeScreenshot, setIncludeScreenshot] = useState(false);
  const [loading, setLoading] = useState(false);

  const categories = [
    'Something isn\'t working',
    'Spam or scam',
    'Nudity or sexual activity',
    'Hate speech or symbols',
    'Violence or dangerous organizations',
    'Bullying or harassment',
    'Intellectual property violation',
    'Sale of illegal or regulated goods',
    'Suicide or self-injury',
    'Eating disorders',
    'False information',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!category || !description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success('Problem reported successfully! We\'ll look into it.');
      setLoading(false);
      router.back();
    }, 1500);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-black">
        <div className="max-w-2xl mx-auto px-5 py-8">
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
            <h1 className="text-white text-3xl font-semibold mb-2">Report a Problem</h1>
            <p className="text-[#737373]">
              Help us understand the problem. Which of the following best describes the problem?
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-[#262626] rounded-xl p-6 space-y-6">
            {/* Category Selection */}
            <div>
              <label className="block text-white font-semibold mb-3">
                Problem Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-black border border-[#363636] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#a8a8a8]"
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-white font-semibold mb-3">
                Please describe the problem *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide as much detail as possible..."
                className="w-full bg-black border border-[#363636] rounded-lg px-4 py-3 text-white placeholder-[#737373] focus:outline-none focus:border-[#a8a8a8] resize-none"
                rows={6}
                maxLength={1000}
                required
              />
              <p className="text-[#737373] text-xs mt-2 text-right">
                {description.length}/1000
              </p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-white font-semibold mb-3">
                Email (optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-black border border-[#363636] rounded-lg px-4 py-3 text-white placeholder-[#737373] focus:outline-none focus:border-[#a8a8a8]"
              />
              <p className="text-[#737373] text-xs mt-2">
                We may use this email to contact you about your report
              </p>
            </div>

            {/* Screenshot Option */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="screenshot"
                checked={includeScreenshot}
                onChange={(e) => setIncludeScreenshot(e.target.checked)}
                className="w-5 h-5"
              />
              <label htmlFor="screenshot" className="text-white text-sm">
                Include screenshot of current page
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0095f6] text-white font-semibold py-3 rounded-lg hover:bg-[#1877f2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </form>

          {/* Additional Help */}
          <div className="mt-6 bg-[#262626] rounded-xl p-6">
            <h2 className="text-white font-semibold mb-3">Need More Help?</h2>
            <div className="space-y-3">
              <a href="#" className="block text-[#0095f6] hover:underline">
                Visit Help Center →
              </a>
              <a href="#" className="block text-[#0095f6] hover:underline">
                Privacy and Safety Center →
              </a>
              <a href="#" className="block text-[#0095f6] hover:underline">
                Terms of Service →
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ReportProblemPage;
