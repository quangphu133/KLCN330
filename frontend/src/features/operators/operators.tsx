'use client'

import { useGetEmployeesQuery } from '@/entities/users/users.api'
import { EmployeeAccount } from '@/entities/users/users.types'
import { AlertIcon, CheckCircleIcon, UserIcon } from '@/../public/assets/icons'
import { OperatorsTable } from '@/features/operators/components/operators-table'
import { getFromLocalStorage } from '@/shared/utils/common-utils'

export const Operators = () => {
  const isDemo = getFromLocalStorage('accessToken', null) === 'local-demo-token'
  const { data, error, isLoading, isFetching, refetch } = useGetEmployeesQuery(undefined, {
    skip: isDemo,
    pollingInterval: 10000,
    skipPollingIfUnfocused: true,
  })

  if (isDemo) {
    return <p className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-800">Chế độ demo không thể quản lý tài khoản nhân viên thật.</p>
  }

  const employees = data ?? []
  const activeCount = employees.filter((employee: EmployeeAccount) => employee.is_active).length
  const inactiveCount = employees.length - activeCount

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">Quản lý nhân viên tổng đài</h2>
      {error ? (
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-800">
          Không thể tải danh sách nhân viên. Vui lòng kiểm tra đăng nhập/kết nối rồi thử lại.
          <button className="ml-3 underline" onClick={() => refetch()}>Tải lại</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { label: 'Tổng số nhân viên', value: employees.length, icon: <UserIcon width={22} height={22} /> },
              { label: 'Đang hoạt động', value: activeCount, icon: <CheckCircleIcon width={22} height={22} /> },
              { label: 'Ngừng hoạt động', value: inactiveCount, icon: <AlertIcon width={22} height={22} /> },
            ].map(card => (
              <div key={card.label} className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                <div><span className="text-xs font-medium uppercase tracking-wider text-gray-500">{card.label}</span><h4 className="mt-1 text-2xl font-bold text-gray-800 dark:text-white">{card.value}</h4></div>
                {card.icon}
              </div>
            ))}
          </div>
          <OperatorsTable data={employees} isLoading={isLoading || isFetching} />
        </>
      )}
    </div>
  )
}
