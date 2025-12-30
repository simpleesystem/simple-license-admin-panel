import { faker } from '@faker-js/faker'
import { fireEvent, render } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { InlineAlert } from '../../../src/ui/feedback/InlineAlert'
import { SectionStatus } from '../../../src/ui/feedback/SectionStatus'
import {
  UI_ARIA_LABEL_SECTION_STATUS,
  UI_CLASS_INLINE_ALERT,
  UI_CLASS_SECTION_STATUS,
  UI_TEST_ID_INLINE_ALERT,
  UI_TEST_ID_SECTION_STATUS,
} from '../../../src/ui/constants'

describe('Feedback primitives', () => {
  test('InlineAlert applies alert styling', () => {
    const { getByTestId } = render(<InlineAlert variant="info">{faker.lorem.words(4)}</InlineAlert>)

    expect(getByTestId(UI_TEST_ID_INLINE_ALERT)).toHaveClass(UI_CLASS_INLINE_ALERT, { exact: false })
  })

  test('InlineAlert renders message body', () => {
    const message = faker.lorem.words(4)
    const { getByText } = render(<InlineAlert variant="info">{message}</InlineAlert>)

    expect(getByText(message)).toBeInTheDocument()
  })

  test('InlineAlert renders actions and supports dismissal', () => {
    const onClose = vi.fn()
    const actionLabel = faker.lorem.word()
    const { getByRole, getByText } = render(
      <InlineAlert variant="warning" title="Heads up" actions={<button type="button">{actionLabel}</button>} dismissible onClose={onClose}>
        {faker.lorem.sentence()}
      </InlineAlert>
    )

    fireEvent.click(getByRole('button', { name: /close/i }))

    expect(getByText(actionLabel)).toBeInTheDocument()
    expect(onClose).toHaveBeenCalled()
  })

  test('SectionStatus displays title', () => {
    const title = faker.lorem.words(2)
    const { getByTestId, getByRole } = render(
      <SectionStatus status="success" title={title} />
    )

    expect(getByTestId(UI_TEST_ID_SECTION_STATUS)).toHaveClass(UI_CLASS_SECTION_STATUS, { exact: false })
    const region = getByRole('status')
    expect(region).toHaveAttribute('aria-label', UI_ARIA_LABEL_SECTION_STATUS)
    expect(region).toHaveAttribute('aria-live', 'polite')
  })

  test('SectionStatus renders loading indicator for pending status', () => {
    const { container, getByRole } = render(<SectionStatus status="loading" title="Loading data" />)

    expect(container.querySelector('.spinner-border')).toBeInTheDocument()
    expect(getByRole('status')).toHaveAttribute('aria-busy', 'true')
  })

  test('SectionStatus renders meta helper text content', () => {
    const helper = faker.lorem.words(3)
    const timestamp = faker.date.recent().toISOString()
    const { getByText } = render(
      <SectionStatus
        status="success"
        title="Completed"
        meta={{ helperText: helper, timestamp }}
        actions={<button type="button">Acknowledge</button>}
      />
    )

    expect(getByText(helper)).toBeInTheDocument()
    expect(getByText(timestamp)).toBeInTheDocument()
    expect(getByText('Acknowledge')).toBeInTheDocument()
  })
})
