import { faker } from '@faker-js/faker'
import { act, fireEvent, render } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import { createFormBlueprint } from '../../../src/ui/formBuilder/blueprint'
import { DynamicForm } from '../../../src/ui/formBuilder/DynamicForm'
import { FormModal } from '../../../src/ui/formBuilder/FormModal'

type LicenseFormValues = {
  name: string
  productId: string
  seats: string
  expiresOn: string
  isTrial: boolean
  notes: string
}

const productOptions = [
  { value: faker.string.uuid(), label: faker.commerce.productName() },
  { value: faker.string.uuid(), label: faker.commerce.productName() },
] as const

const blueprint = createFormBlueprint<LicenseFormValues>({
  id: 'license-form',
  title: faker.lorem.words(2),
  sections: [
    {
      id: 'details',
      title: faker.lorem.word(),
      layout: 2,
      fields: [
        { id: 'name', name: 'name', component: 'text', label: 'Name' },
        {
          id: 'productId',
          name: 'productId',
          component: 'select',
          label: 'Product',
          options: productOptions,
          placeholder: faker.lorem.word(),
        },
        {
          id: 'seats',
          name: 'seats',
          component: 'text',
          label: 'Seats',
          inputType: 'number',
        },
      ],
    },
    {
      id: 'metadata',
      title: faker.lorem.word(),
      fields: [
        {
          id: 'expiresOn',
          name: 'expiresOn',
          component: 'date',
          label: 'Expiry',
        },
        {
          id: 'isTrial',
          name: 'isTrial',
          component: 'checkbox',
          label: 'Is Trial',
        },
        {
          id: 'notes',
          name: 'notes',
          component: 'textarea',
          label: 'Notes',
          rows: 4,
        },
      ],
    },
  ],
})

const defaultValues: LicenseFormValues = {
  name: faker.company.name(),
  productId: productOptions[0].value,
  seats: '10',
  expiresOn: '2026-01-01',
  isTrial: false,
  notes: '',
}

describe('DynamicForm', () => {
  test('renders blueprint fields and submits values', async () => {
    const onSubmit = vi.fn()
    const { getByLabelText, getByRole } = render(
      <DynamicForm
        blueprint={blueprint}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        submitLabel="Create"
        pendingLabel="Saving"
        secondaryActions={<button type="button">Extra</button>}
      />
    )

    fireEvent.change(getByLabelText('Name'), { target: { value: 'Enterprise' } })
    fireEvent.change(getByLabelText('Product'), { target: { value: productOptions[1].value } })
    fireEvent.change(getByLabelText('Seats'), { target: { value: '25' } })
    fireEvent.change(getByLabelText('Notes'), { target: { value: 'Internal comment' } })
    fireEvent.click(getByLabelText('Is Trial'))

    await act(async () => {
      fireEvent.click(getByRole('button', { name: 'Create' }))
    })

    expect(onSubmit).toHaveBeenCalledWith({
      ...defaultValues,
      name: 'Enterprise',
      productId: productOptions[1].value,
      seats: '25',
      notes: 'Internal comment',
      isTrial: true,
    })
  })

  test('FormModal closes automatically after submit', async () => {
    const onSubmit = vi.fn()
    const onClose = vi.fn()
    const { getByRole } = render(
      <FormModal
        show={true}
        onClose={onClose}
        blueprint={blueprint}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        submitLabel="Save"
        cancelLabel="Dismiss"
      />
    )

    await act(async () => {
      fireEvent.click(getByRole('button', { name: 'Save' }))
    })

    expect(onSubmit).toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
  })
})
