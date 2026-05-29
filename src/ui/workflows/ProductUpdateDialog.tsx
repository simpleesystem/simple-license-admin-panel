import { useCallback, useEffect, useMemo, useState } from 'react'
import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'
import type { Client, Entitlement, Product, ProductTier, UpdateProductRequest, User } from '@/simpleLicense'
import { useUpdateProduct } from '@/simpleLicense'
import { useLogger } from '../../app/logging/loggerContext'

import type { MutationAdapter } from '../actions/mutationActions'
import {
  UI_CLASS_MARGIN_BOTTOM_LARGE,
  UI_CLASS_PADDING_TOP_SMALL,
  UI_ENTITLEMENT_STATUS_ACTION_RETRY,
  UI_ENTITLEMENT_STATUS_ERROR_BODY,
  UI_ENTITLEMENT_STATUS_ERROR_TITLE,
  UI_ENTITLEMENT_STATUS_LOADING_BODY,
  UI_ENTITLEMENT_STATUS_LOADING_TITLE,
  UI_FORM_SELECT_PLACEHOLDER_VALUE,
  UI_MODAL_SIZE_XL,
  UI_PRODUCT_FORM_PENDING_UPDATE,
  UI_PRODUCT_FORM_SUBMIT_UPDATE,
  UI_PRODUCT_FORM_TITLE_UPDATE,
  UI_PRODUCT_STATUS_ACTION_RETRY,
  UI_PRODUCT_STATUS_ERROR_BODY,
  UI_PRODUCT_STATUS_ERROR_TITLE,
  UI_PRODUCT_STATUS_LOADING_BODY,
  UI_PRODUCT_STATUS_LOADING_TITLE,
  UI_PRODUCT_TIER_STATUS_ACTION_RETRY,
  UI_PRODUCT_TIER_STATUS_ERROR_BODY,
  UI_PRODUCT_TIER_STATUS_ERROR_TITLE,
  UI_PRODUCT_TIER_STATUS_LOADING_BODY,
  UI_PRODUCT_TIER_STATUS_LOADING_TITLE,
} from '../constants'
import { AsyncStatusGate } from '../feedback/AsyncStatusGate'
import type { FormBlueprint } from '../formBuilder/blueprint'
import { DynamicForm } from '../formBuilder/DynamicForm'
import { createProductBlueprint } from '../formBuilder/factories'
import { ModalDialog } from '../overlay/ModalDialog'
import type { UiSelectOption } from '../types'
import { ProductEntitlementManagementPanel } from './ProductEntitlementManagementPanel'
import type { ProductEntitlementListItem } from './ProductEntitlementRowActions'
import { type ProductTierListItem, ProductTierManagementPanel } from './ProductTierManagementPanel'
import { useDialogFormMutation } from './useDialogFormMutation'

type ProductUpdateDialogProps = {
  client: Client
  productId: string
  show: boolean
  onClose: () => void
  onCompleted?: () => void
  onSuccess?: () => void
  onError?: (error: unknown) => void
  initialValues?: Partial<UpdateProductRequest>
  currentUser?: User | null
  vendorOptions?: readonly UiSelectOption[]
}

type FormValuesUpdate = Omit<UpdateProductRequest, 'metadata'> & { metadata: string }

const sanitizeSelectValue = (value: string | undefined): string | undefined => {
  if (!value || value === UI_FORM_SELECT_PLACEHOLDER_VALUE) {
    return undefined
  }
  return value
}

