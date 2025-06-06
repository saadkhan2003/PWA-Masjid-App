// Database cleanup utility
// This utility provides functions to safely remove mock/test data

import { supabase } from '@/lib/supabase/client';

export const databaseCleanup = {
  // Check what data exists
  async checkDataStats() {
    try {
      const [membersResult, paymentsResult, debtsResult] = await Promise.all([
        supabase.from('members').select('*', { count: 'exact', head: true }),
        supabase.from('payments').select('*', { count: 'exact', head: true }),
        supabase.from('debts').select('*', { count: 'exact', head: true })
      ]);

      return {
        members: membersResult.count || 0,
        payments: paymentsResult.count || 0,
        debts: debtsResult.count || 0
      };
    } catch (error) {
      console.error('Error checking data stats:', error);
      throw error;
    }
  },

  // Get sample data to verify it's mock data
  async getSampleData() {
    try {
      const [membersResult, paymentsResult, debtsResult] = await Promise.all([
        supabase.from('members').select('id, name, phone, email, created_at').limit(5),
        supabase.from('payments').select('id, member_id, amount, payment_date, created_at').limit(5),
        supabase.from('debts').select('id, member_id, amount, month, year, created_at').limit(5)
      ]);

      return {
        members: membersResult.data || [],
        payments: paymentsResult.data || [],
        debts: debtsResult.data || []
      };
    } catch (error) {
      console.error('Error getting sample data:', error);
      throw error;
    }
  },

  // Clear all payments
  async clearPayments() {
    try {
      const { error } = await supabase
        .from('payments')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
      
      if (error) throw error;
      return { success: true, message: 'All payments cleared successfully' };
    } catch (error) {
      console.error('Error clearing payments:', error);
      throw error;
    }
  },

  // Clear all debts
  async clearDebts() {
    try {
      const { error } = await supabase
        .from('debts')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
      
      if (error) throw error;
      return { success: true, message: 'All debts cleared successfully' };
    } catch (error) {
      console.error('Error clearing debts:', error);
      throw error;
    }
  },

  // Clear all members (WARNING: This will also clear related payments and debts due to foreign keys)
  async clearMembers() {
    try {
      const { error } = await supabase
        .from('members')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
      
      if (error) throw error;
      return { success: true, message: 'All members cleared successfully' };
    } catch (error) {
      console.error('Error clearing members:', error);
      throw error;
    }
  },

  // Clear all data in proper order (payments -> debts -> members)
  async clearAllData() {
    try {
      console.log('Starting database cleanup...');
      
      // Clear payments first
      await this.clearPayments();
      console.log('Payments cleared');
      
      // Clear debts
      await this.clearDebts();
      console.log('Debts cleared');
      
      // Clear members last
      await this.clearMembers();
      console.log('Members cleared');
      
      return { 
        success: true, 
        message: 'All data cleared successfully. Database is now clean.' 
      };
    } catch (error) {
      console.error('Error during complete cleanup:', error);
      throw error;
    }
  },

  // Clear only specific mock data patterns (safer option)
  async clearMockData() {
    try {
      console.log('Clearing mock data...');
      
      // Clear members with mock patterns (e.g., names starting with "Test" or "Mock")
      const { error: memberError } = await supabase
        .from('members')
        .delete()
        .or('name.ilike.%test%,name.ilike.%mock%,name.ilike.%example%,name.ilike.%demo%');
      
      if (memberError && memberError.code !== 'PGRST116') { // PGRST116 = no rows found
        throw memberError;
      }
      
      return { 
        success: true, 
        message: 'Mock data patterns cleared successfully' 
      };
    } catch (error) {
      console.error('Error clearing mock data:', error);
      throw error;
    }
  }
};

// Helper function to confirm cleanup action
export const confirmCleanup = async (action: 'all' | 'payments' | 'debts' | 'members' | 'mock') => {
  const stats = await databaseCleanup.checkDataStats();
  
  const messages = {
    all: `This will delete ALL data:\n- ${stats.members} members\n- ${stats.payments} payments\n- ${stats.debts} debts\n\nThis action cannot be undone!`,
    payments: `This will delete ${stats.payments} payments. This action cannot be undone!`,
    debts: `This will delete ${stats.debts} debts. This action cannot be undone!`,
    members: `This will delete ${stats.members} members and ALL related data. This action cannot be undone!`,
    mock: `This will delete members with mock/test patterns in their names and related data.`
  };
  
  return window.confirm(messages[action]);
};

// Database schema verification and fix utilities
export const schemaVerification = {
  // Check if required columns exist
  async checkDebtsSchema() {
    try {
      const { data, error } = await supabase
        .from('debts')
        .select('month, year, type')
        .limit(1);
      
      if (error) {
        if (error.message.includes("Could not find the 'month' column") || 
            error.message.includes("Could not find the 'year' column") ||
            error.message.includes("Could not find the 'type' column")) {
          return {
            valid: false,
            message: 'Missing required columns: month, year, or type',
            error: error.message
          };
        }
        throw error;
      }
      
      return {
        valid: true,
        message: 'Debts table schema is correct'
      };
    } catch (error) {
      return {
        valid: false,
        message: 'Error checking schema',
        error: error
      };
    }
  },

  // Attempt to fix schema by adding missing columns
  async fixDebtsSchema() {
    try {
      // This would require admin privileges and custom function in Supabase
      // For now, we'll return instructions
      return {
        success: false,
        message: 'Schema fix requires manual SQL execution in Supabase dashboard',
        instructions: `
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the SQL script: fix-debts-schema.sql
4. This will add the missing month, year, and type columns
        `
      };
    } catch (error) {
      console.error('Error fixing schema:', error);
      throw error;
    }
  }
};
