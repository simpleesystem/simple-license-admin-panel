import { useSearch } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { LoginCard } from '../../app/auth/LoginCard'
import { I18N_KEY_AUTH_HEADING, ROUTE_PATH_DASHBOARD } from '../../app/constants'
import {
  UI_CLASS_SECTION_COLUMN_AUTH,
  UI_CLASS_SECTION_GRID,
  UI_PAGE_VARIANT_CONSTRAINED,
} from '../../ui/constants'
import { Page } from '../../ui/layout/Page'

export function AuthRouteComponent() {
  const { t } = useTranslation()
  const redirectTo = useSearch({
    from: '/auth',
    select: (search: { redirect?: string }) =>
      typeof search.redirect === 'string' && search.redirect.length > 0 ? search.redirect : ROUTE_PATH_DASHBOARD,
  })

  return (
    <Page variant={UI_PAGE_VARIANT_CONSTRAINED} fullHeight={true}>
      <div className={UI_CLASS_SECTION_GRID}>
        <div className={UI_CLASS_SECTION_COLUMN_AUTH}>
          <LoginCard redirectTo={redirectTo} />
        </div>
      </div>
    </Page>
  )
}
