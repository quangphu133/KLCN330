// Ghi chú nhóm: Việt hóa và cải thiện hiển thị cho màn hình quản lý dữ liệu.
'use client';

import { Fragment, useCallback, useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/shared/ui/table/table';
import Pagination from '@/shared/ui/pagination/pagination';
import Button from '@/shared/ui/button/button';
import { PencilIcon, TrashRedIcon } from '@/../public/assets/icons';
import { Switcher } from '@/shared/ui/switcher';
import {
  useUpdateDictionaryMutation,
  useCreateDictionaryMutation,
  useDeleteDictionaryMutation,
} from '@/entities/dictionaries/dictionaries.api';
import { toast } from 'react-toastify';
import { type Dictionary } from '@/entities/dictionaries/dictionaries.types';
import { CreateDictionaryModal } from './CreateDictionaryModal';
import { EditDictionaryModal } from './EditDictionaryModal';
import { ConfirmDeleteModal } from '@/shared/ui/confirm-delete-modal/confirm-delete-modal';

interface ColumnDef<T> {
  key: keyof T | string;
  title: string;
  render?: (item: T) => React.ReactNode;
}

interface DynamicTableProps<T> {
  title?: string;
  data: T[];
  columns: ColumnDef<T>[];
  itemsPerPage?: number;
  initialPage?: number;
  className?: string;
}

export const DictionariesTable = <T extends Dictionary>({
  title = '',
  data = [],
  columns = [],
  itemsPerPage = 5,
  initialPage = 1,
  className = '',
}: DynamicTableProps<T>) => {
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [currentItem, setCurrentItem] = useState<Dictionary | undefined>(
    undefined
  );
  const [deletingItem, setDeletingItem] = useState<Dictionary | undefined>();

  const [isCreatingDictionary, setIsCreatingDictionary] = useState(false);
  const [isEditingDictionary, setIsEditingDictionary] = useState(false);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const [updateDictionary, updateDictionaryResult] =
    useUpdateDictionaryMutation();

  const [createDictionary, createDictionaryResult] =
    useCreateDictionaryMutation();
  const [deleteDictionary, { isLoading: isDeleting }] =
    useDeleteDictionaryMutation();

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    try {
      await deleteDictionary(deletingItem.id).unwrap();
      toast.success('Đã xóa từ điển');
      setDeletingItem(undefined);
      if (currentItems.length === 1 && currentPage > 1) setCurrentPage(currentPage - 1);
    } catch (error) {
      const apiError = error as { data?: { detail?: string } };
      toast.error(apiError.data?.detail ?? 'Không thể xóa từ điển');
    }
  };

  useEffect(() => {
    if (updateDictionaryResult.isSuccess) {
      toast.success('Đã cập nhật từ điển');
    }
  }, [updateDictionaryResult]);

  useEffect(() => {
    if (createDictionaryResult.isSuccess) {
      toast.success('Đã tạo từ điển');
    }
  }, [createDictionaryResult]);

  const handleToggle = useCallback(
    (item: Dictionary | undefined) => () => {
      if (!item) return;
      updateDictionary({
        id: item.id,
        body: {
          ...item,
          name: item.name ?? '',
          isActive: !item.isActive,
          phrases: item.data?.phrases ?? [],
        },
      });
    },
    [updateDictionary]
  );

  return (
    <Fragment>
      <CreateDictionaryModal
        isOpen={isCreatingDictionary}
        onClose={() => {
          setIsCreatingDictionary(false);
        }}
        onCreate={(data) => {
          createDictionary(data);
        }}
      />
      {currentItem && (
        <EditDictionaryModal
          dictionaryId={currentItem.id}
          isOpen={isEditingDictionary}
          onClose={() => {
            setIsEditingDictionary(false);
          }}
          onSave={(data) => {
            updateDictionary({
              body: data,
              id: currentItem.id,
            });
          }}
        />
      )}
      <ConfirmDeleteModal
        isOpen={Boolean(deletingItem)}
        itemType="từ điển"
        itemName={deletingItem?.name}
        isLoading={isDeleting}
        onClose={() => setDeletingItem(undefined)}
        onConfirm={handleConfirmDelete}
      />
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-hidden">
          <div className="max-w-full overflow-x-auto">
            <Table className="w-full">
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  {columns.map((column, index) => (
                    <TableCell
                      key={`header-${column.title}`}
                      isHeader
                      className={`p-6 font-normal text-gray-500 text-theme-sm dark:text-gray-400 ${index !== 0 ? 'text-center' : 'text-start '}`}
                    >
                      {column.title}
                    </TableCell>
                  ))}

                  <TableCell
                    key={`create-project`}
                    isHeader
                    className="w-44 py-2 px-6 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400"
                  >
                    <Button
                      variant="purple"
                      className="whitespace-nowrap"
                      onClick={() => {
                        setIsCreatingDictionary(true);
                      }}
                    >
                      Tạo từ điển
                    </Button>
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {currentItems.map((item) => (
                  <TableRow
                    key={item.id}
                    onClick={() => {
                      setCurrentItem(() => item);
                    }}
                  >
                    <TableCell className="h-16 pl-6 pr-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={`block font-medium text-gray-700 text-theme-sm dark:text-gray-400 bg-[${item.colorHex}]`}
                        >
                          {item.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="h-16 px-3">
                      <div className="flex items-center gap-3 justify-center">
                        <div>
                          <Switcher
                            enabled={item.isActive}
                            setEnabled={handleToggle(item)}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="h-16 px-3">
                      {columns.find((column) => column.key === 'phrases')?.render?.(item)}
                    </TableCell>
                    <TableCell className="h-16 w-44 pr-6 pl-3">
                      <div className="flex items-center gap-3 w-full justify-end">
                        <button
                          type="button"
                          title="Chỉnh sửa từ điển"
                          onClick={(event) => {
                            event.stopPropagation();
                            setCurrentItem(item);
                            setIsEditingDictionary(true);
                          }}
                          className="cursor-pointer block font-medium text-gray-700 text-theme-sm dark:text-gray-200 rounded-full p-2 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-950/70 dark:hover:text-blue-300 transition duration-300"
                        >
                          <PencilIcon width={14} height={14} />
                        </button>
                        <button
                          type="button"
                          title="Xóa từ điển"
                          className="cursor-pointer rounded-full border border-red-200 p-2 bg-red-50/70 text-red-600 transition hover:bg-red-100 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-900/70"
                          onClick={(event) => {
                            event.stopPropagation();
                            setDeletingItem(item);
                          }}
                        >
                          <TrashRedIcon width={14} height={14} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="rounded-b-xl py-4 pl-[18px] pr-4">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-end">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        )}
      </div>
    </Fragment>
  );
};
