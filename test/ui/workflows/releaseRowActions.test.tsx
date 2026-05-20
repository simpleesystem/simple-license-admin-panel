import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { NOTIFICATION_EVENT_TOAST, NOTIFICATION_VARIANT_ERROR } from '../../../src/app/constants'
import {
  UI_RELEASE_ACTION_DOWNLOAD,
  UI_RELEASE_DOWNLOAD_ERROR_GENERIC,
  UI_RELEASE_DOWNLOAD_ERROR_MISSING,
} from '../../../src/ui/constants'
import { ReleaseRowActions } from '../../../src/ui/workflows/ReleaseRowActions'

const usePromoteReleaseMock = vi.hoisted(() => vi.fn())
const useDeleteReleaseMock = vi.hoisted(() => vi.fn())
const notificationBusEmitMock = vi.hoisted(() => vi.fn())

vi.mock('../../../src/simpleLicense/hooks', () => ({
  usePromoteRelease: usePromoteReleaseMock,
  useDeleteRelease: useDeleteReleaseMock,
}))

vi.mock('../../../src/notifications/useNotificationBus', () => ({
  useNotificationBus: () => ({
    emit: notificationBusEmitMock,
  }),
}))

const mockMutation = () => ({
  mutate: vi.fn(),
  isPending: false,
})

const createMockClient = () => ({
  getToken: vi.fn(() => 'token-1'),
})

describe('ReleaseRowActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    usePromoteReleaseMock.mockReturnValue(mockMutation())
    useDeleteReleaseMock.mockReturnValue(mockMutation())
    vi.stubGlobal('fetch', vi.fn())
  })

  test('shows missing-file toast when download returns not found', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({
        success: false,
        error: { message: 'Release file not found' },
      }),
    } as Response)

    render(
      <ReleaseRowActions
        client={createMockClient() as never}
        productId="product-1"
        releaseId="release-1"
        releaseVersion="1.0.0"
        releaseFileName="release.zip"
        downloadUrl="https://example.com/download"
        isPromoted={false}
        allowPromote={false}
        allowDelete={false}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: `${UI_RELEASE_ACTION_DOWNLOAD} 1.0.0` }))

    await waitFor(() =>
      expect(notificationBusEmitMock).toHaveBeenCalledWith(NOTIFICATION_EVENT_TOAST, {
        titleKey: UI_RELEASE_DOWNLOAD_ERROR_GENERIC,
        message: UI_RELEASE_DOWNLOAD_ERROR_MISSING,
        variant: NOTIFICATION_VARIANT_ERROR,
      })
    )
  })

  test('downloads file when backend returns success', async () => {
    const blobValue = new Blob(['zip'])
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      blob: async () => blobValue,
    } as Response)
    const createObjectUrlMock = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test')
    const revokeObjectUrlMock = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
    const appendChildSpy = vi.spyOn(document.body, 'appendChild')
    const removeChildSpy = vi.spyOn(document.body, 'removeChild')

    render(
      <ReleaseRowActions
        client={createMockClient() as never}
        productId="product-1"
        releaseId="release-1"
        releaseVersion="1.0.0"
        releaseFileName="release.zip"
        downloadUrl="https://example.com/download"
        isPromoted={false}
        allowPromote={false}
        allowDelete={false}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: `${UI_RELEASE_ACTION_DOWNLOAD} 1.0.0` }))

    await waitFor(() => expect(createObjectUrlMock).toHaveBeenCalledWith(blobValue))
    expect(appendChildSpy).toHaveBeenCalled()
    expect(removeChildSpy).toHaveBeenCalled()
    expect(revokeObjectUrlMock).toHaveBeenCalledWith('blob:test')
    expect(notificationBusEmitMock).not.toHaveBeenCalled()
  })
})
