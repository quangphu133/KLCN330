export interface KeywordFrequencyItem {
  keyword: string
  count: number
}

export interface PlotDataItem {
  dateTime: string
  keywordsExceedCount: number
  maxSilenceDurationExceedCount: number
  negativeLevelExceedCount: number
  simultaneousSpeechExceedCount: number
}

export interface NegativeHistogramData {
  [level: string]: number
}

export interface SummaryData {
  recordsCount: number
  averageDuration: number
  averageNegativeLevelOverall: number | null
  averageKeywordsCount: number
  averageMaxSimultaneousSilenceDuration: number
  averageSimultaneousSpeechCount: number
}

export interface EmployeeRatingDataItem {
  telesaleId: number | null
  telesaleName: string
  recordsCount: number
  averageDuration: number
  averageNegativeLevelOverall: number | null
  averageKeywordsCount: number
  averageMaxSimultaneousSilenceDuration: number
  averageSimultaneousSpeechCount: number
}

export interface AnalyticsDashboardQueryParams {
  start?: string
  end?: string
  offset?: number
  limit?: number
  telesaleId?: number
  topNKeywords?: number
  negativeLevelThreshold?: number
  filterByPhrasesCategoriesCommaSeparated?: string
}

export interface AnalyticsDashboardResponse {
  keywordsFrequencyData: KeywordFrequencyItem
  messageText: string
  plotData: PlotDataItem[]
  negativeHistogramData: NegativeHistogramData
  summaryData: SummaryData
  employeeRatingData: EmployeeRatingDataItem[]
}
