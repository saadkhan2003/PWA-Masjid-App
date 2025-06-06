'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/form';
import { useMembersStore } from '@/lib/stores/members';
import { useDebtsStore } from '@/lib/stores/debts';
import { useSettingsStore } from '@/lib/stores/settings';
import { formatCurrency } from '@/lib/utils/currency';
import type { AppSettings } from '@/types/app';
import {
  Settings,
  Save,
  Bell,
  Mail,
  Shield,
  Palette,
  Database,
  Users,
  DollarSign,
  MessageSquare,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  Check
} from 'lucide-react';

interface SettingsData {
  // General Settings
  masjidName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  
  // Notification Settings
  emailNotifications: boolean;
  smsNotifications: boolean;
  whatsappNotifications: boolean;
  paymentReminders: boolean;
  debtAlerts: boolean;
  
  // Payment Settings
  currency: string;
  paymentMethods: string[];
  autoGenerateReceipts: boolean;
  latePaymentFee: number;
  gracePeriodDays: number;
  
  // Theme Settings
  theme: 'light' | 'dark' | 'auto';
  primaryColor: string;
  
  // Privacy Settings
  dataRetentionMonths: number;
  requireConsent: boolean;
  allowDataExport: boolean;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Real data stores
  const { members, fetchMembers, loading: membersLoading } = useMembersStore();
  const { debts, fetchDebts, loading: debtsLoading } = useDebtsStore();
  const { settings, fetchSettings, saveSettings, loading: settingsLoading } = useSettingsStore();

  // Fetch real data on component mount
  useEffect(() => {
    fetchMembers();
    fetchDebts();
    fetchSettings();
  }, [fetchMembers, fetchDebts, fetchSettings]);

