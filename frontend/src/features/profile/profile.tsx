'use client'

import { useEffect } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
} from '@/entities/auth/auth.api'
import Button from '@/shared/ui/button/button'
import Input from '@/shared/ui/input/input'
import { setToLocalStorage } from '@/shared/utils/common-utils'

const profileSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Họ tên phải có ít nhất 2 ký tự').max(100),
    email: z.string().trim().email('Email không hợp lệ'),
    currentPassword: z.string(),
    newPassword: z.string(),
    confirmPassword: z.string(),
  })
  .superRefine((data, context) => {
    if (data.newPassword && data.newPassword.length < 6) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Mật khẩu mới phải có ít nhất 6 ký tự',
        path: ['newPassword'],
      })
    }
    if (data.newPassword && !data.currentPassword) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Vui lòng nhập mật khẩu hiện tại',
        path: ['currentPassword'],
      })
    }
    if (data.newPassword !== data.confirmPassword) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Mật khẩu xác nhận chưa khớp',
        path: ['confirmPassword'],
      })
    }
  })

type ProfileFormValues = z.infer<typeof profileSchema>

export function Profile() {
  const { data: profile, isLoading, isError, refetch } = useGetProfileQuery()
  const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      email: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  useEffect(() => {
    if (profile) {
      reset({
        fullName: profile.full_name ?? '',
        email: profile.email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    }
  }, [profile, reset])

  const onSubmit = handleSubmit(async values => {
    try {
      const updated = await updateProfile({
        email: values.email,
        full_name: values.fullName,
        ...(values.newPassword
          ? {
              current_password: values.currentPassword,
              new_password: values.newPassword,
            }
          : {}),
      }).unwrap()

      setToLocalStorage('userEmail', updated.email)
      window.dispatchEvent(new Event('profile-updated'))
      reset({
        fullName: updated.full_name ?? '',
        email: updated.email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      toast.success('Đã cập nhật hồ sơ')
    } catch (error) {
      const apiError = error as { data?: { detail?: string } }
      toast.error(apiError.data?.detail ?? 'Không thể cập nhật hồ sơ')
    }
  })

  if (isLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="size-11 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
      </div>
    )
  }

  if (isError || !profile) {
    return (
      <div className="rounded-3xl border border-rose-100 bg-white p-10 text-center shadow-sm dark:border-rose-900/40 dark:bg-gray-900">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Không thể tải hồ sơ</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Vui lòng kiểm tra phiên đăng nhập và thử lại.</p>
        <Button
          type="button"
          variant="purple"
          className="mt-6"
          onClick={() => refetch()}
        >
          Thử lại
        </Button>
      </div>
    )
  }

  const initial = (profile.full_name || profile.email).charAt(0).toUpperCase()
  const roleLabel = profile.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'

  return (
    <div className="mx-auto w-full max-w-6xl pb-10">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">
          Tài khoản HUIT
        </p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">Chỉnh sửa hồ sơ</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Quản lý thông tin cá nhân và mật khẩu đăng nhập của bạn.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="h-fit overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-[0_18px_50px_rgba(0,79,135,0.08)] dark:border-gray-800 dark:bg-gray-900">
          <div className="h-24 bg-gradient-to-br from-blue-700 to-blue-500" />
          <div className="px-7 pb-8 text-center">
            <div className="mx-auto -mt-12 flex size-24 items-center justify-center rounded-3xl border-4 border-white bg-blue-50 text-4xl font-bold text-blue-700 shadow-lg dark:border-gray-900 dark:bg-blue-950/60 dark:text-blue-300">
              {initial}
            </div>
            <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
              {profile.full_name || 'Chưa cập nhật họ tên'}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{profile.email}</p>
            <span className="mt-4 inline-flex rounded-full bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
              {roleLabel}
            </span>

            <div className="mt-7 space-y-3 border-t border-gray-100 pt-6 text-left text-sm dark:border-gray-800">
              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-500 dark:text-gray-400">Trạng thái</span>
                <span className="font-semibold text-green-700 dark:text-green-400">
                  {profile.is_active ? 'Đang hoạt động' : 'Đã khóa'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-500 dark:text-gray-400">Ngày tạo</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {new Intl.DateTimeFormat('vi-VN').format(new Date(profile.created_at))}
                </span>
              </div>
            </div>
          </div>
        </aside>

        <form onSubmit={onSubmit} className="space-y-6">
          <section className="rounded-3xl border border-blue-100 bg-white p-6 shadow-[0_18px_50px_rgba(0,79,135,0.08)] dark:border-gray-800 dark:bg-gray-900 md:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Thông tin cá nhân</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Thông tin này được hiển thị trong hệ thống quản trị.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <Input
                {...register('fullName')}
                id="fullName"
                label="Họ và tên"
                placeholder="Nhập họ và tên"
                error={errors.fullName?.message}
              />
              <Input
                {...register('email')}
                id="email"
                type="email"
                label="Email đăng nhập"
                placeholder="ten@vidu.com"
                error={errors.email?.message}
              />
            </div>
          </section>

          <section className="rounded-3xl border border-blue-100 bg-white p-6 shadow-[0_18px_50px_rgba(0,79,135,0.08)] dark:border-gray-800 dark:bg-gray-900 md:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Đổi mật khẩu</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Để trống phần này nếu bạn không muốn thay đổi mật khẩu.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              <Input
                {...register('currentPassword')}
                id="currentPassword"
                type="password"
                label="Mật khẩu hiện tại"
                autoComplete="current-password"
                error={errors.currentPassword?.message}
              />
              <Input
                {...register('newPassword')}
                id="newPassword"
                type="password"
                label="Mật khẩu mới"
                autoComplete="new-password"
                error={errors.newPassword?.message}
              />
              <Input
                {...register('confirmPassword')}
                id="confirmPassword"
                type="password"
                label="Xác nhận mật khẩu mới"
                autoComplete="new-password"
                error={errors.confirmPassword?.message}
              />
            </div>
          </section>

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="purple"
              disabled={isSaving || !isDirty}
              className="min-w-40"
            >
              {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
