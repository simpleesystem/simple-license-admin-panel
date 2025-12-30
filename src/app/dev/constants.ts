export const DEV_PERSONA_SUPERUSER = 'dev.persona.superuser' as const
export const DEV_PERSONA_SUPPORT = 'dev.persona.support' as const
export const DEV_PERSONA_VIEWER = 'dev.persona.viewer' as const

export const ENV_VAR_DEV_PERSONA_SUPERUSER_TOKEN = 'VITE_DEV_PERSONA_SUPERUSER_TOKEN' as const
export const ENV_VAR_DEV_PERSONA_SUPPORT_TOKEN = 'VITE_DEV_PERSONA_SUPPORT_TOKEN' as const
export const ENV_VAR_DEV_PERSONA_VIEWER_TOKEN = 'VITE_DEV_PERSONA_VIEWER_TOKEN' as const

export const ENV_VAR_DEV_PERSONA_SUPERUSER_ID = 'VITE_DEV_PERSONA_SUPERUSER_ID' as const
export const ENV_VAR_DEV_PERSONA_SUPPORT_ID = 'VITE_DEV_PERSONA_SUPPORT_ID' as const
export const ENV_VAR_DEV_PERSONA_VIEWER_ID = 'VITE_DEV_PERSONA_VIEWER_ID' as const

export const ENV_VAR_DEV_PERSONA_SUPERUSER_USERNAME = 'VITE_DEV_PERSONA_SUPERUSER_USERNAME' as const
export const ENV_VAR_DEV_PERSONA_SUPPORT_USERNAME = 'VITE_DEV_PERSONA_SUPPORT_USERNAME' as const
export const ENV_VAR_DEV_PERSONA_VIEWER_USERNAME = 'VITE_DEV_PERSONA_VIEWER_USERNAME' as const

export const ENV_VAR_DEV_PERSONA_SUPERUSER_EMAIL = 'VITE_DEV_PERSONA_SUPERUSER_EMAIL' as const
export const ENV_VAR_DEV_PERSONA_SUPPORT_EMAIL = 'VITE_DEV_PERSONA_SUPPORT_EMAIL' as const
export const ENV_VAR_DEV_PERSONA_VIEWER_EMAIL = 'VITE_DEV_PERSONA_VIEWER_EMAIL' as const

export const DEV_PERSONA_SUPERUSER_EXPIRY_HOURS = 12 as const
export const DEV_PERSONA_SUPPORT_EXPIRY_HOURS = 8 as const
export const DEV_PERSONA_VIEWER_EXPIRY_HOURS = 24 as const

// Dev-only fallbacks to keep local personas functional when env vars are missing.
// These values MUST NOT be used in production environments.
export const DEV_PERSONA_SUPERUSER_FALLBACK = {
  token: 'dev-token-superuser',
  id: 'dev-superuser-id',
  username: 'dev.superuser',
  email: 'superuser@example.dev',
} as const

export const DEV_PERSONA_SUPPORT_FALLBACK = {
  token: 'dev-token-support',
  id: 'dev-support-id',
  username: 'dev.support',
  email: 'support@example.dev',
} as const

export const DEV_PERSONA_VIEWER_FALLBACK = {
  token: 'dev-token-viewer',
  id: 'dev-viewer-id',
  username: 'dev.viewer',
  email: 'viewer@example.dev',
} as const
