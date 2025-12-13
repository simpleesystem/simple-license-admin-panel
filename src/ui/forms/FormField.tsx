import { useId } from 'react'

import {
  UI_ARIA_HIDDEN,
  UI_CLASS_FORM_FIELD,
  UI_CLASS_FORM_FIELD_ERROR,
  UI_CLASS_FORM_FIELD_HINT,
  UI_CLASS_FORM_FIELD_LABEL,
  UI_CLASS_FORM_FIELD_REQUIRED,
  UI_CLASS_FORM_LABEL_HORIZONTAL,
  UI_CLASS_MARGIN_RESET,
  UI_TEST_ID_FORM_FIELD,
} from '../constants'
import type { FormFieldProps, UiFormFieldRender } from '../types'
import { composeClassNames } from '../utils/classNames'
import { VisibilityGate } from '../utils/PermissionGate'

export function FormField({
  label,
  htmlFor,
  hint,
  error,
  required,
  layout = 'vertical',
  className,
  testId,
  ability,
  permissionKey,
  permissionFallback,
  children,
}: FormFieldProps) {
  const generatedId = useId()
  const fallbackControlId = `${generatedId}-control`
  const isRenderFunction = typeof children === 'function'
  const controlId = htmlFor ?? fallbackControlId
  const shouldApplyLabelFor = Boolean(htmlFor) || isRenderFunction
  const labelFor = shouldApplyLabelFor ? controlId : undefined
  const labelId = `${controlId}-label`
  const hintId = hint ? `${controlId}-hint` : undefined
  const errorId = error ? `${controlId}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined
  const renderedChildren =
    typeof children === 'function'
      ? (children as UiFormFieldRender)({
          controlId,
          describedBy,
        })
      : children

  return (
    <VisibilityGate ability={ability} permissionKey={permissionKey} permissionFallback={permissionFallback}>
      <fieldset
        className={composeClassNames(UI_CLASS_FORM_FIELD, className)}
        data-testid={testId ?? UI_TEST_ID_FORM_FIELD}
      >
        <label
          id={labelId}
          htmlFor={labelFor}
          className={composeClassNames(
            UI_CLASS_FORM_FIELD_LABEL,
            UI_CLASS_MARGIN_RESET,
            layout === 'horizontal' ? UI_CLASS_FORM_LABEL_HORIZONTAL : undefined
          )}
        >
          {label}
          {required ? (
            <span className={UI_CLASS_FORM_FIELD_REQUIRED} aria-hidden={UI_ARIA_HIDDEN}>
              *
            </span>
          ) : null}
        </label>
        <div aria-live="polite">
          {renderedChildren}
          {error ? (
            <div
              className={composeClassNames(UI_CLASS_FORM_FIELD_ERROR, UI_CLASS_MARGIN_RESET, 'mt-1')}
              role="alert"
              id={errorId}
            >
              {error}
            </div>
          ) : hint ? (
            <div className={composeClassNames(UI_CLASS_FORM_FIELD_HINT, UI_CLASS_MARGIN_RESET, 'mt-1')} id={hintId}>
              {hint}
            </div>
          ) : null}
        </div>
      </fieldset>
    </VisibilityGate>
  )
}
