import { useCallback, useEffect, useMemo, useState } from 'react'
import type { License } from '@/simpleLicense'
import { useAdminLicenses, useAdminProducts, useAdminTenants } from '@/simpleLicense'

import { useApiClient } from '../../api/apiContext'
import { canViewLicenses, isLicenseOwnedByUser } from '../../app/auth/permissions'
import { useAuth } from '../../app/auth/useAuth'
import { useLogger } from '../../app/logging/loggerContext'
import {
  UI_LICENSE_COLUMN_ID_CUSTOMER,
  UI_LICENSE_COLUMN_ID_DOMAIN,
  UI_LICENSE_COLUMN_ID_PRODUCT,
  UI_LICENSE_COLUMN_ID_STATUS,
  UI_LICENSE_COLUMN_ID_TIER,
  UI_LICENSE_PRODUCT_FILTER_LABEL,
  UI_LICENSE_STATUS_ACTION_RETRY,
  UI_LICENSE_STATUS_ERROR_BODY,
  UI_LICENSE_STATUS_ERROR_TITLE,
  UI_LICENSE_STATUS_LOADING_BODY,
  UI_LICENSE_STATUS_LOADING_TITLE,
  UI_PAGE_SUBTITLE_LICENSES,
  UI_PAGE_TITLE_LICENSES,
  UI_PAGE_VARIANT_FULL_WIDTH,
  UI_SORT_ASC,
  UI_TENANT_FILTER_ALL,
} from '../../ui/constants'
import { useDataTableState } from '../../ui/data/useDataTableState'
import { useTableState } from '../../ui/data/useTableState'
import { RouteStatus } from '../../ui/feedback/RouteStatus'
import { Page } from '../../ui/layout/Page'
import { PageHeader } from '../../ui/layout/PageHeader'
import type { UiSelectOption } from '../../ui/types'
import type { LicenseListItem } from '../../ui/workflows/LicenseManagementPanel'
import { LicenseManagementPanel } from '../../ui/workflows/LicenseManagementPanel'
import { usePagedFilters } from '../shared/usePagedFilters'
import { useTenantScopedProducts } from '../shared/useTenantScopedProducts'

type LicenseFilters = {
  status: string
  tenantId: string
  productSlug: string
}

