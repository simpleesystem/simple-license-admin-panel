import type {
  CreateEntitlementRequest,
  CreateLicenseRequest,
  CreateProductRequest,
  CreateProductTierRequest,
  CreateTenantRequest,
  CreateUserRequest,
  FreezeLicenseRequest,
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
  UI_ENTITLEMENT_FORM_ID_CREATE,
  UI_ENTITLEMENT_FORM_ID_UPDATE,
  UI_ENTITLEMENT_FORM_SECTION_DETAILS,
  UI_ENTITLEMENT_FORM_TITLE_CREATE,
  UI_ENTITLEMENT_FORM_TITLE_UPDATE,
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
  UI_FIELD_LICENSE_FREEZE_ENTITLEMENTS,
  UI_FIELD_LICENSE_FREEZE_TIER,
  UI_FIELD_METADATA,
  UI_FORM_CONTROL_TYPE_EMAIL,
  UI_FORM_CONTROL_TYPE_PASSWORD,
  UI_FORM_SECTION_METADATA,
  UI_FORM_TEXTAREA_MIN_ROWS,
  UI_LICENSE_FORM_ID_CREATE,
  UI_LICENSE_FORM_ID_UPDATE,
  UI_LICENSE_FORM_PLACEHOLDER_DOMAIN,
  UI_LICENSE_FORM_SECTION_DETAILS,
  UI_LICENSE_FORM_SECTION_LIMITS,
  UI_LICENSE_FORM_SECTION_METADATA,
  UI_LICENSE_FORM_TITLE_CREATE,
  UI_LICENSE_FORM_TITLE_UPDATE,
  UI_LICENSE_FREEZE_FORM_DESCRIPTION,
  UI_LICENSE_FREEZE_FORM_ID,
  UI_LICENSE_FREEZE_FORM_TITLE,
  UI_LICENSE_FREEZE_LABEL_ENTITLEMENTS,
  UI_LICENSE_FREEZE_LABEL_TIER,
  UI_LICENSE_FREEZE_SECTION_OPTIONS,
  UI_PRODUCT_FORM_ID_CREATE,
  UI_PRODUCT_FORM_ID_UPDATE,
  UI_PRODUCT_FORM_SECTION_DETAILS,
  UI_PRODUCT_FORM_TITLE_CREATE,
  UI_PRODUCT_FORM_TITLE_UPDATE,
  UI_PRODUCT_TIER_FORM_ID_CREATE,
  UI_PRODUCT_TIER_FORM_ID_UPDATE,
  UI_PRODUCT_TIER_FORM_SECTION_DETAILS,
  UI_PRODUCT_TIER_FORM_TITLE_CREATE,
  UI_PRODUCT_TIER_FORM_TITLE_UPDATE,
  UI_TENANT_FORM_ID_CREATE,
  UI_TENANT_FORM_ID_UPDATE,
  UI_TENANT_FORM_SECTION_DETAILS,
  UI_TENANT_FORM_TITLE_CREATE,
  UI_TENANT_FORM_TITLE_UPDATE,
  UI_TENANT_QUOTA_FORM_ID,
  UI_TENANT_QUOTA_FORM_TITLE,
  UI_TENANT_QUOTA_SECTION_LIMITS,
  UI_USER_FIELD_LABEL_ROLE,
  UI_USER_FIELD_LABEL_STATUS,
  UI_USER_FIELD_LABEL_VENDOR,
  UI_USER_FORM_ID_CREATE,
  UI_USER_FORM_ID_UPDATE,
  UI_USER_FORM_SECTION_ACCESS,
  UI_USER_FORM_SECTION_DESCRIPTION_ACCESS,
  UI_USER_FORM_SECTION_DESCRIPTION_IDENTITY,
  UI_USER_FORM_SECTION_IDENTITY,
  UI_USER_FORM_SECTION_TITLE_ACCESS,
  UI_USER_FORM_SECTION_TITLE_IDENTITY,
  UI_USER_FORM_TITLE_CREATE,
  UI_USER_FORM_TITLE_UPDATE,
  UI_USER_VENDOR_PLACEHOLDER,
} from '../constants'
import type { UiSelectOption } from '../types'
import { createFormBlueprint, type FormBlueprint, type FormSectionBlueprint } from './blueprint'
import { type BlueprintConfig, type BlueprintSectionConfig, generateBlueprintFromType } from './typeIntrospection'

type BlueprintCustomizer<TFieldValues extends FieldValues> = (
  blueprint: FormBlueprint<TFieldValues>
) => FormBlueprint<TFieldValues>

