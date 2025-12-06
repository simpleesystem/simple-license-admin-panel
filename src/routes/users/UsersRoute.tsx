import { useMemo } from 'react'
import { useAdminUsers } from '@simple-license/react-sdk'

import { useApiClient } from '../../api/apiContext'
import { useAuth } from '../../app/auth/authContext'
import { canViewUsers, isVendorScopedUser } from '../../app/auth/permissions'
import {
  UI_PAGE_SUBTITLE_USERS,
  UI_PAGE_TITLE_USERS,
  UI_SECTION_STATUS_ERROR,
  UI_SECTION_STATUS_LOADING,
  UI_USER_STATUS_ACTION_RETRY,
  UI_USER_STATUS_ERROR_BODY,
  UI_USER_STATUS_ERROR_TITLE,
  UI_USER_STATUS_LOADING_BODY,
  UI_USER_STATUS_LOADING_TITLE,
} from '../../ui/constants'
import { SectionStatus } from '../../ui/feedback/SectionStatus'
import { Page } from '../../ui/layout/Page'
import { PageHeader } from '../../ui/layout/PageHeader'
import { UserManagementExample } from '../../ui/workflows/UserManagementExample'

export function UsersRouteComponent() {
  const client = useApiClient()
  const { currentUser } = useAuth()
  const { data, isLoading, isError, refetch } = useAdminUsers(client)

  const users = useMemo(() => {
    const list = Array.isArray(data) ? data : data?.data ?? []
    if (!isVendorScopedUser(currentUser)) {
      return list
    }
    return list.filter((user) => user.vendorId === currentUser?.vendorId)
  }, [currentUser, data])

  const canView = canViewUsers(currentUser)

  const handleRefresh = () => {
    void refetch()
  }

  return (
    <Page>
      <PageHeader title={UI_PAGE_TITLE_USERS} subtitle={UI_PAGE_SUBTITLE_USERS} />

      {isLoading ? (
        <SectionStatus
          status={UI_SECTION_STATUS_LOADING}
          title={UI_USER_STATUS_LOADING_TITLE}
          message={UI_USER_STATUS_LOADING_BODY}
        />
      ) : null}

      {isError ? (
        <SectionStatus
          status={UI_SECTION_STATUS_ERROR}
          title={UI_USER_STATUS_ERROR_TITLE}
          message={UI_USER_STATUS_ERROR_BODY}
          actions={
            <button type="button" className="btn btn-secondary" onClick={handleRefresh}>
              {UI_USER_STATUS_ACTION_RETRY}
            </button>
          }
        />
      ) : null}

      {!isLoading && !isError && canView ? (
        <UserManagementExample client={client} users={users} currentUser={currentUser ?? undefined} onRefresh={handleRefresh} />
      ) : null}
    </Page>
  )
}

