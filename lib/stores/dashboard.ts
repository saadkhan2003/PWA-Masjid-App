import { create } from 'zustand';
import { DashboardStats } from '@/types/app';
import { getDashboardStats } from '@/lib/supabase/queries';
import { syncManager } from '@/lib/offline/sync';

interface DashboardState {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  
  // Actions
  fetchDashboardData: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  stats: null,
  loading: false,
  error: null,
  lastUpdated: null,

  fetchDashboardData: async () => {
    set({ loading: true, error: null });
    
    try {
      if (syncManager.getNetworkStatus()) {
        // Online: fetch fresh data
        const stats = await getDashboardStats();
        set({ 
          stats, 
          loading: false, 
          lastUpdated: new Date() 
        });
      } else {
        // Offline: show cached message
        set({ 
          error: 'Offline mode - showing cached data',
          loading: false 
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      set({ 
        error: 'Failed to load dashboard data. Please try again.',
        loading: false 
      });
    }
  },

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
