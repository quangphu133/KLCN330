// Ghi chú nhóm: Cập nhật giao diện và nội dung tiếng Việt cho khu vực này.
'use client'

import { ReactNode, useEffect, useState } from 'react'
import { getFromLocalStorage } from '@/shared/utils/common-utils'
import { UploadAlert } from '@/shared/ui/upload-alert/upload-alert'

interface CallsFeatureWrapperProps {
  children: ReactNode
}

export const CallsFeatureWrapper = ({ children }: CallsFeatureWrapperProps) => {
  const [showUploadAlert, setShowUploadAlert] = useState(false)

  useEffect(() => {
    const checkForRecentUpload = () => {
      const lastUploadTimestamp = getFromLocalStorage('lastUploadTimestamp', '')

      if (lastUploadTimestamp) {
        const uploadTime = parseInt(lastUploadTimestamp, 10)
        const currentTime = new Date().getTime()
        const timeDifference = currentTime - uploadTime

        if (timeDifference < 600000) {
          setShowUploadAlert(true)

          const remainingTime = 600000 - timeDifference
          const timeoutId = setTimeout(() => {
            setShowUploadAlert(false)
          }, remainingTime)

          return () => clearTimeout(timeoutId)
        }
      }
    }

    checkForRecentUpload()

    window.addEventListener('focus', checkForRecentUpload)
    return () => window.removeEventListener('focus', checkForRecentUpload)
  }, [])

  const handleCloseAlert = () => {
    setShowUploadAlert(false)
  }

  return (
    <>
      {showUploadAlert && (
        <UploadAlert
          onClose={handleCloseAlert}
          title={'Lưu ý: Bản ghi đã tải lên đang được xử lý và sẽ sớm khả dụng.'}
        />
      )}
      {children}
    </>
  )
}
