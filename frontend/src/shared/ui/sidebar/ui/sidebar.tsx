// Ghi chú nhóm: Việt hóa và phân quyền hiển thị menu sidebar theo vai trò (Admin / Telesales).
'use client';

import { useSidebar } from '@/shared/ui/sidebar/context/sidebar-context';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { appRoutes } from '@/shared/constants/routes';
import {
  BarIcon,
  StarFatIcon,
  TelephoneIcon,
  UserCircleIcon,
  LogoIcon,
  CheckListIcon,
  DictionaryIcon,
} from '@/../public/assets/svg-components';
import { DownloadUpIcon } from '@/../public/assets/svg-components/download-up-icon-svg';

type NavItem = {
  name: string;
  icon: (isSelected: boolean) => React.ReactNode;
  path?: string;
  adminOnly?: boolean;
};

const navItems: NavItem[] = [
  {
    icon: (isSelected) => <BarIcon isSelected={isSelected} />,
    name: 'Phân tích & Báo cáo',
    path: appRoutes.private.dashboard,
    adminOnly: true,
  },
  {
    icon: (isSelected) => <TelephoneIcon isSelected={isSelected} />,
    name: 'Danh sách Cuộc gọi',
    path: appRoutes.private.calls,
    adminOnly: false,
  },
  {
    icon: (isSelected) => <DownloadUpIcon isSelected={isSelected} />,
    name: 'Tải lên Ghi âm',
    path: appRoutes.private.uploadingRecord,
    adminOnly: false,
  },
  {
    icon: (isSelected) => <UserCircleIcon isSelected={isSelected} />,
    name: 'Nhân viên Tổng đài',
    path: appRoutes.private.operators,
    adminOnly: true,
  },
  {
    icon: (isSelected) => (
      <svg
        width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke={isSelected ? '#7c3aed' : 'currentColor'} strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    name: 'Quản lý Tài khoản',
    path: appRoutes.private.users,
    adminOnly: true,
  },
  {
    icon: (isSelected) => <StarFatIcon isSelected={isSelected} />,
    name: 'Quản lý Dự án',
    path: appRoutes.private.projects,
    adminOnly: true,
  },
  {
    icon: (isSelected) => <CheckListIcon isSelected={isSelected} />,
    name: 'Bộ Tiêu chí',
    path: appRoutes.private.checklists,
    adminOnly: true,
  },
  {
    icon: (isSelected) => <DictionaryIcon isSelected={isSelected} />,
    name: 'Từ điển Từ khóa',
    path: appRoutes.private.dictionaries,
    adminOnly: true,
  },
];


export const Sidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string>('telesales');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('userRole') || 'telesales';
      setUserRole(role);
    }
  }, [pathname]);

  const isActive = useCallback((path: string) => pathname === path, [pathname]);

  const isAdmin = userRole === 'admin';
  const visibleNavItems = navItems.filter((item) => !item.adminOnly || isAdmin);
  const homeLink = isAdmin ? appRoutes.private.dashboard : appRoutes.private.calls;

  return (
    <aside
      className={`huit-sidebar fixed mt-0 flex flex-col lg:mt-0 top-0 px-6 py-4 left-0 dark:bg-gray-900 bg-white dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r 
        ${isExpanded || isMobileOpen ? 'w-[290px]' : 'w-[90px]'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0`}
    >
      <div
        className={`py-4 flex ${!isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start'}`}
      >
        <Link href={homeLink}>
          {isExpanded || isHovered || isMobileOpen ? (
            <div>
              <LogoIcon width={123} height={31} fill={'#0068AD'} />
              <p className="mt-2 text-[9px] font-bold tracking-[0.12em] text-blue-700">
                HUIT · HẬU KIỂM CUỘC GỌI
              </p>
            </div>
          ) : (
            <LogoIcon width={32} height={32} fill={'#0068AD'} />
          )}
        </Link>
      </div>
      <div className="mt-4 mb-8">
        <h2
          className={`mb-6 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start'}`}
        >
          {isExpanded || isHovered || isMobileOpen ? 'DANH MỤC' : ''}
        </h2>
        <nav className="mb-6">
          <ul className="flex flex-col gap-2">
            {visibleNavItems.map((nav) => {
              const active = nav.path ? isActive(nav.path) : false;

              return (
                <li key={nav.name} className="flex flex-col">
                  {nav.path && (
                    <Link
                      href={nav.path}
                      className={`menu-item group flex items-center ${
                        !isExpanded ? 'justify-center' : 'justify-start'
                      } gap-3 ${
                        isExpanded || isMobileOpen ? 'px-4' : 'px-2'
                      } py-3 w-full h-[40px] rounded-full transition-all duration-200 ${
                        active
                          ? 'bg-purple-100 text-purple-900 font-semibold dark:bg-blue-950/70 dark:text-blue-200'
                          : 'hover:bg-gray-100 text-gray-700 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white'
                      }`}
                    >
                      <span className="flex items-center justify-center w-6">
                        {nav.icon(active)}
                      </span>
                      {(isExpanded || isMobileOpen) && (
                        <span className="menu-item-text text-sm">
                          {nav.name}
                        </span>
                      )}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
};
