'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

export const useSignInForm = () => {
  const loginFormSchema = z.object({
    email: z
      .string()
      .trim()
      .min(1, 'Enter your email address')
      .email('Invalid email address'),
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
