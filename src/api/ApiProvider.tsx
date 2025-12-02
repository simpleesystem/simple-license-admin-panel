import { useMemo } from 'react'
import type { PropsWithChildren } from 'react'
import { Client as SimpleLicenseClient } from '@simple-license/react-sdk'

import { useAppConfig } from '../app/config'
import { ApiContext } from './apiContext'

export function ApiProvider({ children }: PropsWithChildren) {
  const { apiBaseUrl } = useAppConfig()

  const value = useMemo(() => {
    return new SimpleLicenseClient(apiBaseUrl)
  }, [apiBaseUrl])

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>
}

