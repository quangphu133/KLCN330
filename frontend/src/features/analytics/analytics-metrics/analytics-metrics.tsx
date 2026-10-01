// Ghi chú nhóm: Việt hóa và cải thiện hiển thị chế độ tối cho trang thống kê.
import { SummaryData } from '@/entities/analytics/analytics.types';

interface AnalyticsMetricsProps {
  data?: SummaryData;
}

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes} phút ${remainingSeconds} giây`;
};

const formatPercentage = (value: number | null): string => {
  return value == null ? '—' : `${(value * 100).toFixed(2)}%`;
};

const metricsMapping = [
  {
    key: 'recordsCount',
    title: 'Số cuộc gọi',
    format: (value: number) => value.toLocaleString('vi-VN'),
  },
  {
    key: 'averageDuration',
    title: 'Thời lượng cuộc gọi trung bình',
    format: formatDuration,
  },
  {
    key: 'averageNegativeLevelOverall',
    title: 'Tỷ lệ tiêu cực trung bình',
    format: formatPercentage,
    color: 'error',
  },
  {
    key: 'averageKeywordsCount',
    title: 'Số từ khóa trung bình',
    format: (value: number) => value.toFixed(2),
  },
  {
    key: 'averageMaxSimultaneousSilenceDuration',
    title: 'Thời lượng tạm dừng đồng bộ trung bình',
    format: formatDuration,
  },
  {
    key: 'averageSimultaneousSpeechCount',
    title: 'Số lần ngắt lời trung bình',
    format: (value: number) => value.toFixed(2) + '%',
  },
] as const;

const AnalyticsMetrics: React.FC<AnalyticsMetricsProps> = ({
  data,
}: AnalyticsMetricsProps) => {
  if (!data) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
      {metricsMapping.map(({ key, title, format }) => (
        <div
          key={key}
          className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
        >
          <p className="text-gray-500 text-sm dark:text-gray-400 mb-3 leading-[32px]">
            {title}
          </p>
          <h4 className={`text-2xl font-bold leading-[32px]`}>
            {key === 'averageNegativeLevelOverall'
              ? formatPercentage(data.averageNegativeLevelOverall)
              : format(data[key as keyof SummaryData] as number)}
          </h4>
        </div>
      ))}
    </div>
  );
};

export default AnalyticsMetrics;
