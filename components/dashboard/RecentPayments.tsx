'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardStore } from '@/lib/stores/dashboard';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/dates';
import { urduTranslations } from '@/lib/utils/urdu-translations';

export function RecentPayments() {
  const { stats, loading } = useDashboardStore();

  if (loading || !stats?.recentPayments.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-islamic-green urdu-heading">حالیہ ادائیگیاں</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse flex justify-between items-center py-2">
                  <div className="space-y-1">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8 urdu-text">کوئی حالیہ ادائیگی نہیں</p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-islamic-green urdu-heading">حالیہ ادائیگیاں</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {stats.recentPayments.map((payment) => (
            <div key={payment.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
              <div>
                <p className="font-medium text-gray-900 urdu-text">
                  {payment.member?.name || 'نامعلوم رکن'}
                </p>
                <p className="text-sm text-gray-500">
                  {formatDate(payment.payment_date)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-islamic-green">
                  {formatCurrency(payment.amount)}
                </p>
                <p className="text-xs text-gray-500">
                  {payment.month}/{payment.year}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
