import { Form } from 'react-bootstrap'
import { useFormContext } from 'react-hook-form'
import type { FieldValues, Path } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  FORM_CLASS_ERROR,
  FORM_CLASS_FIELD_WRAPPER,
  FORM_CLASS_LABEL,
  FORM_LABEL_FOR_ID_PREFIX,
  FORM_SELECT_PLACEHOLDER_VALUE,
} from '../form.constants'

export type SelectOption = {
  value: string
  labelKey: string
}

type SelectFieldProps<TFieldValues extends FieldValues> = {
  name: Path<TFieldValues>
  labelKey: string
  placeholderKey: string
  options: SelectOption[]
}

export function SelectField<TFieldValues extends FieldValues>({
  name,
  labelKey,
  placeholderKey,
  options,
}: SelectFieldProps<TFieldValues>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<TFieldValues>()
  const { t } = useTranslation()
  const errorForField = errors[name]
  const controlId = `${FORM_LABEL_FOR_ID_PREFIX}${name as string}`

  return (
    <Form.Group className={FORM_CLASS_FIELD_WRAPPER} controlId={controlId}>
      <Form.Label className={FORM_CLASS_LABEL}>{t(labelKey)}</Form.Label>
      <Form.Select {...register(name)} isInvalid={Boolean(errorForField)}>
        <option value={FORM_SELECT_PLACEHOLDER_VALUE}>{t(placeholderKey)}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {t(option.labelKey)}
          </option>
        ))}
      </Form.Select>
      {errorForField ? (
        <p className={FORM_CLASS_ERROR} role="alert">
          {String(errorForField.message ?? '')}
        </p>
      ) : null}
    </Form.Group>
  )
}

