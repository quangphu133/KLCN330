import { Suspense } from 'react'
import { CallsFeatureWrapper } from '@/features/calls/calls-feature-wrapper/calls-feature-wrapper'
import { CallsTable } from '@/entities/mediafile/ui/calls-table/calls-table'
import { MainLayout } from '@/widgets/main-layout/main-layout'

export const metadata = {
  title: 'Cuộc gọi',
}

export default function CallsPage() {
  return (
    <MainLayout>
      <Suspense
        fallback={
          <div className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800"></div>
        }
      >
        <CallsFeatureWrapper>
          <CallsTable />
        </CallsFeatureWrapper>
      </Suspense>
    </MainLayout>
  )
}
