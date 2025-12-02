import { ApiException } from '@simple-license/react-sdk'

import {
  I18N_KEY_APP_ERROR_MESSAGE,
  I18N_KEY_APP_ERROR_TITLE,
  NOTIFICATION_VARIANT_ERROR,
} from '../../src/app/constants'
import { mapApiException, mapErrorToNotification } from '../../src/errors/mappers'

describe('error notification mappers', () => {
  it('maps generic errors to default notification payloads', () => {
    const payload = mapErrorToNotification()

    expect(payload).toEqual({
      titleKey: I18N_KEY_APP_ERROR_TITLE,
      descriptionKey: I18N_KEY_APP_ERROR_MESSAGE,
      variant: NOTIFICATION_VARIANT_ERROR,
    })
  })

  it('maps ApiException codes to toast payloads', () => {
    const exception = new ApiException('failure', 'SAMPLE_CODE')
    const payload = mapApiException(exception)

    expect(payload).toEqual({
      titleKey: 'SAMPLE_CODE',
      descriptionKey: I18N_KEY_APP_ERROR_MESSAGE,
      variant: NOTIFICATION_VARIANT_ERROR,
    })
  })

  it('falls back to the default title when ApiException lacks a code', () => {
    const exception = new ApiException('failure', '')
    const payload = mapApiException(exception)

    expect(payload).toEqual({
      titleKey: I18N_KEY_APP_ERROR_TITLE,
      descriptionKey: I18N_KEY_APP_ERROR_MESSAGE,
      variant: NOTIFICATION_VARIANT_ERROR,
    })
  })
})

