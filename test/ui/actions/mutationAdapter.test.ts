import { describe, expect, test, vi } from 'vitest'

import { adaptMutation } from '../../../src/ui/actions/mutationAdapter'

describe('adaptMutation', () => {
  test('wraps mutateAsync and exposes pending state', async () => {
    const mutateAsync = vi.fn(async (payload: { id: string }) => payload.id)
    const mutation = {
      mutateAsync,
      isPending: true,
    }

    const adapter = adaptMutation<{ id: string }>(mutation as never)

    await expect(adapter.mutateAsync({ id: '123' })).resolves.toBe('123')
    expect(mutateAsync).toHaveBeenCalledWith({ id: '123' })
    expect(adapter.isPending).toBe(true)
  })
})


