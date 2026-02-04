import type { PropsWithChildren } from 'react'
import { useMemo } from 'react'
import { Client as SimpleLicenseClient } from '@/simpleLicense'

import { useAppConfig } from '../app/config'
import { ApiContext } from './apiContext'

export function ApiProvider({ children, client }: PropsWithChildren<{ client?: SimpleLicenseClient }>) {
  const { apiBaseUrl, httpTimeoutMs, httpRetryAttempts, httpRetryDelayMs } = useAppConfig()

  const value = useMemo(() => {
    if (client) {
      return client
    }
    return new SimpleLicenseClient(apiBaseUrl, undefined, {
      retryAttempts: httpRetryAttempts,
      retryDelayMs: httpRetryDelayMs,
      timeoutSeconds: httpTimeoutMs / 1000,
    })
  }, [apiBaseUrl, httpRetryAttempts, httpRetryDelayMs, httpTimeoutMs, client])

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>
}
