'use client';

import { Fragment, useEffect, useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/shared/ui/table/table';
import Pagination from '@/shared/ui/pagination/pagination';
import Button from '@/shared/ui/button/button';
import Badge from '@/shared/ui/badge/badge';
import Input from '@/shared/ui/input/input';
import { type Operator } from '@/entities/operators/operators.types';
import { PencilIcon, TrashRedIcon, FilterIcon } from '@/../public/assets/icons';
import { CreateOperatorModal } from './CreateOperatorModal';
import { EditOperatorModal } from './EditOperatorModal';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import {
  useCreateOperatorMutation,
  useUpdateOperatorMutation,
  useDeleteOperatorMutation,
} from '@/entities/operators/operators.api';
import { toast } from 'react-toastify';

interface ColumnDef<T> {
  key: keyof T | string;
  id: number;
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

export const OperatorsTable = ({
  title = '',
  data = [],
  columns = [],
  itemsPerPage = 10,
  initialPage = 1,
  className = '',
}: DynamicTableProps<Operator>) => {
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [currentItem, setCurrentItem] = useState<Operator | undefined>(
    undefined
  );
  const [deletingItem, setDeletingItem] = useState<Operator | undefined>(
    undefined
  );

  const [isCreatingOperator, setIsCreatingOperator] = useState(false);
  const [isEditingOperator, setIsEditingOperator] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const [updateOperator, updateOperatorResult] = useUpdateOperatorMutation();
  const [createOperator, createOperatorResult] = useCreateOperatorMutation();
  const [deleteOperator, deleteOperatorResult] = useDeleteOperatorMutation();

  useEffect(() => {
    if (updateOperatorResult.isSuccess) {
      toast.success('Đã cập nhật nhân viên');
    }
  }, [updateOperatorResult]);

  useEffect(() => {
    if (createOperatorResult.isSuccess) {
      toast.success('Đã tạo nhân viên');
    }
  }, [createOperatorResult]);

  useEffect(() => {
    if (deleteOperatorResult.isSuccess) {
      toast.success('Đã xóa nhân viên');
      setIsConfirmingDelete(false);
      setDeletingItem(undefined);
    }
  }, [deleteOperatorResult]);

  // Filtered data based on search and status filter
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch = item.name
        ? item.name.toLowerCase().includes(searchTerm.toLowerCase())
        : true;

      const isActive = item.isActive !== false;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && isActive) ||
        (statusFilter === 'inactive' && !isActive);

      return matchesSearch && matchesStatus;
    });
  }, [data, searchTerm, statusFilter]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDeleteClick = (e: React.MouseEvent, item: Operator) => {
    e.stopPropagation();
    setDeletingItem(item);
    setIsConfirmingDelete(true);
  };

  const handleEditClick = (e: React.MouseEvent, item: Operator) => {
    e.stopPropagation();
    setCurrentItem(item);
    setIsEditingOperator(true);
  };

  const handleConfirmDelete = () => {
    if (deletingItem) {
      deleteOperator(deletingItem.id);
    }
  };

  return (
    <Fragment>
      <CreateOperatorModal
        isOpen={isCreatingOperator}
        onClose={() => {
          setIsCreatingOperator(false);
        }}
        onCreate={(data) => {
          createOperator(data);
        }}
      />

      {currentItem && (
        <EditOperatorModal
          operatorId={currentItem.id}
          isOpen={isEditingOperator}
          onClose={() => {
            setIsEditingOperator(false);
          }}
          onSave={(data) => {
            updateOperator({
              body: data,
              id: currentItem.id,
            });
          }}
        />
      )}

      <ConfirmDeleteModal
        isOpen={isConfirmingDelete}
        operatorName={deletingItem?.name ?? undefined}
        onClose={() => {
          setIsConfirmingDelete(false);
          setDeletingItem(undefined);
        }}
        onConfirm={handleConfirmDelete}
        isLoading={deleteOperatorResult.isLoading}
      />

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        {/* Search & Filter Header Bar */}
        <div className="p-4 border-b border-gray-100 dark:border-white/[0.05] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-1 items-center gap-3 max-w-md">
            <Input
              placeholder="Tìm theo tên nhân viên..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <FilterIcon width={16} height={16} className="text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-purple-500 dark:border-white/10 dark:bg-gray-800 dark:text-gray-300"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Ngừng hoạt động</option>
              </select>
            </div>

            <Button
              variant="purple"
              className="whitespace-nowrap rounded-full px-4 py-2 text-sm"
              onClick={() => {
                setIsCreatingOperator(true);
              }}
            >
              Tạo nhân viên
            </Button>
          </div>
        </div>

        <div className="overflow-hidden">
          <div className="max-w-full overflow-x-auto">
            <Table className="w-full">
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="p-6 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400 w-[90px]"
                  >
                    Mã
                  </TableCell>
                  <TableCell
                    isHeader
                    className="p-6 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400"
                  >
                    Điều hành viên name
                  </TableCell>
                  <TableCell
                    isHeader
                    className="p-6 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400"
                  >
                    Trạng thái
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-44 py-6 px-6 font-normal text-gray-500 text-end text-theme-sm dark:text-gray-400"
                  >
                    Thao tác
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {currentItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-gray-500 dark:text-gray-400">
                      Không tìm thấy nhân viên nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map((item) => {
                    const isActive = item.isActive !== false;
                    return (
                      <TableRow
                        key={item.id}
                        className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition"
                      >
                        <TableCell className="h-16 pl-6 pr-3 w-[90px]">
                          <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
                            {item.id}
                          </span>
                        </TableCell>
                        <TableCell className="h-16 px-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-900 text-white text-lg font-semibold shrink-0">
                              {item.name?.charAt(0) || 'O'}
                            </div>
                            <div>
                              <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                {item.name}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="h-16 px-3">
                          <Badge color={isActive ? 'success' : 'error'} variant="light">
                            {isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                          </Badge>
                        </TableCell>
                        <TableCell className="h-16 w-44 pr-6 pl-3">
                          <div className="flex items-center gap-2 w-full justify-end">
                            <button
                              type="button"
                              title="Chỉnh sửa nhân viên"
                              className="cursor-pointer font-medium text-gray-700 dark:text-gray-200 rounded-full p-2 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-950/70 dark:hover:text-blue-300 transition duration-300"
                              onClick={(e) => handleEditClick(e, item)}
                            >
                              <PencilIcon width={14} height={14} />
                            </button>
                            <button
                              type="button"
                              title="Xóa nhân viên"
                              className="cursor-pointer font-medium text-red-600 dark:text-red-400 rounded-full p-2 border border-red-200 dark:border-red-800 bg-red-50/70 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/70 transition duration-300"
                              onClick={(e) => handleDeleteClick(e, item)}
                            >
                              <TrashRedIcon width={14} height={14} />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-gray-100 py-4 pl-[18px] pr-4 dark:border-white/[0.05]">
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
