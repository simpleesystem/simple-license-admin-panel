import {
  UI_ENTITY_LINK_LABEL_VIEW_LICENSES,
  UI_ENTITY_LINK_LABEL_VIEW_PRODUCT,
  UI_ENTITY_LINK_LABEL_VIEW_TENANT,
} from '../../ui/constants'
import { ROUTE_PATH_LICENSES, ROUTE_PATH_PRODUCTS, ROUTE_PATH_TENANTS } from '../constants'

export const ENTITY_LINK_KIND_PRODUCT = 'product' as const
export const ENTITY_LINK_KIND_LICENSES_FOR_PRODUCT = 'licensesForProduct' as const
export const ENTITY_LINK_KIND_LICENSES_FOR_CUSTOMER = 'licensesForCustomer' as const
export const ENTITY_LINK_KIND_TENANT = 'tenant' as const

export type EntityLinkKind =
  | typeof ENTITY_LINK_KIND_PRODUCT
  | typeof ENTITY_LINK_KIND_LICENSES_FOR_PRODUCT
  | typeof ENTITY_LINK_KIND_LICENSES_FOR_CUSTOMER
  | typeof ENTITY_LINK_KIND_TENANT

export type EntityLinkTarget = {
  /** Destination route path. */
  to: string
  /** Search term used to pre-filter the destination table (empty when not applicable). */
  searchTerm: string
  /** Human-readable affordance describing where the link leads. */
  title: string
}

type EntityLinkResolver = (value: string) => EntityLinkTarget

const ENTITY_LINK_RESOLVERS: Record<EntityLinkKind, EntityLinkResolver> = {
  [ENTITY_LINK_KIND_PRODUCT]: (value) => ({
    to: ROUTE_PATH_PRODUCTS,
    searchTerm: value,
    title: UI_ENTITY_LINK_LABEL_VIEW_PRODUCT,
  }),
  [ENTITY_LINK_KIND_LICENSES_FOR_PRODUCT]: (value) => ({
    to: ROUTE_PATH_LICENSES,
    searchTerm: value,
    title: UI_ENTITY_LINK_LABEL_VIEW_LICENSES,
  }),
  [ENTITY_LINK_KIND_LICENSES_FOR_CUSTOMER]: (value) => ({
    to: ROUTE_PATH_LICENSES,
    searchTerm: value,
    title: UI_ENTITY_LINK_LABEL_VIEW_LICENSES,
  }),
  [ENTITY_LINK_KIND_TENANT]: (value) => ({
    to: ROUTE_PATH_TENANTS,
    searchTerm: value,
    title: UI_ENTITY_LINK_LABEL_VIEW_TENANT,
  }),
}

export const buildEntityLinkTarget = (kind: EntityLinkKind, value: string): EntityLinkTarget => {
  const resolver = ENTITY_LINK_RESOLVERS[kind]
  return resolver(value.trim())
}
