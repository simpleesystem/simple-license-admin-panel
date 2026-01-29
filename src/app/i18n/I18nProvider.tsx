import i18next, { type i18n } from 'i18next'
import type { PropsWithChildren } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { I18nextProvider } from 'react-i18next'
import { initReactI18next } from 'react-i18next/initReactI18next'

import {
  APP_DEFAULT_LANGUAGE,
  APP_I18N_DEFAULT_NAMESPACE,
  APP_I18N_FALLBACK_NAMESPACE,
  APP_SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from '../constants'
import { defaultResources } from './resources'

const createI18nClient = (): i18n => {
  const client = i18next.createInstance({
    lng: APP_DEFAULT_LANGUAGE,
    fallbackLng: APP_I18N_FALLBACK_NAMESPACE,
    supportedLngs: APP_SUPPORTED_LANGUAGES,
    defaultNS: APP_I18N_DEFAULT_NAMESPACE,
    ns: [APP_I18N_DEFAULT_NAMESPACE],
    load: 'languageOnly',
    interpolation: {
      escapeValue: false,
    },
    resources: defaultResources,
  })

  client.use(initReactI18next)

  return client
}

const i18nClient = createI18nClient()
const initializationPromise = i18nClient.init()

type I18nProviderProps = PropsWithChildren<{
  language?: SupportedLanguage
}>

export function I18nProvider({ children, language }: I18nProviderProps) {
  const [isReady, setIsReady] = useState(i18nClient.isInitialized)

  useEffect(() => {
    if (!isReady) {
      void initializationPromise.then(() => {
        setIsReady(true)
      })
    }
  }, [isReady])

  useEffect(() => {
    if (language && language !== i18nClient.language) {
      void i18nClient.changeLanguage(language)
    }
  }, [language])

  const contextValue = useMemo(() => i18nClient, [])

  if (!isReady) {
    return null
  }

  return <I18nextProvider i18n={contextValue}>{children}</I18nextProvider>
}
