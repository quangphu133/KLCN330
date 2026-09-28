export type ChatType = 'Notification' | 'Alert'

export interface GetChatMessagesRequest {
  chatType: ChatType
  start?: string
  end?: string
  offset?: number
  limit?: number
}

export interface ChatMessage {
  id: number
  chatId: number
  createDate: string
  text: string | null
  attachmentsCount: number
  seen: boolean
}
