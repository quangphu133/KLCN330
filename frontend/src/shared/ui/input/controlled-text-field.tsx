import { FieldValues, UseControllerProps, useController } from 'react-hook-form'
import Input, { InputProps } from '@/shared/ui/input/input'

type ControlledTextFieldProps<T extends FieldValues> = Omit<
  InputProps,
  'id' | 'onChange' | 'value'
> &
  UseControllerProps<T>

export const ControlledTextField = <T extends FieldValues>({
  control,
  defaultValue,
  name,
  rules,
  shouldUnregister,
  ...rest
}: ControlledTextFieldProps<T>) => {
  const {
    field,
    fieldState: { error },
  } = useController({
    control,
    defaultValue,
    name,
    rules,
    shouldUnregister,
  })

  return <Input {...field} error={error?.message} id={name} {...rest} />
}