type BaseFactoryOptions<TFieldValues extends FieldValues> = {
  customize?: BlueprintCustomizer<TFieldValues>
}

type UserBlueprintOptions<TFieldValues extends FieldValues> = BaseFactoryOptions<TFieldValues> & {
  roleOptions?: readonly UiSelectOption[]
  vendorOptions?: readonly UiSelectOption[]
  statusOptions?: readonly UiSelectOption[]
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
      id: UI_LICENSE_FORM_SECTION_DETAILS,
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
          placeholder: UI_LICENSE_FORM_PLACEHOLDER_DOMAIN,
        },
      ],
    },
    {
      id: UI_LICENSE_FORM_SECTION_LIMITS,
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
      id: UI_LICENSE_FORM_SECTION_METADATA,
      fields: [
        {
          name: UI_FIELD_METADATA,
          kind: 'textarea',
          rows: 4,
        },
      ],
    },
  ]

  return buildConfig<CreateLicenseRequest>(
    {
      id: UI_LICENSE_FORM_ID_CREATE,
      title: UI_LICENSE_FORM_TITLE_CREATE,
      sections,
    },
    options?.customize
  )
}

const buildUpdateLicenseBlueprint = (options?: LicenseBlueprintOptions<UpdateLicenseRequest>) => {
  const tierOptions = options?.tierOptions ?? []
  const sections: BlueprintSectionConfig<UpdateLicenseRequest>[] = [
    {
      id: UI_LICENSE_FORM_SECTION_DETAILS,
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
      id: UI_LICENSE_FORM_SECTION_LIMITS,
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
      id: UI_LICENSE_FORM_SECTION_METADATA,
      fields: [
        {
          name: UI_FIELD_METADATA,
          kind: 'textarea',
          rows: 4,
        },
      ],
    },
  ]

  return buildConfig<UpdateLicenseRequest>(
    {
      id: UI_LICENSE_FORM_ID_UPDATE,
      title: UI_LICENSE_FORM_TITLE_UPDATE,
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

const LICENSE_FREEZE_SECTIONS: FormSectionBlueprint<FreezeLicenseRequest>[] = [
  {
    id: UI_LICENSE_FREEZE_SECTION_OPTIONS,
    fields: [
      {
        id: UI_FIELD_LICENSE_FREEZE_ENTITLEMENTS,
        name: UI_FIELD_LICENSE_FREEZE_ENTITLEMENTS,
        label: UI_LICENSE_FREEZE_LABEL_ENTITLEMENTS,
        component: 'checkbox',
      },
      {
        id: UI_FIELD_LICENSE_FREEZE_TIER,
        name: UI_FIELD_LICENSE_FREEZE_TIER,
        label: UI_LICENSE_FREEZE_LABEL_TIER,
        component: 'checkbox',
      },
    ],
  },
]

export const createLicenseFreezeBlueprint = (options?: BaseFactoryOptions<FreezeLicenseRequest>) => {
  const blueprint = createFormBlueprint<FreezeLicenseRequest>({
    id: UI_LICENSE_FREEZE_FORM_ID,
    title: UI_LICENSE_FREEZE_FORM_TITLE,
    description: UI_LICENSE_FREEZE_FORM_DESCRIPTION,
    sections: LICENSE_FREEZE_SECTIONS,
  })

  return applyCustomize(blueprint, options?.customize)
}

const PRODUCT_SECTION_BLUEPRINT: BlueprintSectionConfig<CreateProductRequest>[] = [
  {
    id: UI_PRODUCT_FORM_SECTION_DETAILS,
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
    id: UI_FORM_SECTION_METADATA,
    fields: [
      {
        name: UI_FIELD_METADATA,
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
        id: UI_PRODUCT_FORM_ID_CREATE,
        title: UI_PRODUCT_FORM_TITLE_CREATE,
        sections: PRODUCT_SECTION_BLUEPRINT,
      },
      options?.customize as BlueprintCustomizer<CreateProductRequest> | undefined
    ) as FormBlueprint<ProductModeValues<TMode>>
  }

  return buildConfig<UpdateProductRequest>(
    {
      id: UI_PRODUCT_FORM_ID_UPDATE,
      title: UI_PRODUCT_FORM_TITLE_UPDATE,
      sections: PRODUCT_SECTIONS_UPDATE,
    },
    options?.customize as BlueprintCustomizer<UpdateProductRequest> | undefined
  ) as FormBlueprint<ProductModeValues<TMode>>
}

const PRODUCT_TIER_CREATE_SECTIONS: BlueprintSectionConfig<CreateProductTierRequest>[] = [
  {
    id: UI_PRODUCT_TIER_FORM_SECTION_DETAILS,
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
    id: UI_FORM_SECTION_METADATA,
    fields: [
      {
        name: 'description',
        kind: 'textarea',
        rows: 3,
      },
      {
        name: UI_FIELD_METADATA,
        kind: 'textarea',
        rows: 4,
      },
    ],
  },
]

const PRODUCT_TIER_UPDATE_SECTIONS: BlueprintSectionConfig<UpdateProductTierRequest>[] = [
  {
    id: UI_PRODUCT_TIER_FORM_SECTION_DETAILS,
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
    id: UI_FORM_SECTION_METADATA,
    fields: [
      {
        name: 'description',
        kind: 'textarea',
        rows: 3,
      },
      {
        name: UI_FIELD_METADATA,
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
        id: UI_PRODUCT_TIER_FORM_ID_CREATE,
        title: UI_PRODUCT_TIER_FORM_TITLE_CREATE,
        sections: PRODUCT_TIER_CREATE_SECTIONS,
      },
      options?.customize as BlueprintCustomizer<CreateProductTierRequest> | undefined
    ) as FormBlueprint<ProductTierModeValues<TMode>>
  }

  return buildConfig<UpdateProductTierRequest>(
    {
      id: UI_PRODUCT_TIER_FORM_ID_UPDATE,
      title: UI_PRODUCT_TIER_FORM_TITLE_UPDATE,
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
    id: UI_ENTITLEMENT_FORM_SECTION_DETAILS,
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
    id: UI_FORM_SECTION_METADATA,
    fields: [
      {
        name: UI_FIELD_METADATA,
        kind: 'textarea',
        rows: UI_FORM_TEXTAREA_MIN_ROWS,
      },
    ],
  },
]

const ENTITLEMENT_UPDATE_SECTIONS: BlueprintSectionConfig<UpdateEntitlementRequest>[] = [
  {
    id: UI_ENTITLEMENT_FORM_SECTION_DETAILS,
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
    id: UI_FORM_SECTION_METADATA,
    fields: [
      {
        name: UI_FIELD_METADATA,
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
  options?: BaseFactoryOptions<EntitlementModeValues<TMode>>
): FormBlueprint<EntitlementModeValues<TMode>> => {
  if (mode === 'create') {
    return buildConfig<CreateEntitlementRequest>(
      {
        id: UI_ENTITLEMENT_FORM_ID_CREATE,
        title: UI_ENTITLEMENT_FORM_TITLE_CREATE,
        sections: ENTITLEMENT_CREATE_SECTIONS as BlueprintSectionConfig<CreateEntitlementRequest>[],
      },
      options?.customize as BlueprintCustomizer<CreateEntitlementRequest> | undefined
    ) as FormBlueprint<EntitlementModeValues<TMode>>
  }

  return buildConfig<UpdateEntitlementRequest>(
    {
      id: UI_ENTITLEMENT_FORM_ID_UPDATE,
      title: UI_ENTITLEMENT_FORM_TITLE_UPDATE,
      sections: ENTITLEMENT_UPDATE_SECTIONS as BlueprintSectionConfig<UpdateEntitlementRequest>[],
    },
    options?.customize as BlueprintCustomizer<UpdateEntitlementRequest> | undefined
  ) as FormBlueprint<EntitlementModeValues<TMode>>
}

const TENANT_QUOTA_SECTIONS: BlueprintSectionConfig<UpdateQuotaLimitsRequest>[] = [
  {
    id: UI_TENANT_QUOTA_SECTION_LIMITS,
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
  options?: BaseFactoryOptions<UpdateQuotaLimitsRequest>
): FormBlueprint<UpdateQuotaLimitsRequest> => {
  return buildConfig<UpdateQuotaLimitsRequest>(
    {
      id: UI_TENANT_QUOTA_FORM_ID,
      title: UI_TENANT_QUOTA_FORM_TITLE,
      sections: TENANT_QUOTA_SECTIONS,
    },
    options?.customize as BlueprintCustomizer<UpdateQuotaLimitsRequest> | undefined
  )
}

const USER_CREATE_SECTIONS: BlueprintSectionConfig<CreateUserRequest>[] = [
  {
    id: UI_USER_FORM_SECTION_IDENTITY,
    title: UI_USER_FORM_SECTION_TITLE_IDENTITY,
    description: UI_USER_FORM_SECTION_DESCRIPTION_IDENTITY,
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
        name: 'status',
        kind: 'select',
        label: UI_USER_FIELD_LABEL_STATUS,
        options: [],
        required: true,
      },
    ],
  },
  {
    id: UI_USER_FORM_SECTION_ACCESS,
    title: UI_USER_FORM_SECTION_TITLE_ACCESS,
    description: UI_USER_FORM_SECTION_DESCRIPTION_ACCESS,
    layout: 2,
    fields: [
      {
        name: 'role',
        kind: 'select',
        label: UI_USER_FIELD_LABEL_ROLE,
        options: [],
        required: true,
      },
      {
        name: 'vendor_id',
        kind: 'select',
        label: UI_USER_FIELD_LABEL_VENDOR,
        options: [],
      },
    ],
  },
]
const USER_UPDATE_SECTIONS: BlueprintSectionConfig<UpdateUserRequest>[] = [
  {
    id: UI_USER_FORM_SECTION_IDENTITY,
    title: UI_USER_FORM_SECTION_TITLE_IDENTITY,
    description: UI_USER_FORM_SECTION_DESCRIPTION_IDENTITY,
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
        name: 'status',
        kind: 'select',
        label: UI_USER_FIELD_LABEL_STATUS,
        options: [],
      },
    ],
  },
  {
    id: UI_USER_FORM_SECTION_ACCESS,
    title: UI_USER_FORM_SECTION_TITLE_ACCESS,
    description: UI_USER_FORM_SECTION_DESCRIPTION_ACCESS,
    layout: 2,
    fields: [
      {
        name: 'role',
        kind: 'select',
        label: UI_USER_FIELD_LABEL_ROLE,
        options: [],
      },
      {
        name: 'vendor_id',
        kind: 'select',
        label: UI_USER_FIELD_LABEL_VENDOR,
        options: [],
      },
    ],
  },
]

type UserModeValues<TMode extends 'create' | 'update'> = TMode extends 'create' ? CreateUserRequest : UpdateUserRequest

export const createUserBlueprint = <TMode extends 'create' | 'update'>(
  mode: TMode,
  options?: UserBlueprintOptions<UserModeValues<TMode>>
): FormBlueprint<UserModeValues<TMode>> => {
  const roleOptions = options?.roleOptions ?? []
  const vendorOptions = options?.vendorOptions ?? []
  const statusOptions = options?.statusOptions ?? []
  const vendorOptionsWithPlaceholder: UiSelectOption[] =
    vendorOptions.length > 0
      ? [{ value: '', label: UI_USER_VENDOR_PLACEHOLDER, disabled: true }, ...vendorOptions]
      : vendorOptions.slice()
  const configureSections = <TFieldValues extends FieldValues>(
    sections: BlueprintSectionConfig<TFieldValues>[]
  ): BlueprintSectionConfig<TFieldValues>[] =>
    sections.map((section) => ({
      ...section,
      fields: section.fields.map((field) => {
        if (field.name === 'role') {
          return { ...field, options: roleOptions }
        }
        if (field.name === 'vendor_id') {
          return { ...field, options: vendorOptionsWithPlaceholder }
        }
        if (field.name === 'status') {
          return { ...field, options: statusOptions }
        }
        return field
      }),
    }))

  if (mode === 'create') {
    return buildConfig<CreateUserRequest>(
      {
        id: UI_USER_FORM_ID_CREATE,
        title: UI_USER_FORM_TITLE_CREATE,
        sections: configureSections(USER_CREATE_SECTIONS),
      },
      options?.customize as BlueprintCustomizer<CreateUserRequest> | undefined
    ) as FormBlueprint<UserModeValues<TMode>>
  }

  return buildConfig<UpdateUserRequest>(
    {
      id: UI_USER_FORM_ID_UPDATE,
      title: UI_USER_FORM_TITLE_UPDATE,
      sections: configureSections(USER_UPDATE_SECTIONS),
    },
    options?.customize as BlueprintCustomizer<UpdateUserRequest> | undefined
  ) as FormBlueprint<UserModeValues<TMode>>
}

const TENANT_CREATE_SECTIONS: BlueprintSectionConfig<CreateTenantRequest>[] = [
  {
    id: UI_TENANT_FORM_SECTION_DETAILS,
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
    id: UI_TENANT_FORM_SECTION_DETAILS,
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
        id: UI_TENANT_FORM_ID_CREATE,
        title: UI_TENANT_FORM_TITLE_CREATE,
        sections: TENANT_CREATE_SECTIONS,
      },
      options?.customize as BlueprintCustomizer<CreateTenantRequest> | undefined
    ) as FormBlueprint<TenantModeValues<TMode>>
  }

  return buildConfig<UpdateTenantRequest>(
    {
      id: UI_TENANT_FORM_ID_UPDATE,
      title: UI_TENANT_FORM_TITLE_UPDATE,
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
