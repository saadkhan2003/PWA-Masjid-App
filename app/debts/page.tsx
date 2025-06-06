'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, AlertTriangle, Calendar, User, Clock, Filter, Users, FileText, DollarSign } from 'lucide-react';
import { useDebtsStore } from '@/lib/stores/debts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/dates';
import { urduTranslations, islamicPhrases } from '@/lib/utils/urdu-translations';
import Link from 'next/link';

export default function DebtsPage() {
  const {
    debts,
    loading,
    error,
    fetchDebts,
    updateDebtStatus,
    getOverdueDebts,
    getTotalOutstanding
  } = useDebtsStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'overdue' | 'pending' | 'paid'>('all');

  useEffect(() => {
    fetchDebts();
  }, [fetchDebts]);

  // Handler functions for debt actions
  const handleMarkAsPaid = async (debtId: string) => {
    try {
      await updateDebtStatus(debtId, 'paid');
      alert(`${urduTranslations.messages.operationSuccessful}! واجبات ادا شدہ کا نشان لگا دیا گیا!`);
    } catch (error) {
      console.error('Error marking debt as paid:', error);
      alert(`${urduTranslations.messages.operationFailed}! واجبات ادا شدہ کا نشان لگانے میں ناکامی۔ دوبارہ کوشش کریں۔`);
    }
  };

  const handleSendReminder = async (debt: any) => {
    try {
      if (!debt.member?.phone) {
        alert('اس رکن کا فون نمبر دستیاب نہیں ہے۔');
        return;
      }

      const cleanPhone = debt.member.phone.replace(/\D/g, '');
      const message = `${islamicPhrases.greeting} ${debt.member.name}، ${urduTranslations.messages.paymentReminder} ${formatCurrency(debt.amount)} ${formatDate(debt.due_date)} تک ادا کرنے کی درخواست ہے۔ برائے کرم مسجد کمیٹی سے رابطہ کریں۔ ${islamicPhrases.thankYou}`;
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
      
      window.open(whatsappUrl, '_blank');
      
      console.log(`Sent reminder for debt ${debt.id} to ${debt.member.name}`);
    } catch (error) {
      console.error('Error sending reminder:', error);
      alert('یاد دہانی بھیجنے میں ناکامی۔ دوبارہ کوشش کریں۔');
    }
  };

  const handleSendOverdueReminders = async () => {
    const overdueDebts = debts.filter(debt => debt.status === 'overdue' && debt.member?.phone);
    
    if (overdueDebts.length === 0) {
      alert(`${urduTranslations.messages.noDataFound} - فون نمبر کے ساتھ کوئی مؤخر واجبات نہیں ملے۔`);
      return;
    }

    const confirmMessage = `${overdueDebts.length} ارکان کو ${urduTranslations.messages.paymentReminder} بھیجیں؟`;
    if (!confirm(confirmMessage)) return;

    let successCount = 0;
    for (const debt of overdueDebts) {
      try {
        await handleSendReminder(debt);
        successCount++;
        // Add small delay between messages
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to send reminder to ${debt.member?.name}:`, error);
      }
    }

    alert(`${urduTranslations.messages.operationSuccessful}! کامیابی سے ${successCount} یاد دہانیاں بھیجی گئیں۔`);
  };

  const handleGenerateDebtReport = () => {
    const reportData = {
      totalDebts: debts.length,
      totalAmount: debts.reduce((sum, debt) => sum + debt.amount, 0),
      overdueDebts: debts.filter(debt => debt.status === 'overdue').length,
      pendingDebts: debts.filter(debt => debt.status === 'pending').length,
      paidDebts: debts.filter(debt => debt.status === 'paid').length,
    };

    const report = `
${urduTranslations.reports.financialSummary} - واجبات کی رپورٹ
تیار کی گئی: ${formatDate(new Date().toISOString())}

خلاصہ:
- کل واجبات: ${reportData.totalDebts}
- کل رقم: ${formatCurrency(reportData.totalAmount)}
- مؤخر: ${reportData.overdueDebts}
- زیر التواء: ${reportData.pendingDebts}
- ادا شدہ: ${reportData.paidDebts}

تفصیلی فہرست:
${debts.map(debt => 
  `${debt.member?.name}: ${formatCurrency(debt.amount)} (${debt.status === 'paid' ? 'ادا شدہ' : debt.status === 'overdue' ? 'مؤخر' : 'زیر التواء'})`
).join('\n')}
    `.trim();

    console.log('Generated debt report:', report);
    alert(`${urduTranslations.reports.financialSummary} تیار کر دی گئی! تفصیلات کے لیے کنسول دیکھیں۔`);
  };

  const filteredDebts = debts.filter(debt => {
    const matchesSearch = debt.member?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         debt.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || debt.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalAmount = filteredDebts.reduce((sum, debt) => sum + debt.amount, 0);
  const overdueCount = filteredDebts.filter(debt => debt.status === 'overdue').length;
  const pendingCount = filteredDebts.filter(debt => debt.status === 'pending').length;
  const paidCount = filteredDebts.filter(debt => debt.status === 'paid').length;

  function getStatusColor(status: string) {
    switch (status) {
      case 'overdue':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'paid':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }

  if (loading) {
    return (
      <div className="container px-4 py-6 max-w-7xl mx-auto rtl-container">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container px-4 py-6 max-w-7xl mx-auto rtl-container">
        <div className="text-center py-12">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2 urdu-heading">
            {urduTranslations.common.error} - واجبات لوڈ کرنے میں خرابی
          </h2>
          <p className="text-gray-600 mb-4 urdu-text">{error}</p>
          <Button onClick={fetchDebts} className="bg-islamic-green hover:bg-islamic-green/90 btn-rtl">
            <span>{urduTranslations.actions.search} - دوبارہ کوشش</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-6 max-w-7xl mx-auto space-y-6 rtl-container">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-rtl">
        <div className="flex-rtl-col">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 urdu-heading">
            {urduTranslations.navigation.debts}
          </h1>
          <p className="text-gray-600 mt-1 urdu-text">
            {urduTranslations.headers.financialRecords}
          </p>
        </div>
        <Link href="/debts/add">
          <Button className="bg-islamic-green hover:bg-islamic-green/90 w-full sm:w-auto btn-rtl">
            <Plus className="h-4 w-4 mr-2" />
            <span>{urduTranslations.actions.add}</span>
          </Button>
        </Link>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-r-4 border-r-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-rtl">
              <div className="flex-rtl-col">
                <p className="text-sm font-medium text-gray-600 urdu-text">
                  {urduTranslations.debts.totalDues}
                </p>
                <p className="text-2xl font-bold text-gray-900 ltr-numbers">{filteredDebts.length}</p>
                <p className="text-xs text-gray-500 urdu-text"></p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-r-4 border-r-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-rtl">
              <div className="flex-rtl-col">
                <p className="text-sm font-medium text-gray-600 urdu-text">
                  {urduTranslations.common.total} {urduTranslations.common.amount}
                </p>
                <p className="text-2xl font-bold text-gray-900 ltr-numbers">{formatCurrency(totalAmount)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-r-4 border-r-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-rtl">
              <div className="flex-rtl-col">
                <p className="text-sm font-medium text-gray-600 urdu-text">
                  {urduTranslations.status.overdue}
                </p>
                <p className="text-2xl font-bold text-red-600 ltr-numbers">{overdueCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-r-4 border-r-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-rtl">
              <div className="flex-rtl-col">
                <p className="text-sm font-medium text-gray-600 urdu-text">
                  {urduTranslations.status.pending}
                </p>
                <p className="text-2xl font-bold text-yellow-600 ltr-numbers">{pendingCount}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Section */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Box */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="رکن کے نام سے تلاش کریں..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 mobile-form-input"
                />
              </div>
            </div>
            
            {/* Filter Buttons */}
            <div className="flex gap-2 flex-wrap flex-rtl">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
                size="sm"
                className={statusFilter === 'all' ? 'bg-islamic-green hover:bg-islamic-green/90' : ''}
              >
                <span className="urdu-text text-sm">تمام</span> <span className="ltr-numbers">({debts.length})</span>
              </Button>
              <Button
                variant={statusFilter === 'overdue' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('overdue')}
                size="sm"
                className={statusFilter === 'overdue' ? 'bg-red-600 hover:bg-red-700' : 'text-red-600 border-red-200 hover:bg-red-50'}
              >
                <span className="urdu-text text-sm">{urduTranslations.status.overdue}</span> <span className="ltr-numbers">({overdueCount})</span>
              </Button>
              <Button
                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('pending')}
                size="sm"
                className={statusFilter === 'pending' ? 'bg-yellow-600 hover:bg-yellow-700' : 'text-yellow-600 border-yellow-200 hover:bg-yellow-50'}
              >
                <span className="urdu-text text-sm">{urduTranslations.status.pending}</span> <span className="ltr-numbers">({pendingCount})</span>
              </Button>
              <Button
                variant={statusFilter === 'paid' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('paid')}
                size="sm"
                className={statusFilter === 'paid' ? 'bg-green-600 hover:bg-green-700' : 'text-green-600 border-green-200 hover:bg-green-50'}
              >
                <span className="urdu-text text-sm">{urduTranslations.status.paid}</span> <span className="ltr-numbers">({paidCount})</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debts List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg urdu-text">
            {urduTranslations.headers.financialRecords} 
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredDebts.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredDebts.map((debt) => (
                <div key={debt.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Member Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-rtl">
                        <div className="w-10 h-10 bg-islamic-green/10 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-islamic-green" />
                        </div>
                        <div className="flex-rtl-col">
                          <h3 className="font-semibold text-gray-900 urdu-text">{debt.member?.name}</h3>
                          <p className="text-sm text-gray-500 urdu-text">{debt.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 flex-rtl">
                        <div className="flex items-center gap-1 flex-rtl">
                          <Calendar className="h-4 w-4" />
                          <span className="urdu-text">
                            {urduTranslations.debts.paymentDue}: <span className="ltr-numbers">{formatDate(debt.due_date)}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-1 flex-rtl">
                          <Clock className="h-4 w-4" />
                          <span className="urdu-text">
                            {urduTranslations.common.created}: <span className="ltr-numbers">{formatDate(debt.created_at)}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Amount and Status */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-rtl">
                      <div className="text-right flex-rtl-col">
                        <p className="text-2xl font-bold text-gray-900 ltr-numbers">{formatCurrency(debt.amount)}</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(debt.status)}`}>
                          <span className="urdu-text">
                            {urduTranslations.status[debt.status as keyof typeof urduTranslations.status]}
                          </span>
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 flex-rtl">
                        {debt.status !== 'paid' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleMarkAsPaid(debt.id)}
                            className="whitespace-nowrap btn-rtl"
                          >
                            <span className="urdu-text text-xs">{urduTranslations.actions.markAsPaid}</span>
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleSendReminder(debt)}
                          className="whitespace-nowrap btn-rtl"
                        >
                          <span className="urdu-text text-xs">{urduTranslations.actions.sendReminder}</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertTriangle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2 urdu-heading">
                {searchQuery || statusFilter !== 'all' ? 
                  urduTranslations.messages.noDataFound : 
                  'تمام ارکان کے واجبات ادا ہیں'}
              </h3>
              <p className="text-gray-600 mb-4 urdu-text">
                {searchQuery || statusFilter !== 'all'
                  ? 'اپنی تلاش یا فلٹر کی معیار کو تبدیل کرنے کی کوشش کریں۔'
                  : `${islamicPhrases.alhamdulillah}! تمام ارکان اپنی ادائیگیوں میں اپ ٹو ڈیٹ ہیں۔`}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Link href="/debts/add">
                  <Button className="bg-islamic-green hover:bg-islamic-green/90 btn-rtl">
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="urdu-text">{urduTranslations.actions.add} - پہلا ریکارڈ شامل کریں</span>
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
