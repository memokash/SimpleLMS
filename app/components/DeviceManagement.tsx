'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { DeviceManager } from '../../lib/deviceManager';
import { Smartphone, Monitor, Tablet, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

interface Device {
  deviceId: string;
  deviceName: string;
  lastActive: Timestamp;
  isCurrentDevice: boolean;
}

export default function DeviceManagement() {
  const { user } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      loadDevices();
    }
  }, [user]);

  const loadDevices = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userDevices = await DeviceManager.getUserDevices(user.uid);
      const currentDeviceId = DeviceManager.getDeviceId();
      
      const devicesWithCurrent = userDevices.map(device => ({
        ...device,
        isCurrentDevice: device.deviceId === currentDeviceId
      }));
      
      setDevices(devicesWithCurrent);
    } catch (error) {
      console.error('Error loading devices:', error);
      setMessage({ type: 'error', text: 'Failed to load devices' });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDevice = async (deviceId: string) => {
    if (!user) return;
    
    try {
      await DeviceManager.forceSignOutDevice(user.uid, deviceId);
      setMessage({ type: 'success', text: 'Device removed successfully' });
      loadDevices();
    } catch (error) {
      console.error('Error removing device:', error);
      setMessage({ type: 'error', text: 'Failed to remove device' });
    }
  };

  const getDeviceIcon = (deviceName: string) => {
    if (deviceName.includes('Mobile') || deviceName.includes('Android') || deviceName.includes('iOS')) {
      return <Smartphone className="w-5 h-5" />;
    } else if (deviceName.includes('Tablet') || deviceName.includes('iPad')) {
      return <Tablet className="w-5 h-5" />;
    } else {
      return <Monitor className="w-5 h-5" />;
    }
  };

  const formatLastActive = (timestamp: Timestamp) => {
    const date = timestamp.toDate();
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Device Management
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          You can sign in on up to 2 devices at the same time. Manage your active sessions below.
        </p>
      </div>

      {message && (
        <div className={`mb-4 p-4 rounded-lg flex items-center space-x-2 ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {devices.map(device => (
            <div
              key={device.deviceId}
              className={`p-4 rounded-lg border transition-all ${
                device.isCurrentDevice
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    device.isCurrentDevice
                      ? 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300'
                      : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                  }`}>
                    {getDeviceIcon(device.deviceName)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {device.deviceName}
                      </p>
                      {device.isCurrentDevice && (
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Last active: {formatLastActive(device.lastActive)}
                    </p>
                  </div>
                </div>
                
                {!device.isCurrentDevice && (
                  <button
                    onClick={() => handleRemoveDevice(device.deviceId)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    aria-label="Remove device"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {devices.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No active devices found
            </div>
          )}
          
          <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div className="text-sm text-amber-700 dark:text-amber-300">
                <p className="font-medium mb-1">Device Limit: 2 devices maximum</p>
                <p>If you reach the limit, you'll need to sign out from one device before signing in on another.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}