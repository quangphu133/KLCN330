'use client'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export const useAuthCheck = () => {
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState<string>('telesales')
  const pathname = usePathname()

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    const email = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null
    const role = typeof window !== 'undefined' ? (localStorage.getItem('userRole') || 'telesales') : 'telesales'

    if (token && email) {
      setIsLoggedIn(true)
      setUserRole(role)
    } else {
      setIsLoggedIn(false)
      setUserRole('telesales')
    }

    setLoading(false)
  }, [pathname])

  return { loading, isLoggedIn, userRole }
}
