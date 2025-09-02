// services/invitationService.ts
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy,
  getDocs, 
  doc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db } from '../lib/firebase';
import { getFunctions } from 'firebase/functions';

const functions = getFunctions();
import { Invitation } from '../types/firebase.types';

export class InvitationService {
  // Send invitations (calls Firebase Function)
  static async sendInvitations(invitations: {
    recipientEmail: string;
    message: string;
  }[], senderUserId: string): Promise<boolean> {
    try {
      const sendInviteFunction = httpsCallable(functions, 'sendInvitations');
      const result = await sendInviteFunction({
        invitations,
        senderUserId
      });

      return (result.data as any).success;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error sending invitations:', error);
      }
      throw new Error('Failed to send invitations');
    }
  }

  // Get sent invitations
  static async getSentInvitations(userId: string): Promise<Invitation[]> {
    try {
      const q = query(
        collection(db, 'invitations'),
        where('senderUserId', '==', userId),
        orderBy('sentAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const invitations: Invitation[] = [];

      querySnapshot.forEach((doc) => {
        invitations.push({ id: doc.id, ...doc.data() } as Invitation);
      });

      return invitations;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching sent invitations:', error);
      }
      throw new Error('Failed to fetch sent invitations');
    }
  }

  // Generate referral code
  static generateReferralCode(firstName: string, lastName: string): string {
    const base = `${firstName.toLowerCase()}${lastName.toLowerCase()}`;
    const random = Math.random().toString(36).substring(2, 8);
    return `${base}-${random}`;
  }

  // Track referral acceptance
  static async acceptReferral(referralCode: string, newUserId: string): Promise<void> {
    try {
      const q = query(
        collection(db, 'invitations'),
        where('referralCode', '==', referralCode),
        where('status', '==', 'sent')
      );

      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const invitationDoc = querySnapshot.docs[0];
        await updateDoc(doc(db, 'invitations', invitationDoc.id), {
          status: 'accepted',
          acceptedAt: serverTimestamp(),
          acceptedByUserId: newUserId
        });
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error accepting referral:', error);
      }
    }
  }
}
