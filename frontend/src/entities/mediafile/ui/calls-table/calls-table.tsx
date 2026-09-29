// Ghi chú nhóm: Cập nhật kiểu dữ liệu hoặc cách hiển thị dữ liệu của tính năng.
'use client';

import { JSX } from 'react';
import Button from '@/shared/ui/button/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/shared/ui/table/table';
import { FilterIcon } from '@/../public/assets/icons';
import { appRoutes } from '@/shared/constants/routes';
import { columnConfig } from '@/shared/constants/header-table/calls-table/calls-table';
import { useCalls } from '@/entities/mediafile/hooks/use-calls';
import {
  getNegativeColorClass,
  getSilenceColorClass,
  getValueColorClass,
} from '@/shared/lib/color/get-color-class';
import AnalyticsFilterModal from '@/features/analytics/analytics-filter-modal/analytics-filter-modal';
import {
  ResetFiltersActive,
  ResetFilters,
  DownloadIcon,
} from '@/../public/assets/svg-components';
import { formatDatesTime, formatDuration } from '@/shared/utils/date-utils';
import Pagination from '@/shared/ui/pagination/pagination';
import { LoaderContent } from '@/shared/ui/loader';
import { DropdownCustom } from '@/shared/ui/dropdown-custom';
import { SortKey } from '../../hooks/getSortParamsName';

const getChanelColor = (chanel: number) => {
  if (chanel > 1) return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
  return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300';
};

