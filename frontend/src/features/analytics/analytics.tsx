// Ghi chú nhóm: Việt hóa và cải thiện hiển thị chế độ tối cho trang thống kê.
'use client';

import React, { useState } from 'react';
import AnalyticsMetrics from '@/features/analytics/analytics-metrics/analytics-metrics';
import AnalyticsBarChart from '@/features/analytics/analytics-bar-chart/analytics-bar-chart';
import ImpressionChart from '@/features/analytics/analytics-impression-chart/analytics-impression-chart';
import TopChannel from '@/features/analytics/top-channel/top-channel';
import TopPages from '@/features/analytics/top-pages/top-pages';
import { useGetAnalyticsDashboardQuery } from '@/entities/analytics/analytics.api';
import Button from '@/shared/ui/button/button';
import { FilterIcon } from '@/../public/assets/icons';
import AnalyticsFilterModal from '@/features/analytics/analytics-filter-modal/analytics-filter-modal';
import { getLast30DaysRange } from '@/shared/utils/date-utils';
import { LoaderContent } from '@/shared/ui/loader';

export const Analytics = () => {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const defaultDateRange = getLast30DaysRange();
  const [filterParams, setFilterParams] = useState({
    start: defaultDateRange.start,
    end: defaultDateRange.end,
    filterByPhrasesCategoriesCommaSeparated: undefined,
    offset: 0,
    limit: 10,
    topNKeywords: 5,
    negativeLevelThreshold: 0.3,
  });

  const { data, isLoading } = useGetAnalyticsDashboardQuery(filterParams);

  const openFilterModal = () => setIsFilterModalOpen(true);
  const closeFilterModal = () => setIsFilterModalOpen(false);

  const applyFilters = (params: any) => {
    setFilterParams({ ...filterParams, ...params });
    closeFilterModal();
  };

  const currentDateRange = {
    start: filterParams.start,
    end: filterParams.end,
  };

  return (
    <div className="rounded-lg">
      {isLoading ? (
        <LoaderContent width={200} height={200} isLoading={isLoading} />
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold">Phân tích và báo cáo</h1>
            <Button
              className="w-[112px] h-[44px] border border-gray-200 rounded-full mb-2 flex items-center gap-2 cursor-pointer"
              onClick={openFilterModal}
            >
              <span>Lọc</span>
              <FilterIcon width={20} height={20} />
            </Button>
          </div>

          <div className="grid grid-cols-12 gap-4 md:gap-6">
            <div className="col-span-12">
              <AnalyticsMetrics data={data?.summaryData} />
            </div>
            <div className="col-span-12 md:col-span-6">
              <ImpressionChart
                data={data?.plotData}
                dateRange={currentDateRange}
              />
            </div>
            <div className="col-span-12 md:col-span-6">
              <AnalyticsBarChart data={data?.negativeHistogramData} />
            </div>
            <div className="col-span-12 md:col-span-6">
              <TopChannel data={data?.operatorRatingData} />
            </div>
            <div className="col-span-12 md:col-span-6">
              <TopPages
                data={
                  data?.keywordsFrequencyData
                    ? Object.entries(data.keywordsFrequencyData)
                        .map(([keyword, count]) => ({
                          keyword,
                          count,
                        }))
                        .sort((a, b) => b.count - a.count)
                    : []
                }
              />
            </div>
          </div>

          {/* Filter Modal */}
          <AnalyticsFilterModal
            isOpen={isFilterModalOpen}
            onClose={closeFilterModal}
              onApply={applyFilters}
            storagePrefix="_analytics"
          />
        </>
      )}
    </div>
  );
};
