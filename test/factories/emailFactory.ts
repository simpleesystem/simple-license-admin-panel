import { faker } from '@faker-js/faker'
import type { EmailDeliveryStatus, EmailTestResult } from '@/simpleLicense/email'

export const EMAIL_TEST_API_BASE = 'http://localhost:4000'
export const buildEmailStatus = (overrides: Partial<EmailDeliveryStatus> = {}): EmailDeliveryStatus => ({
  configured: true,
  transport: 'fleet',
  code: 'ready',
  ...overrides,
})
export const buildEmailResult = (overrides: Partial<EmailTestResult> = {}): Required<EmailTestResult> => ({
  ok: true,
  code: 'accepted',
  reference: faker.string.uuid(),
  requestId: faker.string.uuid(),
  ...overrides,
})
