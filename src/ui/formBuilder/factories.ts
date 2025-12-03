import type {
  CreateEntitlementRequest,
  CreateLicenseRequest,
  CreateProductRequest,
  CreateProductTierRequest,
  CreateTenantRequest,
  CreateUserRequest,
  UpdateAlertThresholdsRequest,
  UpdateEntitlementRequest,
  UpdateLicenseRequest,
  UpdateProductRequest,
  UpdateProductTierRequest,
  UpdateQuotaLimitsRequest,
  UpdateTenantRequest,
  UpdateUserRequest,
} from '@simple-license/react-sdk'
import type { FieldValues } from 'react-hook-form'

import {
  UI_ALERT_THRESHOLD_FORM_ID,
  UI_ALERT_THRESHOLD_FORM_TITLE,
  UI_ALERT_THRESHOLD_LABEL_HIGH_ACTIVATIONS,
  UI_ALERT_THRESHOLD_LABEL_HIGH_CONCURRENCY,
  UI_ALERT_THRESHOLD_LABEL_HIGH_VALIDATIONS,
  UI_ALERT_THRESHOLD_LABEL_MEDIUM_ACTIVATIONS,
  UI_ALERT_THRESHOLD_LABEL_MEDIUM_CONCURRENCY,
  UI_ALERT_THRESHOLD_LABEL_MEDIUM_VALIDATIONS,
  UI_ALERT_THRESHOLD_SECTION_HIGH,
  UI_ALERT_THRESHOLD_SECTION_MEDIUM,
  UI_ALERT_THRESHOLD_SECTION_TITLE_HIGH,
  UI_ALERT_THRESHOLD_SECTION_TITLE_MEDIUM,
  UI_ENTITLEMENT_VALUE_LABEL_BOOLEAN,
  UI_ENTITLEMENT_VALUE_LABEL_NUMBER,
  UI_ENTITLEMENT_VALUE_LABEL_STRING,
  UI_ENTITLEMENT_VALUE_TYPE_BOOLEAN,
  UI_ENTITLEMENT_VALUE_TYPE_NUMBER,
  UI_ENTITLEMENT_VALUE_TYPE_STRING,
  UI_FIELD_ALERT_HIGH_ACTIVATIONS,
  UI_FIELD_ALERT_HIGH_CONCURRENCY,
  UI_FIELD_ALERT_HIGH_VALIDATIONS,
  UI_FIELD_ALERT_MEDIUM_ACTIVATIONS,
  UI_FIELD_ALERT_MEDIUM_CONCURRENCY,
  UI_FIELD_ALERT_MEDIUM_VALIDATIONS,
  UI_FORM_CONTROL_TYPE_EMAIL,
  UI_FORM_CONTROL_TYPE_PASSWORD,
  UI_FORM_CONTROL_TYPE_TEXT,
  UI_FORM_TEXTAREA_MIN_ROWS,
} from '../constants'
import type { UiSelectOption } from '../types'
import type { FormBlueprint } from './blueprint'
import { type BlueprintConfig, type BlueprintSectionConfig, generateBlueprintFromType } from './typeIntrospection'

type BlueprintCustomizer<TFieldValues extends FieldValues> = (
  blueprint: FormBlueprint<TFieldValues>
) => FormBlueprint<TFieldValues>

type BaseFactoryOptions<TFieldValues extends FieldValues> = {
  customize?: BlueprintCustomizer<TFieldValues>
}

type LicenseBlueprintOptions<TFieldValues extends FieldValues> = BaseFactoryOptions<TFieldValues> & {
  productOptions?: readonly UiSelectOption[]
  tierOptions?: readonly UiSelectOption[]
}

const applyCustomize = <TFieldValues extends FieldValues>(
  blueprint: FormBlueprint<TFieldValues>,
  customize?: BlueprintCustomizer<TFieldValues>
) => (customize ? customize(blueprint) : blueprint)

