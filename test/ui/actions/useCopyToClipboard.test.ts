import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'

import { useCopyToClipboard } from '../../../src/ui/actions/useCopyToClipboard'
import { UI_COPY_STATUS_COPIED, UI_COPY_STATUS_FAILED, UI_COPY_STATUS_IDLE } from '../../../src/ui/constants'

const setClipboard = (writeText: ((value: string) => Promise<void>) | undefined) => {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: writeText ? { writeText } : undefined,
  })
}

const setExecCommand = (execCommand: (() => boolean) | undefined) => {
  Object.defineProperty(document, 'execCommand', {
    configurable: true,
    value: execCommand,
  })
}

afterEach(() => {
  setClipboard(undefined)
  setExecCommand(undefined)
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe('useCopyToClipboard', () => {
  test('copies via the async clipboard API and reports copied status', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    setClipboard(writeText)

    const { result } = renderHook(() => useCopyToClipboard())

    let outcome = false
    await act(async () => {
      outcome = await result.current.copy('secret-key')
    })

    expect(outcome).toBe(true)
    expect(writeText).toHaveBeenCalledWith('secret-key')
    expect(result.current.status).toBe(UI_COPY_STATUS_COPIED)
  })

  test('falls back to execCommand when the clipboard API is unavailable', async () => {
    setClipboard(undefined)
    const execCommand = vi.fn().mockReturnValue(true)
    setExecCommand(execCommand)

    const { result } = renderHook(() => useCopyToClipboard())

    let outcome = false
    await act(async () => {
      outcome = await result.current.copy('fallback-value')
    })

    expect(outcome).toBe(true)
    expect(execCommand).toHaveBeenCalledWith('copy')
    expect(result.current.status).toBe(UI_COPY_STATUS_COPIED)
  })

  test('reports failed status when no copy mechanism succeeds', async () => {
    setClipboard(undefined)
    setExecCommand(vi.fn().mockReturnValue(false))

    const { result } = renderHook(() => useCopyToClipboard())

    let outcome = true
    await act(async () => {
      outcome = await result.current.copy('unreachable')
    })

    expect(outcome).toBe(false)
    expect(result.current.status).toBe(UI_COPY_STATUS_FAILED)
  })

  test('reports failed status when execCommand throws', async () => {
    setClipboard(undefined)
    setExecCommand(
      vi.fn(() => {
        throw new Error('execCommand unavailable')
      })
    )

    const { result } = renderHook(() => useCopyToClipboard())

    let outcome = true
    await act(async () => {
      outcome = await result.current.copy('value')
    })

    expect(outcome).toBe(false)
    expect(result.current.status).toBe(UI_COPY_STATUS_FAILED)
  })

  test('recovers from a rejected clipboard write by using execCommand', async () => {
    setClipboard(vi.fn().mockRejectedValue(new Error('denied')))
    const execCommand = vi.fn().mockReturnValue(true)
    setExecCommand(execCommand)

    const { result } = renderHook(() => useCopyToClipboard())

    let outcome = false
    await act(async () => {
      outcome = await result.current.copy('value')
    })

    expect(outcome).toBe(true)
    expect(execCommand).toHaveBeenCalledWith('copy')
  })

  test('resets status to idle after the feedback window elapses', async () => {
    vi.useFakeTimers()
    setClipboard(vi.fn().mockResolvedValue(undefined))

    const { result } = renderHook(() => useCopyToClipboard({ resetMs: 500 }))

    await act(async () => {
      await result.current.copy('value')
    })
    expect(result.current.status).toBe(UI_COPY_STATUS_COPIED)

    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(result.current.status).toBe(UI_COPY_STATUS_IDLE)
  })

  test('reset returns status to idle immediately', async () => {
    setClipboard(vi.fn().mockResolvedValue(undefined))

    const { result } = renderHook(() => useCopyToClipboard())

    await act(async () => {
      await result.current.copy('value')
    })
    expect(result.current.status).toBe(UI_COPY_STATUS_COPIED)

    act(() => {
      result.current.reset()
    })
    expect(result.current.status).toBe(UI_COPY_STATUS_IDLE)
  })
})
