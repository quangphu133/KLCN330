'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { appRoutes } from '@/shared/constants/routes'
import { useAuthCheck } from '@/shared/hooks/useAuthCheck'

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
  const { loading, isLoggedIn } = useAuthCheck()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === 'undefined' || loading) {
      return
    }

    if (isAuthRoute(pathname) && isLoggedIn) {
      router.push(appRoutes.private.dashboard)
    } else if (isPrivateRoute(pathname) && !isLoggedIn) {
      router.push(appRoutes.auth.signIn)
    }
  }, [isLoggedIn, loading, pathname, router])

  return { isLoggedIn, loading }
}
