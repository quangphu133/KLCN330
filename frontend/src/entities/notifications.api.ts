import { commonApi } from '@/entities/common/base-query'

export interface CallNotification {
  id: number
  event_type: string
  title: string
  message: string
  call_record_id: number | null
  asr_job_id: number | null
  job_id: string | null
  job_status: 'queued' | 'running' | 'completed' | 'failed' | null
  is_read: boolean
  created_at: string
}

export const notificationsApi = commonApi.injectEndpoints({
  endpoints: builder => ({
    getNotifications: builder.query<CallNotification[], { offset?: number; limit?: number }>({
      query: ({ offset = 0, limit = 50 } = {}) => ({
        url: 'api/notifications/',
        params: { offset, limit },
      }),
      providesTags: ['NOTIFICATIONS'],
    }),
    markNotificationRead: builder.mutation<CallNotification, number>({
      query: id => ({
        url: `api/notifications/${id}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['NOTIFICATIONS'],
    }),
  }),
})

export const { useGetNotificationsQuery, useMarkNotificationReadMutation } = notificationsApi
