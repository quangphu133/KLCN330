'use client'

import React from 'react'
import Button from '@/shared/ui/button/button'
import { EditIcon } from '@/../public/assets/icons'

interface SummaryProps {
  content: string
}

export const Summary: React.FC<SummaryProps> = ({ content }) => {
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Tóm tắt</h2>
        {/*<Button*/}
        {/*  className="w-[164px] h-[44px] border border-gray-200 rounded-full hover:bg-gray-100 mb-2 flex items-center gap-2 cursor-pointer"*/}
        {/*  onClick={() => {}}*/}
        {/*>*/}
        {/*  <span>Chỉnh sửa</span>*/}
        {/*  <EditIcon width={20} height={20} />*/}
        {/*</Button>*/}
      </div>
      <p className="text-gray-700 text-sm leading-relaxed">{content}</p>
    </>
  )
}
