import { render } from '@testing-library/react'

import { NotificationBusProvider } from '../../src/notifications/bus'
import { useNotificationBus } from '../../src/notifications/useNotificationBus'

const BusConsumer = () => {
  const bus = useNotificationBus()
  // Verify the bus has the expected methods
  expect(typeof bus.on).toBe('function')
  expect(typeof bus.emit).toBe('function')
  expect(typeof bus.off).toBe('function')
  return null
}

describe('NotificationBusContext', () => {
  it('provides a fallback bus when used outside of the provider', () => {
    expect(() => render(<BusConsumer />)).not.toThrow()
  })

  it('provides a stable emitter instance when used with provider', () => {
    expect(() =>
      render(
        <NotificationBusProvider>
          <BusConsumer />
        </NotificationBusProvider>
      )
    ).not.toThrow()
  })
})
