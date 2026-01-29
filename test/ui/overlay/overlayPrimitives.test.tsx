import { faker } from '@faker-js/faker'
import { fireEvent, render } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import { UI_TEST_ID_MODAL_DIALOG, UI_TEST_ID_SIDE_PANEL } from '../../../src/ui/constants'
import { ModalDialog } from '../../../src/ui/overlay/ModalDialog'
import { SidePanel } from '../../../src/ui/overlay/SidePanel'

describe('Overlay primitives', () => {
  test('ModalDialog renders when show flag is true', () => {
    const { getByTestId } = render(<ModalDialog show={true} title={faker.lorem.words(2)} onClose={() => undefined} />)

    expect(getByTestId(UI_TEST_ID_MODAL_DIALOG)).toBeInTheDocument()
  })

  test('ModalDialog renders action buttons when footer omitted', () => {
    const primaryAction = vi.fn()
    const secondaryAction = vi.fn()
    const { getByText } = render(
      <ModalDialog
        show={true}
        onClose={() => undefined}
        title="Actions"
        primaryAction={{ id: 'primary', label: 'Confirm', onClick: primaryAction }}
        secondaryAction={{ id: 'secondary', label: 'Cancel', onClick: secondaryAction }}
      />
    )

    fireEvent.click(getByText('Confirm'))
    fireEvent.click(getByText('Cancel'))

    expect(primaryAction).toHaveBeenCalled()
    expect(secondaryAction).toHaveBeenCalled()
  })

  test('ModalDialog renders custom footers and body content when provided', () => {
    const footerLabel = faker.lorem.words(2)
    const body = faker.lorem.sentence()
    const { getByText, queryByText } = render(
      <ModalDialog show={true} onClose={() => undefined} body={<p>{body}</p>} footer={<div>{footerLabel}</div>} />
    )

    expect(getByText(body)).toBeInTheDocument()
    expect(getByText(footerLabel)).toBeInTheDocument()
    expect(queryByText('Confirm')).toBeNull()
  })

  test('SidePanel renders title content', () => {
    const title = faker.lorem.words(2)
    const { getByText } = render(<SidePanel show={true} onClose={() => undefined} title={title} />)

    expect(getByText(title)).toBeInTheDocument()
  })

  test('SidePanel renders actions, footer, and supports placement variants', () => {
    const onClose = vi.fn()
    const actionLabel = faker.lorem.word()
    const footerLabel = faker.lorem.words(2)
    const { getByText, getByTestId, getByRole } = render(
      <SidePanel
        show={true}
        placement="start"
        onClose={onClose}
        title="Side Panel"
        actions={<button type="button">{actionLabel}</button>}
        footer={<div>{footerLabel}</div>}
      >
        {faker.lorem.sentence()}
      </SidePanel>
    )

    expect(getByTestId(UI_TEST_ID_SIDE_PANEL)).toHaveClass('start-0', { exact: false })
    fireEvent.click(getByText(actionLabel))
    fireEvent.click(getByRole('button', { name: /close side panel/i }))

    expect(getByText(footerLabel)).toBeInTheDocument()
    expect(onClose).toHaveBeenCalled()
    const panel = getByTestId(UI_TEST_ID_SIDE_PANEL)
    expect(panel).toHaveAttribute('aria-modal', 'true')
    expect(panel).toHaveAttribute('aria-labelledby', `${UI_TEST_ID_SIDE_PANEL}-title`)
  })

  test('SidePanel returns null when not shown and defaults to end placement', () => {
    const hidden = render(<SidePanel show={false} onClose={() => undefined} title="hidden" />)
    expect(hidden.queryByTestId(UI_TEST_ID_SIDE_PANEL)).toBeNull()

    const { getByTestId } = render(
      <SidePanel show={true} onClose={() => undefined} title="Visible" sizeClass="w-50">
        content
      </SidePanel>
    )
    const panel = getByTestId(UI_TEST_ID_SIDE_PANEL)
    expect(panel).toHaveClass('end-0', { exact: false })
    expect(panel).toHaveClass('w-50', { exact: false })
  })
})
