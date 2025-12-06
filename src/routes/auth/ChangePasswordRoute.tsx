import { useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'

import { ROUTE_PATH_ROOT } from '../../app/constants'
import { ChangePasswordFlow } from '../../ui/auth/ChangePasswordFlow'
import { Page } from '../../ui/layout/Page'
import { PageHeader } from '../../ui/layout/PageHeader'
import {
  UI_CHANGE_PASSWORD_DESCRIPTION,
  UI_CHANGE_PASSWORD_HEADING,
  UI_CLASS_SECTION_COLUMN_HALF,
  UI_CLASS_SECTION_GRID,
  UI_PAGE_VARIANT_CONSTRAINED,
} from '../../ui/constants'

export function ChangePasswordRouteComponent() {
  const navigate = useNavigate()
  const handleSuccess = useCallback(() => {
    navigate({ to: ROUTE_PATH_ROOT })
  }, [navigate])

  return (
    <Page variant={UI_PAGE_VARIANT_CONSTRAINED} fullHeight>
      <PageHeader title={UI_CHANGE_PASSWORD_HEADING} subtitle={UI_CHANGE_PASSWORD_DESCRIPTION} />
      <div className={UI_CLASS_SECTION_GRID}>
        <div className={UI_CLASS_SECTION_COLUMN_HALF}>
          <ChangePasswordFlow onSuccess={handleSuccess} />
        </div>
      </div>
    </Page>
  )
}

