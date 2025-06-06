'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Filter, User, Phone, MapPin, Calendar, Download } from 'lucide-react';
import { useMembersStore } from '@/lib/stores/members';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/dates';
import { urduTranslations, islamicPhrases } from '@/lib/utils/urdu-translations';
import Link from 'next/link';

export default function MembersPage() {
  const {
    members,
    loading,
    error,
    searchQuery,
    fetchMembers,
    searchMembers,
  } = useMembersStore();

  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.address?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    searchMembers(e.target.value);
  };

  // Export functionality
  const handleExportMembers = () => {
    const csvHeaders = 'Name,Phone,Address,Status,Join Date,Monthly Dues,Total Debt\n';
    const csvData = filteredMembers.map(member => {
      return `"${member.name}","${member.phone || ''}","${member.address || ''}","${member.status}","${formatDate(member.join_date)}","${member.monthly_dues}","${member.total_debt}"`;
    }).join('\n');
    
    const csvContent = csvHeaders + csvData;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `members_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    alert(`Exported ${filteredMembers.length} member records to CSV file.`);
  };

  // Generate member report
  const handleGenerateMemberReport = () => {
    const reportData = {
      totalMembers: filteredMembers.length,
      activeMembers: filteredMembers.filter(m => m.status === 'active').length,
      inactiveMembers: filteredMembers.filter(m => m.status === 'inactive').length,
      totalMonthlyDues: filteredMembers.reduce((sum, m) => sum + m.monthly_dues, 0),
      totalDebt: filteredMembers.reduce((sum, m) => sum + m.total_debt, 0),
      membersWithDebt: filteredMembers.filter(m => m.total_debt > 0).length,
      averageMonthlyDues: filteredMembers.length > 0 ? filteredMembers.reduce((sum, m) => sum + m.monthly_dues, 0) / filteredMembers.length : 0,
    };

    const report = `
MEMBER REPORT - ${new Date().toLocaleDateString()}
================================================

SUMMARY STATISTICS:
Total Members: ${reportData.totalMembers}
Active Members: ${reportData.activeMembers}
Inactive Members: ${reportData.inactiveMembers}
Members with Debt: ${reportData.membersWithDebt}

FINANCIAL OVERVIEW:
Total Monthly Dues: ${formatCurrency(reportData.totalMonthlyDues)}
Average Monthly Dues: ${formatCurrency(reportData.averageMonthlyDues)}
Total Outstanding Debt: ${formatCurrency(reportData.totalDebt)}

MEMBER BREAKDOWN:
${filteredMembers.map(member => 
  `${member.name} - ${member.status.toUpperCase()} - Dues: ${formatCurrency(member.monthly_dues)} - Debt: ${formatCurrency(member.total_debt)}`
).join('\n')}
    `.trim();

    console.log('Generated member report:', report);
    alert('Member report generated! Check the console for details.\n\nIn a full implementation, this would download a PDF or open a detailed report page.');
  };

  // Send bulk reminders
  const handleSendBulkReminders = async () => {
    const membersWithDebt = filteredMembers.filter(member => member.total_debt > 0 && member.phone);
    
    if (membersWithDebt.length === 0) {
      alert('No members with debt and phone numbers found for reminders.');
      return;
    }

    const confirmMessage = `Send payment reminders to ${membersWithDebt.length} member(s) with outstanding debts?`;
    if (!confirm(confirmMessage)) return;

    let successCount = 0;
    for (const member of membersWithDebt) {
      try {
        const message = `Assalamu Alaikum ${member.name}, you have an outstanding debt of ${formatCurrency(member.total_debt)}. Please contact us for payment details. JazakAllah Khair.`;
        const whatsappUrl = `https://wa.me/${member.phone?.replace(/[^\d]/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        successCount++;
        // Add small delay between opening windows
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Failed to send reminder to ${member.name}:`, error);
      }
    }

    alert(`Opened ${successCount} WhatsApp reminder(s).`);
  };

  if (loading && members.length === 0) {
    return (
      <div className="container px-4 sm:px-6 max-w-7xl mx-auto py-6">
        <div className="flex flex-col justify-center items-center min-h-[60vh]">
          <div className="w-8 h-8 rounded-full border-4 border-islamic-green border-t-transparent animate-spin mb-4"></div>
          <p className="text-gray-500 urdu-text">{urduTranslations.messages.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container desktop-p-6">
      {/* Header - Full Width */}
      <div className="animate-fade-in mb-6">
        <div className="flex flex-col gap-3 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="urdu-title text-gray-900">{urduTranslations.navigation.members}</h1>
              <p className="urdu-text text-gray-600 mt-1">
                {urduTranslations.headers.memberManagement}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleExportMembers}
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none text-xs sm:text-sm"
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline urdu-text">{urduTranslations.actions.export}</span>
                <span className="sm:hidden urdu-text">{urduTranslations.actions.export}</span>
              </Button>
              <Link href="/members/add" className="flex-1 sm:flex-none">
                <Button 
                  size="sm" 
                  className="w-full bg-islamic-green hover:bg-islamic-green/90 text-white text-xs sm:text-sm"
                >
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline urdu-text">{urduTranslations.members.newMember}</span>
                  <span className="sm:hidden urdu-text">{urduTranslations.actions.add}</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Grid Layout */}
      <div className="desktop-grid desktop-gap-6">
        {/* Main Content */}
        <div className="lg:desktop-col-8 space-y-6">

        {/* Search and Filters */}
        <Card className="shadow-sm border-gray-200">
          <CardHeader className="p-3 sm:p-4 pb-2">
            <CardTitle className="urdu-text flex items-center gap-2">
              <Filter className="h-4 w-4 ml-2" />
              {urduTranslations.paymentsPage.searchAndFilter}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-1">
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                <Input
                  placeholder={`${urduTranslations.actions.search} ${urduTranslations.navigation.members}...`}
                  value={searchQuery}
                  onChange={handleSearch}
                  className="pl-9 sm:pl-10 h-9 sm:h-10 text-xs sm:text-sm w-full"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('all')}
                  size="sm"
                  className="flex-1 py-1 px-3 h-8 text-xs sm:text-sm urdu-text"
                >
                  {urduTranslations.common.total}
                </Button>
                <Button
                  variant={statusFilter === 'active' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('active')}
                  size="sm"
                  className="flex-1 py-1 px-3 h-8 text-xs sm:text-sm urdu-text"
                >
                  {urduTranslations.common.active}
                </Button>
                <Button
                  variant={statusFilter === 'inactive' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('inactive')}
                  size="sm"
                  className="flex-1 py-1 px-3 h-8 text-xs sm:text-sm urdu-text"
                >
                  {urduTranslations.common.inactive}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-3 sm:p-4">
              <div className="text-red-600 text-xs sm:text-sm urdu-text">{error}</div>
            </CardContent>
          </Card>
        )}

          {/* Members List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {filteredMembers.map((member) => (
            <Card 
              key={member.id} 
              className="shadow-sm border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              <CardContent className="p-3 sm:p-4">
                {/* Header with avatar and status */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-islamic-green rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="urdu-text text-gray-900 truncate">{member.name}</h3>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                      member.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    } urdu-text`}
                  >
                    {member.status === 'active' ? urduTranslations.common.active : urduTranslations.common.inactive}
                  </span>
                </div>

                {/* Member details */}
                <div className="space-y-2 mb-3">
                  {member.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-gray-600 truncate">{member.phone}</span>
                    </div>
                  )}
                  
                  {member.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-gray-600 truncate">{member.address}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-600 urdu-text">
                      {urduTranslations.members.joinDate} {formatDate(member.join_date)}
                    </span>
                  </div>
                </div>
                
                {/* Financial info */}
                <div className="pt-2 mt-2 border-t border-gray-100 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 urdu-text">{urduTranslations.headers.monthlyDues}</span>
                    <span className="text-xs sm:text-sm font-medium">{formatCurrency(member.monthly_dues)}</span>
                  </div>
                  
                  {member.total_debt > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-red-600 urdu-text">{urduTranslations.debts.totalDues}</span>
                      <span className="text-xs sm:text-sm font-semibold text-red-600">
                        {formatCurrency(member.total_debt)}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Action buttons */}
                <div className="flex gap-2 pt-3 mt-3 border-t border-gray-100">
                  <Link href={`/members/${member.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs py-1 h-8 urdu-text">
                      {urduTranslations.actions.view}
                    </Button>
                  </Link>
                  <Link href={`/members/${member.id}/edit`} className="flex-1">
                    <Button size="sm" className="w-full bg-islamic-green hover:bg-islamic-green/90 text-white text-xs py-1 h-8 urdu-text">
                      {urduTranslations.actions.edit}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredMembers.length === 0 && !loading && (
          <Card className="text-center py-8 sm:py-12">
            <CardContent className="p-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
              </div>
              <h3 className="urdu-heading text-gray-900 mb-2">
                {searchQuery || statusFilter !== 'all' ? 'کوئی رکن نہیں ملا' : 'ابھی کوئی رکن نہیں'}
              </h3>
              <p className="urdu-text text-gray-600 mb-6">
                {searchQuery || statusFilter !== 'all'
                  ? 'اپنے تلاش یا فلٹر کے معیار کو ایڈجسٹ کریں۔'
                  : 'اپنے پہلے کمیٹی رکن کو شامل کرکے شروع کریں۔'}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Link href="/members/add">
                  <Button className="bg-islamic-green hover:bg-islamic-green/90 text-white py-2 px-4 text-sm urdu-text">
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    پہلا رکن شامل کریں
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
        </div>

        {/* Sidebar */}
        <div className="lg:desktop-col-4 space-y-6">

          {/* Stats Summary - Moved to Sidebar */}
          {filteredMembers.length > 0 && (
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="p-4 pb-3">
                <CardTitle className="urdu-heading flex items-center gap-2">
                  <User className="h-5 w-5 ml-2" />
                  {urduTranslations.reports.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 urdu-text">{urduTranslations.totalMembers}</span>
                    <span className="text-lg font-bold text-islamic-green ltr-numbers">{filteredMembers.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 urdu-text">{urduTranslations.activeMembers}</span>
                    <span className="text-lg font-bold text-islamic-green ltr-numbers">
                      {filteredMembers.filter(m => m.status === 'active').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 urdu-text">{urduTranslations.headers.monthlyDues}</span>
                    <span className="text-lg font-bold text-islamic-green ltr-numbers">
                      {formatCurrency(filteredMembers.reduce((sum, m) => sum + m.monthly_dues, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600 urdu-text">{urduTranslations.debts.totalDues}</span>
                    <span className="text-lg font-bold text-red-600 ltr-numbers">
                      {formatCurrency(filteredMembers.reduce((sum, m) => sum + m.total_debt, 0))}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Member Status Breakdown */}
          {filteredMembers.length > 0 && (
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="p-4 pb-3">
                <CardTitle className="urdu-heading flex items-center gap-2">
                  <Filter className="h-5 w-5 ml-2" />
                  ارکان کی تفصیل
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm urdu-text">{urduTranslations.common.active}</span>
                    </div>
                    <span className="font-medium ltr-numbers">
                      {filteredMembers.filter(m => m.status === 'active').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                      <span className="text-sm urdu-text">{urduTranslations.common.inactive}</span>
                    </div>
                    <span className="font-medium ltr-numbers">
                      {filteredMembers.filter(m => m.status === 'inactive').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm urdu-text">واجبات کے ساتھ</span>
                    </div>
                    <span className="font-medium ltr-numbers">
                      {filteredMembers.filter(m => m.total_debt > 0).length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
