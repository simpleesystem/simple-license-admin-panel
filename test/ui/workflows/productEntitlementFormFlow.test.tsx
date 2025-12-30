import { fireEvent, render, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { UI_ENTITLEMENT_FORM_SUBMIT_CREATE, UI_ENTITLEMENT_FORM_SUBMIT_UPDATE } from '../../../src/ui/constants'
import { ProductEntitlementFormFlow } from '../../../src/ui/workflows/ProductEntitlementFormFlow'
import { buildEntitlement } from '../../factories/entitlementFactory'
import { buildText } from '../../ui/factories/uiFactories'

const useCreateEntitlementMock = vi.hoisted(() => vi.fn())
const useUpdateEntitlementMock = vi.hoisted(() => vi.fn())

vi.mock('@/simpleLicense', async () => {
  const actual = await vi.importActual<typeof import('@/simpleLicense')>('@/simpleLicense')
  return {
    ...actual,
    useCreateEntitlement: useCreateEntitlementMock,
    useUpdateEntitlement: useUpdateEntitlementMock,
  }
})

const mockMutation = () => ({
  mutateAsync: vi.fn(async () => ({})),
  isPending: false,
})

describe('ProductEntitlementFormFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('submits create flow and triggers callbacks', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateEntitlementMock.mockReturnValue(createMutation)
    useUpdateEntitlementMock.mockReturnValue(updateMutation)
    const onClose = vi.fn()
    const onCompleted = vi.fn()

    const { getByRole } = render(
      <ProductEntitlementFormFlow
        client={{} as never}
        mode="create"
        productId={buildText()}
        show
        onClose={onClose}
        submitLabel={UI_ENTITLEMENT_FORM_SUBMIT_CREATE}
        onCompleted={onCompleted}
      />,
    )

    fireEvent.click(getByRole('button', { name: UI_ENTITLEMENT_FORM_SUBMIT_CREATE }))

    await waitFor(() => expect(createMutation.mutateAsync).toHaveBeenCalled())
    expect(onClose).toHaveBeenCalled()
    expect(onCompleted).toHaveBeenCalled()
  })

  test('submits update flow and triggers onCompleted', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateEntitlementMock.mockReturnValue(createMutation)
    useUpdateEntitlementMock.mockReturnValue(updateMutation)
    const entitlement = buildEntitlement()
    const onCompleted = vi.fn()

    const { getByRole } = render(
      <ProductEntitlementFormFlow
        client={{} as never}
        mode="update"
        entitlementId={entitlement.id}
        show
        onClose={() => {}}
        submitLabel={UI_ENTITLEMENT_FORM_SUBMIT_UPDATE}
        onCompleted={onCompleted}
      />,
    )

    fireEvent.click(getByRole('button', { name: UI_ENTITLEMENT_FORM_SUBMIT_UPDATE }))

    await waitFor(() =>
      expect(updateMutation.mutateAsync).toHaveBeenCalledWith({
        id: entitlement.id,
        data: expect.any(Object),
      }),
    )
    expect(onCompleted).toHaveBeenCalled()
  })

  test('does not call onCompleted when mutation fails', async () => {
    const mutationError = new Error(buildText())
    const createMutation = {
      mutateAsync: vi.fn(async () => {
        throw mutationError
      }),
      isPending: false,
    }
    const updateMutation = mockMutation()
    useCreateEntitlementMock.mockReturnValue(createMutation)
    useUpdateEntitlementMock.mockReturnValue(updateMutation)
    const onClose = vi.fn()
    const onCompleted = vi.fn()

    const { getByRole } = render(
      <ProductEntitlementFormFlow
        client={{} as never}
        mode="create"
        productId={buildText()}
        show
        onClose={onClose}
        submitLabel={UI_ENTITLEMENT_FORM_SUBMIT_CREATE}
        onCompleted={onCompleted}
      />,
    )

    fireEvent.click(getByRole('button', { name: UI_ENTITLEMENT_FORM_SUBMIT_CREATE }))

    await waitFor(() => expect(createMutation.mutateAsync).toHaveBeenCalled())
    const mutateCall = createMutation.mutateAsync.mock.results[0]?.value as Promise<unknown>
    await expect(mutateCall).rejects.toThrow(mutationError)
    expect(onCompleted).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })
})
