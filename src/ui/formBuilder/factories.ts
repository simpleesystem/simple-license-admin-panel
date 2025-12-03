import type {
  CreateLicenseRequest,
  CreateProductRequest,
  CreateUserRequest,
  UpdateLicenseRequest,
  UpdateProductRequest,
  UpdateUserRequest,
} from '@simple-license/react-sdk'
import type { FieldValues } from 'react-hook-form'

import {
  UI_FORM_CONTROL_TYPE_EMAIL,
  UI_FORM_CONTROL_TYPE_PASSWORD,
  UI_FORM_CONTROL_TYPE_TEXT,
} from '../constants'
import type { UiSelectOption } from '../types'
import { type BlueprintConfig, type BlueprintSectionConfig, generateBlueprintFromType } from './typeIntrospection'
import type { FormBlueprint } from './blueprint'

type BlueprintCustomizer<TFieldValues extends FieldValues> = (
  blueprint: FormBlueprint<TFieldValues>,
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
  customize?: BlueprintCustomizer<TFieldValues>,
) => (customize ? customize(blueprint) : blueprint)

const buildConfig = <TFieldValues extends FieldValues>(
  config: Omit<BlueprintConfig<TFieldValues>, 'sections'> & {
    sections: readonly BlueprintSectionConfig<TFieldValues>[]
  },
  customize?: BlueprintCustomizer<TFieldValues>,
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
    options?.customize,
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
    options?.customize,
  )
}

type LicenseModeValues<TMode extends 'create' | 'update'> = TMode extends 'create'
  ? CreateLicenseRequest
  : UpdateLicenseRequest

export const createLicenseBlueprint = <TMode extends 'create' | 'update'>(
  mode: TMode,
  options?: LicenseBlueprintOptions<LicenseModeValues<TMode>>,
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
  options?: BaseFactoryOptions<ProductModeValues<TMode>>,
): FormBlueprint<ProductModeValues<TMode>> => {
  if (mode === 'create') {
    return buildConfig<CreateProductRequest>(
      {
        id: 'create-product',
        title: 'Create Product',
        sections: PRODUCT_SECTION_BLUEPRINT,
      },
      options?.customize as BlueprintCustomizer<CreateProductRequest> | undefined,
    ) as FormBlueprint<ProductModeValues<TMode>>
  }

  return buildConfig<UpdateProductRequest>(
    {
      id: 'update-product',
      title: 'Update Product',
      sections: PRODUCT_SECTIONS_UPDATE,
    },
    options?.customize as BlueprintCustomizer<UpdateProductRequest> | undefined,
  ) as FormBlueprint<ProductModeValues<TMode>>
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

type UserModeValues<TMode extends 'create' | 'update'> = TMode extends 'create'
  ? CreateUserRequest
  : UpdateUserRequest

export const createUserBlueprint = <TMode extends 'create' | 'update'>(
  mode: TMode,
  options?: BaseFactoryOptions<UserModeValues<TMode>>,
): FormBlueprint<UserModeValues<TMode>> => {
  if (mode === 'create') {
    return buildConfig<CreateUserRequest>(
      {
        id: 'create-user',
        title: 'Create User',
        sections: USER_CREATE_SECTIONS,
      },
      options?.customize as BlueprintCustomizer<CreateUserRequest> | undefined,
    ) as FormBlueprint<UserModeValues<TMode>>
  }

  return buildConfig<UpdateUserRequest>(
    {
      id: 'update-user',
      title: 'Update User',
      sections: USER_UPDATE_SECTIONS,
    },
    options?.customize as BlueprintCustomizer<UpdateUserRequest> | undefined,
  ) as FormBlueprint<UserModeValues<TMode>>
}

