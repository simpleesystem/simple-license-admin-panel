import type { PropsWithChildren } from 'react'
import { useMemo } from 'react'
import { AxiosHttpClient, Client as SimpleLicenseClient } from '@/simpleLicense'

import { useAppConfig } from '../app/config'
import { ApiContext } from './apiContext'

export function ApiProvider({ children, client }: PropsWithChildren<{ client?: SimpleLicenseClient }>) {
  const { apiBaseUrl, httpTimeoutMs, httpRetryAttempts, httpRetryDelayMs } = useAppConfig()

  const value = useMemo(() => {
    if (client) {
      return client
    }
    const httpClient = new AxiosHttpClient(apiBaseUrl, httpTimeoutMs / 1000, {
      retryAttempts: httpRetryAttempts,
      retryDelayMs: httpRetryDelayMs,
    })
    return new SimpleLicenseClient(apiBaseUrl, httpClient)
  }, [apiBaseUrl, httpRetryAttempts, httpRetryDelayMs, httpTimeoutMs, client])

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>
}
