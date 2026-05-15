import type { FieldValues } from 'react-hook-form'

import type { MutationAdapter } from '../actions/mutationActions'
import { useFormMutation } from '../formBuilder/useFormMutation'
import { wrapMutationAdapter } from './mutationHelpers'

type UseDialogFormMutationOptions<TFieldValues extends FieldValues> = {
  mutation: MutationAdapter<TFieldValues>
  onCompleted?: () => void
  onSuccess?: () => void
  onError?: (error: unknown) => void
  onClose: () => void
}

export const useDialogFormMutation = <TFieldValues extends FieldValues, TError = Error>({
  mutation,
  onCompleted,
  onSuccess,
  onError,
  onClose,
}: UseDialogFormMutationOptions<TFieldValues>) => {
  const wrappedMutation = wrapMutationAdapter(mutation, {
    onCompleted,
    onSuccess,
    onError,
  })

  return useFormMutation<TFieldValues, unknown, TError>({
    mutation: wrappedMutation,
    onSuccess: () => onClose(),
  })
}
