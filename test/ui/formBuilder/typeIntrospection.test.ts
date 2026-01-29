import { faker } from '@faker-js/faker'
import { describe, expect, test, vi } from 'vitest'
import type { CreateLicenseRequest } from '@/simpleLicense'
import {
  UI_FORM_CONTROL_TYPE_EMAIL,
  UI_FORM_CONTROL_TYPE_NUMBER,
  UI_FORM_TEXTAREA_MIN_ROWS,
} from '../../../src/ui/constants'
import {
  type BlueprintSectionConfig,
  generateBlueprintFromType,
  inferFieldProps,
  inferFieldType,
  type PropertyDescriptor,
} from '../../../src/ui/formBuilder/typeIntrospection'
import type { UiSelectOption } from '../../../src/ui/types'

describe('typeIntrospection utilities', () => {
  test('infers checkbox component for boolean descriptor', () => {
    const descriptor: PropertyDescriptor<{ is_trial: boolean }> = {
      name: 'is_trial',
      kind: 'boolean',
    }

    expect(inferFieldType(descriptor)).toBe('checkbox')
  })

  test('infers select component for select descriptor', () => {
    const descriptor: PropertyDescriptor<{ status: string }> = {
      name: 'status',
      kind: 'select',
      options: [],
    }

    expect(inferFieldType(descriptor)).toBe('select')
  })

  test('infers date component for date descriptor', () => {
    const descriptor: PropertyDescriptor<{ expires_on: string }> = {
      name: 'expires_on',
      kind: 'date',
    }

    expect(inferFieldType(descriptor)).toBe('date')
  })

  test('infers textarea component for textarea descriptor', () => {
    const descriptor: PropertyDescriptor<{ notes: string }> = {
      name: 'notes',
      kind: 'textarea',
    }

    expect(inferFieldType(descriptor)).toBe('textarea')
  })

  test('fills label and input metadata for text descriptor', () => {
    const descriptor: PropertyDescriptor<CreateLicenseRequest> = {
      name: 'customer_email',
      kind: 'string',
      format: UI_FORM_CONTROL_TYPE_EMAIL,
      required: true,
      placeholder: faker.internet.email(),
    }

    const field = inferFieldProps(descriptor)

    expect(field).toMatchObject({
      id: 'customer_email',
      name: 'customer_email',
      component: 'text',
      inputType: UI_FORM_CONTROL_TYPE_EMAIL,
      required: true,
      placeholder: descriptor.placeholder,
      label: 'Customer email',
    })
  })

  test('maps select descriptors with options and placeholder', () => {
    const descriptor: PropertyDescriptor<CreateLicenseRequest> = {
      name: 'product_slug',
      kind: 'select',
      options: [{ value: 'license', label: 'License' }] satisfies readonly UiSelectOption[],
      placeholder: faker.commerce.productName(),
    }

    const field = inferFieldProps(descriptor)

    expect(field).toMatchObject({
      component: 'select',
      options: descriptor.options,
      placeholder: descriptor.placeholder,
    })
  })

  test('textarea descriptors apply default rows when omitted', () => {
    const descriptor: PropertyDescriptor<CreateLicenseRequest> = {
      name: 'metadata',
      kind: 'textarea',
    }

    const field = inferFieldProps(descriptor)

    expect(field).toMatchObject({
      component: 'textarea',
      rows: UI_FORM_TEXTAREA_MIN_ROWS,
    })
  })

  test('number descriptors set numeric input type', () => {
    const descriptor: PropertyDescriptor<CreateLicenseRequest> = {
      name: 'activation_limit',
      kind: 'number',
      placeholder: faker.number.int({ min: 1, max: 10 }).toString(),
    }

    const field = inferFieldProps(descriptor)

    expect(field).toMatchObject({
      component: 'text',
      inputType: UI_FORM_CONTROL_TYPE_NUMBER,
      placeholder: descriptor.placeholder,
    })
  })

  test('date descriptors pass min and max attributes', () => {
    const descriptor: PropertyDescriptor<CreateLicenseRequest> = {
      name: 'expires_days',
      kind: 'date',
      min: '2025-01-01',
      max: '2025-12-31',
      placeholder: faker.date.anytime().toISOString(),
    }

    const field = inferFieldProps(descriptor)

    expect(field).toMatchObject({
      component: 'date',
      min: descriptor.min,
      max: descriptor.max,
      placeholder: descriptor.placeholder,
    })
  })

  test('generates blueprint sections with merged visibility config', () => {
    type BlueprintValues = CreateLicenseRequest
    const sections: BlueprintSectionConfig<BlueprintValues>[] = [
      {
        id: 'details',
        title: faker.lorem.words(2),
        layout: 2,
        ability: {
          action: 'manage',
          subject: 'license',
        },
        fields: [
          {
            name: 'customer_email',
            kind: 'string',
            format: UI_FORM_CONTROL_TYPE_EMAIL,
            required: true,
          },
          {
            name: 'activation_limit',
            kind: 'number',
            format: UI_FORM_CONTROL_TYPE_NUMBER,
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

    const blueprint = generateBlueprintFromType<BlueprintValues>({
      id: 'license-form',
      title: faker.lorem.words(2),
      sections,
      permissionKey: 'licenses.manage',
      permissionFallback: vi.fn(),
    })

    expect(blueprint.sections[0]).toMatchObject({
      id: 'details',
      layout: 2,
      ability: sections[0].ability,
      permissionKey: 'licenses.manage',
      fields: [
        expect.objectContaining({ name: 'customer_email', required: true }),
        expect.objectContaining({ name: 'activation_limit', inputType: UI_FORM_CONTROL_TYPE_NUMBER }),
      ],
    })
  })

  test('generateBlueprintFromType inherits top-level permission props', () => {
    const blueprint = generateBlueprintFromType<CreateLicenseRequest>({
      id: 'license-form',
      sections: [
        {
          id: 'details',
          fields: [
            {
              name: 'customer_email',
              kind: 'string',
            },
          ],
        },
      ],
      ability: {
        action: 'manage',
        subject: 'license',
      },
      permissionKey: 'licenses.manage',
    })

    expect(blueprint.sections[0]).toMatchObject({
      ability: blueprint.ability,
      permissionKey: 'licenses.manage',
    })
  })
})
