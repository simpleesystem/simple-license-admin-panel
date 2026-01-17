import { describe, expect, it } from 'vitest'

import {
  ADMIN_SYSTEM_WS_MESSAGE_TYPE_ERROR,
  ADMIN_SYSTEM_WS_MESSAGE_TYPE_HEALTH_UPDATE,
  ADMIN_SYSTEM_WS_MESSAGE_TYPE_PING,
  ADMIN_SYSTEM_WS_MESSAGE_TYPE_PONG,
  APP_BRAND_NAME,
  LIST_DEFAULT_PAGE,
  LIST_DEFAULT_PAGE_SIZE,
  LIST_MAX_PAGE_SIZE,
} from '../../../src/app/constants'
import { parseAdminSystemServerMessage } from '../../../src/app/live/adminSystemWsProtocol'

const HEALTH_UPDATE_PAYLOAD = {
  type: ADMIN_SYSTEM_WS_MESSAGE_TYPE_HEALTH_UPDATE,
  timestamp: new Date(LIST_DEFAULT_PAGE).toISOString(),
  data: {
    system: {
      uptime: LIST_DEFAULT_PAGE,
      memory: {
        heap_used: LIST_DEFAULT_PAGE_SIZE,
        heap_total: LIST_MAX_PAGE_SIZE,
        usage_percent: LIST_DEFAULT_PAGE_SIZE,
      },
      clients_connected: LIST_DEFAULT_PAGE_SIZE,
    },
    licenses: {
      total: LIST_MAX_PAGE_SIZE,
      active: LIST_DEFAULT_PAGE,
      expired: LIST_DEFAULT_PAGE,
      demo_mode: LIST_DEFAULT_PAGE,
      customers: LIST_DEFAULT_PAGE,
      recent: LIST_DEFAULT_PAGE,
    },
    security: {
      failed_logins_last_hour: LIST_DEFAULT_PAGE,
    },
    database: {
      active_connections: LIST_DEFAULT_PAGE,
    },
  },
}

describe('parseAdminSystemServerMessage', () => {
  it('returns success when the payload is a health update', () => {
    const result = parseAdminSystemServerMessage(JSON.stringify(HEALTH_UPDATE_PAYLOAD))

    expect(result.success).toBe(true)
  })

  it('returns success when the payload is a pong', () => {
    const result = parseAdminSystemServerMessage(
      JSON.stringify({
        type: ADMIN_SYSTEM_WS_MESSAGE_TYPE_PONG,
      })
    )

    expect(result.success).toBe(true)
  })

  it('returns success when the payload is a server error', () => {
    const result = parseAdminSystemServerMessage(
      JSON.stringify({
        type: ADMIN_SYSTEM_WS_MESSAGE_TYPE_ERROR,
        message: APP_BRAND_NAME,
      })
    )

    expect(result.success).toBe(true)
  })

  it('returns failure when the payload is invalid JSON', () => {
    const result = parseAdminSystemServerMessage(APP_BRAND_NAME)

    expect(result.success).toBe(false)
  })

  it('returns failure when the payload does not match the server schema', () => {
    const result = parseAdminSystemServerMessage(
      JSON.stringify({
        type: ADMIN_SYSTEM_WS_MESSAGE_TYPE_PING,
      })
    )

    expect(result.success).toBe(false)
  })
})
