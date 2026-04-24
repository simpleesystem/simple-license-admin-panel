import { useApiClient } from '../../api/apiContext'
import { UI_PAGE_SUBTITLE_AUDIT, UI_PAGE_TITLE_AUDIT, UI_PAGE_VARIANT_FULL_WIDTH } from '../../ui/constants'
import { Page } from '../../ui/layout/Page'
import { PageHeader } from '../../ui/layout/PageHeader'
import { AuditLogsPanel } from '../../ui/workflows/AuditLogsPanel'

export function AuditRouteComponent() {
  const client = useApiClient()

  return (
    <Page variant={UI_PAGE_VARIANT_FULL_WIDTH}>
      <PageHeader title={UI_PAGE_TITLE_AUDIT} subtitle={UI_PAGE_SUBTITLE_AUDIT} />
      <AuditLogsPanel client={client} />
    </Page>
  )
}
