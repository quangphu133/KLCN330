import '@/app/globals.css'
import Providers from '@/app/providers'
import { AuthGate } from '../widgets/AuthGate'
import localFont from 'next/font/local'
import NavigationLoader from '@/shared/ui/loader/navigation-loader-state/navigation-loader-state'
import { Suspense } from 'react'

const arimo = localFont({
  src: [
    { path: '../fonts/arimo-latin-variable.woff2', style: 'normal' },
    { path: '../fonts/arimo-latin-italic-variable.woff2', style: 'italic' },
  ],
  variable: '--font-arimo',
})

export const metadata = {
  title: 'HUIT | Hậu kiểm cuộc gọi',
  description: 'Hệ thống hậu kiểm và phân tích cuộc gọi',
  icons: {
    icon: '/favicon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className={arimo.variable}>
        <Providers>
          <Suspense
            fallback={
              <div className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800"></div>
            }
          >
            <NavigationLoader />
          </Suspense>
          <AuthGate>{children}</AuthGate>
        </Providers>
      </body>
    </html>
  )
}