export function LicensesRouteComponent() {
  const client = useApiClient()
  const logger = useLogger()
  const { user: currentUser } = useAuth()
  const { data, isLoading, isError, refetch } = useAdminLicenses(client)
  const { data: productsData } = useAdminProducts(client)
  const { data: tenantsData } = useAdminTenants(client)
  const tableState = useTableState<LicenseFilters>({
    initialFilters: {
      status: '',
      tenantId: '',
      productSlug: '',
    },
  })
  const selectedTenantId = tableState.filters.tenantId
  const selectedProductSlug = tableState.filters.productSlug
  const [tierOptions, setTierOptions] = useState<{ value: string; label: string }[]>([])

  const { filteredProducts, isVendorScoped, tenantOptions, showTenantFilter } = useTenantScopedProducts({
    currentUser,
    products: productsData,
    tenants: tenantsData,
    selectedTenantId,
    allOptionLabel: UI_TENANT_FILTER_ALL,
  })

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
            const tiers = Array.isArray(response) ? response : (response?.data ?? [])

            for (const tier of tiers) {
              allTiers.push({
                value: tier.tierCode,
                label: `${product.name} - ${tier.tierName}`,
              })
            }
          } catch (e) {
            logger.error(e instanceof Error ? e : new Error(String(e)), {
              message: `Failed to fetch tiers for product ${product.name}`,
            })
          }
        })
      )

      // Sort tiers by label for better UX
      allTiers.sort((a, b) => a.label.localeCompare(b.label))
      setTierOptions(allTiers)
    }

    void fetchTiers()
  }, [client, productsData, logger])

  const filteredProductOptions = useMemo<UiSelectOption[]>(() => {
    const options = filteredProducts.map((product) => ({ value: product.slug, label: product.name }))
    options.sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }))
    return [{ value: '', label: UI_LICENSE_PRODUCT_FILTER_LABEL }, ...options]
  }, [filteredProducts])

  const visibleLicenses = useMemo<LicenseListItem[]>(() => {
    let list = Array.isArray(data) ? (data as LicenseListItem[]) : ((data?.data as LicenseListItem[]) ?? [])
    list = list.filter((license) => license.softDeletedAt == null)

    if (isVendorScoped) {
      list = list.filter((license) => {
        // LicenseListItem is compatible with License for ownership checks
        return isLicenseOwnedByUser(currentUser, license as unknown as License)
      })
    }

    return list
  }, [currentUser, data, isVendorScoped])

  const searchLicenses = useCallback((license: LicenseListItem, term: string) => {
    const needle = term.toLowerCase()
    return (
      (license.customerEmail?.toLowerCase().includes(needle) ?? false) ||
      (license.productSlug?.toLowerCase().includes(needle) ?? false)
    )
  }, [])

  const compareText = useCallback(
    (getValue: (license: LicenseListItem) => string | null | undefined) => (a: LicenseListItem, b: LicenseListItem) =>
      (getValue(a) ?? '').localeCompare(getValue(b) ?? '', undefined, { numeric: true, sensitivity: 'base' }),
    []
  )

  const sortComparators = useMemo(
    () => ({
      [UI_LICENSE_COLUMN_ID_CUSTOMER]: compareText((license) => license.customerEmail),
      [UI_LICENSE_COLUMN_ID_PRODUCT]: compareText((license) => license.productSlug),
      [UI_LICENSE_COLUMN_ID_DOMAIN]: compareText((license) => license.domain),
      [UI_LICENSE_COLUMN_ID_TIER]: compareText((license) => license.tierCode),
      [UI_LICENSE_COLUMN_ID_STATUS]: compareText((license) => license.status),
    }),
    [compareText]
  )

  const licenseTable = useDataTableState({
    data: visibleLicenses,
    initialSort: { columnId: UI_LICENSE_COLUMN_ID_CUSTOMER, direction: UI_SORT_ASC },
    search: searchLicenses,
    filter: (license) => {
      const statusFilter = tableState.filters.status
      if (statusFilter && license.status !== statusFilter) {
        return false
      }
      const tenantFilter = tableState.filters.tenantId
      if (tenantFilter && license.vendorId !== tenantFilter) {
        return false
      }
      const productFilter = tableState.filters.productSlug
      if (productFilter && license.productSlug !== productFilter) {
        return false
      }
      return true
    },
    sortComparators,
  })

  const canView = canViewLicenses(currentUser ?? null)
  const { setFilterAndReset, setFiltersAndReset } = usePagedFilters<LicenseFilters>(
    tableState.setFilter,
    licenseTable.goToPage
  )

  const handleRefresh = () => {
    void refetch()
  }

  return (
    <Page variant={UI_PAGE_VARIANT_FULL_WIDTH}>
      <PageHeader title={UI_PAGE_TITLE_LICENSES} subtitle={UI_PAGE_SUBTITLE_LICENSES} />

      <RouteStatus
        isLoading={isLoading}
        isError={isError}
        loadingTitle={UI_LICENSE_STATUS_LOADING_TITLE}
        loadingMessage={UI_LICENSE_STATUS_LOADING_BODY}
        errorTitle={UI_LICENSE_STATUS_ERROR_TITLE}
        errorMessage={UI_LICENSE_STATUS_ERROR_BODY}
        retryLabel={UI_LICENSE_STATUS_ACTION_RETRY}
        onRetry={handleRefresh}
      />

      {!isLoading && !isError && canView ? (
        <LicenseManagementPanel
          client={client}
          licenses={licenseTable.rows}
          currentUser={currentUser ?? undefined}
          onRefresh={handleRefresh}
          searchTerm={licenseTable.searchTerm}
          onSearchChange={licenseTable.setSearchTerm}
          statusFilter={tableState.filters.status}
          onStatusFilterChange={(value) => setFilterAndReset('status', value)}
          selectedTenantId={selectedTenantId}
          tenantOptions={tenantOptions}
          showTenantFilter={showTenantFilter}
          onTenantFilterChange={(value) => setFiltersAndReset({ tenantId: value, productSlug: '' })}
          selectedProductSlug={selectedProductSlug}
          onProductFilterChange={(value) => setFilterAndReset('productSlug', value)}
          page={licenseTable.page}
          totalPages={licenseTable.totalPages}
          onPageChange={licenseTable.goToPage}
          sortState={licenseTable.sortState}
          onSortChange={licenseTable.onSort}
          productOptions={filteredProductOptions}
          tierOptions={tierOptions}
        />
      ) : null}
    </Page>
  )
}
