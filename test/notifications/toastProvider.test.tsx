import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'

import { NOTIFICATION_EVENT_TOAST, TEST_ID_NOTIFICATION_PORTAL } from '../../src/app/constants'
import { NotificationBusProvider } from '../../src/notifications/bus'
import { DEFAULT_NOTIFICATION_DURATION } from '../../src/notifications/constants'
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

function EmitEmptyMessageToastButton() {
  const bus = useNotificationBus()
  return (
    <button
      type="button"
      onClick={() =>
        bus.emit(NOTIFICATION_EVENT_TOAST, {
          id: 'toast-provider-empty-message',
          titleKey: 'test.toast.fallback',
          message: '',
          variant: 'info',
        })
      }
    >
      Emit empty-message toast
    </button>
  )
}

describe('NotificationBannerProvider', () => {
  const renderNotificationHarness = () =>
    render(
      <NotificationBusProvider>
        <EmitToastButton />
        <EmitEmptyMessageToastButton />
        <NotificationBannerProvider />
      </NotificationBusProvider>
    )

  afterEach(() => {
    document.body.classList.remove('modal-open')
    vi.useRealTimers()
  })

  test('renders toast banner container in normal layout flow', async () => {
    renderNotificationHarness()
    fireEvent.click(screen.getByRole('button', { name: /emit toast/i }))

    const portal = await screen.findByTestId(TEST_ID_NOTIFICATION_PORTAL)
    expect(portal).toBeInTheDocument()
    expect(portal.className).not.toContain('position-fixed')
  })

  test('dismisses toast on schedule even when a modal is open', async () => {
    vi.useFakeTimers()
    renderNotificationHarness()
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /emit toast/i }))
    })

    expect(screen.getByText('Modal safe toast')).toBeInTheDocument()
    document.body.classList.add('modal-open')

    act(() => {
      vi.advanceTimersByTime(DEFAULT_NOTIFICATION_DURATION + 10)
    })

    expect(screen.queryByText('Modal safe toast')).toBeNull()
  })

  test('de-duplicates repeated toasts that share the same id', async () => {
    renderNotificationHarness()
    fireEvent.click(screen.getByRole('button', { name: /emit toast/i }))
    fireEvent.click(screen.getByRole('button', { name: /emit toast/i }))

    const renderedToasts = await screen.findAllByText('Modal safe toast')
    expect(renderedToasts).toHaveLength(1)
  })

  test('falls back to translated title when message is empty', async () => {
    renderNotificationHarness()
    fireEvent.click(screen.getByRole('button', { name: /emit empty-message toast/i }))

    expect(await screen.findByText('test.toast.fallback')).toBeInTheDocument()
  })

  test('allows dismissing a toast with close action', async () => {
    renderNotificationHarness()
    fireEvent.click(screen.getByRole('button', { name: /emit toast/i }))

    const closeButton = await screen.findByRole('button', { name: /close/i })
    fireEvent.click(closeButton)

    expect(screen.queryByText('Modal safe toast')).toBeNull()
  })
})
