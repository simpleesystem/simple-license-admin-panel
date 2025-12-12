import type { MutationAdapter } from './mutationActions'

type MutationLifecycle = {
  onClose?: () => void
  onCompleted?: () => void
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export const wrapMutationAdapter = <TFieldValues>(
  adapter: MutationAdapter<TFieldValues>,
  lifecycle: MutationLifecycle
): MutationAdapter<TFieldValues> => ({
  mutateAsync: async (values) => {
    try {
      const result = await adapter.mutateAsync(values)
      lifecycle.onSuccess?.()
      lifecycle.onCompleted?.()
      lifecycle.onClose?.()
      return result
    } catch (error) {
      lifecycle.onError?.(error)
      throw error
    }
  },
  isPending: adapter.isPending,
})
