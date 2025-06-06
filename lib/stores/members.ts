import { create } from 'zustand';
import { Member } from '@/types/app';
import { membersQueries } from '@/lib/supabase/queries';
import { offlineStorage, cacheManager } from '@/lib/offline/storage';
import { syncManager } from '@/lib/offline/sync';
import { MONTHLY_DUES_AMOUNT, generateHistoricalDebts, updateMemberTotalDebt } from '@/lib/utils/debt-automation';

interface MembersState {
  members: Member[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  
  // Actions
  fetchMembers: () => Promise<void>;
  addMember: (member: Omit<Member, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateMember: (id: string, updates: Partial<Member>) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
  searchMembers: (query: string) => void;
  setMembers: (members: Member[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  refreshMemberDebts: () => Promise<void>;
}

export const useMembersStore = create<MembersState>((set, get) => ({
  members: [],
  loading: false,
  error: null,
  searchQuery: '',

  fetchMembers: async () => {
    set({ loading: true, error: null });
    
    try {
      let members: Member[] = [];
      
      if (syncManager.getNetworkStatus()) {
        // Online: fetch from server
        members = await membersQueries.getAll();
        // Cache for offline use
        await offlineStorage.members.sync(members);
        await cacheManager.markSynced('members');
      } else {
        // Offline: fetch from local storage
        members = await offlineStorage.members.getAll();
      }
      
      set({ members, loading: false });
    } catch (error) {
      console.error('Failed to fetch members:', error);
      set({ 
        error: 'Failed to fetch members. Please try again.',
        loading: false 
      });
      
      // Try to load from cache on error
      try {
        const cachedMembers = await offlineStorage.members.getAll();
        set({ members: cachedMembers });
      } catch (cacheError) {
        console.error('Failed to load cached members:', cacheError);
      }
    }
  },

  addMember: async (memberData) => {
    try {
      // Ensure monthly dues defaults to ₹200 if not specified
      const memberWithDefaults = {
        ...memberData,
        monthly_dues: memberData.monthly_dues || MONTHLY_DUES_AMOUNT,
        total_debt: 0, // Will be calculated by debt automation
      };

      const newMember = {
        ...memberWithDefaults,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Member;

      if (syncManager.getNetworkStatus()) {
        // Online: save to server
        const savedMember = await membersQueries.create(memberWithDefaults);
        set(state => ({
          members: [...state.members, savedMember]
        }));
        
        // Generate historical debts for the new member
        try {
          await generateHistoricalDebts(savedMember.id);
          // Update member's total debt after generating historical debts
          await updateMemberTotalDebt(savedMember.id);
          
          // Refresh the member data to get updated total_debt
          const updatedMember = await membersQueries.getById(savedMember.id);
          if (updatedMember) {
            set(state => ({
              members: state.members.map(m => m.id === savedMember.id ? updatedMember : m)
            }));
          }
        } catch (debtError) {
          console.error('Failed to generate historical debts:', debtError);
          // Don't fail the member creation, just log the error
        }
        
        // Update local cache
        await offlineStorage.members.put(savedMember);
      } else {
        // Offline: save locally and queue for sync
        await offlineStorage.members.put(newMember);
        await syncManager.addOfflineOperation('CREATE', 'members', memberWithDefaults);
        
        set(state => ({
          members: [...state.members, newMember]
        }));
      }
    } catch (error) {
      console.error('Failed to add member:', error);
      set({ error: 'Failed to add member. Please try again.' });
    }
  },

  updateMember: async (id, updates) => {
    try {
      if (syncManager.getNetworkStatus()) {
        // Online: update on server
        const updatedMember = await membersQueries.update(id, updates);
        
        set(state => ({
          members: state.members.map(member =>
            member.id === id ? updatedMember : member
          )
        }));
        
        // If monthly_dues changed, we might need to recalculate debts
        if (updates.monthly_dues !== undefined) {
          try {
            await updateMemberTotalDebt(id);
            // Refresh member data to get updated total_debt
            const refreshedMember = await membersQueries.getById(id);
            if (refreshedMember) {
              set(state => ({
                members: state.members.map(member =>
                  member.id === id ? refreshedMember : member
                )
              }));
            }
          } catch (debtError) {
            console.error('Failed to update member debt:', debtError);
          }
        }
        
        // Update local cache
        await offlineStorage.members.put(updatedMember);
      } else {
        // Offline: update locally and queue for sync
        const currentMember = get().members.find(m => m.id === id);
        if (currentMember) {
          const updatedMember = {
            ...currentMember,
            ...updates,
            updated_at: new Date().toISOString()
          };
          
          await offlineStorage.members.put(updatedMember);
          await syncManager.addOfflineOperation('UPDATE', 'members', { id, ...updates });
          
          set(state => ({
            members: state.members.map(member =>
              member.id === id ? updatedMember : member
            )
          }));
        }
      }
    } catch (error) {
      console.error('Failed to update member:', error);
      set({ error: 'Failed to update member. Please try again.' });
    }
  },

  deleteMember: async (id) => {
    try {
      if (syncManager.getNetworkStatus()) {
        // Online: delete from server
        await membersQueries.delete(id);
        await offlineStorage.members.delete(id);
      } else {
        // Offline: delete locally and queue for sync
        await offlineStorage.members.delete(id);
        await syncManager.addOfflineOperation('DELETE', 'members', { id });
      }
      
      set(state => ({
        members: state.members.filter(member => member.id !== id)
      }));
    } catch (error) {
      console.error('Failed to delete member:', error);
      set({ error: 'Failed to delete member. Please try again.' });
    }
  },

  searchMembers: (query) => {
    set({ searchQuery: query });
  },

  refreshMemberDebts: async () => {
    try {
      const members = get().members;
      const updatedMembers = [];

      for (const member of members) {
        try {
          await updateMemberTotalDebt(member.id);
          const refreshedMember = await membersQueries.getById(member.id);
          if (refreshedMember) {
            updatedMembers.push(refreshedMember);
          } else {
            updatedMembers.push(member);
          }
        } catch (error) {
          console.error(`Failed to refresh debt for member ${member.id}:`, error);
          updatedMembers.push(member);
        }
      }

      set({ members: updatedMembers });
    } catch (error) {
      console.error('Failed to refresh member debts:', error);
      set({ error: 'Failed to refresh member debts. Please try again.' });
    }
  },

  setMembers: (members) => set({ members }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));

// Computed selectors
export const useFilteredMembers = () => {
  const { members, searchQuery } = useMembersStore();
  
  if (!searchQuery) return members;
  
  return members.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );
};

export const useActiveMembers = () => {
  const members = useMembersStore(state => state.members);
  return members.filter(member => member.status === 'active');
};
