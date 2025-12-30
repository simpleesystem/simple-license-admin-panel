import Form from 'react-bootstrap/Form'
import { useFormContext } from 'react-hook-form'
import type { FieldValues } from 'react-hook-form'

import { UI_FORM_CHECK_TYPE_BOX } from '../constants'
import type { CheckboxFieldProps } from '../types'
import { VisibilityGate } from '../utils/PermissionGate'

export function CheckboxField<TFieldValues extends FieldValues>({
  name,
  label,
  description,
  disabled,
  required,
  type = UI_FORM_CHECK_TYPE_BOX,
  ability,
  permissionKey,
  permissionFallback,
}: CheckboxFieldProps<TFieldValues>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<TFieldValues>()
  const fieldError = errors[name]
  const fieldId = `${String(name)}-checkbox`
  const descriptionId = description ? `${fieldId}-description` : undefined
  const errorId = fieldError ? `${fieldId}-error` : undefined
  const describedBy = [descriptionId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <VisibilityGate ability={ability} permissionKey={permissionKey} permissionFallback={permissionFallback}>
      <Form.Group>
        <Form.Check
          id={fieldId}
          type={type}
          label={label}
          disabled={disabled}
          required={required}
          isInvalid={Boolean(fieldError)}
          aria-describedby={describedBy}
          {...register(name)}
        />
        {description ? (
          <Form.Text muted id={descriptionId}>
            {description}
          </Form.Text>
        ) : null}
        {fieldError ? (
          <Form.Control.Feedback type="invalid" role="alert" id={errorId}>
            {String(fieldError?.message ?? '')}
          </Form.Control.Feedback>
        ) : null}
      </Form.Group>
    </VisibilityGate>
  )
}
