import { createContext } from 'react'

import type { AppAbility } from './types'

export const AbilityContext = createContext<AppAbility | null>(null)
