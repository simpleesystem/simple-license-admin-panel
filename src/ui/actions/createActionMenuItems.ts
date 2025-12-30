import type { ReactNode } from 'react'

import type { UiActionMenuItem, UiVisibilityProps } from '../types'

export type UiActionPayloadMap = Record<string, unknown>

export type UiActionDefinition<
  PayloadMap extends UiActionPayloadMap,
  TType extends keyof PayloadMap = keyof PayloadMap,
> = UiVisibilityProps & {
  id: TType
  label: ReactNode
  icon?: ReactNode
  disabled?: boolean
  testId?: string
  buildPayload: () => PayloadMap[TType]
  onSelect: (payload: PayloadMap[TType]) => void
}

export const createActionMenuItems = <PayloadMap extends UiActionPayloadMap>(
  definitions: readonly UiActionDefinition<PayloadMap>[],
): UiActionMenuItem[] =>
  definitions.map((definition) => ({
    id: String(definition.id),
    label: definition.label,
    icon: definition.icon,
    disabled: definition.disabled,
    testId: definition.testId,
    ability: definition.ability,
    permissionKey: definition.permissionKey,
    permissionFallback: definition.permissionFallback,
    onSelect: () => {
      const payload = definition.buildPayload()
      definition.onSelect(payload)
    },
  }))
