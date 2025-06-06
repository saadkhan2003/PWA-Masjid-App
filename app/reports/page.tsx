'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { urduTranslations, islamicPhrases } from '@/lib/utils/urdu-translations';
import { formatCurrency } from '@/lib/utils/currency';
import { useMembersStore } from '@/lib/stores/members';
import { usePaymentsStore } from '@/lib/stores/payments';
import { useDebtsStore } from '@/lib/stores/debts';
import {
  BarChart3,
  Download,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  FileText,
  Filter,
  RefreshCw,
  Printer
} from 'lucide-react';

interface ReportData {
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  totalPayments: number;
  totalDebts: number;
  monthlyPayments: Array<{ month: string; amount: number; year: number; monthNum: number; paymentCount: number }>;
  topContributors: Array<{ name: string; amount: number; memberId: string }>;
  debtsByStatus: Array<{ status: string; amount: number; count: number }>;
  recentPayments: Array<{ memberName: string; amount: number; date: string }>;
}

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState('summary');
  const [dateRange, setDateRange] = useState('thisMonth');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  // Store hooks
  const { members, fetchMembers, loading: membersLoading } = useMembersStore();
  const { payments, fetchPayments, loading: paymentsLoading } = usePaymentsStore();
  const { debts, fetchDebts, loading: debtsLoading } = useDebtsStore();

  // Fetch data on component mount
  useEffect(() => {
    fetchMembers();
    fetchPayments();
    fetchDebts();
  }, [fetchMembers, fetchPayments, fetchDebts]);

  // Get date range filters
  const getDateFilters = () => {
    const now = new Date();
    let startDateFilter: Date;
    let endDateFilter: Date = new Date(now.getFullYear(), now.getMonth() + 1, 0); // End of current month

    switch (dateRange) {
      case 'thisWeek':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startDateFilter = startOfWeek;
        endDateFilter = new Date(now);
        break;
      case 'thisMonth':
        startDateFilter = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'lastMonth':
        startDateFilter = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDateFilter = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'last3Months':
        startDateFilter = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case 'thisYear':
        startDateFilter = new Date(now.getFullYear(), 0, 1);
        endDateFilter = new Date(now.getFullYear(), 11, 31);
        break;
      case 'custom':
        if (startDate && endDate) {
          startDateFilter = new Date(startDate);
          endDateFilter = new Date(endDate);
        } else {
          // Default to this month if custom dates not set
          startDateFilter = new Date(now.getFullYear(), now.getMonth(), 1);
        }
        break;
      default:
        startDateFilter = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return { startDateFilter, endDateFilter };
  };

  // Generate real report data
  const generateRealReportData = (): ReportData => {
    const { startDateFilter, endDateFilter } = getDateFilters();

    // Filter payments by date range
    const filteredPayments = payments.filter(payment => {
      const paymentDate = new Date(payment.payment_date);
      return paymentDate >= startDateFilter && paymentDate <= endDateFilter;
    });

    // Filter debts (all outstanding debts regardless of date for debt totals)
    const outstandingDebts = debts.filter(debt => debt.status === 'pending' || debt.status === 'overdue');

    // Calculate monthly payments for the last 6 months
    const monthlyPayments = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthNum = monthDate.getMonth() + 1;
      const year = monthDate.getFullYear();
      
      // Filter payments by actual payment_date instead of month/year fields
      const monthPayments = payments.filter(payment => {
        const paymentDate = new Date(payment.payment_date);
        return paymentDate.getMonth() + 1 === monthNum && paymentDate.getFullYear() === year;
      });
      
      const totalAmount = monthPayments.reduce((sum, payment) => sum + payment.amount, 0);
      
      monthlyPayments.push({
        month: urduTranslations.months[Object.keys(urduTranslations.months)[monthDate.getMonth()] as keyof typeof urduTranslations.months],
        amount: totalAmount,
        year,
        monthNum,
        paymentCount: monthPayments.length // Add payment count for debugging
      });
    }

    // Calculate top contributors
    const memberPayments = new Map<string, { amount: number; name: string }>();
    
    filteredPayments.forEach(payment => {
      const member = members.find(m => m.id === payment.member_id);
      if (member) {
        const existing = memberPayments.get(payment.member_id) || { amount: 0, name: member.name };
        memberPayments.set(payment.member_id, {
          amount: existing.amount + payment.amount,
          name: member.name
        });
      }
    });

    const topContributors = Array.from(memberPayments.entries())
      .map(([memberId, data]) => ({
        memberId,
        name: data.name,
        amount: data.amount
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Calculate debts by status
    const debtsByStatus = [
      {
        status: urduTranslations.status.pending,
        amount: debts.filter(d => d.status === 'pending').reduce((sum, d) => sum + d.amount, 0),
        count: debts.filter(d => d.status === 'pending').length
      },
      {
        status: urduTranslations.status.overdue,
        amount: debts.filter(d => d.status === 'overdue').reduce((sum, d) => sum + d.amount, 0),
        count: debts.filter(d => d.status === 'overdue').length
      },
      {
        status: urduTranslations.status.paid,
        amount: debts.filter(d => d.status === 'paid').reduce((sum, d) => sum + d.amount, 0),
        count: debts.filter(d => d.status === 'paid').length
      }
    ];

    // Get recent payments (last 10)
    const recentPayments = payments
      .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())
      .slice(0, 10)
      .map(payment => {
        const member = members.find(m => m.id === payment.member_id);
        return {
          memberName: member?.name || 'Unknown Member',
          amount: payment.amount,
          date: payment.payment_date
        };
      });

    return {
      totalMembers: members.length,
      activeMembers: members.filter(m => m.status === 'active').length,
      inactiveMembers: members.filter(m => m.status === 'inactive').length,
      totalPayments: filteredPayments.reduce((sum, payment) => sum + payment.amount, 0),
      totalDebts: outstandingDebts.reduce((sum, debt) => sum + debt.amount, 0),
      monthlyPayments,
      topContributors,
      debtsByStatus,
      recentPayments
    };
  };

  // Handler functions
  const handleGenerateReport = async () => {
    if (membersLoading || paymentsLoading || debtsLoading) {
      alert('Please wait for data to load before generating reports.');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Debug: Log payment data
      console.log('Total payments available:', payments.length);
      console.log('Sample payment:', payments[0]);
      
      // Generate real report data
      const generatedData = generateRealReportData();
      
      // Debug: Log monthly payments calculation
      console.log('Generated monthly payments:', generatedData.monthlyPayments);
      
      setReportData(generatedData);
      
      // Show success notification
      alert(`${getReportTitle()} ${urduTranslations.reportGenerated}`);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportReport = () => {
    if (!reportData) {
      alert(urduTranslations.generateReportFirst);
      return;
    }

    // Create CSV content based on report type
    let csvContent = '';
    
    if (selectedReport === 'summary') {
      csvContent = `${urduTranslations.mosqueCommitteeReport} - ${urduTranslations.summaryReport}
${urduTranslations.generatedOn}: ${new Date().toLocaleDateString()}
${urduTranslations.dateRange}: ${getDateRangeText()}

${urduTranslations.overview.toUpperCase()}
${urduTranslations.totalMembers},${reportData.totalMembers}
${urduTranslations.activeMembers},${reportData.activeMembers}
${urduTranslations.totalPayments},${reportData.totalPayments}
${urduTranslations.totalDebts},${reportData.totalDebts}

${urduTranslations.monthlyPayments.toUpperCase()}
${urduTranslations.month},${urduTranslations.amount},Payments Count
${reportData.monthlyPayments.map(p => `${p.month},${p.amount},${p.paymentCount}`).join('\n')}

${urduTranslations.topContributors.toUpperCase()}
${urduTranslations.name},${urduTranslations.amount}
${reportData.topContributors.map(c => `${c.name},${c.amount}`).join('\n')}

${'واجبات بذریعہ حالت'.toUpperCase()}
${urduTranslations.common.status},${urduTranslations.common.amount}
${reportData.debtsByStatus.map(d => `${d.status},${d.amount}`).join('\n')}`;
    } else if (selectedReport === 'financial') {
      csvContent = `${urduTranslations.financialReport}
${urduTranslations.generatedOn}: ${new Date().toLocaleDateString()}

${urduTranslations.reports.financialSummary.toUpperCase()}
${urduTranslations.totalRevenue},${reportData.totalPayments}
${urduTranslations.outstandingDebts},${reportData.totalDebts}
${urduTranslations.netPosition},${reportData.totalPayments - reportData.totalDebts}

${urduTranslations.monthlyBreakdown.toUpperCase()}
${reportData.monthlyPayments.map(p => `${p.month},${p.amount}`).join('\n')}`;
    } else if (selectedReport === 'members') {
      csvContent = `${urduTranslations.membersReport}
${urduTranslations.generatedOn}: ${new Date().toLocaleDateString()}

${urduTranslations.memberStatistics.toUpperCase()}
${urduTranslations.totalMembers},${reportData.totalMembers}
${urduTranslations.activeMembers},${reportData.activeMembers}
${urduTranslations.inactiveMembers},${reportData.totalMembers - reportData.activeMembers}
${urduTranslations.activityRate},${((reportData.activeMembers / reportData.totalMembers) * 100).toFixed(1)}%`;
    }

    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `${selectedReport}_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    alert(urduTranslations.reportExported);
  };

  const handlePrintReport = () => {
    if (!reportData) {
      alert(urduTranslations.generateReportFirst);
      return;
    }

    // Create a printable version
    const printContent = `
<!DOCTYPE html>
<html>
<head>
    <title>${getReportTitle()}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; border-bottom: 2px solid #059669; padding-bottom: 10px; margin-bottom: 20px; }
        .section { margin-bottom: 20px; }
        .section h3 { color: #059669; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
        th { background-color: #f3f4f6; }
        .stats { display: flex; justify-content: space-around; margin-bottom: 20px; }
        .stat { text-align: center; }
        .stat-number { font-size: 24px; font-weight: bold; color: #059669; }
        @media print { .no-print { display: none; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>🕌 Mosque Committee</h1>
        <h2>${getReportTitle()}</h2>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
        <p>Period: ${getDateRangeText()}</p>
    </div>
    
    <div class="stats">
        <div class="stat">
            <div class="stat-number">${reportData.totalMembers}</div>
            <div>Total Members</div>
        </div>
        <div class="stat">
            <div class="stat-number">${reportData.activeMembers}</div>
            <div>Active Members</div>
        </div>
        <div class="stat">
            <div class="stat-number">$${reportData.totalPayments.toLocaleString()}</div>
            <div>Total Payments</div>
        </div>
        <div class="stat">
            <div class="stat-number">$${reportData.totalDebts.toLocaleString()}</div>
            <div>Total Debts</div>
        </div>
    </div>

    <div class="section">
        <h3>Monthly Payments</h3>
        <table>
            <thead><tr><th>Month</th><th>Amount</th></tr></thead>
            <tbody>
                ${reportData.monthlyPayments.map(p => `<tr><td>${p.month}</td><td>$${p.amount.toLocaleString()}</td></tr>`).join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h3>Top Contributors</h3>
        <table>
            <thead><tr><th>Rank</th><th>Name</th><th>Amount</th></tr></thead>
            <tbody>
                ${reportData.topContributors.map((c, i) => `<tr><td>#${i + 1}</td><td>${c.name}</td><td>$${c.amount.toLocaleString()}</td></tr>`).join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h3>Outstanding Debts by Status</h3>
        <table>
            <thead><tr><th>Status</th><th>Amount</th><th>Count</th></tr></thead>
            <tbody>
                ${reportData.debtsByStatus.map(d => `<tr><td>${d.status}</td><td>$${d.amount.toLocaleString()}</td><td>${d.count}</td></tr>`).join('')}
            </tbody>
        </table>
    </div>
</body>
</html>`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  const getReportTitle = () => {
    const titles = {
      summary: urduTranslations.summaryReport,
      financial: urduTranslations.financialReport, 
      members: urduTranslations.membersReport,
      debts: urduTranslations.debtsReport
    };
    return titles[selectedReport as keyof typeof titles] || urduTranslations.report;
  };

  const getDateRangeText = () => {
    const ranges = {
      thisWeek: urduTranslations.thisWeek,
      thisMonth: urduTranslations.thisMonth,
      lastMonth: urduTranslations.lastMonth, 
      last3Months: urduTranslations.last3Months,
      thisYear: urduTranslations.thisYear,
      custom: startDate && endDate ? `${startDate} ${urduTranslations.to} ${endDate}` : urduTranslations.customRange
    };
    return ranges[dateRange as keyof typeof ranges] || dateRange;
  };

  return (
    <div className="mobile-container desktop-p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="urdu-title text-islamic-green">{urduTranslations.reportsAnalytics}</h1>
          <p className="urdu-text text-gray-600 mt-1">{urduTranslations.generateComprehensiveReports}</p>
        </div>
      </div>

      {/* Report Configuration - Wider on desktop */}
      <Card className="p-6 desktop-col-8">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="reportType" className="urdu-text">{urduTranslations.reportType}</Label>
              <Select
                value={selectedReport}
                onValueChange={setSelectedReport}
              >
                <SelectTrigger>
                  <SelectValue placeholder={urduTranslations.selectReportType} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">{urduTranslations.summaryReport}</SelectItem>
                  <SelectItem value="financial">{urduTranslations.financialReport}</SelectItem>
                  <SelectItem value="members">{urduTranslations.membersReport}</SelectItem>
                  <SelectItem value="debts">{urduTranslations.debtsReport}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dateRange" className="urdu-text">{urduTranslations.dateRange}</Label>
              <Select
                value={dateRange}
                onValueChange={setDateRange}
              >
                <SelectTrigger>
                  <SelectValue placeholder={urduTranslations.selectDateRange} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="thisWeek">{urduTranslations.thisWeek}</SelectItem>
                  <SelectItem value="thisMonth">{urduTranslations.thisMonth}</SelectItem>
                  <SelectItem value="lastMonth">{urduTranslations.lastMonth}</SelectItem>
                  <SelectItem value="last3Months">{urduTranslations.last3Months}</SelectItem>
                  <SelectItem value="thisYear">{urduTranslations.thisYear}</SelectItem>
                  <SelectItem value="custom">{urduTranslations.customRange}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {dateRange === 'custom' && (
              <>
                <div>
                  <Label htmlFor="startDate" className="urdu-text">{urduTranslations.startDate}</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="endDate" className="urdu-text">{urduTranslations.endDate}</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <BarChart3 className="w-4 h-4" />
              )}
              {isGenerating ? urduTranslations.generatingReport : urduTranslations.generateReport}
            </Button>

            {reportData && (
              <>
                <Button
                  onClick={handleExportReport}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {urduTranslations.exportCSV}
                </Button>

                <Button
                  onClick={handlePrintReport}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  {urduTranslations.printReport}
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Report Display */}
      {isGenerating && (
        <Card className="p-12 text-center">
          <RefreshCw className="w-16 h-16 text-islamic-green mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2 urdu-text">
            {urduTranslations.generatingReport.replace('...', '')} {getReportTitle()}...
          </h3>
          <p className="text-gray-600 urdu-text">
            {urduTranslations.pleaseWaitCompilingData}
          </p>
        </Card>
      )}

      {reportData && !isGenerating && (
        <div className="desktop-grid desktop-gap-6">
          {/* Summary Cards - Full width desktop row */}
          <div className="desktop-col-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 urdu-text">{urduTranslations.totalMembers}</p>
                  <p className="text-2xl font-bold">{reportData.totalMembers}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 urdu-text">{urduTranslations.activeMembers}</p>
                  <p className="text-2xl font-bold">{reportData.activeMembers}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 p-3 rounded-lg">
                  <DollarSign className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 urdu-text">{urduTranslations.totalPayments}</p>
                  <p className="text-2xl font-bold">{formatCurrency(reportData.totalPayments)}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-3 rounded-lg">
                  <Calendar className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 urdu-text">{urduTranslations.totalDebts}</p>
                  <p className="text-2xl font-bold">{formatCurrency(reportData.totalDebts)}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Charts and Details */}
          <div className="desktop-grid desktop-gap-6">
            {/* Monthly Payments */}
            <Card className="p-6 desktop-col-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 urdu-text">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
                {urduTranslations.monthlyPayments}
              </h3>
              <div className="space-y-3">
                {reportData.monthlyPayments.map((payment, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{payment.month}</span>
                      {payment.paymentCount > 0 && (
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                          {payment.paymentCount} {payment.paymentCount === 1 ? 'payment' : 'payments'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 flex-1 mx-4">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-emerald-500 h-2 rounded-full"
                          style={{
                            width: `${payment.amount > 0 ? Math.max((payment.amount / Math.max(...reportData.monthlyPayments.map(p => p.amount))) * 100, 5) : 0}%`
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold">
                        {formatCurrency(payment.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Top Contributors */}
            <Card className="p-6 desktop-col-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 urdu-text">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                {urduTranslations.topContributors}
              </h3>
              <div className="space-y-3">
                {reportData.topContributors.map((contributor, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        #{index + 1}
                      </span>
                      <span className="text-sm font-medium">{contributor.name}</span>
                    </div>
                    <span className="text-sm font-semibold">
                      {formatCurrency(contributor.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Debts by Status */}
          <Card className="p-6 desktop-col-12">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 urdu-text">
              <FileText className="w-5 h-5 text-red-600" />
              واجبات بذریعہ حالت
            </h3>
            <div className="space-y-3">
              {reportData.debtsByStatus.map((debt: { status: string; amount: number; count: number }, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{debt.status}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {debt.count} {debt.count === 1 ? 'entry' : 'entries'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-1 mx-4">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{
                          width: `${(debt.amount / Math.max(...reportData.debtsByStatus.map((d: { amount: number }) => d.amount))) * 100}%`
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-red-600">
                      {formatCurrency(debt.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {!reportData && !isGenerating && (
        <Card className="p-12 text-center">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2 urdu-text">
            {urduTranslations.noReportGenerated}
          </h3>
          <p className="text-gray-600 mb-6 urdu-text">
            {urduTranslations.configureReportSettings}
          </p>
          <Button
            onClick={handleGenerateReport}
            className="flex items-center gap-2 mx-auto"
          >
            <BarChart3 className="w-4 h-4" />
            {urduTranslations.generateFirstReport}
          </Button>
        </Card>
      )}
    </div>
  );
}
