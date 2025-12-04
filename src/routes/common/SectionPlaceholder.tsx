import type { ReactNode } from 'react'

import { UI_PAGE_PLACEHOLDER_BODY, UI_PAGE_PLACEHOLDER_TITLE, UI_STACK_GAP_MEDIUM } from '../../ui/constants'
import { EmptyState } from '../../ui/typography/EmptyState'
import { Page } from '../../ui/layout/Page'
import { PageHeader } from '../../ui/layout/PageHeader'
import { Stack } from '../../ui/layout/Stack'

type SectionPlaceholderProps = {
  title: ReactNode
  subtitle?: ReactNode
  body?: ReactNode
}

export function SectionPlaceholder({ title, subtitle, body }: SectionPlaceholderProps) {
  const bodyContent = body ?? UI_PAGE_PLACEHOLDER_BODY

  return (
    <Page>
      <Stack direction="column" gap={UI_STACK_GAP_MEDIUM}>
        <PageHeader title={title} subtitle={subtitle} />
        <EmptyState title={UI_PAGE_PLACEHOLDER_TITLE} body={bodyContent} />
      </Stack>
    </Page>
  )
}

