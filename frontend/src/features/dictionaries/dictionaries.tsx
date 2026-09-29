'use client';

import { DictionariesTable } from '@/features/dictionaries/components/dictionaries-table';
import { useGetDictionariesQuery } from '@/entities/dictionaries/dictionaries.api';
import type { Dictionary } from '@/entities/dictionaries/dictionaries.types';
import { LoaderContent } from '@/shared/ui/loader';

export const Dictionaries = () => {
  const { data: dictionariesData, isLoading } = useGetDictionariesQuery();

  if (isLoading) {
    return <div>Đang tải...</div>;
  }

  const columns: {
    key: keyof Dictionary | string;
    title: string;
    render?: (item: Dictionary) => React.ReactNode;
  }[] = [
    { key: 'name', title: 'Tên từ điển' },
    { key: 'isActive', title: 'Trạng thái hoạt động' },
    {
      key: 'phrases',
      title: 'Regex / từ khóa',
      render: (item) => (
        <div className="max-w-[420px] whitespace-normal break-words text-left text-xs text-gray-600 dark:text-gray-300">
          {(item.data?.phrases ?? []).map((phrase) => (
            <code key={phrase} className="mr-2 inline-block rounded bg-gray-100 px-1 py-0.5 dark:bg-white/[0.08]">
              {phrase}
            </code>
          ))}
        </div>
      ),
    },
  ];

  return (
    <>
      {isLoading ? (
        <LoaderContent width={200} height={200} isLoading={isLoading} />
      ) : (
        <>
          <h2
            className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-6"
            x-text="pageName"
          >
            Từ điển
          </h2>

          {dictionariesData && (
            <DictionariesTable
              data={dictionariesData}
              columns={columns}
              itemsPerPage={10}
            />
          )}
        </>
      )}
    </>
  );
};
