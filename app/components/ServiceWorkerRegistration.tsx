'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/service-worker.js')
          .then((registration) => {
            console.log('Service Worker registered successfully:', registration.scope);
            
            // Check for updates periodically
            setInterval(() => {
              registration.update();
            }, 60000); // Check every minute
            
            // Handle updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New content is available
                    if (confirm('New content is available! Would you like to refresh?')) {
                      window.location.reload();
                    }
                  }
                });
              }
            });
          })
          .catch((error) => {
            console.error('Service Worker registration failed:', error);
          });
      });
      
      // Handle offline/online events
      window.addEventListener('online', () => {
        console.log('Back online! Syncing data...');
        // Trigger background sync
        navigator.serviceWorker.ready.then((registration) => {
          if ('sync' in registration) {
            return registration.sync.register('sync-patient-data');
          }
        });
      });
      
      window.addEventListener('offline', () => {
        console.log('Working offline - all changes will be synced when connection is restored.');
      });
    }
  }, []);
  
  return null;
}