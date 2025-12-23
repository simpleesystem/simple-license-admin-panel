import type { Client, Entitlement, Product, ProductTier, UpdateProductRequest, User } from '@/simpleLicense'
import { useUpdateProduct } from '@/simpleLicense'
import { useCallback, useEffect, useState } from 'react'
import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'

import type { MutationAdapter } from '../actions/mutationActions'
import {
  UI_MODAL_SIZE_XL,
  UI_PRODUCT_FORM_PENDING_UPDATE,
  UI_PRODUCT_FORM_SUBMIT_UPDATE,
  UI_PRODUCT_FORM_TITLE_UPDATE,
} from '../constants'
import type { FormBlueprint } from '../formBuilder/blueprint'
import { DynamicForm } from '../formBuilder/DynamicForm'
import { createProductBlueprint } from '../formBuilder/factories'
import { useFormMutation } from '../formBuilder/useFormMutation'
import { ModalDialog } from '../overlay/ModalDialog'
import { wrapMutationAdapter } from './mutationHelpers'
import { ProductEntitlementManagementPanel } from './ProductEntitlementManagementPanel'
import type { ProductEntitlementListItem } from './ProductEntitlementRowActions'
import { type ProductTierListItem, ProductTierManagementPanel } from './ProductTierManagementPanel'

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
}

type FormValuesUpdate = Omit<UpdateProductRequest, 'metadata'> & { metadata: string }

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
}: ProductUpdateDialogProps) {
  const [activeTab, setActiveTab] = useState('details')
  const [tiers, setTiers] = useState<ProductTierListItem[]>([])
  const [entitlements, setEntitlements] = useState<ProductEntitlementListItem[]>([])
  const [metadataString, setMetadataString] = useState<string>('')
  const [product, setProduct] = useState<Product | null>(null)

  // Data Fetching
  const fetchTiers = useCallback(async () => {
    try {
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
        vendorId: product?.vendorId, // Use fetched product vendorId
      }))

      setTiers(formatted)
    } catch (e) {
      console.error('Failed to fetch tiers', e)
    }
  }, [client, productId, product?.vendorId])

  const fetchEntitlements = useCallback(async () => {
    try {
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
        productTiers: Array.isArray((e as unknown as { productTiers?: unknown }).productTiers)
          ? ((e as unknown as { productTiers: Array<{ id: string; tierCode: string }> }).productTiers)
          : undefined,
        metadata: (e as unknown as { metadata: Record<string, string | number | boolean | null> | undefined }).metadata,
      }))
      setEntitlements(formatted)
    } catch (e) {
      console.error('Failed to fetch entitlements', e)
    }
  }, [client, productId])

  const fetchProductDetails = useCallback(async () => {
    try {
      const response = await client.getProduct(productId)
      const productData = response.product as Product & { metadata?: unknown }
      setProduct(productData)
      if (productData?.metadata) {
        setMetadataString(JSON.stringify(productData.metadata, null, 2))
      }
    } catch (e) {
      console.error('Failed to fetch product details', e)
    }
  }, [client, productId])

  useEffect(() => {
    if (show) {
      const load = async () => {
        await fetchProductDetails()
        await fetchEntitlements()
      }
      void load()
    }
  }, [show, fetchProductDetails, fetchEntitlements])

  // Fetch tiers when show changes or when product (and thus fetchTiers) changes
  useEffect(() => {
    if (show) {
      const load = async () => {
        await fetchTiers()
      }
      void load()
    }
  }, [show, fetchTiers])

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
        metadata: values.metadata ? JSON.parse(values.metadata) : undefined,
      }
      const result = await updateMutation.mutateAsync({ id: productId, data })
      return result
    },
    isPending: updateMutation.isPending,
  }

  const wrappedMutation = wrapMutationAdapter(adapter, {
    onClose, // Don't close on success immediately if we want to stay? usually form submit closes modal.
    onCompleted,
    onSuccess,
    onError,
  })

  // We wrap the submit handler to close the modal after success
  const { handleSubmit } = useFormMutation({
    mutation: wrappedMutation,
    onSuccess: () => {
      onSuccess?.()
      onClose()
    },
    onError,
  })

  const blueprint = createProductBlueprint('update') as unknown as FormBlueprint<FormValuesUpdate>
  const defaultValues: FormValuesUpdate = {
    name: initialValues?.name,
    slug: initialValues?.slug,
    description: initialValues?.description,
    metadata: metadataString || (initialValues?.metadata ? JSON.stringify(initialValues.metadata, null, 2) : ''),
  }

  // Effect to update default values when metadata is fetched
  // DynamicForm listens to defaultValues changes

  return (
    <ModalDialog
      show={show}
      onClose={onClose}
      title={UI_PRODUCT_FORM_TITLE_UPDATE}
      size={UI_MODAL_SIZE_XL}
      body={
        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'details')} className="mb-4">
          <Tab eventKey="details" title="Details">
            <DynamicForm
              blueprint={blueprint}
              defaultValues={defaultValues}
              onSubmit={handleSubmit}
              submitLabel={UI_PRODUCT_FORM_SUBMIT_UPDATE}
              pendingLabel={UI_PRODUCT_FORM_PENDING_UPDATE}
              cancelLabel="Cancel"
              onCancel={onClose}
            />
          </Tab>
          <Tab eventKey="tiers" title="Tiers">
            <div className="pt-2">
              <ProductTierManagementPanel
                client={client}
                productId={productId}
                tiers={tiers}
                page={1} // Simplified for now, assuming small list or handled internally
                totalPages={1}
                onPageChange={() => {}}
                onRefresh={fetchTiers}
                currentUser={currentUser}
              />
            </div>
          </Tab>
          <Tab eventKey="entitlements" title="Entitlements">
            <div className="pt-2">
              <ProductEntitlementManagementPanel
                client={client}
                productId={productId}
                entitlements={entitlements}
                page={1}
                totalPages={1}
                onPageChange={() => {}}
                onRefresh={fetchEntitlements}
                currentUser={currentUser}
                tierOptions={tierOptions}
              />
            </div>
          </Tab>
        </Tabs>
      }
      footer={null} // We rely on DynamicForm actions or Tab content actions
    />
  )
}