const buildConfig = <TFieldValues extends FieldValues>(
  config: Omit<BlueprintConfig<TFieldValues>, 'sections'> & {
    sections: readonly BlueprintSectionConfig<TFieldValues>[]
  },
  customize?: BlueprintCustomizer<TFieldValues>
) => applyCustomize(generateBlueprintFromType(config), customize)

const buildCreateLicenseBlueprint = (options?: LicenseBlueprintOptions<CreateLicenseRequest>) => {
  const productOptions = options?.productOptions ?? []
  const tierOptions = options?.tierOptions ?? []
  const sections: BlueprintSectionConfig<CreateLicenseRequest>[] = [
    {
      id: 'details',
      layout: 2,
      fields: [
        {
          name: 'customer_email',
          kind: 'string',
          format: UI_FORM_CONTROL_TYPE_EMAIL,
          required: true,
        },
        {
          name: 'product_slug',
          kind: 'select',
          options: productOptions,
          required: true,
        },
        {
          name: 'tier_code',
          kind: 'select',
          options: tierOptions,
          required: true,
        },
        {
          name: 'domain',
          kind: 'string',
          placeholder: 'example.com',
        },
      ],
    },
    {
      id: 'limits',
      layout: 2,
      fields: [
        {
          name: 'activation_limit',
          kind: 'number',
        },
        {
          name: 'expires_days',
          kind: 'number',
        },
      ],
    },
    {
      id: 'metadata',
      fields: [
        {
          name: 'metadata',
          kind: 'textarea',
          rows: 4,
        },
      ],
    },
  ]

  return buildConfig<CreateLicenseRequest>(
    {
      id: 'create-license',
      title: 'Create License',
      sections,
    },
    options?.customize
  )
}

const buildUpdateLicenseBlueprint = (options?: LicenseBlueprintOptions<UpdateLicenseRequest>) => {
  const tierOptions = options?.tierOptions ?? []
  const sections: BlueprintSectionConfig<UpdateLicenseRequest>[] = [
    {
      id: 'details',
      layout: 2,
      fields: [
        {
          name: 'customer_email',
          kind: 'string',
          format: UI_FORM_CONTROL_TYPE_EMAIL,
        },
        {
          name: 'tier_code',
          kind: 'select',
          options: tierOptions,
        },
      ],
    },
    {
      id: 'limits',
      layout: 2,
      fields: [
        {
          name: 'activation_limit',
          kind: 'number',
        },
        {
          name: 'expires_days',
          kind: 'number',
        },
      ],
    },
    {
      id: 'metadata',
      fields: [
        {
          name: 'metadata',
          kind: 'textarea',
          rows: 4,
        },
      ],
    },
  ]

  return buildConfig<UpdateLicenseRequest>(
    {
      id: 'update-license',
      title: 'Update License',
      sections,
    },
    options?.customize
  )
}

type LicenseModeValues<TMode extends 'create' | 'update'> = TMode extends 'create'
  ? CreateLicenseRequest
  : UpdateLicenseRequest

export const createLicenseBlueprint = <TMode extends 'create' | 'update'>(
  mode: TMode,
  options?: LicenseBlueprintOptions<LicenseModeValues<TMode>>
): FormBlueprint<LicenseModeValues<TMode>> => {
  if (mode === 'create') {
    return buildCreateLicenseBlueprint(options as LicenseBlueprintOptions<CreateLicenseRequest>) as FormBlueprint<
      LicenseModeValues<TMode>
    >
  }
  return buildUpdateLicenseBlueprint(options as LicenseBlueprintOptions<UpdateLicenseRequest>) as FormBlueprint<
    LicenseModeValues<TMode>
  >
}

