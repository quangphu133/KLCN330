'use client'

import { useState } from 'react'
import Link from 'next/link'
import { EyeCloseIcon, EyeIcon, Logo } from '@/../public/assets/icons'
import { useSignInForm } from '@/features/auth/sign-in-form/use-sign-in-form'
import { ControlledTextField } from '@/shared/ui/input/controlled-text-field'
import { ControlledCheckbox } from '@/shared/ui/checkbox/controlled-checkbox'
import Button from '@/shared/ui/button/button'
import { appRoutes } from '@/shared/constants/routes'
import { toast } from 'react-toastify'
import { setToLocalStorage } from '@/shared/utils/common-utils'
import { useSignInMutation } from '@/entities/auth/auth.api'

export function SignInForm() {
  const [showPassword, setShowPassword] = useState(false)
  const { handleSubmit, control } = useSignInForm()
  const [signIn, { isLoading }] = useSignInMutation()

  const getHomePage = () => {
    const savedPage = localStorage.getItem('accountHomePage')
    const allowedPages = [
      appRoutes.private.dashboard,
      appRoutes.private.calls,
      appRoutes.private.uploadingRecord,
    ]

    return allowedPages.includes(savedPage ?? '')
      ? savedPage!
      : appRoutes.private.dashboard
  }

  const handleDemoLogin = () => {
    setToLocalStorage('accessToken', 'local-demo-token')
    setToLocalStorage('userEmail', 'demo@example.com')
    window.location.href = getHomePage()
  }

  const onSubmit = handleSubmit(async (data: any) => {
    try {
      const payload = {
        email: data.email,
        password: data.password,
      }

      const response = await signIn(payload).unwrap()

      setToLocalStorage('accessToken', response.accessToken)
      setToLocalStorage('userEmail', data.email)

      window.location.href = getHomePage()
    } catch (error: any) {
      if (error.status === 401) {
        toast.error('Invalid email or password')
      } else {
        toast.error('Authentication error')
      }
    }
  })

  return (
    <>
      <div className="huit-auth-page flex min-h-screen">
        {/* Left side - Sign-in form */}
        <div className="w-full lg:w-1/2 p-8 flex items-center justify-center">
          <div className="w-full max-w-[440px] rounded-3xl border border-blue-100 bg-white/90 p-8 shadow-[0_24px_70px_rgba(0,79,135,0.12)] backdrop-blur-sm">
            <div className="mb-7">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-600 text-lg font-bold text-white shadow-lg shadow-blue-600/20">
                  H
                </div>
                <div>
                  <p className="text-xs font-bold tracking-[0.16em] text-blue-700">HUIT</p>
                  <p className="text-xs text-gray-500">Hệ thống hậu kiểm cuộc gọi</p>
                </div>
              </div>
              <div className="huit-red-rule mb-4" />
              <h1 className="mb-2 text-4xl font-semibold text-gray-800">Đăng nhập</h1>
              <p className="text-sm text-gray-500">
                Nhập email và mật khẩu để truy cập hệ thống.
              </p>
            </div>

            <form onSubmit={onSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email<span className="text-rose-500">*</span>
                  </label>
                  <ControlledTextField
                    placeholder="Enter email"
                    name="email"
                    rounded="full"
                    autoComplete="new-email"
                    control={control}
                    className="w-full border border-gray-300 rounded-full px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password<span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <ControlledTextField
                      type={showPassword ? 'text' : 'password'}
                      placeholder="hello123"
                      name="password"
                      autoComplete="new-password"
                      rounded="full"
                      control={control}
                      className="w-full border border-gray-300 rounded-full px-4 py-2 pr-12" //
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-5.5"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 size-5" />
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ControlledCheckbox control={control} name="rememberMe" />
                    <span className="text-sm text-gray-700">Keep me signed in</span>
                  </div>
                  <Link
                    href={appRoutes.auth.underConstructionPlain}
                    className="text-sm text-blue-800 hover:text-blue-700"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-2 px-4 rounded-full transition-colors cursor-pointer flex items-center justify-center ${
                    isLoading
                      ? 'bg-purple-700 cursor-not-allowed opacity-80 text-white'
                      : 'bg-purple-900 hover:bg-purple-800 text-white'
                  }`}
                >
                  Đăng nhập
                </Button>
                {process.env.NODE_ENV !== 'production' && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDemoLogin}
                    className="w-full py-2 px-4 rounded-full cursor-pointer"
                  >
                    Tiếp tục với chế độ demo
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right side - HUIT inspired academic background */}
        <div className="huit-auth-hero hidden w-1/2 items-center justify-center p-16 lg:flex">
          <div className="relative z-10 max-w-[560px] text-white">
            <div className="mb-9 inline-flex items-center gap-3 rounded-full border border-white/25 bg-white/10 px-5 py-2 text-xs font-semibold tracking-[0.14em] backdrop-blur-sm">
              <span className="size-2 rounded-full bg-red-500" />
              TRƯỜNG ĐẠI HỌC CÔNG THƯƠNG TP.HCM
            </div>
            <Logo className="text-white" width={260} height={65} />
            <h2 className="mt-9 text-4xl font-bold leading-tight">
              Nền tảng hậu kiểm<br />và phân tích cuộc gọi
            </h2>
            <p className="mt-5 max-w-md text-base leading-7 text-blue-100">
              Ứng dụng công nghệ để nâng cao chất lượng đào tạo, vận hành và phục vụ cộng đồng.
            </p>
            <div className="mt-10 flex items-center gap-4 text-sm font-semibold">
              <span className="h-px w-12 bg-white/50" />
              Nhân văn · Đoàn kết · Đổi mới · Tiên phong
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
