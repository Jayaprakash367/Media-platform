'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { postAPI } from '@/lib/api';
import toast from 'react-hot-toast';

const CreateModal = ({ onClose }) => {
  const router = useRouter();
  const [step, setStep] = useState('select'); // select, preview, details
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [visibility, setVisibility] = useState('public'); // public, close_friends, private
  const [isReel, setIsReel] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleFile = useCallback((file) => {
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      toast.error('Please select an image or video file');
      return;
    }
    setFile(file);
    setPreview(URL.createObjectURL(file));
    setStep('preview');
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('media', file);
      formData.append('caption', caption);
      formData.append('location', location);
      formData.append('visibility', visibility);
      formData.append('isReel', isReel ? 'true' : 'false');
      formData.append('mediaType', file.type.startsWith('video/') ? 'video' : 'image');

      const response = await postAPI.createPost(formData);
      
      if (response.data.success) {
        toast.success(`${isReel ? 'Reel' : 'Post'} created successfully!`);
        onClose();
        
        // Force refresh the page to show new post
        setTimeout(() => {
          window.location.href = '/';
        }, 500);
      } else {
        toast.error(`Failed to create ${isReel ? 'reel' : 'post'}`);
        setLoading(false);
      }
    } catch (error) {
      console.error('Post creation error:', error);
      toast.error(error.response?.data?.message || `Failed to create ${isReel ? 'reel' : 'post'}`);
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[#262626] rounded-xl overflow-hidden max-w-[900px] w-full max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#363636]">
          {step !== 'select' && (
            <button onClick={() => setStep(step === 'details' ? 'preview' : 'select')} className="text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <h2 className="text-white font-semibold flex-1 text-center">Create new post</h2>
          {step === 'preview' && (
            <button onClick={() => setStep('details')} className="text-[#0095f6] font-semibold">
              Next
            </button>
          )}
          {step === 'details' && (
            <button onClick={handleSubmit} disabled={loading} className="text-[#0095f6] font-semibold disabled:opacity-50">
              {loading ? 'Sharing...' : 'Share'}
            </button>
          )}
          {step === 'select' && <div className="w-6" />}
        </div>

        {/* Content */}
        <div className="flex">
          {step === 'select' && (
            <div
              className={`w-full h-[500px] flex flex-col items-center justify-center ${dragActive ? 'bg-[#1a1a1a]' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <svg className="w-24 h-24 text-white mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-xl text-white mb-4">Drag photos and videos here</p>
              <label className="bg-[#0095f6] text-white font-semibold px-4 py-2 rounded-lg cursor-pointer hover:bg-[#1877f2]">
                Select from computer
                <input type="file" accept="image/*,video/*" className="hidden" onChange={handleFileSelect} />
              </label>
            </div>
          )}

          {step === 'preview' && preview && (
            <div className="w-full h-[500px] bg-black flex items-center justify-center">
              {file?.type.startsWith('video/') ? (
                <video src={preview} className="max-w-full max-h-full object-contain" controls />
              ) : (
                <img src={preview} alt="Preview" className="max-w-full max-h-full object-contain" />
              )}
            </div>
          )}

          {step === 'details' && (
            <div className="flex w-full">
              <div className="w-[500px] h-[500px] bg-black flex items-center justify-center">
                {file?.type.startsWith('video/') ? (
                  <video src={preview} className="max-w-full max-h-full object-contain" />
                ) : (
                  <img src={preview} alt="Preview" className="max-w-full max-h-full object-contain" />
                )}
              </div>
              <div className="w-[340px] p-4">
                <textarea
                  placeholder="Write a caption..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full h-32 bg-transparent text-white resize-none outline-none text-[15px]"
                  maxLength={2200}
                />
                <div className="flex items-center justify-between text-gray-500 text-xs mb-4">
                  <span>{caption.length}/2,200</span>
                </div>
                
                <input
                  type="text"
                  placeholder="Add location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-transparent text-white py-3 border-t border-[#363636] outline-none mb-3"
                />

                {/* Visibility selector */}
                <div className="border-t border-[#363636] py-3">
                  <p className="text-white text-sm font-semibold mb-2">Who can see this?</p>
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value)}
                    className="w-full bg-[#262626] text-white border border-[#363636] rounded-lg px-3 py-2 outline-none"
                  >
                    <option value="public">Public</option>
                    <option value="close_friends">Close Friends Only</option>
                    <option value="private">Only Me</option>
                  </select>
                </div>

                {/* Reel toggle */}
                {file?.type.startsWith('video/') && (
                  <div className="border-t border-[#363636] py-3 flex items-center justify-between">
                    <p className="text-white text-sm font-semibold">Post as Reel</p>
                    <button
                      type="button"
                      onClick={() => setIsReel(!isReel)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        isReel ? 'bg-blue-500' : 'bg-[#363636]'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                          isReel ? 'transform translate-x-6' : ''
                        }`}
                      />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Close button */}
      <button onClick={onClose} className="absolute top-4 right-4 text-white">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </motion.div>
  );
};

export default CreateModal;
