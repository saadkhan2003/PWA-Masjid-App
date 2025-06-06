'use client';

import { useAppStore } from '@/lib/stores/app';

export function OfflineIndicator() {
  const { isOnline } = useAppStore();

  if (isOnline) return null;

  return (
    <div className="offline-indicator show">
      <p className="text-sm font-medium">
        📵 You're offline. Changes will sync when you're back online.
      </p>
    </div>
  );
}
