import { Form } from 'react-bootstrap'
import { useFormContext } from 'react-hook-form'
import type { FieldValues, Path } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  FORM_CLASS_ERROR,
  FORM_CLASS_FIELD_WRAPPER,
  FORM_CLASS_LABEL,
  FORM_INPUT_TYPE_PASSWORD,
  FORM_INPUT_TYPE_TEXT,
  FORM_LABEL_FOR_ID_PREFIX,
} from '../form.constants'

type TextFieldProps<TFieldValues extends FieldValues> = {
  name: Path<TFieldValues>
  labelKey: string
  placeholderKey?: string
  type?: typeof FORM_INPUT_TYPE_TEXT | typeof FORM_INPUT_TYPE_PASSWORD
}

export function TextField<TFieldValues extends FieldValues>({
  name,
  labelKey,
  placeholderKey,
  type = FORM_INPUT_TYPE_TEXT,
}: TextFieldProps<TFieldValues>) {
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
      <Form.Control
        type={type}
        placeholder={placeholderKey ? t(placeholderKey) : undefined}
        isInvalid={Boolean(errorForField)}
        {...register(name)}
      />
      {errorForField ? (
        <p className={FORM_CLASS_ERROR} role="alert">
          {String(errorForField.message ?? '')}
        </p>
      ) : null}
    </Form.Group>
  )
}

