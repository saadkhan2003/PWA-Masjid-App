import { create } from 'zustand';
import { Debt } from '@/types/app';
import { debtsQueries } from '@/lib/supabase/queries';
import { offlineStorage, cacheManager } from '@/lib/offline/storage';
import { syncManager } from '@/lib/offline/sync';
import { updateMemberTotalDebt } from '@/lib/utils/debt-automation';

interface DebtsState {
  debts: Debt[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchDebts: () => Promise<void>;
  addDebt: (debt: Omit<Debt, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateDebtStatus: (id: string, status: Debt['status']) => Promise<void>;
  getOverdueDebts: () => Debt[];
  getTotalOutstanding: () => number;
  setDebts: (debts: Debt[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useDebtsStore = create<DebtsState>((set, get) => ({
  debts: [],
  loading: false,
  error: null,

  fetchDebts: async () => {
    set({ loading: true, error: null });
    
    try {
      let debts: Debt[] = [];
      
      if (syncManager.getNetworkStatus()) {
        // Online: fetch from server
        debts = await debtsQueries.getAll();
        // Cache for offline use
        await offlineStorage.debts.sync(debts);
        await cacheManager.markSynced('debts');
      } else {
        // Offline: fetch from local storage
        debts = await offlineStorage.debts.getAll();
      }
      
      set({ debts, loading: false });
    } catch (error) {
      console.error('Failed to fetch debts:', error);
      set({ 
        error: 'Failed to fetch debts. Please try again.',
        loading: false 
      });
      
      // Try to load from cache on error
      try {
        const cachedDebts = await offlineStorage.debts.getAll();
        set({ debts: cachedDebts });
      } catch (cacheError) {
        console.error('Failed to load cached debts:', cacheError);
      }
    }
  },

  addDebt: async (debtData) => {
    try {
      const newDebt = {
        ...debtData,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Debt;

      if (syncManager.getNetworkStatus()) {
        // Online: save to server
        const savedDebt = await debtsQueries.create(debtData);
        set(state => ({
          debts: [...state.debts, savedDebt]
        }));
        
        // Update local cache
        await offlineStorage.debts.put(savedDebt);
      } else {
        // Offline: save locally and queue for sync
        await offlineStorage.debts.put(newDebt);
        await syncManager.addOfflineOperation('CREATE', 'debts', debtData);
        
        set(state => ({
          debts: [...state.debts, newDebt]
        }));
      }
    } catch (error) {
      console.error('Failed to add debt:', error);
      set({ error: 'Failed to add debt. Please try again.' });
    }
  },

  updateDebtStatus: async (id, status) => {
    try {
      let updatedDebt: Debt | undefined;
      let memberId: string | undefined;

      if (syncManager.getNetworkStatus()) {
        // Online: update on server
        updatedDebt = await debtsQueries.updateStatus(id, status);
        memberId = updatedDebt.member_id;
        
        set(state => ({
          debts: state.debts.map(debt =>
            debt.id === id ? updatedDebt as Debt : debt
          )
        }));
        
        // Update local cache
        await offlineStorage.debts.put(updatedDebt);
      } else {
        // Offline: update locally and queue for sync
        const currentDebt = get().debts.find(d => d.id === id);
        if (currentDebt) {
          memberId = currentDebt.member_id;
          updatedDebt = {
            ...currentDebt,
            status,
            updated_at: new Date().toISOString()
          };
          
          await offlineStorage.debts.put(updatedDebt);
          await syncManager.addOfflineOperation('UPDATE', 'debts', { id, status });
          
          set(state => ({
            debts: state.debts.map(debt =>
              debt.id === id ? updatedDebt as Debt : debt
            )
          }));
        }
      }

      // Important fix: Update member's total debt after debt status change
      if (memberId) {
        try {
          // Use the imported function from the top of the file
          await updateMemberTotalDebt(memberId);
          console.log(`Updated total debt for member ${memberId} after marking debt ${id} as ${status}`);
        } catch (updateError) {
          console.error('Failed to update member total debt:', updateError);
        }
      }
    } catch (error) {
      console.error('Failed to update debt status:', error);
      set({ error: 'Failed to update debt status. Please try again.' });
    }
  },

  getOverdueDebts: () => {
    const { debts } = get();
    const now = new Date();
    return debts.filter(debt => 
      debt.status === 'pending' && new Date(debt.due_date) < now
    );
  },

  getTotalOutstanding: () => {
    const { debts } = get();
    return debts
      .filter(debt => debt.status === 'pending' || debt.status === 'overdue')
      .reduce((sum, debt) => sum + debt.amount, 0);
  },

  setDebts: (debts) => set({ debts }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
