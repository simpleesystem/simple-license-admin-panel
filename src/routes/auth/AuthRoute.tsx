import { useTranslation } from 'react-i18next'

import { I18N_KEY_AUTH_HEADING, I18N_KEY_AUTH_SUBTITLE } from '../../app/constants'
import { LoginCard } from '../../app/auth/LoginCard'
import { Page } from '../../ui/layout/Page'
import { PageHeader } from '../../ui/layout/PageHeader'
import { UI_CLASS_SECTION_COLUMN_FULL, UI_CLASS_SECTION_GRID, UI_PAGE_VARIANT_CONSTRAINED } from '../../ui/constants'

export function AuthRouteComponent() {
  const { t } = useTranslation()

  return (
    <Page variant={UI_PAGE_VARIANT_CONSTRAINED} fullHeight>
      <PageHeader title={t(I18N_KEY_AUTH_HEADING)} subtitle={t(I18N_KEY_AUTH_SUBTITLE)} />
      <div className={UI_CLASS_SECTION_GRID}>
        <div className={UI_CLASS_SECTION_COLUMN_FULL}>
          <LoginCard />
        </div>
      </div>
    </Page>
  )
}

