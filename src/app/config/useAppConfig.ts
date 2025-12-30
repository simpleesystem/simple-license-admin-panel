import { useContext } from 'react'

import type { AppConfig, FeatureFlagKey } from './appConfig'
import { APP_CONFIG } from './appConfig'
import { AppConfigContext } from './appConfigContext'

export const useAppConfig = (): AppConfig => {
  const context = useContext(AppConfigContext)
  if (!context) {
    return APP_CONFIG
  }
  return context
}

export const useFeatureFlag = (flag: FeatureFlagKey): boolean => {
  const config = useAppConfig()
  return config.features[flag]
}
