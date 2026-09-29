// Ghi chú nhóm: Cập nhật nội dung và luồng giao diện đăng nhập theo yêu cầu demo.
import { SignInForm } from '@/features/auth/sign-in-form'

export const metadata = {
  title: 'Đăng nhập',
  description: 'Đăng nhập vào tài khoản của bạn',
}

export default function SignInPage() {
  return <SignInForm />
}
