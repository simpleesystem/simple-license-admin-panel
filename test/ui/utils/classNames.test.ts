import { faker } from '@faker-js/faker'
import { describe, expect, test } from 'vitest'

import { composeClassNames } from '../../../src/ui/utils/classNames'

describe('composeClassNames', () => {
  test('joins provided class names in order', () => {
    const first = faker.helpers.arrayElement(['d-flex', 'align-items-center'])
    const second = faker.helpers.arrayElement(['gap-2', 'gap-3'])

    const result = composeClassNames(first, second)

    expect(result).toBe(`${first} ${second}`)
  })

  test('removes falsy entries from the output', () => {
    const expected = faker.helpers.arrayElement(['text-muted', 'fw-semibold'])

    const result = composeClassNames(expected, undefined, null, false)

    expect(result).toBe(expected)
  })

  test('deduplicates repeated classes without changing order', () => {
    const duplicate = faker.helpers.arrayElement(['d-flex', 'text-center'])
    const unique = faker.helpers.arrayElement(['gap-2', 'gap-4'])

    const result = composeClassNames(duplicate, unique, duplicate)

    expect(result).toBe(`${duplicate} ${unique}`)
  })
})


