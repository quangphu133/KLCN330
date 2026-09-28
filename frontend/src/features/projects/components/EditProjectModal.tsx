import { Modal } from '@/shared/ui/modal/modal';
import Button from '@/shared/ui/button/button';
import { type Project } from '@/entities/projects/projects.types';
import { z } from 'zod';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '@/shared/ui/input/input';
import { MultiSelect } from '@/shared/ui/multiselect/multiselect';
import { useGetDictionariesQuery } from '@/entities/dictionaries/dictionaries.api';
import { useGetChecklistsQuery } from '@/entities/checklists/checklists.api';
import { useGetProjectQuery } from '@/entities/projects/projects.api';
import Label from '@/shared/ui/label/label';
import { Switcher } from '@/shared/ui/switcher';
import { useEffect } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Project>) => void;
  projectId: number;
}

const editProjectSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  vocabularyIds: z.array(z.number()).optional(),
  checklistIds: z.array(z.number()).optional(),
  isActive: z.boolean(),
});

export const EditProjectModal = ({
  isOpen,
  onClose,
  onSave,
  projectId,
}: Props) => {
  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    formState: { isValid, errors },
  } = useForm<z.infer<typeof editProjectSchema>>({
    resolver: zodResolver(editProjectSchema),
    defaultValues: {
      isActive: true,
      vocabularyIds: [],
      checklistIds: [],
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof editProjectSchema>> = (data) => {
    onSave(data);
    onClose();
  };

  const { data: dictionariesData } = useGetDictionariesQuery();

  const { data: checklistsData } = useGetChecklistsQuery();

  const vocabularies = watch('vocabularyIds');
  const checklists = watch('checklistIds');

  const { data: project, isSuccess } = useGetProjectQuery(projectId);

  useEffect(() => {
    if (isSuccess && project) {
      reset({
        name: project.name ?? '',
        isActive: project.isActive,
        vocabularyIds:
          project.vocabularyProjects
            ?.map((pr) => pr.vocabularyId)
            .filter((id) => id !== null) ?? [],
        checklistIds:
          project.checklistProjects
            ?.map((pr) => pr.checklistId)
            .filter((id) => id !== null) ?? [],
      });
    }
  }, [project, isSuccess, reset]);

  return (
    <Modal
      isOpen={isOpen}
      title={'Chỉnh sửaing project'}
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
        {dictionariesData && vocabularies && (
          <Controller
            control={control}
            render={({ field: { onChange, value } }) => (
              <MultiSelect
                label="Từ điển"
                selectedOptions={dictionariesData
                  .filter((dict) => value && value.includes(dict.id))
                  .map((opt) => ({
                    label: opt.name,
                    value: opt.id.toString(),
                  }))}
                options={dictionariesData.map((opt) => ({
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
            name={'vocabularyIds'}
          />
        )}
        {checklistsData && checklists && (
          <Controller
            control={control}
            render={({ field: { onChange, value } }) => (
              <MultiSelect
                label="Danh sách kiểm tra"
                selectedOptions={checklistsData
                  .filter((check) => value && value.includes(check.id))
                  .map((opt) => ({
                    label: opt.name,
                    value: opt.id.toString(),
                  }))}
                options={checklistsData.map((opt) => ({
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
            name={'checklistIds'}
          />
        )}
        <Controller
          control={control}
          render={({ field: { onChange, value } }) => (
            <div className="flex items-center gap-3">
              <Switcher
                enabled={value}
                setEnabled={() => {
                  onChange(!value);
                }}
              />
              <Label>Đang hoạt động</Label>
            </div>
          )}
          name={'isActive'}
        />

        <div className="flex justify-between">
          <Button
            className="px-2 py-2 text-gray-700 hover:bg-gray-100 bg-white border border-gray-200 cursor-pointer rounded-full"
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
