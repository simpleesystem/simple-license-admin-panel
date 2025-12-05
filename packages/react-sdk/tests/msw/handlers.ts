/**
 * MSW Handlers for API Mocking
 * Zero hardcoded values - all from constants
 */

import { HttpResponse, http } from 'msw'
import { API_ENDPOINT_ADMIN_LICENSES_LIST } from '@/constants'
import { TEST_BASE_URL } from '../constants'
import { createLicense } from '../factories/license'

// Base URL for MSW handlers
const API_BASE = TEST_BASE_URL

export const handlers = [
  // Public API - License Activation
  http.post(`${API_BASE}/api/v1/licenses/activate`, async () => {
    const license = createLicense()
    return HttpResponse.json({
      success: true,
      data: {
        license,
        activation: {
          id: 'activation-123',
          licenseKey: license.licenseKey,
          domain: license.domain,
          status: 'ACTIVE',
          activatedAt: new Date().toISOString(),
        },
      },
    })
  }),

  // Public API - License Validation
  http.post(`${API_BASE}/api/v1/licenses/validate`, async () => {
    const license = createLicense()
    return HttpResponse.json({
      success: true,
      data: {
        license,
      },
    })
  }),

  // Public API - Get License Data
  http.get(`${API_BASE}/api/v1/licenses/:key`, async ({ params }) => {
    const license = createLicense({ licenseKey: params.key as string })
    return HttpResponse.json({
      success: true,
      data: {
        license,
      },
    })
  }),

  // Admin API - List Licenses
  http.get(`${API_BASE}${API_ENDPOINT_ADMIN_LICENSES_LIST}`, async () => {
    const licenses = [createLicense(), createLicense()]
    return HttpResponse.json({
      success: true,
      data: {
        licenses,
      },
      pagination: {
        page: 1,
        limit: 10,
        total: licenses.length,
        totalPages: 1,
      },
    })
  }),

  // Auth - Login
  http.post(`${API_BASE}/api/v1/auth/login`, async () => {
    return HttpResponse.json({
      success: true,
      data: {
        token: 'test-token',
        token_type: 'Bearer',
        expires_in: 3600,
        user: {
          id: 'user-123',
          username: 'testuser',
          email: 'test@example.com',
        },
      },
    })
  }),
]
