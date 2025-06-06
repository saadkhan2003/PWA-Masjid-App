'use client';

import { create } from 'zustand';
import { AppSettings } from '@/types/app';
import { settingsQueries } from '@/lib/supabase/queries';

interface SettingsStore {
  settings: AppSettings | null;
  loading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  saveSettings: (settings: Partial<AppSettings>) => Promise<void>;
}

const defaultSettings: AppSettings = {
  masjid_name: '',
  address: '',
  phone: '',
  email: '',
  website: '',
  imam_name: '',
  monthly_dues_amount: 200,
  late_payment_fee: 50,
  grace_period_days: 7,
  auto_generate_debts: true,
  reminder_days: 7,
  reminder_method: 'sms',
  email_notifications: false,
  sms_notifications: true,
  whatsapp_notifications: false,
  payment_reminders: true,
  debt_alerts: true,
  currency: 'PKR',
  theme: 'light',
  primary_color: '#10B981'
};

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: null,
  loading: false,
  error: null,

  fetchSettings: async () => {
    try {
      set({ loading: true, error: null });
      const settings = await settingsQueries.get();
      set({ settings: settings || defaultSettings });
    } catch (error) {
      set({ error: 'Failed to load settings' });
      console.error('Error loading settings:', error);
    } finally {
      set({ loading: false });
    }
  },

  saveSettings: async (updates: Partial<AppSettings>) => {
    try {
      set({ loading: true, error: null });
      const savedSettings = await settingsQueries.save(updates);
      set({ settings: savedSettings });
    } catch (error) {
      set({ error: 'Failed to save settings' });
      console.error('Error saving settings:', error);
    } finally {
      set({ loading: false });
    }
  }
}));