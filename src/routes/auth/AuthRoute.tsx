import { useSearch } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { LoginCard } from '../../app/auth/LoginCard'
import { I18N_KEY_AUTH_HEADING, I18N_KEY_AUTH_SUBTITLE, ROUTE_PATH_ROOT } from '../../app/constants'
import {
  UI_CLASS_SECTION_COLUMN_AUTH,
  UI_CLASS_SECTION_GRID,
  UI_PAGE_VARIANT_CONSTRAINED,
  UI_STACK_GAP_LARGE,
} from '../../ui/constants'
import { Page } from '../../ui/layout/Page'
import { PageHeader } from '../../ui/layout/PageHeader'
import { Stack } from '../../ui/layout/Stack'

export function AuthRouteComponent() {
  const { t } = useTranslation()
  const redirectTo = useSearch({
    from: '/auth',
    select: (search: { redirect?: string }) =>
      typeof search.redirect === 'string' && search.redirect.length > 0 ? search.redirect : ROUTE_PATH_ROOT,
  })

  return (
    <Page variant={UI_PAGE_VARIANT_CONSTRAINED} fullHeight={true}>
      <Stack as="main" gap={UI_STACK_GAP_LARGE} align="center" className="py-4">
        <PageHeader title={t(I18N_KEY_AUTH_HEADING)} subtitle={t(I18N_KEY_AUTH_SUBTITLE)} />
        <section className={`${UI_CLASS_SECTION_GRID} w-100`} aria-label={t(I18N_KEY_AUTH_HEADING)}>
          <div className={UI_CLASS_SECTION_COLUMN_AUTH}>
            <LoginCard redirectTo={redirectTo} />
          </div>
        </section>
      </Stack>
    </Page>
  )
}
