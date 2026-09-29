'use client';

import { ApexOptions } from 'apexcharts';
import dynamic from 'next/dynamic';
import { useTheme } from '@/shared/context/theme-context/theme-context';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface PlotDataItem {
  dateTime: string;
  keywordsExceedCount: number;
  maxSilenceDurationExceedCount: number;
  negativeLevelExceedCount: number;
  simultaneousSpeechExceedCount: number;
}

interface ImpressionChartProps {
  data?: PlotDataItem[];
  dateRange?: { start: string; end: string };
}

export default function ImpressionChart({
  data,
  dateRange,
}: ImpressionChartProps) {
  const { theme } = useTheme();
  const processHourlyData = (
    data: PlotDataItem[] | undefined,
    dateRange?: { start: string; end: string }
  ) => {
    if (!data || data.length === 0) return { categories: [], series: [] };

    // Create a map đến store daily aggregated data
    const dailyData = new Map<
      string,
      {
        negativeLevelExceedCount: number;
        keywordsExceedCount: number;
        maxSilenceDurationExceedCount: number;
        simultaneousSpeechExceedCount: number;
      }
    >();

    const allDates: string[] = [];
    if (dateRange) {
      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);

      for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
        const dateKey = dt.toISOString().split('T')[0];
        allDates.push(dateKey);

        dailyData.set(dateKey, {
          negativeLevelExceedCount: 0,
          keywordsExceedCount: 0,
          maxSilenceDurationExceedCount: 0,
          simultaneousSpeechExceedCount: 0,
        });
      }
    }

    data.forEach((item) => {
      const date = new Date(item.dateTime);
      const dateKey = date.toISOString().split('T')[0];

      if (!dailyData.has(dateKey)) {
        dailyData.set(dateKey, {
          negativeLevelExceedCount: 0,
          keywordsExceedCount: 0,
          maxSilenceDurationExceedCount: 0,
          simultaneousSpeechExceedCount: 0,
        });
      }

      const current = dailyData.get(dateKey)!;
      current.negativeLevelExceedCount += item.negativeLevelExceedCount || 0;
      current.keywordsExceedCount += item.keywordsExceedCount || 0;
      current.maxSilenceDurationExceedCount +=
        item.maxSilenceDurationExceedCount || 0;
      current.simultaneousSpeechExceedCount +=
        item.simultaneousSpeechExceedCount || 0;
    });

    const sortedDates =
      allDates.length > 0 ? allDates : Array.from(dailyData.keys()).sort();

    const formattedDates = sortedDates.map((dateStr) => {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('vi-VN', {
        month: 'short',
        day: 'numeric',
      }).format(date);
    });

    const negativeLevelData = sortedDates.map(
      (date) => dailyData.get(date)?.negativeLevelExceedCount || 0
    );
    const keywordsData = sortedDates.map(
      (date) => dailyData.get(date)?.keywordsExceedCount || 0
    );
    const silenceData = sortedDates.map(
      (date) => dailyData.get(date)?.maxSilenceDurationExceedCount || 0
    );
    const speechData = sortedDates.map(
      (date) => dailyData.get(date)?.simultaneousSpeechExceedCount || 0
    );

    return {
      categories: formattedDates,
      series: [
        {
          name: 'Tiêu cực',
          data: negativeLevelData,
          color: '#0068AD',
        },
        {
          name: 'Lexis',
          data: keywordsData,
          color: '#007AFF',
        },
        {
          name: 'Tạm dừng',
          data: silenceData,
          color: '#FF3B30',
        },
        {
          name: 'Ngắt lời',
          data: speechData,
          color: '#FF9500',
        },
      ],
    };
  };

  const { categories, series } = processHourlyData(data, dateRange);

  const options: ApexOptions = {
    theme: { mode: theme },
    legend: {
      show: true,
      position: 'bottom',
      horizontalAlign: 'center',
      offsetY: 10,
      itemMargin: {
        horizontal: 10,
        vertical: 0,
      },
      fontSize: '14px',
      labels: { colors: theme === 'dark' ? '#D1D5DB' : '#374151' },
    },
    chart: {
      fontFamily: 'Outfit, sans-serif',
      height: 310,
      type: 'area',
      toolbar: {
        show: false,
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        opacityFrom: 1,
        opacityTo: 1,
      },
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    markers: {
      size: 4,
      hover: {
        size: 6,
      },
    },
    grid: {
      borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      x: {
        format: 'dd MMM yyyy',
      },
    },
    xaxis: {
      type: 'category',
      categories: categories,
      labels: {
        style: { colors: theme === 'dark' ? '#9CA3AF' : '#6B7280' },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    yaxis: {
      labels: {
        style: { colors: theme === 'dark' ? '#9CA3AF' : '#6B7280' },
      },
      title: {
        text: '',
      },
    },
  };

  return (
    <div
      className="rounded-2xl h-full border border-gray-100 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-gray-900 sm:px-6 sm:pt-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <h3 className="mb-1 text-lg font-semibold text-neutral-900 dark:text-gray-100">
            Xu hướng
          </h3>
        </div>
      </div>
      <div className="max-w-full overflow-x-clip custom-scrollbar">
        <div className="-ml-5 min-w-[1300px] xl:min-w-full pl-2">
          {series.length > 0 ? (
            <Chart options={options} series={series} type="line" height={350} />
          ) : (
            <div className="flex h-64 items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">Chưa có dữ liệu để hiển thị</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
