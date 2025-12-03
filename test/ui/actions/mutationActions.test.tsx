import { describe, expect, test, vi } from 'vitest'

import {
  createCrudActions,
  createMutationActions,
  createTypedActionMenuItems,
  type CrudActionConfig,
  type MutationActionDefinition,
} from '../../../src/ui/actions/mutationActions'

type PayloadMap = {
  delete: { id: string }
  suspend: { id: string }
}

const createMutation = <TPayload, TData = { ok: boolean }>(options?: { data?: TData; reject?: boolean }) => {
  const mutateAsync = vi.fn(async (payload: TPayload) => {
    void payload
    await Promise.resolve()
    if (options?.reject) {
      throw new Error('mutation-error')
    }
    return (options?.data ?? { ok: true }) satisfies TData
  })

  return {
    mutateAsync,
    isPending: false,
  }
}

const waitForMicrotasks = () =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, 0)
  })

describe('mutation-backed action helpers', () => {
  test('createTypedActionMenuItems executes mutation payloads', async () => {
    const success = vi.fn()
    const mutation = createMutation<PayloadMap['delete']>()
    const definitions: MutationActionDefinition<PayloadMap>[] = [
      {
        id: 'delete',
        label: 'Delete',
        buildPayload: () => ({ id: 'abc' }),
        mutation,
        onSuccess: success,
      },
    ]

    const [action] = createTypedActionMenuItems(definitions)
    action.onSelect()

    await waitForMicrotasks()

    expect(mutation.mutateAsync).toHaveBeenCalledWith({ id: 'abc' })
    expect(success).toHaveBeenCalledWith({ ok: true }, { id: 'abc' })
  })

  test('createTypedActionMenuItems derives disabled state from mutation pending flag', () => {
    const mutation = createMutation<PayloadMap['delete']>({ data: { ok: true } })
    mutation.isPending = true

    const [action] = createTypedActionMenuItems([
      {
        id: 'delete',
        label: 'Delete',
        buildPayload: () => ({ id: 'pending' }),
        mutation,
      },
    ])

    expect(action.disabled).toBe(true)
  })

  test('createMutationActions wires definitions to mutation map', () => {
    const mutation = createMutation<PayloadMap['delete']>()
    const actions = createMutationActions<PayloadMap>(
      {
        delete: mutation,
      },
      [
        {
          id: 'delete',
          label: 'Remove entry',
          buildPayload: () => ({ id: 'row-1' }),
        },
      ],
    )

    actions[0].onSelect()

    expect(mutation.mutateAsync).toHaveBeenCalledWith({ id: 'row-1' })
  })

  test('createTypedActionMenuItems routes rejections to onError', async () => {
    const onError = vi.fn()
    const mutation = createMutation<PayloadMap['delete']>({ reject: true })
    const definitions: MutationActionDefinition<PayloadMap>[] = [
      {
        id: 'delete',
        label: 'Delete',
        buildPayload: () => ({ id: 'abc' }),
        mutation,
        onError,
      },
    ]

    const [action] = createTypedActionMenuItems(definitions)
    action.onSelect()

    await waitForMicrotasks()

    expect(onError).toHaveBeenCalledWith(expect.any(Error), { id: 'abc' })
  })

  test('createMutationActions throws when mutation map is missing entry', () => {
    expect(() =>
      createMutationActions<PayloadMap>(
        {},
        [
          {
            id: 'delete',
            label: 'Remove entry',
            buildPayload: () => ({ id: 'row-1' }),
          },
        ],
      ),
    ).toThrow('Missing mutation for action delete')
  })

  test('createCrudActions builds standard verb labels', () => {
    const deleteMutation = createMutation<{ id: string }>()
    const suspendMutation = createMutation<{ id: string }>()
    const createMutationStub = createMutation<{ id: string }>({ data: { id: 'new' } })
    const resumeMutation = createMutation<{ id: string }>()
    const updateMutation = createMutation<{ id: string; changes?: string }>()

    const config: CrudActionConfig<{ id: string }> = {
      create: {
        mutation: createMutationStub,
        buildPayload: () => ({ id: 'new' }),
      },
      update: {
        mutation: updateMutation,
        buildPayload: () => ({ id: 'row-0', changes: 'name' }),
      },
      delete: {
        mutation: deleteMutation,
        buildPayload: () => ({ id: 'row-1' }),
      },
      suspend: {
        mutation: suspendMutation,
        buildPayload: () => ({ id: 'row-2' }),
      },
      resume: {
        mutation: resumeMutation,
        buildPayload: () => ({ id: 'row-3' }),
      },
    }

    const actions = createCrudActions('License', config)

    expect(actions.map((action) => action.label)).toEqual([
      'Create License',
      'Update License',
      'Delete License',
      'Suspend License',
      'Resume License',
    ])
  })

  test('createCrudActions returns empty array when no entries provided', () => {
    const actions = createCrudActions('License', {})
    expect(actions).toEqual([])
  })
})


