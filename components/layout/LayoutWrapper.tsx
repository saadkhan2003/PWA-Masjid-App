'use client';

import { Navigation } from './Navigation';
import { Header } from './Header';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <div className="flex flex-1 pt-16">
        <Navigation />
        <main className="flex-1 p-4 md:ml-64 pb-20 md:pb-4 overflow-x-hidden min-h-full">
          {children}
        </main>
      </div>
    </>
  );
}
