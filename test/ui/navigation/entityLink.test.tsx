import { fireEvent, render } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import { UI_ENTITY_LINK_ICON, UI_TEST_ID_ENTITY_LINK } from '../../../src/ui/constants'
import { EntityLink } from '../../../src/ui/navigation/EntityLink'

describe('EntityLink', () => {
  test('renders an anchor with label, href and trailing affordance icon', () => {
    const { getByTestId, getByText } = render(<EntityLink label="Acme product" href="/products" />)

    const link = getByTestId(UI_TEST_ID_ENTITY_LINK)
    expect(link).toHaveAttribute('href', '/products')
    expect(getByText('Acme product')).toBeInTheDocument()
    expect(link).toHaveTextContent(UI_ENTITY_LINK_ICON)
  })

  test('invokes onActivate for a plain primary click instead of navigating', () => {
    const onActivate = vi.fn()
    const { getByTestId } = render(<EntityLink label="x" href="/products" onActivate={onActivate} />)

    fireEvent.click(getByTestId(UI_TEST_ID_ENTITY_LINK))

    expect(onActivate).toHaveBeenCalledTimes(1)
  })

  test('preserves native open-in-new-tab behaviour for modifier clicks', () => {
    const onActivate = vi.fn()
    const { getByTestId } = render(<EntityLink label="x" href="/products" onActivate={onActivate} />)

    fireEvent.click(getByTestId(UI_TEST_ID_ENTITY_LINK), { metaKey: true })

    expect(onActivate).not.toHaveBeenCalled()
  })

  test('omits the trailing icon when showIcon is false', () => {
    const { getByTestId } = render(<EntityLink label="bare" href="/x" showIcon={false} />)

    expect(getByTestId(UI_TEST_ID_ENTITY_LINK)).not.toHaveTextContent(UI_ENTITY_LINK_ICON)
  })

  test('navigates natively without preventing default when no onActivate is provided', () => {
    const { getByTestId } = render(<EntityLink label="plain" href="/products" />)

    const notCancelled = fireEvent.click(getByTestId(UI_TEST_ID_ENTITY_LINK))

    expect(notCancelled).toBe(true)
  })

  test('renders an untruncated label when truncate is disabled', () => {
    const { getByText } = render(<EntityLink label="full label" href="/x" truncate={false} />)

    expect(getByText('full label')).not.toHaveAttribute('class')
  })

  test('omits the href attribute when no destination is provided', () => {
    const onActivate = vi.fn()
    const { getByTestId } = render(<EntityLink label="action only" onActivate={onActivate} />)

    expect(getByTestId(UI_TEST_ID_ENTITY_LINK)).not.toHaveAttribute('href')
  })
})
