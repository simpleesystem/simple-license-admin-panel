import type { FieldValues, Path } from 'react-hook-form'
import type { ReactNode } from 'react'

import {
  UI_FORM_CHECK_TYPE_BOX,
  UI_FORM_CONTROL_TYPE_NUMBER,
  UI_FORM_CONTROL_TYPE_TEXT,
  UI_FORM_TEXTAREA_MIN_ROWS,
} from '../constants'
import type { UiFormCheckType, UiFormControlTextType, UiFormRowColumns, UiSelectOption, UiVisibilityProps } from '../types'
import { createFormBlueprint, type FormBlueprint, type FormFieldBlueprint, type FormFieldKind } from './blueprint'

const WORD_SEPARATOR = /_|(?=[A-Z])/

const toLabel = (value: string): string => {
  const segments = value
    .split(WORD_SEPARATOR)
    .filter(Boolean)
    .map((segment) => segment.toLowerCase())

  return segments
    .map((segment, index) => {
      if (index === 0) {
        return segment.charAt(0).toUpperCase() + segment.slice(1)
      }
      return segment
    })
    .join(' ')
}

type BaseDescriptor<TFieldValues extends FieldValues> = UiVisibilityProps & {
  id?: string
  name: Path<TFieldValues>
  label?: ReactNode
  description?: ReactNode
  required?: boolean
  disabled?: boolean
  testId?: string
}

export type StringDescriptor<TFieldValues extends FieldValues> = BaseDescriptor<TFieldValues> & {
  kind: 'string'
  format?: UiFormControlTextType
  placeholder?: string
  autoComplete?: string
}

export type NumberDescriptor<TFieldValues extends FieldValues> = BaseDescriptor<TFieldValues> & {
  kind: 'number'
  placeholder?: string
}

export type BooleanDescriptor<TFieldValues extends FieldValues> = BaseDescriptor<TFieldValues> & {
  kind: 'boolean'
  checkboxType?: UiFormCheckType
}

export type DateDescriptor<TFieldValues extends FieldValues> = BaseDescriptor<TFieldValues> & {
  kind: 'date'
  min?: string
  max?: string
  placeholder?: ReactNode
}

export type SelectDescriptor<TFieldValues extends FieldValues> = BaseDescriptor<TFieldValues> & {
  kind: 'select'
  options?: readonly UiSelectOption[]
  placeholder?: ReactNode
}

export type TextareaDescriptor<TFieldValues extends FieldValues> = BaseDescriptor<TFieldValues> & {
  kind: 'textarea'
  rows?: number
  maxLength?: number
  placeholder?: string
}

export type PropertyDescriptor<TFieldValues extends FieldValues> =
  | StringDescriptor<TFieldValues>
  | NumberDescriptor<TFieldValues>
  | BooleanDescriptor<TFieldValues>
  | DateDescriptor<TFieldValues>
  | SelectDescriptor<TFieldValues>
  | TextareaDescriptor<TFieldValues>

export type BlueprintSectionConfig<TFieldValues extends FieldValues> = UiVisibilityProps & {
  id: string
  title?: ReactNode
  description?: ReactNode
  layout?: UiFormRowColumns
  testId?: string
  fields: readonly PropertyDescriptor<TFieldValues>[]
}

export type BlueprintConfig<TFieldValues extends FieldValues> = UiVisibilityProps & {
  id: string
  title?: ReactNode
  description?: ReactNode
  sections: readonly BlueprintSectionConfig<TFieldValues>[]
}

export const inferFieldType = <TFieldValues extends FieldValues>(
  descriptor: PropertyDescriptor<TFieldValues>,
): FormFieldKind => {
  switch (descriptor.kind) {
    case 'boolean':
      return 'checkbox'
    case 'select':
      return 'select'
    case 'date':
      return 'date'
    case 'textarea':
      return 'textarea'
    default:
      return 'text'
  }
}

export const inferFieldProps = <TFieldValues extends FieldValues>(
  descriptor: PropertyDescriptor<TFieldValues>,
): FormFieldBlueprint<TFieldValues> => {
  const common = {
    id: descriptor.id ?? String(descriptor.name),
    name: descriptor.name,
    label: descriptor.label ?? toLabel(String(descriptor.name)),
    description: descriptor.description,
    required: descriptor.required ?? false,
    disabled: descriptor.disabled,
    testId: descriptor.testId,
    ability: descriptor.ability,
    permissionKey: descriptor.permissionKey,
    permissionFallback: descriptor.permissionFallback,
  }

  switch (descriptor.kind) {
    case 'boolean':
      return {
        ...common,
        component: 'checkbox',
        checkboxType: descriptor.checkboxType ?? UI_FORM_CHECK_TYPE_BOX,
      }
    case 'select':
      return {
        ...common,
        component: 'select',
        options: descriptor.options ?? [],
        placeholder: descriptor.placeholder,
      }
    case 'date':
      return {
        ...common,
        component: 'date',
        min: descriptor.min,
        max: descriptor.max,
        placeholder: descriptor.placeholder,
      }
    case 'textarea':
      return {
        ...common,
        component: 'textarea',
        rows: descriptor.rows ?? UI_FORM_TEXTAREA_MIN_ROWS,
        maxLength: descriptor.maxLength,
        placeholder: descriptor.placeholder,
      }
    case 'number':
      return {
        ...common,
        component: 'text',
        inputType: UI_FORM_CONTROL_TYPE_NUMBER,
        placeholder: descriptor.placeholder,
      }
    case 'string':
    default:
      return {
        ...common,
        component: 'text',
        inputType: descriptor.format ?? UI_FORM_CONTROL_TYPE_TEXT,
        placeholder: descriptor.placeholder,
        autoComplete: descriptor.autoComplete,
      }
  }
}

export const generateBlueprintFromType = <TFieldValues extends FieldValues>(
  config: BlueprintConfig<TFieldValues>,
): FormBlueprint<TFieldValues> => {
  const resolvedSections: FormBlueprint<TFieldValues>['sections'] = config.sections.map((section) => ({
    id: section.id,
    title: section.title,
    description: section.description,
    layout: section.layout,
    testId: section.testId,
    ability: section.ability ?? config.ability,
    permissionKey: section.permissionKey ?? config.permissionKey,
    permissionFallback: section.permissionFallback ?? config.permissionFallback,
    fields: section.fields.map((field) => inferFieldProps(field)),
  }))

  return createFormBlueprint({
    id: config.id,
    title: config.title,
    description: config.description,
    ability: config.ability,
    permissionKey: config.permissionKey,
    permissionFallback: config.permissionFallback,
    sections: resolvedSections,
  })
}


