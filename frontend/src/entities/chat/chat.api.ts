import { commonApi } from '@/entities/common/base-query'
import { ChatMessage, GetChatMessagesRequest } from '@/entities/chat/chat.types'

export const ChatApi = commonApi.injectEndpoints({
  endpoints: builder => ({
    getChatMessages: builder.query<ChatMessage[], GetChatMessagesRequest>({
      query: ({ chatType, ...params }) => ({
        url: `api/chat/${chatType}/message`,
        method: 'GET',
        params,
      }),
      providesTags: ['CHAT'],
    }),
  }),
})

export const { useGetChatMessagesQuery } = ChatApi
