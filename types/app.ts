export interface Member {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  status: 'active' | 'inactive';
  join_date: string;
  monthly_dues: number;
  total_debt: number;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  member_id: string;
  amount: number;
  payment_date: string;
  month: number;
  year: number;
  notes?: string;
  receipt_number?: string;
  created_at: string;
  updated_at: string;
  member?: Member;
}

export interface Debt {
  id: string;
  member_id: string;
  amount: number;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue';
  description?: string;
  type: 'monthly_dues' | 'custom' | 'late_fee';
  month: number;
  year: number;
  created_at: string;
  updated_at: string;
  member?: Member;
}

export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  monthlyCollection: number;
  outstandingDebts: number;
  recentPayments: Payment[];
  overdueDebts: Debt[];
}

export interface OfflineOperation {
  id?: number;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  table: 'members' | 'payments' | 'debts';
  data: any;
  timestamp: string;
  synced: boolean;
}

export interface AppState {
  isOnline: boolean;
  installPromptEvent: any;
  showInstallPrompt: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AppSettings {
  id?: number;
  masjid_name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  imam_name: string;
  monthly_dues_amount: number;
  late_payment_fee: number;
  grace_period_days: number;
  auto_generate_debts: boolean;
  reminder_days: number;
  reminder_method: 'sms' | 'whatsapp' | 'both';
  email_notifications: boolean;
  sms_notifications: boolean;
  whatsapp_notifications: boolean;
  payment_reminders: boolean;
  debt_alerts: boolean;
  currency: string;
  theme: 'light' | 'dark' | 'auto';
  primary_color: string;
  created_at?: string;
  updated_at?: string;
}
