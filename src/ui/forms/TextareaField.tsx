import Form from 'react-bootstrap/Form'
import { useFormContext } from 'react-hook-form'
import type { FieldValues } from 'react-hook-form'

import { UI_FORM_TEXTAREA_MIN_ROWS } from '../constants'
import type { TextareaFieldProps } from '../types'
import { FormField } from './FormField'
import { VisibilityGate } from '../utils/PermissionGate'

export function TextareaField<TFieldValues extends FieldValues>({
  name,
  label,
  description,
  rows = UI_FORM_TEXTAREA_MIN_ROWS,
  maxLength,
  placeholder,
  disabled,
  required,
  className,
  testId,
  ability,
  permissionKey,
  permissionFallback,
}: TextareaFieldProps<TFieldValues>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<TFieldValues>()
  const fieldError = errors[name]
  const errorMessage = fieldError ? String(fieldError?.message ?? '') : undefined

  return (
    <VisibilityGate ability={ability} permissionKey={permissionKey} permissionFallback={permissionFallback}>
      <FormField
        label={label}
        hint={description}
        error={errorMessage}
        required={required}
        className={className}
        testId={testId}
      >
        {({ controlId, describedBy }) => (
          <Form.Control
            as="textarea"
            id={controlId}
            rows={rows}
            maxLength={maxLength}
            placeholder={placeholder}
            disabled={disabled}
            isInvalid={Boolean(fieldError)}
            aria-describedby={describedBy}
            {...register(name)}
          />
        )}
      </FormField>
    </VisibilityGate>
  )
}
