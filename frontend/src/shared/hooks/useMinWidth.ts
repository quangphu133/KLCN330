import { useEffect, useState } from 'react'

export const useMinWidth = (minWidth: number): boolean => {
  const [isWideEnough, setIsWideEnough] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsWideEnough(window.innerWidth >= minWidth)
    }

    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [minWidth])

  return isWideEnough
}
