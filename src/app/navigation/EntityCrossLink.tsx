import type { ReactNode } from 'react'

import { UI_VALUE_PLACEHOLDER } from '../../ui/constants'
import { EntityLink } from '../../ui/navigation/EntityLink'
import type { UiCommonProps } from '../../ui/types'
import type { EntityLinkKind } from './entityLinks'
import { useEntityNavigation } from './useEntityNavigation'

export type EntityCrossLinkProps = UiCommonProps & {
  kind: EntityLinkKind
  value: string | null | undefined
  label?: ReactNode
  showIcon?: boolean
  truncate?: boolean
  placeholder?: ReactNode
}

export function EntityCrossLink({
  kind,
  value,
  label,
  showIcon,
  truncate,
  placeholder = UI_VALUE_PLACEHOLDER,
  className,
  testId,
  ability,
  permissionKey,
  permissionFallback,
}: EntityCrossLinkProps) {
  const { resolve, navigateTo } = useEntityNavigation()

  if (typeof value !== 'string' || value.length === 0) {
    return <>{placeholder}</>
  }

  const target = resolve(kind, value)

  return (
    <EntityLink
      label={label ?? value}
      href={target.to}
      title={target.title}
      onActivate={() => navigateTo(kind, value)}
      showIcon={showIcon}
      truncate={truncate}
      className={className}
      testId={testId}
      ability={ability}
      permissionKey={permissionKey}
      permissionFallback={permissionFallback}
    />
  )
}
