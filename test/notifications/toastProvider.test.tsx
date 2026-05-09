import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'

import { NOTIFICATION_EVENT_TOAST, TEST_ID_NOTIFICATION_PORTAL } from '../../src/app/constants'
import { NotificationBusProvider } from '../../src/notifications/bus'
import {
  DEFAULT_NOTIFICATION_DURATION,
  NOTIFICATION_DISMISS_RETRY_WHEN_MODAL_OPEN_MS,
  NOTIFICATION_PORTAL_Z_INDEX,
} from '../../src/notifications/constants'
import { NotificationBannerProvider } from '../../src/notifications/ToastProvider'
import { useNotificationBus } from '../../src/notifications/useNotificationBus'

function EmitToastButton() {
  const bus = useNotificationBus()
  return (
    <button
      type="button"
      onClick={() =>
        bus.emit(NOTIFICATION_EVENT_TOAST, {
          id: 'toast-provider-test',
          titleKey: 'test.toast',
          message: 'Modal safe toast',
          variant: 'info',
        })
      }
    >
      Emit toast
    </button>
  )
}

describe('NotificationBannerProvider', () => {
  const renderNotificationHarness = () =>
    render(
      <NotificationBusProvider>
        <EmitToastButton />
        <NotificationBannerProvider />
      </NotificationBusProvider>
    )

  afterEach(() => {
    document.body.classList.remove('modal-open')
    vi.useRealTimers()
  })

  test('renders toast portal above modal z-index', async () => {
    renderNotificationHarness()
    fireEvent.click(screen.getByRole('button', { name: /emit toast/i }))

    const portal = await screen.findByTestId(TEST_ID_NOTIFICATION_PORTAL)
    expect(portal).toBeInTheDocument()
    expect(portal).toHaveStyle({ zIndex: String(NOTIFICATION_PORTAL_Z_INDEX) })
  })

  test('keeps toast visible while a modal is open', async () => {
    vi.useFakeTimers()
    renderNotificationHarness()
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /emit toast/i }))
    })

    expect(screen.getByText('Modal safe toast')).toBeInTheDocument()
    document.body.classList.add('modal-open')

    act(() => {
      vi.advanceTimersByTime(DEFAULT_NOTIFICATION_DURATION + NOTIFICATION_DISMISS_RETRY_WHEN_MODAL_OPEN_MS * 2)
    })

    expect(screen.getByText('Modal safe toast')).toBeInTheDocument()

    document.body.classList.remove('modal-open')
    act(() => {
      vi.advanceTimersByTime(NOTIFICATION_DISMISS_RETRY_WHEN_MODAL_OPEN_MS + 10)
    })

    expect(screen.queryByText('Modal safe toast')).toBeNull()
  })
})
