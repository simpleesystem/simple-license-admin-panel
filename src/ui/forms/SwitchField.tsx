import type { FieldValues } from 'react-hook-form'

import { UI_FORM_CHECK_TYPE_SWITCH } from '../constants'
import type { SwitchFieldProps } from '../types'
import { CheckboxField } from './CheckboxField'

export function SwitchField<TFieldValues extends FieldValues>(props: SwitchFieldProps<TFieldValues>) {
  return <CheckboxField {...props} type={UI_FORM_CHECK_TYPE_SWITCH} />
}