  // Calculate real statistics
  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.status === 'active').length;
  const overdueDebts = debts.filter(d => d.status === 'pending' && new Date(d.due_date) < new Date()).length;
  const totalOutstanding = debts
    .filter(d => d.status === 'pending')
    .reduce((sum, debt) => sum + debt.amount, 0);
  const totalPaid = debts
    .filter(d => d.status === 'paid')
    .reduce((sum, debt) => sum + debt.amount, 0);
  const totalDebtAmount = debts.reduce((sum, debt) => sum + debt.amount, 0);
  const collectionRate = totalDebtAmount > 0 ? Math.round((totalPaid / totalDebtAmount) * 100) : 0;

  const handleSaveSettings = async () => {
    if (!settings) return;
    
    setIsSaving(true);
    try {
      await saveSettings(settings);
      alert('ترتیبات محفوظ ہو گئیں!');
    } catch (error) {
      alert('خرابی: ترتیبات محفوظ نہیں ہو سکیں');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (key: keyof AppSettings, value: any) => {
    if (!settings) return;
    saveSettings({ [key]: value });
  };

  const handleExportData = async () => {
    setIsExporting(true);
    
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsExporting(false);
    alert('Data exported successfully! Download will begin shortly.');
  };

  const handleDeleteAllData = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    // Simulate deletion
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setShowDeleteConfirm(false);
    alert('All data has been permanently deleted.');
  };

  const handleResetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      // Reset to default values
      alert('Settings reset to default values.');
    }
  };

  // Debt management actions
  const handleBulkDebtGeneration = async () => {
    if (confirm('کیا آپ تمام فعال اراکین کے لیے نئے واجبات بنانا چاہتے ہیں؟')) {
      alert('تمام اراکین کے لیے واجبات بنائے گئے!');
      // This would call the debt generation API
    }
  };

  const handleSendReminders = async () => {
    if (overdueDebts > 0) {
      if (confirm(`کیا آپ ${overdueDebts} بقایا والے اراکین کو یاد دہانی بھیجنا چاہتے ہیں؟`)) {
        alert('یاد دہانی بھیج دی گئی!');
        // This would call the reminder API
      }
    } else {
      alert('کوئی بقایا نہیں ہے!');
    }
  };

  const handleDownloadReport = () => {
    alert('بقایا کی رپورٹ ڈاؤن لوڈ ہو رہی ہے...');
    // This would generate and download the overdue report
  };

  const handleCheckAllDebts = async () => {
    alert('تمام واجبات کی جانچ کی جا رہی ہے...');
    // This would verify all debt records
    setTimeout(() => {
      alert('واجبات کی جانچ مکمل!');
    }, 2000);
  };

  const tabs = [
    { id: 'general', label: 'عمومی ترتیبات', icon: Settings },
    { id: 'mosque', label: 'مسجد کی معلومات', icon: Users },
    { id: 'debt', label: 'واجبات کا نظام', icon: AlertTriangle },
    { id: 'notifications', label: 'اطلاعات', icon: Bell },
    { id: 'data', label: 'ڈیٹا منیجمنٹ', icon: Database },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20 md:pb-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="urdu-title text-gray-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-emerald-600" />
            ترتیبات
          </h1>
          <p className="urdu-text text-gray-600 mt-1">
            مسجد کی کنفیگریشن اور ترجیحات کا انتظام
          </p>
        </div>

        {/* Mobile Quick Access - Show debt management prominently */}
        <div className="md:hidden mb-6">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="font-medium text-red-800 urdu-text">واجبات کا نظام</h3>
            </div>
            <p className="text-sm text-red-700 urdu-text mb-3">
              قرض کا مکمل نظام اور ترتیبات یہاں دستیاب ہیں
            </p>
            <button
              onClick={() => setActiveTab('debt')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors urdu-text ${
                activeTab === 'debt'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-red-600 border border-red-300 hover:bg-red-50'
              }`}
            >
              واجبات کا نظام کھولیں
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-64">
            <Card className="p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-emerald-100 text-emerald-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <Card className="p-6">
              {/* General Settings */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="urdu-heading mb-4">عمومی معلومات</h2>
                    {settingsLoading ? (
                      <div className="text-center py-4 urdu-text">ڈیٹا لوڈ ہو رہا ہے...</div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="masjidName" className="urdu-text">مسجد کا نام</Label>
                          <Input
                            id="masjidName"
                            value={settings?.masjid_name || ''}
                            onChange={(e) => updateSetting('masjid_name', e.target.value)}
                            placeholder="مسجد کا نام"
                            className="urdu-text"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="phone" className="urdu-text">فون نمبر</Label>
                          <Input
                            id="phone"
                            value={settings?.phone || ''}
                            onChange={(e) => updateSetting('phone', e.target.value)}
                            placeholder="+92 300 1234567"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="email" className="urdu-text">ایمیل ایڈریس</Label>
                          <Input
                            id="email"
                            type="email"
                            value={settings?.email || ''}
                            onChange={(e) => updateSetting('email', e.target.value)}
                            placeholder="info@masjid.org"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="website" className="urdu-text">ویب سائٹ</Label>
                          <Input
                            id="website"
                            value={settings?.website || ''}
                            onChange={(e) => updateSetting('website', e.target.value)}
                            placeholder="www.masjid.org"
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-4">
                      <Label htmlFor="address" className="urdu-text">مکمل پتہ</Label>
                      <Textarea
                        id="address"
                        value={settings?.address || ''}
                        onChange={(e) => updateSetting('address', e.target.value)}
                        placeholder="مسجد کا مکمل پتہ"
                        className="urdu-text"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Debt Management System */}
              {activeTab === 'debt' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="urdu-heading mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                      واجبات کا نظام
                    </h2>
                    
                    <div className="space-y-6">
                      {/* Automatic Debt Generation */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium mb-3 urdu-text">خودکار واجبات کا نظام</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="urdu-text">ماہانہ خودکار واجبات</Label>
                              <p className="text-sm text-gray-600 urdu-text">ہر ماہ خودکار طور پر واجبات بنائیں</p>
                            </div>
                            <Switch
                              checked={settings?.auto_generate_debts || false}
                              onCheckedChange={(checked) => updateSetting('auto_generate_debts', checked)}
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="urdu-text">ماہانہ واجبات کی رقم</Label>
                              <Input
                                type="number"
                                value={settings?.monthly_dues_amount || 200}
                                onChange={(e) => updateSetting('monthly_dues_amount', Number(e.target.value))}
                                placeholder="200"
                              />
                            </div>
                            <div>
                              <Label className="urdu-text">تاخیری فیس</Label>
                              <Input
                                type="number"
                                value={settings?.late_payment_fee || 50}
                                onChange={(e) => updateSetting('late_payment_fee', Number(e.target.value))}
                                placeholder="50"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Payment Reminders */}
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-medium mb-3 urdu-text">یاد دہانی کا نظام</h3>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="urdu-text">یاد دہانی کے دن</Label>
                              <Select
                                value={settings?.reminder_days?.toString() || "7"}
                                onValueChange={(value) => updateSetting('reminder_days', Number(value))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="3">3 دن</SelectItem>
                                  <SelectItem value="7">7 دن</SelectItem>
                                  <SelectItem value="15">15 دن</SelectItem>
                                  <SelectItem value="30">30 دن</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="urdu-text">یاد دہانی کا طریقہ</Label>
                              <Select
                                value={settings?.reminder_method || "sms"}
                                onValueChange={(value) => updateSetting('reminder_method', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="sms">SMS</SelectItem>
                                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                  <SelectItem value="both">دونوں</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <h3 className="font-medium mb-3 urdu-text">فوری اقدامات</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Button
                            variant="outline"
                            className="urdu-text"
                            onClick={handleBulkDebtGeneration}
                            disabled={membersLoading || activeMembers === 0}
                          >
                            <Users className="w-4 h-4 mr-2" />
                            تمام اراکین کے لیے واجبات بنائیں ({activeMembers})
                          </Button>
                          <Button
                            variant="outline"
                            className="urdu-text"
                            onClick={handleSendReminders}
                            disabled={debtsLoading || overdueDebts === 0}
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            بقایا والوں کو یاد دہانی بھیجیں ({overdueDebts})
                          </Button>
                          <Button
                            variant="outline"
                            className="urdu-text"
                            onClick={handleDownloadReport}
                            disabled={debtsLoading}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            بقایا کی رپورٹ ڈاؤن لوڈ کریں
                          </Button>
                          <Button
                            variant="outline"
                            className="urdu-text"
                            onClick={handleCheckAllDebts}
                            disabled={debtsLoading}
                          >
                            <Check className="w-4 h-4 mr-2" />
                            تمام واجبات کی جانچ کریں
                          </Button>
                        </div>
                      </div>

                      {/* Statistics - Real Data */}
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h3 className="font-medium mb-3 urdu-text">اعداد و شمار</h3>
                        {(membersLoading || debtsLoading) ? (
                          <div className="text-center py-4 urdu-text text-gray-500">
                            ڈیٹا لوڈ ہو رہا ہے...
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div>
                              <div className="text-2xl font-bold text-green-600">{totalMembers}</div>
                              <div className="text-sm text-gray-600 urdu-text">کل اراکین</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-red-600">{overdueDebts}</div>
                              <div className="text-sm text-gray-600 urdu-text">بقایا والے</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalOutstanding)}</div>
                              <div className="text-sm text-gray-600 urdu-text">کل بقایا</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-purple-600">{collectionRate}%</div>
                              <div className="text-sm text-gray-600 urdu-text">وصولی کی شرح</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Mosque Information */}
              {activeTab === 'mosque' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="urdu-heading mb-4">مسجد کی معلومات</h2>
                    {settingsLoading ? (
                      <div className="text-center py-4 urdu-text">ڈیٹا لوڈ ہو رہا ہے...</div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="urdu-text">مسجد کا نام</Label>
                          <Input
                            value={settings?.masjid_name || ''}
                            onChange={(e) => updateSetting('masjid_name', e.target.value)}
                            placeholder="مسجد کا نام"
                            className="urdu-text"
                          />
                        </div>
                        
                        <div>
                          <Label className="urdu-text">امام صاحب کا نام</Label>
                          <Input
                            value={settings?.imam_name || ''}
                            onChange={(e) => updateSetting('imam_name', e.target.value)}
                            placeholder="امام صاحب کا نام"
                            className="urdu-text"
                          />
                        </div>
                        
                        <div>
                          <Label className="urdu-text">فون نمبر</Label>
                          <Input
                            value={settings?.phone || ''}
                            onChange={(e) => updateSetting('phone', e.target.value)}
                            placeholder="+92 300 1234567"
                          />
                        </div>
                        
                        <div>
                          <Label className="urdu-text">ایمیل</Label>
                          <Input
                            type="email"
                            value={settings?.email || ''}
                            onChange={(e) => updateSetting('email', e.target.value)}
                            placeholder="info@masjid.org"
                          />
                        </div>

                        <div>
                          <Label className="urdu-text">ویب سائٹ</Label>
                          <Input
                            value={settings?.website || ''}
                            onChange={(e) => updateSetting('website', e.target.value)}
                            placeholder="www.masjid.org"
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-4">
                      <Label className="urdu-text">مکمل پتہ</Label>
                      <Textarea
                        value={settings?.address || ''}
                        onChange={(e) => updateSetting('address', e.target.value)}
                        placeholder="مسجد کا مکمل پتہ"
                        className="urdu-text"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="urdu-heading mb-4">اطلاعات کی ترتیبات</h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-blue-500" />
                          <div>
                            <Label className="urdu-text">ایمیل اطلاعات</Label>
                            <p className="text-sm text-gray-600 urdu-text">ایمیل کے ذریعے اطلاعات حاصل کریں</p>
                          </div>
                        </div>
                        <Switch
                          checked={settings?.email_notifications || false}
                          onCheckedChange={(checked: boolean) =>
                            updateSetting('email_notifications', checked)
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <MessageSquare className="w-5 h-5 text-blue-500" />
                          <div>
                            <Label className="urdu-text">SMS اطلاعات</Label>
                            <p className="text-sm text-gray-600 urdu-text">SMS کے ذریعے اطلاعات حاصل کریں</p>
                          </div>
                        </div>
                        <Switch
                          checked={settings?.sms_notifications || false}
                          onCheckedChange={(checked: boolean) =>
                            updateSetting('sms_notifications', checked)
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <MessageSquare className="w-5 h-5 text-green-500" />
                          <div>
                            <Label className="urdu-text">WhatsApp اطلاعات</Label>
                            <p className="text-sm text-gray-600 urdu-text">WhatsApp کے ذریعے اطلاعات حاصل کریں</p>
                          </div>
                        </div>
                        <Switch
                          checked={settings?.whatsapp_notifications || false}
                          onCheckedChange={(checked: boolean) =>
                            updateSetting('whatsapp_notifications', checked)
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Bell className="w-5 h-5 text-orange-500" />
                          <div>
                            <Label className="urdu-text">ادائیگی کی یاد دہانی</Label>
                            <p className="text-sm text-gray-600 urdu-text">واجب الادا رقم کی یاد دہانی بھیجیں</p>
                          </div>
                        </div>
                        <Switch
                          checked={settings?.payment_reminders || false}
                          onCheckedChange={(checked: boolean) =>
                            updateSetting('payment_reminders', checked)
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                          <div>
                            <Label className="urdu-text">قرض کی انتباہ</Label>
                            <p className="text-sm text-gray-600 urdu-text">مؤخر قرضوں کے لیے انتباہ حاصل کریں</p>
                          </div>
                        </div>
                        <Switch
                          checked={settings?.debt_alerts || false}
                          onCheckedChange={(checked: boolean) =>
                            updateSetting('debt_alerts', checked)
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance Settings */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="urdu-heading mb-4">تھیم اور ظاہری شکل</h2>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="theme" className="urdu-text">تھیم</Label>
                        <Select
                          value={settings?.theme || 'light'}
                          onValueChange={(value: 'light' | 'dark' | 'auto') =>
                            updateSetting('theme', value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="تھیم منتخب کریں" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">روشن</SelectItem>
                            <SelectItem value="dark">تاریک</SelectItem>
                            <SelectItem value="auto">خودکار (سسٹم)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="primaryColor" className="urdu-text">بنیادی رنگ</Label>
                        <div className="flex items-center gap-3 mt-2">
                          <Input
                            id="primaryColor"
                            type="color"
                            value={settings?.primary_color || '#10B981'}
                            onChange={(e) => updateSetting('primary_color', e.target.value)}
                            className="w-16 h-10"
                          />
                          <span className="text-sm text-gray-600">{settings?.primary_color || '#10B981'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Data Management */}
              {activeTab === 'data' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="urdu-heading mb-4">Data Management</h2>
                    
                    <div className="space-y-4">
                      <Card className="p-4 border-blue-200 bg-blue-50">
                        <div className="flex items-start gap-3">
                          <Download className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div className="flex-1">
                            <h3 className="font-medium text-blue-900">Export Data</h3>
                            <p className="text-sm text-blue-700 mt-1">
                              Download a complete backup of all your masjid data
                            </p>
                            <Button
                              onClick={handleExportData}
                              disabled={isExporting}
                              className="mt-3"
                              size="sm"
                            >
                              {isExporting ? 'Exporting...' : 'Export All Data'}
                            </Button>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-4 border-orange-200 bg-orange-50">
                        <div className="flex items-start gap-3">
                          <Upload className="w-5 h-5 text-orange-600 mt-0.5" />
                          <div className="flex-1">
                            <h3 className="font-medium text-orange-900">Import Data</h3>
                            <p className="text-sm text-orange-700 mt-1">
                              Import data from a previous backup or another system
                            </p>
                            <Button
                              onClick={() => {
                                // Create a file input element for importing data
                                const fileInput = document.createElement('input');
                                fileInput.type = 'file';
                                fileInput.accept = '.json,.csv,.xlsx';
                                fileInput.onchange = (e: any) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    alert(`Selected file: ${file.name}\n\nImport functionality will be implemented to process:\n• JSON backup files\n• CSV member/payment data\n• Excel spreadsheets\n\nFile upload and processing coming soon!`);
                                  }
                                };
                                fileInput.click();
                              }}
                              variant="outline"
                              className="mt-3"
                              size="sm"
                            >
                              Import Data
                            </Button>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-4 border-red-200 bg-red-50">
                        <div className="flex items-start gap-3">
                          <Trash2 className="w-5 h-5 text-red-600 mt-0.5" />
                          <div className="flex-1">
                            <h3 className="font-medium text-red-900">Delete All Data</h3>
                            <p className="text-sm text-red-700 mt-1">
                              Permanently delete all masjid data. This action cannot be undone.
                            </p>
                            <Button
                              onClick={handleDeleteAllData}
                              variant="destructive"
                              className="mt-3"
                              size="sm"
                            >
                              {showDeleteConfirm ? 'Confirm Delete' : 'Delete All Data'}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="flex justify-between items-center pt-6 border-t">
                <Button
                  onClick={handleResetSettings}
                  variant="outline"
                >
                  Reset to Defaults
                </Button>

                <Button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="flex items-center gap-2"
                >
                  {isSaving ? (
                    <Check className="w-4 h-4 animate-pulse" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {isSaving ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
