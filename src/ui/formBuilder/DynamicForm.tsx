import { useEffect } from 'react'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import { FormProvider, useForm } from 'react-hook-form'
import type { DefaultValues, FieldValues } from 'react-hook-form'
import type { JSX, ReactNode } from 'react'

import { FormActions } from '../forms/FormActions'
import { FormRow } from '../forms/FormRow'
import { FormSection } from '../forms/FormSection'
import { CheckboxField } from '../forms/CheckboxField'
import { DateField } from '../forms/DateField'
import { SelectField } from '../forms/SelectField'
import { TextField } from '../forms/TextField'
import { TextareaField } from '../forms/TextareaField'
import type {
  CheckboxFieldBlueprint,
  DateFieldBlueprint,
  FormBlueprint,
  FormFieldBlueprint,
  SelectFieldBlueprint,
  TextFieldBlueprint,
  TextareaFieldBlueprint,
} from './blueprint'
import type { UiFormRowColumns } from '../types'
import { UI_FORM_ROW_COLUMNS_ONE } from '../constants'

type DynamicFormProps<TFieldValues extends FieldValues> = {
  blueprint: FormBlueprint<TFieldValues>
  defaultValues: TFieldValues
  onSubmit: (values: TFieldValues) => Promise<void> | void
  submitLabel: ReactNode
  pendingLabel?: ReactNode
  cancelLabel?: ReactNode
  onCancel?: () => void
  secondaryActions?: ReactNode
  className?: string
}

export function DynamicForm<TFieldValues extends FieldValues>({
  blueprint,
  defaultValues,
  onSubmit,
  submitLabel,
  pendingLabel,
  cancelLabel,
  onCancel,
  secondaryActions,
  className,
}: DynamicFormProps<TFieldValues>) {
  const formMethods = useForm<TFieldValues>({
    defaultValues: defaultValues as DefaultValues<TFieldValues>,
  })
  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = formMethods

  useEffect(() => {
    reset(defaultValues as DefaultValues<TFieldValues>)
  }, [defaultValues, reset])

  const submitHandler = handleSubmit(async (values) => {
    await onSubmit(values)
  })

  const pendingContent = pendingLabel ?? submitLabel

  return (
    <FormProvider {...formMethods}>
      <Form className={className} onSubmit={submitHandler} noValidate>
        {blueprint.title ? <h2 className="h4 mb-3">{blueprint.title}</h2> : null}
        {blueprint.description ? <p className="text-muted">{blueprint.description}</p> : null}
        <div className="d-flex flex-column gap-4">
          {blueprint.sections.map((section) => (
            <FormSection
              key={section.id}
              title={section.title}
              description={section.description}
              testId={section.testId}
              ability={section.ability}
              permissionKey={section.permissionKey}
              permissionFallback={section.permissionFallback}
            >
              {renderSectionContent(section.layout, section.fields)}
            </FormSection>
          ))}
        </div>
        <FormActions className="mt-4" align="end">
          {secondaryActions}
          {cancelLabel && onCancel ? (
            <Button variant="outline-secondary" type="button" onClick={onCancel} disabled={isSubmitting}>
              {cancelLabel}
            </Button>
          ) : null}
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? pendingContent : submitLabel}
          </Button>
        </FormActions>
      </Form>
    </FormProvider>
  )
}

const renderSectionContent = (
  columns: UiFormRowColumns | undefined,
  fields: readonly FormFieldBlueprint<FieldValues>[],
) => {
  if (!columns || columns <= UI_FORM_ROW_COLUMNS_ONE) {
    return <div className="d-flex flex-column gap-3">{fields.map((field) => renderField(field))}</div>
  }
  return <FormRow columns={columns}>{fields.map((field) => renderField(field))}</FormRow>
}

// Field Renderers Registry

type FieldRenderer<T extends FormFieldBlueprint<any>> = (
  field: T,
  commonProps: any
) => JSX.Element

const renderTextField: FieldRenderer<TextFieldBlueprint<any>> = (field, commonProps) => (
  <TextField
    key={field.id}
    {...commonProps}
    type={field.inputType}
    placeholder={field.placeholder}
    autoComplete={field.autoComplete}
  />
)

const renderSelectField: FieldRenderer<SelectFieldBlueprint<any>> = (field, commonProps) => (
  <SelectField key={field.id} {...commonProps} options={field.options} placeholder={field.placeholder} />
)

const renderTextareaField: FieldRenderer<TextareaFieldBlueprint<any>> = (field, commonProps) => (
  <TextareaField
    key={field.id}
    {...commonProps}
    rows={field.rows}
    maxLength={field.maxLength}
    placeholder={field.placeholder}
  />
)

const renderCheckboxField: FieldRenderer<CheckboxFieldBlueprint<any>> = (field, commonProps) => (
  <CheckboxField key={field.id} {...commonProps} type={field.checkboxType} />
)

const renderDateField: FieldRenderer<DateFieldBlueprint<any>> = (field, commonProps) => (
  <DateField
    key={field.id}
    {...commonProps}
    min={field.min}
    max={field.max}
    placeholder={field.placeholder}
  />
)

const FIELD_RENDERERS: Record<string, FieldRenderer<any>> = {
  text: renderTextField,
  select: renderSelectField,
  textarea: renderTextareaField,
  checkbox: renderCheckboxField,
  date: renderDateField,
}

const renderField = (field: FormFieldBlueprint<FieldValues>) => {
  const commonProps = {
    name: field.name,
    label: field.label,
    description: field.description,
    disabled: field.disabled,
    required: field.required,
    testId: field.testId,
    ability: field.ability,
    permissionKey: field.permissionKey,
    permissionFallback: field.permissionFallback,
  }

  const renderer = FIELD_RENDERERS[field.component]
  if (renderer) {
    return renderer(field, commonProps)
  }

  return null
}
