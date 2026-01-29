import type { ReactNode } from 'react'
import type { FieldValues, Path } from 'react-hook-form'

import type {
  FormSectionProps,
  UiFormCheckType,
  UiFormControlTextType,
  UiFormRowColumns,
  UiSelectOption,
  UiVisibilityProps,
} from '../types'

export type FormFieldKind = 'text' | 'select' | 'textarea' | 'checkbox' | 'date'

type BaseFieldBlueprint<TFieldValues extends FieldValues> = UiVisibilityProps & {
  id: string
  name: Path<TFieldValues>
  label: ReactNode
  description?: ReactNode
  required?: boolean
  disabled?: boolean
  testId?: string
}

export type TextFieldBlueprint<TFieldValues extends FieldValues> = BaseFieldBlueprint<TFieldValues> & {
  component: 'text'
  inputType?: UiFormControlTextType
  placeholder?: string
  autoComplete?: string
}

export type SelectFieldBlueprint<TFieldValues extends FieldValues> = BaseFieldBlueprint<TFieldValues> & {
  component: 'select'
  options: readonly UiSelectOption[]
  placeholder?: ReactNode
  multiple?: boolean
}

export type TextareaFieldBlueprint<TFieldValues extends FieldValues> = BaseFieldBlueprint<TFieldValues> & {
  component: 'textarea'
  rows?: number
  maxLength?: number
  placeholder?: string
}

export type CheckboxFieldBlueprint<TFieldValues extends FieldValues> = BaseFieldBlueprint<TFieldValues> & {
  component: 'checkbox'
  checkboxType?: UiFormCheckType
}

export type DateFieldBlueprint<TFieldValues extends FieldValues> = BaseFieldBlueprint<TFieldValues> & {
  component: 'date'
  min?: string
  max?: string
  placeholder?: ReactNode
}

export type FormFieldBlueprint<TFieldValues extends FieldValues> =
  | TextFieldBlueprint<TFieldValues>
  | SelectFieldBlueprint<TFieldValues>
  | TextareaFieldBlueprint<TFieldValues>
  | CheckboxFieldBlueprint<TFieldValues>
  | DateFieldBlueprint<TFieldValues>

export type FormSectionBlueprint<TFieldValues extends FieldValues> = UiVisibilityProps & {
  id: string
  title?: ReactNode
  description?: ReactNode
  layout?: UiFormRowColumns
  testId?: FormSectionProps['testId']
  fields: readonly FormFieldBlueprint<TFieldValues>[]
}

export type FormBlueprint<TFieldValues extends FieldValues> = UiVisibilityProps & {
  id: string
  title?: ReactNode
  description?: ReactNode
  sections: readonly FormSectionBlueprint<TFieldValues>[]
}

export const createFormBlueprint = <TFieldValues extends FieldValues>(blueprint: FormBlueprint<TFieldValues>) =>
  blueprint
