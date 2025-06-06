import './globals.css';
import type { Metadata, Viewport } from 'next';
import { LayoutWrapper } from '@/components/layout/LayoutWrapper';
import { PWAProvider } from '@/components/providers/PWAProvider';

export const metadata: Metadata = {
  title: 'مسجد کمیٹی - واجبات کا نظام',
  description: 'مسجد کمیٹی کے لیے واجبات اور ادائیگی کا نظام - Mosque Committee Debt Management System',
  manifest: '/manifest.json',
  keywords: ['mosque', 'committee', 'debt', 'management', 'urdu', 'islamic', 'masjid', 'واجبات', 'مسجد'],
  authors: [{ name: 'Mosque Committee Management System' }],
  creator: 'Mosque Committee',
  publisher: 'Mosque Committee',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/icons/icon-192.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'مسجد کمیٹی',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'msapplication-TileColor': '#1E8A7A',
    'msapplication-navbutton-color': '#1E8A7A',
    'application-name': 'مسجد کمیٹی',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1E8A7A',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ur" dir="rtl" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#1E8A7A" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="مسجد کمیٹی" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
      </head>
      <body className="h-full bg-gray-50 font-urdu antialiased" dir="rtl">
        <PWAProvider>
          <LayoutWrapper>
            <div className="min-h-screen rtl-container">
              {children}
            </div>
          </LayoutWrapper>
        </PWAProvider>
      </body>
    </html>
  );
}
