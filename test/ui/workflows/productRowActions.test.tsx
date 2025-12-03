import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, beforeEach, test, vi } from 'vitest'

import { ProductRowActions } from '../../../src/ui/workflows/ProductRowActions'

const useDeleteProductMock = vi.hoisted(() => vi.fn())
const useSuspendProductMock = vi.hoisted(() => vi.fn())
const useResumeProductMock = vi.hoisted(() => vi.fn())

vi.mock('@simple-license/react-sdk', async () => {
  const actual = await vi.importActual<typeof import('@simple-license/react-sdk')>('@simple-license/react-sdk')
  return {
    ...actual,
    useDeleteProduct: useDeleteProductMock,
    useSuspendProduct: useSuspendProductMock,
    useResumeProduct: useResumeProductMock,
  }
})

vi.mock('../../../src/ui/data/ActionMenu', () => ({
  ActionMenu: ({ items }: { items: Array<{ id: string; label: string; onSelect: () => void }> }) => (
    <div>
      {items.map((item) => (
        <button key={item.id} onClick={item.onSelect}>
          {item.label}
        </button>
      ))}
    </div>
  ),
}))

const mockMutation = () => ({
  mutateAsync: vi.fn(async () => ({})),
  isPending: false,
})

describe('ProductRowActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('wires delete mutation to action menu', () => {
    const deleteMutation = mockMutation()
    const suspendMutation = mockMutation()
    const resumeMutation = mockMutation()
    useDeleteProductMock.mockReturnValue(deleteMutation)
    useSuspendProductMock.mockReturnValue(suspendMutation)
    useResumeProductMock.mockReturnValue(resumeMutation)

    render(
      <ProductRowActions client={{} as never} productId="prod-1" isActive onCompleted={vi.fn()} />,
    )

    fireEvent.click(screen.getByText('Delete Product'))
    expect(deleteMutation.mutateAsync).toHaveBeenCalledWith('prod-1')
  })

  test('disables suspend/resume based on active state', () => {
    const deleteMutation = mockMutation()
    const suspendMutation = mockMutation()
    const resumeMutation = mockMutation()
    useDeleteProductMock.mockReturnValue(deleteMutation)
    useSuspendProductMock.mockReturnValue(suspendMutation)
    useResumeProductMock.mockReturnValue(resumeMutation)

    render(
      <ProductRowActions client={{} as never} productId="prod-2" isActive={false} />,
    )

    fireEvent.click(screen.getByText('Resume Product'))
    expect(resumeMutation.mutateAsync).toHaveBeenCalledWith('prod-2')
  })
})


