// Ghi chú nhóm: Việt hóa và cải thiện hiển thị cho màn hình quản lý dữ liệu.
'use client';

import { ChecklistsTable } from '@/features/checklists/components/checklists-table';
import {
  useCloneChecklistMutation,
  useGetChecklistQuery,
  useUpdateChecklistMutation,
} from '@/entities/checklists/checklists.api';
import { LoaderContent } from '@/shared/ui/loader';
import { useParams } from 'next/navigation';
import ComponentCard from '@/shared/ui/component-card/component-card';
import Button from '@/shared/ui/button/button';
import { z } from 'zod';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '@/shared/ui/input/input';
import Select from '@/shared/ui/select/select';
import Label from '@/shared/ui/label/label';
import Textarea from '@/shared/ui/textarea/textarea';
import { Switcher } from '@/shared/ui/switcher';
import {
  CopyIcon,
  EditIcon,
  PlusIcon,
  TrashRedIcon,
} from '@/../public/assets/icons';
import { Fragment, useEffect, useState } from 'react';
import { ChecklistScaleTypeValues } from '@/entities/checklists/checklists.types';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { EditChecklistModal } from './components/EditChecklistModal';

const CriteriaSchema = z.object({
  name: z.string(),
  minScore: z.coerce.number().optional(),
  maxScore: z.coerce.number().optional(),
  scale: z.enum(ChecklistScaleTypeValues).default('Full'),
  help: z.string().nullable().optional(),
});

const BlockSchema = z.object({
  name: z.string(),
  criterias: z.array(CriteriaSchema),
});

const DataSchema = z.object({
  name: z.string().nullable().optional(),
  blocks: z.array(BlockSchema),
});

export const editChecklistSchema = z.object({
  isActive: z.boolean().optional(),
  data: DataSchema.nullable(),
  projectIds: z.array(z.number()).optional(),
});

