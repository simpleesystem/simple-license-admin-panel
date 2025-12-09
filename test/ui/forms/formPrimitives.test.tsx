import { faker } from '@faker-js/faker'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, test, vi } from 'vitest'
import {
  UI_CLASS_FORM_ACTIONS,
  UI_CLASS_FORM_FIELD_HINT,
  UI_CLASS_FORM_FIELD_LABEL,
  UI_CLASS_FORM_LABEL_HORIZONTAL,
  UI_CLASS_FORM_ROW,
  UI_CLASS_FORM_ROW_COLUMNS_MAP,
  UI_CLASS_FORM_SECTION,
  UI_FORM_ROW_COLUMNS_TWO,
  UI_FORM_SELECT_PLACEHOLDER_VALUE,
  UI_TEST_ID_FORM_ACTIONS,
} from '../../../src/ui/constants'
import { CheckboxField } from '../../../src/ui/forms/CheckboxField'
import { DateField } from '../../../src/ui/forms/DateField'
import { FormActions } from '../../../src/ui/forms/FormActions'
import { FormField } from '../../../src/ui/forms/FormField'
import { FormRow } from '../../../src/ui/forms/FormRow'
import { FormSection } from '../../../src/ui/forms/FormSection'
import { SelectField } from '../../../src/ui/forms/SelectField'
import { SwitchField } from '../../../src/ui/forms/SwitchField'
import { TextareaField } from '../../../src/ui/forms/TextareaField'
import { TextField } from '../../../src/ui/forms/TextField'
import { renderWithForm } from '../../ui/utils/renderWithForm'

