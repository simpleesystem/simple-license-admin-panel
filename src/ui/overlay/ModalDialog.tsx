import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'

import {
  UI_BUTTON_VARIANT_PRIMARY,
  UI_CLASS_MODAL_ACTIONS,
  UI_CLASS_MODAL_BODY,
  UI_MODAL_SIZE_LG,
  UI_TEST_ID_MODAL_DIALOG,
} from '../constants'
import type { ModalDialogProps } from '../types'
import { VisibilityGate } from '../utils/PermissionGate'

export function ModalDialog({
  show,
  onClose,
  title,
  body,
  footer,
  primaryAction,
  secondaryAction,
  size = UI_MODAL_SIZE_LG,
  backdrop = true,
  centered,
  scrollable,
  className,
  testId,
  ability,
  permissionKey,
  permissionFallback,
}: ModalDialogProps) {
  const renderActionButton = (action: ModalDialogProps['primaryAction']) => {
    if (!action) {
      return null
    }
    // onClick is typed `() => void`, but callers routinely pass async handlers.
    // react-bootstrap's Button does not await them, so a rejected handler would
    // surface as an unhandled promise rejection. Capture any returned promise
    // and swallow rejections here — the action handler is responsible for
    // surfacing its own error to the user (e.g. a toast).
    const handleClick = () => {
      const result: unknown = (action.onClick as () => unknown)()
      if (result instanceof Promise) {
        result.catch(() => {})
      }
    }
    return (
      <Button
        variant={action.variant ?? UI_BUTTON_VARIANT_PRIMARY}
        onClick={handleClick}
        disabled={action.disabled}
        data-testid={action.testId}
      >
        {action.label}
      </Button>
    )
  }

  return (
    <VisibilityGate ability={ability} permissionKey={permissionKey} permissionFallback={permissionFallback}>
      <Modal
        show={show}
        onHide={onClose}
        size={size}
        backdrop={backdrop}
        centered={centered}
        scrollable={scrollable}
        contentClassName={className}
        data-testid={testId ?? UI_TEST_ID_MODAL_DIALOG}
      >
        {title ? (
          <Modal.Header closeButton={true}>
            <Modal.Title>{title}</Modal.Title>
          </Modal.Header>
        ) : null}
        {body ? <Modal.Body className={UI_CLASS_MODAL_BODY}>{body}</Modal.Body> : null}
        {footer ? (
          footer
        ) : (
          <Modal.Footer className={UI_CLASS_MODAL_ACTIONS}>
            {renderActionButton(secondaryAction)}
            {renderActionButton(primaryAction)}
          </Modal.Footer>
        )}
      </Modal>
    </VisibilityGate>
  )
}
