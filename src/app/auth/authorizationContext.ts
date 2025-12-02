import { createContext } from 'react'

import type { Permissions } from './permissions'

export const AuthorizationContext = createContext<Permissions | null>(null)

