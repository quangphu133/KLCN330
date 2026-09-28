'use client'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export const useAuthCheck = () => {
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    const email = localStorage.getItem('userEmail')

    if (token && email) {
      setIsLoggedIn(true)
    }

    setLoading(false)
  }, [pathname])

  return { loading, isLoggedIn }
}