const PRODUCT_SECTION_BLUEPRINT: BlueprintSectionConfig<CreateProductRequest>[] = [
  {
    id: 'details',
    layout: 2,
    fields: [
      {
        name: 'name',
        kind: 'string',
        required: true,
      },
      {
        name: 'slug',
        kind: 'string',
        required: true,
      },
      {
        name: 'description',
        kind: 'textarea',
        rows: 3,
      },
    ],
  },
  {
    id: 'metadata',
    fields: [
      {
        name: 'metadata',
        kind: 'textarea',
        rows: 4,
      },
    ],
  },
]

const PRODUCT_SECTIONS_UPDATE = PRODUCT_SECTION_BLUEPRINT as unknown as BlueprintSectionConfig<UpdateProductRequest>[]

type ProductModeValues<TMode extends 'create' | 'update'> = TMode extends 'create'
  ? CreateProductRequest
  : UpdateProductRequest

export const createProductBlueprint = <TMode extends 'create' | 'update'>(
  mode: TMode,
  options?: BaseFactoryOptions<ProductModeValues<TMode>>
): FormBlueprint<ProductModeValues<TMode>> => {
  if (mode === 'create') {
    return buildConfig<CreateProductRequest>(
      {
        id: 'create-product',
        title: 'Create Product',
        sections: PRODUCT_SECTION_BLUEPRINT,
      },
      options?.customize as BlueprintCustomizer<CreateProductRequest> | undefined
    ) as FormBlueprint<ProductModeValues<TMode>>
  }

  return buildConfig<UpdateProductRequest>(
    {
      id: 'update-product',
      title: 'Update Product',
      sections: PRODUCT_SECTIONS_UPDATE,
    },
    options?.customize as BlueprintCustomizer<UpdateProductRequest> | undefined
  ) as FormBlueprint<ProductModeValues<TMode>>
}

const PRODUCT_TIER_CREATE_SECTIONS: BlueprintSectionConfig<CreateProductTierRequest>[] = [
  {
    id: 'details',
    layout: 2,
    fields: [
      {
        name: 'name',
        kind: 'string',
        required: true,
      },
      {
        name: 'code',
        kind: 'string',
        required: true,
      },
    ],
  },
  {
    id: 'metadata',
    fields: [
      {
        name: 'description',
        kind: 'textarea',
        rows: 3,
      },
      {
        name: 'metadata',
        kind: 'textarea',
        rows: 4,
      },
    ],
  },
]

const PRODUCT_TIER_UPDATE_SECTIONS: BlueprintSectionConfig<UpdateProductTierRequest>[] = [
  {
    id: 'details',
    layout: 2,
    fields: [
      {
        name: 'name',
        kind: 'string',
        required: true,
      },
      {
        name: 'code',
        kind: 'string',
        required: true,
      },
    ],
  },
  {
    id: 'metadata',
    fields: [
      {
        name: 'description',
        kind: 'textarea',
        rows: 3,
      },
      {
        name: 'metadata',
        kind: 'textarea',
        rows: 4,
      },
    ],
  },
]

type ProductTierModeValues<TMode extends 'create' | 'update'> = TMode extends 'create'
  ? CreateProductTierRequest
  : UpdateProductTierRequest

export const createProductTierBlueprint = <TMode extends 'create' | 'update'>(
  mode: TMode,
  options?: BaseFactoryOptions<ProductTierModeValues<TMode>>
): FormBlueprint<ProductTierModeValues<TMode>> => {
  if (mode === 'create') {
    return buildConfig<CreateProductTierRequest>(
      {
        id: 'create-product-tier',
        title: 'Create Product Tier',
        sections: PRODUCT_TIER_CREATE_SECTIONS,
      },
      options?.customize as BlueprintCustomizer<CreateProductTierRequest> | undefined
    ) as FormBlueprint<ProductTierModeValues<TMode>>
  }

  return buildConfig<UpdateProductTierRequest>(
    {
      id: 'update-product-tier',
      title: 'Update Product Tier',
      sections: PRODUCT_TIER_UPDATE_SECTIONS,
    },
    options?.customize as BlueprintCustomizer<UpdateProductTierRequest> | undefined
  ) as FormBlueprint<ProductTierModeValues<TMode>>
}

