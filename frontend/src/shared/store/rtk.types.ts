import { useDispatch, useSelector, useStore } from 'react-redux'
import { store } from '@/shared/store/store'

export type AppStore = typeof store
export type AppDispatch = AppStore['dispatch']
export type AppRootState = ReturnType<AppStore['getState']>

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<AppRootState>()
export const useAppStore = useStore.withTypes<AppStore>()
