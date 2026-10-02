import { Modal } from '@/shared/ui/modal/modal'
import Button from '@/shared/ui/button/button'
import Input from '@/shared/ui/input/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { SubmitHandler, useForm } from 'react-hook-form'
import { z } from 'zod'
import { CreateEmployeeRequest } from '@/entities/users/users.types'

interface Props {
  isOpen: boolean
  onClose: () => void
  onCreate: (data: CreateEmployeeRequest) => Promise<boolean>
}

const schema = z.object({
  full_name: z.string().trim().min(2, 'Họ tên phải có ít nhất 2 ký tự.'),
  email: z.string().trim().email('Email không hợp lệ.'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự.'),
})

export const CreateOperatorModal = ({ isOpen, onClose, onCreate }: Props) => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreateEmployeeRequest>({
    resolver: zodResolver(schema),
    defaultValues: { full_name: '', email: '', password: '' },
  })

  const submit: SubmitHandler<CreateEmployeeRequest> = async data => {
    const created = await onCreate(data)
    if (!created) return
    reset()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} title="Tạo tài khoản nhân viên" onClose={onClose} className="mx-auto max-w-[700px]">
      <form className="flex flex-col gap-5 px-10 pb-10 pt-4" onSubmit={handleSubmit(submit)}>
        <Input {...register('full_name')} id="employee-full-name" label="Họ và tên" placeholder="Nhập họ tên" error={errors.full_name?.message} />
        <Input {...register('email')} id="employee-email" type="email" label="Email đăng nhập" placeholder="name@example.com" error={errors.email?.message} />
        <Input {...register('password')} id="employee-password" type="password" label="Mật khẩu" placeholder="Nhập mật khẩu" error={errors.password?.message} />
        <p className="text-sm text-gray-500">Tài khoản mới được tạo với vai trò nhân viên tổng đài.</p>
        <div className="flex justify-between">
          <Button type="button" onClick={onClose}>Hủy</Button>
          <Button type="submit" disabled={isSubmitting} className="rounded-full bg-purple-900 px-4 py-2 text-white">{isSubmitting ? 'Đang tạo...' : 'Tạo nhân viên'}</Button>
        </div>
      </form>
    </Modal>
  )
}
