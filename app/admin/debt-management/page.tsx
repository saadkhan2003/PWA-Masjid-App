'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  DollarSign, 
  Users, 
  RefreshCw, 
  Settings, 
  Play, 
  CheckCircle, 
  AlertTriangle,
  Info
} from 'lucide-react';
import { 
  scheduleMonthlyDebtGeneration, 
  initializeDebtSystem, 
  generateMonthlyDebts,
  updateOverdueDebts,
  MONTHLY_DUES_AMOUNT 
} from '@/lib/utils/debt-automation';
import { useMembersStore } from '@/lib/stores/members';
import { useDebtsStore } from '@/lib/stores/debts';
import { urduTranslations } from '@/lib/utils/urdu-translations';

export default function DebtManagementPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const { members, refreshMemberDebts } = useMembersStore();
  const { debts, fetchDebts } = useDebtsStore();

  const activeMembers = members.filter(m => m.status === 'active');
  const totalOutstandingDebt = debts
    .filter(d => d.status === 'pending' || d.status === 'overdue')
    .reduce((sum, debt) => sum + debt.amount, 0);
  const overdueDebts = debts.filter(d => d.status === 'overdue');

  const showMessage = (type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleInitializeSystem = async () => {
    setLoading(true);
    try {
      await initializeDebtSystem();
      await refreshMemberDebts();
      await fetchDebts();
      showMessage('success', urduTranslations.debtManagement.messages.systemInitialized);
    } catch (error) {
      console.error('Failed to initialize debt system:', error);
      showMessage('error', urduTranslations.debtManagement.messages.initializeFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMonthlyDebts = async () => {
    setLoading(true);
    try {
      await generateMonthlyDebts();
      await refreshMemberDebts();
      await fetchDebts();
      showMessage('success', urduTranslations.debtManagement.messages.monthlyDebtsGenerated);
    } catch (error) {
      console.error('Failed to generate monthly debts:', error);
      showMessage('error', urduTranslations.debtManagement.messages.generateFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOverdueDebts = async () => {
    setLoading(true);
    try {
      await updateOverdueDebts();
      await fetchDebts();
      showMessage('success', urduTranslations.debtManagement.messages.overdueUpdated);
    } catch (error) {
      console.error('Failed to update overdue debts:', error);
      showMessage('error', urduTranslations.debtManagement.messages.updateFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleFullAutomation = async () => {
    setLoading(true);
    try {
      await scheduleMonthlyDebtGeneration();
      await refreshMemberDebts();
      await fetchDebts();
      showMessage('success', urduTranslations.debtManagement.messages.automationCompleted);
    } catch (error) {
      console.error('Failed to run full automation:', error);
      showMessage('error', urduTranslations.debtManagement.messages.automationFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshData = async () => {
    setLoading(true);
    try {
      await refreshMemberDebts();
      await fetchDebts();
      showMessage('info', urduTranslations.debtManagement.messages.dataRefreshed);
    } catch (error) {
      console.error('Failed to refresh data:', error);
      showMessage('error', urduTranslations.debtManagement.messages.refreshFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container px-3 sm:px-4 lg:px-6 max-w-7xl mx-auto py-3 sm:py-4 lg:py-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 urdu-title">
          {urduTranslations.debtManagement.title}
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1 urdu-text">
          {urduTranslations.debtManagement.subtitle}
        </p>
      </div>

      {/* Message Alert */}
      {message && (
        <div className={`flex items-center gap-3 p-4 rounded-lg border ${
          message.type === 'success' ? 'border-green-200 bg-green-50' :
          message.type === 'error' ? 'border-red-200 bg-red-50' :
          'border-blue-200 bg-blue-50'
        }`}>
          {message.type === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
          {message.type === 'error' && <AlertTriangle className="h-4 w-4 text-red-600" />}
          {message.type === 'info' && <Info className="h-4 w-4 text-blue-600" />}
          <div className={`text-sm ${
            message.type === 'success' ? 'text-green-800' :
            message.type === 'error' ? 'text-red-800' :
            'text-blue-800'
          }`}>
            {message.text}
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-xl font-bold">{activeMembers.length}</div>
                <div className="text-sm text-gray-500 urdu-text">{urduTranslations.debtManagement.activeMembers}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-xl font-bold">Rs {MONTHLY_DUES_AMOUNT}</div>
                <div className="text-sm text-gray-500 urdu-text">{urduTranslations.debtManagement.monthlyDues}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <div className="text-xl font-bold">Rs {totalOutstandingDebt}</div>
                <div className="text-sm text-gray-500 urdu-text">{urduTranslations.debtManagement.outstandingDebt}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-xl font-bold">{overdueDebts.length}</div>
                <div className="text-sm text-gray-500 urdu-text">{urduTranslations.debtManagement.overdueDebts}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 urdu-text">
            <Info className="h-5 w-5" />
            {urduTranslations.debtManagement.howSystemWorks}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2 urdu-text">{urduTranslations.debtManagement.automaticGeneration}</h4>
            <ul className="text-sm text-blue-800 space-y-1 urdu-text">
              <li>• {urduTranslations.debtManagement.systemPoints.monthlyDebt.replace('{amount}', MONTHLY_DUES_AMOUNT.toString())}</li>
              <li>• {urduTranslations.debtManagement.systemPoints.accumulate} (جیسے: 3 مہینے غیر ادا = Rs {MONTHLY_DUES_AMOUNT * 3})</li>
              <li>• {urduTranslations.debtManagement.systemPoints.historicalDebts}</li>
              <li>• {urduTranslations.debtManagement.systemPoints.oldestFirst}</li>
            </ul>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2 urdu-text">{urduTranslations.debtManagement.paymentProcessing}</h4>
            <ul className="text-sm text-green-800 space-y-1 urdu-text">
              <li>• جب کوئی رکن ادائیگی کرتا ہے تو سب سے پرانے واجبات پہلے صاف ہوتے ہیں</li>
              <li>• {urduTranslations.debtManagement.systemPoints.partialPayments}</li>
              <li>• {urduTranslations.debtManagement.systemPoints.autoUpdate}</li>
              <li>• {urduTranslations.debtManagement.systemPoints.receiptTracking}</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Automation Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 urdu-text">
              <Settings className="h-5 w-5" />
              {urduTranslations.debtManagement.quickActions}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleInitializeSystem}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
              <span className="urdu-text">{urduTranslations.debtManagement.initializeSystem}</span>
            </Button>
            <p className="text-xs text-gray-600 urdu-text">
              {urduTranslations.debtManagement.initializeDesc}
            </p>

            <Button 
              onClick={handleGenerateMonthlyDebts}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Calendar className="h-4 w-4 mr-2" />}
              <span className="urdu-text">{urduTranslations.debtManagement.generateMonthlyDebts}</span>
            </Button>
            <p className="text-xs text-gray-600 urdu-text">
              {urduTranslations.debtManagement.generateDesc}
            </p>

            <Button 
              onClick={handleUpdateOverdueDebts}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <AlertTriangle className="h-4 w-4 mr-2" />}
              <span className="urdu-text">{urduTranslations.debtManagement.updateOverdueStatus}</span>
            </Button>
            <p className="text-xs text-gray-600 urdu-text">
              {urduTranslations.debtManagement.updateDesc}
            </p>
          </CardContent>
        </Card>

        {/* Full Automation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 urdu-text">
              <RefreshCw className="h-5 w-5" />
              {urduTranslations.debtManagement.fullAutomation}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleFullAutomation}
              disabled={loading}
              className="w-full bg-islamic-green hover:bg-islamic-green/90"
            >
              {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
              <span className="urdu-text">{urduTranslations.debtManagement.runFullAutomation}</span>
            </Button>
            <p className="text-xs text-gray-600 urdu-text">
              {urduTranslations.debtManagement.fullAutomationDesc}
            </p>

            <Button 
              onClick={handleRefreshData}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              <span className="urdu-text">{urduTranslations.debtManagement.refreshAllData}</span>
            </Button>
            <p className="text-xs text-gray-600 urdu-text">
              {urduTranslations.debtManagement.refreshDesc}
            </p>

            <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="font-medium text-yellow-900 mb-2 urdu-text">{urduTranslations.debtManagement.automationSchedule}</h4>
              <p className="text-sm text-yellow-800 urdu-text">
                {urduTranslations.debtManagement.scheduleDesc}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="urdu-text">{urduTranslations.debtManagement.currentSystemStatus}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 urdu-text">{urduTranslations.debtManagement.activeMembers}</h4>
              <p className="text-2xl font-bold text-blue-600">{activeMembers.length}</p>
              <p className="text-sm text-blue-700 urdu-text">
                {urduTranslations.debtManagement.expectedMonthlyCollection}: Rs {activeMembers.length * MONTHLY_DUES_AMOUNT}
              </p>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-medium text-red-900 urdu-text">{urduTranslations.debtManagement.outstandingDebt}</h4>
              <p className="text-2xl font-bold text-red-600">Rs {totalOutstandingDebt}</p>
              <p className="text-sm text-red-700 urdu-text">
                {urduTranslations.debtManagement.fromPendingDebts} {debts.filter(d => d.status === 'pending' || d.status === 'overdue').length} واجبات
              </p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900 urdu-text">{urduTranslations.debtManagement.systemHealth}</h4>
              <p className="text-lg font-bold text-green-600 urdu-text">
                {debts.length > 0 ? urduTranslations.debtManagement.active : urduTranslations.debtManagement.needsSetup}
              </p>
              <p className="text-sm text-green-700 urdu-text">
                {debts.length} {urduTranslations.debtManagement.totalDebtEntries} {urduTranslations.debtManagement.inSystem}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}