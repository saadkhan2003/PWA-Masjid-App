import { supabase } from './client';
import { Member, Payment, Debt, DashboardStats, AppSettings } from '@/types/app';

// Members queries
export const membersQueries = {
  getAll: async (): Promise<Member[]> => {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  getById: async (id: string): Promise<Member | null> => {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  create: async (member: Omit<Member, 'id' | 'created_at' | 'updated_at'>): Promise<Member> => {
    const { data, error } = await supabase
      .from('members')
      .insert(member)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  update: async (id: string, updates: Partial<Member>): Promise<Member> => {
    const { data, error } = await supabase
      .from('members')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  search: async (query: string): Promise<Member[]> => {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .or(`name.ilike.%${query}%, phone.ilike.%${query}%`)
      .order('name');
    
    if (error) throw error;
    return data || [];
  }
};

// Payments queries
export const paymentsQueries = {
  getAll: async (): Promise<Payment[]> => {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        member:members(*)
      `)
      .order('payment_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  getByMember: async (memberId: string): Promise<Payment[]> => {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('member_id', memberId)
      .order('payment_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  create: async (payment: Omit<Payment, 'id' | 'created_at' | 'updated_at'>): Promise<Payment> => {
    const { data, error } = await supabase
      .from('payments')
      .insert(payment)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  update: async (id: string, updates: Partial<Payment>): Promise<Payment> => {
    const { data, error } = await supabase
      .from('payments')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  getMonthlyStats: async (year: number, month: number) => {
    const { data, error } = await supabase
      .from('payments')
      .select('amount')
      .eq('year', year)
      .eq('month', month);
    
    if (error) throw error;
    return data?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
  },

  getRecent: async (limit: number = 10): Promise<Payment[]> => {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        member:members(name)
      `)
      .order('payment_date', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  }
};

// Debts queries
export const debtsQueries = {
  getAll: async (): Promise<Debt[]> => {
    const { data, error } = await supabase
      .from('debts')
      .select(`
        *,
        member:members(*)
      `)
      .order('due_date');
    
    if (error) throw error;
    return data || [];
  },

  getOverdue: async (): Promise<Debt[]> => {
    const { data, error } = await supabase
      .from('debts')
      .select(`
        *,
        member:members(name)
      `)
      .eq('status', 'overdue')
      .order('due_date');
    
    if (error) throw error;
    return data || [];
  },

  create: async (debt: Omit<Debt, 'id' | 'created_at' | 'updated_at'>): Promise<Debt> => {
    const { data, error } = await supabase
      .from('debts')
      .insert(debt)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  updateStatus: async (id: string, status: Debt['status']): Promise<Debt> => {
    const { data, error } = await supabase
      .from('debts')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Dashboard stats
export const getDashboardStats = async (): Promise<DashboardStats> => {
  // Get all data needed for dashboard in parallel
  const [members, payments, overdueDebts, allDebts] = await Promise.all([
    membersQueries.getAll(),
    paymentsQueries.getRecent(10), // Get more payments for better stats
    debtsQueries.getOverdue(),
    debtsQueries.getAll()
  ]);

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const monthlyCollection = await paymentsQueries.getMonthlyStats(currentYear, currentMonth);

  // Calculate total outstanding debts (including pending, not just overdue)
  const outstandingDebts = allDebts
    .filter(debt => debt.status !== 'paid')
    .reduce((sum, debt) => sum + debt.amount, 0);

  return {
    totalMembers: members.length,
    activeMembers: members.filter(m => m.status === 'active').length,
    monthlyCollection,
    outstandingDebts,
    recentPayments: payments,
    overdueDebts
  };
};

// Settings queries
export const settingsQueries = {
  get: async (): Promise<AppSettings | null> => {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .single();
    
    if (error) throw error;
    return data;
  },

  save: async (settings: Partial<AppSettings>): Promise<AppSettings> => {
    // Try to update first (assuming one settings record exists)
    let { data, error } = await supabase
      .from('settings')
      .update({
        ...settings,
        updated_at: new Date().toISOString()
      })
      .eq('id', 1) // Assuming settings record has ID 1
      .select()
      .single();

    // If no record exists, create one
    if (error && error.code === 'PGRST116') { // Row not found error
      const { data: newData, error: insertError } = await supabase
        .from('settings')
        .insert({
          ...settings,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) throw insertError;
      data = newData;
    } else if (error) {
      throw error;
    }

    return data;
  }
};
