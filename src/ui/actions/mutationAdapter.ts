import type { UseMutationResult } from '@tanstack/react-query'

import type { MutationAdapter } from './mutationActions'

export const adaptMutation = <
  TPayload,
  TData = unknown,
  TError = Error,
>(mutation: UseMutationResult<TData, TError, TPayload>): MutationAdapter<TPayload, TData> => ({
  mutateAsync: async (payload: TPayload) => {
    return await mutation.mutateAsync(payload)
  },
  get isPending() {
    return mutation.isPending
  },
})


