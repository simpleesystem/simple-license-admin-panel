import {
  UI_ARIA_LABEL_CLOSE_SIDE_PANEL,
  UI_ARIA_MODAL_DIALOG,
  UI_CLASS_SIDE_PANEL,
  UI_CLASS_SIDE_PANEL_ACTIONS,
  UI_CLASS_SIDE_PANEL_BODY,
  UI_SIDE_PANEL_PLACEMENT_END,
  UI_TEST_ID_SIDE_PANEL,
} from '../constants'
import type { SidePanelProps } from '../types'
import { composeClassNames } from '../utils/classNames'
import { VisibilityGate } from '../utils/PermissionGate'

export function SidePanel({
  show,
  onClose,
  title,
  footer,
  placement = UI_SIDE_PANEL_PLACEMENT_END,
  actions,
  sizeClass,
  className,
  testId,
  ability,
  permissionKey,
  permissionFallback,
  children,
}: SidePanelProps) {
  if (!show) {
    return null
  }

  const panelTestId = testId ?? UI_TEST_ID_SIDE_PANEL
  const titleId = title ? `${panelTestId}-title` : undefined

  return (
    <VisibilityGate ability={ability} permissionKey={permissionKey} permissionFallback={permissionFallback}>
      <aside
        className={composeClassNames(
          UI_CLASS_SIDE_PANEL,
          placement === 'start' ? 'start-0' : 'end-0',
          sizeClass,
          className
        )}
        data-testid={panelTestId}
        role="dialog"
        aria-modal={UI_ARIA_MODAL_DIALOG}
        aria-labelledby={titleId}
      >
        <div className="d-flex justify-content-between align-items-center mb-4">
          {title ? (
            <h2 className="h5 mb-0" id={titleId}>
              {title}
            </h2>
          ) : null}
          <button type="button" className="btn-close" aria-label={UI_ARIA_LABEL_CLOSE_SIDE_PANEL} onClick={onClose} />
        </div>
        <div className={UI_CLASS_SIDE_PANEL_BODY}>{children}</div>
        {actions ? <div className={UI_CLASS_SIDE_PANEL_ACTIONS}>{actions}</div> : null}
        {footer ? <div className="border-top mt-4 pt-3">{footer}</div> : null}
      </aside>
    </VisibilityGate>
  )
}
