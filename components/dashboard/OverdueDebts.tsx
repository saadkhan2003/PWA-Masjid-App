'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import { useDashboardStore } from '@/lib/stores/dashboard';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/dates';
import { urduTranslations } from '@/lib/utils/urdu-translations';
import Link from 'next/link';

export function OverdueDebts() {
  const { stats, loading } = useDashboardStore();

  if (loading || !stats?.overdueDebts.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center urdu-heading">
            <AlertTriangle className="w-5 h-5 ml-3" />
            مؤخر واجبات
          </CardTitle>
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
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✅</span>
              </div>
              <p className="text-gray-500 urdu-text">کوئی مؤخر واجبات نہیں</p>
              <p className="text-sm text-gray-400 urdu-text">تمام ادائیگیاں اپ ٹو ڈیٹ ہیں!</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-red-600 flex items-center urdu-heading">
          <AlertTriangle className="w-5 h-5 ml-3" />
          مؤخر واجبات ({stats.overdueDebts.length})
        </CardTitle>
        <Link href="/debts">
          <Button variant="outline" size="sm">
            <ExternalLink className="w-4 h-4 ml-2" />
            تمام دیکھیں
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {stats.overdueDebts.slice(0, 5).map((debt) => (
            <div key={debt.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
              <div>
                <p className="font-medium text-gray-900 urdu-text">
                  {debt.member?.name || 'نامعلوم رکن'}
                </p>
                <p className="text-sm text-red-500">
                  مقررہ تاریخ: {formatDate(debt.due_date)}
                </p>
                {debt.description && (
                  <p className="text-xs text-gray-500 mt-1 urdu-text">
                    {debt.description}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="font-semibold text-red-600">
                  {formatCurrency(debt.amount)}
                </p>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 urdu-text">
                  مؤخر
                </span>
              </div>
            </div>
          ))}
          
          {stats.overdueDebts.length > 5 && (
            <div className="text-center pt-3">
              <Link href="/debts">
                <Button variant="outline" size="sm" className="urdu-text">
                  مزید {stats.overdueDebts.length - 5} مؤخر واجبات دیکھیں
                </Button>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
