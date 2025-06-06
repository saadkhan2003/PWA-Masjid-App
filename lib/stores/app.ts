import { create } from 'zustand';
import { AppState, DashboardStats } from '@/types/app';
import { getDashboardStats } from '@/lib/supabase/queries';
import { syncManager } from '@/lib/offline/sync';

interface AppStore extends AppState {
  // Dashboard stats
  dashboardStats: DashboardStats | null;
  
  // Actions
  setOnlineStatus: (isOnline: boolean) => void;
  setInstallPromptEvent: (event: any) => void;
  setShowInstallPrompt: (show: boolean) => void;
  hideInstallPrompt: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchDashboardStats: () => Promise<void>;
  initializeApp: () => Promise<void>;
  installPWA: () => Promise<void>;
}

export const useAppStore = create<AppStore>((set, get) => ({
  // State
  isOnline: true,
  installPromptEvent: null,
  showInstallPrompt: false,
  isLoading: false,
  error: null,
  dashboardStats: null,

  // Actions
  setOnlineStatus: (isOnline) => set({ isOnline }),
  
  setInstallPromptEvent: (event) => {
    set({ 
      installPromptEvent: event,
      showInstallPrompt: true 
    });
  },
  
  setShowInstallPrompt: (show) => set({ showInstallPrompt: show }),
  
  hideInstallPrompt: () => set({ showInstallPrompt: false }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  fetchDashboardStats: async () => {
    try {
      const stats = await getDashboardStats();
      set({ dashboardStats: stats });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      set({ error: 'Failed to load dashboard statistics' });
    }
  },

  initializeApp: async () => {
    set({ isLoading: true });
    
    try {
      // Initialize offline storage
      await import('@/lib/offline/storage').then(({ initDB }) => initDB());
      
      // Setup network status
      if (typeof window !== 'undefined') {
        const updateOnlineStatus = () => {
          const isOnline = navigator.onLine;
          set({ isOnline });
          
          if (isOnline) {
            syncManager.syncAll();
          }
        };
        
        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
        updateOnlineStatus();
        
        // Setup PWA install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
          e.preventDefault();
          get().setInstallPromptEvent(e);
        });
      }
      
      // Fetch initial data
      await get().fetchDashboardStats();
      
    } catch (error) {
      console.error('Failed to initialize app:', error);
      set({ error: 'Failed to initialize application' });
    } finally {
      set({ isLoading: false });
    }
  },

  installPWA: async () => {
    const { installPromptEvent } = get();
    
    if (installPromptEvent) {
      try {
        await installPromptEvent.prompt();
        const result = await installPromptEvent.userChoice;
        
        if (result.outcome === 'accepted') {
          console.log('PWA installed successfully');
        }
        
        set({ 
          installPromptEvent: null,
          showInstallPrompt: false 
        });
      } catch (error) {
        console.error('Failed to install PWA:', error);
      }
    }
  },
}));

// Utility hooks
export const useNetworkStatus = () => {
  return useAppStore(state => state.isOnline);
};

export const useInstallPrompt = () => {
  const { showInstallPrompt, installPWA } = useAppStore();
  return { showInstallPrompt, installPWA };
};
