import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { commonApi } from '@/entities/common/base-query'

export const store = configureStore({
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(commonApi.middleware),
  reducer: {
    [commonApi.reducerPath]: commonApi.reducer,
  },
})

setupListeners(store.dispatch)
