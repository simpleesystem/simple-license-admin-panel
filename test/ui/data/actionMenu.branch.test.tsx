import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { UI_ACTION_MENU_TOGGLE_LABEL } from '../../../src/ui/constants'
import { ActionMenu } from '../../../src/ui/data/ActionMenu'

describe('ActionMenu branch coverage', () => {
  test('uses default aria-label when toggle is icon', () => {
    render(
      <ActionMenu
        items={[
          { id: 'a', label: 'Action A', onSelect: vi.fn() },
          { id: 'b', label: 'Action B', onSelect: vi.fn() },
        ]}
      />
    )

    expect(screen.getByLabelText(UI_ACTION_MENU_TOGGLE_LABEL)).toBeInTheDocument()
  })

  test('omits default aria-label when custom label provided', () => {
    render(<ActionMenu buttonLabel="Open actions" items={[{ id: 'a', label: 'Action A', onSelect: vi.fn() }]} />)

    expect(screen.queryByLabelText(UI_ACTION_MENU_TOGGLE_LABEL)).toBeNull()
    expect(screen.getByRole('button', { name: 'Open actions' })).toBeInTheDocument()
  })

  test('invokes onSelect only for enabled items', () => {
    const enabledSelect = vi.fn()
    const disabledSelect = vi.fn()

    render(
      <ActionMenu
        items={[
          { id: 'disabled', label: 'Disabled', onSelect: disabledSelect, disabled: true },
          { id: 'enabled', label: 'Enabled', onSelect: enabledSelect },
        ]}
      />
    )

    const toggle = screen.getByLabelText(UI_ACTION_MENU_TOGGLE_LABEL)
    act(() => {
      fireEvent.click(toggle)
    })

    act(() => {
      fireEvent.click(screen.getByText('Disabled'))
    })
    act(() => {
      fireEvent.click(screen.getByText('Enabled'))
    })

    expect(disabledSelect).not.toHaveBeenCalled()
    expect(enabledSelect).toHaveBeenCalledTimes(1)
  })
})
