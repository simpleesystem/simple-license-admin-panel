import { render } from '@testing-library/react'
import Joi from 'joi'
import { vi } from 'vitest'
import { I18N_KEY_FORM_USERNAME_LABEL } from '../../src/app/constants'
import { I18nProvider } from '../../src/app/i18n/I18nProvider'
import { AppForm } from '../../src/forms/Form'
import { TextField } from '../../src/forms/fields/TextField'

type FieldValues = {
  username: string
}

const schema = Joi.object<FieldValues>({
  username: Joi.string().required(),
})

describe('TextField', () => {
  it('renders without a placeholder when none is provided', () => {
    render(
      <I18nProvider>
        <AppForm<FieldValues> defaultValues={{ username: '' }} schema={schema} onSubmit={vi.fn()}>
          <TextField<FieldValues> name="username" labelKey={I18N_KEY_FORM_USERNAME_LABEL} />
        </AppForm>
      </I18nProvider>
    )
  })
})
