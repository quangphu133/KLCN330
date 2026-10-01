import { FieldValues, useController, UseControllerProps } from 'react-hook-form'
import Checkbox, { CheckboxProps } from '@/shared/ui/checkbox/checkbox'

export type ControlledCheckboxProps<T extends FieldValues> = Omit<
  CheckboxProps,
  'id' | 'onChange' | 'checked'
> &
  UseControllerProps<T>

export const ControlledCheckbox = <T extends FieldValues>({
  control,
  defaultValue,
  name,
  rules,
  shouldUnregister,
  ...checkboxProps
}: ControlledCheckboxProps<T>) => {
  const {
    field: { onChange, value },
    fieldState: { error },
  } = useController({
    control,
    defaultValue,
    name,
    rules,
    shouldUnregister,
  })

  return (
    <Checkbox
      checked={!!value}
      error={error?.message}
      id={name}
      onChange={onChange}
      {...checkboxProps}
    />
  )
}
