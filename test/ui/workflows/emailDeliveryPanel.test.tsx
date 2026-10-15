import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuth } from '@/app/auth/useAuth'
import type { Client } from '@/simpleLicense'
import { EmailDeliveryPanel } from '@/ui/workflows/EmailDeliveryPanel'
import {
  UI_EMAIL_ACCEPTED,
  UI_EMAIL_REFUSED,
  UI_EMAIL_SEND,
  UI_EMAIL_TITLE,
  UI_EMAIL_UNKNOWN,
} from '@/ui/workflows/emailDeliveryCopy'
import { buildEmailResult, buildEmailStatus } from '../../factories/emailFactory'
import { buildUser } from '../../factories/userFactory'

vi.mock('@/app/auth/useAuth')
const status = vi.fn()
const send = vi.fn()
const user = buildUser()
const api = { getEmailDeliveryStatus: status, sendEmailDeliveryTest: send } as unknown as Client
const mount = () =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { mutations: { retry: 3, retryDelay: 0 } } })}>
      <EmailDeliveryPanel client={api} />
    </QueryClientProvider>
  )
beforeEach(() => {
  vi.mocked(useAuth).mockReturnValue({ currentUser: user } as ReturnType<typeof useAuth>)
  status.mockResolvedValue(buildEmailStatus())
  send.mockResolvedValue(buildEmailResult())
})
describe('Email delivery panel', () => {
  it.each([
    'VENDOR_ADMIN',
    'VENDOR_MANAGER',
    'VIEWER',
    'API_READ_ONLY',
  ] as const)('does not show or fetch system email controls for %s', (role) => {
    vi.mocked(useAuth).mockReturnValue({ currentUser: buildUser({ role }) } as ReturnType<typeof useAuth>)
    mount()
    expect(screen.queryByText(UI_EMAIL_TITLE)).not.toBeInTheDocument()
    expect(status).not.toHaveBeenCalled()
    expect(send).not.toHaveBeenCalled()
  })
  it.each([
    'ADMIN',
    'SUPERUSER',
  ] as const)('loads status for %s without sending until a deliberate click', async (role) => {
    vi.mocked(useAuth).mockReturnValue({ currentUser: buildUser({ role }) } as ReturnType<typeof useAuth>)
    mount()
    await waitFor(() => expect(screen.getByRole('button', { name: UI_EMAIL_SEND })).toBeEnabled())
    expect(send).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: UI_EMAIL_SEND }))
    expect(await screen.findByText(UI_EMAIL_ACCEPTED)).toBeInTheDocument()
    expect(send).toHaveBeenCalledExactlyOnceWith()
  })
  it('shows the current account recipient and no editable recipient field', async () => {
    mount()
    expect(await screen.findByText(user.email, { exact: false })).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })
  it('disables sending while configuration is unavailable', async () => {
    status.mockResolvedValue(buildEmailStatus({ configured: false, code: 'email_not_configured' }))
    mount()
    expect(await screen.findByText('email_not_configured')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: UI_EMAIL_SEND })).toBeDisabled()
  })
  it('preserves the test reference and clearly separates acceptance from inbox delivery', async () => {
    const result = buildEmailResult()
    send.mockResolvedValue(result)
    mount()
    await waitFor(() => expect(screen.getByRole('button', { name: UI_EMAIL_SEND })).toBeEnabled())
    fireEvent.click(screen.getByRole('button', { name: UI_EMAIL_SEND }))
    expect(await screen.findByText(result.reference, { exact: false })).toBeInTheDocument()
    expect(screen.getByText(UI_EMAIL_ACCEPTED)).toBeInTheDocument()
  })
  it('shows ambiguous results without automatic retry or a repeat-send button', async () => {
    send.mockResolvedValue(buildEmailResult({ ok: false, code: 'unknown_send' }))
    mount()
    await waitFor(() => expect(screen.getByRole('button', { name: UI_EMAIL_SEND })).toBeEnabled())
    fireEvent.click(screen.getByRole('button', { name: UI_EMAIL_SEND }))
    expect(await screen.findByText(UI_EMAIL_UNKNOWN)).toBeInTheDocument()
    expect(screen.getByText('unknown_send')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: UI_EMAIL_SEND })).toBeDisabled()
    expect(send).toHaveBeenCalledTimes(1)
  })
  it.each([
    'quota_exceeded',
    'storage_unavailable',
    'config_invalid',
    'provider_validation_rejected',
  ])('distinguishes the stable %s refusal from an uncertain result without retrying', async (code) => {
    send.mockResolvedValue(buildEmailResult({ ok: false, code }))
    mount()
    await waitFor(() => expect(screen.getByRole('button', { name: UI_EMAIL_SEND })).toBeEnabled())
    fireEvent.click(screen.getByRole('button', { name: UI_EMAIL_SEND }))
    expect(await screen.findByText(UI_EMAIL_REFUSED)).toBeInTheDocument()
    expect(screen.getByText(code)).toBeInTheDocument()
    expect(screen.queryByText(UI_EMAIL_UNKNOWN)).not.toBeInTheDocument()
    expect(send).toHaveBeenCalledTimes(1)
  })
  it('does not retry unexpected errors through the application mutation defaults', async () => {
    send.mockRejectedValue(new Error('private diagnostic'))
    mount()
    await waitFor(() => expect(screen.getByRole('button', { name: UI_EMAIL_SEND })).toBeEnabled())
    fireEvent.click(screen.getByRole('button', { name: UI_EMAIL_SEND }))
    expect(await screen.findByText(UI_EMAIL_UNKNOWN)).toBeInTheDocument()
    expect(screen.queryByText('private diagnostic')).not.toBeInTheDocument()
    expect(send).toHaveBeenCalledTimes(1)
  })
})
