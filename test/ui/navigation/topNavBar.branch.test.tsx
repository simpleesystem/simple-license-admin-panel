import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import { UI_CLASS_INLINE_GAP, UI_TEST_ID_TOP_NAV } from '../../../src/ui/constants'
import { TopNavBar } from '../../../src/ui/navigation/TopNavBar'

describe('TopNavBar branch coverage', () => {
  test('renders brand, navigation, and actions when provided', () => {
    render(<TopNavBar brand="Brand" navigation={<nav>Links</nav>} actions={<button type="button">Action</button>} />)

    expect(screen.getByTestId(UI_TEST_ID_TOP_NAV)).toBeInTheDocument()
    expect(screen.getByText('Brand')).toBeInTheDocument()
    expect(screen.getByText('Links')).toBeInTheDocument()
    expect(screen.getByText('Action')).toBeInTheDocument()
  })

  test('renders without brand and retains layout classes', () => {
    render(<TopNavBar navigation={<span>OnlyNav</span>} actions={<span>OnlyAction</span>} />)

    const navWrapper = screen.getByText('OnlyNav').parentElement as HTMLElement
    const actionsWrapper = screen.getByText('OnlyAction').parentElement as HTMLElement
    const tokens = UI_CLASS_INLINE_GAP.split(' ')

    for (const token of tokens) {
      expect(navWrapper.classList.contains(token)).toBe(true)
      expect(actionsWrapper.classList.contains(token)).toBe(true)
    }
    expect(screen.queryByText('Brand')).toBeNull()
  })
})
