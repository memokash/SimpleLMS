'use client';

import React, { useState, useEffect } from 'react';
import { useProfile } from '../hooks/useProfile';
import { useInvitations } from '../hooks/useInvitations';
import { useTheme } from '../components/ThemeContext';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Camera, 
  Edit3, 
  Save, 
  X, 
  UserPlus, 
  Settings, 
  Shield, 
  Building2,
  GraduationCap,
  Stethoscope,
  Calendar,
  Users,
  Share2,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  AlertCircle,
  Upload,
  Trash2,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react';
import { MedicalProfile, PrivacyLevel } from '../../types/profile.types';

const ProfilePage = () => {
  const { profile, user, loading, error, updateProfile, uploadProfilePicture } = useProfile();
  const { sendInvitations, sending } = useInvitations();
  const { isDark, toggleTheme } = useTheme();
  
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<MedicalProfile>>({});
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmails, setInviteEmails] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (profile && !isEditing) {
      setEditedProfile(profile);
    }
  }, [profile, isEditing]);

  const handleSave = async () => {
    if (!user?.uid || !editedProfile) {
      return;
    }
    
    try {
      await updateProfile(editedProfile);
      setIsEditing(false);
      setSaveMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      setSaveMessage({ type: 'error', text: 'Failed to update profile' });
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile || {});
    setIsEditing(false);
  };

  const handlePictureUpload = async (file: File) => {
    if (!file) {
      return;
    }
    
    setUploadingPicture(true);
    try {
      await uploadProfilePicture(file);
      setSaveMessage({ type: 'success', text: 'Profile picture updated!' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      setSaveMessage({ type: 'error', text: 'Failed to upload picture' });
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleSendInvitations = async () => {
    if (!user?.uid || !inviteEmails.trim()) {
      return;
    }
    
    const emails = inviteEmails.split(/[,\n]/).map(email => email.trim()).filter(email => email);
    const success = await sendInvitations(emails, inviteMessage, user.uid);
    
    if (success) {
      setShowInviteModal(false);
      setInviteEmails('');
      setInviteMessage('');
      setSaveMessage({ type: 'success', text: `Invitations sent to ${emails.length} colleagues!` });
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const getPrivacyIcon = (level: PrivacyLevel) => {
    switch (level) {
      case 'public': return <Users className="w-4 h-4 text-green-500" />;
      case 'colleagues': return <User className="w-4 h-4 text-yellow-500" />;
      case 'private': return <EyeOff className="w-4 h-4 text-red-500" />;
      default: return <Eye className="w-4 h-4 text-gray-500" />;
    }
  };

  if (!mounted || loading) {
    return (
      <div className={`min-h-screen transition-all duration-500 ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900' 
          : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
      } flex items-center justify-center`}>
        <div className="reactive-tile p-6">
          <Loader2 className="animate-spin h-6 w-6 mr-3 text-purple-500" />
          <span className="text-lg font-medium text-gray-900 dark:text-white">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className={`min-h-screen transition-all duration-500 ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900' 
          : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
      } flex items-center justify-center`}>
        <div className="max-w-md w-full reactive-tile p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="gradient-title text-xl mb-2">Profile Error</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    } py-8`}>
      <div className="max-w-4xl mx-auto px-4">
        {/* Success/Error Messages */}
        {saveMessage && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-2 ${
            saveMessage.type === 'success' 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-700' 
              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-700'
          }`}>
            {saveMessage.type === 'success' ? 
              <CheckCircle className="w-5 h-5" /> : 
              <AlertCircle className="w-5 h-5" />
            }
            {saveMessage.text}
          </div>
        )}

        {/* Header */}
        <div className="reactive-tile p-8 mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="absolute top-6 right-6 p-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-200 shadow-lg hover:shadow-xl"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-gray-700" />
              )}
            </button>
            {/* Profile Picture */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                {profile?.profilePicture ? (
                  <img src={profile.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span>{profile?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}</span>
                )}
              </div>
              
              {/* Upload button */}
              <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border-2 border-purple-200 cursor-pointer hover:bg-purple-50 transition-colors">
                {uploadingPicture ? (
                  <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
                ) : (
                  <Camera className="w-5 h-5 text-purple-600" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handlePictureUpload(e.target.files[0])}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex-1">
              <h1 className="gradient-title text-3xl mb-2">
                <Sparkles className="inline w-6 h-6 mr-2 text-yellow-500" />
                {profile?.firstName && profile?.lastName 
                  ? `${profile.firstName} ${profile.lastName}`
                  : user?.email || 'Medical Professional'
                }
              </h1>
              <div className="flex items-center gap-2 mb-4">
                <Stethoscope className="w-5 h-5 text-purple-500" />
                <span className="text-lg text-gray-700 dark:text-gray-200">{profile?.medicalStatus || 'Medical Professional'}</span>
              </div>
              
              {profile?.institution && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mb-2">
                  <Building2 className="w-4 h-4" />
                  <span>{profile.institution}</span>
                </div>
              )}
              
              {profile?.currentRotation && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>{profile.currentRotation}</span>
                  {profile.rotationLocation && <span>at {profile.rotationLocation}</span>}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowInviteModal(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
              >
                <UserPlus className="w-5 h-5" />
                Invite Colleagues
              </button>
              
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
              >
                <Edit3 className="w-5 h-5" />
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="reactive-tile p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Basic Information */}
            <div>
              <h3 className="gradient-title-secondary text-xl mb-6 flex items-center gap-2">
                <User className="w-6 h-6 text-purple-500" />
                Basic Information
              </h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile.firstName || ''}
                        onChange={(e) => setEditedProfile({...editedProfile, firstName: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl text-gray-900 dark:text-white">{profile?.firstName || 'Not set'}</div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile.lastName || ''}
                        onChange={(e) => setEditedProfile({...editedProfile, lastName: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl text-gray-900 dark:text-white">{profile?.lastName || 'Not set'}</div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl text-gray-900 dark:text-white flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    {profile?.email || user?.email || 'Not set'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editedProfile.phone || ''}
                      onChange={(e) => setEditedProfile({...editedProfile, phone: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl text-gray-900 dark:text-white flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      {profile?.phone || 'Not set'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
                  {isEditing ? (
                    <textarea
                      value={editedProfile.bio || ''}
                      onChange={(e) => setEditedProfile({...editedProfile, bio: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                      placeholder="Tell colleagues about yourself..."
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl text-gray-900 dark:text-white min-h-[100px]">
                      {profile?.bio || 'No bio available'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div>
              <h3 className="gradient-title-secondary text-xl mb-6 flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-purple-500" />
                Medical Information
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Medical Status</label>
                  {isEditing ? (
                    <select
                      value={editedProfile.medicalStatus || ''}
                      onChange={(e) => setEditedProfile({...editedProfile, medicalStatus: e.target.value as any})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    >
                      <option value="">Select Status</option>
                      <option value="Pre-Med Student">Pre-Med Student</option>
                      <option value="Medical Student">Medical Student</option>
                      <option value="Resident">Resident</option>
                      <option value="Fellow">Fellow</option>
                      <option value="Attending Physician">Attending Physician</option>
                      <option value="Nurse Practitioner">Nurse Practitioner</option>
                      <option value="Physician Assistant">Physician Assistant</option>
                      <option value="Other Healthcare Professional">Other Healthcare Professional</option>
                    </select>
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl text-gray-900 dark:text-white">{profile?.medicalStatus || 'Not set'}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Year Level</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.yearLevel || ''}
                      onChange={(e) => setEditedProfile({...editedProfile, yearLevel: e.target.value})}
                      placeholder="e.g., MS2, PGY-1, Fellow Year 2"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl text-gray-900 dark:text-white">{profile?.yearLevel || 'Not set'}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Current Rotation</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.currentRotation || ''}
                      onChange={(e) => setEditedProfile({...editedProfile, currentRotation: e.target.value})}
                      placeholder="e.g., Internal Medicine, Surgery, Pediatrics"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl text-gray-900 dark:text-white">{profile?.currentRotation || 'Not set'}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Rotation Location</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.rotationLocation || ''}
                      onChange={(e) => setEditedProfile({...editedProfile, rotationLocation: e.target.value})}
                      placeholder="e.g., University Hospital, Community Clinic"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl text-gray-900 dark:text-white">{profile?.rotationLocation || 'Not set'}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Institution</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.institution || ''}
                      onChange={(e) => setEditedProfile({...editedProfile, institution: e.target.value})}
                      placeholder="e.g., Harvard Medical School, Johns Hopkins"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl text-gray-900 dark:text-white flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-500" />
                      {profile?.institution || 'Not set'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.location || ''}
                      onChange={(e) => setEditedProfile({...editedProfile, location: e.target.value})}
                      placeholder="e.g., Boston, MA"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl text-gray-900 dark:text-white flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      {profile?.location || 'Not set'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Save/Cancel Buttons */}
          {isEditing && (
            <div className="mt-8 flex justify-end gap-4">
              <button
                onClick={handleCancel}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <X className="w-5 h-5" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all duration-200 flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                Save Changes
              </button>
            </div>
          )}
        </div>

        {/* Invite Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-xl max-w-lg w-full p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <UserPlus className="w-6 h-6 text-purple-500" />
                  Invite Colleagues
                </h3>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Addresses (one per line or comma-separated)
                  </label>
                  <textarea
                    value={inviteEmails}
                    onChange={(e) => setInviteEmails(e.target.value)}
                    rows={4}
                    placeholder="colleague1@email.com&#10;colleague2@email.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Personal Message (optional)
                  </label>
                  <textarea
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    rows={3}
                    placeholder="Hi! I'd like to invite you to join SimpleLMS..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendInvitations}
                    disabled={sending || !inviteEmails.trim()}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {sending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Share2 className="w-5 h-5" />
                        Send Invitations
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;