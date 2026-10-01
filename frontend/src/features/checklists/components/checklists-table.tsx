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
  ChecklistReqBody,
  type Checklist,
} from '@/entities/checklists/checklists.types';
import { toast } from 'react-toastify';
import {
  useCreateChecklistMutation,
  useDeleteChecklistMutation,
  useUpdateChecklistMutation,
} from '@/entities/checklists/checklists.api';
import { CreateChecklistModal } from './CreateChecklistModal';
import Link from 'next/link';
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

export const ChecklistsTable = <T extends Checklist>({
  title = '',
  data = [],
  columns = [],
  itemsPerPage = 5,
  initialPage = 1,
  className = '',
}: DynamicTableProps<T>) => {
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [currentItem, setCurrentItem] = useState<Checklist | undefined>(
    undefined
  );
  const [deletingItem, setDeletingItem] = useState<Checklist | undefined>();

  const [isCreatingChecklist, setIsCreatingChecklist] = useState(false);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const [updateChecklist, updateChecklistResult] = useUpdateChecklistMutation();

  const [createChecklist, createChecklistResult] = useCreateChecklistMutation();
  const [deleteChecklist, { isLoading: isDeleting }] = useDeleteChecklistMutation();

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    try {
      await deleteChecklist(deletingItem.id).unwrap();
      toast.success('Đã xóa bộ tiêu chí');
      setDeletingItem(undefined);
      if (currentItems.length === 1 && currentPage > 1) setCurrentPage(currentPage - 1);
    } catch (error) {
      const apiError = error as { data?: { detail?: string } };
      toast.error(apiError.data?.detail ?? 'Không thể xóa bộ tiêu chí');
    }
  };

  useEffect(() => {
    if (updateChecklistResult.isSuccess) {
      toast.success('Đã cập nhật danh sách kiểm tra');
    }
  }, [updateChecklistResult]);

  useEffect(() => {
    if (createChecklistResult.isSuccess) {
      toast.success('Đã tạo bộ tiêu chí');
    }
  }, [createChecklistResult]);

  const handleToggle = useCallback(
    (item: Checklist | undefined) => () => {
      if (!item) return;
      updateChecklist({
        id: item.id,
        body: {
          ...item,
          name: item.name ?? '',
          isActive: !item.isActive,
          data: item.data
            ? {
                ...item.data,
                name: item.data.name ?? '',
              }
            : undefined,
        },
      });
    },
    [updateChecklist]
  );

  return (
    <Fragment>
      <CreateChecklistModal
        isOpen={isCreatingChecklist}
        onClose={() => {
          setIsCreatingChecklist(false);
        }}
        onCreate={(data) => {
          createChecklist(data);
        }}
      />
      <ConfirmDeleteModal
        isOpen={Boolean(deletingItem)}
        itemType="bộ tiêu chí"
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
                        setIsCreatingChecklist(true);
                      }}
                    >
                      Tạo danh sách kiểm tra
                    </Button>
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {currentItems.map((item) => (
                  <TableRow
                    key={item.id}
                    onClick={() => {
                      setCurrentItem((prev) => item);
                    }}
                  >
                    <TableCell className="h-16 pl-6 pr-3">
                      <div className="flex items-center gap-3">
                        <div>
                          <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
                            {item.name}
                          </span>
                        </div>
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
                    <TableCell className="h-16 w-44 pr-6 pl-3">
                      <div className="flex items-center gap-3 w-full justify-end">
                        <Link
                          href={`/checklists/${item.id}`}
                          onClick={(event) => event.stopPropagation()}
                          className="cursor-pointer block font-medium text-gray-700 text-theme-sm dark:text-gray-200 rounded-full p-2 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-950/70 dark:hover:text-blue-300 transition duration-300"
                        >
                          <PencilIcon width={14} height={14} />
                        </Link>
                        <button
                          type="button"
                          title="Xóa bộ tiêu chí"
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
