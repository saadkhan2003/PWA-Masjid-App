'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, Plus, AlertTriangle, FileText } from 'lucide-react';
import { urduTranslations } from '@/lib/utils/urdu-translations';

export function QuickActions() {
  const actions = [
    {
      title: 'رکن شامل کریں', // Add Member
      description: 'نیا کمیٹی رکن رجسٹر کریں', // Register a new committee member
      href: '/members/add',
      icon: UserPlus,
      color: 'bg-islamic-green hover:bg-islamic-green-dark'
    },
    {
      title: 'ادائیگی درج کریں', // Record Payment
      description: 'نئی ادائیگی کی انٹری شامل کریں', // Add a new payment entry
      href: '/payments/add',
      icon: Plus,
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'واجبات کا انتظام', // Manage Debts
      description: 'باقی واجبات دیکھیں اور منظم کریں', // View and manage outstanding debts
      href: '/debts',
      icon: AlertTriangle,
      color: 'bg-orange-500 hover:bg-orange-600'
    },
    {
      title: 'رپورٹ تیار کریں', // Generate Report
      description: 'مالی رپورٹس بنائیں', // Create financial reports
      href: '/reports',
      icon: FileText,
      color: 'bg-purple-500 hover:bg-purple-600'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-islamic-green urdu-heading">فوری اقدامات</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link key={index} href={action.href}>
                <Button
                  variant="outline"
                  className={`w-full h-auto p-4 flex flex-col items-center justify-center space-y-3 text-white border-0 ${action.color} transition-all hover:scale-105`}
                >
                  <Icon className="w-6 h-6" />
                  <div className="text-center space-y-1">
                    <div className="font-semibold text-sm urdu-text leading-tight">{action.title}</div>
                    <div className="text-xs opacity-90 urdu-text leading-tight">{action.description}</div>
                  </div>
                </Button>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
