// Ghi chú nhóm: Việt hóa và cải thiện hiển thị cho màn hình quản lý dữ liệu.
import { Modal } from '@/shared/ui/modal/modal';
import Button from '@/shared/ui/button/button';
import { type Operator } from '@/entities/operators/operators.types';
import { z } from 'zod';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '@/shared/ui/input/input';
import { useGetOperatorQuery } from '@/entities/operators/operators.api';
import Label from '@/shared/ui/label/label';
import { Switcher } from '@/shared/ui/switcher';
import { useEffect } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Operator>) => void;
  operatorId: number;
}

const editOperatorSchema = z.object({
  name: z.string().min(2, {
    message: 'Tên nhân viên phải có ít nhất 2 ký tự.',
  }),
  isActive: z.boolean(),
});

export const EditOperatorModal = ({
  isOpen,
  onClose,
  onSave,
  operatorId,
}: Props) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { isValid, errors },
  } = useForm<z.infer<typeof editOperatorSchema>>({
    resolver: zodResolver(editOperatorSchema),
    defaultValues: {
      name: '',
      isActive: true,
    },
  });

  const handleSubmitForm: SubmitHandler<z.infer<typeof editOperatorSchema>> = (
    data
  ) => {
    onSave(data);
    onClose();
  };

  const { data: operator, isSuccess } = useGetOperatorQuery(operatorId);

  useEffect(() => {
    if (isSuccess && operator) {
      reset({
        name: operator.name ?? '',
        isActive: operator.isActive ?? true,
      });
    }
  }, [operator, isSuccess, reset]);

  return (
    <Modal
      isOpen={isOpen}
      title={'Chỉnh sửa nhân viên'}
      onClose={onClose}
      className="max-w-[700px] mx-auto"
    >
      <form
        className="px-10 flex flex-col gap-6 pb-10 pt-4"
        onSubmit={handleSubmit(handleSubmitForm)}
      >
        <Input
          {...register('name')}
          id="operator-name"
          label="Tên nhân viên"
          placeholder="Nhập tên nhân viên"
          error={errors.name?.message}
        />
        <Controller
          control={control}
          name="isActive"
          render={({ field: { onChange, value } }) => (
            <div className="flex items-center gap-3">
              <Switcher
                enabled={value}
                setEnabled={() => {
                  onChange(!value);
                }}
              />
              <Label>Trạng thái hoạt động</Label>
            </div>
          )}
        />

        <div className="flex justify-between">
          <Button
            type="button"
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 bg-white border border-gray-200 cursor-pointer rounded-full dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
            onClick={onClose}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            className={`px-4 py-2 bg-purple-900 cursor-pointer hover:bg-purple-800 text-white rounded-full`}
            disabled={!isValid}
          >
            Lưu changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
