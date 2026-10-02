'use client'

import { useMemo, useState } from 'react'
import { EmployeeAccount, CreateEmployeeRequest, UpdateEmployeeRequest } from '@/entities/users/users.types'
import { useCreateEmployeeMutation, useUpdateEmployeeMutation } from '@/entities/users/users.api'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/shared/ui/table/table'
import Pagination from '@/shared/ui/pagination/pagination'
import Button from '@/shared/ui/button/button'
import Badge from '@/shared/ui/badge/badge'
import Input from '@/shared/ui/input/input'
import { PencilIcon, FilterIcon } from '@/../public/assets/icons'
import { CreateOperatorModal } from './CreateOperatorModal'
import { EditOperatorModal } from './EditOperatorModal'
import { toast } from 'react-toastify'

interface Props {
  data: EmployeeAccount[]
  isLoading: boolean
}

function getErrorMessage(error: unknown) {
  const value = error as { data?: { detail?: string }; error?: string }
  return value?.data?.detail ?? value?.error ?? 'Không thể lưu thay đổi. Vui lòng thử lại.'
}

export const OperatorsTable = ({ data, isLoading }: Props) => {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<EmployeeAccount | null>(null)
  const [createEmployee, createState] = useCreateEmployeeMutation()
  const [updateEmployee, updateState] = useUpdateEmployeeMutation()
  const pageSize = 10

  const filtered = useMemo(() => data.filter(employee => {
    const text = `${employee.full_name ?? ''} ${employee.email}`.toLocaleLowerCase()
    const matchesSearch = text.includes(search.toLocaleLowerCase())
    const matchesStatus = status === 'all' || (status === 'active' ? employee.is_active : !employee.is_active)
    return matchesSearch && matchesStatus
  }), [data, search, status])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const currentRows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const create = async (body: CreateEmployeeRequest) => {
    try {
      await createEmployee(body).unwrap()
      toast.success('Đã tạo tài khoản nhân viên')
      return true
    } catch (error) {
      toast.error(getErrorMessage(error))
      return false
    }
  }

  const update = async (employee: EmployeeAccount, body: UpdateEmployeeRequest) => {
    try {
      await updateEmployee({ id: employee.id, body }).unwrap()
      toast.success(body.is_active === false ? 'Đã ngừng hoạt động tài khoản' : body.is_active === true ? 'Đã kích hoạt tài khoản' : 'Đã cập nhật nhân viên')
      setEditing(null)
      return true
    } catch (error) {
      toast.error(getErrorMessage(error))
      return false
    }
  }

  const toggleStatus = async (employee: EmployeeAccount) => {
    try {
      await updateEmployee({ id: employee.id, body: { is_active: !employee.is_active } }).unwrap()
      toast.success(employee.is_active ? 'Đã ngừng hoạt động tài khoản' : 'Đã kích hoạt tài khoản')
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <>
      <CreateOperatorModal isOpen={creating} onClose={() => setCreating(false)} onCreate={create} />
      {editing && <EditOperatorModal employee={editing} isOpen onClose={() => setEditing(null)} onSave={body => update(editing, body)} />}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-4 md:flex-row md:items-center md:justify-between dark:border-white/[0.05]">
          <Input placeholder="Tìm theo tên hoặc email..." value={search} onChange={event => { setSearch(event.target.value); setPage(1) }} className="w-full md:max-w-md" />
          <div className="flex items-center gap-3">
            <FilterIcon width={16} height={16} className="text-gray-400" />
            <select value={status} onChange={event => { setStatus(event.target.value as typeof status); setPage(1) }} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-gray-800">
              <option value="all">Tất cả trạng thái</option><option value="active">Đang hoạt động</option><option value="inactive">Ngừng hoạt động</option>
            </select>
            <Button variant="purple" disabled={createState.isLoading} className="whitespace-nowrap rounded-full px-4 py-2 text-sm" onClick={() => setCreating(true)}>Tạo nhân viên</Button>
          </div>
        </div>
        <div className="max-w-full overflow-x-auto">
          <Table className="w-full">
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]"><TableRow>
              <TableCell isHeader className="p-5 text-start font-normal text-gray-500">Mã tài khoản</TableCell>
              <TableCell isHeader className="p-5 text-start font-normal text-gray-500">Họ và tên</TableCell>
              <TableCell isHeader className="p-5 text-start font-normal text-gray-500">Email</TableCell>
              <TableCell isHeader className="p-5 text-start font-normal text-gray-500">Trạng thái</TableCell>
              <TableCell isHeader className="p-5 text-end font-normal text-gray-500">Thao tác</TableCell>
            </TableRow></TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {isLoading && data.length === 0 ? <TableRow><TableCell colSpan={5} className="h-24 text-center">Đang tải danh sách...</TableCell></TableRow> : currentRows.length === 0 ? <TableRow><TableCell colSpan={5} className="h-24 text-center text-gray-500">Không tìm thấy nhân viên nào.</TableCell></TableRow> : currentRows.map(employee => (
                <TableRow key={employee.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                  <TableCell className="h-16 px-5">{employee.id}</TableCell>
                  <TableCell className="h-16 px-5 font-medium">{employee.full_name || 'Chưa cập nhật'}</TableCell>
                  <TableCell className="h-16 px-5">{employee.email}</TableCell>
                  <TableCell className="h-16 px-5"><Badge color={employee.is_active ? 'success' : 'error'} variant="light">{employee.is_active ? 'Đang hoạt động' : 'Ngừng hoạt động'}</Badge></TableCell>
                  <TableCell className="h-16 px-5 text-end">
                    <div className="flex justify-end gap-2">
                      <button type="button" title="Chỉnh sửa họ tên" disabled={updateState.isLoading} className="rounded-full border border-gray-200 bg-gray-50 p-2 text-gray-700 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200" onClick={() => setEditing(employee)}><PencilIcon width={14} height={14} /></button>
                      <button type="button" disabled={updateState.isLoading} className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-700 disabled:opacity-50 dark:border-gray-600 dark:text-gray-200" onClick={() => toggleStatus(employee)}>{employee.is_active ? 'Ngừng hoạt động' : 'Kích hoạt lại'}</button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {pageCount > 1 && <div className="border-t border-gray-100 px-4 py-4 dark:border-white/[0.05]"><div className="flex justify-end"><Pagination currentPage={currentPage} totalPages={pageCount} onPageChange={setPage} /></div></div>}
      </div>
    </>
  )
}
