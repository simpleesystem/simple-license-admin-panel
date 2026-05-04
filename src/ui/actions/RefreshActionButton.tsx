import type { ReactNode } from 'react'
import Button from 'react-bootstrap/Button'

import { UI_BUTTON_VARIANT_OUTLINE_SECONDARY, UI_CLASS_PANEL_ACTION_BUTTON } from '../constants'

export type RefreshActionButtonProps = {
  onRefresh: () => void
  isPending?: boolean
  idleLabel: ReactNode
  pendingLabel?: ReactNode
  className?: string
  testId?: string
}

export function RefreshActionButton({
  onRefresh,
  isPending = false,
  idleLabel,
  pendingLabel,
  className = UI_CLASS_PANEL_ACTION_BUTTON,
  testId,
}: RefreshActionButtonProps) {
  return (
    <Button
      variant={UI_BUTTON_VARIANT_OUTLINE_SECONDARY}
      className={className}
      onClick={onRefresh}
      disabled={isPending}
      aria-busy={isPending}
      data-testid={testId}
    >
      {isPending && pendingLabel !== undefined ? pendingLabel : idleLabel}
    </Button>
  )
}
