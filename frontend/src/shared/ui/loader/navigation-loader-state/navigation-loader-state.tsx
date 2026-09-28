'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { LinearLoader } from '@/shared/ui/loader/linear-loader'

export default function NavigationLoader() {
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleStart = () => setIsLoading(true)
    const handleComplete = () => setIsLoading(false)

    handleStart()

    const timer = setTimeout(() => {
      handleComplete()
    }, 100)

    return () => clearTimeout(timer)
  }, [pathname, searchParams])

  return isLoading ? <LinearLoader /> : null
}
