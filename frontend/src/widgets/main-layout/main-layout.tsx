'use client';

import { useSidebar } from '@/shared/ui/sidebar/context/sidebar-context';
import { Sidebar } from '@/shared/ui/sidebar/ui/sidebar';
import Backdrop from '@/shared/ui/backdrop/backdrop';
import { Header } from '@/shared/ui/header/header';
import { ReactNode, Suspense } from 'react';
import { RootLayout } from '@/widgets/root-layout/root-layout';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  return (
    <RootLayout>
      <div className="min-h-screen xl:flex w-full overflow-x-auto">
        <div>
          <Sidebar />
          <Backdrop />
        </div>
        <div
          className={`huit-app-background flex-1 transition-all duration-300 ease-in-out min-h-screen ${
            isExpanded || isHovered ? 'lg:ml-[290px]' : 'lg:ml-[90px]'
          } ${isMobileOpen ? 'ml-0' : ''} max-w-full`}
        >
          <Suspense
            fallback={
              <div className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800"></div>
            }
          >
            <Header />
          </Suspense>
          <main className="p-4 mx-auto w-full md:p-6">{children}</main>
        </div>
      </div>
    </RootLayout>
  );
};
