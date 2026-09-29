'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useGetProfileQuery } from '@/entities/auth/auth.api'
import { appRoutes } from '@/shared/constants/routes'
import { useTheme } from '@/shared/context/theme-context/theme-context'
import Button from '@/shared/ui/button/button'

type Settings = {
  notifyProcessed: boolean
  notifyErrors: boolean
  notifyReports: boolean
  homePage: string
}

const defaultSettings: Settings = {
  notifyProcessed: true,
  notifyErrors: true,
  notifyReports: false,
  homePage: appRoutes.private.dashboard,
}

function SettingSwitch({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description: string
}) {
  return (
    <div className="flex items-start justify-between gap-6 py-5 first:pt-0 last:pb-0">
      <div>
        <p className="font-semibold text-gray-800 dark:text-white">{label}</p>
        <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative mt-1 h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20 ${
          checked ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}

function SectionIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
      {children}
    </span>
  )
}

export function AccountSettings() {
  const { data: profile } = useGetProfileQuery()
  const { setTheme } = useTheme()
  const [settings, setSettings] = useState(defaultSettings)
  const [draftTheme, setDraftTheme] = useState<'light' | 'dark'>('light')
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('accountSettings')
      const homePage = localStorage.getItem('accountHomePage')
      const storedTheme = localStorage.getItem('theme')
      setDraftTheme(storedTheme === 'dark' ? 'dark' : 'light')
      const parsed = stored ? (JSON.parse(stored) as Partial<Settings>) : {}
      setSettings({
        ...defaultSettings,
        ...parsed,
        homePage: homePage || parsed.homePage || defaultSettings.homePage,
      })
    } catch {
      setSettings(defaultSettings)
    } finally {
      setIsReady(true)
    }
  }, [])

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(current => ({ ...current, [key]: value }))
  }

  const saveSettings = () => {
    localStorage.setItem('accountSettings', JSON.stringify(settings))
    localStorage.setItem('accountHomePage', settings.homePage)
    setTheme(draftTheme)
    toast.success('Đã lưu cài đặt tài khoản')
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
    setDraftTheme('light')
    toast.info('Đã khôi phục mặc định cho bản nháp. Nhấn “Lưu cài đặt” để áp dụng.')
  }

  return (
    <div className="mx-auto w-full max-w-6xl pb-10">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">
          Tài khoản HUIT
        </p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
          Cài đặt tài khoản
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Điều chỉnh thông báo, giao diện và cách bạn bắt đầu phiên làm việc.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-blue-100 bg-white p-6 shadow-[0_18px_50px_rgba(0,79,135,0.08)] dark:border-gray-800 dark:bg-gray-900 md:p-8">
            <div className="mb-6 flex items-center gap-4">
              <SectionIcon>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                  <path d="M10 21h4" />
                </svg>
              </SectionIcon>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Thông báo</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Chọn các hoạt động bạn muốn nhận thông báo trong hệ thống.
                </p>
              </div>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              <SettingSwitch
                checked={settings.notifyProcessed}
                onChange={value => updateSetting('notifyProcessed', value)}
                label="Ghi âm đã xử lý xong"
                description="Thông báo khi tệp ghi âm hoàn tất nhận diện và phân tích."
              />
              <SettingSwitch
                checked={settings.notifyErrors}
                onChange={value => updateSetting('notifyErrors', value)}
                label="Lỗi xử lý dữ liệu"
                description="Nhận cảnh báo khi tệp tải lên hoặc quá trình phân tích gặp lỗi."
              />
              <SettingSwitch
                checked={settings.notifyReports}
                onChange={value => updateSetting('notifyReports', value)}
                label="Báo cáo tổng hợp"
                description="Hiển thị nhắc nhở về các báo cáo và số liệu mới."
              />
            </div>
          </section>

          <section className="rounded-3xl border border-blue-100 bg-white p-6 shadow-[0_18px_50px_rgba(0,79,135,0.08)] dark:border-gray-800 dark:bg-gray-900 md:p-8">
            <div className="mb-6 flex items-center gap-4">
              <SectionIcon>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
                </svg>
              </SectionIcon>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Giao diện</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Tùy chỉnh chế độ hiển thị phù hợp với môi trường làm việc.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {(['light', 'dark'] as const).map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setDraftTheme(option)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    draftTheme === option
                      ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600/10 dark:bg-blue-950/40'
                      : 'border-gray-200 hover:border-blue-300 dark:border-gray-700'
                  }`}
                >
                  <div className={`mb-3 h-20 rounded-xl border p-3 ${option === 'light' ? 'bg-gray-50' : 'border-gray-700 bg-gray-950'}`}>
                    <div className={`h-3 w-2/3 rounded ${option === 'light' ? 'bg-blue-600' : 'bg-blue-400'}`} />
                    <div className={`mt-3 h-2 w-full rounded ${option === 'light' ? 'bg-gray-200' : 'bg-gray-700'}`} />
                    <div className={`mt-2 h-2 w-4/5 rounded ${option === 'light' ? 'bg-gray-200' : 'bg-gray-700'}`} />
                  </div>
                  <p className="font-semibold text-gray-800 dark:text-white">
                    {option === 'light' ? 'Chế độ sáng' : 'Chế độ tối'}
                  </p>
                </button>
              ))}
            </div>

            <label className="mt-6 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Trang mở sau khi đăng nhập
              <select
                value={settings.homePage}
                onChange={event => updateSetting('homePage', event.target.value)}
                className="mt-2 h-11 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
              >
                <option value={appRoutes.private.dashboard}>Phân tích &amp; Báo cáo</option>
                <option value={appRoutes.private.calls}>Danh sách Cuộc gọi</option>
                <option value={appRoutes.private.uploadingRecord}>Tải lên Ghi âm</option>
              </select>
            </label>
          </section>

          <div className="flex flex-wrap justify-end gap-3">
            <Button type="button" variant="outline" onClick={resetSettings}>
              Khôi phục mặc định
            </Button>
            <Button type="button" variant="purple" onClick={saveSettings} disabled={!isReady}>
              Lưu cài đặt
            </Button>
          </div>
        </div>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-blue-100 bg-white p-6 shadow-[0_18px_50px_rgba(0,79,135,0.08)] dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-600 text-lg font-bold text-white">
                {(profile?.full_name || profile?.email || 'H').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate font-bold text-gray-900 dark:text-white">
                  {profile?.full_name || 'Tài khoản HUIT'}
                </p>
                <p className="truncate text-sm text-gray-500 dark:text-gray-400">{profile?.email || 'Đang tải...'}</p>
              </div>
            </div>
            <div className="mt-5 border-t border-gray-100 pt-5 dark:border-gray-800">
              <Link
                href={appRoutes.private.profile}
                className="flex items-center justify-between rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300"
              >
                Hồ sơ và mật khẩu
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </section>

          <section className="rounded-3xl border border-blue-100 bg-white p-6 shadow-[0_18px_50px_rgba(0,79,135,0.08)] dark:border-gray-800 dark:bg-gray-900">
            <h2 className="font-bold text-gray-900 dark:text-white">Phiên đăng nhập</h2>
            <div className="mt-4 rounded-2xl bg-green-50 p-4 dark:bg-green-950/30">
              <div className="flex items-center gap-2 text-sm font-semibold text-green-700 dark:text-green-400">
                <span className="size-2 rounded-full bg-green-500" />
                Đang hoạt động
              </div>
              <p className="mt-2 text-xs leading-5 text-gray-500 dark:text-gray-400">
                Phiên hiện tại trên trình duyệt này được bảo vệ bằng mã xác thực.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
