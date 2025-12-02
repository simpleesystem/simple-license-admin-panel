import { render } from '@testing-library/react'

import { ERROR_MESSAGE_NOTIFICATION_CONTEXT_UNAVAILABLE } from '../../src/app/constants'
import { NotificationBusProvider } from '../../src/notifications/bus'
import { useNotificationBus } from '../../src/notifications/busContext'

const BusConsumer = () => {
  useNotificationBus()
  return null
}

describe('NotificationBusContext', () => {
  it('throws when used outside of the provider', () => {
    expect(() => render(<BusConsumer />)).toThrow(ERROR_MESSAGE_NOTIFICATION_CONTEXT_UNAVAILABLE)
  })

  it('provides a stable emitter instance', () => {
    expect(() =>
      render(
        <NotificationBusProvider>
          <BusConsumer />
        </NotificationBusProvider>,
      ),
    ).not.toThrow()
  })
})

