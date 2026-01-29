import Joi from 'joi'

import {
  ADMIN_SYSTEM_WS_MESSAGE_TYPE_ERROR,
  ADMIN_SYSTEM_WS_MESSAGE_TYPE_HEALTH_UPDATE,
  ADMIN_SYSTEM_WS_MESSAGE_TYPE_PING,
  ADMIN_SYSTEM_WS_MESSAGE_TYPE_PONG,
  ADMIN_SYSTEM_WS_MESSAGE_TYPE_REQUEST_HEALTH,
  ADMIN_SYSTEM_WS_STATUS_CONNECTED,
  ADMIN_SYSTEM_WS_STATUS_CONNECTING,
  ADMIN_SYSTEM_WS_STATUS_DISCONNECTED,
  ADMIN_SYSTEM_WS_STATUS_ERROR,
} from '../constants'

const SystemMemorySchema = Joi.object({
  heap_used: Joi.number().required(),
  heap_total: Joi.number().required(),
  usage_percent: Joi.number().required(),
})

const SystemSchema = Joi.object({
  uptime: Joi.number().required(),
  memory: SystemMemorySchema.required(),
  clients_connected: Joi.number().required(),
})

const LicensesSchema = Joi.object({
  total: Joi.number().required(),
  active: Joi.number().required(),
  expired: Joi.number().required(),
  demo_mode: Joi.number().required(),
  customers: Joi.number().required(),
  recent: Joi.number().required(),
})

const SecuritySchema = Joi.object({
  failed_logins_last_hour: Joi.number().required(),
})

const DatabaseSchema = Joi.object({
  active_connections: Joi.number().required(),
})

const HealthDataSchema = Joi.object({
  system: SystemSchema.required(),
  licenses: LicensesSchema.required(),
  security: SecuritySchema.required(),
  database: DatabaseSchema.required(),
  error: Joi.string().optional(),
})

export const AdminSystemWsHealthUpdateSchema = Joi.object({
  type: Joi.string().valid(ADMIN_SYSTEM_WS_MESSAGE_TYPE_HEALTH_UPDATE).required(),
  timestamp: Joi.string().required(),
  data: HealthDataSchema.required(),
})

export const AdminSystemWsPongSchema = Joi.object({
  type: Joi.string().valid(ADMIN_SYSTEM_WS_MESSAGE_TYPE_PONG).required(),
})

export const AdminSystemWsServerErrorSchema = Joi.object({
  type: Joi.string().valid(ADMIN_SYSTEM_WS_MESSAGE_TYPE_ERROR).required(),
  message: Joi.string().required(),
})

export const AdminSystemWsServerMessageSchema = Joi.alternatives().try(
  AdminSystemWsHealthUpdateSchema,
  AdminSystemWsPongSchema,
  AdminSystemWsServerErrorSchema
)

export const AdminSystemWsClientMessageSchema = Joi.alternatives().try(
  Joi.object({ type: Joi.string().valid(ADMIN_SYSTEM_WS_MESSAGE_TYPE_PING).required() }),
  Joi.object({ type: Joi.string().valid(ADMIN_SYSTEM_WS_MESSAGE_TYPE_REQUEST_HEALTH).required() })
)

export const ADMIN_SYSTEM_WS_CONNECTION_STATUSES = [
  ADMIN_SYSTEM_WS_STATUS_CONNECTING,
  ADMIN_SYSTEM_WS_STATUS_CONNECTED,
  ADMIN_SYSTEM_WS_STATUS_DISCONNECTED,
  ADMIN_SYSTEM_WS_STATUS_ERROR,
] as const

// Manual Type Definitions (Joi doesn't support type inference)
export type SystemMemory = {
  heap_used: number
  heap_total: number
  usage_percent: number
}

export type SystemData = {
  uptime: number
  memory: SystemMemory
  clients_connected: number
}

export type LicenseData = {
  total: number
  active: number
  expired: number
  demo_mode: number
  customers: number
  recent: number
}

export type SecurityData = {
  failed_logins_last_hour: number
}

export type DatabaseData = {
  active_connections: number
}

export type HealthData = {
  system: SystemData
  licenses: LicenseData
  security: SecurityData
  database: DatabaseData
  error?: string
}

export type AdminSystemWsHealthUpdate = {
  type: typeof ADMIN_SYSTEM_WS_MESSAGE_TYPE_HEALTH_UPDATE
  timestamp: string
  data: HealthData
}

export type AdminSystemWsPong = {
  type: typeof ADMIN_SYSTEM_WS_MESSAGE_TYPE_PONG
}

export type AdminSystemWsServerError = {
  type: typeof ADMIN_SYSTEM_WS_MESSAGE_TYPE_ERROR
  message: string
}

export type AdminSystemWsServerMessage = AdminSystemWsHealthUpdate | AdminSystemWsPong | AdminSystemWsServerError

export type AdminSystemWsClientMessage =
  | { type: typeof ADMIN_SYSTEM_WS_MESSAGE_TYPE_PING }
  | { type: typeof ADMIN_SYSTEM_WS_MESSAGE_TYPE_REQUEST_HEALTH }

export type AdminSystemWsConnectionStatus = (typeof ADMIN_SYSTEM_WS_CONNECTION_STATUSES)[number]

export const parseAdminSystemServerMessage = (raw: string) => {
  try {
    const parsed = JSON.parse(raw)
    const { error, value } = AdminSystemWsServerMessageSchema.validate(parsed, { stripUnknown: true })
    if (error) {
      return { success: false } as const
    }
    return { success: true, data: value as AdminSystemWsServerMessage } as const
  } catch {
    return { success: false } as const
  }
}
