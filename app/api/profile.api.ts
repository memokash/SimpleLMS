// api/profile.api.ts
interface MedicalProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  medicalSchool?: string;
  yearOfStudy?: number;
  specialtyInterest?: string;
  profilePicture?: string;
  createdAt: Date;
  updatedAt: Date;
}
export const profileAPI = {
  // Get user profile
  getProfile: async (userId: string): Promise<MedicalProfile> => {
    const response = await fetch(`/api/profile/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }
    return response.json();
  },

  // Update profile
  updateProfile: async (userId: string, profileData: Partial<MedicalProfile>): Promise<MedicalProfile> => {
    const response = await fetch(`/api/profile/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });
    if (!response.ok) {
      throw new Error('Failed to update profile');
    }
    return response.json();
  },

  // Upload profile picture
  uploadProfilePicture: async (userId: string, file: File): Promise<{ imageUrl: string }> => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    formData.append('userId', userId);

    const response = await fetch('/api/profile/upload-picture', {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      throw new Error('Failed to upload picture');
    }
    return response.json();
  },
};