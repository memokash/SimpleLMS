'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../components/AuthContext';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { 
  User, Camera, Mail, Phone, MapPin, Calendar, 
  Briefcase, Award, Edit2, Save, X, Upload,
  Github, Linkedin, Twitter, Globe, BookOpen,
  Target, TrendingUp, Clock, CheckCircle
} from 'lucide-react';
import Image from 'next/image';
import { logger } from '../../lib/logger';

interface UserProfile {
  displayName: string;
  email: string;
  photoURL: string;
  bio: string;
  phone: string;
  location: string;
  medicalSchool: string;
  yearOfStudy: string;
  specialtyInterest: string;
  studyGoals: string;
  linkedin: string;
  twitter: string;
  github: string;
  website: string;
  joinedDate: string;
  totalQuizzes: number;
  averageScore: number;
  studyStreak: number;
  achievements: string[];
}

export default function ProfileClient() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({
    displayName: '',
    email: '',
    photoURL: '',
    bio: '',
    phone: '',
    location: '',
    medicalSchool: '',
    yearOfStudy: '',
    specialtyInterest: '',
    studyGoals: '',
    linkedin: '',
    twitter: '',
    github: '',
    website: '',
    joinedDate: '',
    totalQuizzes: 0,
    averageScore: 0,
    studyStreak: 0,
    achievements: []
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const profileDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (profileDoc.exists()) {
        const data = profileDoc.data();
        setProfile({
          displayName: data.displayName || user.displayName || '',
          email: data.email || user.email || '',
          photoURL: data.photoURL || user.photoURL || '',
          bio: data.bio || '',
          phone: data.phone || '',
          location: data.location || '',
          medicalSchool: data.medicalSchool || '',
          yearOfStudy: data.yearOfStudy || '',
          specialtyInterest: data.specialtyInterest || '',
          studyGoals: data.studyGoals || '',
          linkedin: data.linkedin || '',
          twitter: data.twitter || '',
          github: data.github || '',
          website: data.website || '',
          joinedDate: user.metadata.creationTime || '',
          totalQuizzes: data.totalQuizzes || 0,
          averageScore: data.averageScore || 0,
          studyStreak: data.studyStreak || 0,
          achievements: data.achievements || []
        });
      } else {
        // Create initial profile
        const initialProfile = {
          displayName: user.displayName || '',
          email: user.email || '',
          photoURL: user.photoURL || '',
          bio: '',
          phone: '',
          location: '',
          medicalSchool: '',
          yearOfStudy: '',
          specialtyInterest: '',
          studyGoals: '',
          linkedin: '',
          twitter: '',
          github: '',
          website: '',
          joinedDate: user.metadata.creationTime || '',
          totalQuizzes: 0,
          averageScore: 0,
          studyStreak: 0,
          achievements: []
        };
        
        await setDoc(doc(db, 'users', user.uid), initialProfile);
        setProfile(initialProfile);
      }
    } catch (error) {
      logger.error('Error loading profile:', error);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;
    
    const file = e.target.files[0];
    
    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setUploadingPhoto(true);
    
    try {
      // Upload to Firebase Storage
      const storageRef = ref(storage, `avatars/${user.uid}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      // Update auth profile
      await updateProfile(user, { photoURL: downloadURL });
      
      // Update Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        photoURL: downloadURL
      });
      
      setProfile(prev => ({ ...prev, photoURL: downloadURL }));
    } catch (error) {
      logger.error('Error uploading photo:', error);
      alert('Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    
    try {
      // Update auth profile
      if (profile.displayName !== user.displayName) {
        await updateProfile(user, { displayName: profile.displayName });
      }
      
      // Update Firestore - only pass the fields that should be stored
      const profileData = {
        displayName: profile.displayName,
        email: profile.email,
        photoURL: profile.photoURL,
        bio: profile.bio,
        phone: profile.phone,
        location: profile.location,
        medicalSchool: profile.medicalSchool,
        yearOfStudy: profile.yearOfStudy,
        specialtyInterest: profile.specialtyInterest,
        studyGoals: profile.studyGoals,
        linkedin: profile.linkedin,
        twitter: profile.twitter,
        github: profile.github,
        website: profile.website,
        totalQuizzes: profile.totalQuizzes,
        averageScore: profile.averageScore,
        studyStreak: profile.studyStreak,
        achievements: profile.achievements
      };
      
      await updateDoc(doc(db, 'users', user.uid), profileData);
      
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      logger.error('Error saving profile:', error);
      alert('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Please sign in to view your profile</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Cover Image */}
          <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
          
          {/* Profile Info */}
          <div className="relative px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end sm:space-x-5">
              {/* Avatar */}
              <div className="relative -mt-12 sm:-mt-16">
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-gray-800 bg-white dark:bg-gray-700 overflow-hidden">
                  {profile.photoURL ? (
                    <Image
                      src={profile.photoURL}
                      alt={profile.displayName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                      <span className="text-white text-3xl sm:text-4xl font-bold">
                        {getInitials(profile.displayName || 'U')}
                      </span>
                    </div>
                  )}
                  
                  {isEditing && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingPhoto}
                      className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                    >
                      {uploadingPhoto ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Camera className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
              
              {/* Name and Actions */}
              <div className="mt-4 sm:mt-0 flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.displayName}
                        onChange={(e) => setProfile(prev => ({ ...prev, displayName: e.target.value }))}
                        className="text-2xl font-bold bg-transparent border-b-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 outline-none"
                      />
                    ) : (
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {profile.displayName || 'Your Name'}
                      </h1>
                    )}
                    <p className="text-gray-600 dark:text-gray-400">{profile.email}</p>
                  </div>
                  
                  <div className="mt-4 sm:mt-0">
                    {isEditing ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSave}
                          disabled={isSaving}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        >
                          {isSaving ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          <span>Save</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            loadProfile();
                          }}
                          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center space-x-2"
                        >
                          <X className="w-4 h-4" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span>Edit Profile</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Quizzes Taken</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile.totalQuizzes}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Score</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile.averageScore}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Study Streak</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile.studyStreak} days</p>
              </div>
              <Target className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Achievements</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile.achievements.length}</p>
              </div>
              <Award className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Personal Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
                {isEditing ? (
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">
                    {profile.bio || 'No bio added yet'}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Phone className="inline w-4 h-4 mr-1" />
                  Phone
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                  />
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">
                    {profile.phone || 'Not provided'}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <MapPin className="inline w-4 h-4 mr-1" />
                  Location
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="City, State/Country"
                  />
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">
                    {profile.location || 'Not provided'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Academic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Medical School</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.medicalSchool}
                    onChange={(e) => setProfile(prev => ({ ...prev, medicalSchool: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your Medical School"
                  />
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">
                    {profile.medicalSchool || 'Not provided'}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year of Study</label>
                {isEditing ? (
                  <select
                    value={profile.yearOfStudy}
                    onChange={(e) => setProfile(prev => ({ ...prev, yearOfStudy: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Year</option>
                    <option value="MS1">MS1 (First Year)</option>
                    <option value="MS2">MS2 (Second Year)</option>
                    <option value="MS3">MS3 (Third Year)</option>
                    <option value="MS4">MS4 (Fourth Year)</option>
                    <option value="Resident">Resident</option>
                    <option value="Fellow">Fellow</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">
                    {profile.yearOfStudy || 'Not provided'}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Specialty Interest</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.specialtyInterest}
                    onChange={(e) => setProfile(prev => ({ ...prev, specialtyInterest: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Cardiology, Neurology"
                  />
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">
                    {profile.specialtyInterest || 'Not provided'}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Study Goals</label>
                {isEditing ? (
                  <textarea
                    value={profile.studyGoals}
                    onChange={(e) => setProfile(prev => ({ ...prev, studyGoals: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="What are your study goals?"
                  />
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">
                    {profile.studyGoals || 'Not provided'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Social Links</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Linkedin className="inline w-4 h-4 mr-1" />
                LinkedIn
              </label>
              {isEditing ? (
                <input
                  type="url"
                  value={profile.linkedin}
                  onChange={(e) => setProfile(prev => ({ ...prev, linkedin: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://linkedin.com/in/username"
                />
              ) : (
                profile.linkedin ? (
                  <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {profile.linkedin}
                  </a>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">Not provided</p>
                )
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Twitter className="inline w-4 h-4 mr-1" />
                Twitter
              </label>
              {isEditing ? (
                <input
                  type="url"
                  value={profile.twitter}
                  onChange={(e) => setProfile(prev => ({ ...prev, twitter: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://twitter.com/username"
                />
              ) : (
                profile.twitter ? (
                  <a href={profile.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {profile.twitter}
                  </a>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">Not provided</p>
                )
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Github className="inline w-4 h-4 mr-1" />
                GitHub
              </label>
              {isEditing ? (
                <input
                  type="url"
                  value={profile.github}
                  onChange={(e) => setProfile(prev => ({ ...prev, github: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://github.com/username"
                />
              ) : (
                profile.github ? (
                  <a href={profile.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {profile.github}
                  </a>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">Not provided</p>
                )
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Globe className="inline w-4 h-4 mr-1" />
                Website
              </label>
              {isEditing ? (
                <input
                  type="url"
                  value={profile.website}
                  onChange={(e) => setProfile(prev => ({ ...prev, website: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://yourwebsite.com"
                />
              ) : (
                profile.website ? (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {profile.website}
                  </a>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">Not provided</p>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}