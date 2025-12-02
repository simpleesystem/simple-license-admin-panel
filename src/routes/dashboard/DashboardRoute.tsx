import { Card } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

import { I18N_KEY_DASHBOARD_HEADING } from '../../app/constants'

export function DashboardRouteComponent() {
  const { t } = useTranslation()

  return (
    <Card>
      <Card.Body>
        <h1 className="h4">{t(I18N_KEY_DASHBOARD_HEADING)}</h1>
      </Card.Body>
    </Card>
  )
}

