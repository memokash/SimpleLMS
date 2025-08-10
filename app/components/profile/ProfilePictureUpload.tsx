'use client';

import React, { useState, useRef } from 'react';
import { Camera, Upload, User, X, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../AuthContext';

interface ProfilePictureUploadProps {
  currentPhotoURL?: string;
  currentPicture?: string;
  onUploadComplete?: (photoURL: string) => void;
  onPictureUpdate?: (photoURL: string) => void;
  onUploadError?: (error: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  currentPhotoURL,
  currentPicture,
  onUploadComplete,
  onPictureUpdate,
  onUploadError,
  isOpen = true,
  onClose
}) => {
  const { user, getIdToken } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB');
      return;
    }

    setError(null);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewURL(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload the file
    uploadProfilePicture(file);
  };

  const uploadProfilePicture = async (file: File) => {
    if (!user?.uid) {
      setError('You must be logged in to upload a profile picture');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Get authentication token
      const idToken = await getIdToken();
      if (!idToken) {
        throw new Error('Failed to get authentication token');
      }

      const response = await fetch('/api/profile/upload-picture', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload profile picture');
      }

      const data = await response.json();
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      setUploadProgress(100);
      setSuccess(true);
      
      // Call the callback if provided
      if (onUploadComplete) {
        onUploadComplete(data.photoURL);
      }
      if (onPictureUpdate) {
        onPictureUpdate(data.photoURL);
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);

    } catch (error) {
      console.error('Profile picture upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload profile picture';
      setError(errorMessage);
      
      if (onUploadError) {
        onUploadError(errorMessage);
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const clearPreview = () => {
    setPreviewURL(null);
    setError(null);
    setSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayPhotoURL = previewURL || currentPicture || currentPhotoURL;

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Update Profile Picture
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>
        
        <div className="flex flex-col items-center space-y-4">
      {/* Profile Picture Display */}
      <div className="relative">
        <div className="w-24 h-24 rounded-full overflow-hidden border-3 border-gray-200 dark:border-gray-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-yellow-400 hover:shadow-yellow-400/30">
          {displayPhotoURL ? (
            <img
              src={displayPhotoURL}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <User className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
          )}
        </div>

        {/* Upload Progress Overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
            <div className="text-white text-center">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <div className="text-sm font-medium">{uploadProgress}%</div>
            </div>
          </div>
        )}

        {/* Success Indicator */}
        {success && (
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
            <Check className="w-4 h-4 text-white" />
          </div>
        )}

        {/* Clear Preview Button */}
        {previewURL && !isUploading && (
          <button
            onClick={clearPreview}
            className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center border-2 border-white transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        )}
      </div>

      {/* Upload Button */}
      <button
        onClick={handleButtonClick}
        disabled={isUploading}
        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 shadow-lg"
      >
        {isUploading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Uploading...
          </>
        ) : (
          <>
            <Camera className="w-5 h-5" />
            {currentPhotoURL ? 'Change Picture' : 'Upload Picture'}
          </>
        )}
      </button>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg text-green-700 dark:text-green-300 text-sm">
          <Check className="w-4 h-4 flex-shrink-0" />
          <span>Profile picture updated successfully!</span>
        </div>
      )}

      {/* Upload Guidelines */}
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center max-w-xs">
        <p>Supported formats: JPG, PNG, WebP</p>
        <p>Maximum size: 5MB</p>
        <p>Recommended: Square image, at least 256x256px</p>
      </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePictureUpload;