import { create } from 'zustand';
import { Payment } from '@/types/app';
import { paymentsQueries } from '@/lib/supabase/queries';
import { offlineStorage, cacheManager } from '@/lib/offline/storage';
import { syncManager } from '@/lib/offline/sync';
import { processPayment, updateMemberTotalDebt } from '@/lib/utils/debt-automation';

interface PaymentsState {
  payments: Payment[];
  loading: boolean;
  error: string | null;
  filterMonth: number | null;
  filterYear: number | null;
  filterMemberId: string | null;
  
  // Actions
  fetchPayments: () => Promise<void>;
  addPayment: (payment: Omit<Payment, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updatePayment: (id: string, updates: Partial<Payment>) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
  setFilters: (filters: { month?: number | null; year?: number | null; memberId?: string | null }) => void;
  setPayments: (payments: Payment[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const usePaymentsStore = create<PaymentsState>((set, get) => ({
  payments: [],
  loading: false,
  error: null,
  filterMonth: null,
  filterYear: null,
  filterMemberId: null,

  fetchPayments: async () => {
    set({ loading: true, error: null });
    
    try {
      let payments: Payment[] = [];
      
      if (syncManager.getNetworkStatus()) {
        // Online: fetch from server
        payments = await paymentsQueries.getAll();
        // Cache for offline use
        await offlineStorage.payments.sync(payments);
        await cacheManager.markSynced('payments');
      } else {
        // Offline: fetch from local storage
        payments = await offlineStorage.payments.getAll();
      }
      
      set({ payments, loading: false });
    } catch (error) {
      console.error('Failed to fetch payments:', error);
      set({ 
        error: 'Failed to fetch payments. Please try again.',
        loading: false 
      });
      
      // Try to load from cache on error
      try {
        const cachedPayments = await offlineStorage.payments.getAll();
        set({ payments: cachedPayments });
      } catch (cacheError) {
        console.error('Failed to load cached payments:', cacheError);
      }
    }
  },

  addPayment: async (paymentData) => {
    try {
      const newPayment = {
        ...paymentData,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Payment;

      if (syncManager.getNetworkStatus()) {
        // Online: save to server
        const savedPayment = await paymentsQueries.create(paymentData);
        set(state => ({
          payments: [savedPayment, ...state.payments]
        }));
        
        // Process payment against member's debts
        try {
          await processPayment(
            savedPayment.member_id, 
            savedPayment.amount, 
            savedPayment.payment_date
          );
          console.log(`Payment processed against debts for member ${savedPayment.member_id}`);
        } catch (debtError) {
          console.error('Failed to process payment against debts:', debtError);
          // Attempt direct debt recalculation as fallback
          try {
            await updateMemberTotalDebt(savedPayment.member_id);
            console.log(`Direct debt recalculation for member ${savedPayment.member_id}`);
          } catch (updateError) {
            console.error('Failed direct debt recalculation:', updateError);
          }
        }
        
        // Update local cache
        await offlineStorage.payments.put(savedPayment);
      } else {
        // Offline: save locally and queue for sync
        await offlineStorage.payments.put(newPayment);
        
        // Add special flag to indicate debt processing is needed on sync
        await syncManager.addOfflineOperation('CREATE', 'payments', {
          ...paymentData, 
          _needsDebtProcessing: true
        });
        
        set(state => ({
          payments: [newPayment, ...state.payments]
        }));
        
        // Note in console that debt processing will occur when online
        console.log(`Payment queued offline. Debt processing for member ${newPayment.member_id} will occur when online.`);
      }
    } catch (error) {
      console.error('Failed to add payment:', error);
      set({ error: 'Failed to add payment. Please try again.' });
    }
  },

  updatePayment: async (id, updates) => {
    try {
      if (syncManager.getNetworkStatus()) {
        // Online: update on server
        const updatedPayment = await paymentsQueries.update(id, updates);
        
        set(state => ({
          payments: state.payments.map(payment =>
            payment.id === id ? updatedPayment : payment
          )
        }));
        
        // If payment amount changed, reprocess payment against debts
        if (updates.amount !== undefined) {
          try {
            await processPayment(
              updatedPayment.member_id, 
              updatedPayment.amount, 
              updatedPayment.payment_date
            );
            console.log(`Updated payment processed against debts for member ${updatedPayment.member_id}`);
          } catch (debtError) {
            console.error('Failed to reprocess payment against debts:', debtError);
          }
        }
        
        // Update local cache
        await offlineStorage.payments.put(updatedPayment);
      } else {
        // Offline: update locally and queue for sync
        const currentPayment = get().payments.find(p => p.id === id);
        if (currentPayment) {
          const updatedPayment = {
            ...currentPayment,
            ...updates,
            updated_at: new Date().toISOString()
          };
          
          await offlineStorage.payments.put(updatedPayment);
          await syncManager.addOfflineOperation('UPDATE', 'payments', { id, ...updates });
          
          set(state => ({
            payments: state.payments.map(payment =>
              payment.id === id ? updatedPayment : payment
            )
          }));
        }
      }
    } catch (error) {
      console.error('Failed to update payment:', error);
      set({ error: 'Failed to update payment. Please try again.' });
    }
  },

  deletePayment: async (id) => {
    try {
      const paymentToDelete = get().payments.find(p => p.id === id);
      let memberId: string | undefined;
      
      if (syncManager.getNetworkStatus()) {
        // Online: delete from server
        await paymentsQueries.delete(id);
        await offlineStorage.payments.delete(id);
        
        // Save member ID for debt recalculation
        if (paymentToDelete) {
          memberId = paymentToDelete.member_id;
        }
      } else {
        // Offline: delete locally and queue for sync
        if (paymentToDelete) {
          memberId = paymentToDelete.member_id;
        }
        await offlineStorage.payments.delete(id);
        await syncManager.addOfflineOperation('DELETE', 'payments', { id });
      }
      
      set(state => ({
        payments: state.payments.filter(payment => payment.id !== id)
      }));
      
      // Recalculate member's debt after payment deletion
      if (memberId && syncManager.getNetworkStatus()) {
        try {
          // Use the imported updateMemberTotalDebt function
          await updateMemberTotalDebt(memberId);
          console.log(`Recalculated debt for member ${memberId} after payment deletion`);
        } catch (debtError) {
          console.error('Failed to recalculate debt after payment deletion:', debtError);
        }
      }
    } catch (error) {
      console.error('Failed to delete payment:', error);
      set({ error: 'Failed to delete payment. Please try again.' });
    }
  },

  setFilters: (filters) => {
    set(state => ({
      filterMonth: filters.month !== undefined ? filters.month : state.filterMonth,
      filterYear: filters.year !== undefined ? filters.year : state.filterYear,
      filterMemberId: filters.memberId !== undefined ? filters.memberId : state.filterMemberId,
    }));
  },

  setPayments: (payments) => set({ payments }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));

// Computed selectors
export const useFilteredPayments = () => {
  const { payments, filterMonth, filterYear, filterMemberId } = usePaymentsStore();
  
  return payments.filter(payment => {
    const matchesMonth = filterMonth === null || payment.month === filterMonth;
    const matchesYear = filterYear === null || payment.year === filterYear;
    const matchesMember = filterMemberId === null || payment.member_id === filterMemberId;
    
    return matchesMonth && matchesYear && matchesMember;
  });
};

export const useMonthlyStats = (year: number, month: number) => {
  const payments = usePaymentsStore(state => state.payments);
  
  const monthlyPayments = payments.filter(payment => 
    payment.year === year && payment.month === month
  );
  
  return {
    totalAmount: monthlyPayments.reduce((sum, payment) => sum + payment.amount, 0),
    paymentCount: monthlyPayments.length,
    uniqueMembers: new Set(monthlyPayments.map(p => p.member_id)).size,
  };
};
