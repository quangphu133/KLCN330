import { useCallback, useEffect, useMemo, useState } from 'react';
import { getLast30DaysRange } from '@/shared/utils/date-utils';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  useGetMediaFilesQueryQuery,
  useLazyGetDownloadFileExcelQuery,
} from '@/entities/mediafile/api/mediafile.api';
import { columnConfig } from '@/shared/constants/header-table/calls-table/calls-table';
import { toast } from 'react-toastify';
import { SortDirection, useSortable } from '@/shared/hooks/use-sort';
import { getSortParamName, SortKey } from './getSortParamsName';

export interface TableRowData {
  id: string;
  date: string;
  operator: string;
  phone: string;
  numChannels: string;
  duration: string;
  negative: string;
  negativeValue: number | null;
  lexis: number;
  interruptions: number;
  silence: string;
  silenceSeconds: number;
  checklist: any;
  gptSummary: string;
  projectName: string;
}

export const useCalls = () => {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  const [filtersReset, setFiltersReset] = useState(false);
  const defaultDateRange = useMemo(() => getLast30DaysRange(), []);
  const router = useRouter();
  const [totalEntries, setTotalEntries] = useState<number>(0);

  const pathname = usePathname();

  const updateSortParams = (key: SortKey | null, direction: SortDirection) => {
    const newParams: Record<string, string> = { page: '1' };

    if (key && direction) {
      const sortParam = getSortParamName(key, direction);
      if (sortParam) {
        newParams[sortParam] = 'true';
      }
    }

    updateSearchParams(newParams);
  };

  const handleSortChange = (key: SortKey | null, direction: SortDirection) => {
    updateSortParams(key, direction);
  };

  const { sortConfig, requestSort, getSortState } = useSortable<
    TableRowData,
    SortKey
  >('date', handleSortChange, null);

  const getSortParams = (): Record<string, boolean> => {
    if (!sortConfig.key || !sortConfig.direction) return {};

    const param = getSortParamName(
      sortConfig.key as SortKey,
      sortConfig.direction
    );
    return param ? { [param]: true } : {};
  };

  const getPrefix = useCallback(() => {
    return window.location.pathname.replace(/\//g, '_');
  }, []);

  const getFilterKey = useCallback(
    (key: string) => `${getPrefix()}_filter-${key}`,
    [getPrefix]
  );

  const getParamOrStorage = (paramName: string) => {
    const filterKey = getFilterKey(paramName);

    return searchParams.get(paramName) || localStorage.getItem(filterKey) || '';
  };

  const searchTerm = getParamOrStorage('search') || '';
  const startDate = getParamOrStorage('start') || defaultDateRange.start;
  const endDate = getParamOrStorage('end') || defaultDateRange.end;
  const currentPage = Number(getParamOrStorage('page') || 1);
  const filterByCategories =
    getParamOrStorage('filterByPhrasesCategoriesCommaSeparated') || undefined;
  const initialRowsPerPage = Number(getParamOrStorage('limit')) || 10;
  const [rowsPerPage, setRowsPerPage] = useState<number>(initialRowsPerPage);

  const rawParams = {
    start: startDate,
    end: endDate,
    offset: (currentPage - 1) * rowsPerPage,
    limit: rowsPerPage,
    searchPhrase: searchTerm,
    filterByPhrasesCategoriesCommaSeparated: filterByCategories,
  };

  const sortParams = getSortParams();

  Object.keys(rawParams).forEach((key) => {
    if (key.startsWith('orderBy')) {
      delete (rawParams as Record<string, unknown>)[key];
    }
  });

  const queryParams = {
    ...rawParams,
    ...sortParams,
  };

  const {
    data: mediaFilesData,
    refetch,
    isLoading,
  } = useGetMediaFilesQueryQuery(queryParams);
  const [downloadUrl] = useLazyGetDownloadFileExcelQuery();

  const mediaFilesDataTable = mediaFilesData?.mediaFile || [];
  const totalCount = mediaFilesData?.totalCount || 0;

  useEffect(() => {
    if (mediaFilesData) {
      setTotalEntries(mediaFilesData.totalCount || 0);
    }
  }, [mediaFilesData]);

  const updateSearchParams = (
    newParams: Partial<Record<string, string | undefined>>
  ) => {
    const params = new URLSearchParams(searchParams);

    Array.from(params.keys())
      .filter((key) => key.startsWith('orderBy'))
      .forEach((key) => params.delete(key));

    Object.entries(newParams).forEach(([key, value]) => {
      const filterKey = getFilterKey(key);

      if (value === undefined || value === '') {
        params.delete(key);
        localStorage.removeItem(filterKey);
      } else {
        params.set(key, value);
        localStorage.setItem(filterKey, value);
      }
    });

    router.push(`${pathname}?${params.toString()}`);
  };

  const [filtersActive, setFiltersActive] = useState<boolean>(false);

  useEffect(() => {
    const isDefaultDateRange =
      startDate === defaultDateRange.start && endDate === defaultDateRange.end;

    const datesActive = startDate && endDate && !isDefaultDateRange;

    const active = Boolean(searchTerm || datesActive || filterByCategories);

    setFiltersActive(active);
    localStorage.setItem(
      getFilterKey('_calls_filter-filtersĐang hoạt động'),
      JSON.stringify(active)
    );
  }, [searchTerm, startDate, endDate, filterByCategories, defaultDateRange, getFilterKey]);

  const openFilterModal = () => {
    setIsFilterModalOpen(true);
  };

  const closeFilterModal = () => {
    setIsFilterModalOpen(false);
  };

  const totalPages: number = Math.ceil(totalCount / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalEntries);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      updateSearchParams({ page: page.toString() });
    }
  };

  const handleRowsPerPageChange = (newRowsPerPage: number): void => {
    setRowsPerPage(newRowsPerPage);

    updateSearchParams({
      page: '1',
      limit: newRowsPerPage.toString(),
    });

    refetch();
  };

  const handleSort = (key: SortKey) => {
    requestSort(key, columnConfig);
  };

  const getSortDirection = (key: SortKey): string => {
    return getSortState(key) ?? '';
  };

  const handleDownload = async () => {
    try {
      const result = await downloadUrl().unwrap();

      if (result) {
        const link = document.createElement('a');
        link.href = result;
        link.download = 'mediafile.xlsx';
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(result);
      }
    } catch (error) {
      toast.error('Không thể tải tệp Excel.');
    }
  };

  const applyFilters = (newParams: Record<string, string>) => {
    updateSearchParams({
      ...newParams,
      page: '1',
    });
    setIsFilterModalOpen(false);
  };

  const resetSearchParams = () => {
    const params = new URLSearchParams(searchParams);
    params.forEach((_, key) => {
      params.delete(key);
    });
    router.push(window.location.pathname);
  };

  const handleResetFilters = () => {
    resetSearchParams();
    const prefixKey = getPrefix();
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(`${prefixKey}_filter-`)) {
        localStorage.removeItem(key);
      }
    });

    window.dispatchEvent(new CustomEvent('filters-reset'));

    setFiltersReset(true);

    setTimeout(() => {
      setFiltersReset(false);
    }, 100);
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Đã cập nhật dữ liệu');
  };

  return {
    isLoading,
    filtersReset,
    mediaFilesDataTable,
    filtersActive,
    currentPage,
    rowsPerPage,
    totalEntries,
    totalPages,
    startIndex,
    endIndex,
    sortConfig,
    isFilterModalOpen,
    startDate,
    endDate,
    router,

    // Methods
    getParamOrStorage,
    getFilterKey,
    handlePageChange,
    handleRefresh,
    handleResetFilters,
    applyFilters,
    handleRowsPerPageChange,
    handleSort,
    getSortDirection,
    openFilterModal,
    closeFilterModal,
    handleDownload,
  };
};
