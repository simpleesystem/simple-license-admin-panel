import { useCallback } from 'react'
import type { FieldValues } from 'react-hook-form'

import type { MutationAdapter } from '../actions/mutationActions'

type FormMutationOptions<TFieldValues extends FieldValues, TData, TError> = {
  mutation: MutationAdapter<TFieldValues, TData>
  onSuccess?: (data: TData, values: TFieldValues) => void
  onError?: (error: TError, values: TFieldValues) => void
}

export const useFormMutation = <TFieldValues extends FieldValues, TData = unknown, TError = Error>({
  mutation,
  onSuccess,
  onError,
}: FormMutationOptions<TFieldValues, TData, TError>) => {
  const handleSubmit = useCallback(
    async (values: TFieldValues) => {
      try {
        const result = await mutation.mutateAsync(values)
        onSuccess?.(result, values)
      } catch (error) {
        onError?.(error as TError, values)
        throw error
      }
    },
    [mutation, onError, onSuccess]
  )

  return {
    handleSubmit,
    isPending: mutation.isPending,
  }
}
