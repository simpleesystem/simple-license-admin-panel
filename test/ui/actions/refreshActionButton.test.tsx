import { faker } from '@faker-js/faker'
import { fireEvent, render } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import { RefreshActionButton } from '../../../src/ui/actions/RefreshActionButton'
import { UI_BUTTON_VARIANT_OUTLINE_SECONDARY, UI_CLASS_PANEL_ACTION_BUTTON } from '../../../src/ui/constants'

describe('RefreshActionButton', () => {
  test('renders idle label and default panel action class', () => {
    const idleLabel = faker.lorem.words(2)
    const onRefresh = vi.fn()
    const { getByRole } = render(<RefreshActionButton onRefresh={onRefresh} idleLabel={idleLabel} />)

    const button = getByRole('button', { name: idleLabel })
    expect(button).toHaveClass(UI_CLASS_PANEL_ACTION_BUTTON, { exact: false })
    expect(button).toHaveClass(`btn-${UI_BUTTON_VARIANT_OUTLINE_SECONDARY}`, { exact: false })
    expect(button).not.toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'false')
  })

  test('fires refresh callback when clicked', () => {
    const idleLabel = faker.lorem.words(2)
    const onRefresh = vi.fn()
    const { getByRole } = render(<RefreshActionButton onRefresh={onRefresh} idleLabel={idleLabel} />)

    fireEvent.click(getByRole('button', { name: idleLabel }))
    expect(onRefresh).toHaveBeenCalledTimes(1)
  })

  test('renders pending label and disables while pending', () => {
    const idleLabel = faker.lorem.words(2)
    const pendingLabel = faker.lorem.words(3)
    const onRefresh = vi.fn()
    const { getByRole, queryByRole } = render(
      <RefreshActionButton onRefresh={onRefresh} idleLabel={idleLabel} pendingLabel={pendingLabel} isPending={true} />
    )

    const button = getByRole('button', { name: pendingLabel })
    expect(queryByRole('button', { name: idleLabel })).not.toBeInTheDocument()
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
  })
})
