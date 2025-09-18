'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import { storage, db } from '../../lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { 
  Upload, 
  FileText, 
  Video, 
  Image, 
  FileAudio, 
  File,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  FolderPlus,
  Share2,
  Users,
  Lock,
  Globe,
  BookOpen,
  Stethoscope,
  Brain,
  Heart,
  Pill,
  Activity
} from 'lucide-react';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  category?: string;
  visibility?: 'private' | 'group' | 'public';
}

const UploadMaterials = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [visibility, setVisibility] = useState<'private' | 'group' | 'public'>('private');
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  const categories = [
    { id: 'general', label: 'General', icon: BookOpen, color: 'bg-blue-500' },
    { id: 'anatomy', label: 'Anatomy', icon: Heart, color: 'bg-red-500' },
    { id: 'pharmacology', label: 'Pharmacology', icon: Pill, color: 'bg-purple-500' },
    { id: 'pathology', label: 'Pathology', icon: Activity, color: 'bg-orange-500' },
    { id: 'clinical', label: 'Clinical Skills', icon: Stethoscope, color: 'bg-green-500' },
    { id: 'neurology', label: 'Neurology', icon: Brain, color: 'bg-pink-500' }
  ];

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return FileText;
    if (type.includes('video')) return Video;
    if (type.includes('image')) return Image;
    if (type.includes('audio')) return FileAudio;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleFiles = (fileList: FileList) => {
    const newFiles: UploadedFile[] = Array.from(fileList).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0,
      status: 'uploading' as const,
      category: selectedCategory,
      visibility: visibility
    }));

    setFiles(prev => [...prev, ...newFiles]);

    // Simulate upload progress
    newFiles.forEach(file => {
      simulateUpload(file.id);
    });
  };

  const simulateUpload = async (fileId: string) => {
    const fileToUpload = files.find(f => f.id === fileId);
    if (!fileToUpload || !user) return;

    try {
      // Create storage reference
      const timestamp = Date.now();
      const fileName = `materials/${user.uid}/${timestamp}_${fileToUpload.name}`;
      const storageRef = ref(storage, fileName);
      
      // For demo purposes, we'll simulate the upload
      // In production, you'd use the actual file object
      const interval = setInterval(() => {
        setFiles(prev => prev.map(file => {
          if (file.id === fileId) {
            const newProgress = Math.min(file.progress + 20, 100);
            return {
              ...file,
              progress: newProgress,
              status: newProgress === 100 ? 'success' : 'uploading'
            };
          }
          return file;
        }));
      }, 500);

      setTimeout(async () => {
        clearInterval(interval);
        
        // Save metadata to Firestore
        await addDoc(collection(db, 'study_materials'), {
          fileName: fileToUpload.name,
          fileSize: fileToUpload.size,
          fileType: fileToUpload.type,
          category: fileToUpload.category,
          visibility: fileToUpload.visibility,
          uploadedBy: user.uid,
          uploadedByEmail: user.email,
          uploadedAt: serverTimestamp(),
          downloadUrl: fileName, // In production, this would be the actual download URL
          tags: [],
          downloads: 0,
          likes: 0
        });
      }, 2500);
    } catch (error) {
      console.error('Upload error:', error);
      setFiles(prev => prev.map(file => {
        if (file.id === fileId) {
          return { ...file, status: 'error' };
        }
        return file;
      }));
    }
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
  };

  return (
    <div className="min-h-screen bg-[#f0f7ff] p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#07294d] mb-2">Upload Study Materials</h1>
          <p className="text-gray-600">Share your notes, presentations, and study resources with the medical community</p>
        </div>

        {/* Category Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#07294d] mb-4">Select Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map(cat => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedCategory === cat.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`${cat.color} bg-opacity-10 p-2 rounded-lg mb-2`}>
                    <Icon className="w-6 h-6 mx-auto" />
                  </div>
                  <p className="text-xs font-medium text-gray-700">{cat.label}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Visibility Options */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#07294d] mb-4">Sharing Settings</h2>
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => setVisibility('private')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                visibility === 'private' 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span className="font-medium">Private</span>
            </button>
            <button
              onClick={() => setVisibility('group')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                visibility === 'group' 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="font-medium">Study Group</span>
            </button>
            <button
              onClick={() => setVisibility('public')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                visibility === 'public' 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span className="font-medium">Public</span>
            </button>
          </div>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
              dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {dragActive ? 'Drop files here' : 'Drag & drop your files here'}
            </h3>
            <p className="text-gray-500 mb-4">or</p>
            <label className="inline-block">
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
              />
              <span className="px-6 py-3 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition-colors">
                Browse Files
              </span>
            </label>
            <p className="text-sm text-gray-400 mt-4">
              Supported: PDF, DOCX, PPTX, Images, Videos (Max 100MB)
            </p>
          </div>
        </div>

        {/* Uploaded Files */}
        {files.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-[#07294d] mb-4">Uploaded Files</h2>
            <div className="space-y-3">
              {files.map(file => {
                const FileIcon = getFileIcon(file.type);
                const category = categories.find(c => c.id === file.category);
                
                return (
                  <div key={file.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <FileIcon className="w-6 h-6 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 truncate">{file.name}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                            {category && (
                              <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                                {category.label}
                              </span>
                            )}
                            <span className="text-xs text-gray-500">
                              {file.visibility === 'private' && '🔒 Private'}
                              {file.visibility === 'group' && '👥 Study Group'}
                              {file.visibility === 'public' && '🌐 Public'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {file.status === 'uploading' && (
                          <>
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full transition-all"
                                style={{ width: `${file.progress}%` }}
                              />
                            </div>
                            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                          </>
                        )}
                        {file.status === 'success' && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                        {file.status === 'error' && (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        )}
                        <button
                          onClick={() => removeFile(file.id)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => files.forEach(file => file.status === 'uploading' || simulateUpload(file.id))}
                className="flex-1 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                Upload All Files
              </button>
              <button 
                onClick={() => setFiles([])}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Quick Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">📚 Sharing Tips for Medical Students</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Organize materials by specialty and year for easy discovery</li>
            <li>• Include clear titles and descriptions for your uploads</li>
            <li>• Remove any patient information before sharing clinical cases</li>
            <li>• Tag materials with relevant exam names (USMLE, COMLEX, etc.)</li>
            <li>• Consider creating study guides that summarize key concepts</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UploadMaterials;