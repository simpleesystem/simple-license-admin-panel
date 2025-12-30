import { render, screen } from '@testing-library/react'

import {
  APP_BRAND_NAME,
  APP_DEFAULT_LANGUAGE,
  APP_SECONDARY_LANGUAGE,
  I18N_KEY_APP_BRAND,
} from '../../../src/app/constants'
import { I18nProvider } from '../../../src/app/i18n/I18nProvider'
import { useTranslation } from 'react-i18next'

const TRANSLATION_TEST_ID = 'i18n-probe'

const TranslationProbe = () => {
  const { t } = useTranslation()
  return <span data-testid={TRANSLATION_TEST_ID}>{t(I18N_KEY_APP_BRAND)}</span>
}

describe('I18nProvider', () => {
  it('renders translations once initialization completes', async () => {
    render(
      <I18nProvider language={APP_DEFAULT_LANGUAGE}>
        <TranslationProbe />
      </I18nProvider>,
    )

    expect(await screen.findByTestId(TRANSLATION_TEST_ID)).toHaveTextContent(APP_BRAND_NAME)
  })

  it('updates translations when the language prop changes', async () => {
    const { rerender } = render(
      <I18nProvider language={APP_DEFAULT_LANGUAGE}>
        <TranslationProbe />
      </I18nProvider>,
    )

    rerender(
      <I18nProvider language={APP_SECONDARY_LANGUAGE}>
        <TranslationProbe />
      </I18nProvider>,
    )

    expect(await screen.findByTestId(TRANSLATION_TEST_ID)).toHaveTextContent(APP_BRAND_NAME)
  })
})
