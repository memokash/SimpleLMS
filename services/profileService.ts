// services/profileService.ts
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { MedicalProfile } from '../types/database.types';

export class ProfileService {
  // Get user profile
  static async getProfile(userId: string): Promise<MedicalProfile | null> {
    try {
      const profileRef = doc(db, 'profiles', userId);
      const profileSnap = await getDoc(profileRef);
      
      if (profileSnap.exists()) {
        return { id: profileSnap.id, ...profileSnap.data() } as MedicalProfile;
      }
      return null;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching profile:', error);
      }
      throw new Error('Failed to fetch profile');
    }
  }

  // Create or update profile
  static async updateProfile(userId: string, profileData: Partial<MedicalProfile>): Promise<void> {
    try {
      const profileRef = doc(db, 'profiles', userId);
      const updateData: any = {
        ...profileData,
        updatedAt: serverTimestamp()
      };

      // If this is a new profile, add creation timestamp
      const existingProfile = await getDoc(profileRef);
      if (!existingProfile.exists()) {
        updateData.createdAt = serverTimestamp();
        updateData.isActive = true;
      }

      await setDoc(profileRef, updateData, { merge: true });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error updating profile:', error);
      }
      throw new Error('Failed to update profile');
    }
  }

  // Upload profile picture
  static async uploadProfilePicture(userId: string, file: File): Promise<string> {
    try {
      // Delete existing profile picture if it exists
      const existingProfile = await this.getProfile(userId);
      if (existingProfile?.profilePicture) {
        try {
          const oldImageRef = ref(storage, `profile-pictures/${userId}/profile.jpg`);
          await deleteObject(oldImageRef);
        } catch (deleteError) {
          if (process.env.NODE_ENV === 'development') {
            console.log('No existing image to delete or delete failed');
          }
        }
      }

      // Upload new image
      const imageRef = ref(storage, `profile-pictures/${userId}/profile.jpg`);
      const uploadResult = await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(uploadResult.ref);

      // Update profile with new image URL
      await this.updateProfile(userId, { profilePicture: downloadURL });

      return downloadURL;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error uploading profile picture:', error);
      }
      throw new Error('Failed to upload profile picture');
    }
  }

  // Search colleagues
  static async searchColleagues(filters: {
    medicalStatus?: string;
    rotation?: string;
    institution?: string;
    location?: string;
    searchTerm?: string;
  }): Promise<MedicalProfile[]> {
    try {
      let q = query(
        collection(db, 'profiles'),
        where('isActive', '==', true),
        orderBy('updatedAt', 'desc'),
        limit(50)
      );

      // Apply filters
      if (filters.medicalStatus) {
        q = query(q, where('medicalStatus', '==', filters.medicalStatus));
      }
      if (filters.rotation) {
        q = query(q, where('currentRotation', '==', filters.rotation));
      }
      if (filters.institution) {
        q = query(q, where('institution', '==', filters.institution));
      }

      const querySnapshot = await getDocs(q);
      const profiles: MedicalProfile[] = [];

      querySnapshot.forEach((doc) => {
        const profile = { id: doc.id, ...doc.data() } as MedicalProfile;
        
        // Apply client-side search term filter
        if (filters.searchTerm) {
          const searchLower = filters.searchTerm.toLowerCase();
          const matchesSearch = 
            profile.firstName.toLowerCase().includes(searchLower) ||
            profile.lastName.toLowerCase().includes(searchLower) ||
            profile.currentRotation.toLowerCase().includes(searchLower) ||
            profile.institution.toLowerCase().includes(searchLower);
          
          if (matchesSearch) {
            profiles.push(profile);
          }
        } else {
          profiles.push(profile);
        }
      });

      return profiles;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error searching colleagues:', error);
      }
      throw new Error('Failed to search colleagues');
    }
  }

  // Get colleagues by rotation
  static async getColleaguesByRotation(rotation: string, excludeUserId?: string): Promise<MedicalProfile[]> {
    try {
      const q = query(
        collection(db, 'profiles'),
        where('currentRotation', '==', rotation),
        where('isActive', '==', true),
        orderBy('updatedAt', 'desc'),
        limit(20)
      );

      const querySnapshot = await getDocs(q);
      const profiles: MedicalProfile[] = [];

      querySnapshot.forEach((doc) => {
        const profile = { id: doc.id, ...doc.data() } as MedicalProfile;
        if (profile.userId !== excludeUserId) {
          profiles.push(profile);
        }
      });

      return profiles;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching colleagues by rotation:', error);
      }
      throw new Error('Failed to fetch colleagues by rotation');
    }
  }
}