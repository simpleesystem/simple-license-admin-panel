import { faker } from '@faker-js/faker'
import { act, fireEvent, render, renderHook } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { FormModalWithMutation, useFormMutation } from '../../../src/ui/formBuilder/mutationBridge'
import { createFormBlueprint } from '../../../src/ui/formBuilder/blueprint'

type SampleValues = {
  name: string
}

const blueprint = createFormBlueprint<SampleValues>({
  id: 'sample-form',
  title: faker.company.name(),
  sections: [
    {
      id: 'main',
      fields: [
        { id: 'name', name: 'name', component: 'text', label: 'Name' },
      ],
    },
  ],
})

describe('form mutation bridge', () => {
  test('useFormMutation delegates to mutateAsync and emits callbacks', async () => {
    const mutation = {
      mutateAsync: vi.fn(async (values: SampleValues) => {
        await Promise.resolve()
        return values
      }),
      isPending: false,
    }
    const onSuccess = vi.fn()
    const { result } = renderHook(() =>
      useFormMutation<SampleValues>({
        mutation,
        onSuccess,
      }),
    )

    await result.current.handleSubmit({ name: 'Example' })

    expect(mutation.mutateAsync).toHaveBeenCalledWith({ name: 'Example' })
    expect(onSuccess).toHaveBeenCalledWith({ name: 'Example' }, { name: 'Example' })
  })

  test('useFormMutation propagates errors and triggers onError', async () => {
    const mutation = {
      mutateAsync: vi.fn(async () => {
        throw new Error('failure')
      }),
      isPending: false,
    }
    const onError = vi.fn()
    const { result } = renderHook(() =>
      useFormMutation<SampleValues>({
        mutation,
        onError,
      }),
    )

    await expect(result.current.handleSubmit({ name: 'Example' })).rejects.toThrow('failure')
    expect(onError).toHaveBeenCalled()
  })

  test('FormModalWithMutation submits via mutation and closes on success', async () => {
    const mutation = {
      mutateAsync: vi.fn(async (values: SampleValues) => {
        await Promise.resolve()
        return values
      }),
      isPending: false,
    }
    const onClose = vi.fn()
    const submitLabel = faker.lorem.word()
    const { getByRole } = render(
      <FormModalWithMutation
        show
        onClose={onClose}
        blueprint={blueprint}
        defaultValues={{ name: faker.person.fullName() }}
        submitLabel={submitLabel}
        mutation={mutation}
      />,
    )

    await act(async () => {
      fireEvent.click(getByRole('button', { name: submitLabel }))
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    expect(mutation.mutateAsync).toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
  })
})
