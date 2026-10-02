// Ghi chú nhóm: Việt hóa và cải thiện hiển thị cho màn hình quản lý dữ liệu.
import { Modal } from '@/shared/ui/modal/modal';
import Button from '@/shared/ui/button/button';
import {
  ChecklistFull,
  type Checklist,
} from '@/entities/checklists/checklists.types';
import { z } from 'zod';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '@/shared/ui/input/input';
import { MultiSelect } from '@/shared/ui/multiselect/multiselect';
import { useGetProjectsQuery } from '@/entities/projects/projects.api';
import { useEffect } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Pick<Checklist, 'name' | 'projectIds'>) => void;
  checklistData?: ChecklistFull | null;
}

const editChecklistSchema = z.object({
  name: z.string().min(2, {
    message: 'Tên bộ tiêu chí phải có ít nhất 2 ký tự.',
  }),
  projectIds: z.array(z.number()),
});

export const EditChecklistModal = ({
  isOpen,
  onClose,
  onSave,
  checklistData,
}: Props) => {
  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    formState: { isValid, errors },
  } = useForm<z.infer<typeof editChecklistSchema>>({
    resolver: zodResolver(editChecklistSchema),
    defaultValues: {
      projectIds: [],
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof editChecklistSchema>> = (
    data
  ) => {
    onSave(data);
    onClose();
  };

  const { data: projectsData, isLoading } = useGetProjectsQuery();

  const projectIds = watch('projectIds');

  useEffect(() => {
    if (checklistData) {
      reset({
        name: checklistData.name ?? '',
        projectIds:
          checklistData.checklistProjects
            ?.map((pr) => pr.projectId)
            .filter((id) => id !== null) ?? [],
      });
    }
  }, [checklistData, reset]);

  return (
    <Modal
      isOpen={isOpen}
      title={'Chỉnh sửa danh sách kiểm tra'}
      onClose={onClose}
      className="max-w-[700px] mx-auto"
    >
      <form
        className="px-10 flex flex-col gap-6 pb-10 pt-4"
        onSubmit={handleSubmit(onSubmit)}
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
            Lưu
          </Button>
        </div>
      </form>
    </Modal>
  );
};
