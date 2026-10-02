import { commonApi } from '@/entities/common/base-query'
import {
  AnalyticsDashboardQueryParams,
  AnalyticsDashboardResponse,
} from '@/entities/analytics/analytics.types'

const AnalyticsApi = commonApi.injectEndpoints({
  endpoints: builder => ({
    getAnalyticsDashboard: builder.query<
      AnalyticsDashboardResponse,
      AnalyticsDashboardQueryParams | void
    >({
      query: args => ({
        url: 'api/analytics/dashboard',
        method: 'GET',
        params: {
          start: args?.start,
          end: args?.end,
          offset: args?.offset ?? 0,
          limit: args?.limit ?? 10,
          telesaleId: args?.telesaleId,
          topNKeywords: args?.topNKeywords ?? 5,
          negativeLevelThreshold: args?.negativeLevelThreshold ?? 0.3,
          filterByPhrasesCategoriesCommaSeparated: args?.filterByPhrasesCategoriesCommaSeparated,
        },
      }),
      providesTags: ['ANALYTICS_DASHBOARD'],
    }),
  }),
})

export const { useGetAnalyticsDashboardQuery } = AnalyticsApi
