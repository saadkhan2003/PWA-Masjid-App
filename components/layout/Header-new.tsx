'use client';

import { useAppStore } from '@/lib/stores/app';
import { Wifi, WifiOff, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const { isOnline } = useAppStore();

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 fixed top-0 left-0 right-0 z-30 md:pl-64 safe-area-top h-16 md:h-16">
      <div className="flex items-center justify-between h-full max-w-full">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="md:hidden p-2 touch-target hover:bg-gray-100 active:bg-gray-200 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </Button>
          
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <div className="w-8 h-8 bg-islamic-green rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">🕌</span>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg md:text-xl font-semibold text-gray-900 truncate">
                Mosque Committee
              </h1>
              <p className="text-xs md:text-sm text-gray-500 truncate hidden sm:block">
                Management System
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
          {/* Network Status */}
          <div className="flex items-center space-x-1">
            {isOnline ? (
              <div className="flex items-center text-green-600">
                <Wifi className="w-4 h-4" />
                <span className="text-xs font-medium hidden md:inline ml-1">Online</span>
              </div>
            ) : (
              <div className="flex items-center text-red-600">
                <WifiOff className="w-4 h-4" />
                <span className="text-xs font-medium hidden md:inline ml-1">Offline</span>
              </div>
            )}
          </div>

          {/* Current Time - Islamic Style - Hidden on small screens */}
          <div className="text-xs md:text-sm text-gray-600 hidden lg:block">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric'
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
