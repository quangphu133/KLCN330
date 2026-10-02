// Ghi chú nhóm: Việt hóa và cải thiện hiển thị cho màn hình quản lý dữ liệu.
import { Modal } from '@/shared/ui/modal/modal';
import Button from '@/shared/ui/button/button';
import { type Project } from '@/entities/projects/projects.types';
import { z } from 'zod';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '@/shared/ui/input/input';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: Partial<Project>) => void;
}

const createProjectSchema = z.object({
  name: z.string().min(2, {
    message: 'Tên dự án phải có ít nhất 2 ký tự.',
  }),
});

export const CreateProjectModal = ({ isOpen, onClose, onCreate }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { isValid, errors },
  } = useForm<z.infer<typeof createProjectSchema>>({
    resolver: zodResolver(createProjectSchema),
  });

  const onSubmit: SubmitHandler<z.infer<typeof createProjectSchema>> = (
    data
  ) => {
    onCreate(data);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      title={'Tạo dự án'}
      onClose={onClose}
      className="max-w-[700px] mx-auto"
    >
      <form
        className="px-10 flex flex-col gap-6 pb-10 pt-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <Input
          {...register('name')}
          id="project-name"
          label="Tên dự án"
          placeholder="Nhập tên dự án"
          error={errors.name?.message}
        />
        <div className="flex justify-between">
          <Button
            className="px-2 py-2 text-gray-700 hover:bg-gray-100 bg-white border border-gray-200 cursor-pointer rounded-full dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
            onClick={onClose}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            className={`px-2 py-2 bg-purple-900 cursor-pointer hover:bg-purple-800 text-white rounded-full`}
            disabled={!isValid}
          >
            Tạo dự án
          </Button>
        </div>
      </form>
    </Modal>
  );
};
