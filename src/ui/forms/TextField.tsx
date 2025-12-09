import Form from 'react-bootstrap/Form'
import type { FieldValues, Path } from 'react-hook-form'
import { useController, useFormContext } from 'react-hook-form'

import { UI_FORM_CONTROL_TYPE_TEXT } from '../constants'
import type { TextFieldProps } from '../types'
import { VisibilityGate } from '../utils/PermissionGate'
import { FormField } from './FormField'

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
  validateNames,
}: TextFieldProps<TFieldValues>) {
  const { control, trigger } = useFormContext<TFieldValues>()
  const {
    field,
    fieldState: { error },
  } = useController({ name, control })
  const errorMessage = error ? String(error?.message ?? '') : undefined
  const namesToValidate: readonly Path<TFieldValues>[] = validateNames ? [name, ...validateNames] : [name]

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    field.onChange(event)
    void trigger(namesToValidate, { shouldFocus: false })
  }

  const handleBlur: React.FocusEventHandler<HTMLInputElement> = () => {
    field.onBlur()
    void trigger(namesToValidate, { shouldFocus: false })
  }

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
            isInvalid={Boolean(error)}
            aria-describedby={describedBy}
            onChange={handleChange}
            onBlur={handleBlur}
            value={field.value ?? ''}
            name={field.name}
            ref={field.ref}
          />
        )}
      </FormField>
    </VisibilityGate>
  )
}
