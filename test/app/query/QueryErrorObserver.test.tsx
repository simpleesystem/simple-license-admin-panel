import { render } from '@testing-library/react'
import { ApiException } from '@simple-license/react-sdk'
import { describe, expect, it, vi } from 'vitest'

import { QueryErrorObserver } from '../../../src/app/query/QueryErrorObserver'
import {
  createQueryEventBus,
  publishQueryError,
} from '../../../src/app/query/events'
import { NOTIFICATION_EVENT_TOAST } from '../../../src/app/constants'
import { NotificationBusContext } from '../../../src/notifications/busContext'

describe('QueryErrorObserver', () => {
  it('converts query error events into toast notifications', () => {
    const queryEvents = createQueryEventBus()
    const emit = vi.fn()
    const bus = {
      emit,
      on: vi.fn(),
      off: vi.fn(),
      all: new Map(),
    }

    render(
      <NotificationBusContext.Provider value={bus}>
        <QueryErrorObserver queryEvents={queryEvents} />
      </NotificationBusContext.Provider>,
    )

    const queryError = new ApiException('Request failed', 'QUERY_ERROR')
    publishQueryError(queryEvents, queryError)

    expect(emit).toHaveBeenCalledWith(
      NOTIFICATION_EVENT_TOAST,
      expect.objectContaining({
        titleKey: 'QUERY_ERROR',
      }),
    )
  })
})

















