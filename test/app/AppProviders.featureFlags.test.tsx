import { render, cleanup, act } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const enableQueryCachePersistenceMock = vi.hoisted(() => vi.fn(() => vi.fn()))
const useFeatureFlagMock = vi.hoisted(() => vi.fn(() => true))

vi.mock('../../src/app/query/persistence', () => ({
  enableQueryCachePersistence: enableQueryCachePersistenceMock,
}))

vi.mock('../../src/app/config', async () => {
  const actual = await vi.importActual<typeof import('../../src/app/config')>('../../src/app/config')
  return {
    ...actual,
    useFeatureFlag: useFeatureFlagMock,
  }
})

import { AppProviders } from '../../src/app/AppProviders'

afterEach(() => {
  cleanup()
  enableQueryCachePersistenceMock.mockClear()
})

describe('AppProviders feature flags', () => {
  it('activates query cache persistence when enabled', async () => {
    const teardownMock = vi.fn()
    enableQueryCachePersistenceMock.mockReturnValueOnce(teardownMock)
    useFeatureFlagMock.mockReturnValueOnce(true)

    let unmount: () => void = () => {}
    await act(async () => {
      ({ unmount } = render(<AppProviders />))
    })

    expect(enableQueryCachePersistenceMock).toHaveBeenCalled()

    unmount()
    expect(teardownMock).toHaveBeenCalled()
  })

  it('skips persistence when the flag is disabled', async () => {
    useFeatureFlagMock.mockReturnValueOnce(false)

    await act(async () => {
      render(<AppProviders />)
    })

    expect(enableQueryCachePersistenceMock).not.toHaveBeenCalled()
  })
})


