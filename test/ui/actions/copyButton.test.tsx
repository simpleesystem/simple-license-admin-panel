import { fireEvent, render } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'

import { CopyButton } from '../../../src/ui/actions/CopyButton'
import {
  UI_COPY_LABEL_COPIED,
  UI_COPY_LABEL_FAILED,
  UI_COPY_LABEL_IDLE,
  UI_TEST_ID_COPY_BUTTON,
} from '../../../src/ui/constants'

const setClipboard = (writeText: ((value: string) => Promise<void>) | undefined) => {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: writeText ? { writeText } : undefined,
  })
}

const setExecCommand = (impl: (() => boolean) | undefined) => {
  Object.defineProperty(document, 'execCommand', {
    configurable: true,
    value: impl,
  })
}

afterEach(() => {
  setClipboard(undefined)
  setExecCommand(undefined)
  vi.restoreAllMocks()
})

describe('CopyButton', () => {
  test('renders an accessible copy action that names the value', () => {
    const { getByRole } = render(<CopyButton value="abc" label="license key" />)

    expect(getByRole('button', { name: `${UI_COPY_LABEL_IDLE} license key` })).toBeInTheDocument()
  })

  test('copies the value and surfaces copied feedback', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    setClipboard(writeText)

    const { getByTestId, findByRole } = render(<CopyButton value="copy-me" label="token" />)

    fireEvent.click(getByTestId(UI_TEST_ID_COPY_BUTTON))

    expect(writeText).toHaveBeenCalledWith('copy-me')
    expect(await findByRole('button', { name: UI_COPY_LABEL_COPIED })).toBeInTheDocument()
  })

  test('surfaces failed feedback when no copy mechanism succeeds', async () => {
    setClipboard(undefined)
    setExecCommand(() => false)

    const { getByTestId, findByRole } = render(<CopyButton value="cannot-copy" label="token" />)

    fireEvent.click(getByTestId(UI_TEST_ID_COPY_BUTTON))

    expect(await findByRole('button', { name: UI_COPY_LABEL_FAILED })).toBeInTheDocument()
  })

  test('disables the action when there is no value to copy', () => {
    const { getByTestId } = render(<CopyButton value="" />)

    expect(getByTestId(UI_TEST_ID_COPY_BUTTON)).toBeDisabled()
  })
})
