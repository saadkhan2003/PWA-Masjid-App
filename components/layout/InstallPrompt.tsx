'use client';

import { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/stores/app';

export function InstallPrompt() {
  const { installPromptEvent, showInstallPrompt, hideInstallPrompt } = useAppStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(showInstallPrompt && !!installPromptEvent);
  }, [showInstallPrompt, installPromptEvent]);

  const handleInstall = async () => {
    if (!installPromptEvent) return;

    try {
      const result = await installPromptEvent.prompt();
      console.log('Install prompt result:', result);
      
      if (result.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }
      
      hideInstallPrompt();
    } catch (error) {
      console.error('Error during installation:', error);
    }
  };

  const handleDismiss = () => {
    hideInstallPrompt();
    // Hide for 7 days
    localStorage.setItem('installPromptDismissed', Date.now().toString());
  };

  if (!isVisible) return null;

  return (
    <div className="pwa-install-prompt show">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-xl">🕌</span>
          </div>
          <div>
            <h3 className="font-semibold">Install Mosque Committee App</h3>
            <p className="text-sm opacity-90">
              Install this app for a better experience with offline access
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleInstall}
            className="bg-white text-islamic-green hover:bg-gray-100"
          >
            <Download className="w-4 h-4 mr-1" />
            Install
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-white hover:bg-white/20"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
