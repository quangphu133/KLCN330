'use client';

import { useState } from 'react';
import { MoreDotIcon } from '@/../public/assets/icons';
import { Dropdown } from '@/shared/ui/dropdown/dropdown';
import { DropdownItem } from '@/shared/ui/dropdown/dropdown-Item';
import { KeywordFrequencyItem } from '@/entities/analytics/analytics.types';

interface TopPagesProps {
  data?: KeywordFrequencyItem[];
}

export default function TopPages({ data = [] }: TopPagesProps) {
  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="h-full rounded-2xl border border-gray-100 bg-white p-5 dark:border-gray-100 dark:bg-white/[0.03] md:p-6 flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Mention frequency
        </h3>
        <div className="relative hidden ">
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
              View More
            </DropdownItem>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Delete
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-200">
          <span className="text-gray-400 text-theme-xs">Word</span>
          <span className="text-right text-gray-400 text-theme-xs">Count</span>
        </div>

        {data && data.length > 0 ? (
          data.slice(0, 5).map((frequency, index) => (
            <div
              key={index}
              className="py-3 border-b border-gray-100 dark:border-gray-200"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-800 text-theme-sm dark:text-gray-300">
                  {frequency.keyword}
                </span>
                <span className="text-right text-gray-500 text-theme-sm dark:text-gray-400">
                  {frequency.count}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center py-8">
            <span className="text-gray-400">No data đến display</span>
          </div>
        )}
      </div>
    </div>
  );
}
