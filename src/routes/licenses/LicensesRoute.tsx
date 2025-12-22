import { useAdminLicenses, useAdminProducts } from '@simple-license/react-sdk'
import { useEffect, useMemo, useState } from 'react'

import { useApiClient } from '../../api/apiContext'
import { canViewLicenses, isLicenseOwnedByUser, isVendorScopedUser } from '../../app/auth/permissions'
import { useAuth } from '../../app/auth/useAuth'
import {
  UI_LICENSE_STATUS_ACTION_RETRY,
  UI_LICENSE_STATUS_ERROR_BODY,
  UI_LICENSE_STATUS_ERROR_TITLE,
  UI_LICENSE_STATUS_LOADING_BODY,
  UI_LICENSE_STATUS_LOADING_TITLE,
  UI_PAGE_SUBTITLE_LICENSES,
  UI_PAGE_TITLE_LICENSES,
  UI_SECTION_STATUS_ERROR,
  UI_SECTION_STATUS_LOADING,
  UI_SORT_ASC,
  UI_TABLE_PAGE_SIZE_DEFAULT,
} from '../../ui/constants'
import { SectionStatus } from '../../ui/feedback/SectionStatus'
import { Page } from '../../ui/layout/Page'
import { PageHeader } from '../../ui/layout/PageHeader'
import type { UiDataTableSortState, UiSortDirection } from '../../ui/types'
import type { LicenseListItem } from '../../ui/workflows/LicenseManagementPanel'
import { LicenseManagementPanel } from '../../ui/workflows/LicenseManagementPanel'

export function LicensesRouteComponent() {
  const client = useApiClient()
  const { user: currentUser } = useAuth()
  console.log('LicensesRouteComponent: currentUser', currentUser)
  const { data, isLoading, isError, refetch } = useAdminLicenses(client)
  const { data: productsData } = useAdminProducts(client)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [sortState, setSortState] = useState<UiDataTableSortState | undefined>()
  const [tierOptions, setTierOptions] = useState<{ value: string; label: string }[]>([])

  useEffect(() => {
    const fetchTiers = async () => {
      const list = Array.isArray(productsData) ? productsData : (productsData?.data ?? [])
      if (!list.length) {
        return
      }

      const allTiers: { value: string; label: string }[] = []

      // Fetch tiers for all products
      await Promise.all(
        list.map(async (product) => {
          try {
            const response = await client.listProductTiers(product.id)
            const tiers = Array.isArray(response) ? response : (response.data ?? [])

            for (const tier of tiers) {
              allTiers.push({
                value: tier.tierCode,
                label: `${product.name} - ${tier.tierName}`,
              })
            }
          } catch (e) {
            console.error(`Failed to fetch tiers for product ${product.name}`, e)
          }
        })
      )

      // Sort tiers by label for better UX
      allTiers.sort((a, b) => a.label.localeCompare(b.label))
      setTierOptions(allTiers)
    }

    void fetchTiers()
  }, [client, productsData])

  const allFilteredLicenses = useMemo<LicenseListItem[]>(() => {
    let list = Array.isArray(data) ? (data as LicenseListItem[]) : ((data?.data as LicenseListItem[]) ?? [])

    // Vendor Scoping
    if (isVendorScopedUser(currentUser)) {
      list = list.filter((license) => isLicenseOwnedByUser(currentUser, license))
    }

    // Search Filtering
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      list = list.filter(
        (license) =>
          license.customerEmail?.toLowerCase().includes(term) || license.productSlug?.toLowerCase().includes(term)
      )
    }

    // Status Filtering
    if (statusFilter) {
      list = list.filter((license) => license.status === statusFilter)
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
      // Default sort by customer email asc
      list = [...list].sort((a, b) => (a.customerEmail ?? '').localeCompare(b.customerEmail ?? ''))
    }

    return list
  }, [currentUser, data, searchTerm, statusFilter, sortState])

  const paginatedLicenses = useMemo(() => {
    const startIndex = (page - 1) * UI_TABLE_PAGE_SIZE_DEFAULT
    return allFilteredLicenses.slice(startIndex, startIndex + UI_TABLE_PAGE_SIZE_DEFAULT)
  }, [allFilteredLicenses, page])

  const totalPages = Math.max(1, Math.ceil(allFilteredLicenses.length / UI_TABLE_PAGE_SIZE_DEFAULT))

  const productOptions = useMemo(() => {
    const list = Array.isArray(productsData) ? productsData : (productsData?.data ?? [])
    return list.map((p) => ({ value: p.slug, label: p.name }))
  }, [productsData])

  const canView = canViewLicenses(currentUser ?? null)
  console.log('LicensesRouteComponent: canView', canView)

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
      <PageHeader title={UI_PAGE_TITLE_LICENSES} subtitle={UI_PAGE_SUBTITLE_LICENSES} />

      {isLoading ? (
        <SectionStatus
          status={UI_SECTION_STATUS_LOADING}
          title={UI_LICENSE_STATUS_LOADING_TITLE}
          message={UI_LICENSE_STATUS_LOADING_BODY}
        />
      ) : null}

      {isError ? (
        <SectionStatus
          status={UI_SECTION_STATUS_ERROR}
          title={UI_LICENSE_STATUS_ERROR_TITLE}
          message={UI_LICENSE_STATUS_ERROR_BODY}
          actions={
            <button type="button" className="btn btn-secondary" onClick={handleRefresh}>
              {UI_LICENSE_STATUS_ACTION_RETRY}
            </button>
          }
        />
      ) : null}

      {!isLoading && !isError && canView ? (
        <LicenseManagementPanel
          client={client}
          licenses={paginatedLicenses}
          currentUser={currentUser ?? undefined}
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
          productOptions={productOptions}
          tierOptions={tierOptions}
        />
      ) : null}
    </Page>
  )
}
