// Ghi chú nhóm: Cập nhật giao diện và nội dung tiếng Việt cho khu vực này.
'use client';
import ComponentCard from '@/shared/ui/component-card/component-card';
import Form from '@/shared/ui/form/form';
import Button from '@/shared/ui/button/button';
import { useCreateMediaFileMutation } from '@/entities/mediafile/api/mediafile.api';
import { Controller, useForm } from 'react-hook-form';
import {
  MediaFileData,
  MediaFileSchema,
} from '@/features/uploading-record/use-uploading-record';
import { zodResolver } from '@hookform/resolvers/zod';
import { ControlledTextField } from '@/shared/ui/input/controlled-text-field';
import { useEffect, useState } from 'react';
import { ErrorComponent } from '@/shared/ui/error/error';
import { toast } from 'react-toastify';
import { useGetProjectsQuery } from '@/entities/projects/projects.api';
import { useGetEmployeesQuery } from '@/entities/users/users.api';
import { setToLocalStorage } from '@/shared/utils/common-utils';
import { formatDateWithLocalTimeZone } from '@/shared/utils/date-utils';
import 'react-multi-date-picker/styles/backgrounds/bg-gray.css';
import 'react-multi-date-picker/styles/colors/purple.css';
import 'react-multi-date-picker/styles/colors/analog_time_picker_purple.css';
import { DateTimePicker } from '@/shared/ui/date-picker/date-picker';
import { DropdownCustom } from '@/shared/ui/dropdown-custom';

interface UploadFormProps {
  uploadedFile: File[] | null;
  onFileUploaded: (files: File[]) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export const UploadForm = ({
  uploadedFile,
  onFileUploaded,
  setIsLoading,
}: UploadFormProps) => {
  const [createMediaFile, { isLoading }] = useCreateMediaFileMutation();
  const { data: projectsData } = useGetProjectsQuery();
  const { data: employeesData } = useGetEmployeesQuery();
  const activeEmployees = employeesData?.filter((employee) => employee.is_active) ?? [];

  const today = new Date();

  const [selectedDate, setSelectedDate] = useState<Date>(today);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    reset: hookFormReset,
  } = useForm<MediaFileData>({
    resolver: zodResolver(MediaFileSchema),
    defaultValues: {
      clientNumber: '',
      telesaleId: '',
      projectId: '',
      file: null,
    },
  });

  useEffect(() => {
    if (uploadedFile && uploadedFile.length > 0) {
        setValue('file', uploadedFile[0]);
    }
    }, [uploadedFile, setValue]);

  const reset = () => {
    hookFormReset();
    onFileUploaded([]);
    setSelectedDate(today);
  };

  const onSubmit = handleSubmit(async (data) => {
    if (!data.file) {
      toast.error('Vui lòng chọn tệp ghi âm');
      return;
    }

    const createDate = formatDateWithLocalTimeZone(selectedDate.toISOString());
    setIsLoading(true);

    try {
      await createMediaFile({
        file: data.file,
        queryParams: {
          createDate,
          clientNumber: data.clientNumber,
          telesaleId: data.telesaleId ? parseInt(data.telesaleId) : undefined,
          projectId: data.projectId ? parseInt(data.projectId) : undefined,
        },
      }).unwrap();

      const uploadTimestamp = new Date().getTime();
      setToLocalStorage('lastUploadTimestamp', uploadTimestamp.toString());

      toast.success('Đã tải tệp ghi âm lên thành công');
      reset();
    } catch (error) {
      const apiError = error as { data?: { detail?: string }; error?: string };
      toast.error(apiError.data?.detail ?? apiError.error ?? 'Không thể tải tệp lên');
    } finally {
      setIsLoading(false);
    }
  });

  const projectOptions =
    projectsData?.map((project) => ({
      label: project.name,
      value: project.id.toString(),
    })) ?? [];

  const employeeOptions =
    activeEmployees.map((employee) => ({
      label: employee.full_name || employee.email,
      value: employee.id.toString(),
    })) ?? [];

  return (
    <>
      <ComponentCard title="Thông tin bản ghi">
        <Form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
            <div>
              <Controller
                control={control}
                render={({ field: { onChange, value } }) => {
                  const selectedValue = value ?? '';
                  const selectedEmployee = activeEmployees.find(
                    (employee) => employee.id === parseInt(selectedValue)
                  );

                  return (
                    <DropdownCustom
                      onChange={onChange}
                      label="Nhân viên tổng đài"
                      placeholder="Chọn nhân viên tổng đài"
                      selected={{
                      label: selectedEmployee?.full_name || selectedEmployee?.email || selectedValue,
                        value: selectedValue,
                      }}
                      options={employeeOptions}
                    />
                  );
                }}
                name={'telesaleId'}
              />
              {errors.telesaleId && <ErrorComponent text={errors.telesaleId.message ?? ''} />}
              {!activeEmployees.length && (
                <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                  Chưa có nhân viên đang hoạt động. Bạn vẫn có thể tải tệp lên.
                </p>
              )}
            </div>
            <div className="w-full">
              <DateTimePicker
                value={new Date(selectedDate)}
                onChange={(date) => {
                  if (date) {
                    setSelectedDate(Array.isArray(date) ? date[0] : date);
                  }
                }}
                label="Ngày và giờ ghi âm"
                withTime={true}
              />
            </div>
            <div className="col-span-1 sm:col-span-2 flex gap-5">
              <div className="w-full">
                <Controller
                  control={control}
                  render={({ field: { onChange, value } }) => {
                    const selectedValue = value ?? '';
                    const selectedProject = projectsData?.find(
                      (project) => project.id === parseInt(selectedValue)
                    );
                    return (
                      <DropdownCustom
                        onChange={onChange}
                        label={'Dự án'}
                        placeholder="Chọn dự án"
                        selected={{
                          label: selectedProject?.name ?? selectedValue,
                          value: selectedValue,
                        }}
                        options={projectOptions}
                      />
                    );
                  }}
                  name={'projectId'}
                />
                {errors.projectId && <ErrorComponent text={errors.projectId.message ?? ''} />}
                {!projectsData?.length && (
                  <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                    Chưa có dự án. Bạn vẫn có thể tải tệp lên.
                  </p>
                )}
              </div>
              <div className="w-full">
                <ControlledTextField
                  control={control}
                  name="clientNumber"
                  label="Điện thoại"
                  type="text"
                  placeholder="Nhập số điện thoại"
                />
              </div>
            </div>
            {errors.file && (
              <ErrorComponent
                text={
                  typeof errors.file.message === 'string'
                    ? errors.file.message
                    : ''
                }
              />
            )}
            <div className="col-span-full">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-[149px] h-[44px] bg-purple-900 hover:bg-purple-800 text-white rounded-full cursor-pointer"
                size="sm"
              >
                {isLoading ? 'Đang tải lên...' : 'Tải tệp lên'}
              </Button>
            </div>
          </div>
        </Form>
      </ComponentCard>
    </>
  );
};
