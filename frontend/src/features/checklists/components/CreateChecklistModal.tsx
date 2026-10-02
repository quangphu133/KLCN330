// Ghi chú nhóm: Việt hóa và cải thiện hiển thị cho màn hình quản lý dữ liệu.
import { Modal } from '@/shared/ui/modal/modal';
import Button from '@/shared/ui/button/button';
import { type Checklist } from '@/entities/checklists/checklists.types';
import { z } from 'zod';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '@/shared/ui/input/input';
import { MultiSelect } from '@/shared/ui/multiselect/multiselect';
import { useGetProjectsQuery } from '@/entities/projects/projects.api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: Pick<Checklist, 'name' | 'projectIds'>) => void;
}

const createChecklistSchema = z.object({
  name: z.string().min(2, {
    message: 'Tên bộ tiêu chí phải có ít nhất 2 ký tự.',
  }),
  projectIds: z.array(z.number()),
});

export const CreateChecklistModal = ({ isOpen, onClose, onCreate }: Props) => {
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { isValid, errors },
  } = useForm<z.infer<typeof createChecklistSchema>>({
    resolver: zodResolver(createChecklistSchema),
    defaultValues: {
      projectIds: [],
    },
  });

  const handleSubmitForm: SubmitHandler<z.infer<typeof createChecklistSchema>> = (
    data
  ) => {
    onCreate(data);
    onClose();
  };

  const { data: projectsData, isLoading } = useGetProjectsQuery();

  const projectIds = watch('projectIds');

  return (
    <Modal
      isOpen={isOpen}
      title={'Tạo danh sách kiểm tra'}
      onClose={onClose}
      className="max-w-[700px] mx-auto"
    >
      <form
        className="px-10 flex flex-col gap-6 pb-10 pt-4"
        onSubmit={handleSubmit(handleSubmitForm)}
      >
        <Input
          {...register('name')}
          id="checklist-name"
          label="Tên danh sách kiểm tra"
          placeholder="Nhập tên danh sách kiểm tra"
          error={errors.name?.message}
        />
        {projectsData && projectIds && (
          <Controller
            control={control}
            render={({ field: { onChange, value } }) => (
              <MultiSelect
                label="Dự án"
                selectedOptions={projectsData
                  .filter((proj) => value && value.includes(proj.id))
                  .map((opt) => ({
                    label: opt.name,
                    value: opt.id.toString(),
                  }))}
                options={projectsData.map((opt) => ({
                  label: opt.name,
                  value: opt.id.toString(),
                }))}
                setOptions={(newOptions) => {
                  const optionsIds = newOptions.map((opt) =>
                    parseInt(opt.value)
                  );
                  onChange(optionsIds);
                }}
              />
            )}
            name={'projectIds'}
          />
        )}
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
            Tạo danh sách kiểm tra
          </Button>
        </div>
      </form>
    </Modal>
  );
};
