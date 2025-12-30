import { Alert } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

import { I18N_KEY_NOT_FOUND_BODY, I18N_KEY_NOT_FOUND_TITLE } from '../../app/constants'

export function NotFoundRouteComponent() {
  const { t } = useTranslation()

  return (
    <Alert variant="warning">
      <Alert.Heading>{t(I18N_KEY_NOT_FOUND_TITLE)}</Alert.Heading>
      <p className="mb-0">{t(I18N_KEY_NOT_FOUND_BODY)}</p>
    </Alert>
  )
}
