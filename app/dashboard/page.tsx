'use client';

import { useEffect } from 'react';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { RecentPayments } from '@/components/dashboard/RecentPayments';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { OverdueDebts } from '@/components/dashboard/OverdueDebts';
import { IslamicQuote } from '@/components/dashboard/IslamicQuote';
import { useDashboardStore } from '@/lib/stores/dashboard';
import { urduTranslations, islamicPhrases } from '@/lib/utils/urdu-translations';

export default function DashboardPage() {
  const { fetchDashboardData, loading } = useDashboardStore();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="mobile-container space-y-6 rtl-container">
        <div className="mobile-animate-fade-in space-y-6">
          {/* Loading header */}
          <div className="text-center py-4">
            <div className="mobile-skeleton h-8 w-48 mx-auto mb-2 rounded"></div>
            <div className="mobile-skeleton h-4 w-32 mx-auto rounded"></div>
          </div>
          
          <div className="mobile-cards-grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="mobile-skeleton h-24 rounded-xl"></div>
            ))}
          </div>
          <div className="mobile-cards-grid lg:grid-cols-2 gap-6">
            <div className="mobile-skeleton h-64 rounded-xl"></div>
            <div className="mobile-skeleton h-64 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container desktop-p-6 space-y-6 mobile-scroll mobile-animate-fade-in rtl-container">
      {/* Welcome Header */}
      <div className="text-center py-4 desktop-mb-8">
        <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 urdu-heading mb-2">
          {islamicPhrases.greeting}
        </h1>
        <p className="text-gray-600 urdu-text lg:text-xl">
          {urduTranslations.headers.mosqueCommittee} میں {urduTranslations.headers.welcomeBack}
        </p>
      </div>

      {/* Desktop Grid Layout */}
      <div className="desktop-grid desktop-gap-6">
        {/* Main Content Area - 8 columns on desktop */}
        <div className="lg:desktop-col-8 space-y-6">
          {/* Islamic Quote */}
          <div className="mobile-card">
            <IslamicQuote />
          </div>

          {/* Statistics Cards */}
          <div className="space-y-4">
            <h2 className="text-xl lg:text-2xl font-semibold text-gray-900 urdu-heading px-4">
              {urduTranslations.dashboard.overview}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCards />
            </div>
          </div>

          {/* Recent Activities */}
          <div className="mobile-card">
            <h3 className="text-lg lg:text-xl font-semibold text-gray-900 urdu-heading mb-4">
              {urduTranslations.dashboard.recentActivity}
            </h3>
            <RecentPayments />
          </div>
        </div>

        {/* Sidebar - 4 columns on desktop */}
        <div className="lg:desktop-col-4 space-y-6">
          {/* Quick Actions */}
          <div className="mobile-card">
            <h3 className="text-lg lg:text-xl font-semibold text-gray-900 urdu-heading mb-4">
              {urduTranslations.dashboard.quickStats}
            </h3>
            <QuickActions />
          </div>

          {/* Overdue Debts */}
          <div className="mobile-card">
            <h3 className="text-lg lg:text-xl font-semibold text-gray-900 urdu-heading mb-4">
              {urduTranslations.dashboard.upcomingDues}
            </h3>
            <OverdueDebts />
          </div>
        </div>
      </div>
    </div>
  );
}
