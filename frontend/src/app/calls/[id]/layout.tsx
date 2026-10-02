// Ghi chú nhóm: Cập nhật bố cục và khả năng hiển thị giao diện theo chủ đề.
import { ReactNode } from 'react'
import { CallLayout } from '@/widgets/CallLayout'

export const metadata = {
  title: 'Chi tiết cuộc gọi',
}

export default function Layout({ children }: { children: ReactNode }) {
  return <CallLayout>{children}</CallLayout>
}
