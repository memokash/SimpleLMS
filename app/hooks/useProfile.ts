// hooks/useProfile.ts
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { ProfileService } from '../../services/profileService';
import { MedicalProfile } from '../../types/profile.types';

export const useProfile = () => {
  const [profile, setProfile] = useState<MedicalProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          setLoading(true);
          const profileData = await ProfileService.getProfile(currentUser.uid);
          setProfile(profileData);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load profile');
        } finally {
          setLoading(false);
        }
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const updateProfile = async (updates: Partial<MedicalProfile>) => {
    if (!user?.uid) {
      throw new Error('User not authenticated');
    }
    
    try {
      await ProfileService.updateProfile(user.uid, updates);
      const updatedProfile = await ProfileService.getProfile(user.uid);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      throw err;
    }
  };

  const uploadProfilePicture = async (file: File) => {
    if (!user?.uid) {
      throw new Error('User not authenticated');
    }
    
    try {
      const imageUrl = await ProfileService.uploadProfilePicture(user.uid, file);
      if (profile) {
        setProfile({ ...profile, profilePicture: imageUrl });
      }
      return imageUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload picture');
      throw err;
    }
  };

  return {
    profile,
    user,
    loading,
    error,
    updateProfile,
    uploadProfilePicture,
  };
};