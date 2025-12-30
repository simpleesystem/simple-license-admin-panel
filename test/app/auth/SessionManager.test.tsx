import type { ReactNode } from 'react'
import { render } from '@testing-library/react'
import mitt from 'mitt'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { SessionManager } from '../../../src/app/auth/SessionManager'
import { AuthContext } from '../../../src/app/auth/authContext'
import type { AuthContextValue } from '../../../src/app/auth/types'
import {
  I18N_KEY_SESSION_EXPIRED_TITLE,
  I18N_KEY_SESSION_WARNING_TITLE,
  NOTIFICATION_EVENT_TOAST,
  SESSION_IDLE_TIMEOUT_MS,
  SESSION_IDLE_WARNING_MS,
} from '../../../src/app/constants'
import { NotificationBusProvider } from '@/notifications/busContext'
import type { NotificationEventMap } from '@/notifications/types'
import { TrackingContext } from '../../../src/app/analytics/trackingContext'
import type { TrackingClient } from '../../../src/app/analytics/tracking'
import { TRACKING_EVENT_SESSION_TIMEOUT, TRACKING_EVENT_SESSION_WARNING } from '../../../src/app/constants'

const createAuthValue = (overrides: Partial<AuthContextValue>): AuthContextValue => ({
  token: null,
  currentUser: null,
  status: 'auth/status/idle',
  isAuthenticated: false,
  login: vi.fn(),
  logout: vi.fn(),
  refreshCurrentUser: vi.fn(),
  ...overrides,
})

const renderManager = (authOverrides: Partial<AuthContextValue> = {}) => {
  const notificationBus = mitt<NotificationEventMap>()
  const toastSpy = vi.fn()
  notificationBus.on(NOTIFICATION_EVENT_TOAST, toastSpy)
  const trackingClient: TrackingClient = {
    track: vi.fn(),
  }

  const authValue = createAuthValue(authOverrides)

  const wrapper = ({ children }: { children: ReactNode }) => (
    <TrackingContext.Provider value={trackingClient}>
      <NotificationBusProvider bus={notificationBus}>
        <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
      </NotificationBusProvider>
    </TrackingContext.Provider>
  )

  const view = render(<SessionManager />, { wrapper })

  return { toastSpy, authValue, trackingClient, unmount: view.unmount }
}

describe('SessionManager', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('emits a warning toast after the idle warning threshold', () => {
    const { toastSpy, trackingClient } = renderManager({ isAuthenticated: true })

    vi.advanceTimersByTime(SESSION_IDLE_WARNING_MS + 1)

    expect(toastSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        titleKey: I18N_KEY_SESSION_WARNING_TITLE,
      }),
    )
    expect(trackingClient.track).toHaveBeenCalledWith(TRACKING_EVENT_SESSION_WARNING)
  })

  it('logs out and notifies when the idle timeout expires', () => {
    const logout = vi.fn()
    const { toastSpy, trackingClient } = renderManager({ isAuthenticated: true, logout })

    vi.advanceTimersByTime(SESSION_IDLE_TIMEOUT_MS + 1)

    expect(logout).toHaveBeenCalled()
    expect(toastSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        titleKey: I18N_KEY_SESSION_EXPIRED_TITLE,
      }),
    )
    expect(trackingClient.track).toHaveBeenNthCalledWith(2, TRACKING_EVENT_SESSION_TIMEOUT)
  })

  it('resets timers when user activity is detected', () => {
    const { toastSpy } = renderManager({ isAuthenticated: true })

    vi.advanceTimersByTime(SESSION_IDLE_WARNING_MS - 1_000)
    window.dispatchEvent(new Event('mousemove'))
    vi.advanceTimersByTime(1_500)

    expect(toastSpy).not.toHaveBeenCalled()
  })

  it('does nothing when the user is not authenticated', () => {
    const { toastSpy, trackingClient } = renderManager({ isAuthenticated: false })

    vi.advanceTimersByTime(SESSION_IDLE_TIMEOUT_MS + 1)

    expect(toastSpy).not.toHaveBeenCalled()
    expect(trackingClient.track).not.toHaveBeenCalled()
  })
})
