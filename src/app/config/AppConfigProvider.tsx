import { useMemo } from 'react'
import type { PropsWithChildren } from 'react'

import type { AppConfig } from './appConfig'
import { APP_CONFIG } from './appConfig'
import { AppConfigContext } from './appConfigContext'

type AppConfigProviderProps = PropsWithChildren<{
  value?: AppConfig
}>

export function AppConfigProvider({ value, children }: AppConfigProviderProps) {
  const contextValue = useMemo(() => value ?? APP_CONFIG, [value])

  return <AppConfigContext.Provider value={contextValue}>{children}</AppConfigContext.Provider>
}

