'use client';

import { useAppStore } from '@/lib/stores/app';
import { Wifi, WifiOff } from 'lucide-react';
import { urduTranslations } from '@/lib/utils/urdu-translations';

export function Header() {
  const { isOnline } = useAppStore();

  return (
    <header className="mobile-header bg-white border-b border-gray-200 px-4 py-3 fixed top-0 left-0 right-0 z-30 md:pr-64 safe-area-top h-16 md:h-16">
      <div className="flex items-center justify-between h-full max-w-full flex-rtl">
        <div className="flex items-center space-x-3 flex-1 min-w-0 flex-rtl mr-4 md:mr-6">
          <div className="flex items-center space-x-3 min-w-0 flex-1 flex-rtl">
            <div className="w-10 h-10 md:w-8 md:h-8 bg-gradient-to-br from-islamic-green to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="text-white font-bold text-lg md:text-sm">🕌</span>
            </div>
            <div className="min-w-0 flex-1 flex-rtl-col">
              <h1 className="mobile-subheading md:text-xl text-gray-900 truncate urdu-heading">
                {urduTranslations.headers.mosqueCommittee}
              </h1>
              <p className="mobile-body md:text-sm text-gray-500 truncate hidden sm:block urdu-text">
                {urduTranslations.headers.managementSystem}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 md:space-x-4 flex-shrink-0 flex-rtl">
          {/* Enhanced Network Status */}
          <div className="flex items-center space-x-1 flex-rtl">
            {isOnline ? (
              <div className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded-lg flex-rtl">
                <Wifi className="w-4 h-4" />
                <span className="text-xs font-medium hidden md:inline mr-1 urdu-text">آن لائن</span>
              </div>
            ) : (
              <div className="flex items-center text-red-600 bg-red-50 px-2 py-1 rounded-lg flex-rtl">
                <WifiOff className="w-4 h-4" />
                <span className="text-xs font-medium hidden md:inline mr-1 urdu-text">آف لائن</span>
              </div>
            )}
          </div>

          {/* Professional Date Display - in Urdu */}
          <div className="text-xs md:text-sm text-gray-600 hidden lg:flex items-center bg-gray-50 px-3 py-2 rounded-lg">
            <div className="text-center flex-rtl-col">
              <div className="font-semibold urdu-text">
                {new Date().toLocaleDateString('ur-PK', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
              <div className="text-[10px] text-gray-500 ltr-numbers">
                {new Date().toLocaleDateString('ur-PK', { year: 'numeric' })}
              </div>
            </div>
          </div>
          
          {/* Mobile Time Display */}
          <div className="lg:hidden text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-lg">
            <span className="urdu-text">
              {new Date().toLocaleDateString('ur-PK', { 
                month: 'short', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
