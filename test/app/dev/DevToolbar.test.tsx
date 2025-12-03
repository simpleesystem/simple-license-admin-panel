import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { DevToolbar } from '@/app/dev/DevToolbar'
import { TEST_ID_DEV_TOOLBAR } from '@/app/constants'
import { applyDevPersona, clearDevPersona, canUseDevTools, DEV_PERSONA_KEYS } from '@/app/dev/devScenarios'
import { useFeatureFlag } from '@/app/config'

vi.mock('@/app/config', () => ({
  useFeatureFlag: vi.fn(),
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('@/app/dev/devScenarios', async () => {
  const actual = await vi.importActual<typeof import('@/app/dev/devScenarios')>('@/app/dev/devScenarios')
  return {
    ...actual,
    canUseDevTools: vi.fn(() => true),
    applyDevPersona: vi.fn(),
    clearDevPersona: vi.fn(),
  }
})

const mockUseFeatureFlag = vi.mocked(useFeatureFlag)
const mockCanUseDevTools = vi.mocked(canUseDevTools)
const mockApplyDevPersona = vi.mocked(applyDevPersona)
const mockClearDevPersona = vi.mocked(clearDevPersona)

describe('DevToolbar', () => {
  it('does not render when dev tools are disabled', () => {
    mockUseFeatureFlag.mockReturnValue(false)
    mockCanUseDevTools.mockReturnValue(false)

    const { queryByTestId } = render(<DevToolbar />)

    expect(queryByTestId(TEST_ID_DEV_TOOLBAR)).toBeNull()
  })

  it('renders persona buttons and triggers actions when enabled', () => {
    mockUseFeatureFlag.mockReturnValue(true)
    mockCanUseDevTools.mockReturnValue(true)
    mockApplyDevPersona.mockClear()
    mockClearDevPersona.mockClear()

    const { getByTestId, getByText } = render(<DevToolbar />)
    const toolbar = getByTestId(TEST_ID_DEV_TOOLBAR)

    expect(toolbar).toBeInTheDocument()
    DEV_PERSONA_KEYS.forEach((persona) => {
      fireEvent.click(getByText(persona))
    })
    fireEvent.click(getByText('dev.toolbar.reset'))

    expect(mockApplyDevPersona).toHaveBeenCalledTimes(DEV_PERSONA_KEYS.length)
    expect(mockClearDevPersona).toHaveBeenCalledTimes(1)
  })
})


