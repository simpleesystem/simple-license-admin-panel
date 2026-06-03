import Button from 'react-bootstrap/Button'

import {
  UI_BUTTON_VARIANT_GHOST,
  UI_CLASS_COPY_BUTTON,
  UI_CLASS_COPY_BUTTON_ICON,
  UI_COPY_ICON_COPIED,
  UI_COPY_ICON_FAILED,
  UI_COPY_ICON_IDLE,
  UI_COPY_LABEL_COPIED,
  UI_COPY_LABEL_FAILED,
  UI_COPY_LABEL_IDLE,
  UI_COPY_STATUS_COPIED,
  UI_COPY_STATUS_FAILED,
  UI_TEST_ID_COPY_BUTTON,
} from '../constants'
import type { CopyButtonProps } from '../types'
import { composeClassNames } from '../utils/classNames'
import { VisibilityGate } from '../utils/PermissionGate'
import { useCopyToClipboard } from './useCopyToClipboard'

const resolveActionLabel = (label?: CopyButtonProps['label']): string => {
  if (typeof label === 'string' && label.trim().length > 0) {
    return `${UI_COPY_LABEL_IDLE} ${label}`
  }
  return UI_COPY_LABEL_IDLE
}

export function CopyButton({
  value,
  label,
  size = 'sm',
  disabled = false,
  className,
  testId,
  ability,
  permissionKey,
  permissionFallback,
}: CopyButtonProps) {
  const { status, copy } = useCopyToClipboard()
  const isCopied = status === UI_COPY_STATUS_COPIED
  const isFailed = status === UI_COPY_STATUS_FAILED

  const icon = isCopied ? UI_COPY_ICON_COPIED : isFailed ? UI_COPY_ICON_FAILED : UI_COPY_ICON_IDLE
  const statusLabel = isCopied ? UI_COPY_LABEL_COPIED : isFailed ? UI_COPY_LABEL_FAILED : resolveActionLabel(label)

  return (
    <VisibilityGate ability={ability} permissionKey={permissionKey} permissionFallback={permissionFallback}>
      <Button
        type="button"
        variant={UI_BUTTON_VARIANT_GHOST}
        size={size}
        className={composeClassNames(UI_CLASS_COPY_BUTTON, className)}
        onClick={() => {
          void copy(value)
        }}
        disabled={disabled || value.length === 0}
        aria-label={statusLabel}
        title={statusLabel}
        data-testid={testId ?? UI_TEST_ID_COPY_BUTTON}
        data-copy-status={status}
      >
        <span aria-hidden="true" className={UI_CLASS_COPY_BUTTON_ICON}>
          {icon}
        </span>
      </Button>
    </VisibilityGate>
  )
}
