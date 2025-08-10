'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import { useTheme } from '../components/ThemeContext';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Smartphone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Check,
  AlertCircle,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react';

interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  marketing: boolean;
}

interface PrivacySettings {
  profileVisibility: 'public' | 'colleagues' | 'private';
  showProgress: boolean;
  showAchievements: boolean;
  allowMessages: boolean;
}

const SettingsPage = () => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('account');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Settings state
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: true,
    push: true,
    sms: false,
    marketing: false
  });

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: 'colleagues',
    showProgress: true,
    showAchievements: true,
    allowMessages: true
  });

  useEffect(() => {
    setMounted(true);
    if (user) {
      setDisplayName(user.displayName || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleSave = async (section: string) => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'account', name: 'Account', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'privacy', name: 'Privacy', icon: Shield },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'security', name: 'Security', icon: Lock }
  ];

  if (!mounted) {
    return null;
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 p-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-200 shadow-lg hover:shadow-xl z-50"
        aria-label="Toggle theme"
      >
        {isDark ? (
          <Sun className="h-5 w-5 text-yellow-500" />
        ) : (
          <Moon className="h-5 w-5 text-gray-700" />
        )}
      </button>

      {/* Header */}
      <div className={`text-white shadow-xl ${
        isDark 
          ? 'bg-gradient-to-r from-gray-800 via-gray-900 to-indigo-900' 
          : 'bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-yellow-400" />
              <Settings className="h-10 w-10" />
            </div>
            <div>
              <h1 className="gradient-title text-3xl">Account Settings</h1>
              <p className={`${isDark ? 'text-gray-300' : 'text-purple-100'}`}>Manage your account preferences and security settings</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="reactive-tile p-1">
              <nav className="space-y-1">
                {tabs.map(({ id, name, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      activeTab === id
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                        : `${isDark ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Account Settings */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                <div className="reactive-tile p-6">
                  <h2 className="gradient-title-secondary text-xl mb-6">Account Information</h2>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Display Name</label>
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Enter your display name"
                          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                            isDark 
                              ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                              : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'
                          }`}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Email Address</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email"
                          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                            isDark 
                              ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                              : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'
                          }`}
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-4 pt-4">
                      <button
                        onClick={() => handleSave('account')}
                        disabled={saving}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                        {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Settings */}
            {activeTab === 'notifications' && (
              <div className="reactive-tile p-6">
                <h2 className="gradient-title-secondary text-xl mb-6">Notification Preferences</h2>
                
                <div className="space-y-6">
                  <div className="space-y-4">
                    {[
                      { key: 'email', name: 'Email Notifications', description: 'Receive notifications via email', icon: Mail },
                      { key: 'push', name: 'Push Notifications', description: 'Receive push notifications in browser', icon: Smartphone },
                      { key: 'sms', name: 'SMS Notifications', description: 'Receive notifications via text message', icon: Smartphone },
                      { key: 'marketing', name: 'Marketing Emails', description: 'Receive promotional and marketing emails', icon: Mail }
                    ].map(({ key, name, description, icon: Icon }) => (
                      <div key={key} className={`flex items-center justify-between p-4 border rounded-xl ${
                        isDark ? 'border-gray-600 bg-gray-800/30' : 'border-gray-200 bg-gray-50/30'
                      }`}>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <Icon className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications[key as keyof NotificationSettings]}
                            onChange={(e) => setNotifications(prev => ({ ...prev, [key]: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={() => handleSave('notifications')}
                      disabled={saving}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                      {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Settings */}
            {activeTab === 'privacy' && (
              <div className="reactive-tile p-6">
                <h2 className="gradient-title-secondary text-xl mb-6">Privacy & Visibility</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">Profile Visibility</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        { value: 'public', name: 'Public', description: 'Visible to everyone' },
                        { value: 'colleagues', name: 'Colleagues Only', description: 'Only visible to colleagues' },
                        { value: 'private', name: 'Private', description: 'Only visible to you' }
                      ].map(({ value, name, description }) => (
                        <label key={value} className={`cursor-pointer p-4 border rounded-xl transition-all duration-200 ${
                          privacy.profileVisibility === value
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                            : 'border-gray-200 dark:border-gray-600 hover:border-purple-300'
                        }`}>
                          <input
                            type="radio"
                            name="profileVisibility"
                            value={value}
                            checked={privacy.profileVisibility === value}
                            onChange={(e) => setPrivacy(prev => ({ ...prev, profileVisibility: e.target.value as any }))}
                            className="sr-only"
                          />
                          <h3 className="font-semibold text-gray-900 dark:text-white">{name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      { key: 'showProgress', name: 'Show Progress', description: 'Display your learning progress to others' },
                      { key: 'showAchievements', name: 'Show Achievements', description: 'Display your badges and achievements' },
                      { key: 'allowMessages', name: 'Allow Messages', description: 'Allow other users to send you messages' }
                    ].map(({ key, name, description }) => (
                      <div key={key} className={`flex items-center justify-between p-4 border rounded-xl ${
                        isDark ? 'border-gray-600 bg-gray-800/30' : 'border-gray-200 bg-gray-50/30'
                      }`}>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={privacy[key as keyof PrivacySettings] as boolean}
                            onChange={(e) => setPrivacy(prev => ({ ...prev, [key]: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={() => handleSave('privacy')}
                      disabled={saving}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                      {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <div className="reactive-tile p-6">
                <h2 className="gradient-title-secondary text-xl mb-6">Appearance & Theme</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">Theme Preference</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                        !isDark 
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30' 
                          : 'border-gray-200 dark:border-gray-600 hover:border-purple-300'
                      }`} onClick={() => !isDark || toggleTheme()}>
                        <div className="flex items-center gap-3 mb-3">
                          <Sun className="h-6 w-6 text-yellow-500" />
                          <h3 className="font-semibold text-gray-900 dark:text-white">Light Mode</h3>
                        </div>
                        <div className="w-full h-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border"></div>
                      </div>
                      
                      <div className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                        isDark 
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30' 
                          : 'border-gray-200 dark:border-gray-600 hover:border-purple-300'
                      }`} onClick={() => isDark || toggleTheme()}>
                        <div className="flex items-center gap-3 mb-3">
                          <Moon className="h-6 w-6 text-purple-400" />
                          <h3 className="font-semibold text-gray-900 dark:text-white">Dark Mode</h3>
                        </div>
                        <div className="w-full h-16 bg-gradient-to-r from-gray-900 to-indigo-900 rounded-lg border"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-xl border ${
                    isDark ? 'border-purple-600 bg-purple-900/30' : 'border-purple-200 bg-purple-50'
                  }`}>
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-purple-900 dark:text-purple-300 mb-1">Theme Applied!</h4>
                        <p className="text-sm text-purple-700 dark:text-purple-400">
                          Your theme preference is automatically saved and will persist across sessions.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="reactive-tile p-6">
                <h2 className="gradient-title-secondary text-xl mb-6">Security Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Change Password</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Current Password</label>
                        <div className="relative">
                          <input
                            type={showPasswords ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter current password"
                            className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                              isDark 
                                ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                                : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords(!showPasswords)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPasswords ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">New Password</label>
                          <input
                            type={showPasswords ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                              isDark 
                                ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                                : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'
                            }`}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Confirm Password</label>
                          <input
                            type={showPasswords ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                              isDark 
                                ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                                : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={() => handleSave('security')}
                      disabled={saving || !currentPassword || !newPassword || newPassword !== confirmPassword}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                      {saving ? 'Updating...' : saved ? 'Updated!' : 'Update Password'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;