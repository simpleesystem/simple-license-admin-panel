import { describe, expect, it, vi } from 'vitest'

import { UI_PRODUCT_FORM_ID_CREATE, UI_PRODUCT_FORM_ID_UPDATE } from '@/app/constants'
import type { MutationAdapter } from '@/ui/actions/mutationActions'
import { wrapMutationAdapter } from '@/ui/workflows/mutationHelpers'

describe('wrapMutationAdapter', () => {
  it('invokes lifecycle callbacks on success', async () => {
    const base: MutationAdapter<string> = {
      mutateAsync: vi.fn().mockResolvedValue(UI_PRODUCT_FORM_ID_CREATE),
      isPending: false,
    }

    const onClose = vi.fn()
    const onCompleted = vi.fn()
    const onSuccess = vi.fn()
    const onError = vi.fn()

    const wrapped = wrapMutationAdapter(base, { onClose, onCompleted, onSuccess, onError })
    const result = await wrapped.mutateAsync(UI_PRODUCT_FORM_ID_CREATE)

    expect(result).toBe(UI_PRODUCT_FORM_ID_CREATE)
    expect(onSuccess).toHaveBeenCalledTimes(1)
    expect(onCompleted).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(onError).not.toHaveBeenCalled()
  })

  it('invokes onError and rethrows on failure', async () => {
    const base: MutationAdapter<string> = {
      mutateAsync: vi.fn().mockRejectedValue(new Error(UI_PRODUCT_FORM_ID_UPDATE)),
      isPending: false,
    }

    const onClose = vi.fn()
    const onCompleted = vi.fn()
    const onSuccess = vi.fn()
    const onError = vi.fn()

    const wrapped = wrapMutationAdapter(base, { onClose, onCompleted, onSuccess, onError })

    await expect(wrapped.mutateAsync(UI_PRODUCT_FORM_ID_UPDATE)).rejects.toThrow(UI_PRODUCT_FORM_ID_UPDATE)
    expect(onError).toHaveBeenCalledTimes(1)
    expect(onSuccess).not.toHaveBeenCalled()
    expect(onCompleted).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })
})
