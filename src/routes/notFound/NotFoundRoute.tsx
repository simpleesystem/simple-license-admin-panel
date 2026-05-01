import { useTranslation } from 'react-i18next'

import { I18N_KEY_NOT_FOUND_BODY, I18N_KEY_NOT_FOUND_TITLE } from '../../app/constants'
import { UI_PAGE_VARIANT_CONSTRAINED } from '../../ui/constants'
import { Page } from '../../ui/layout/Page'
import { EmptyState } from '../../ui/typography/EmptyState'

export function NotFoundRouteComponent() {
  const { t } = useTranslation()

  return (
    <Page variant={UI_PAGE_VARIANT_CONSTRAINED}>
      <EmptyState title={t(I18N_KEY_NOT_FOUND_TITLE)} body={t(I18N_KEY_NOT_FOUND_BODY)} />
    </Page>
  )
}
