// types/profile.types.ts
export interface MedicalProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profilePicture?: string;
  bio?: string;
  medicalStatus: MedicalStatus;
  yearLevel: string;
  currentRotation: string;
  rotationLocation: string;
  institution: string;
  location: string;
  interests: string[];
  privacy: PrivacySettings;
  createdAt: Date;
  updatedAt: Date;
}

export type MedicalStatus = 
  | 'Pre-Med Student'
  | 'Medical Student' 
  | 'Resident'
  | 'Fellow'
  | 'Attending Physician'
  | 'Nurse Practitioner'
  | 'Physician Assistant'
  | 'Other Healthcare Professional';

export interface PrivacySettings {
  showEmail: PrivacyLevel;
  showPhone: PrivacyLevel;
  showLocation: PrivacyLevel;
  showRotation: PrivacyLevel;
  showRotationLocation: PrivacyLevel;
  showInstitution: PrivacyLevel;
  showStatus: PrivacyLevel;
}

export type PrivacyLevel = 'public' | 'friends' | 'private';

export interface Invitation {
  id: string;
  senderEmail: string;
  senderName: string;
  recipientEmail: string;
  message: string;
  status: 'pending' | 'sent' | 'failed';
  sentAt: Date;
}