import { createContext } from 'react'

import type { AppConfig } from './appConfig'

export const AppConfigContext = createContext<AppConfig | null>(null)