const ENTITLEMENT_VALUE_TYPE_OPTIONS: readonly UiSelectOption[] = [
  {
    value: UI_ENTITLEMENT_VALUE_TYPE_NUMBER,
    label: UI_ENTITLEMENT_VALUE_LABEL_NUMBER,
  },
  {
    value: UI_ENTITLEMENT_VALUE_TYPE_BOOLEAN,
    label: UI_ENTITLEMENT_VALUE_LABEL_BOOLEAN,
  },
  {
    value: UI_ENTITLEMENT_VALUE_TYPE_STRING,
    label: UI_ENTITLEMENT_VALUE_LABEL_STRING,
  },
]

const ENTITLEMENT_CREATE_SECTIONS: BlueprintSectionConfig<CreateEntitlementRequest>[] = [
  {
    id: 'details',
    layout: 2,
    fields: [
      {
        name: 'key',
        kind: 'string',
        required: true,
      },
      {
        name: 'value_type',
        kind: 'select',
        options: ENTITLEMENT_VALUE_TYPE_OPTIONS,
        required: true,
      },
      {
        name: 'default_value',
        kind: 'string',
        required: true,
      },
      {
        name: 'usage_limit',
        kind: 'number',
      },
    ],
  },
  {
    id: 'metadata',
    fields: [
      {
        name: 'metadata',
        kind: 'textarea',
        rows: UI_FORM_TEXTAREA_MIN_ROWS,
      },
    ],
  },
]

const ENTITLEMENT_UPDATE_SECTIONS: BlueprintSectionConfig<UpdateEntitlementRequest>[] = [
  {
    id: 'details',
    layout: 2,
    fields: [
      {
        name: 'key',
        kind: 'string',
      },
      {
        name: 'value_type',
        kind: 'select',
        options: ENTITLEMENT_VALUE_TYPE_OPTIONS,
      },
      {
        name: 'default_value',
        kind: 'string',
      },
      {
        name: 'usage_limit',
        kind: 'number',
      },
    ],
  },
  {
    id: 'metadata',
    fields: [
      {
        name: 'metadata',
        kind: 'textarea',
        rows: UI_FORM_TEXTAREA_MIN_ROWS,
      },
    ],
  },
]

type EntitlementModeValues<TMode extends 'create' | 'update'> = TMode extends 'create'
  ? CreateEntitlementRequest
  : UpdateEntitlementRequest

export const createEntitlementBlueprint = <TMode extends 'create' | 'update'>(
  mode: TMode,
  options?: BaseFactoryOptions<EntitlementModeValues<TMode>>,
): FormBlueprint<EntitlementModeValues<TMode>> => {
  if (mode === 'create') {
    return buildConfig<CreateEntitlementRequest>(
      {
        id: 'create-entitlement',
        title: 'Create Entitlement',
        sections: ENTITLEMENT_CREATE_SECTIONS as BlueprintSectionConfig<CreateEntitlementRequest>[],
      },
      options?.customize as BlueprintCustomizer<CreateEntitlementRequest> | undefined,
    ) as FormBlueprint<EntitlementModeValues<TMode>>
  }

  return buildConfig<UpdateEntitlementRequest>(
    {
      id: 'update-entitlement',
      title: 'Update Entitlement',
      sections: ENTITLEMENT_UPDATE_SECTIONS as BlueprintSectionConfig<UpdateEntitlementRequest>[],
    },
    options?.customize as BlueprintCustomizer<UpdateEntitlementRequest> | undefined,
  ) as FormBlueprint<EntitlementModeValues<TMode>>
}

