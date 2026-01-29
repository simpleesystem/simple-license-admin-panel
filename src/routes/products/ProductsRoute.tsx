import { useMemo, useState } from 'react'
import { useAdminProducts, useAdminTenants } from '@/simpleLicense'

import { useApiClient } from '../../api/apiContext'
import { canViewProducts, isProductOwnedByUser, isVendorScopedUser } from '../../app/auth/permissions'
import { useAuth } from '../../app/auth/useAuth'
import {
  UI_PAGE_SUBTITLE_PRODUCTS,
  UI_PAGE_TITLE_PRODUCTS,
  UI_PRODUCT_STATUS_ACTION_RETRY,
  UI_PRODUCT_STATUS_ERROR_BODY,
  UI_PRODUCT_STATUS_ERROR_TITLE,
  UI_PRODUCT_STATUS_LOADING_BODY,
  UI_PRODUCT_STATUS_LOADING_TITLE,
  UI_SECTION_STATUS_ERROR,
  UI_SECTION_STATUS_LOADING,
  UI_SORT_ASC,
  UI_TABLE_PAGE_SIZE_DEFAULT,
} from '../../ui/constants'
import { SectionStatus } from '../../ui/feedback/SectionStatus'
import { Page } from '../../ui/layout/Page'
import { PageHeader } from '../../ui/layout/PageHeader'
import type { UiDataTableSortState, UiSelectOption, UiSortDirection } from '../../ui/types'
import { ProductManagementPanel } from '../../ui/workflows/ProductManagementPanel'

export function ProductsRouteComponent() {
  const client = useApiClient()
  const { user: currentUser } = useAuth()
  const { data, isLoading, isError, refetch } = useAdminProducts(client)
  const { data: tenantsData } = useAdminTenants(client)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [sortState, setSortState] = useState<UiDataTableSortState | undefined>()

  const allFilteredProducts = useMemo(() => {
    let list = Array.isArray(data) ? data : (data?.data ?? [])
    const tenants = Array.isArray(tenantsData) ? tenantsData : (tenantsData?.data ?? [])
    const tenantMap = new Map(tenants.map((t) => [t.id, t.name]))

    // Map vendor names
    list = list.map((product) => ({
      ...product,
      vendorName: tenantMap.get(product.vendorId),
    }))

    // Vendor Scoping
    if (isVendorScopedUser(currentUser)) {
      list = list.filter((product) => isProductOwnedByUser(currentUser, product))
    }

    // Search Filtering
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      list = list.filter(
        (product) => product.name.toLowerCase().includes(term) || product.slug.toLowerCase().includes(term)
      )
    }

    // Status Filtering
    if (statusFilter) {
      const isActive = statusFilter === 'true'
      list = list.filter((product) => product.isActive === isActive)
    }

    // Sorting
    if (sortState) {
      list = [...list].sort((a, b) => {
        const aValue = a[sortState.columnId as keyof typeof a]
        const bValue = b[sortState.columnId as keyof typeof b]

        if (aValue === bValue) {
          return 0
        }

        // Handle null/undefined
        if (aValue === null || aValue === undefined) {
          return 1
        }
        if (bValue === null || bValue === undefined) {
          return -1
        }

        const compareResult = aValue < bValue ? -1 : 1
        return sortState.direction === UI_SORT_ASC ? compareResult : -compareResult
      })
    } else {
      // Default sort by name asc
      list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    }

    return list
  }, [currentUser, data, tenantsData, searchTerm, statusFilter, sortState])

  const vendorOptions = useMemo((): UiSelectOption[] => {
    const tenants = Array.isArray(tenantsData) ? tenantsData : (tenantsData?.data ?? [])
    return tenants.map((tenant) => ({
      value: tenant.id,
      label: tenant.name,
    }))
  }, [tenantsData])

  const paginatedProducts = useMemo(() => {
    const startIndex = (page - 1) * UI_TABLE_PAGE_SIZE_DEFAULT
    return allFilteredProducts.slice(startIndex, startIndex + UI_TABLE_PAGE_SIZE_DEFAULT)
  }, [allFilteredProducts, page])

  const totalPages = Math.max(1, Math.ceil(allFilteredProducts.length / UI_TABLE_PAGE_SIZE_DEFAULT))

  const canView = canViewProducts(currentUser)

  const handleRefresh = () => {
    void refetch()
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setPage(1)
  }

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status)
    setPage(1)
  }

  const handleSort = (columnId: string, direction: UiSortDirection) => {
    setSortState({ columnId, direction })
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
        <ProductManagementPanel
          client={client}
          products={paginatedProducts}
          currentUser={currentUser ?? undefined}
          vendorOptions={vendorOptions}
          onRefresh={handleRefresh}
          searchTerm={searchTerm}
          onSearchChange={handleSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusFilterChange}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          sortState={sortState}
          onSortChange={handleSort}
        />
      ) : null}
    </Page>
  )
}
