import { describe, expect, it, vi } from 'vitest'

import {
  createQueryEventBus,
  publishQueryError,
  QUERY_EVENT_ERROR,
  subscribeToQueryErrors,
} from '../../../src/app/query/events'

const createHandler = () => vi.fn()

describe('query events bus', () => {
  it('invokes subscribed handlers when query errors publish events', () => {
    const bus = createQueryEventBus()
    const handler = createHandler()
    subscribeToQueryErrors(bus, handler)

    const error = new Error('query failure')
    publishQueryError(bus, error)

    expect(handler).toHaveBeenCalledWith({ error })
  })

  it('stops invoking handlers after unsubscribe', () => {
    const bus = createQueryEventBus()
    const handler = createHandler()
    const unsubscribe = subscribeToQueryErrors(bus, handler)

    unsubscribe()
    publishQueryError(bus, new Error('ignored'))

    expect(handler).not.toHaveBeenCalled()
  })

  it('supports multiple handlers without interference', () => {
    const bus = createQueryEventBus()
    const first = createHandler()
    const second = createHandler()

    subscribeToQueryErrors(bus, first)
    subscribeToQueryErrors(bus, second)

    const error = new Error('shared')
    publishQueryError(bus, error)

    expect(first).toHaveBeenCalledWith({ error })
    expect(second).toHaveBeenCalledWith({ error })
  })

  it('emits raw events via mitt for advanced consumers', () => {
    const bus = createQueryEventBus()
    const spy = vi.fn()

    bus.on(QUERY_EVENT_ERROR, spy)
    const error = new Error('direct emit')
    publishQueryError(bus, error)

    expect(spy).toHaveBeenCalledWith({ error })
  })
})



















