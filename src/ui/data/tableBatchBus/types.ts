import type { Client, User } from '@/simpleLicense'

export const TABLE_BATCH_TABLE_LICENSES = 'licenses' as const
export const TABLE_BATCH_TABLE_RELEASES = 'releases' as const
export const TABLE_BATCH_TABLE_PRODUCTS = 'products' as const
export const TABLE_BATCH_TABLE_USERS = 'users' as const
export const TABLE_BATCH_TABLE_TENANTS = 'tenants' as const
export const TABLE_BATCH_TABLE_PRODUCT_TIERS = 'product-tiers' as const
export const TABLE_BATCH_TABLE_ENTITLEMENTS = 'entitlements' as const
export const TABLE_BATCH_TABLE_AGENT_CREDENTIALS = 'agent-credentials' as const
export const TABLE_BATCH_TABLE_PROTECTION_BUILD_TOKENS = 'protection-build-tokens' as const

export type TableBatchTableId =
  | typeof TABLE_BATCH_TABLE_LICENSES
  | typeof TABLE_BATCH_TABLE_RELEASES
  | typeof TABLE_BATCH_TABLE_PRODUCTS
  | typeof TABLE_BATCH_TABLE_USERS
  | typeof TABLE_BATCH_TABLE_TENANTS
  | typeof TABLE_BATCH_TABLE_PRODUCT_TIERS
  | typeof TABLE_BATCH_TABLE_ENTITLEMENTS
  | typeof TABLE_BATCH_TABLE_AGENT_CREDENTIALS
  | typeof TABLE_BATCH_TABLE_PROTECTION_BUILD_TOKENS

export type TableBatchBusContextMap = {
  [TABLE_BATCH_TABLE_LICENSES]: {
    client: Client
    currentUser?: User | null
    onRefresh?: () => void
  }
  [TABLE_BATCH_TABLE_RELEASES]: {
    client: Client
    productId: string
    onRefresh?: () => void
  }
  [TABLE_BATCH_TABLE_PRODUCTS]: {
    client: Client
    currentUser?: User | null
    onRefresh?: () => void
  }
  [TABLE_BATCH_TABLE_USERS]: {
    client: Client
    currentUser?: Pick<User, 'id' | 'role' | 'vendorId'>
    onRefresh?: () => void
  }
  [TABLE_BATCH_TABLE_TENANTS]: {
    client: Client
    onRefresh?: () => void
  }
  [TABLE_BATCH_TABLE_PRODUCT_TIERS]: {
    client: Client
    productId: string
    currentUser?: User | null
    onRefresh?: () => void
  }
  [TABLE_BATCH_TABLE_ENTITLEMENTS]: {
    client: Client
    productId: string
    currentUser?: User | null
    onRefresh?: () => void
  }
  [TABLE_BATCH_TABLE_AGENT_CREDENTIALS]: {
    client: Client
    onRefresh?: () => void
  }
  [TABLE_BATCH_TABLE_PROTECTION_BUILD_TOKENS]: {
    client: Client
    productId: string
    onRefresh?: () => void
  }
}
