import { useMemo } from 'react'
import { useAdminProducts } from '@simple-license/react-sdk'

import { useApiClient } from '../../api/apiContext'
import { useAuth } from '../../app/auth/authContext'
import { canViewProducts, isProductOwnedByUser, isVendorScopedUser } from '../../app/auth/permissions'
import {
  UI_PAGE_SUBTITLE_PRODUCTS,
  UI_PAGE_TITLE_PRODUCTS,
  UI_SECTION_STATUS_ERROR,
  UI_SECTION_STATUS_LOADING,
  UI_PRODUCT_STATUS_ACTION_RETRY,
  UI_PRODUCT_STATUS_ERROR_BODY,
  UI_PRODUCT_STATUS_ERROR_TITLE,
  UI_PRODUCT_STATUS_LOADING_BODY,
  UI_PRODUCT_STATUS_LOADING_TITLE,
} from '../../ui/constants'
import { SectionStatus } from '../../ui/feedback/SectionStatus'
import { Page } from '../../ui/layout/Page'
import { PageHeader } from '../../ui/layout/PageHeader'
import { ProductManagementExample } from '../../ui/workflows/ProductManagementExample'

export function ProductsRouteComponent() {
  const client = useApiClient()
  const { currentUser } = useAuth()
  const { data, isLoading, isError, refetch } = useAdminProducts(client)

  const products = useMemo(() => {
    const list = Array.isArray(data) ? data : data?.data ?? []
    if (!isVendorScopedUser(currentUser)) {
      return list
    }
    return list.filter((product) => isProductOwnedByUser(currentUser, product))
  }, [currentUser, data])

  const canView = canViewProducts(currentUser)

  const handleRefresh = () => {
    void refetch()
  }

  return (
    <Page>
      <PageHeader title={UI_PAGE_TITLE_PRODUCTS} subtitle={UI_PAGE_SUBTITLE_PRODUCTS} />

      {isLoading ? (
        <SectionStatus
          status={UI_SECTION_STATUS_LOADING}
          title={UI_PRODUCT_STATUS_LOADING_TITLE}
          message={UI_PRODUCT_STATUS_LOADING_BODY}
        />
      ) : null}

      {isError ? (
        <SectionStatus
          status={UI_SECTION_STATUS_ERROR}
          title={UI_PRODUCT_STATUS_ERROR_TITLE}
          message={UI_PRODUCT_STATUS_ERROR_BODY}
          actions={
            <button type="button" className="btn btn-secondary" onClick={handleRefresh}>
              {UI_PRODUCT_STATUS_ACTION_RETRY}
            </button>
          }
        />
      ) : null}

      {!isLoading && !isError && canView ? (
        <ProductManagementExample
          client={client}
          products={products}
          currentUser={currentUser ?? undefined}
          onRefresh={handleRefresh}
        />
      ) : null}
    </Page>
  )
}

