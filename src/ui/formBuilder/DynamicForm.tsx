import type { JSX, ReactNode } from 'react'
import { useEffect } from 'react'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import type { DefaultValues, FieldValues } from 'react-hook-form'
import { FormProvider, useForm } from 'react-hook-form'
import type { PermissionKey } from '../../app/auth/permissions'
import { UI_FORM_ROW_COLUMNS_ONE } from '../constants'
import { CheckboxField } from '../forms/CheckboxField'
import { DateField } from '../forms/DateField'
import { FormActions } from '../forms/FormActions'
import { FormRow } from '../forms/FormRow'
import { FormSection } from '../forms/FormSection'
import { SelectField } from '../forms/SelectField'
import { TextareaField } from '../forms/TextareaField'
import { TextField } from '../forms/TextField'
import type { UiAbilityConfig, UiFormRowColumns } from '../types'
import type {
  CheckboxFieldBlueprint,
  DateFieldBlueprint,
  FormBlueprint,
  FormFieldBlueprint,
  SelectFieldBlueprint,
  TextareaFieldBlueprint,
  TextFieldBlueprint,
} from './blueprint'

type CommonFieldProps = {
  name: string
  label: ReactNode
  description?: ReactNode
  disabled?: boolean
  required?: boolean
  testId?: string
  ability?: UiAbilityConfig
  permissionKey?: PermissionKey
  permissionFallback?: ReactNode | (() => ReactNode)
}

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
      <Form className={className} onSubmit={submitHandler} noValidate={true}>
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
              className="mb-0"
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
  fields: readonly FormFieldBlueprint<FieldValues>[]
) => {
  if (!columns || columns <= UI_FORM_ROW_COLUMNS_ONE) {
    return <div className="d-flex flex-column gap-3">{fields.map((field) => renderField(field))}</div>
  }
  return <FormRow columns={columns}>{fields.map((field) => renderField(field))}</FormRow>
}

// Field Renderers Registry

type FieldRenderer<T extends FormFieldBlueprint<FieldValues>> = (field: T, commonProps: CommonFieldProps) => JSX.Element

const renderTextField: FieldRenderer<TextFieldBlueprint<FieldValues>> = (field, commonProps) => (
  <TextField
    key={field.id}
    {...commonProps}
    type={field.inputType}
    placeholder={field.placeholder}
    autoComplete={field.autoComplete}
  />
)

const renderSelectField: FieldRenderer<SelectFieldBlueprint<FieldValues>> = (field, commonProps) => (
  <SelectField
    key={field.id}
    {...commonProps}
    options={field.options}
    placeholder={field.placeholder}
    multiple={field.multiple}
  />
)

const renderTextareaField: FieldRenderer<TextareaFieldBlueprint<FieldValues>> = (field, commonProps) => (
  <TextareaField
    key={field.id}
    {...commonProps}
    rows={field.rows}
    maxLength={field.maxLength}
    placeholder={field.placeholder}
  />
)

const renderCheckboxField: FieldRenderer<CheckboxFieldBlueprint<FieldValues>> = (field, commonProps) => (
  <CheckboxField key={field.id} {...commonProps} type={field.checkboxType} />
)

const renderDateField: FieldRenderer<DateFieldBlueprint<FieldValues>> = (field, commonProps) => (
  <DateField key={field.id} {...commonProps} min={field.min} max={field.max} placeholder={field.placeholder} />
)

const FIELD_RENDERERS: Record<string, FieldRenderer<FormFieldBlueprint<FieldValues>>> = {
  text: renderTextField as unknown as FieldRenderer<FormFieldBlueprint<FieldValues>>,
  select: renderSelectField as unknown as FieldRenderer<FormFieldBlueprint<FieldValues>>,
  textarea: renderTextareaField as unknown as FieldRenderer<FormFieldBlueprint<FieldValues>>,
  checkbox: renderCheckboxField as unknown as FieldRenderer<FormFieldBlueprint<FieldValues>>,
  date: renderDateField as unknown as FieldRenderer<FormFieldBlueprint<FieldValues>>,
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
