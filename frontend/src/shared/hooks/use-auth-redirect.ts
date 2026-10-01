'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { appRoutes } from '@/shared/constants/routes'
import { useAuthCheck } from '@/shared/hooks/useAuthCheck'

export const ADMIN_ONLY_ROUTES: string[] = [
  appRoutes.private.operators,
  appRoutes.private.projects,
  appRoutes.private.checklists,
  appRoutes.private.dictionaries,
]

export function isPrivateRoute(pathname: string): boolean {
  return Object.values(appRoutes.private).some(route => {
    if (typeof route === 'string') {
      return pathname === route || pathname.startsWith(route + '/')
    }
    if (pathname.startsWith('/calls/')) {
      return true
    }
    return false
  })
}

export function isAuthRoute(pathname: string): boolean {
  return Object.values(appRoutes.auth).includes(pathname)
}

export const useAuthRedirect = () => {
  const { loading, isLoggedIn, userRole } = useAuthCheck()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === 'undefined' || loading) {
      return
    }

    if (isAuthRoute(pathname) && isLoggedIn) {
      if (userRole === 'telesales') {
        router.push(appRoutes.private.calls)
      } else {
        router.push(appRoutes.private.dashboard)
      }
    } else if (isPrivateRoute(pathname) && !isLoggedIn) {
      router.push(appRoutes.auth.signIn)
    } else if (isLoggedIn && userRole !== 'admin') {
      const isAdminRoute = ADMIN_ONLY_ROUTES.some(
        route => pathname === route || pathname.startsWith(route + '/')
      )
      if (isAdminRoute) {
        router.push(appRoutes.private.calls)
      }
    }
  }, [isLoggedIn, loading, pathname, router, userRole])

  return { isLoggedIn, loading, userRole }
}
