import type { FieldValues } from 'react-hook-form'

import type { MutationAdapter } from '../actions/mutationActions'
import { FormModal, type FormModalProps } from './FormModal'
import { useFormMutation } from './useFormMutation'

export type FormModalWithMutationProps<TFieldValues extends FieldValues, TData = unknown, TError = Error> = Omit<
  FormModalProps<TFieldValues>,
  'onSubmit'
> &
  {
    mutation: MutationAdapter<TFieldValues, TData>
    onSuccess?: (data: TData, values: TFieldValues) => void
    onError?: (error: TError, values: TFieldValues) => void
  }

export function FormModalWithMutation<TFieldValues extends FieldValues, TData = unknown, TError = Error>({
  mutation,
  onSuccess,
  onError,
  ...modalProps
}: FormModalWithMutationProps<TFieldValues, TData, TError>) {
  const { handleSubmit } = useFormMutation<TFieldValues, TData, TError>({
    mutation,
    onSuccess,
    onError,
  })

  return <FormModal {...modalProps} onSubmit={handleSubmit} />
}
