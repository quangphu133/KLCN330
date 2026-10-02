import { useEffect } from 'react'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { EmployeeAccount, UpdateEmployeeRequest } from '@/entities/users/users.types'
import { Modal } from '@/shared/ui/modal/modal'
import Button from '@/shared/ui/button/button'
import Input from '@/shared/ui/input/input'
import Label from '@/shared/ui/label/label'
import { Switcher } from '@/shared/ui/switcher'

interface Props {
  employee: EmployeeAccount
  isOpen: boolean
  onClose: () => void
  onSave: (data: UpdateEmployeeRequest) => Promise<boolean>
}

const schema = z.object({
  full_name: z.string().trim().min(2, 'Họ tên phải có ít nhất 2 ký tự.'),
  is_active: z.boolean(),
})
type FormValues = z.infer<typeof schema>

export const EditOperatorModal = ({ employee, isOpen, onClose, onSave }: Props) => {
  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { full_name: employee.full_name ?? '', is_active: employee.is_active },
  })

  useEffect(() => {
    reset({ full_name: employee.full_name ?? '', is_active: employee.is_active })
  }, [employee, reset])

  const submit: SubmitHandler<FormValues> = async data => {
    const saved = await onSave(data)
    if (!saved) return
    onClose()
  }

  return (
    <Modal isOpen={isOpen} title="Chỉnh sửa nhân viên" onClose={onClose} className="mx-auto max-w-[700px]">
      <form className="flex flex-col gap-5 px-10 pb-10 pt-4" onSubmit={handleSubmit(submit)}>
        <p className="text-sm text-gray-600">Email đăng nhập: <span className="font-medium">{employee.email}</span></p>
        <Input {...register('full_name')} id="employee-edit-name" label="Họ và tên" placeholder="Nhập họ tên" error={errors.full_name?.message} />
        <Controller control={control} name="is_active" render={({ field }) => (
          <div className="flex items-center gap-3"><Switcher enabled={Boolean(field.value)} setEnabled={() => field.onChange(!field.value)} /><Label>Đang hoạt động</Label></div>
        )} />
        <div className="flex justify-between">
          <Button type="button" onClick={onClose}>Hủy</Button>
          <Button type="submit" disabled={isSubmitting} className="rounded-full bg-purple-900 px-4 py-2 text-white">{isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}</Button>
        </div>
      </form>
    </Modal>
  )
}
