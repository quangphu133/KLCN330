import { Modal } from '@/shared/ui/modal/modal';
import Button from '@/shared/ui/button/button';
import {
  DictionariesTranslations,
  DictionaryReqBody,
  DictionaryTypeValues,
} from '@/entities/dictionaries/dictionaries.types';
import { z } from 'zod';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '@/shared/ui/input/input';
import Label from '@/shared/ui/label/label';
import { dictionaryColors } from '@/shared/constants/dictionaryColors';
import Textarea from '@/shared/ui/textarea/textarea';
import { Switcher } from '@/shared/ui/switcher';
import { useGetDictionaryQuery } from '@/entities/dictionaries/dictionaries.api';
import { useEffect } from 'react';
import { DropdownCustom } from '@/shared/ui/dropdown-custom';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: DictionaryReqBody) => void;
  dictionaryId: number;
}

const editDictionarySchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  isActive: z.boolean(),
  type: z.enum(DictionaryTypeValues),
  phrases: z.array(z.string()),
  colorHex: z.string().min(7).max(9),
});

export const EditDictionaryModal = ({
  isOpen,
  onClose,
  onSave,
  dictionaryId,
}: Props) => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { isValid, errors },
  } = useForm<z.infer<typeof editDictionarySchema>>({
    resolver: zodResolver(editDictionarySchema),
    defaultValues: {
      isActive: true,
      colorHex: '#FF3B30',
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof editDictionarySchema>> = (
    data
  ) => {
    onSave(data);
    onClose();
  };

  const { data: dictioinaryData, isSuccess } =
    useGetDictionaryQuery(dictionaryId);

  useEffect(() => {
    if (isSuccess && dictioinaryData) {
      reset({
        name: dictioinaryData.name ?? '',
        isActive: dictioinaryData.isActive,
        type: dictioinaryData.type,
        colorHex:
          dictioinaryData.colorHex &&
          dictionaryColors.includes(dictioinaryData.colorHex)
            ? dictioinaryData.colorHex
            : '#FF3B30',
        phrases: dictioinaryData.data?.phrases ?? [],
      });
    }
  }, [dictioinaryData, isSuccess, reset]);

  return (
    <Modal
      isOpen={isOpen}
      title={'Chỉnh sửa từ điển'}
      onClose={onClose}
      className="max-w-[700px] mx-auto"
    >
      <form
        className="px-10 flex flex-col gap-6 pb-10 pt-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <Input
          {...register('name')}
          id="dictionary-name"
          label="Tên từ điển"
          placeholder="Nhập tên từ điển"
          error={errors.name?.message}
        />
        <Controller
          control={control}
          render={({ field: { onChange, value } }) => (
            <DropdownCustom
              onChange={onChange}
              label="Loại từ điển"
              selected={{
                label: DictionariesTranslations[value],
                value: value,
              }}
              options={DictionaryTypeValues.map((dictionaryValue, index) => ({
                label: DictionariesTranslations[dictionaryValue],
                value: dictionaryValue,
              }))}
            />
            // <Select
            //   value={value}
            //   label="Loại từ điển"
            //   onChange={(newGiá trị) => {
            //     onChange(newGiá trị as DictionaryType);
            //   }}
            //   options={DictionaryTypeValues.map((dictionaryGiá trị, index) => ({
            //     label: dictionaryGiá trị,
            //     value: dictionaryGiá trị,
            //   }))}
            // />
          )}
          name={'type'}
        />
        <div className="flex flex-col gap-1.5">
          <Label>Màu từ điển</Label>
          <div className="flex gap-3">
            {dictionaryColors.map((color) => (
              <label
                className="inline-flex items-center cursor-pointer"
                key={color}
              >
                <input
                  type="radio"
                  // defaultChecked={color === watch('colorHex')}
                  value={color}
                  {...register('colorHex')}
                  className="absolute opacity-0 peer"
                />
                <span
                  style={{
                    backgroundColor: color,
                  }}
                  className={`
      inline-block w-8 h-8 rounded-full transition after:duration-300       
      relative after:content-[''] after:absolute after:top-2 after:left-2 
      after:w-4 after:h-4 after:rounded-full after:bg-white 
      after:opacity-0 peer-checked:after:opacity-100
    `}
                ></span>
              </label>
            ))}
          </div>
        </div>
        <Controller
          control={control}
          render={({ field: { onChange, value } }) => {
            const textareaValue = value ? value.join('\n') : '';
            return (
              <Textarea
                id="dictionary-phrases"
                label="Từ khóa"
                placeholder="Nhập từ khóa"
                value={textareaValue}
                onChange={(e) => {
                  const newValue = e.target.value;
                  onChange(newValue.split('\n'));
                }}
                error={errors.phrases?.message}
              />
            );
          }}
          name={'phrases'}
        />
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
              <Label>Xuất bảned</Label>
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
