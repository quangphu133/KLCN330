import { ColumnConfig } from '@/shared/hooks/use-sort'
import { TableRowData } from '@/entities/mediafile/hooks/use-calls'

export const columnConfig: ColumnConfig<TableRowData>[] = [
  { key: 'date', label: 'Date', sortable: true },
  { key: 'operator', label: 'Operator', sortable: false },
  { key: 'phone', label: 'Điện thoại number', sortable: false },
  { key: 'projectName', label: 'Project', sortable: false },
  { key: 'duration', label: 'Duration', sortable: true },
  { key: 'negative', label: 'Tiêu cực', sortable: true },
  { key: 'lexis', label: 'Lexis', sortable: true },
  { key: 'interruptions', label: 'Ngắt lời', sortable: true },
  { key: 'silence', label: 'Silence (max.)', sortable: true },
  { key: 'checklist', label: 'Checklist', sortable: true},
  { key: 'gptSummary', label: 'Tóm tắt', sortable: false },
]