const TENANT_QUOTA_SECTIONS: BlueprintSectionConfig<UpdateQuotaLimitsRequest>[] = [
  {
    id: 'limits',
    layout: 2,
    fields: [
      {
        name: 'max_products',
        kind: 'number',
      },
      {
        name: 'max_products_soft',
        kind: 'number',
      },
      {
        name: 'max_activations_per_product',
        kind: 'number',
      },
      {
        name: 'max_activations_per_product_soft',
        kind: 'number',
      },
      {
        name: 'max_activations_total',
        kind: 'number',
      },
      {
        name: 'max_activations_total_soft',
        kind: 'number',
      },
      {
        name: 'quota_warning_threshold',
        kind: 'number',
      },
    ],
  },
]

export const createTenantQuotaBlueprint = (
  options?: BaseFactoryOptions<UpdateQuotaLimitsRequest>,
): FormBlueprint<UpdateQuotaLimitsRequest> => {
  return buildConfig<UpdateQuotaLimitsRequest>(
    {
      id: 'tenant-quota',
      title: 'Tenant Quotas',
      sections: TENANT_QUOTA_SECTIONS,
    },
    options?.customize as BlueprintCustomizer<UpdateQuotaLimitsRequest> | undefined,
  )
}

const USER_CREATE_SECTIONS: BlueprintSectionConfig<CreateUserRequest>[] = [
  {
    id: 'details',
    layout: 2,
    fields: [
      {
        name: 'username',
        kind: 'string',
        required: true,
      },
      {
        name: 'email',
        kind: 'string',
        format: UI_FORM_CONTROL_TYPE_EMAIL,
        required: true,
      },
      {
        name: 'password',
        kind: 'string',
        format: UI_FORM_CONTROL_TYPE_PASSWORD,
        required: true,
      },
      {
        name: 'role',
        kind: 'string',
        format: UI_FORM_CONTROL_TYPE_TEXT,
      },
      {
        name: 'vendor_id',
        kind: 'string',
      },
    ],
  },
]
const USER_UPDATE_SECTIONS: BlueprintSectionConfig<UpdateUserRequest>[] = [
  {
    id: 'details',
    layout: 2,
    fields: [
      {
        name: 'username',
        kind: 'string',
        required: true,
      },
      {
        name: 'email',
        kind: 'string',
        format: UI_FORM_CONTROL_TYPE_EMAIL,
        required: true,
      },
      {
        name: 'role',
        kind: 'string',
        format: UI_FORM_CONTROL_TYPE_TEXT,
      },
      {
        name: 'vendor_id',
        kind: 'string',
      },
    ],
  },
]

type UserModeValues<TMode extends 'create' | 'update'> = TMode extends 'create' ? CreateUserRequest : UpdateUserRequest

export const createUserBlueprint = <TMode extends 'create' | 'update'>(
  mode: TMode,
  options?: BaseFactoryOptions<UserModeValues<TMode>>
): FormBlueprint<UserModeValues<TMode>> => {
  if (mode === 'create') {
    return buildConfig<CreateUserRequest>(
      {
        id: 'create-user',
        title: 'Create User',
        sections: USER_CREATE_SECTIONS,
      },
      options?.customize as BlueprintCustomizer<CreateUserRequest> | undefined
    ) as FormBlueprint<UserModeValues<TMode>>
  }

  return buildConfig<UpdateUserRequest>(
    {
      id: 'update-user',
      title: 'Update User',
      sections: USER_UPDATE_SECTIONS,
    },
    options?.customize as BlueprintCustomizer<UpdateUserRequest> | undefined
  ) as FormBlueprint<UserModeValues<TMode>>
}

const TENANT_CREATE_SECTIONS: BlueprintSectionConfig<CreateTenantRequest>[] = [
  {
    id: 'details',
    fields: [
      {
        name: 'name',
        kind: 'string',
        required: true,
      },
    ],
  },
]

