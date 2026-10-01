// Trang Quản lý Tài khoản - dành riêng cho Admin
'use client'

import { Fragment, useState, useMemo } from 'react'
import { toast } from 'react-toastify'
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from '@/entities/users/users.api'
import { type UserAccount } from '@/entities/users/users.types'
import { Modal } from '@/shared/ui/modal/modal'
import Button from '@/shared/ui/button/button'
import Input from '@/shared/ui/input/input'
import Badge from '@/shared/ui/badge/badge'
import { LoaderContent } from '@/shared/ui/loader'
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/shared/ui/table/table'
import Pagination from '@/shared/ui/pagination/pagination'
import { PencilIcon, TrashRedIcon } from '@/../public/assets/icons'

// ---------- Create User Modal ----------
interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated: () => void
}

function CreateUserModal({ isOpen, onClose, onCreated }: CreateUserModalProps) {
  const [form, setForm] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'telesales' as 'admin' | 'telesales',
  })
  const [createUser, { isLoading }] = useCreateUserMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      toast.error('Vui lòng điền đầy đủ email và mật khẩu')
      return
    }
    try {
      await createUser(form).unwrap()
      toast.success('Đã tạo tài khoản thành công')
      setForm({ email: '', password: '', full_name: '', role: 'telesales' })
      onCreated()
      onClose()
    } catch (err: any) {
      const msg = err?.data?.detail || 'Tạo tài khoản thất bại'
      toast.error(msg)
    }
  }

  return (
    <Modal isOpen={isOpen} title="Tạo tài khoản mới" onClose={onClose} className="max-w-[540px] mx-auto">
      <form onSubmit={handleSubmit} className="px-8 pb-8 pt-4 flex flex-col gap-5">
        <Input
          label="Email *"
          id="create-email"
          type="email"
          placeholder="Nhập địa chỉ email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Input
          label="Mật khẩu *"
          id="create-password"
          type="password"
          placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <Input
          label="Họ và tên"
          id="create-fullname"
          placeholder="Nhập họ và tên"
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Vai trò
          </label>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as 'admin' | 'telesales' })}
            className="h-11 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
          >
            <option value="telesales">Nhân viên Telesales</option>
            <option value="admin">Quản trị viên (Admin)</option>
          </select>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            variant="purple"
            disabled={isLoading}
          >
            {isLoading ? 'Đang tạo...' : 'Tạo tài khoản'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// ---------- Edit User Modal ----------
interface EditUserModalProps {
  isOpen: boolean
  onClose: () => void
  user: UserAccount | null
}

function EditUserModal({ isOpen, onClose, user }: EditUserModalProps) {
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    role: (user?.role || 'telesales') as 'admin' | 'telesales',
    is_active: user?.is_active ?? true,
    new_password: '',
  })
  const [updateUser, { isLoading }] = useUpdateUserMutation()

  // Sync khi user thay đổi
  useMemo(() => {
    if (user) {
      setForm({
        full_name: user.full_name || '',
        role: user.role as 'admin' | 'telesales',
        is_active: user.is_active,
        new_password: '',
      })
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    try {
      const body: any = {
        full_name: form.full_name || undefined,
        role: form.role,
        is_active: form.is_active,
      }
      if (form.new_password.trim()) {
        body.password = form.new_password.trim()
      }
      await updateUser({ id: user.id, body }).unwrap()
      toast.success('Đã cập nhật tài khoản thành công')
      onClose()
    } catch (err: any) {
      const msg = err?.data?.detail || 'Cập nhật thất bại'
      toast.error(msg)
    }
  }

  return (
    <Modal isOpen={isOpen} title={`Chỉnh sửa tài khoản: ${user?.email || ''}`} onClose={onClose} className="max-w-[540px] mx-auto">
      <form onSubmit={handleSubmit} className="px-8 pb-8 pt-4 flex flex-col gap-5">
        <Input
          label="Họ và tên"
          id="edit-fullname"
          placeholder="Nhập họ và tên"
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Vai trò
          </label>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as 'admin' | 'telesales' })}
            className="h-11 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
          >
            <option value="telesales">Nhân viên Telesales</option>
            <option value="admin">Quản trị viên (Admin)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Trạng thái tài khoản
          </label>
          <button
            type="button"
            role="switch"
            aria-checked={form.is_active}
            onClick={() => setForm({ ...form, is_active: !form.is_active })}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none ${
              form.is_active ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
            }`}
          >
            <span
              className={`absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform ${
                form.is_active ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
          <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">
            {form.is_active ? 'Đang hoạt động' : 'Đã vô hiệu hóa'}
          </span>
        </div>
        <div>
          <Input
            label="Đặt mật khẩu mới (để trống nếu không đổi)"
            id="edit-password"
            type="password"
            placeholder="Nhập mật khẩu mới..."
            value={form.new_password}
            onChange={(e) => setForm({ ...form, new_password: e.target.value })}
          />
          <p className="mt-1 text-xs text-gray-400">Để trống nếu không muốn thay đổi mật khẩu.</p>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" variant="purple" disabled={isLoading}>
            {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// ---------- Delete Confirm Modal ----------
interface DeleteUserModalProps {
  isOpen: boolean
  onClose: () => void
  user: UserAccount | null
  onConfirm: () => void
  isLoading: boolean
}

function DeleteUserModal({ isOpen, onClose, user, onConfirm, isLoading }: DeleteUserModalProps) {
  return (
    <Modal isOpen={isOpen} title="Xác nhận xóa tài khoản" onClose={onClose} className="max-w-[440px] mx-auto">
      <div className="px-8 pb-8 pt-4">
        <p className="text-gray-600 dark:text-gray-400">
          Bạn có chắc muốn xóa tài khoản{' '}
          <span className="font-semibold text-gray-900 dark:text-white">{user?.email}</span>?
          Hành động này không thể hoàn tác.
        </p>
        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button
            type="button"
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full cursor-pointer transition"
            onClick={onConfirm}
          >
            {isLoading ? 'Đang xóa...' : 'Xóa tài khoản'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

// ---------- Main Users Management Component ----------
export function UsersManagement() {
  const { data: users = [], isLoading } = useGetUsersQuery()
  const [deleteUser, deleteResult] = useDeleteUserMutation()

  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'telesales'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editUser, setEditUser] = useState<UserAccount | null>(null)
  const [deleteUserItem, setDeleteUserItem] = useState<UserAccount | null>(null)

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.full_name || '').toLowerCase().includes(searchTerm.toLowerCase())
      const matchRole = roleFilter === 'all' || u.role === roleFilter
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && u.is_active) ||
        (statusFilter === 'inactive' && !u.is_active)
      return matchSearch && matchRole && matchStatus
    })
  }, [users, searchTerm, roleFilter, statusFilter])

  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const pageItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const totalActive = users.filter((u) => u.is_active).length
  const totalAdmin = users.filter((u) => u.role === 'admin').length

  const handleConfirmDelete = async () => {
    if (!deleteUserItem) return
    try {
      await deleteUser(deleteUserItem.id).unwrap()
      toast.success('Đã xóa tài khoản thành công')
      setDeleteUserItem(null)
    } catch (err: any) {
      const msg = err?.data?.detail || 'Xóa tài khoản thất bại'
      toast.error(msg)
    }
  }

  return (
    <Fragment>
      <CreateUserModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={() => {}}
      />
      <EditUserModal
        isOpen={!!editUser}
        onClose={() => setEditUser(null)}
        user={editUser}
      />
      <DeleteUserModal
        isOpen={!!deleteUserItem}
        onClose={() => setDeleteUserItem(null)}
        user={deleteUserItem}
        onConfirm={handleConfirmDelete}
        isLoading={deleteResult.isLoading}
      />

      {isLoading ? (
        <LoaderContent width={200} height={200} isLoading={isLoading} />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Quản lý Tài khoản
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Tạo, chỉnh sửa và quản lý tài khoản đăng nhập cho nhân viên.
              </p>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tổng tài khoản
              </span>
              <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
                {users.length}
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Đang hoạt động
              </span>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {totalActive}
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quản trị viên
              </span>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-400 mt-1">
                {totalAdmin}
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-100 dark:border-white/[0.05] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex flex-1 items-center gap-3 max-w-md">
                <input
                  type="text"
                  placeholder="Tìm theo email hoặc tên..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                />
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={roleFilter}
                  onChange={(e) => { setRoleFilter(e.target.value as any); setCurrentPage(1) }}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-purple-500 dark:border-white/10 dark:bg-gray-800 dark:text-gray-300"
                >
                  <option value="all">Tất cả vai trò</option>
                  <option value="admin">Admin</option>
                  <option value="telesales">Telesales</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value as any); setCurrentPage(1) }}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-purple-500 dark:border-white/10 dark:bg-gray-800 dark:text-gray-300"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="active">Đang hoạt động</option>
                  <option value="inactive">Đã vô hiệu hóa</option>
                </select>
                <Button
                  variant="purple"
                  className="whitespace-nowrap rounded-full px-4 py-2 text-sm"
                  onClick={() => setIsCreateOpen(true)}
                >
                  + Tạo tài khoản
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden">
              <div className="max-w-full overflow-x-auto">
                <Table className="w-full">
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell isHeader className="w-16 p-5 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        ID
                      </TableCell>
                      <TableCell isHeader className="p-5 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        Tài khoản
                      </TableCell>
                      <TableCell isHeader className="p-5 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        Vai trò
                      </TableCell>
                      <TableCell isHeader className="p-5 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        Trạng thái
                      </TableCell>
                      <TableCell isHeader className="p-5 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        Ngày tạo
                      </TableCell>
                      <TableCell isHeader className="w-32 p-5 font-normal text-gray-500 text-end text-theme-sm dark:text-gray-400">
                        Thao tác
                      </TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {pageItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center text-gray-500 dark:text-gray-400">
                          Không tìm thấy tài khoản nào.
                        </TableCell>
                      </TableRow>
                    ) : (
                      pageItems.map((user) => {
                        const initials = (user.full_name || user.email).charAt(0).toUpperCase()
                        const createdDate = user.created_at
                          ? new Date(user.created_at).toLocaleDateString('vi-VN')
                          : '—'
                        return (
                          <TableRow
                            key={user.id}
                            className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition"
                          >
                            <TableCell className="h-16 pl-5 pr-3 w-16">
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                #{user.id}
                              </span>
                            </TableCell>
                            <TableCell className="h-16 px-3">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-700 to-blue-600 text-white text-sm font-semibold shrink-0">
                                  {initials}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-800 dark:text-white">
                                    {user.full_name || <span className="text-gray-400 italic">Chưa đặt tên</span>}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="h-16 px-3">
                              <Badge
                                color={user.role === 'admin' ? 'warning' : 'info'}
                                variant="light"
                              >
                                {user.role === 'admin' ? 'Admin' : 'Telesales'}
                              </Badge>
                            </TableCell>
                            <TableCell className="h-16 px-3">
                              <Badge color={user.is_active ? 'success' : 'error'} variant="light">
                                {user.is_active ? 'Hoạt động' : 'Vô hiệu hóa'}
                              </Badge>
                            </TableCell>
                            <TableCell className="h-16 px-3">
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {createdDate}
                              </span>
                            </TableCell>
                            <TableCell className="h-16 pr-5 pl-3 w-32">
                              <div className="flex items-center gap-2 justify-end">
                                <button
                                  type="button"
                                  title="Chỉnh sửa / đổi mật khẩu"
                                  className="cursor-pointer rounded-full p-2 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-950/70 dark:hover:text-blue-300 transition"
                                  onClick={() => setEditUser(user)}
                                >
                                  <PencilIcon width={14} height={14} />
                                </button>
                                <button
                                  type="button"
                                  title="Xóa tài khoản"
                                  className="cursor-pointer rounded-full p-2 border border-red-200 dark:border-red-800 bg-red-50/70 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/70 text-red-600 dark:text-red-400 transition"
                                  onClick={() => setDeleteUserItem(user)}
                                >
                                  <TrashRedIcon width={14} height={14} />
                                </button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="border-t border-gray-100 py-4 pl-[18px] pr-4 dark:border-white/[0.05]">
                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-end">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Fragment>
  )
}
