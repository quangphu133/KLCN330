import { Modal } from '@/shared/ui/modal/modal';
import Button from '@/shared/ui/button/button';
import { type Operator } from '@/entities/operators/operators.types';
import { z } from 'zod';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '@/shared/ui/input/input';
import { Switcher } from '@/shared/ui/switcher';
import Label from '@/shared/ui/label/label';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: Partial<Operator>) => void;
}

const createOperatorSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  isActive: z.boolean(),
});

export const CreateOperatorModal = ({ isOpen, onClose, onCreate }: Props) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { isValid, errors },
  } = useForm<z.infer<typeof createOperatorSchema>>({
    resolver: zodResolver(createOperatorSchema),
    defaultValues: {
      name: '',
      isActive: true,
    },
  });

  const handleSubmitForm: SubmitHandler<z.infer<typeof createOperatorSchema>> = (
    data
  ) => {
    onCreate(data);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      title={'Tạo điều hành viên'}
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
          label="Điều hành viên name"
          placeholder="Nhập tên điều hành viên"
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
              <Label>Đang hoạt động Status</Label>
            </div>
          )}
        />
        <div className="flex justify-between">
          <Button
            type="button"
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 bg-white border border-gray-200 cursor-pointer rounded-full"
            onClick={onClose}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            className={`px-4 py-2 bg-purple-900 cursor-pointer hover:bg-purple-800 text-white rounded-full`}
            disabled={!isValid}
          >
            Tạo điều hành viên
          </Button>
        </div>
      </form>
    </Modal>
  );
};
