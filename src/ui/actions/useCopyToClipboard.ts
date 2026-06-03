import { useCallback, useEffect, useRef, useState } from 'react'

import {
  UI_COPY_FEEDBACK_RESET_MS,
  UI_COPY_STATUS_COPIED,
  UI_COPY_STATUS_FAILED,
  UI_COPY_STATUS_IDLE,
} from '../constants'

export type CopyStatus = typeof UI_COPY_STATUS_IDLE | typeof UI_COPY_STATUS_COPIED | typeof UI_COPY_STATUS_FAILED

type UseCopyToClipboardOptions = {
  resetMs?: number
}

type UseCopyToClipboardResult = {
  status: CopyStatus
  copy: (value: string) => Promise<boolean>
  reset: () => void
}

const writeViaClipboardApi = async (value: string): Promise<boolean> => {
  const clipboard = typeof navigator !== 'undefined' ? navigator.clipboard : undefined
  if (!clipboard || typeof clipboard.writeText !== 'function') {
    return false
  }
  try {
    await clipboard.writeText(value)
    return true
  } catch {
    return false
  }
}

const writeViaExecCommand = (value: string): boolean => {
  if (typeof document === 'undefined' || typeof document.execCommand !== 'function') {
    return false
  }
  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'absolute'
  textarea.style.left = '-9999px'
  document.body.appendChild(textarea)
  textarea.select()
  let copied = false
  try {
    copied = document.execCommand('copy')
  } catch {
    copied = false
  } finally {
    document.body.removeChild(textarea)
  }
  return copied
}

export function useCopyToClipboard(options?: UseCopyToClipboardOptions): UseCopyToClipboardResult {
  const resetMs = options?.resetMs ?? UI_COPY_FEEDBACK_RESET_MS
  const [status, setStatus] = useState<CopyStatus>(UI_COPY_STATUS_IDLE)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearPendingTimeout = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const reset = useCallback(() => {
    clearPendingTimeout()
    setStatus(UI_COPY_STATUS_IDLE)
  }, [clearPendingTimeout])

  const scheduleReset = useCallback(() => {
    clearPendingTimeout()
    timeoutRef.current = setTimeout(() => {
      setStatus(UI_COPY_STATUS_IDLE)
      timeoutRef.current = null
    }, resetMs)
  }, [clearPendingTimeout, resetMs])

  const copy = useCallback(
    async (value: string): Promise<boolean> => {
      const succeeded = (await writeViaClipboardApi(value)) || writeViaExecCommand(value)
      setStatus(succeeded ? UI_COPY_STATUS_COPIED : UI_COPY_STATUS_FAILED)
      scheduleReset()
      return succeeded
    },
    [scheduleReset]
  )

  useEffect(() => clearPendingTimeout, [clearPendingTimeout])

  return { status, copy, reset }
}
