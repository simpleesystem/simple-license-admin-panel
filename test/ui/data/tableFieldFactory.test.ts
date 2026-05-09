import { describe, expect, test } from 'vitest'

import {
  UI_TABLE_FILTER_LABEL_STATUS,
  UI_TABLE_FILTER_PLACEHOLDER_ALL_STATUSES,
  UI_TABLE_SEARCH_LABEL,
  UI_TABLE_SEARCH_PLACEHOLDER,
} from '../../../src/ui/constants'
import { FIELD_LABEL_VISIBILITY_HIDDEN } from '../../../src/ui/data/fieldLabeling'
import {
  createStandardStatusFilterField,
  createStandardTableSearchField,
  createTableFilterField,
} from '../../../src/ui/data/tableFieldFactory'

describe('tableFieldFactory', () => {
  test('applies default search label and placeholder', () => {
    const searchField = createStandardTableSearchField({
      value: 'tenant',
      onChange: () => {},
    })

    expect(searchField.label).toBe(UI_TABLE_SEARCH_LABEL)
    expect(searchField.placeholder).toBe(UI_TABLE_SEARCH_PLACEHOLDER)
  })

  test('applies default status label and placeholder', () => {
    const statusField = createStandardStatusFilterField({
      value: '',
      options: [{ value: '', label: UI_TABLE_FILTER_LABEL_STATUS }],
      onChange: () => {},
    })

    expect(statusField.label).toBe(UI_TABLE_FILTER_LABEL_STATUS)
    expect(statusField.placeholder).toBe(UI_TABLE_FILTER_PLACEHOLDER_ALL_STATUSES)
  })

  test('hides label when policy is hidden', () => {
    const hiddenLabelField = createTableFilterField({
      label: UI_TABLE_FILTER_LABEL_STATUS,
      value: '',
      options: [{ value: '', label: UI_TABLE_FILTER_LABEL_STATUS }],
      onChange: () => {},
      labelPolicy: {
        visibility: FIELD_LABEL_VISIBILITY_HIDDEN,
        fallbackToPlaceholder: false,
      },
    })

    expect(hiddenLabelField.label).toBeUndefined()
  })
})
