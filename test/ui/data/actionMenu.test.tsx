import { faker } from '@faker-js/faker'
import { act, fireEvent, render } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { ActionMenu } from '../../../src/ui/data/ActionMenu'
import { UI_ACTION_MENU_TOGGLE_LABEL } from '../../../src/ui/constants'

describe('ActionMenu', () => {
  test('invokes action handler when menu item selected', async () => {
    const label = faker.lorem.word()
    const onSelect = vi.fn()
    const { getByLabelText, getByText } = render(
      <ActionMenu
        items={[
          { id: 'view', label, onSelect },
        ]}
      />
    )

    await act(async () => {
      fireEvent.click(getByLabelText(UI_ACTION_MENU_TOGGLE_LABEL))
    })
    await act(async () => {
      fireEvent.click(getByText(label))
    })

    expect(onSelect).toHaveBeenCalled()
  })

  test('respects disabled menu items and custom label', async () => {
    const buttonLabel = faker.lorem.words(2)
    const firstLabel = faker.lorem.word()
    const secondLabel = faker.lorem.word()
    const onSelect = vi.fn()
    const { getByRole, getByText } = render(
      <ActionMenu
        buttonLabel={buttonLabel}
        items={[
          { id: 'edit', label: firstLabel, onSelect },
          { id: 'delete', label: secondLabel, onSelect, disabled: true },
        ]}
        testId="row-actions"
      />
    )

    await act(async () => {
      fireEvent.click(getByRole('button', { name: buttonLabel }))
    })
    const disabledItem = getByText(secondLabel)
    expect(disabledItem.closest('button')).toHaveAttribute('aria-disabled', 'true')
    await act(async () => {
      fireEvent.click(getByText(firstLabel))
    })

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(getByRole('button', { name: buttonLabel })).toBeInTheDocument()
  })

  test('renders with custom variant and size while exposing test id', () => {
    const ariaLabel = faker.lorem.words(2)
    const testId = faker.string.uuid()
    const { getByTestId, getByLabelText } = render(
      <ActionMenu
        items={[]}
        variant="outline-secondary"
        size="sm"
        testId={testId}
        ariaLabel={ariaLabel}
      />
    )

    const toggle = getByLabelText(ariaLabel)
    expect(toggle).toBeInTheDocument()
    expect(getByTestId(testId)).toHaveAttribute('data-testid', testId)
  })
})


