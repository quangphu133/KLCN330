// Ghi chú nhóm: Cập nhật nội dung và luồng giao diện đăng nhập theo yêu cầu demo.
'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

export const useSignInForm = () => {
  const loginFormSchema = z.object({
    email: z
      .string()
      .trim()
      .min(1, 'Vui lòng nhập tài khoản hoặc email'),
    password: z.string().min(1, 'Nhập mật khẩu'),
    rememberMe: z.boolean().optional(),
  })

  type LoginFormType = z.infer<typeof loginFormSchema>

  return useForm<LoginFormType>({
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onBlur',
    resolver: zodResolver(loginFormSchema),
  })
}
