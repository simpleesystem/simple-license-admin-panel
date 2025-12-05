import { http, HttpResponse } from 'msw'
import {
  API_ENDPOINT_ADMIN_ANALYTICS_DISTRIBUTION,
  API_ENDPOINT_ADMIN_ANALYTICS_LICENSE,
  API_ENDPOINT_ADMIN_ANALYTICS_THRESHOLDS,
  API_ENDPOINT_ADMIN_ANALYTICS_TRENDS,
  API_ENDPOINT_ADMIN_ANALYTICS_TOP_LICENSES,
  API_ENDPOINT_ADMIN_ANALYTICS_USAGE,
  API_ENDPOINT_ADMIN_AUDIT_LOGS,
  API_ENDPOINT_ADMIN_AUDIT_VERIFY,
  API_ENDPOINT_ADMIN_HEALTH,
  API_ENDPOINT_ADMIN_METRICS,
  API_ENDPOINT_ADMIN_STATS,
  API_ENDPOINT_ADMIN_STATUS,
  API_ENDPOINT_ADMIN_USERS_ME,
  API_ENDPOINT_AUTH_LOGIN,
} from '@simple-license/react-sdk'

import { AUTH_FIELD_USERNAME } from '../../src/app/constants'
import { buildUser } from '../factories/userFactory'

const MSW_FAKE_TOKEN = 'test-token' as const
const MSW_LOGIN_EXPIRATION_SECONDS = 3_600 as const

export const handlers = [
  http.post(API_ENDPOINT_AUTH_LOGIN, async ({ request }) => {
    const body = (await request.json()) as Record<string, string>
    const username = body[AUTH_FIELD_USERNAME]

    return HttpResponse.json(
      {
        token: MSW_FAKE_TOKEN,
        token_type: 'Bearer',
        expires_in: MSW_LOGIN_EXPIRATION_SECONDS,
        user: buildUser({ username }),
      },
      { status: 200 },
    )
  }),
  http.get(API_ENDPOINT_ADMIN_USERS_ME, () => {
    return HttpResponse.json(
      {
        success: true,
        data: {
          user: buildUser(),
        },
      },
      { status: 200 },
    )
  }),
  http.options(API_ENDPOINT_ADMIN_USERS_ME, () => {
    return new HttpResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }),
  http.get(API_ENDPOINT_ADMIN_STATUS, () =>
    HttpResponse.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        checks: { database: 1 },
      },
    }),
  ),
  http.options(API_ENDPOINT_ADMIN_STATUS, () => new HttpResponse(null, { status: 200 })),
  http.get(API_ENDPOINT_ADMIN_HEALTH, () =>
    HttpResponse.json({
      success: true,
      data: {
        metrics: {
          uptime: 123,
          memory: {
            rss: 1,
            heapTotal: 1,
            heapUsed: 1,
            external: 0,
          },
          cpu: {
            user: 1,
            system: 1,
          },
        },
        system: {
          uptime: 123,
          memory: {
            rss: 1,
            heap_total: 1,
            heap_used: 1,
          },
        },
        database: { active_connections: 1 },
      },
    }),
  ),
  http.options(API_ENDPOINT_ADMIN_HEALTH, () => new HttpResponse(null, { status: 200 })),
  http.get(API_ENDPOINT_ADMIN_METRICS, () =>
    HttpResponse.json({
      success: true,
      data: {
        timestamp: new Date().toISOString(),
        application: { version: '1.0.0', environment: 'test' },
        system: {
          uptime: 1,
          memory: { rss: 1, heapTotal: 1, heapUsed: 1, external: 0 },
          cpu: { user: 0, system: 0 },
        },
      },
    }),
  ),
  http.options(API_ENDPOINT_ADMIN_METRICS, () => new HttpResponse(null, { status: 200 })),
  http.get(API_ENDPOINT_ADMIN_STATS, () =>
    HttpResponse.json({ success: true, data: { stats: { active_licenses: 0, expired_licenses: 0, total_customers: 0, total_activations: 0 } } }),
  ),
  http.options(API_ENDPOINT_ADMIN_STATS, () => new HttpResponse(null, { status: 200 })),
  http.get(API_ENDPOINT_ADMIN_ANALYTICS_USAGE, () => HttpResponse.json({ success: true, data: { summaries: [] } })),
  http.options(API_ENDPOINT_ADMIN_ANALYTICS_USAGE, () => new HttpResponse(null, { status: 200 })),
  http.get(`${API_ENDPOINT_ADMIN_ANALYTICS_LICENSE}/:licenseKey`, ({ params }) =>
    HttpResponse.json({
      success: true,
      data: {
        license_key: params.licenseKey,
        stats: { activations: 0 },
        history: [],
      },
    }),
  ),
  http.options(`${API_ENDPOINT_ADMIN_ANALYTICS_LICENSE}/:licenseKey`, () => new HttpResponse(null, { status: 200 })),
  http.get(API_ENDPOINT_ADMIN_ANALYTICS_TRENDS, () =>
    HttpResponse.json({ success: true, data: { periodStart: '', periodEnd: '', groupBy: '', trends: [] } }),
  ),
  http.options(API_ENDPOINT_ADMIN_ANALYTICS_TRENDS, () => new HttpResponse(null, { status: 200 })),
  http.get(API_ENDPOINT_ADMIN_ANALYTICS_TOP_LICENSES, () => HttpResponse.json({ success: true, data: { licenses: [] } })),
  http.options(API_ENDPOINT_ADMIN_ANALYTICS_TOP_LICENSES, () => new HttpResponse(null, { status: 200 })),
  http.get(API_ENDPOINT_ADMIN_ANALYTICS_DISTRIBUTION, () => HttpResponse.json({ success: true, data: { distribution: [] } })),
  http.options(API_ENDPOINT_ADMIN_ANALYTICS_DISTRIBUTION, () => new HttpResponse(null, { status: 200 })),
  http.get(API_ENDPOINT_ADMIN_ANALYTICS_THRESHOLDS, () =>
    HttpResponse.json({
      success: true,
      data: {
        high: { activations: 10, validations: 10, concurrency: 10 },
        medium: { activations: 5, validations: 5, concurrency: 5 },
      },
    }),
  ),
  http.options(API_ENDPOINT_ADMIN_ANALYTICS_THRESHOLDS, () => new HttpResponse(null, { status: 200 })),
  http.get(API_ENDPOINT_ADMIN_AUDIT_LOGS, () =>
    HttpResponse.json({
      success: true,
      data: {
        entries: [],
      },
    }),
  ),
  http.options(API_ENDPOINT_ADMIN_AUDIT_LOGS, () => new HttpResponse(null, { status: 200 })),
  http.post(API_ENDPOINT_ADMIN_AUDIT_VERIFY, () => HttpResponse.json({ success: true, data: { verified: true } })),
  http.options(API_ENDPOINT_ADMIN_AUDIT_VERIFY, () => new HttpResponse(null, { status: 200 })),
  http.get('http://localhost:4000/ws/health', () => HttpResponse.json({ status: 'ok' })),
  http.options('http://localhost:4000/ws/health', () => new HttpResponse(null, { status: 200 })),
  http.all('http://localhost:4000/api/v1/admin/:path*', () => HttpResponse.json({ success: true, data: {} })),
]

