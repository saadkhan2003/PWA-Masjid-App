'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/lib/stores/app';
import { syncManager } from '@/lib/offline/sync';

interface PWAProviderProps {
  children: React.ReactNode;
}

export function PWAProvider({ children }: PWAProviderProps) {
  const { 
    setOnlineStatus, 
    setInstallPromptEvent, 
    setShowInstallPrompt,
    hideInstallPrompt 
  } = useAppStore();

  useEffect(() => {
    // Set initial online status
    setOnlineStatus(navigator.onLine);

    // Network status listeners
    const handleOnline = () => {
      setOnlineStatus(true);
      syncManager.syncAll(); // Sync when coming back online
    };

    const handleOffline = () => {
      setOnlineStatus(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPromptEvent(e);
      
      // Check if user previously dismissed the prompt
      const dismissed = localStorage.getItem('installPromptDismissed');
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      
      if (!dismissed || parseInt(dismissed) < sevenDaysAgo) {
        // Show prompt after a short delay
        setTimeout(() => {
          setShowInstallPrompt(true);
        }, 3000);
      }
    };

    // App installed handler
    const handleAppInstalled = () => {
      console.log('PWA was installed');
      hideInstallPrompt();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Initialize sync manager and offline storage
    syncManager.syncAll();

    // Service worker registration
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [setOnlineStatus, setInstallPromptEvent, setShowInstallPrompt, hideInstallPrompt]);

  return <>{children}</>;
}
