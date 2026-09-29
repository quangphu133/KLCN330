// Ghi chú nhóm: Việt hóa và cải thiện hiển thị cho màn hình quản lý dữ liệu.
'use client'

import { OperatorsTable } from '@/features/operators/components/operators-table'
import { useGetOperatorsQuery } from '@/entities/operators/operators.api'
import { LoaderContent } from '@/shared/ui/loader'
import { UserIcon, CheckCircleIcon, AlertIcon } from '@/../public/assets/icons'

export const Operators = () => {
  const { data: operatorsData, isLoading } = useGetOperatorsQuery()

  const columns = [
    { key: 'id', id: 1, title: 'Mã' },
    { key: 'name', id: 2, title: 'Tên nhân viên' },
    { key: 'isActive', id: 3, title: 'Trạng thái' },
  ]

  const totalOperators = operatorsData?.length || 0
  const activeOperators = operatorsData?.filter((o) => o.isActive !== false).length || 0
  const inactiveOperators = totalOperators - activeOperators

  return (
    <>
      {isLoading ? (
        <LoaderContent width={200} height={200} isLoading={isLoading} />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              Quản lý nhân viên tổng đài
            </h2>
          </div>

          {/* Admin Stat Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng số nhân viên
                  </span>
                  <h4 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
                    {totalOperators}
                  </h4>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-900 dark:bg-purple-900/20 dark:text-purple-400">
                  <UserIcon width={22} height={22} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Đang hoạt động
                  </span>
                  <h4 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    {activeOperators}
                  </h4>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
                  <CheckCircleIcon width={22} height={22} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngừng hoạt động
                  </span>
                  <h4 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                    {inactiveOperators}
                  </h4>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400">
                  <AlertIcon width={22} height={22} />
                </div>
              </div>
            </div>
          </div>

          {operatorsData && (
            <OperatorsTable data={operatorsData} columns={columns} itemsPerPage={10} />
          )}
        </div>
      )}
    </>
  )
}
