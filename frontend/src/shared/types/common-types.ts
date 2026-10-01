import { FetchBaseQueryError } from '@reduxjs/toolkit/query'

export type MessageArrayModel = {
  field: string
  message: string
}[]
export type ErrorWithData =
  | ({
      data: {
        errorsMessages?: MessageArrayModel
        extensions?: Array<{ key: string; message: string }>
        message?: MessageArrayModel | string
      }
    } & FetchBaseQueryError)
  | string
export type Nullable<T> = T | null
export type ErrorModel = {
  data: { error: string; messages: ErrorModelMessages[]; statusCode: number }
  status: string
}
export type ErrorModelMessages = {
  field: string
  message: string
}

export type CustomErrorWithMessage = {
  data: {
    message: string
  }
}
