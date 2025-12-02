import {
  APP_BRAND_NAME,
  APP_BRAND_TAGLINE,
  APP_DEFAULT_LANGUAGE,
  APP_SECONDARY_LANGUAGE,
  APP_I18N_DEFAULT_NAMESPACE,
  I18N_KEY_APP_BRAND,
  I18N_KEY_APP_ERROR_MESSAGE,
  I18N_KEY_APP_ERROR_RESET,
  I18N_KEY_APP_ERROR_TITLE,
  I18N_KEY_APP_LOADING,
  I18N_KEY_APP_TAGLINE,
  I18N_KEY_AUTH_HEADING,
  I18N_KEY_DASHBOARD_HEADING,
  I18N_KEY_FORM_PASSWORD_LABEL,
  I18N_KEY_FORM_TENANT_PLACEHOLDER,
  I18N_KEY_FORM_USERNAME_LABEL,
  I18N_KEY_NOT_FOUND_BODY,
  I18N_KEY_NOT_FOUND_TITLE,
  I18N_KEY_SESSION_EXPIRED_BODY,
  I18N_KEY_SESSION_EXPIRED_TITLE,
  I18N_KEY_SESSION_WARNING_BODY,
  I18N_KEY_SESSION_WARNING_TITLE,
  I18N_KEY_DEV_TOOLBAR_HEADING,
  I18N_KEY_DEV_TOOLBAR_RESET,
  I18N_KEY_DEV_PERSONA_SUPERUSER,
  I18N_KEY_DEV_PERSONA_SUPPORT,
  I18N_KEY_DEV_PERSONA_VIEWER,
} from '../constants'

type TranslationDictionary = Record<string, string>

type ResourceBundle = Record<string, TranslationDictionary>

export const i18nResources: ResourceBundle = {
  [APP_I18N_DEFAULT_NAMESPACE]: {
    [I18N_KEY_APP_BRAND]: APP_BRAND_NAME,
    [I18N_KEY_APP_TAGLINE]: APP_BRAND_TAGLINE,
    [I18N_KEY_APP_LOADING]: 'Loading experience is initializing',
    [I18N_KEY_APP_ERROR_TITLE]: 'We hit a snag',
    [I18N_KEY_APP_ERROR_MESSAGE]: 'An unexpected issue prevented this screen from loading.',
    [I18N_KEY_APP_ERROR_RESET]: 'Try again',
    [I18N_KEY_DASHBOARD_HEADING]: 'Operational overview',
    [I18N_KEY_AUTH_HEADING]: 'Authenticate to continue',
    [I18N_KEY_NOT_FOUND_TITLE]: 'This route is unavailable',
    [I18N_KEY_NOT_FOUND_BODY]: 'Verify the URL or use navigation controls to continue.',
    [I18N_KEY_FORM_USERNAME_LABEL]: 'Username',
    [I18N_KEY_FORM_PASSWORD_LABEL]: 'Password',
    [I18N_KEY_FORM_TENANT_PLACEHOLDER]: 'Select a tenant',
    [I18N_KEY_SESSION_WARNING_TITLE]: 'You are about to be signed out',
    [I18N_KEY_SESSION_WARNING_BODY]: 'We have not detected any activity. Move your mouse or press a key to stay signed in.',
    [I18N_KEY_SESSION_EXPIRED_TITLE]: 'Your session expired',
    [I18N_KEY_SESSION_EXPIRED_BODY]: 'For security reasons you have been signed out. Please authenticate again.',
    [I18N_KEY_DEV_TOOLBAR_HEADING]: 'Dev personas',
    [I18N_KEY_DEV_TOOLBAR_RESET]: 'Reset session',
    [I18N_KEY_DEV_PERSONA_SUPERUSER]: 'Superuser',
    [I18N_KEY_DEV_PERSONA_SUPPORT]: 'Support',
    [I18N_KEY_DEV_PERSONA_VIEWER]: 'Viewer',
  },
}

export const defaultResources = {
  [APP_DEFAULT_LANGUAGE]: i18nResources,
  [APP_SECONDARY_LANGUAGE]: i18nResources,
}

