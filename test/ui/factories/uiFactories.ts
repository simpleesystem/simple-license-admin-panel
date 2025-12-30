import { faker } from '@faker-js/faker'

import type {
  UiBreadcrumbItem,
  UiCardListItem,
  UiDataTableColumn,
  UiKeyValueItem,
  UiSidebarNavItem,
  UiSummaryCardItem,
  UiTagItem,
} from '../../../src/ui/types'
import {
  UI_BADGE_VARIANT_INFO,
  UI_BADGE_VARIANT_PRIMARY,
  UI_BADGE_VARIANT_SUCCESS,
  UI_BADGE_VARIANT_WARNING,
} from '../../../src/ui/constants'

export const buildText = () => faker.lorem.words(2)

export const buildKeyValueItem = (overrides?: Partial<UiKeyValueItem>): UiKeyValueItem => ({
  id: faker.string.uuid(),
  label: buildText(),
  value: buildText(),
  ...overrides,
})

export const buildSummaryCardItem = (overrides?: Partial<UiSummaryCardItem>): UiSummaryCardItem => ({
  id: faker.string.uuid(),
  label: buildText(),
  value: faker.number.int({ min: 1, max: 1_000 }).toLocaleString(),
  ...overrides,
})

export const buildCardListItem = (overrides?: Partial<UiCardListItem>): UiCardListItem => ({
  id: faker.string.uuid(),
  title: buildText(),
  subtitle: faker.helpers.maybe(() => buildText(), { probability: 0.5 }),
  body: buildText(),
  footer: faker.helpers.maybe(() => buildText(), { probability: 0.4 }),
  ...overrides,
})

export const buildTag = (overrides?: Partial<UiTagItem>): UiTagItem => ({
  id: faker.string.uuid(),
  label: buildText(),
  variant: faker.helpers.arrayElement([
    UI_BADGE_VARIANT_PRIMARY,
    UI_BADGE_VARIANT_SUCCESS,
    UI_BADGE_VARIANT_INFO,
    UI_BADGE_VARIANT_WARNING,
  ]),
  ...overrides,
})

export const buildBreadcrumbItem = (overrides?: Partial<UiBreadcrumbItem>): UiBreadcrumbItem => ({
  id: faker.string.uuid(),
  label: buildText(),
  ...overrides,
})

export const buildSidebarNavItem = (overrides?: Partial<UiSidebarNavItem>): UiSidebarNavItem => ({
  id: faker.string.uuid(),
  label: buildText(),
  href: '#',
  ...overrides,
})

export const buildTableColumn = <TData,>(
  overrides?: Partial<UiDataTableColumn<TData>>
): UiDataTableColumn<TData> => ({
  id: faker.string.uuid(),
  header: buildText(),
  cell: () => buildText(),
  ...overrides,
})
