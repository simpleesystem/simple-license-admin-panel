import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Joi from 'joi'
import { vi } from 'vitest'

import {
  I18N_KEY_APP_BRAND,
  I18N_KEY_APP_TAGLINE,
  I18N_KEY_FORM_TENANT_PLACEHOLDER,
} from '../../src/app/constants'
import { i18nResources } from '../../src/app/i18n/resources'
import { I18nProvider } from '../../src/app/i18n/I18nProvider'
import { AppForm } from '../../src/forms/Form'
import { SelectField } from '../../src/forms/fields/SelectField'

type SelectFormValues = {
  selection: string
}

const schema = Joi.object<SelectFormValues>({
  selection: Joi.string().required(),
})

const BRAND_TEXT = i18nResources.common[I18N_KEY_APP_BRAND]
const TAGLINE_TEXT = i18nResources.common[I18N_KEY_APP_TAGLINE]
const PLACEHOLDER_TEXT = i18nResources.common[I18N_KEY_FORM_TENANT_PLACEHOLDER]

const options = [
  { value: 'brand', labelKey: I18N_KEY_APP_BRAND },
  { value: 'tagline', labelKey: I18N_KEY_APP_TAGLINE },
]

const renderSelectForm = (onSubmit: (values: SelectFormValues) => void) => {
  return render(
    <I18nProvider>
      <AppForm<SelectFormValues> defaultValues={{ selection: '' }} schema={schema} onSubmit={onSubmit}>
        <SelectField<SelectFormValues>
          name="selection"
          labelKey={I18N_KEY_APP_BRAND}
          placeholderKey={I18N_KEY_FORM_TENANT_PLACEHOLDER}
          options={options}
        />
        <button type="submit">submit</button>
      </AppForm>
    </I18nProvider>,
  )
}

describe('SelectField', () => {
  it('renders localized options and placeholder text', () => {
    const handleSubmit = vi.fn()
    renderSelectForm(handleSubmit)

    expect(screen.getByRole('option', { name: PLACEHOLDER_TEXT })).toBeInTheDocument()
    expect(screen.getAllByRole('option')).toHaveLength(options.length + 1)
    expect(screen.getByRole('option', { name: BRAND_TEXT })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: TAGLINE_TEXT })).toBeInTheDocument()
  })

  it('validates required selections', async () => {
    const user = userEvent.setup()
    const handleSubmit = vi.fn()
    renderSelectForm(handleSubmit)

    await user.click(screen.getByText('submit'))
    expect(await screen.findByRole('alert')).toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText(BRAND_TEXT), 'tagline')
    await user.click(screen.getByText('submit'))

    expect(handleSubmit).toHaveBeenCalledWith({ selection: 'tagline' })
  })
})
