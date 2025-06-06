'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, Search, Calendar, CreditCard, User, DollarSign, Download, Filter } from 'lucide-react';
import { usePaymentsStore } from '@/lib/stores/payments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/dates';
import { urduTranslations, islamicPhrases } from '@/lib/utils/urdu-translations';
import Link from 'next/link';

// Component that uses useSearchParams wrapped in Suspense
function PaymentsPageContent() {
  const searchParams = useSearchParams();
  const {
    payments,
    loading,
    error,
    fetchPayments,
    setFilters,
    filterMonth,
    filterYear,
    filterMemberId
  } = usePaymentsStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [monthFilter, setMonthFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('2025');
  const [memberFilter, setMemberFilter] = useState('');

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Check for member filter from URL params (for payment history from member detail pages)
  useEffect(() => {
    const memberId = searchParams.get('member');
    if (memberId) {
      setMemberFilter(memberId);
      setFilters({ memberId });
    }
  }, [searchParams, setFilters]);

  // Update store filters when local filters change
  useEffect(() => {
    setFilters({
      month: monthFilter === 'all' ? null : parseInt(monthFilter),
      year: yearFilter === 'all' ? null : parseInt(yearFilter),
      memberId: memberFilter || null
    });
  }, [monthFilter, yearFilter, memberFilter, setFilters]);

  // Handler functions for payment actions
  const handleViewDetails = (payment: any) => {
    const details = `
${urduTranslations.paymentsPage.paymentDetails || 'ادائیگی کی تفصیلات'}:
━━━━━━━━━━━━━━━━━━━━
${urduTranslations.common.member}: ${payment.member?.name}
${urduTranslations.common.phone}: ${payment.member?.phone || urduTranslations.common.notProvided || 'فراہم نہیں کیا گیا'}
${urduTranslations.paymentsPage.totalAmount}: ${formatCurrency(payment.amount)}
${urduTranslations.common.date}: ${formatDate(payment.payment_date)}
${urduTranslations.common.period}: ${months.find(m => m.value === payment.month.toString())?.label} ${payment.year}
${urduTranslations.common.receiptNumber}: ${payment.receipt_number || urduTranslations.common.notAssigned || 'تفویض نہیں کیا گیا'}
${urduTranslations.common.notes}: ${payment.notes || urduTranslations.common.noNotes || 'کوئی نوٹس نہیں'}
━━━━━━━━━━━━━━━━━━━━
${urduTranslations.common.created}: ${formatDate(payment.created_at)}
${urduTranslations.common.lastUpdated}: ${formatDate(payment.updated_at)}
    `.trim();
    
    alert(details);
  };

  const handleEditPayment = async (payment: any) => {
    // Create a simple inline edit functionality since individual edit pages don't exist
    const newAmount = prompt(`${payment.member?.name} کے لیے ادائیگی کی رقم تبدیل کریں:`, payment.amount.toString());
    if (newAmount && !isNaN(Number(newAmount))) {
      try {
        const numericAmount = parseFloat(newAmount);
        await usePaymentsStore.getState().updatePayment(payment.id, { 
          amount: numericAmount,
        });
        alert('ادائیگی کی رقم کامیابی سے اپ ڈیٹ ہو گئی!');
      } catch (error) {
        console.error('Error updating payment:', error);
        alert('ادائیگی اپ ڈیٹ کرنے میں ناکامی۔ دوبارہ کوشش کریں۔');
      }
    }
  };

  const handleDeletePayment = async (payment: any) => {
    const confirmMessage = `کیا آپ واقعی اس ادائیگی کو حذف کرنا چاہتے ہیں؟\n\n${urduTranslations.common.member}: ${payment.member?.name}\n${urduTranslations.paymentsPage.totalAmount}: ${formatCurrency(payment.amount)}\n${urduTranslations.common.date}: ${formatDate(payment.payment_date)}\n\nیہ عمل واپس نہیں ہو سکتا۔`;
    
    if (confirm(confirmMessage)) {
      try {
        await usePaymentsStore.getState().deletePayment(payment.id);
        alert('ادائیگی کامیابی سے حذف ہو گئی!');
      } catch (error) {
        console.error('Error deleting payment:', error);
        alert('ادائیگی حذف کرنے میں ناکامی۔ دوبارہ کوشش کریں۔');
      }
    }
  };

  const handleExportPayments = () => {
    const csvHeaders = 'رکن کا نام,رقم,ادائیگی کی تاریخ,مدت,رسید نمبر,نوٹس\n';
    const csvData = filteredPayments.map(payment => {
      const period = `${months.find(m => m.value === payment.month.toString())?.label} ${payment.year}`;
      return `"${payment.member?.name}","${payment.amount}","${formatDate(payment.payment_date)}","${period}","${payment.receipt_number || ''}","${payment.notes || ''}"`;
    }).join('\n');
    
    const csvContent = csvHeaders + csvData;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `payments_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    alert(`${filteredPayments.length} ${urduTranslations.payments.paymentReceived} ${urduTranslations.actions.export} ${urduTranslations.common.success}`);
  };

  const handleBulkPaymentEntry = () => {
    // Show bulk payment entry modal with proper functionality
    const confirmAction = confirm(`${urduTranslations.paymentsPage.bulkEntry} میں جانا چاہتے ہیں؟\n\nاس میں آپ کر سکیں گے:\n• متعدد ادائیگیاں ایک ساتھ درج کرنا\n• کئی ارکان کو ادائیگی اپلائی کرنا\n• CSV فائل سے ادائیگی ڈیٹا اپلوڈ کرنا`);
    
    if (confirmAction) {
      // Navigate to the add payment page with bulk mode parameter
      window.location.href = '/payments/add?mode=bulk';
    }
  };

  const handleGeneratePaymentReport = () => {
    const reportData = {
      totalPayments: filteredPayments.length,
      totalAmount: filteredPayments.reduce((sum, payment) => sum + payment.amount, 0),
      uniqueMembers: new Set(filteredPayments.map(p => p.member_id)).size,
      averagePayment: filteredPayments.length > 0 ? filteredPayments.reduce((sum, payment) => sum + payment.amount, 0) / filteredPayments.length : 0,
      period: monthFilter !== 'all' ? `${months.find(m => m.value === monthFilter)?.label} ${yearFilter}` : `تمام ${yearFilter}`,
    };

    const report = `
ادائیگی کی رپورٹ
تیار کردہ: ${formatDate(new Date().toISOString())}
مدت: ${reportData.period}

خلاصہ:
- کل ادائیگیاں: ${reportData.totalPayments}
- کل رقم: ${formatCurrency(reportData.totalAmount)}
- منفرد ارکان: ${reportData.uniqueMembers}
- اوسط ادائیگی: ${formatCurrency(reportData.averagePayment)}

ماہانہ تفصیل:
${months.slice(1).map(month => {
  const monthPayments = filteredPayments.filter(p => p.month.toString() === month.value);
  const monthTotal = monthPayments.reduce((sum, p) => sum + p.amount, 0);
  return `${month.label}: ${monthPayments.length} ادائیگیاں، ${formatCurrency(monthTotal)}`;
}).join('\n')}

اہم حصہ ڈالنے والے ارکان:
${Object.entries(
  filteredPayments.reduce((acc, payment) => {
    const memberName = payment.member?.name || 'نامعلوم رکن';
    if (!acc[memberName]) acc[memberName] = 0;
    acc[memberName] += payment.amount;
    return acc;
  }, {} as Record<string, number>)
)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 5)
  .map(([name, total]) => `${name}: ${formatCurrency(total)}`)
  .join('\n')}
    `.trim();

    console.log('Generated payment report:', report);
    alert('ادائیگی کی رپورٹ تیار ہو گئی! تفصیلات کے لیے کنسول چیک کریں۔\n\nمکمل implementation میں، یہ PDF ڈاؤن لوڈ کرے گا یا تفصیلی رپورٹ صفحہ کھولے گا۔');
  };

  const handleSendReceiptReminders = () => {
    const paymentsWithoutReceipts = filteredPayments.filter(payment => !payment.receipt_number && payment.member?.phone);
    
    if (paymentsWithoutReceipts.length === 0) {
      alert('تمام ادائیگیوں کے پاس رسید نمبر ہیں یا یاد دہانی کے لیے فون نمبر دستیاب نہیں ہیں۔');
      return;
    }

    const confirmMessage = `${paymentsWithoutReceipts.length} رکن(ارکان) کو رسید کی یاد دہانی بھیجیں جنہوں نے رسید نمبر کے بغیر ادائیگی کی ہے؟`;
    if (!confirm(confirmMessage)) return;

    let successCount = 0;
    paymentsWithoutReceipts.forEach(payment => {
      try {
        const cleanPhone = payment.member!.phone!.replace(/\D/g, '');
        const message = `${islamicPhrases.greeting} ${payment.member!.name}، ہم نے آپ کی ${formatCurrency(payment.amount)} کی ادائیگی ${formatDate(payment.payment_date)} کو وصول کی ہے۔ براہ کرم اپنے ریکارڈ کے لیے رسید نمبر فراہم کریں۔ ${islamicPhrases.thankYou}`;
        const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
        
        // In a real app, you might want to delay between messages
        setTimeout(() => {
          window.open(whatsappUrl, '_blank');
        }, successCount * 2000); // 2 second delay between messages
        
        successCount++;
      } catch (error) {
        console.error(`Failed to send reminder to ${payment.member?.name}:`, error);
      }
    });

    alert(`${successCount} رسید کی یاد دہانی(یاں) شروع کی گئی۔`);
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.member?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         payment.receipt_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         payment.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesMonth = monthFilter === 'all' || payment.month.toString() === monthFilter;
    const matchesYear = payment.year.toString() === yearFilter;
    const matchesMember = !memberFilter || payment.member_id === memberFilter;
    
    return matchesSearch && matchesMonth && matchesYear && matchesMember;
  });

  const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);

  const months = [
    { value: 'all', label: urduTranslations.paymentsPage.allMonths },
    { value: '1', label: urduTranslations.months.january },
    { value: '2', label: urduTranslations.months.february },
    { value: '3', label: urduTranslations.months.march },
    { value: '4', label: urduTranslations.months.april },
    { value: '5', label: urduTranslations.months.may },
    { value: '6', label: urduTranslations.months.june },
    { value: '7', label: urduTranslations.months.july },
    { value: '8', label: urduTranslations.months.august },
    { value: '9', label: urduTranslations.months.september },
    { value: '10', label: urduTranslations.months.october },
    { value: '11', label: urduTranslations.months.november },
    { value: '12', label: urduTranslations.months.december },
  ];

  if (loading) {
    return (
      <div className="container px-4 sm:px-6 max-w-7xl mx-auto py-6">
        <div className="flex flex-col justify-center items-center min-h-[60vh]">
          <div className="w-8 h-8 rounded-full border-4 border-islamic-green border-t-transparent animate-spin mb-4"></div>
          <p className="text-sm text-gray-600 urdu-text">{urduTranslations.messages.loading} {urduTranslations.navigation.payments}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container px-4 sm:px-6 max-w-7xl mx-auto py-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2 urdu-title">{urduTranslations.messages.error} {urduTranslations.navigation.payments}</h2>
          <p className="text-red-600 mb-4 urdu-text">{error}</p>
          <Button onClick={fetchPayments} className="bg-islamic-green hover:bg-islamic-green/90 text-white urdu-text">
            دوبارہ کوشش کریں
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container desktop-p-6 space-y-6 rtl-container">
      {/* Header */}
      <div className="animate-fade-in">
        <div className="flex flex-col gap-3 mb-4 sm:mb-6 desktop-mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="urdu-title text-gray-900 lg:text-4xl">{urduTranslations.paymentsPage.title}</h1>
              <p className="urdu-text text-gray-600 mt-1 lg:text-xl">
                {urduTranslations.paymentsPage.subtitle}
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleExportPayments}
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none text-xs sm:text-sm lg:text-base lg:px-6 lg:py-3 urdu-text"
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{urduTranslations.actions.export} CSV</span>
                <span className="sm:hidden">{urduTranslations.actions.export}</span>
              </Button>
              <Link href="/payments/add" className="flex-1 sm:flex-none">
                <Button 
                  size="sm" 
                  className="w-full bg-islamic-green hover:bg-islamic-green/90 text-white text-xs sm:text-sm lg:text-base lg:px-6 lg:py-3 urdu-text"
                >
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">{urduTranslations.payments.recordPayment}</span>
                  <span className="sm:hidden">{urduTranslations.actions.add}</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Grid Layout */}
      <div className="desktop-grid desktop-gap-6">
        {/* Main Content - 8 columns on desktop */}
        <div className="lg:desktop-col-8 space-y-6">
          {/* Payments List */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="p-3 sm:p-4 lg:p-6 pb-2">
              <CardTitle className="urdu-heading lg:text-xl">{urduTranslations.paymentsPage.paymentRecords}</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
              {filteredPayments.length > 0 ? (
                <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                  {filteredPayments.map((payment, index) => (
                    <div
                      key={payment.id}
                      className="bg-white rounded-lg border border-gray-100 shadow-sm hover:border-gray-200 transition-all duration-200 overflow-hidden animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="p-3 sm:p-4 lg:p-6">
                        {/* Header with member name and receipt */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center min-w-0 flex-1">
                            <User className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-gray-400 mr-2 flex-shrink-0" />
                            <span className="urdu-text text-gray-900 truncate lg:text-xl">{payment.member?.name}</span>
                          </div>
                          {payment.receipt_number && (
                            <span className="px-2 py-0.5 lg:px-3 lg:py-1 bg-gray-100 text-gray-700 rounded-full text-xs lg:text-sm ml-2 flex-shrink-0">
                              {payment.receipt_number}
                            </span>
                          )}
                        </div>
                        
                        {/* Payment details */}
                        <div className="space-y-2 mb-3">
                          <div className="flex items-center justify-between text-xs sm:text-sm lg:text-base">
                            <div className="flex items-center text-gray-600">
                              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-1.5" />
                              <span>{formatDate(payment.payment_date)}</span>
                            </div>
                            <div className="text-gray-600 text-xs lg:text-sm">
                              {months.find(m => m.value === payment.month.toString())?.label} {payment.year}
                            </div>
                          </div>
                          
                          {payment.notes && (
                            <p className="text-xs sm:text-sm lg:text-base text-gray-600 italic bg-gray-50 p-2 lg:p-3 rounded">{payment.notes}</p>
                          )}
                        </div>
                        
                        {/* Amount and actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <div className="font-bold text-lg sm:text-xl lg:text-2xl text-islamic-green">
                            {formatCurrency(payment.amount)}
                          </div>
                          <div className="flex space-x-1 sm:space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs lg:text-sm h-7 sm:h-8 lg:h-10 px-2 sm:px-3 lg:px-4"
                              onClick={() => handleViewDetails(payment)}
                            >
                              <span className="hidden sm:inline urdu-text">{urduTranslations.paymentsPage.view}</span>
                              <span className="sm:hidden">•••</span>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs lg:text-sm h-7 sm:h-8 lg:h-10 px-2 sm:px-3 lg:px-4"
                              onClick={() => handleEditPayment(payment)}
                            >
                              <span className="urdu-text">{urduTranslations.paymentsPage.edit}</span>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs lg:text-sm h-7 sm:h-8 lg:h-10 px-2 sm:px-3 lg:px-4 text-red-600 hover:bg-red-50"
                              onClick={() => handleDeletePayment(payment)}
                            >
                              <span className="hidden sm:inline urdu-text">{urduTranslations.paymentsPage.delete}</span>
                              <span className="sm:hidden">×</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12 lg:py-16">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-gray-400" />
                  </div>
                  <h3 className="urdu-heading text-gray-900 mb-2 lg:text-xl">
                    {searchQuery || monthFilter !== 'all' ? urduTranslations.paymentsPage.noPaymentsFound : urduTranslations.paymentsPage.noPaymentsRecorded}
                  </h3>
                  <p className="urdu-text text-gray-600 mb-6 lg:text-lg">
                    {searchQuery || monthFilter !== 'all'
                      ? urduTranslations.paymentsPage.adjustSearchFilter
                      : urduTranslations.paymentsPage.startByRecording}
                  </p>
                  {!searchQuery && monthFilter === 'all' && (
                    <Link href="/payments/add">
                      <Button className="bg-islamic-green hover:bg-islamic-green/90 text-white py-2 px-4 lg:py-3 lg:px-6 text-sm lg:text-base urdu-text">
                        <Plus className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 mr-2" />
                        {urduTranslations.paymentsPage.recordFirstPayment}
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - 4 columns on desktop */}
        <div className="lg:desktop-col-4 space-y-6">
          {/* Search and Filters */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="p-3 sm:p-4 lg:p-6 pb-2">
              <CardTitle className="urdu-heading flex items-center gap-2 lg:text-xl">
                <Filter className="h-4 w-4 lg:h-5 lg:w-5" />
                {urduTranslations.paymentsPage.searchAndFilter}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 lg:p-6 pt-1">
              <div className="space-y-3 lg:space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  <Input
                    placeholder={urduTranslations.paymentsPage.searchPayments}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 sm:pl-10 h-9 sm:h-10 lg:h-12 text-xs sm:text-sm lg:text-base w-full"
                  />
                </div>
                <div className="grid grid-cols-1 gap-2 lg:gap-3">
                  <select
                    value={monthFilter}
                    onChange={(e) => setMonthFilter(e.target.value)}
                    className="rounded-md border border-gray-300 py-2 lg:py-3 px-3 lg:px-4 text-xs sm:text-sm lg:text-base focus:ring-2 focus:ring-islamic-green/30 focus:border-islamic-green w-full"
                  >
                    {months.map(month => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value)}
                    className="rounded-md border border-gray-300 py-2 lg:py-3 px-3 lg:px-4 text-xs sm:text-sm lg:text-base focus:ring-2 focus:ring-islamic-green/30 focus:border-islamic-green w-full"
                  >
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                  </select>
                </div>
                {memberFilter && (
                  <div className="flex items-center justify-between bg-blue-50 rounded-md p-2 lg:p-3 text-xs sm:text-sm lg:text-base">
                    <span className="text-blue-700 urdu-text">
                      {urduTranslations.paymentsPage.filteredByMember}: {payments.find(p => p.member_id === memberFilter)?.member?.name}
                    </span>
                    <Button 
                      onClick={() => setMemberFilter('')}
                      variant="outline"
                      size="sm"
                      className="h-6 lg:h-8 py-0 text-xs lg:text-sm urdu-text"
                    >
                      {urduTranslations.paymentsPage.clear}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Summary Stats */}
          <div className="space-y-3 sm:space-y-4">
            <Card className="shadow-sm border-gray-200 overflow-hidden animate-fade-in">
              <CardContent className="p-0">
                <div className="flex items-center p-3 sm:p-4 lg:p-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-full bg-blue-100 flex items-center justify-center mr-3 sm:mr-4">
                    <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-lg sm:text-xl lg:text-3xl font-bold">{filteredPayments.length}</div>
                    <div className="text-xs sm:text-sm lg:text-base text-gray-500 urdu-text">{urduTranslations.paymentsPage.totalPayments}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-gray-200 overflow-hidden animate-fade-in">
              <CardContent className="p-0">
                <div className="flex items-center p-3 sm:p-4 lg:p-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-full bg-green-100 flex items-center justify-center mr-3 sm:mr-4">
                    <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-green-600" />
                  </div>
                  <div>
                    <div className="text-lg sm:text-xl lg:text-3xl font-bold">{formatCurrency(totalAmount)}</div>
                    <div className="text-xs sm:text-sm lg:text-base text-gray-500 urdu-text">{urduTranslations.paymentsPage.totalAmount}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-gray-200 overflow-hidden animate-fade-in">
              <CardContent className="p-0">
                <div className="flex items-center p-3 sm:p-4 lg:p-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-full bg-purple-100 flex items-center justify-center mr-3 sm:mr-4">
                    <User className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-lg sm:text-xl lg:text-3xl font-bold">{new Set(filteredPayments.map(p => p.member_id)).size}</div>
                    <div className="text-xs sm:text-sm lg:text-base text-gray-500 urdu-text">{urduTranslations.paymentsPage.uniqueMembers}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function PaymentsPage() {
  return (
    <Suspense fallback={
      <div className="container px-3 sm:px-4 lg:px-6 max-w-7xl mx-auto py-3 sm:py-4 lg:py-6">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-islamic-green"></div>
        </div>
      </div>
    }>
      <PaymentsPageContent />
    </Suspense>
  );
}
