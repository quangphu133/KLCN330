// Ghi chú nhóm: Cập nhật giao diện và nội dung tiếng Việt cho khu vực này.
import { ColumnConfig } from '@/shared/hooks/use-sort'
import { TableRowData } from '@/entities/mediafile/hooks/use-calls'

export const columnConfig: ColumnConfig<TableRowData>[] = [
  { key: 'date', label: 'Ngày gọi', sortable: true },
  { key: 'employee', label: 'Nhân viên', sortable: false },
  { key: 'phone', label: 'Số điện thoại', sortable: false },
  { key: 'projectName', label: 'Dự án', sortable: false },
  { key: 'duration', label: 'Thời lượng', sortable: true },
  { key: 'negative', label: 'Tiêu cực', sortable: true },
  { key: 'complianceScore', label: 'Điểm tuân thủ', sortable: false },
  { key: 'lexis', label: 'Từ khóa', sortable: true },
  { key: 'interruptions', label: 'Ngắt lời', sortable: true },
  { key: 'silence', label: 'Thời gian im lặng tối đa', sortable: true },
  { key: 'checklist', label: 'Bộ tiêu chí', sortable: true},
  { key: 'gptSummary', label: 'Tóm tắt', sortable: false },
]
