import { useState } from 'react'
import Button from 'react-bootstrap/Button'
import type { Client, CreateTenantBackupResponse } from '@/simpleLicense'
import { useCreateTenantBackup } from '@/simpleLicense'

import {
  UI_STACK_GAP_SMALL,
  UI_SUMMARY_ID_TENANT_BACKUP_LAST_RUN,
  UI_SUMMARY_ID_TENANT_BACKUP_NAME,
  UI_SUMMARY_ID_TENANT_BACKUP_TYPE,
  UI_TENANT_BACKUP_BUTTON_LABEL,
  UI_TENANT_BACKUP_DESCRIPTION,
  UI_TENANT_BACKUP_ERROR,
  UI_TENANT_BACKUP_LAST_RUN_LABEL,
  UI_TENANT_BACKUP_NAME_LABEL,
  UI_TENANT_BACKUP_PENDING_LABEL,
  UI_TENANT_BACKUP_SUCCESS,
  UI_TENANT_BACKUP_TITLE,
  UI_TENANT_BACKUP_TYPE_LABEL,
  UI_VALUE_PLACEHOLDER,
} from '../constants'
import { SummaryList } from '../data/SummaryList'
import { InlineAlert } from '../feedback/InlineAlert'
import { Stack } from '../layout/Stack'
import type { UiKeyValueItem } from '../types'

type TenantBackupPanelProps = {
  client: Client
  tenantId: string
  title?: string
  initialBackup?: CreateTenantBackupResponse['backup'] | null
  onBackupCreated?: (backup: CreateTenantBackupResponse['backup']) => void
}

export function TenantBackupPanel({
  client,
  tenantId,
  title = UI_TENANT_BACKUP_TITLE,
  initialBackup = null,
  onBackupCreated,
}: TenantBackupPanelProps) {
  const [latestBackup, setLatestBackup] = useState<CreateTenantBackupResponse['backup'] | null>(initialBackup)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const mutation = useCreateTenantBackup(client)

  const handleCreateBackup = async () => {
    setStatus('idle')
    try {
      const response = await mutation.mutateAsync(tenantId)
      setLatestBackup(response.backup)
      setStatus('success')
      onBackupCreated?.(response.backup)
    } catch {
      setStatus('error')
    }
  }

  const summaryItems: UiKeyValueItem[] = [
    {
      id: UI_SUMMARY_ID_TENANT_BACKUP_LAST_RUN,
      label: UI_TENANT_BACKUP_LAST_RUN_LABEL,
      value: latestBackup ? new Date(latestBackup.createdAt).toLocaleString() : UI_VALUE_PLACEHOLDER,
    },
    {
      id: UI_SUMMARY_ID_TENANT_BACKUP_NAME,
      label: UI_TENANT_BACKUP_NAME_LABEL,
      value: latestBackup?.backupName ?? UI_VALUE_PLACEHOLDER,
    },
    {
      id: UI_SUMMARY_ID_TENANT_BACKUP_TYPE,
      label: UI_TENANT_BACKUP_TYPE_LABEL,
      value: latestBackup?.backupType ?? UI_VALUE_PLACEHOLDER,
    },
  ]

  return (
    <Stack direction="column" gap={UI_STACK_GAP_SMALL}>
      <div className="d-flex flex-column gap-1">
        <h2 className="h5 mb-0">{title}</h2>
        <p className="text-muted mb-0">{UI_TENANT_BACKUP_DESCRIPTION}</p>
      </div>

      {status === 'success' ? <InlineAlert variant="success" title={UI_TENANT_BACKUP_SUCCESS} /> : null}
      {status === 'error' ? <InlineAlert variant="danger" title={UI_TENANT_BACKUP_ERROR} /> : null}

      <div className="d-flex flex-wrap gap-2">
        <Button variant="primary" disabled={mutation.isPending} onClick={handleCreateBackup}>
          {mutation.isPending ? UI_TENANT_BACKUP_PENDING_LABEL : UI_TENANT_BACKUP_BUTTON_LABEL}
        </Button>
      </div>

      <SummaryList items={summaryItems} />
    </Stack>
  )
}
