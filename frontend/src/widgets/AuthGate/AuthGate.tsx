// Ghi chú nhóm: Cập nhật xử lý phiên và điều hướng khi xác thực.
'use client'

import { LoaderMain } from '../../shared/ui/loader'
import { usePathname } from 'next/navigation'
import { Fragment, type ReactNode } from 'react'
import { useMinWidth } from '@/shared/hooks/useMinWidth'
import { isAuthRoute, isPrivateRoute, useAuthRedirect } from '@/shared/hooks/use-auth-redirect'
import { appRoutes } from '@/shared/constants/routes'

export const AuthGate = ({ children }: { children: ReactNode }) => {
  const { isLoggedIn, loading } = useAuthRedirect()
  const pathname = usePathname()
  const isWideEnough = useMinWidth(1024)

  // const showLoader = loading || (!isLoggedIn && isPrivateRoute(pathname) && !isAuthRoute(pathname))
  const showLoader =
    loading ||
    (!isLoggedIn && !Object.values(appRoutes.auth).includes(pathname.toLocaleLowerCase()))

  let loaderBgColor
  let loaderTextColor
  if (appRoutes.private.dashboard.includes(pathname.toLocaleLowerCase())) {
    loaderBgColor = 'bg-white dark:bg-gray-900'
    loaderTextColor = 'text-gray-800 dark:text-gray-200'
  } else {
    loaderBgColor = 'bg-black/10'
    loaderTextColor = 'text-white'
  }

  return (
    <Fragment>
      {showLoader && <LoaderMain bgColor={loaderBgColor} textColor={loaderTextColor} />}
      {!showLoader && !isWideEnough ? (
        <div className="p-6 text-lg h-screen flex items-center justify-center">
          Ứng dụng chỉ khả dụng trên màn hình có chiều rộng từ 1024 px trở lên.
        </div>
      ) : !showLoader ? (
        children
      ) : null}
    </Fragment>
  )
}
