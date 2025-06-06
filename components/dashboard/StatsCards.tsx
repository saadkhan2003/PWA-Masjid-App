'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, AlertTriangle, TrendingUp } from 'lucide-react';
import { useDashboardStore } from '@/lib/stores/dashboard';
import { formatCurrency } from '@/lib/utils/currency';
import { urduTranslations } from '@/lib/utils/urdu-translations';

export function StatsCards() {
  const { stats, loading } = useDashboardStore();

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Get safe values to prevent rendering errors
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  
  // Make sure we have valid stats data before calculations
  const totalMembers = stats?.totalMembers || 0;
  const activeMembers = stats?.activeMembers || 0;
  const monthlyCollection = stats?.monthlyCollection || 0;
  const outstandingDebts = stats?.outstandingDebts || 0;
  const recentPayments = stats?.recentPayments || [];
  const overdueDebts = stats?.overdueDebts || [];
  
  // Calculate percentage of active members
  const activePercentage = totalMembers > 0 
    ? Math.round((activeMembers / totalMembers) * 100) 
    : 0;
  
  // Calculate total payment amount from recent payments
  const recentPaymentsTotal = recentPayments.reduce(
    (sum, payment) => sum + (payment?.amount || 0), 0
  );
  
  const cards = [
    {
      title: 'کل ارکان', // Total Members
      value: totalMembers,
      subtitle: `${activeMembers} فعال ارکان (${activePercentage}%)`, // active members
      icon: Users,
      color: 'from-islamic-green to-islamic-green-light',
      textColor: 'text-white'
    },
    {
      title: 'ماہانہ وصولی', // Monthly Collection
      value: formatCurrency(monthlyCollection),
      subtitle: `${currentMonth}/${currentYear} کی ادائیگیاں`, // This month's payments
      icon: DollarSign,
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-white'
    },
    {
      title: 'باقی واجبات', // Outstanding Debts
      value: formatCurrency(outstandingDebts),
      subtitle: `${overdueDebts.length} ادائیگی باقی`, // overdue items
      icon: AlertTriangle,
      color: 'from-red-500 to-red-600',
      textColor: 'text-white'
    },
    {
      title: 'حالیہ ادائیگیاں', // Recent Payments
      value: recentPayments.length,
      subtitle: `${formatCurrency(recentPaymentsTotal)} کل رقم`, // Total amount
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
      textColor: 'text-white'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className={`bg-gradient-to-r ${card.color} ${card.textColor} border-0 shadow-lg hover:shadow-xl transition-shadow`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm md:text-base font-medium opacity-95 urdu-text">
                {card.title}
              </CardTitle>
              <Icon className="h-5 w-5 opacity-85 ml-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold mb-2 ltr-numbers">
                {card.value}
              </div>
              <p className="text-xs md:text-sm opacity-90 urdu-text leading-relaxed">
                {card.subtitle}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
