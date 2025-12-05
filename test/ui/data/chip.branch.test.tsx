import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { UI_ARIA_LABEL_REMOVE_CHIP, UI_TAG_VARIANT_NEUTRAL } from '../../../src/ui/constants'
import { Chip } from '../../../src/ui/data/Chip'

describe('Chip branch coverage', () => {
  test('renders removable chip with default remove label', () => {
    const onRemove = vi.fn()
    render(<Chip label="Example" onRemove={onRemove} />)

    const removeButton = screen.getByLabelText(UI_ARIA_LABEL_REMOVE_CHIP)
    fireEvent.click(removeButton)

    expect(removeButton).toBeInTheDocument()
    expect(onRemove).toHaveBeenCalled()
  })

  test('renders non-removable chip and uses provided variant', () => {
    render(<Chip label="Static" variant={UI_TAG_VARIANT_NEUTRAL} />)

    expect(screen.getByText('Static')).toBeInTheDocument()
    expect(screen.queryByLabelText(UI_ARIA_LABEL_REMOVE_CHIP)).toBeNull()
  })
})
