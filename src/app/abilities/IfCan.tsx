import { cloneElement, isValidElement } from 'react'
import type { Consumer, PropsWithChildren, ReactElement, ReactNode } from 'react'
import { createContextualCan } from '@casl/react'

import { AbilityContext } from './abilityContext'
import type { AbilityAction, AbilitySubject } from './abilityMap'
import type { AppAbility } from './types'

const abilityConsumer = AbilityContext.Consumer as Consumer<AppAbility>
const ContextualCan = createContextualCan<AppAbility>(abilityConsumer)

type FallbackType = ReactNode | ((isAllowed: boolean) => ReactNode)

type IfCanMode = 'hide' | 'disable'

type IfCanProps = PropsWithChildren<{
  action: AbilityAction
  subject: AbilitySubject
  fallback?: FallbackType
  mode?: IfCanMode
}>

const resolveFallback = (fallback: FallbackType | undefined, allowed: boolean): ReactNode => {
  if (!fallback) {
    return null
  }
  if (typeof fallback === 'function') {
    return fallback(allowed)
  }
  return fallback
}

const disableChild = (child: ReactNode): ReactNode => {
  if (!isValidElement(child)) {
    return null
  }

  const element = child as ReactElement<{ disabled?: boolean; 'aria-disabled'?: boolean }>

  return cloneElement(element, {
    disabled: true,
    'aria-disabled': true,
  })
}

export function IfCan({ action, subject, fallback, mode = 'hide', children }: IfCanProps) {
  return (
    <ContextualCan I={action} a={subject} passThrough>
      {(isAllowed: boolean) => {
        if (isAllowed) {
          return children
        }

        if (mode === 'disable') {
          return disableChild(children) ?? resolveFallback(fallback, isAllowed)
        }

        return resolveFallback(fallback, isAllowed)
      }}
    </ContextualCan>
  )
}


