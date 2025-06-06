'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, AlertTriangle, Calendar, User, DollarSign, Clock } from 'lucide-react';
import { useDebtsStore } from '@/lib/stores/debts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/dates';
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
      alert('Debt marked as paid successfully!');
    } catch (error) {
      console.error('Error marking debt as paid:', error);
      alert('Failed to mark debt as paid. Please try again.');
    }
  };

  const handleSendReminder = async (debt: any) => {
    try {
      if (!debt.member?.phone) {
        alert('No phone number available for this member.');
        return;
      }

      const cleanPhone = debt.member.phone.replace(/\D/g, '');
      const message = `Assalamu Alaikum ${debt.member.name}, this is a reminder about your outstanding debt of ${formatCurrency(debt.amount)} due on ${formatDate(debt.due_date)}. Please contact the mosque committee for payment arrangements. JazakAllah Khair.`;
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
      
      window.open(whatsappUrl, '_blank');
      
      console.log(`Sent reminder for debt ${debt.id} to ${debt.member.name}`);
    } catch (error) {
      console.error('Error sending reminder:', error);
      alert('Failed to send reminder. Please try again.');
    }
  };

  const handleViewDetails = (debt: any) => {
    // In a real app, this could open a modal or navigate to a detail page
    const details = `
Debt Details:
Member: ${debt.member?.name}
Amount: ${formatCurrency(debt.amount)}
Due Date: ${formatDate(debt.due_date)}
Status: ${debt.status.charAt(0).toUpperCase() + debt.status.slice(1)}
Description: ${debt.description}
Created: ${formatDate(debt.created_at)}
    `.trim();
    
    alert(details);
  };

  const handleSendOverdueReminders = async () => {
    const overdueDebts = debts.filter(debt => debt.status === 'overdue' && debt.member?.phone);
    
    if (overdueDebts.length === 0) {
      alert('No overdue debts with phone numbers found.');
      return;
    }

    const confirmMessage = `Send WhatsApp reminders to ${overdueDebts.length} member(s) with overdue debts?`;
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

    alert(`Successfully initiated ${successCount} reminder(s).`);
  };

  const handleBulkPaymentEntry = () => {
    // Navigate to bulk payment entry functionality
    const confirmAction = confirm('Record Bulk Payments?\n\nThis will redirect you to record multiple payments at once to help reduce outstanding debts.');
    
    if (confirmAction) {
      // Navigate to payments page to add bulk payments
      window.location.href = '/payments/add?mode=bulk&source=debts';
    }
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
DEBT MANAGEMENT REPORT
Generated: ${formatDate(new Date().toISOString())}

Summary:
- Total Debts: ${reportData.totalDebts}
- Total Amount: ${formatCurrency(reportData.totalAmount)}
- Overdue: ${reportData.overdueDebts}
- Pending: ${reportData.pendingDebts}
- Paid: ${reportData.paidDebts}

Detailed List:
${debts.map(debt => 
  `${debt.member?.name}: ${formatCurrency(debt.amount)} (${debt.status.toUpperCase()})`
).join('\n')}
    `.trim();

    // In a real app, this could generate a PDF or export to CSV
    console.log('Generated debt report:', report);
    alert('Debt report generated! Check the console for details.\n\nIn a full implementation, this would download a PDF or CSV file.');
  };

  const handleMemberDebtSummary = () => {
    const memberSummary = debts.reduce((acc, debt) => {
      const memberName = debt.member?.name || 'Unknown Member';
      if (!acc[memberName]) {
        acc[memberName] = { totalDebt: 0, count: 0, statuses: [] };
      }
      acc[memberName].totalDebt += debt.amount;
      acc[memberName].count += 1;
      acc[memberName].statuses.push(debt.status);
      return acc;
    }, {} as Record<string, { totalDebt: number; count: number; statuses: string[] }>);

    const summaryText = Object.entries(memberSummary)
      .map(([name, data]) => 
        `${name}: ${formatCurrency(data.totalDebt)} (${data.count} debt(s))`
      )
      .join('\n');

    alert(`MEMBER DEBT SUMMARY:\n\n${summaryText}`);
  };

  const filteredDebts = debts.filter(debt => {
    const matchesSearch = debt.member?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         debt.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || debt.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalAmount = filteredDebts.reduce((sum, debt) => sum + debt.amount, 0);
  const overdueCount = filteredDebts.filter(debt => debt.status === 'overdue').length;

  function getStatusIcon(status: string) {
    switch (status) {
      case 'overdue':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'paid':
        return <span className="w-4 h-4 text-green-500">✓</span>;
      default:
        return null;
    }
  }

  if (loading) {
    return (
      <div className="mobile-container">
        <div className="mobile-skeleton h-8 w-48 mb-4"></div>
        <div className="mobile-skeleton h-64 w-full"></div>
      </div>
    );
  }

  return (
    <div className="mobile-container desktop-p-6 mobile-fade-in">
      <div className="desktop-grid desktop-gap-6">
      {/* Header */}
      <div className="mobile-header-section">
        <div className="mobile-header-content">
          <h1 className="urdu-title">Debt Management</h1>
          <p className="urdu-text">
            Track and manage outstanding debts and dues
          </p>
        </div>
        <Link href="/debts/add" className="mobile-button-link">
          <Button className="mobile-button-primary mobile-touch-target">
            <Plus className="mobile-icon" />
            <span className="hidden sm:inline">Add Debt Record</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="mobile-card desktop-col-8">
        <div className="mobile-card-content">
          <div className="mobile-search-section">
            <div className="mobile-search-container">
              <Search className="mobile-search-icon" />
              <Input
                placeholder="Search debts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mobile-search-input"
              />
            </div>
            <div className="mobile-filter-pills">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
                size="sm"
                className="mobile-filter-pill"
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'overdue' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('overdue')}
                size="sm"
                className="mobile-filter-pill mobile-filter-pill-danger"
              >
                Overdue
              </Button>
              <Button
                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('pending')}
                size="sm"
                className="mobile-filter-pill mobile-filter-pill-warning"
              >
                Pending
              </Button>
              <Button
                variant={statusFilter === 'paid' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('paid')}
                size="sm"
                className="mobile-filter-pill mobile-filter-pill-success"
              >
                Paid
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 desktop-col-12">
        <div className="mobile-stat-card mobile-animation-delay-100">
          <div className="mobile-stat-icon-container">
            <AlertTriangle className="mobile-stat-icon" />
          </div>
          <div className="mobile-stat-content">
            <div className="mobile-stat-number">{filteredDebts.length}</div>
            <div className="mobile-stat-label">Total Debts</div>
          </div>
        </div>
        
        <div className="mobile-stat-card mobile-animation-delay-200">
          <div className="mobile-stat-icon-container">
            <DollarSign className="mobile-stat-icon" />
          </div>
          <div className="mobile-stat-content">
            <div className="mobile-stat-number">
              {formatCurrency(totalAmount)}
            </div>
            <div className="mobile-stat-label">Total Amount</div>
          </div>
        </div>
        
        <div className="mobile-stat-card mobile-animation-delay-300">
          <div className="mobile-stat-icon-container">
            <Clock className="mobile-stat-icon" />
          </div>
          <div className="mobile-stat-content">
            <div className="mobile-stat-number">{overdueCount}</div>
            <div className="mobile-stat-label">Overdue</div>
          </div>
        </div>
        
        <div className="mobile-stat-card mobile-animation-delay-400">
          <div className="mobile-stat-icon-container">
            <User className="mobile-stat-icon" />
          </div>
          <div className="mobile-stat-content">
            <div className="mobile-stat-number">
              {new Set(filteredDebts.map(d => d.member_id)).size}
            </div>
            <div className="mobile-stat-label">Members with Debt</div>
          </div>
        </div>
      </div>

      {/* Debts List */}
      <div className="mobile-card desktop-col-8">
        <div className="mobile-card-header rtl-container">
          <h2 className="urdu-heading">Debt Records</h2>
        </div>
        <div className="mobile-card-content">
          {filteredDebts.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredDebts.map((debt, index) => (
                <div
                  key={debt.id}
                  className={`mobile-debt-card mobile-animation-delay-${(index % 3 + 1) * 100} ${
                    debt.status === 'overdue' ? 'mobile-debt-card-overdue' : 
                    debt.status === 'pending' ? 'mobile-debt-card-pending' : 
                    'mobile-debt-card-normal'
                  }`}
                >
                  <div className="mobile-debt-header">
                    <div className="mobile-debt-member">
                      <User className="mobile-debt-icon" />
                      <span className="mobile-debt-name">{debt.member?.name}</span>
                    </div>
                    <span className={`mobile-badge ${
                      debt.status === 'overdue' ? 'mobile-badge-danger' :
                      debt.status === 'pending' ? 'mobile-badge-warning' :
                      'mobile-badge-success'
                    }`}>
                      {debt.status.charAt(0).toUpperCase() + debt.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="mobile-debt-details">
                    <div className="mobile-debt-meta">
                      <div className="mobile-debt-due-date">
                        <Calendar className="mobile-meta-icon" />
                        <span>Due: {formatDate(debt.due_date)}</span>
                      </div>
                      {debt.status === 'overdue' && (
                        <div className="mobile-debt-overdue-indicator">
                          <AlertTriangle className="mobile-meta-icon" />
                          <span>Overdue</span>
                        </div>
                      )}
                    </div>
                    
                    {debt.description && (
                      <p className="mobile-debt-description">{debt.description}</p>
                    )}
                    
                    <div className="mobile-debt-created">
                      Added: {formatDate(debt.created_at)}
                    </div>
                  </div>
                  
                  <div className="mobile-debt-footer">
                    <div className="mobile-debt-amount-container">
                      {getStatusIcon(debt.status)}
                      <span className={`mobile-debt-amount ${
                        debt.status === 'overdue' ? 'mobile-debt-amount-danger' : 
                        debt.status === 'pending' ? 'mobile-debt-amount-warning' : 
                        'mobile-debt-amount-success'
                      }`}>
                        {formatCurrency(debt.amount)}
                      </span>
                    </div>
                    
                    <div className="mobile-debt-actions">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mobile-button-secondary"
                        onClick={() => handleViewDetails(debt)}
                      >
                        <span className="hidden sm:inline">View Details</span>
                        <span className="sm:hidden">View</span>
                      </Button>
                      {debt.status !== 'paid' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mobile-button-secondary"
                          onClick={() => handleMarkAsPaid(debt.id)}
                        >
                          <span className="hidden sm:inline">Mark as Paid</span>
                          <span className="sm:hidden">Paid</span>
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mobile-button-secondary"
                        onClick={() => handleSendReminder(debt)}
                      >
                        <span className="hidden sm:inline">Send Reminder</span>
                        <span className="sm:hidden">Remind</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mobile-empty-state">
              <div className="mobile-empty-icon-container">
                <AlertTriangle className="mobile-empty-icon" />
              </div>
              <h3 className="urdu-heading">
                {searchQuery || statusFilter !== 'all' ? 'No debts found' : 'No outstanding debts'}
              </h3>
              <p className="urdu-text">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Great! All members are up to date with their payments.'}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Link href="/debts/add" className="mobile-button-link">
                  <Button className="mobile-button-primary mobile-touch-target">
                    <Plus className="mobile-icon" />
                    Add Debt Record
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      {filteredDebts.length > 0 && (
        <div className="mobile-card desktop-col-4">
          <div className="mobile-card-header rtl-container">
            <h2 className="urdu-heading">Quick Actions</h2>
          </div>
          <div className="mobile-card-content">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="mobile-quick-action-button"
                onClick={handleSendOverdueReminders}
              >
                <AlertTriangle className="mobile-icon" />
                <span className="hidden sm:inline">Send Overdue Reminders</span>
                <span className="sm:hidden">Reminders</span>
              </Button>
              <Button 
                variant="outline" 
                className="mobile-quick-action-button"
                onClick={handleBulkPaymentEntry}
              >
                <DollarSign className="mobile-icon" />
                <span className="hidden sm:inline">Bulk Payment Entry</span>
                <span className="sm:hidden">Bulk Pay</span>
              </Button>
              <Button 
                variant="outline" 
                className="mobile-quick-action-button"
                onClick={handleGenerateDebtReport}
              >
                <Calendar className="mobile-icon" />
                <span className="hidden sm:inline">Generate Debt Report</span>
                <span className="sm:hidden">Report</span>
              </Button>
              <Button 
                variant="outline" 
                className="mobile-quick-action-button"
                onClick={handleMemberDebtSummary}
              >
                <User className="mobile-icon" />
                <span className="hidden sm:inline">Member Debt Summary</span>
                <span className="sm:hidden">Summary</span>
              </Button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