const TENANT_UPDATE_SECTIONS: BlueprintSectionConfig<UpdateTenantRequest>[] = [
  {
    id: 'details',
    fields: [
      {
        name: 'name',
        kind: 'string',
        required: true,
      },
    ],
  },
]

type TenantModeValues<TMode extends 'create' | 'update'> = TMode extends 'create'
  ? CreateTenantRequest
  : UpdateTenantRequest

export const createTenantBlueprint = <TMode extends 'create' | 'update'>(
  mode: TMode,
  options?: BaseFactoryOptions<TenantModeValues<TMode>>
): FormBlueprint<TenantModeValues<TMode>> => {
  if (mode === 'create') {
    return buildConfig<CreateTenantRequest>(
      {
        id: 'create-tenant',
        title: 'Create Tenant',
        sections: TENANT_CREATE_SECTIONS,
      },
      options?.customize as BlueprintCustomizer<CreateTenantRequest> | undefined
    ) as FormBlueprint<TenantModeValues<TMode>>
  }

  return buildConfig<UpdateTenantRequest>(
    {
      id: 'update-tenant',
      title: 'Update Tenant',
      sections: TENANT_UPDATE_SECTIONS,
    },
    options?.customize as BlueprintCustomizer<UpdateTenantRequest> | undefined
  ) as FormBlueprint<TenantModeValues<TMode>>
}

const ALERT_THRESHOLD_SECTIONS: BlueprintSectionConfig<UpdateAlertThresholdsRequest>[] = [
  {
    id: UI_ALERT_THRESHOLD_SECTION_HIGH,
    title: UI_ALERT_THRESHOLD_SECTION_TITLE_HIGH,
    layout: 3,
    fields: [
      {
        name: UI_FIELD_ALERT_HIGH_ACTIVATIONS,
        kind: 'number',
        label: UI_ALERT_THRESHOLD_LABEL_HIGH_ACTIVATIONS,
        required: true,
      },
      {
        name: UI_FIELD_ALERT_HIGH_VALIDATIONS,
        kind: 'number',
        label: UI_ALERT_THRESHOLD_LABEL_HIGH_VALIDATIONS,
        required: true,
      },
      {
        name: UI_FIELD_ALERT_HIGH_CONCURRENCY,
        kind: 'number',
        label: UI_ALERT_THRESHOLD_LABEL_HIGH_CONCURRENCY,
        required: true,
      },
    ],
  },
  {
    id: UI_ALERT_THRESHOLD_SECTION_MEDIUM,
    title: UI_ALERT_THRESHOLD_SECTION_TITLE_MEDIUM,
    layout: 3,
    fields: [
      {
        name: UI_FIELD_ALERT_MEDIUM_ACTIVATIONS,
        kind: 'number',
        label: UI_ALERT_THRESHOLD_LABEL_MEDIUM_ACTIVATIONS,
        required: true,
      },
      {
        name: UI_FIELD_ALERT_MEDIUM_VALIDATIONS,
        kind: 'number',
        label: UI_ALERT_THRESHOLD_LABEL_MEDIUM_VALIDATIONS,
        required: true,
      },
      {
        name: UI_FIELD_ALERT_MEDIUM_CONCURRENCY,
        kind: 'number',
        label: UI_ALERT_THRESHOLD_LABEL_MEDIUM_CONCURRENCY,
        required: true,
      },
    ],
  },
]

export const createAlertThresholdsBlueprint = (
  options?: BaseFactoryOptions<UpdateAlertThresholdsRequest>
): FormBlueprint<UpdateAlertThresholdsRequest> => {
  return buildConfig<UpdateAlertThresholdsRequest>(
    {
      id: UI_ALERT_THRESHOLD_FORM_ID,
      title: UI_ALERT_THRESHOLD_FORM_TITLE,
      sections: ALERT_THRESHOLD_SECTIONS,
    },
    options?.customize as BlueprintCustomizer<UpdateAlertThresholdsRequest> | undefined
  )
}
