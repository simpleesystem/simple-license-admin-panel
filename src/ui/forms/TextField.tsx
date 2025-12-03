import Form from 'react-bootstrap/Form'
import { useFormContext } from 'react-hook-form'
import type { FieldValues } from 'react-hook-form'

import { UI_FORM_CONTROL_TYPE_TEXT } from '../constants'
import type { TextFieldProps } from '../types'
import { FormField } from './FormField'
import { VisibilityGate } from '../utils/PermissionGate'

export function TextField<TFieldValues extends FieldValues>({
  name,
  label,
  description,
  type = UI_FORM_CONTROL_TYPE_TEXT,
  placeholder,
  autoComplete,
  disabled,
  required,
  className,
  testId,
  ability,
  permissionKey,
  permissionFallback,
}: TextFieldProps<TFieldValues>) {
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
            id={controlId}
            type={type}
            placeholder={placeholder}
            autoComplete={autoComplete}
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