export function ProductUpdateDialog({
  client,
  productId,
  show,
  onClose,
  onCompleted,
  onSuccess,
  onError,
  initialValues,
  currentUser,
  vendorOptions,
}: ProductUpdateDialogProps) {
  const logger = useLogger()
  const [activeTab, setActiveTab] = useState('details')
  const [tiers, setTiers] = useState<ProductTierListItem[]>([])
  const [entitlements, setEntitlements] = useState<ProductEntitlementListItem[]>([])
  const [metadataString, setMetadataString] = useState<string>('')
  const [product, setProduct] = useState<Product | null>(null)
  const [isProductLoading, setIsProductLoading] = useState(false)
  const [isProductError, setIsProductError] = useState(false)
  const [isTiersLoading, setIsTiersLoading] = useState(false)
  const [isTiersError, setIsTiersError] = useState(false)
  const [isEntitlementsLoading, setIsEntitlementsLoading] = useState(false)
  const [isEntitlementsError, setIsEntitlementsError] = useState(false)

  // Data Fetching
  const fetchTiers = useCallback(async () => {
    if (!show) {
      return
    }
    try {
      if (!product) {
        setTiers([])
        setIsTiersError(false)
        setIsTiersLoading(false)
        return
      }
      setIsTiersLoading(true)
      setIsTiersError(false)
      const response = await client.listProductTiers(productId)

      // Runtime fix: client.listProductTiers returns the array directly (unwrapped),
      // but TypeScript thinks it returns the wrapper object.
      // We handle both cases to be safe.
      const rawData = response as unknown
      const data = Array.isArray(rawData) ? rawData : (response as { data?: ProductTier[] }).data || []

      const formatted: ProductTierListItem[] = data.map((t: ProductTier) => ({
        id: t.id,
        tierCode: t.tierCode,
        tierName: t.tierName,
        isActive: t.isActive,
        vendorId: product.vendorId,
      }))

      setTiers(formatted)
    } catch (e) {
      logger.error(e instanceof Error ? e : new Error(String(e)), { message: 'Failed to fetch tiers' })
      setTiers([])
      setIsTiersError(true)
    } finally {
      setIsTiersLoading(false)
    }
  }, [client, productId, product, logger, show])

  const fetchEntitlements = useCallback(async () => {
    if (!show) {
      return
    }
    try {
      if (!product) {
        setEntitlements([])
        setIsEntitlementsError(false)
        setIsEntitlementsLoading(false)
        return
      }
      setIsEntitlementsLoading(true)
      setIsEntitlementsError(false)
      const response = await client.listEntitlements(productId)
      // Runtime fix: client.listEntitlements returns the array directly (unwrapped)
      const rawData = response as unknown
      const data = Array.isArray(rawData) ? rawData : (response as { data?: Entitlement[] }).data || []

      const formatted: ProductEntitlementListItem[] = data.map((e: Entitlement) => ({
        id: e.id,
        key: e.key,
        number_value: e.numberValue,
        boolean_value: e.booleanValue,
        string_value: e.stringValue,
        vendorId: product.vendorId,
        productTiers: Array.isArray((e as unknown as { productTiers?: unknown }).productTiers)
          ? (e as unknown as { productTiers: Array<{ id: string; tierCode: string }> }).productTiers
          : undefined,
        metadata: (e as unknown as { metadata: Record<string, string | number | boolean | null> | undefined }).metadata,
      }))
      setEntitlements(formatted)
    } catch (e) {
      logger.error(e instanceof Error ? e : new Error(String(e)), { message: 'Failed to fetch entitlements' })
      setEntitlements([])
      setIsEntitlementsError(true)
    } finally {
      setIsEntitlementsLoading(false)
    }
  }, [client, productId, product, logger, show])

  const fetchProductDetails = useCallback(async () => {
    if (!show) {
      return
    }
    setIsProductLoading(true)
    setIsProductError(false)
    try {
      const response = await client.getProduct(productId)
      const productData = response.product as Product & { metadata?: unknown }
      setProduct(productData)
      if (productData?.metadata) {
        setMetadataString(JSON.stringify(productData.metadata, null, 2))
      } else {
        setMetadataString('')
      }
    } catch (e) {
      logger.error(e instanceof Error ? e : new Error(String(e)), { message: 'Failed to fetch product details' })
      setProduct(null)
      setIsProductError(true)
    } finally {
      setIsProductLoading(false)
    }
  }, [client, productId, logger, show])

  // Fetch product when dialog opens; defer to avoid setState synchronously in effect (react-hooks/set-state-in-effect)
  useEffect(() => {
    if (!show) {
      return
    }
    const id = setTimeout(() => {
      void fetchProductDetails()
    }, 0)
    return () => clearTimeout(id)
  }, [show, fetchProductDetails])

  // Fetch tiers and entitlements only when dialog is open and product is loaded (avoids double fetch)
  useEffect(() => {
    if (show && product) {
      const load = async () => {
        await fetchTiers()
        await fetchEntitlements()
      }
      void load()
    }
  }, [show, product, fetchTiers, fetchEntitlements])

  // Callbacks for manual refresh (e.g. from child panels)
  // const refreshTiers = useCallback(() => { ... }, [])

  // Computed options for Entitlement form
  const tierOptions = tiers.map((t) => ({ value: t.id, label: `${t.tierName} (${t.tierCode})` }))

  // Mutation Logic for Details Tab
  const updateMutation = useUpdateProduct(client)

  const adapter: MutationAdapter<FormValuesUpdate> = {
    mutateAsync: async (values) => {
      const data: UpdateProductRequest = {
        ...values,
        vendor_id: sanitizeSelectValue(values.vendor_id),
        metadata: values.metadata ? JSON.parse(values.metadata) : undefined,
      }
      const result = await updateMutation.mutateAsync({ id: productId, data })
      return result
    },
    isPending: updateMutation.isPending,
  }

  const { handleSubmit } = useDialogFormMutation({
    mutation: adapter,
    onCompleted,
    onSuccess,
    onError,
    onClose,
  })

  const blueprint = createProductBlueprint('update', {
    vendorOptions,
    currentUser: currentUser ?? undefined,
  }) as unknown as FormBlueprint<FormValuesUpdate>

  const defaultValues = useMemo<FormValuesUpdate>(
    () => ({
      name: initialValues?.name,
      slug: initialValues?.slug,
      description: initialValues?.description,
      sync_to_woo_catalog: product?.syncToWooCatalog ?? initialValues?.sync_to_woo_catalog,
      metadata: metadataString || (initialValues?.metadata ? JSON.stringify(initialValues.metadata, null, 2) : ''),
      vendor_id: product?.vendorId ?? initialValues?.vendor_id,
    }),
    [initialValues, metadataString, product?.syncToWooCatalog, product?.vendorId]
  )

  return (
    <ModalDialog
      show={show}
      onClose={onClose}
      title={UI_PRODUCT_FORM_TITLE_UPDATE}
      size={UI_MODAL_SIZE_XL}
      body={
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k || 'details')}
          className={UI_CLASS_MARGIN_BOTTOM_LARGE}
        >
          <Tab eventKey="details" title="Details">
            <AsyncStatusGate
              isLoading={isProductLoading}
              isError={isProductError}
              loadingTitle={UI_PRODUCT_STATUS_LOADING_TITLE}
              loadingMessage={UI_PRODUCT_STATUS_LOADING_BODY}
              errorTitle={UI_PRODUCT_STATUS_ERROR_TITLE}
              errorMessage={UI_PRODUCT_STATUS_ERROR_BODY}
              retryLabel={UI_PRODUCT_STATUS_ACTION_RETRY}
              onRetry={() => {
                void fetchProductDetails()
              }}
            >
              <DynamicForm
                blueprint={blueprint}
                defaultValues={defaultValues}
                onSubmit={handleSubmit}
                submitLabel={UI_PRODUCT_FORM_SUBMIT_UPDATE}
                pendingLabel={UI_PRODUCT_FORM_PENDING_UPDATE}
                cancelLabel="Cancel"
                onCancel={onClose}
              />
            </AsyncStatusGate>
          </Tab>
          <Tab eventKey="tiers" title="Tiers">
            <div className={UI_CLASS_PADDING_TOP_SMALL}>
              <AsyncStatusGate
                isLoading={isTiersLoading}
                isError={isTiersError}
                loadingTitle={UI_PRODUCT_TIER_STATUS_LOADING_TITLE}
                loadingMessage={UI_PRODUCT_TIER_STATUS_LOADING_BODY}
                errorTitle={UI_PRODUCT_TIER_STATUS_ERROR_TITLE}
                errorMessage={UI_PRODUCT_TIER_STATUS_ERROR_BODY}
                retryLabel={UI_PRODUCT_TIER_STATUS_ACTION_RETRY}
                onRetry={() => {
                  void fetchTiers()
                }}
              >
                <ProductTierManagementPanel
                  client={client}
                  productId={productId}
                  tiers={tiers}
                  onRefresh={fetchTiers}
                  currentUser={currentUser}
                />
              </AsyncStatusGate>
            </div>
          </Tab>
          <Tab eventKey="entitlements" title="Entitlements">
            <div className={UI_CLASS_PADDING_TOP_SMALL}>
              <AsyncStatusGate
                isLoading={isEntitlementsLoading}
                isError={isEntitlementsError}
                loadingTitle={UI_ENTITLEMENT_STATUS_LOADING_TITLE}
                loadingMessage={UI_ENTITLEMENT_STATUS_LOADING_BODY}
                errorTitle={UI_ENTITLEMENT_STATUS_ERROR_TITLE}
                errorMessage={UI_ENTITLEMENT_STATUS_ERROR_BODY}
                retryLabel={UI_ENTITLEMENT_STATUS_ACTION_RETRY}
                onRetry={() => {
                  void fetchEntitlements()
                }}
              >
                <ProductEntitlementManagementPanel
                  client={client}
                  productId={productId}
                  entitlements={entitlements}
                  onRefresh={fetchEntitlements}
                  currentUser={currentUser}
                  tierOptions={tierOptions}
                />
              </AsyncStatusGate>
            </div>
          </Tab>
        </Tabs>
      }
      footer={null} // We rely on DynamicForm actions or Tab content actions
    />
  )
}
