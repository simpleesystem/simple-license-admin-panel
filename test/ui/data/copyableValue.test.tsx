import { render } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import {
  UI_CLASS_COPYABLE_VALUE_MONOSPACE,
  UI_CLASS_COPYABLE_VALUE_TEXT,
  UI_TEST_ID_COPY_BUTTON,
  UI_TEST_ID_COPYABLE_VALUE,
  UI_VALUE_PLACEHOLDER,
} from '../../../src/ui/constants'
import { CopyableValue } from '../../../src/ui/data/CopyableValue'

describe('CopyableValue', () => {
  test('renders the value alongside a copy action', () => {
    const { getByTestId, getByText } = render(<CopyableValue value="LIC-123" label="license key" />)

    expect(getByTestId(UI_TEST_ID_COPYABLE_VALUE)).toBeInTheDocument()
    expect(getByText('LIC-123')).toBeInTheDocument()
    expect(getByTestId(UI_TEST_ID_COPY_BUTTON)).toBeInTheDocument()
  })

  test('renders a placeholder without a copy action when the value is empty', () => {
    const { getByText, queryByTestId } = render(<CopyableValue value={null} />)

    expect(getByText(UI_VALUE_PLACEHOLDER)).toBeInTheDocument()
    expect(queryByTestId(UI_TEST_ID_COPY_BUTTON)).toBeNull()
  })

  test('applies monospace and truncation styling when requested', () => {
    const { getByText } = render(<CopyableValue value="abcdef" monospace={true} truncate={true} />)

    const text = getByText('abcdef')
    expect(text).toHaveClass(UI_CLASS_COPYABLE_VALUE_MONOSPACE, { exact: false })
    expect(text).toHaveClass(UI_CLASS_COPYABLE_VALUE_TEXT, { exact: false })
  })

  test('renders a custom display node while still copying the raw value', () => {
    const { getByText, getByTestId } = render(<CopyableValue value="raw-value" display={<strong>shown</strong>} />)

    expect(getByText('shown')).toBeInTheDocument()
    expect(getByTestId(UI_TEST_ID_COPY_BUTTON)).toBeInTheDocument()
  })
})
