import { faker } from '@faker-js/faker'
import { describe, expect, test } from 'vitest'

import {
  createLicenseBlueprint,
  createProductBlueprint,
  createUserBlueprint,
} from '../../../src/ui/formBuilder/factories'
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

    expect(findField('customer_email', 'details', createBlueprint)).toMatchObject({
      component: 'text',
      required: true,
    })
    expect(findField('customer_email', 'details', updateBlueprint)).toMatchObject({
      component: 'text',
      required: false,
    })
  })

  test('license blueprint falls back to empty select options', () => {
    const blueprint = createLicenseBlueprint('create')
    const productField = findField('product_slug', 'details', blueprint)
    const tierField = findField('tier_code', 'details', blueprint)

    expect(productField).toMatchObject({ component: 'select', options: [] })
    expect(tierField).toMatchObject({ component: 'select', options: [] })
  })

  test('license update blueprint defaults tier options to empty array', () => {
    const blueprint = createLicenseBlueprint('update')
    const tierField = findField('tier_code', 'details', blueprint)

    expect(tierField).toMatchObject({ component: 'select', options: [] })
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

    expect(findField('name', 'details', blueprint)).toMatchObject({
      component: 'text',
      required: true,
    })
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
    const section = blueprint.sections.find((candidate) => candidate.id === 'details')

    expect(section?.fields.some((field) => field.name === 'password')).toBe(false)
  })
})


