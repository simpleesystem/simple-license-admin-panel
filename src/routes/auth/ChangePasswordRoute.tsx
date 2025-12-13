import { useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'

import { ROUTE_PATH_ROOT } from '../../app/constants'
import { ChangePasswordFlow } from '../../ui/auth/ChangePasswordFlow'
import { Page } from '../../ui/layout/Page'
import {
  UI_CLASS_SECTION_COLUMN_AUTH,
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
      <div className={UI_CLASS_SECTION_GRID}>
        <div className={UI_CLASS_SECTION_COLUMN_AUTH}>
          <ChangePasswordFlow onSuccess={handleSuccess} />
        </div>
      </div>
    </Page>
  )
}

