import {
  UI_CLASS_PANEL_DESCRIPTION,
  UI_CLASS_PANEL_HEADER,
  UI_CLASS_PANEL_HEADER_ACTIONS,
  UI_CLASS_PANEL_HEADER_CONTENT,
  UI_CLASS_PANEL_TITLE,
} from '../constants'
import type { PanelHeaderProps } from '../types'
import { composeClassNames } from '../utils/classNames'
import { VisibilityGate } from '../utils/PermissionGate'

export function PanelHeader({
  title,
  description,
  actions,
  className,
  testId,
  ability,
  permissionKey,
  permissionFallback,
}: PanelHeaderProps) {
  return (
    <VisibilityGate ability={ability} permissionKey={permissionKey} permissionFallback={permissionFallback}>
      <div className={composeClassNames(UI_CLASS_PANEL_HEADER, className)} data-testid={testId}>
        <div className={UI_CLASS_PANEL_HEADER_CONTENT}>
          <h2 className={UI_CLASS_PANEL_TITLE}>{title}</h2>
          {description ? <p className={UI_CLASS_PANEL_DESCRIPTION}>{description}</p> : null}
        </div>
        {actions ? <div className={UI_CLASS_PANEL_HEADER_ACTIONS}>{actions}</div> : null}
      </div>
    </VisibilityGate>
  )
}
