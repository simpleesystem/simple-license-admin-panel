import { useTranslation } from 'react-i18next'

import { I18N_KEY_AUTH_HEADING } from '../../app/constants'
import { LoginCard } from '../../app/auth/LoginCard'

export function AuthRouteComponent() {
  const { t } = useTranslation()

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-5 d-flex flex-column gap-3">
          <h1 className="h5 text-center">{t(I18N_KEY_AUTH_HEADING)}</h1>
          <LoginCard />
        </div>
      </div>
    </div>
  )
}

