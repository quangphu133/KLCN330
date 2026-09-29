// Ghi chú nhóm: Cập nhật giao diện và nội dung tiếng Việt cho khu vực này.
'use client'

import { useState, useEffect } from 'react'
import { appRoutes } from '@/shared/constants/routes'
import { useAuthCheck } from '@/shared/hooks/useAuthCheck'
import { useRouter } from 'next/navigation'
import { LogoIcon } from '@/../public/assets/svg-components'

export default function UnderConstruction() {
  const [dots, setDots] = useState('')
  const router = useRouter()
  const { isLoggedIn, loading } = useAuthCheck()

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'))
    }, 500)
    return () => clearInterval(interval)
  }, [])

  function handleMain() {
    if (loading) return
    router.push(isLoggedIn ? appRoutes.private.dashboard : appRoutes.auth.signIn)
  }

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="text-center p-8 rounded-lg max-w-md">
        <div className={'flex justify-center mb-2'}>
          <LogoIcon width={200} height={65} fill={'#0068AD'} />
        </div>

        <div className="bg-purple-900 h-1 w-16 mx-auto mb-6"></div>

        <h2 className="text-xl font-semibold text-gray-800 mb-2 dark:text-white">Trang đang được xây dựng{dots}</h2>

        <p className="text-gray-600 mb-6 dark:text-gray-400">
          Chúng tôi đang cải thiện khu vực này và sẽ sớm cung cấp.
        </p>

        <button
          onClick={handleMain}
          className="cursor-pointer rounded-full bg-purple-900 font-medium hover:bg-purple-800 text-white font-medium py-2 px-6 transition-colors"
        >
          Quay lại
        </button>
      </div>
    </div>
  )
}
