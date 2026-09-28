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
import { type Project } from '@/entities/projects/projects.types';
import {
  useCreateProjectMutation,
  useDeleteProjectMutation,
  useUpdateProjectMutation,
} from '@/entities/projects/projects.api';
import { toast } from 'react-toastify';
import { CreateProjectModal } from './CreateProjectModal';
import { EditProjectModal } from './EditProjectModal';
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

export const ProjectsTable = ({
  title = '',
  data = [],
  columns = [],
  itemsPerPage = 5,
  initialPage = 1,
  className = '',
}: DynamicTableProps<Project>) => {
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [currentItem, setCurrentItem] = useState<Project | undefined>(
    undefined
  );
  const [deletingItem, setDeletingItem] = useState<Project | undefined>();

  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isEditingProject, setIsEditingProject] = useState(false);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const [updateProject, updateProjectResult] = useUpdateProjectMutation();

  const [createProject, createProjectResult] = useCreateProjectMutation();
  const [deleteProject, { isLoading: isDeleting }] = useDeleteProjectMutation();

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    try {
      await deleteProject(deletingItem.id).unwrap();
      toast.success('Đã xóa dự án');
      setDeletingItem(undefined);
      if (currentItems.length === 1 && currentPage > 1) setCurrentPage(currentPage - 1);
    } catch (error) {
      const apiError = error as { data?: { detail?: string } };
      toast.error(apiError.data?.detail ?? 'Không thể xóa dự án');
    }
  };

  useEffect(() => {
    if (updateProjectResult.isSuccess) {
      toast.success('Project updated successfully');
    }
  }, [updateProjectResult]);

  useEffect(() => {
    if (createProjectResult.isSuccess) {
      toast.success('Project created successfully');
    }
  }, [createProjectResult]);

  const handleToggle = useCallback(
    (item: Project | undefined) => () => {
      if (!item) return;
      updateProject({
        id: item.id,
        body: {
          ...item,
          isActive: !item.isActive,
        },
      });
    },
    [updateProject]
  );

  return (
    <Fragment>
      <CreateProjectModal
        isOpen={isCreatingProject}
        onClose={() => {
          setIsCreatingProject(false);
        }}
        onCreate={(data) => {
          createProject(data);
        }}
      />
      {currentItem && (
        <EditProjectModal
          projectId={currentItem.id}
          isOpen={isEditingProject}
          onClose={() => {
            setIsEditingProject(false);
          }}
          onSave={(data) => {
            updateProject({
              body: data,
              id: currentItem.id,
            });
          }}
        />
      )}
      <ConfirmDeleteModal
        isOpen={Boolean(deletingItem)}
        itemType="dự án"
        itemName={deletingItem?.name}
        isLoading={isDeleting}
        onClose={() => setDeletingItem(undefined)}
        onConfirm={handleConfirmDelete}
      />
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
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
                        setIsCreatingProject(true);
                      }}
                    >
                      Tạo dự án
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
                        <button
                          type="button"
                          className="cursor-pointer block font-medium text-gray-700 text-theme-sm dark:text-gray-400 rounded-full p-2 border border-gray-200 hover:bg-gray-50 transition duration-300"
                          title="Chỉnh sửa dự án"
                          onClick={(event) => {
                            event.stopPropagation();
                            setCurrentItem(item);
                            setIsEditingProject(true);
                          }}
                        >
                          <PencilIcon width={14} height={14} />
                        </button>
                        <button
                          type="button"
                          title="Xóa dự án"
                          className="cursor-pointer rounded-full border border-red-200 p-2 text-red-600 transition hover:bg-red-50 dark:border-red-900/40 dark:hover:bg-red-950/30"
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
