import type { ReactNode } from 'react'
import Form from 'react-bootstrap/Form'
import { useFormContext } from 'react-hook-form'
import type { FieldValues, Path } from 'react-hook-form'

import {
  UI_FORM_SELECT_PLACEHOLDER_DISABLED,
  UI_FORM_SELECT_PLACEHOLDER_HIDDEN,
  UI_FORM_SELECT_PLACEHOLDER_VALUE,
} from '../constants'
import type { FormFieldProps, UiSelectOption } from '../types'
import { FormField } from './FormField'
import { VisibilityGate } from '../utils/PermissionGate'

export interface SelectFieldProps<TFieldValues extends FieldValues> extends Omit<FormFieldProps, 'children' | 'hint'> {
  name: Path<TFieldValues>
  options: readonly UiSelectOption[]
  placeholder?: ReactNode
  multiple?: boolean
  description?: ReactNode
}

export function SelectField<TFieldValues extends FieldValues>({
  name,
  label,
  options,
  description,
  placeholder,
  disabled,
  required,
  className,
  testId,
  ability,
  permissionKey,
  permissionFallback,
  multiple,
}: SelectFieldProps<TFieldValues>) {
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
          <Form.Select
            id={controlId}
            disabled={disabled}
            isInvalid={Boolean(fieldError)}
            aria-describedby={describedBy}
            multiple={multiple}
            {...register(name)}
          >
            {placeholder ? (
              <option
                value={UI_FORM_SELECT_PLACEHOLDER_VALUE}
                disabled={UI_FORM_SELECT_PLACEHOLDER_DISABLED}
                hidden={UI_FORM_SELECT_PLACEHOLDER_HIDDEN}
              >
                {placeholder}
              </option>
            ) : null}
            {options.map((option) => (
              <option key={String(option.value)} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </Form.Select>
        )}
      </FormField>
    </VisibilityGate>
  )
}


