import { render, screen, waitFor } from '@testing-library/react'
import { useEffect } from 'react'
import { vi } from 'vitest'
import { AppProviders } from '../../src/app/AppProviders'
import {
  APP_BRAND_NAME,
  I18N_KEY_APP_BRAND,
  I18N_KEY_APP_ERROR_TITLE,
  I18N_KEY_APP_TAGLINE,
  I18N_KEY_DASHBOARD_HEADING,
  NOTIFICATION_EVENT_TOAST,
  NOTIFICATION_VARIANT_ERROR,
  NOTIFICATION_VARIANT_INFO,
  NOTIFICATION_VARIANT_SUCCESS,
  NOTIFICATION_VARIANT_WARNING,
  STORAGE_KEY_AUTH_EXPIRY,
  STORAGE_KEY_AUTH_TOKEN,
  STORAGE_KEY_AUTH_USER,
} from '../../src/app/constants'
import { i18nResources } from '../../src/app/i18n/resources'
import { useNotificationBus } from '../../src/notifications/useNotificationBus'

const DASHBOARD_HEADING = i18nResources.common[I18N_KEY_DASHBOARD_HEADING]
const ERROR_TITLE_TEXT = i18nResources.common[I18N_KEY_APP_ERROR_TITLE]
const BRAND_TEXT = i18nResources.common[I18N_KEY_APP_BRAND]
const TAGLINE_TEXT = i18nResources.common[I18N_KEY_APP_TAGLINE]
const TEST_TOAST_ID = 'test-toast' as const
const TEST_ERROR_TOKEN = 'test-error' as const
const TOKEN_EXPIRY_BUFFER_MS = 60_000
const STORED_USER = JSON.stringify({
  id: 'test-user',
  username: 'test-user',
  email: 'test@example.com',
  role: 'SUPERUSER',
})

type NotificationTesterProps = {
  titleKey?: string
  descriptionKey?: string
  variant?: typeof NOTIFICATION_VARIANT_INFO | typeof NOTIFICATION_VARIANT_SUCCESS | typeof NOTIFICATION_VARIANT_WARNING
}

const NotificationTester = ({
  titleKey = I18N_KEY_APP_BRAND,
  descriptionKey,
  variant = NOTIFICATION_VARIANT_INFO,
}: NotificationTesterProps): null => {
  const bus = useNotificationBus()

  useEffect(() => {
    bus.emit(NOTIFICATION_EVENT_TOAST, {
      id: TEST_TOAST_ID,
      titleKey,
      descriptionKey,
      variant,
    })
  }, [bus, titleKey, descriptionKey, variant])

  return null
}

const ErrorThrower = (): never => {
  throw new Error(TEST_ERROR_TOKEN)
}

const simulateLogin = () => {
  window.localStorage.setItem(STORAGE_KEY_AUTH_TOKEN, 'test-token')
  window.localStorage.setItem(STORAGE_KEY_AUTH_EXPIRY, `${Date.now() + TOKEN_EXPIRY_BUFFER_MS}`)
  window.localStorage.setItem(STORAGE_KEY_AUTH_USER, STORED_USER)
}

describe('AppProviders', () => {
  const originalConsoleError = console.error

  beforeAll(() => {
    vi.spyOn(console, 'error').mockImplementation((...args) => {
      if (args.some((arg) => typeof arg === 'string' && arg.includes(TEST_ERROR_TOKEN))) {
        return
      }
      originalConsoleError(...args)
    })
  })

  beforeEach(() => {
    window.localStorage.clear()
    simulateLogin()
  })

  afterAll(() => {
    console.error = originalConsoleError
  })

  it('renders the dashboard heading by default', async () => {
    render(<AppProviders />)

    await screen.findByText(DASHBOARD_HEADING)
  })

  it('renders the error fallback when a child throws', async () => {
    render(
      <AppProviders>
        <ErrorThrower />
      </AppProviders>
    )

    await screen.findByText(ERROR_TITLE_TEXT)
  })

  it('renders toasts when notification events are published', async () => {
    render(
      <AppProviders>
        <NotificationTester />
      </AppProviders>
    )

    await waitFor(() => {
      expect(screen.getByText(BRAND_TEXT ?? APP_BRAND_NAME)).toBeInTheDocument()
    })
  })

  it('renders success toasts for success events', async () => {
    render(
      <AppProviders>
        <NotificationTester titleKey={I18N_KEY_APP_TAGLINE} variant={NOTIFICATION_VARIANT_SUCCESS} />
      </AppProviders>
    )

    await waitFor(() => {
      expect(screen.getByText(TAGLINE_TEXT)).toBeInTheDocument()
    })
  })

  it('renders warning toasts with descriptions', async () => {
    render(
      <AppProviders>
        <NotificationTester
          titleKey={I18N_KEY_APP_BRAND}
          descriptionKey={I18N_KEY_APP_TAGLINE}
          variant={NOTIFICATION_VARIANT_WARNING}
        />
      </AppProviders>
    )

    expect(
      await screen.findByText((content) => typeof content === 'string' && content.includes(TAGLINE_TEXT))
    ).toBeInTheDocument()
  })

  it('renders error toasts for error events', async () => {
    render(
      <AppProviders>
        <NotificationTester variant={NOTIFICATION_VARIANT_ERROR} />
      </AppProviders>
    )

    await waitFor(() => {
      expect(screen.getByText(BRAND_TEXT ?? APP_BRAND_NAME)).toBeInTheDocument()
    })
  })
})
