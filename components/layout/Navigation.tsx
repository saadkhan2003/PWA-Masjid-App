'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Users, 
  CreditCard, 
  AlertTriangle, 
  Settings,
  FileText,
  Cog
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { urduTranslations } from '@/lib/utils/urdu-translations';

const navigation = [
  {
    name: urduTranslations.navigation.dashboard,
    href: '/dashboard',
    icon: Home
  },
  {
    name: urduTranslations.navigation.members,
    href: '/members',
    icon: Users
  },
  {
    name: urduTranslations.navigation.payments,
    href: '/payments',
    icon: CreditCard
  },
  {
    name: urduTranslations.navigation.debts,
    href: '/debts',
    icon: AlertTriangle
  },
  {
    name: urduTranslations.navigation.reports,
    href: '/reports',
    icon: FileText
  },
  {
    name: urduTranslations.navigation.settings,
    href: '/settings',
    icon: Settings
  },
];

// Desktop-only navigation items (shown only in sidebar)
const desktopOnlyNavigation = [
  {
    name: urduTranslations.navigation.debtSystem,
    href: '/admin/debt-management',
    icon: Cog
  },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav md:hidden">
        <div className="mobile-bottom-nav-grid">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'mobile-bottom-nav-item mobile-ripple',
                  isActive && 'active'
                )}
                aria-label={item.name}
              >
                <item.icon className="mobile-bottom-nav-icon" />
                <span className="mobile-bottom-nav-label urdu-text text-xs">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:fixed md:right-0 md:top-0 md:bottom-0 md:w-64 md:flex-col md:bg-white md:border-l md:border-gray-200 md:z-20 desktop-sidebar-rtl">
        <div className="flex-1 flex flex-col pt-20 pb-4 overflow-y-auto">
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {/* Main navigation items */}
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center px-2 py-3 text-sm font-medium rounded-md transition-colors flex-rtl',
                    isActive
                      ? 'bg-islamic-green text-white'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-islamic-green'
                  )}
                >
                  <item.icon
                    className={cn(
                      'ml-3 flex-shrink-0 h-6 w-6',
                      isActive ? 'text-white' : 'text-gray-400 group-hover:text-islamic-green'
                    )}
                  />
                  <span className="urdu-text text-base leading-tight">
                    {item.name}
                  </span>
                </Link>
              );
            })}
            
            {/* Desktop-only navigation items */}
            <div className="border-t border-gray-200 mt-4 pt-4">
              <p className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider urdu-text mb-2">
                ایڈمن ٹولز
              </p>
              {desktopOnlyNavigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'group flex items-center px-2 py-3 text-sm font-medium rounded-md transition-colors flex-rtl',
                      isActive
                        ? 'bg-islamic-green text-white'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-islamic-green'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'ml-3 flex-shrink-0 h-6 w-6',
                        isActive ? 'text-white' : 'text-gray-400 group-hover:text-islamic-green'
                      )}
                    />
                    <span className="urdu-text text-base leading-tight">
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
}
