// Ghi chú nhóm: Việt hóa và cải thiện hiển thị chế độ tối cho trang thống kê.
'use client';

import { useState } from 'react';
import { MoreDotIcon } from '@/../public/assets/icons';
import { Dropdown } from '@/shared/ui/dropdown/dropdown';
import { DropdownItem } from '@/shared/ui/dropdown/dropdown-Item';
import { OperatorRatingDataItem } from '@/entities/analytics/analytics.types';

interface TopChannelProps {
  data?: OperatorRatingDataItem[];
}

export default function TopChannel({ data = [] }: TopChannelProps) {
  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const sortedData = [...data].sort(
    (a, b) => (b.recordsCount || 0) - (a.recordsCount || 0)
  );

  return (
    <div className="h-full rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 md:p-6 flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Xếp hạng nhân viên
        </h3>
        <div className="relative hidden">
          <button className="dropdown-toggle" onClick={toggleDropdown}>
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
          </button>
          <Dropdown
            isOpen={isOpen}
            onClose={closeDropdown}
            className="w-40 p-2"
          >
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Chi tiết
            </DropdownItem>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Xuất dữ liệu
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
          <span className="text-gray-400 text-theme-xs">Nhân viên</span>
          <span className="text-right text-gray-400 text-theme-xs">
            Số cuộc gọi
          </span>
        </div>

        {sortedData && sortedData.length > 0 ? (
          sortedData.slice(0, 5).map((operator, index) => (
            <div
              key={index}
              className={`py-3 ${
                index === sortedData.length - 1
                  ? ''
                  : 'border-b border-gray-100 dark:border-white/[0.05]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-800 text-theme-sm dark:text-gray-300">
                  {operator.operatorName || `Điều hành viên ${index + 1}`}
                </span>
                <span className="text-right text-gray-500 text-theme-sm dark:text-gray-400">
                  {operator.recordsCount}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center py-8">
            <span className="text-gray-400">Chưa có dữ liệu để hiển thị</span>
          </div>
        )}
      </div>
    </div>
  );
}
