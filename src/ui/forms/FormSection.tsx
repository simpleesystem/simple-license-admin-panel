import {
  UI_CLASS_FORM_SECTION,
  UI_CLASS_FORM_SECTION_BODY,
  UI_CLASS_FORM_SECTION_HEADER,
  UI_CLASS_FORM_SECTION_TITLE,
  UI_CLASS_MARGIN_RESET,
  UI_CLASS_TEXT_MUTED,
  UI_TEST_ID_FORM_SECTION,
} from '../constants'
import type { FormSectionProps } from '../types'
import { composeClassNames } from '../utils/classNames'
import { VisibilityGate } from '../utils/PermissionGate'

export function FormSection({
  title,
  description,
  actions,
  className,
  testId,
  ability,
  permissionKey,
  permissionFallback,
  children,
}: FormSectionProps) {
  return (
    <VisibilityGate ability={ability} permissionKey={permissionKey} permissionFallback={permissionFallback}>
      <section
        className={composeClassNames(UI_CLASS_FORM_SECTION, className)}
        data-testid={testId ?? UI_TEST_ID_FORM_SECTION}
      >
        <div className={UI_CLASS_FORM_SECTION_HEADER}>
          <div>
            <h2 className={UI_CLASS_FORM_SECTION_TITLE}>{title}</h2>
            {description ? <p className={composeClassNames(UI_CLASS_TEXT_MUTED, UI_CLASS_MARGIN_RESET)}>{description}</p> : null}
          </div>
          {actions}
        </div>
        <div className={UI_CLASS_FORM_SECTION_BODY}>{children}</div>
      </section>
    </VisibilityGate>
  )
}
