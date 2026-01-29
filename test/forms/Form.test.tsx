import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Joi from 'joi'
import { expect, it, vi } from 'vitest'

import {
  AUTH_FIELD_PASSWORD,
  AUTH_FIELD_USERNAME,
  I18N_KEY_FORM_PASSWORD_LABEL,
  I18N_KEY_FORM_TENANT_PLACEHOLDER,
  I18N_KEY_FORM_USERNAME_LABEL,
} from '../../src/app/constants'
import { I18nProvider } from '../../src/app/i18n/I18nProvider'
import { i18nResources } from '../../src/app/i18n/resources'
import { AppForm } from '../../src/forms/Form'
import { TextField } from '../../src/forms/fields/TextField'
import { FORM_INPUT_TYPE_PASSWORD } from '../../src/forms/form.constants'

type TestFormValues = {
  [AUTH_FIELD_USERNAME]: string
  [AUTH_FIELD_PASSWORD]: string
}

const schema = Joi.object<TestFormValues>({
  [AUTH_FIELD_USERNAME]: Joi.string().required(),
  [AUTH_FIELD_PASSWORD]: Joi.string().min(8).required(),
})

const USERNAME_LABEL = i18nResources.common[I18N_KEY_FORM_USERNAME_LABEL]
const PASSWORD_LABEL = i18nResources.common[I18N_KEY_FORM_PASSWORD_LABEL]
const BUTTON_LABEL_SUBMIT = 'submit' as const
const VALID_USERNAME = 'admin-user' as const
const VALID_PASSWORD = 'password123!' as const

const renderForm = (onSubmit: (values: TestFormValues) => void) => {
  return render(
    <I18nProvider>
      <AppForm<TestFormValues> defaultValues={{ username: '', password: '' }} schema={schema} onSubmit={onSubmit}>
        <TextField<TestFormValues>
          name={AUTH_FIELD_USERNAME}
          labelKey={I18N_KEY_FORM_USERNAME_LABEL}
          placeholderKey={I18N_KEY_FORM_TENANT_PLACEHOLDER}
        />
        <TextField<TestFormValues>
          name={AUTH_FIELD_PASSWORD}
          labelKey={I18N_KEY_FORM_PASSWORD_LABEL}
          placeholderKey={I18N_KEY_FORM_TENANT_PLACEHOLDER}
          type={FORM_INPUT_TYPE_PASSWORD}
        />
        <button type="submit">{BUTTON_LABEL_SUBMIT}</button>
      </AppForm>
    </I18nProvider>
  )
}

describe('AppForm', () => {
  it('renders validation errors when fields are missing', async () => {
    const handleSubmit = vi.fn()
    renderForm(handleSubmit)

    await userEvent.click(screen.getByText(BUTTON_LABEL_SUBMIT))

    expect(handleSubmit).not.toHaveBeenCalled()
    expect(screen.getAllByRole('alert')).toHaveLength(2)
  })

  it('submits values when inputs are valid', async () => {
    const handleSubmit = vi.fn()
    renderForm(handleSubmit)

    await userEvent.type(screen.getByLabelText(USERNAME_LABEL), VALID_USERNAME)
    await userEvent.type(screen.getByLabelText(PASSWORD_LABEL), VALID_PASSWORD)
    await userEvent.click(screen.getByText(BUTTON_LABEL_SUBMIT))

    expect(handleSubmit).toHaveBeenCalledWith({
      [AUTH_FIELD_USERNAME]: VALID_USERNAME,
      [AUTH_FIELD_PASSWORD]: VALID_PASSWORD,
    })
  })
})
