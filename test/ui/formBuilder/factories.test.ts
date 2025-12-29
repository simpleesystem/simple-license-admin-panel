import { faker } from '@faker-js/faker'
import { describe, expect, test } from 'vitest'

import {
  createEntitlementBlueprint,
  createLicenseBlueprint,
  createProductBlueprint,
  createTenantQuotaBlueprint,
  createUserBlueprint,
} from '../../../src/ui/formBuilder/factories'
import {
  UI_ENTITLEMENT_FORM_SECTION_DETAILS,
  UI_LICENSE_FORM_SECTION_DETAILS,
  UI_PRODUCT_FORM_SECTION_DETAILS,
} from '../../../src/ui/constants'
import type { UiSelectOption } from '../../../src/ui/types'

const createOptions = (count = 2): readonly UiSelectOption[] =>
  Array.from({ length: count }, (_, index) => ({
    value: faker.string.uuid(),
    label: `${faker.commerce.productName()}-${index}`,
  }))

const findField = (blueprintFieldName: string, sectionId: string, blueprint: { sections: readonly { id: string; fields: readonly { name: string }[] }[] }) => {
  const section = blueprint.sections.find((candidate) => candidate.id === sectionId)
  if (!section) {
    throw new Error(`Missing section ${sectionId}`)
  }
  const field = section.fields.find((candidate) => candidate.name === blueprintFieldName)
  if (!field) {
    throw new Error(`Missing field ${blueprintFieldName}`)
  }
  return field
}

describe('form blueprint factories', () => {
  test('license blueprint marks create-only fields as required', () => {
    const products = createOptions()
    const tiers = createOptions()

    const createBlueprint = createLicenseBlueprint('create', { productOptions: products, tierOptions: tiers })
    const updateBlueprint = createLicenseBlueprint('update', { productOptions: products, tierOptions: tiers })

    const createField = findField('customer_email', UI_LICENSE_FORM_SECTION_DETAILS, createBlueprint)
    const updateField = findField('customer_email', UI_LICENSE_FORM_SECTION_DETAILS, updateBlueprint)
    expect(createField.component).toBe('text')
    expect(updateField.component).toBe('text')
  })

  test('license blueprint falls back to empty select options', () => {
    const blueprint = createLicenseBlueprint('create')
    const productField = findField('product_slug', UI_LICENSE_FORM_SECTION_DETAILS, blueprint)
    const tierField = findField('tier_code', UI_LICENSE_FORM_SECTION_DETAILS, blueprint)

    expect(productField.component).toBe('select')
    expect(Array.isArray(productField.options)).toBe(true)
    expect(tierField.component).toBe('select')
    expect(Array.isArray(tierField.options)).toBe(true)
  })

  test('license update blueprint defaults tier options to empty array', () => {
    const blueprint = createLicenseBlueprint('update')
    const tierField = findField('tier_code', UI_LICENSE_FORM_SECTION_DETAILS, blueprint)

    expect(tierField.component).toBe('select')
  })

  test('product blueprint includes metadata textarea section', () => {
    const blueprint = createProductBlueprint('create')

    expect(findField('metadata', 'metadata', blueprint)).toMatchObject({
      component: 'textarea',
      rows: 4,
    })
  })

  test('product update blueprint mirrors base fields', () => {
    const blueprint = createProductBlueprint('update')

    expect(findField('name', UI_PRODUCT_FORM_SECTION_DETAILS, blueprint).component).toBe('text')
  })

  test('user blueprint can be customized through callback', () => {
    const blueprint = createUserBlueprint('create', {
      customize: (base) => ({
        ...base,
        description: 'Custom user form',
      }),
    })

    expect(blueprint.description).toBe('Custom user form')
  })

  test('user update blueprint omits password field', () => {
    const blueprint = createUserBlueprint('update')
    // Password field should be filtered out in update mode
    const allFields = blueprint.sections.flatMap((section) => section.fields)
    expect(allFields.some((field) => field.name === 'password')).toBe(false)
  })

  test('entitlement blueprint includes value fields', () => {
    const blueprint = createEntitlementBlueprint('create')
    const numberValueField = findField('number_value', UI_ENTITLEMENT_FORM_SECTION_DETAILS, blueprint)
    const booleanValueField = findField('boolean_value', UI_ENTITLEMENT_FORM_SECTION_DETAILS, blueprint)
    const stringValueField = findField('string_value', UI_ENTITLEMENT_FORM_SECTION_DETAILS, blueprint)

    expect(numberValueField.component).toBe('text')
    expect(booleanValueField.component).toBe('select')
    expect(Array.isArray(booleanValueField.options)).toBe(true)
    expect(stringValueField.component).toBe('text')
  })

  test('tenant quota blueprint exposes number fields for each limit', () => {
    const blueprint = createTenantQuotaBlueprint()
    const fields = [
      'max_products',
      'max_products_soft',
      'max_activations_per_product',
      'max_activations_per_product_soft',
      'max_activations_total',
      'max_activations_total_soft',
      'quota_warning_threshold',
    ]

    fields.forEach((fieldName) => {
      expect(findField(fieldName, 'limits', blueprint)).toMatchObject({ component: 'text' })
    })
  })
})


