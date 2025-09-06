// Device Session Management for 2-device limit
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { v4 as uuidv4 } from 'uuid';
import { DeviceSession as DeviceSessionType } from '../types/database.types';

// Use Timestamp version for Firestore operations
interface DeviceSession extends Omit<DeviceSessionType, 'lastActive' | 'createdAt'> {
  lastActive: Timestamp;
  createdAt: Timestamp;
  userAgent: string;
}

export class DeviceManager {
  private static readonly MAX_DEVICES = 2;
  private static readonly SESSION_COLLECTION = 'userDeviceSessions';
  
  // Generate or get device ID from localStorage
  static getDeviceId(): string {
    if (typeof window === 'undefined') return '';
    
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = uuidv4();
      localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  }

  // Helper methods for device information
  static getDeviceType(): string {
    if (typeof window === 'undefined') return 'unknown';
    const userAgent = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) return 'tablet';
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) return 'mobile';
    return 'desktop';
  }

  static getBrowserName(): string {
    if (typeof window === 'undefined') return 'unknown';
    const userAgent = navigator.userAgent;
    if (userAgent.indexOf('Chrome') > -1) return 'Chrome';
    if (userAgent.indexOf('Safari') > -1) return 'Safari';
    if (userAgent.indexOf('Firefox') > -1) return 'Firefox';
    if (userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident/') > -1) return 'IE';
    if (userAgent.indexOf('Edge') > -1) return 'Edge';
    return 'Other';
  }

  static getOSName(): string {
    if (typeof window === 'undefined') return 'unknown';
    const userAgent = navigator.userAgent;
    if (userAgent.indexOf('Win') > -1) return 'Windows';
    if (userAgent.indexOf('Mac') > -1) return 'MacOS';
    if (userAgent.indexOf('Linux') > -1) return 'Linux';
    if (userAgent.indexOf('Android') > -1) return 'Android';
    if (userAgent.indexOf('like Mac') > -1) return 'iOS';
    return 'Other';
  }
  
  // Get device name from user agent
  static getDeviceName(): string {
    if (typeof window === 'undefined') return 'Unknown Device';
    
    const userAgent = navigator.userAgent;
    let deviceName = 'Unknown Device';
    
    // Detect device type
    if (/Mobile|Android|iPhone|iPad|iPod/i.test(userAgent)) {
      if (/iPhone|iPad|iPod/i.test(userAgent)) {
        deviceName = 'iOS Device';
      } else if (/Android/i.test(userAgent)) {
        deviceName = 'Android Device';
      } else {
        deviceName = 'Mobile Device';
      }
    } else if (/Windows/i.test(userAgent)) {
      deviceName = 'Windows PC';
    } else if (/Mac/i.test(userAgent)) {
      deviceName = 'Mac';
    } else if (/Linux/i.test(userAgent)) {
      deviceName = 'Linux PC';
    }
    
    // Add browser info
    if (/Chrome/i.test(userAgent)) {
      deviceName += ' (Chrome)';
    } else if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) {
      deviceName += ' (Safari)';
    } else if (/Firefox/i.test(userAgent)) {
      deviceName += ' (Firefox)';
    } else if (/Edge/i.test(userAgent)) {
      deviceName += ' (Edge)';
    }
    
    return deviceName;
  }
  
  // Check and register device session
  static async registerDevice(userId: string): Promise<{ allowed: boolean; message?: string }> {
    try {
      const deviceId = this.getDeviceId();
      const deviceName = this.getDeviceName();
      
      // Get user's device sessions
      const sessionsRef = collection(db, this.SESSION_COLLECTION, userId, 'devices');
      const sessionsQuery = query(
        sessionsRef,
        orderBy('lastActive', 'desc')
      );
      
      const snapshot = await getDocs(sessionsQuery);
      const sessions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as DeviceSession & { id: string }));
      
      // Check if current device already has a session
      const existingSession = sessions.find(s => s.deviceId === deviceId);
      
      if (existingSession) {
        // Update last active time
        await setDoc(doc(sessionsRef, existingSession.id), {
          ...existingSession,
          lastActive: serverTimestamp()
        });
        return { allowed: true };
      }
      
      // Check if user has reached device limit
      if (sessions.length >= this.MAX_DEVICES) {
        // Get the oldest session
        const oldestSession = sessions[sessions.length - 1];
        const sessionAge = Date.now() - oldestSession.lastActive.toMillis();
        const hoursSinceActive = sessionAge / (1000 * 60 * 60);
        
        // If oldest session is more than 24 hours old, remove it
        if (hoursSinceActive > 24) {
          await deleteDoc(doc(sessionsRef, oldestSession.id));
        } else {
          // Return device names for user to choose which to sign out
          const deviceList = sessions.map(s => s.deviceName).join(', ');
          return {
            allowed: false,
            message: `You have reached the maximum of ${this.MAX_DEVICES} devices. Currently signed in on: ${deviceList}. Please sign out from one device to continue.`
          };
        }
      }
      
      // Register new device session
      const newSession = {
        deviceId,
        deviceName,
        lastActive: serverTimestamp() as Timestamp,
        createdAt: serverTimestamp() as Timestamp,
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
        userId,
        id: deviceId,
        deviceType: this.getDeviceType(),
        browser: this.getBrowserName(),
        os: this.getOSName(),
        ipAddress: undefined
      };
      
      await setDoc(doc(sessionsRef, deviceId), newSession);
      
      return { allowed: true };
    } catch (error) {
      console.error('Error registering device:', error);
      // Allow access if there's an error to not block users
      return { allowed: true };
    }
  }
  
  // Remove device session on logout
  static async removeDevice(userId: string): Promise<void> {
    try {
      const deviceId = this.getDeviceId();
      const sessionsRef = collection(db, this.SESSION_COLLECTION, userId, 'devices');
      await deleteDoc(doc(sessionsRef, deviceId));
    } catch (error) {
      console.error('Error removing device session:', error);
    }
  }
  
  // Get all active devices for a user
  static async getUserDevices(userId: string): Promise<DeviceSession[]> {
    try {
      const sessionsRef = collection(db, this.SESSION_COLLECTION, userId, 'devices');
      const sessionsQuery = query(
        sessionsRef,
        orderBy('lastActive', 'desc')
      );
      
      const snapshot = await getDocs(sessionsQuery);
      return snapshot.docs.map(doc => doc.data() as DeviceSession);
    } catch (error) {
      console.error('Error getting user devices:', error);
      return [];
    }
  }
  
  // Force sign out a specific device
  static async forceSignOutDevice(userId: string, deviceId: string): Promise<void> {
    try {
      const sessionsRef = collection(db, this.SESSION_COLLECTION, userId, 'devices');
      await deleteDoc(doc(sessionsRef, deviceId));
    } catch (error) {
      console.error('Error forcing device sign out:', error);
    }
  }
}