export const CallsTable = (): JSX.Element => {
  const {
    isLoading,
    rowsPerPage,
    handleRowsPerPageChange,
    openFilterModal,
    handleDownload,
    handleSort,
    getSortDirection,
    filtersReset,
    mediaFilesDataTable,
    closeFilterModal,
    isFilterModalOpen,
    handleResetFilters,
    handleRefresh,
    applyFilters,
    router,
    filtersActive,
    handlePageChange,
    totalPages,
    currentPage,
    totalEntries,
    startIndex,
    endIndex,
  } = useCalls();

  return (
    <div className={'relative'}>
      {isLoading ? (
        <LoaderContent width={200} height={200} isLoading={isLoading} />
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
          <div className="flex flex-col gap-2 px-4 py-4 rounded-t-xl sm:flex-row sm:items-center sm:justify-between sm:gap-6 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="text-gray-500 dark:text-gray-400">
                Show
              </span>
              <DropdownCustom
                onChange={(newValue) => {
                  handleRowsPerPageChange(parseInt(newValue, 10));
                }}
                selected={{
                  label: String(rowsPerPage),
                  value: String(rowsPerPage),
                }}
                options={['10', '8', '5'].map((value) => ({
                  label: value,
                  value: value,
                }))}
              />
              {/* <div className="relative z-20 bg-transparent">
                <select
                  className="w-[66px] py-2 pl-3 pr-8 text-sm text-gray-800 bg-transparent border border-gray-300 rounded-full appearance-none h-9 shadow-theme-xs cursor-pointer placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-1 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  value={rowsPerPage}
                  onChange={handleRowsPerPageChange}
                >
                  <option
                    value="10"
                    className="text-gray-500 dark:bg-gray-900 dark:text-gray-400"
                  >
                    10
                  </option>
                  <option
                    value="8"
                    className="text-gray-500 dark:bg-gray-900 dark:text-gray-400"
                  >
                    8
                  </option>
                  <option
                    value="5"
                    className="text-gray-500 dark:bg-gray-900 dark:text-gray-400"
                  >
                    5
                  </option>
                </select>
                <span className="absolute z-10 text-gray-500 -translate-y-1/2 right-2 top-1/2 pointer-events-none dark:text-gray-400">
                  <svg
                    className="stroke-current"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3.8335 5.9165L8.00016 10.0832L12.1668 5.9165"
                      stroke=""
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div> */}
              <span className="text-gray-500 dark:text-gray-400">dòng</span>
            </div>

            <div className="flex items-center gap-3">
              <Button
                className="w-[112px] h-[44px] border border-gray-200 rounded-full hover:bg-gray-100 flex items-center gap-2 cursor-pointer"
                onClick={openFilterModal}
              >
                <span>Lọc</span>
                <FilterIcon width={20} height={20} />
              </Button>
              <Button
                className={`h-[44px] border border-gray-200 rounded-full ${filtersActive ? 'hover:bg-gray-100 cursor-pointer' : 'opacity-50 cursor-not-allowed'} flex items-center gap-2`}
                onClick={handleResetFilters}
                disabled={!filtersActive}
              >
                <span>Đặt lại</span>
                {filtersActive ? (
                  <ResetFiltersActive width={20} height={20} />
                ) : (
                  <ResetFilters width={20} height={20} />
                )}
              </Button>
              <Button
                className="h-[44px] border border-gray-200 rounded-full hover:bg-gray-100 flex items-center gap-2 cursor-pointer"
                onClick={handleRefresh}
              >
                <span>Làm mới</span>
              </Button>
              <Button
                className="w-[155px] h-[44px] border border-gray-200 rounded-full hover:bg-gray-100 flex items-center gap-2 cursor-pointer"
                onClick={handleDownload}
              >
                <span>Tải xuống Excel</span>
                <DownloadIcon width={18} height={18} />
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <Table>
              <TableHeader>
                <TableRow>
                  {columnConfig.map((column, index) => (
                    <TableCell
                      key={column.key}
                      isHeader
                      className={`px-4 py-3 border-y border-gray-100 dark:border-white/[0.05] `}
                    >
                      <div
                        className={`flex items-center gap-2 ${column.sortable ? 'cursor-pointer' : ''} ${
                          getSortDirection(column.key as SortKey) !== '' &&
                          'bg-purple-100 py-2 px-4 rounded-full '
                        }`}
                        onClick={() =>
                          column.sortable && handleSort(column.key as SortKey)
                        }
                      >
                        <div className="flex gap-3">
                          <span
                            className={`font-medium text-gray-700 text-theme-xs dark:text-gray-400 ${
                              getSortDirection(column.key as SortKey) !== '' &&
                              'text-purple-900 '
                            }`}
                          >
                            {column.label}
                          </span>
                        </div>
                        {column.sortable && (
                          <span>
                            <svg
                              className={`${getSortDirection(column.key as SortKey) === '' ? 'fill-gray-200' : 'fill-purple-900 '} transition duration-200 ease-linear ${
                                getSortDirection(column.key as SortKey) ===
                                  'desc' && 'rotate-180'
                              }`}
                              width="12"
                              height="7"
                              viewBox="0 0 12 7"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M0.564864 0.879232C0.564864 0.808624 0.600168 0.720364 0.653125 0.667408C0.776689 0.543843 0.970861 0.543844 1.09443 0.649756L5.82517 5.09807C5.91343 5.18633 6.07229 5.18633 6.17821 5.09807L10.9089 0.649756C11.0325 0.526192 11.2267 0.543844 11.3502 0.667408C11.4738 0.790972 11.4562 0.985145 11.3326 1.10871L6.60185 5.55702C6.26647 5.85711 5.73691 5.85711 5.41917 5.55702L0.670776 1.10871C0.600168 1.0381 0.564864 0.967492 0.564864 0.879232Z"
                                fill=""
                              />
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M1.4719 0.229332L6.00169 4.48868L10.5171 0.24288C10.9015 -0.133119 11.4504 -0.0312785 11.7497 0.267983C12.1344 0.652758 12.0332 1.2069 11.732 1.50812L11.7197 1.52041L6.97862 5.9781C6.43509 6.46442 5.57339 6.47872 5.03222 5.96853C5.03192 5.96825 5.03252 5.96881 5.03222 5.96853L0.271144 1.50833C0.123314 1.3605 -5.04223e-08 1.15353 -3.84322e-08 0.879226C-2.88721e-08 0.660517 0.0936127 0.428074 0.253705 0.267982C0.593641 -0.0719548 1.12269 -0.0699964 1.46204 0.220873L1.4719 0.229332ZM5.41917 5.55702C5.73691 5.85711 6.26647 5.85711 6.60185 5.55702L11.3326 1.10871C11.4562 0.985145 11.4738 0.790972 11.3502 0.667408C11.2267 0.543844 11.0325 0.526192 10.9089 0.649756L6.17821 5.09807C6.07229 5.18633 5.91343 5.18633 5.82517 5.09807L1.09443 0.649756C0.970861 0.543844 0.776689 0.543843 0.653125 0.667408C0.600168 0.720364 0.564864 0.808624 0.564864 0.879232C0.564864 0.967492 0.600168 1.0381 0.670776 1.10871L5.41917 5.55702Z"
                                fill=""
                              />
                            </svg>
                          </span>
                        )}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {mediaFilesDataTable && mediaFilesDataTable.length > 0 ? (
                  mediaFilesDataTable.map((item) => {
                    const summaryAnalyserResult =
                      item?.summaryAnalyserResult || {};
                    const negativeValue =
                      summaryAnalyserResult?.negativeLevelOverall === null ||
                      summaryAnalyserResult?.negativeLevelOverall === undefined
                        ? null
                        : Math.round(summaryAnalyserResult.negativeLevelOverall * 100);
                    const silenceSeconds =
                      summaryAnalyserResult?.maxSimultaneousSilenceDuration ||
                      0;
                    const lexis = item?.filteredKeywordsCount || 0;
                    const interruptions =
                      summaryAnalyserResult?.simultaneousSpeechCount || 0;
                    const clientNumber =
                      item?.additionalMetadata?.clientNumber || 'Chưa có';

                    const scorePercentage =
                      item.gptChecklist &&
                      item.gptChecklist.collection.length > 0
                        ? (item.gptChecklist.collection[0].score /
                            item.gptChecklist.collection[0].maxScore) *
                          100
                        : 0;

                    return (
                      <TableRow
                        className="cursor-pointer hover:bg-gray-100"
                        key={item.id}
                        onClick={() =>
                          item?.id &&
                          router.push(appRoutes.private.call(String(item.id)))
                        }
                      >
                        <TableCell className="px-4 py-4 border-b border-gray-100 text-gray-800 dark:border-white/[0.05] dark:text-white/90 whitespace-nowrap">
                          {item?.createDate
                            ? formatDatesTime(new Date(item.createDate))
                            : 'Chưa có'}
                        </TableCell>
                        <TableCell className="px-4 py-4 border-b border-gray-100 font-semibold text-gray-800 dark:border-white/[0.05] text-theme-sm dark:text-gray-400 whitespace-nowrap">
                          {item?.operatorName || 'Chưa có'}
                        </TableCell>
                        <TableCell className="px-4 py-4 border-b border-gray-100 font-normal text-gray-800 dark:border-white/[0.05] text-theme-sm dark:text-white/90 whitespace-nowrap">
                          {clientNumber}
                        </TableCell>
                        <TableCell className="px-4 py-4 border-b border-gray-100 font-normal text-gray-800 dark:border-white/[0.05] text-theme-sm dark:text-white/90 whitespace-nowrap">
                          <div
                            className={`text-xs px-3 py-1 rounded-full font-medium ${getChanelColor(item.numChannels)}`}
                          >
                            {item.projectName}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-4 border-b border-gray-100 font-normal text-gray-800 dark:border-white/[0.05] text-theme-sm dark:text-white/90 whitespace-nowrap">
                          {typeof item?.duration === 'number'
                            ? formatDuration(item.duration)
                            : 'Chưa có'}
                        </TableCell>
                        <TableCell className="px-4 py-4 border-b border-gray-100 font-normal dark:border-white/[0.05] text-theme-sm whitespace-nowrap">
                          <span
                            className={`text-sm font-normal ${getNegativeColorClass(negativeValue ?? 0)}`}
                          >
                            {negativeValue === null ? 'Chưa chấm điểm' : `${negativeValue}%`}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-4 border-b border-gray-100 font-normal dark:border-white/[0.05] text-theme-sm whitespace-nowrap">
                          <span className={`${getValueColorClass(lexis)}`}>
                            {lexis}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-4 border-b border-gray-100 font-normal dark:border-white/[0.05] text-theme-sm whitespace-nowrap">
                          <span
                            className={`${getValueColorClass(interruptions)}`}
                          >
                            {interruptions}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-4 border-b border-gray-100 font-normal dark:border-white/[0.05] text-theme-sm whitespace-nowrap">
                          <span
                            className={`${getSilenceColorClass(silenceSeconds)}`}
                          >
                            {formatDuration(silenceSeconds)}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-4 border-b border-gray-100 font-normal dark:border-white/[0.05] text-theme-sm whitespace-nowrap">
                          <div className="w-24 bg-gray-200 rounded-full h-2.5">
                            <div
                              className={`h-2.5 rounded-full ${
                                scorePercentage >= 80
                                  ? 'bg-green-500'
                                  : scorePercentage >= 60
                                    ? 'bg-yellow-500'
                                    : 'bg-red-500'
                              }`}
                              style={{ width: `${scorePercentage}%` }}
                            ></div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs px-4 py-4 border-b font-normal text-gray-800 dark:border-white/[0.05] text-theme-sm dark:text-white/90">
                          {item.gptSummary}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columnConfig.length}
                      className="px-4 py-4 text-center"
                    >
                      Không tìm thấy dữ liệu
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <AnalyticsFilterModal
            isOpen={isFilterModalOpen}
            onClose={closeFilterModal}
            onApply={applyFilters}
            storagePrefix="_calls"
            filtersReset={filtersReset}
          />
          {(totalEntries && totalEntries > 0) ||
          (totalPages && totalPages > 1) ? (
            <div className="border-gray-100 py-4 pl-[18px] pr-4 ">
              <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between">
                {totalEntries && totalEntries > 0 ? (
                  <div className="pb-3 xl:pb-0">
                    <p
                      className={`pb-3 text-sm font-medium text-center text-gray-500 ${totalPages && totalPages > 1 && 'border-b'} border-gray-100 
                      dark:border-gray-800 dark:text-gray-400 xl:border-b-0 xl:pb-0 xl:text-left`}
                    >
                      Hiển thị từ {(startIndex || 0) + 1} đến {endIndex || 0}{' '}
                      trên tổng số {totalEntries} bản ghi
                    </p>
                  </div>
                ) : null}
                {totalPages && totalPages > 1 ? (
                  <Pagination
                    currentPage={currentPage || 1}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