export const EditChecklist = () => {
  const params = useParams();
  const checklistid = Number(params.checklistid);
  const { data: checklistData, isLoading } = useGetChecklistQuery(checklistid);

  const [isEditingChecklist, setIsEditingChecklist] = useState(false);
  const [updateChecklist, updateChecklistResult] = useUpdateChecklistMutation();
  const [cloneChecklist, cloneChecklistResult] = useCloneChecklistMutation();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { isValid, errors },
  } = useForm<z.infer<typeof editChecklistSchema>>({
    resolver: zodResolver(editChecklistSchema),
  });

  const onSubmit: SubmitHandler<z.infer<typeof editChecklistSchema>> = (
    data
  ) => {
    // Ensure data.data is not null and matches the expected structure
    let normalizedData = data.data;
    if (!normalizedData) {
      normalizedData = { name: '', blocks: [] };
    }
    // If blocks is missing, leave it undefined (optional)
    let safeBlocks = Array.isArray(normalizedData.blocks)
      ? normalizedData.blocks.map((block) => ({
          ...block,
          criterias: Array.isArray(block.criterias)
            ? block.criterias
            : undefined,
        }))
      : undefined;
    // Ensure name is always a string
    const safeData = {
      ...normalizedData,
      name: normalizedData.name ?? 'name',
      blocks: safeBlocks,
    };
    updateChecklist({
      id: checklistid,
      body: {
        ...data,
        data: safeData,
        // isActive: checklistData?.isActive,
        // projectIds:
        //   checklistData?.checklistDự án?.map((pr) => Number(pr.projectId)) ??
        //   [],
        // name: undefined,
      },
    });
  };

  useEffect(() => {
    if (updateChecklistResult.isSuccess) {
      toast.success('Đã cập nhật danh sách kiểm tra');
    }
  }, [updateChecklistResult]);

  useEffect(() => {
    if (cloneChecklistResult.isSuccess) {
      toast.success('Đã tạo bản sao');
    }
  }, [cloneChecklistResult]);

  useEffect(() => {
    if (checklistData) {
      reset({
        data: checklistData.data,
      });
    }
  }, [checklistData, reset]);

  if (isLoading) {
    return <div>Đang tải...</div>;
  }

  const blocks = watch('data.blocks') ?? [];
  return (
    <Fragment>
      <EditChecklistModal
        isOpen={isEditingChecklist}
        onClose={() => {
          setIsEditingChecklist(false);
        }}
        onSave={(data) => {
          updateChecklist({ id: checklistid, body: data });
        }}
        checklistData={checklistData}
      />
      {isLoading ? (
        <LoaderContent width={200} height={200} isLoading={isLoading} />
      ) : (
        <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
          <h2
            className="text-xl font-semibold text-gray-800 dark:text-white/90"
            x-text="pageName"
          >
            Chỉnh sửaing checklist
          </h2>
          <ComponentCard>
            <div className="flex gap-2 w-full">
              <div className="flex flex-col gap-6 grow">
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-gray-100">
                    {checklistData?.name}
                  </h3>
                  <p className="text-gray-500 text-sm dark:text-gray-400">
                    {checklistData?.checklistProjects?.reduce(
                      (res, cur) => res + (res ? ' | ' : '') + cur.projectName,
                      ''
                    )}
                  </p>
                </div>
                <div className="flex gap-3 items-center">
                  <div className="flex items-center gap-3">
                    <Switcher
                      enabled={Boolean(checklistData?.isActive)}
                      setEnabled={() => {
                        updateChecklist({
                          id: checklistid,
                          body: {
                            isActive: !checklistData?.isActive,
                          },
                        });
                      }}
                    />
                    <Label>Xuất bản</Label>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-between gap-6">
                <Button
                  className="px-2 py-2 text-gray-700 hover:bg-gray-100 bg-white border border-gray-200 cursor-pointer rounded-full dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
                  type="button"
                  onClick={() => {
                    cloneChecklist(checklistid);
                  }}
                >
                  <div className="w-4.5">
                    <CopyIcon />
                  </div>
                  <div className="whitespace-nowrap">Tạo bản sao</div>
                </Button>
                <Button
                  className="px-2 py-2 text-gray-700 hover:bg-gray-100 bg-white border border-gray-200 cursor-pointer rounded-full dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
                  type="button"
                  onClick={() => {
                      setIsEditingChecklist(true);
                  }}
                >
                  <div className="w-4.5">
                    <EditIcon />
                  </div>
                  Chỉnh sửa
                </Button>
              </div>
            </div>
          </ComponentCard>
          {blocks.map((block, index) => (
            <Fragment key={index}>
              <ComponentCard>
                <Input
                  {...register(`data.blocks.${index}.name`)}
                  id={`${index}-block-name`}
                  label="Tên khối"
                  placeholder="Nhập tên khối"
                  error={errors.data?.blocks?.[index]?.name?.message}
                />
              </ComponentCard>
              <ComponentCard>
                <div className=" flex flex-col gap-8">
                  {(block.criterias ?? []).map((criteria, ind) => (
                    <Fragment key={ind}>
                      <div className="flex flex-col gap-6">
                        <div className="grid grid-cols-3 gap-8">
                          <div className="flex flex-col gap-2">
                            <div className="flex gap-2 items-center">
                              <Label>Tiêu chí {ind + 1}</Label>
                              <div
                                className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/60"
                                onClick={() => {
                                  const newCriterias = block.criterias.filter(
                                    (_, i) => i !== ind
                                  );
                                  setValue(
                                    `data.blocks.${index}.criterias`,
                                    newCriterias
                                  );
                                }}
                              >
                                <TrashRedIcon />
                              </div>
                            </div>
                            <Input
                              {...register(
                                `data.blocks.${index}.criterias.${ind}.name`
                              )}
                              id={`${index}-block-${ind}-criteria-name`}
                              placeholder="Nhập tiêu chí"
                              error={
                                errors.data?.blocks?.[index]?.criterias?.[index]
                                  ?.name?.message
                              }
                            />
                          </div>
                          {/* <div className="flex flex-col gap-4">
                            <Label>Loại thang đo</Label>
                            <div className="flex gap-3">
                              {ChecklistScaleTypeValues.map((scale) => (
                                <label
                                  className="inline-flex items-center cursor-pointer gap-3"
                                  key={scale}
                                >
                                  <input
                                    type="radio"
                                    value={scale}
                                    {...register(
                                      `data.blocks.${index}.criterias.${ind}.scale`
                                    )}
                                    className="absolute opacity-0 peer"
                                  />
                                  <span
                                    className={`
                                  inline-block shrink-0 w-4 h-4 rounded-full transition after:duration-300       
                                  relative after:content-[''] after:absolute after:top-1 after:left-1 
                                  after:w-2 after:h-2 after:rounded-full after:bg-white grow-0
                                  after:opacity-0 peer-checked:after:opacity-100 bg-purple-900
                                `}
                                  ></span>
                                  {scale === 'Full' && 'Phạm vi'}
                                  {scale === 'Binary' && 'Lựa chọn nhị phân'}
                                </label>
                              ))}
                            </div>
                          </div> */}
                          <div className="flex flex-col gap-2">
                            <Label>Giá trị</Label>
                            <div className="flex gap-3">
                              <div className="w-24">
                                <Input
                                  {...register(
                                    `data.blocks.${index}.criterias.${ind}.minScore`
                                  )}
                                  type="number"
                                  id={`${index}-block-${ind}-criteria-minScore`}
                                  placeholder="Giá trị"
                                  error={
                                    errors.data?.blocks?.[index]?.criterias?.[
                                      index
                                    ]?.minScore?.message
                                  }
                                />
                              </div>
                              {watch(
                                `data.blocks.${index}.criterias.${ind}.scale`
                              ) === 'Full' && (
                                <div className="text-[32px] font-bold h-full flex items-end">
                                  ...
                                </div>
                              )}
                              {watch(
                                `data.blocks.${index}.criterias.${ind}.scale`
                              ) === 'Binary' && (
                                <div className="text-[32px] font-bold h-full flex items-center">
                                  /
                                </div>
                              )}
                              <div className="w-24">
                                <Input
                                  {...register(
                                    `data.blocks.${index}.criterias.${ind}.maxScore`
                                  )}
                                  type="number"
                                  id={`${index}-block-${ind}-criteria-maxScore`}
                                  placeholder="Giá trị"
                                  error={
                                    errors.data?.blocks?.[index]?.criterias?.[
                                      index
                                    ]?.maxScore?.message
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <Textarea
                          id={`${index}-block-${ind}-criteria-help`}
                          label="Giải thích tiêu chí"
                          placeholder="Nhập giải thích"
                          error={
                            errors.data?.blocks?.[index]?.criterias?.[ind]?.help
                              ?.message
                          }
                          {...register(
                            `data.blocks.${index}.criterias.${ind}.help`
                          )}
                        />
                      </div>
                      {ind !== block.criterias.length - 1 && (
                        <div className="w-full h-px bg-gray-200"></div>
                      )}
                    </Fragment>
                  ))}{' '}
                </div>

                <div className="flex justify-center">
                  <Button
                    className="px-2 py-2 text-gray-700 hover:bg-gray-100 bg-white border border-gray-200 cursor-pointer rounded-full dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
                    type="button"
                    onClick={() => {
                                  setValue(`data.blocks.${index}.criterias`, [
                        ...(block.criterias ?? []),
                        {
                          name: '',
                          minScore: 0,
                          maxScore: 0,
                          help: '',
                          scale: 'Full',
                        },
                      ]);
                    }}
                  >
                    <div className="w-4.5">
                      <PlusIcon />
                    </div>
                    Thêm tiêu chí
                  </Button>
                </div>
              </ComponentCard>
            </Fragment>
          ))}
          <ComponentCard>
            <div className="flex justify-center">
              <Button
                className="px-2 py-2 text-gray-700 hover:bg-gray-100 bg-white border border-gray-200 cursor-pointer rounded-full dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
                type="button"
                onClick={() => {
                        setValue('data.blocks', [
                    ...(blocks ?? []),
                    {
                      name: '',
                      criterias: [],
                    },
                  ]);
                }}
              >
                <div className="w-4.5">
                  <PlusIcon />
                </div>
                Thêm khối
              </Button>
            </div>
          </ComponentCard>
          <div className="flex justify-between w-full">
            <Link href="/checklists">
              <Button className="px-2 py-2 text-gray-700 hover:bg-gray-100 bg-white border border-gray-200 cursor-pointer rounded-full dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700">
                Hủy thay đổi
              </Button>
            </Link>

            <Button
              type="submit"
              className={`px-2 py-2 bg-purple-900 cursor-pointer hover:bg-purple-800 text-white rounded-full`}
              disabled={!isValid}
            >
              Lưu
            </Button>
          </div>
        </form>
      )}
    </Fragment>
  );
};
