'use client';

import { ProjectsTable } from '@/features/projects/components/projects-table';
import { useGetProjectsQuery } from '@/entities/projects/projects.api';
import { LoaderContent } from '@/shared/ui/loader';

export const Projects = () => {
  const { data: operatorsData, isLoading } = useGetProjectsQuery();

  if (isLoading) {
    return <div>Đang tải...</div>;
  }

  const columns = [
    { key: 'name', title: 'Tên dự án' },
    { key: 'active', title: 'Đang hoạt động' },
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
            Dự án
          </h2>
          {operatorsData && (
            <ProjectsTable
              data={operatorsData}
              columns={columns}
              itemsPerPage={10}
            />
          )}
        </>
      )}
    </>
  );
};