describe('Form primitives', () => {
  test('FormField renders label with required marker when flagged', () => {
    const label = faker.lorem.words(2)
    const { getByText } = render(
      <FormField label={label} required={true} htmlFor="field">
        <input id="field" />
      </FormField>
    )

    expect(getByText(label)).toHaveClass(UI_CLASS_FORM_FIELD_LABEL, { exact: false })
  })

  test('FormField shows hint text content', () => {
    const hint = faker.lorem.words(3)
    const { getByText } = render(
      <FormField label="label" hint={hint}>
        <input />
      </FormField>
    )

    expect(getByText(hint)).toHaveClass(UI_CLASS_FORM_FIELD_HINT, { exact: false })
  })

  test('FormField renders horizontal layout with error message', () => {
    const { getByText } = render(
      <FormField label="Horizontal" htmlFor="field" layout="horizontal" error="Required">
        <input id="field" />
      </FormField>
    )

    expect(getByText('Horizontal')).toHaveClass(UI_CLASS_FORM_LABEL_HORIZONTAL, { exact: false })
    expect(getByText('Required')).toBeInTheDocument()
  })

  test('FormField render prop supplies control metadata to children', () => {
    const hint = faker.lorem.words(3)
    const error = faker.lorem.words(2)
    const { getByLabelText, getByText } = render(
      <FormField label="Name" hint={hint} error={error}>
        {({ controlId, describedBy }) => <input id={controlId} aria-describedby={describedBy} />}
      </FormField>
    )

    const control = getByLabelText('Name') as HTMLInputElement
    expect(control.id).toMatch(/control/)
    expect(control.getAttribute('aria-describedby')).toContain('-hint')
    expect(getByText(error).id).toContain('-error')
  })

  test('FormRow applies responsive grid classes', () => {
    const { getByTestId } = render(
      <FormRow testId="row" columns={3}>
        content
      </FormRow>
    )

    expect(getByTestId('row')).toHaveClass(UI_CLASS_FORM_ROW, { exact: false })
  })

  test('FormRow falls back to two-column layout classes by default', () => {
    const { getByTestId } = render(<FormRow testId="row-default">content</FormRow>)

    const element = getByTestId('row-default')
    expect(element).toHaveClass(UI_CLASS_FORM_ROW, { exact: false })
    expect(element.className).toContain(UI_CLASS_FORM_ROW_COLUMNS_MAP[UI_FORM_ROW_COLUMNS_TWO])
  })

  test('FormSection renders title heading', () => {
    const title = faker.lorem.words(2)
    const { getByTestId } = render(
      <FormSection title={title} testId="section">
        fields
      </FormSection>
    )

    expect(getByTestId('section')).toHaveClass(UI_CLASS_FORM_SECTION, { exact: false })
  })

  test('FormSection renders description and actions when provided', () => {
    const description = faker.lorem.words(3)
    const { getByText } = render(
      <FormSection title="Details" description={description} actions={<button type="button">Add</button>}>
        fields
      </FormSection>
    )

    expect(getByText(description)).toBeInTheDocument()
    expect(getByText('Add')).toBeInTheDocument()
  })

  test('CheckboxField updates checked state through form context', () => {
    const label = faker.lorem.word()
    const { getByLabelText } = renderWithForm(<CheckboxField name="flag" label={label} />, {
      defaultValues: { flag: false },
    })

    const control = getByLabelText(label) as HTMLInputElement
    fireEvent.click(control)

    expect(control.checked).toBe(true)
  })

  test('SwitchField renders switch type inputs', () => {
    const label = faker.lorem.word()
    const { getByLabelText } = renderWithForm(<SwitchField name="flag" label={label} />, {
      defaultValues: { flag: false },
    })

    const control = getByLabelText(label) as HTMLInputElement

    expect(control.type).toBe('checkbox')
  })

  test('DateField applies min attribute when provided', () => {
    const minDate = '2025-01-01'
    const { getByLabelText } = renderWithForm(<DateField name="due" label="due date" min={minDate} />, {
      defaultValues: { due: '' },
    })

    const control = getByLabelText('due date') as HTMLInputElement

    expect(control.min).toBe(minDate)
  })

  test('CheckboxField renders description text for helper copy', () => {
    const description = faker.lorem.words(2)
    const { getByText } = renderWithForm(<CheckboxField name="flag" label="Flag" description={description} />, {
      defaultValues: { flag: false },
    })

    expect(getByText(description)).toBeInTheDocument()
  })

  test('CheckboxField displays validation errors from form state', () => {
    const { getByLabelText, getByRole, form } = renderWithForm(<CheckboxField name="flag" label="Flag" />, {
      defaultValues: { flag: false },
    })

    act(() => {
      form.setError('flag', { type: 'manual', message: 'Required selection' })
    })

    fireEvent.blur(getByLabelText('Flag'))

    expect(getByRole('alert')).toHaveTextContent('Required selection')
  })

  test('CheckboxField links helper and error text via aria-describedby', () => {
    const description = faker.lorem.words(3)
    const { getByLabelText, form, getByRole } = renderWithForm(
      <CheckboxField name="flag" label="Flag" description={description} />,
      { defaultValues: { flag: false } }
    )

    const control = getByLabelText('Flag') as HTMLInputElement
    expect(control.getAttribute('aria-describedby')).toContain('-description')

    act(() => {
      form.setError('flag', { type: 'manual', message: 'Selection required' })
    })
    fireEvent.blur(control)

    expect(getByRole('alert')).toHaveTextContent('Selection required')
    expect(control.getAttribute('aria-describedby')).toContain('-error')
  })

  test('DateField renders description helper text', () => {
    const description = faker.lorem.words(3)
    const { getByText } = renderWithForm(<DateField name="due" label="Due date" description={description} />, {
      defaultValues: { due: '' },
    })

    expect(getByText(description)).toBeInTheDocument()
  })

  test('DateField applies placeholder only for string values', () => {
    const { getByLabelText } = renderWithForm(<DateField name="start" label="Start" placeholder="Select start" />, {
      defaultValues: { start: '' },
    })

    expect((getByLabelText('Start') as HTMLInputElement).placeholder).toBe('Select start')

    const secondRender = renderWithForm(<DateField name="end" label="End" placeholder={<span>node</span>} />, {
      defaultValues: { end: '' },
    })

    expect((secondRender.getByLabelText('End') as HTMLInputElement).placeholder).toBe('')
  })

  test('DateField surfaces validation errors from form context', () => {
    const { getByLabelText, getByRole, form } = renderWithForm(<DateField name="due" label="Due" />, {
      defaultValues: { due: '' },
    })

    act(() => {
      form.setError('due', { type: 'manual', message: 'Date required' })
    })

    fireEvent.blur(getByLabelText('Due'))

    expect(getByRole('alert')).toHaveTextContent('Date required')
  })

  test('DateField composes aria-describedby with helper and error text', () => {
    const description = faker.lorem.words(3)
    const { getByLabelText, getByRole, form } = renderWithForm(
      <DateField name="due" label="Due" description={description} />,
      { defaultValues: { due: '' } }
    )

    const control = getByLabelText('Due') as HTMLInputElement
    expect(control.getAttribute('aria-describedby')).toContain('-description')

    act(() => {
      form.setError('due', { type: 'manual', message: 'Provide date' })
    })
    fireEvent.blur(control)

    expect(getByRole('alert')).toHaveTextContent('Provide date')
    expect(control.getAttribute('aria-describedby')).toContain('-error')
  })

  test('TextField updates state through form context', () => {
    const label = faker.lorem.word()
    const nextValue = faker.lorem.words(2)
    const { getByLabelText } = renderWithForm(<TextField name="title" label={label} />, {
      defaultValues: { title: '' },
    })

    const control = getByLabelText(label) as HTMLInputElement
    fireEvent.change(control, { target: { value: nextValue } })

    expect(control.value).toBe(nextValue)
  })

  test('TextField applies placeholder and autocomplete values', () => {
    const placeholder = faker.lorem.words(2)
    const autoComplete = 'email'
    const { getByLabelText } = renderWithForm(
      <TextField name="email" label="Email" placeholder={placeholder} autoComplete={autoComplete} />,
      { defaultValues: { email: '' } }
    )

    const control = getByLabelText('Email') as HTMLInputElement
    expect(control.placeholder).toBe(placeholder)
    expect(control.autocomplete).toBe(autoComplete)
  })

  test('SelectField renders options and handles selection', () => {
    const options = [
      { value: faker.string.uuid(), label: faker.lorem.word() },
      { value: faker.string.uuid(), label: faker.lorem.word() },
    ] as const
    const { getByLabelText } = renderWithForm(<SelectField name="status" label="Status" options={options} />, {
      defaultValues: { status: options[0].value },
    })

    const control = getByLabelText('Status') as HTMLSelectElement
    expect(control.options).toHaveLength(options.length)
    fireEvent.change(control, { target: { value: options[1].value } })

    expect(control.value).toBe(options[1].value)
  })

  test('SelectField includes placeholder option when present', () => {
    const placeholder = faker.lorem.words(2)
    const options = [{ value: faker.string.uuid(), label: faker.lorem.word() }]
    const { getByLabelText } = renderWithForm(
      <SelectField name="status" label="Status" options={options} placeholder={placeholder} />,
      { defaultValues: { status: UI_FORM_SELECT_PLACEHOLDER_VALUE } }
    )

    const control = getByLabelText('Status') as HTMLSelectElement
    expect(control.options[0].textContent).toBe(placeholder)
    expect(control.value).toBe(UI_FORM_SELECT_PLACEHOLDER_VALUE)
  })

  test('SelectField composes aria-describedby with helper and error text', () => {
    const description = faker.lorem.words(3)
    const { getByLabelText, getByRole, form } = renderWithForm(
      <SelectField
        name="status"
        label="Status"
        options={[{ value: 'draft', label: 'Draft' }]}
        description={description}
      />,
      { defaultValues: { status: 'draft' } }
    )

    const control = getByLabelText('Status') as HTMLSelectElement
    expect(control.getAttribute('aria-describedby')).toContain('-hint')

    act(() => {
      form.setError('status', { type: 'manual', message: 'Select value' })
    })
    fireEvent.blur(control)

    expect(getByRole('alert')).toHaveTextContent('Select value')
    expect(control.getAttribute('aria-describedby')).toContain('-error')
  })

  test('TextField surfaces validation errors from form context', () => {
    const { getByLabelText, getByRole, form } = renderWithForm(<TextField name="title" label="Title" />, {
      defaultValues: { title: '' },
    })

    act(() => {
      form.setError('title', { type: 'manual', message: 'Title required' })
    })
    fireEvent.blur(getByLabelText('Title'))

    expect(getByRole('alert')).toHaveTextContent('Title required')
  })

  test('TextField falls back to empty error message when validation message is missing', async () => {
    const { getByLabelText, form } = renderWithForm(<TextField name="title" label="Title" />, {
      defaultValues: { title: '' },
    })

    const control = getByLabelText('Title') as HTMLInputElement

    act(() => {
      form.setError('title', { type: 'manual', message: undefined as unknown as string })
    })

    fireEvent.blur(control)

    await waitFor(() => {
      expect(control).toHaveClass('is-invalid')
    })
  })

  test('TextField triggers linked fields when validateNames is provided', async () => {
    const triggerSpy = vi.fn().mockResolvedValue(true)

    const Wrapper = () => {
      const methods = useForm<{ username: string; password: string }>({
        defaultValues: { username: '', password: '' },
      })
      const methodsWithSpy = {
        ...methods,
        trigger: triggerSpy as typeof methods.trigger,
      }

      return (
        <FormProvider {...methodsWithSpy}>
          <TextField name="username" label="Username" />
          <TextField name="password" label="Password" validateNames={['username']} />
        </FormProvider>
      )
    }

    const { getByLabelText } = render(<Wrapper />)

    const passwordInput = getByLabelText('Password') as HTMLInputElement
    fireEvent.change(passwordInput, { target: { value: 'secret' } })

    await waitFor(() => {
      expect(triggerSpy).toHaveBeenCalledWith(['password', 'username'], { shouldFocus: false })
    })
  })

  test('TextField composes aria-describedby with helper and error content', () => {
    const description = faker.lorem.words(3)
    const { getByLabelText, getByRole, form } = renderWithForm(
      <TextField name="title" label="Title" description={description} />,
      { defaultValues: { title: '' } }
    )

    const control = getByLabelText('Title') as HTMLInputElement
    expect(control.getAttribute('aria-describedby')).toContain('-hint')

    act(() => {
      form.setError('title', { type: 'manual', message: 'Provide title' })
    })
    fireEvent.blur(control)

    expect(getByRole('alert')).toHaveTextContent('Provide title')
    expect(control.getAttribute('aria-describedby')).toContain('-error')
  })

  test('TextareaField updates value and respects row count', () => {
    const { getByLabelText } = renderWithForm(<TextareaField name="notes" label="Notes" rows={5} />, {
      defaultValues: { notes: '' },
    })

    const control = getByLabelText('Notes') as HTMLTextAreaElement
    fireEvent.change(control, { target: { value: 'hello world' } })

    expect(control.value).toBe('hello world')
    expect(control.rows).toBe(5)
  })

  test('TextareaField composes helper and error ids in aria-describedby', () => {
    const description = faker.lorem.words(3)
    const { getByLabelText, getByRole, form } = renderWithForm(
      <TextareaField name="bio" label="Bio" description={description} />,
      { defaultValues: { bio: '' } }
    )

    const control = getByLabelText('Bio') as HTMLTextAreaElement
    expect(control.getAttribute('aria-describedby')).toContain('-hint')

    act(() => {
      form.setError('bio', { type: 'manual', message: 'Too short' })
    })
    fireEvent.blur(control)

    expect(getByRole('alert')).toHaveTextContent('Too short')
    expect(control.getAttribute('aria-describedby')).toContain('-error')
  })

  test('FormActions aligns children per prop', () => {
    const { getByTestId } = render(
      <FormActions align="between" testId={UI_TEST_ID_FORM_ACTIONS}>
        <button type="button">Cancel</button>
        <button type="button">Save</button>
      </FormActions>
    )

    const container = getByTestId(UI_TEST_ID_FORM_ACTIONS)
    expect(container).toHaveClass(UI_CLASS_FORM_ACTIONS, { exact: false })
    expect(container.className).toContain('justify-content-between')
  })
})
