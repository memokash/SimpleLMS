// types/firebase.types.ts
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
  isActive: boolean;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrivacySettings {
  showEmail: PrivacyLevel;
  showPhone: PrivacyLevel;
  showLocation: PrivacyLevel;
  showRotation: PrivacyLevel;
  showRotationLocation: PrivacyLevel;
  showInstitution: PrivacyLevel;
  showStatus: PrivacyLevel;
}

export type PrivacyLevel = 'public' | 'colleagues' | 'private';
export type MedicalStatus = 
  | 'Pre-Med Student'
  | 'Medical Student' 
  | 'Resident'
  | 'Fellow'
  | 'Attending Physician'
  | 'Nurse Practitioner'
  | 'Physician Assistant'
  | 'Other Healthcare Professional';

export interface Invitation {
  id: string;
  senderUserId: string;
  senderEmail: string;
  senderName: string;
  recipientEmail: string;
  message: string;
  referralCode: string;
  status: 'pending' | 'sent' | 'failed' | 'accepted';
  sentAt: Date;
  acceptedAt?: Date;
}

export interface ReferralStats {
  userId: string;
  totalInvitesSent: number;
  totalAccepted: number;
  referralCode: string;
  createdAt: Date;
}