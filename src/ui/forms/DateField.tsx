import Form from 'react-bootstrap/Form'
import { useFormContext } from 'react-hook-form'
import type { FieldValues } from 'react-hook-form'

import { UI_FORM_CONTROL_TYPE_DATE } from '../constants'
import type { DateFieldProps } from '../types'
import { VisibilityGate } from '../utils/PermissionGate'

export function DateField<TFieldValues extends FieldValues>({
  name,
  label,
  description,
  min,
  max,
  placeholder,
  disabled,
  ability,
  permissionKey,
  permissionFallback,
}: DateFieldProps<TFieldValues>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<TFieldValues>()
  const fieldError = errors[name]
  const fieldId = `${String(name)}-date`
  const descriptionId = description ? `${fieldId}-description` : undefined
  const errorId = fieldError ? `${fieldId}-error` : undefined
  const describedBy = [descriptionId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <VisibilityGate ability={ability} permissionKey={permissionKey} permissionFallback={permissionFallback}>
      <Form.Group>
        <Form.Label htmlFor={fieldId}>{label}</Form.Label>
        <Form.Control
          id={fieldId}
          type={UI_FORM_CONTROL_TYPE_DATE}
          min={min}
          max={max}
          placeholder={typeof placeholder === 'string' ? placeholder : undefined}
          disabled={disabled}
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
