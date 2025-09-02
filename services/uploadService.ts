// services/uploadService.ts
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../lib/firebase';

export class UploadService {
  // Upload profile picture to Firebase Storage
  static async uploadProfilePicture(userId: string, file: File): Promise<string> {
    try {
      // Create unique filename
      const fileExtension = file.name.split('.').pop();
      const fileName = `profile-${userId}-${Date.now()}.${fileExtension}`;
      
      // Create storage reference
      const storageRef = ref(storage, `profile-pictures/${userId}/${fileName}`);
      
      // Upload file
      const snapshot = await uploadBytes(storageRef, file);
      
      // Get download URL and return it
      return await getDownloadURL(snapshot.ref);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error uploading file:', error);
      }
      throw new Error('Failed to upload profile picture');
    }
  }

  // Delete old profile picture
  static async deleteProfilePicture(userId: string, imageUrl: string): Promise<void> {
    try {
      // Extract file path from URL
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error deleting file:', error);
      }
      // Don't throw - old image deletion isn't critical
    }
  }
}